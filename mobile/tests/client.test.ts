import { describe, expect, it, vi } from "vitest";
import {
  CLIENT_ID,
  HaClient,
  SessionStore,
  StoredSession,
  normalizeUrl,
} from "../src/client";
import { demoStates } from "../src/demo";
const session: StoredSession = {
  url: "https://ha.example",
  refreshToken: "test-refresh-not-a-secret",
  language: "de",
};
function setup(
  route: (url: string, init: RequestInit) => Promise<Response> | Response,
) {
  const store: SessionStore = {
    load: vi.fn(async () => session),
    save: vi.fn(async () => {}),
    clear: vi.fn(async () => {}),
  };
  const fetcher = vi.fn(async (url: any, init: any) =>
    route(String(url), init),
  );
  return {
    store,
    fetcher,
    client: new HaClient({ ...session }, store, fetcher as typeof fetch),
  };
}
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
const token = () =>
  json({ access_token: "test-access-not-a-secret", expires_in: 1800 });
describe("HA connection security and lifecycle", () => {
  it("accepts HTTPS/local HTTP, rejects credentials, public HTTP, query strings and paths", () => {
    expect(normalizeUrl(" http://homeassistant.local:8123/ ")).toBe(
      "http://homeassistant.local:8123",
    );
    expect(normalizeUrl("http://192.168.1.2:8123")).toBe(
      "http://192.168.1.2:8123",
    );
    for (const url of [
      "http://public.example",
      "https://user:pass@ha.example",
      "https://ha.example/?token=x",
      "https://ha.example/api",
      "javascript:alert(1)",
    ])
      expect(() => normalizeUrl(url)).toThrow("invalid");
  });
  it("refreshes once for concurrent requests and never sends tokens in URLs", async () => {
    const x = setup((url) =>
      url.endsWith("/auth/token") ? token() : json(demoStates()),
    );
    await Promise.all([x.client.states(), x.client.states()]);
    expect(
      x.fetcher.mock.calls.filter(([u]) => u.endsWith("/auth/token")),
    ).toHaveLength(1);
    expect(x.fetcher.mock.calls.every(([u]) => !u.includes("test-"))).toBe(
      true,
    );
    expect(
      new URLSearchParams(x.fetcher.mock.calls[0][1].body as string).get(
        "client_id",
      ),
    ).toBe(CLIENT_ID);
  });
  it("keeps login on a temporary network failure but deletes revoked credentials", async () => {
    const offline = setup(() => {
      throw new Error("network");
    });
    await expect(offline.client.states()).rejects.toThrow("network");
    expect(offline.store.clear).not.toHaveBeenCalled();
    const revoked = setup(() => json({ error: "invalid_grant" }, 400));
    await expect(revoked.client.states()).rejects.toThrow("auth");
    expect(revoked.store.clear).toHaveBeenCalledOnce();
  });
  it("rechecks fresh device states before a command and blocks a new automatic mode", async () => {
    const states = demoStates();
    states.find((s) => s.attributes.drevos_key === "automatik")!.state = "on";
    const x = setup((url) =>
      url.endsWith("/auth/token") ? token() : json(states),
    );
    await expect(
      x.client.command("demo-only", { key: "luefter", value: true }),
    ).rejects.toThrow("locked");
    expect(
      x.fetcher.mock.calls.some(([u]) => u.includes("/api/services/")),
    ).toBe(false);
  });
  it("never retries a write after a timeout, 401 or server failure", async () => {
    for (const failure of ["timeout", 401, 500]) {
      const x = setup((url) => {
        if (url.endsWith("/auth/token")) return token();
        if (url.includes("/api/services/")) {
          if (failure === "timeout") throw new Error("timeout");
          return json({}, failure as number);
        }
        return json(demoStates());
      });
      await expect(
        x.client.command("demo-only", { key: "konvektion", value: true }),
      ).rejects.toThrow();
      expect(
        x.fetcher.mock.calls.filter(([u]) => u.includes("/api/services/")),
      ).toHaveLength(1);
    }
  });
  it("serializes commands without queuing duplicate taps", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((r) => {
      release = r;
    });
    const x = setup(async (url) => {
      if (url.endsWith("/auth/token")) {
        await gate;
        return token();
      }
      return json(demoStates());
    });
    const first = x.client.command("demo-only", {
      key: "luefter",
      value: true,
    });
    await expect(
      x.client.command("demo-only", { key: "luefter", value: true }),
    ).rejects.toThrow("busy");
    release();
    await first;
    expect(
      x.fetcher.mock.calls.filter(([u]) => u.includes("/api/services/")),
    ).toHaveLength(1);
  });
  it("aborts a backgrounded action before sending a service request", async () => {
    const controller = new AbortController();
    const x = setup((url) => {
      if (url.endsWith("/api/states")) controller.abort();
      return url.endsWith("/auth/token") ? token() : json(demoStates());
    });
    await expect(
      x.client.command(
        "demo-only",
        { key: "luefter", value: true },
        controller.signal,
      ),
    ).rejects.toThrow("offline");
    expect(
      x.fetcher.mock.calls.some(([u]) => u.includes("/api/services/")),
    ).toBe(false);
  });
  it("clears local login even when server logout cannot be reached", async () => {
    const x = setup(() => {
      throw new Error("offline");
    });
    await expect(x.client.logout()).rejects.toThrow();
    expect(x.store.clear).toHaveBeenCalledOnce();
    await expect(x.client.states()).rejects.toThrow("auth");
  });
  it("stores only a refresh credential after code exchange; rejects missing refresh token", async () => {
    const x = setup(() =>
      json({
        access_token: "access",
        refresh_token: "refresh",
        expires_in: 1800,
      }),
    );
    await HaClient.exchange(
      "https://ha.example",
      "test-code",
      "test-verifier",
      x.store,
      "de",
      x.fetcher as typeof fetch,
    );
    expect(x.store.save).toHaveBeenCalledWith({
      url: "https://ha.example",
      refreshToken: "refresh",
      language: "de",
    });
    const data = new URLSearchParams(x.fetcher.mock.calls[0][1].body as string);
    expect(data.get("code_verifier")).toBe("test-verifier");
  });
});
