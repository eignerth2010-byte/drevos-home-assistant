import {
  Command,
  Device,
  HaState,
  RuleError,
  discover,
  serviceFor,
} from "./model";
export const CLIENT_ID =
  "https://raw.githubusercontent.com/eignerth2010-byte/drevos-home-assistant/main/mobile/auth/index.html";
export const REDIRECT_URI = "drevos://auth-callback";
export type Language = "de" | "en";
export type StoredSession = {
  url: string;
  refreshToken: string;
  gatewayId?: string;
  language: Language;
};
export type SessionStore = {
  load(): Promise<StoredSession | null>;
  save(value: StoredSession): Promise<void>;
  clear(): Promise<void>;
};
export class ConnectionError extends Error {
  constructor(public code: "network" | "auth" | "permission" | "server") {
    super(code);
  }
}
export function normalizeUrl(input: string): string {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new RuleError("invalid");
  }
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    (url.pathname !== "/" && url.pathname !== "")
  )
    throw new RuleError("invalid");
  // Local HTTP is supported; sending credentials to a public HTTP host is rejected.
  const h = url.hostname.toLowerCase();
  const p = h.split(".").map(Number);
  const local =
    h.endsWith(".local") ||
    h === "localhost" ||
    h === "[::1]" ||
    (p.length === 4 &&
      p.every((n) => Number.isInteger(n) && n >= 0 && n <= 255) &&
      (p[0] === 10 ||
        p[0] === 127 ||
        (p[0] === 192 && p[1] === 168) ||
        (p[0] === 172 && p[1] >= 16 && p[1] <= 31)));
  if (url.protocol === "http:" && !local) throw new RuleError("invalid");
  return url.origin;
}
export async function timedFetch(
  fetcher: typeof fetch,
  url: string,
  init: RequestInit = {},
  signal?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timeout = setTimeout(abort, 12000);
  try {
    return await fetcher(url, {
      ...init,
      signal: controller.signal,
      redirect: "error",
    });
  } catch {
    throw new ConnectionError("network");
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}
async function readJson(response: Response): Promise<any> {
  try {
    return await response.json();
  } catch {
    throw new ConnectionError("server");
  }
}
type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
};
function validateToken(data: any): TokenResponse {
  if (
    typeof data?.access_token !== "string" ||
    !data.access_token ||
    !Number.isFinite(data.expires_in) ||
    data.expires_in <= 0
  )
    throw new ConnectionError("server");
  return data;
}
export class HaClient {
  private access = "";
  private expires = 0;
  private refreshing?: Promise<string>;
  private busy = false;
  private closed = false;
  constructor(
    public session: StoredSession,
    private store: SessionStore,
    private fetcher: typeof fetch = fetch,
    private now = Date.now,
  ) {}
  static async exchange(
    url: string,
    code: string,
    verifier: string,
    store: SessionStore,
    language: Language,
    fetcher: typeof fetch = fetch,
  ) {
    url = normalizeUrl(url);
    const response = await timedFetch(fetcher, url + "/auth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: CLIENT_ID,
        code_verifier: verifier,
      }).toString(),
    });
    if (!response.ok)
      throw new ConnectionError(response.status >= 500 ? "server" : "auth");
    const data = validateToken(await readJson(response));
    if (typeof data.refresh_token !== "string" || !data.refresh_token)
      throw new ConnectionError("auth");
    const client = new HaClient(
      { url, refreshToken: data.refresh_token, language },
      store,
      fetcher,
    );
    await store.save(client.session);
    client.accept(data);
    return client;
  }
  private accept(data: TokenResponse) {
    this.access = data.access_token;
    this.expires = this.now() + data.expires_in * 1000;
  }
  private token(force = false): Promise<string> {
    if (this.closed) return Promise.reject(new ConnectionError("auth"));
    if (!force && this.access && this.expires > this.now() + 30000)
      return Promise.resolve(this.access);
    if (this.refreshing) return this.refreshing;
    this.refreshing = (async () => {
      const response = await timedFetch(
        this.fetcher,
        this.session.url + "/auth/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: this.session.refreshToken,
            client_id: CLIENT_ID,
          }).toString(),
        },
      );
      if (
        response.status === 400 ||
        response.status === 401 ||
        response.status === 403
      ) {
        this.access = "";
        this.closed = true;
        await this.store.clear();
        throw new ConnectionError("auth");
      }
      if (!response.ok) throw new ConnectionError("server");
      const data = validateToken(await readJson(response));
      if (this.closed) throw new ConnectionError("auth");
      this.accept(data);
      return this.access;
    })().finally(() => {
      this.refreshing = undefined;
    });
    return this.refreshing;
  }
  async states(signal?: AbortSignal): Promise<HaState[]> {
    let token = await this.token();
    let response = await timedFetch(
      this.fetcher,
      this.session.url + "/api/states",
      { headers: { Authorization: "Bearer " + token } },
      signal,
    );
    if (response.status === 401) {
      token = await this.token(true);
      response = await timedFetch(
        this.fetcher,
        this.session.url + "/api/states",
        { headers: { Authorization: "Bearer " + token } },
        signal,
      );
    }
    if (!response.ok)
      throw new ConnectionError(
        response.status === 401
          ? "auth"
          : response.status === 403
            ? "permission"
            : "server",
      );
    const data = await readJson(response);
    if (!Array.isArray(data)) throw new ConnectionError("server");
    return data.filter(
      (s): s is HaState =>
        typeof s?.entity_id === "string" &&
        typeof s.state === "string" &&
        s.attributes &&
        typeof s.attributes === "object" &&
        typeof s.attributes.drevos_gateway_id === "string",
    );
  }
  async select(gatewayId: string | undefined, language: Language) {
    this.session = { ...this.session, gatewayId, language };
    await this.store.save(this.session);
  }
  async command(
    gatewayId: string,
    command: Command,
    signal?: AbortSignal,
  ): Promise<Device[]> {
    if (this.busy) throw new RuleError("busy");
    this.busy = true;
    try {
      // Fresh HA states before every mutation. Never execute a queued/offline command.
      const devices = discover(await this.states(signal));
      const device = devices.find((d) => d.id === gatewayId);
      if (!device) throw new RuleError("missing");
      const call = serviceFor(device, command),
        token = await this.token();
      if (this.closed) throw new ConnectionError("auth");
      if (signal?.aborted) throw new RuleError("offline");
      const response = await timedFetch(
        this.fetcher,
        this.session.url + `/api/services/${call.domain}/${call.service}`,
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(call.data),
        },
        signal,
      );
      // A POST is NEVER retried, including after a timeout or 401.
      if (!response.ok)
        throw new ConnectionError(
          response.status === 401
            ? "auth"
            : response.status === 403
              ? "permission"
              : "server",
        );
      return discover(await this.states(signal));
    } finally {
      this.busy = false;
    }
  }
  async logout() {
    this.closed = true;
    this.access = "";
    try {
      await timedFetch(this.fetcher, this.session.url + "/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          token: this.session.refreshToken,
          action: "revoke",
        }).toString(),
      });
    } finally {
      await this.store.clear();
    }
  }
}
