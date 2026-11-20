import React, { useEffect, useRef, useState } from "react";
import {
  AppState,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import {
  CLIENT_ID,
  REDIRECT_URI,
  ConnectionError,
  HaClient,
  Language,
  normalizeUrl,
} from "./src/client";
import { secureStore } from "./src/storage";
import {
  Command,
  Device,
  HaState,
  NUMBERS,
  NumberKey,
  RuleError,
  SwitchKey,
  available,
  discover,
  formatTimer,
  numeric,
  parseNumber,
  serviceFor,
} from "./src/model";
import { demoStates, simulate } from "./src/demo";
import { de, en } from "./src/strings";

WebBrowser.maybeCompleteAuthSession();
type Tab = "oven" | "timer" | "connection";
type Confirmation = { text: string; action: () => void };
const C = {
  bg: "#101315",
  panel: "#1c2226",
  edge: "#343f45",
  text: "#f5f1ea",
  muted: "#a9b4b9",
  orange: "#ffad62",
  green: "#82c9a5",
  red: "#ffb0a4",
};
const errorText = (error: unknown, t: typeof de) =>
  error instanceof RuleError || error instanceof ConnectionError
    ? t.errors[error.code]
    : t.loginError;

function Action({
  children,
  onPress,
  disabled = false,
  subtle = false,
  danger = false,
}: {
  children: React.ReactNode;
  onPress: () => void;
  disabled?: boolean;
  subtle?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        s.button,
        subtle && s.buttonSubtle,
        danger && s.buttonDanger,
        disabled && s.disabled,
        pressed && { opacity: 0.7 },
      ]}
    >
      <Text
        style={[
          s.buttonText,
          subtle && { color: C.text },
          danger && { color: C.red },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}
function Brand() {
  return (
    <View style={s.brand}>
      <View style={s.plaque}>
        <Image
          source={require("./assets/logo.png")}
          style={s.logo}
          resizeMode="contain"
          accessibilityLabel="Drevos international"
        />
      </View>
      <Text style={s.eyebrow}>SMOKER CONTROL</Text>
    </View>
  );
}
function Meter({
  title,
  entity,
  unit,
  online,
}: {
  title: string;
  entity?: HaState;
  unit: string;
  online: boolean;
}) {
  const value = online ? numeric(entity) : undefined;
  return (
    <View style={s.meter}>
      <Text style={s.label}>{title}</Text>
      <View style={s.reading}>
        <Text style={s.temperature}>
          {value === undefined
            ? "—"
            : value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
        </Text>
        <Text style={s.unit}>{unit}</Text>
      </View>
    </View>
  );
}
function Setpoint({
  kind,
  entity,
  disabled,
  onApply,
  t,
}: {
  kind: NumberKey;
  entity?: HaState;
  disabled: boolean;
  onApply: (c: Command) => Promise<boolean>;
  t: typeof de;
}) {
  const initial = () => numeric(entity)?.toString() ?? "";
  const [draft, setDraft] = useState(initial),
    [dirty, setDirty] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    if (!dirty) setDraft(initial());
  }, [entity?.state, dirty]);
  async function apply() {
    try {
      const value = parseNumber(draft, kind);
      setError("");
      if (await onApply({ key: kind, value })) setDirty(false);
    } catch (e) {
      setError(errorText(e, t));
    }
  }
  return (
    <View style={s.setpoint}>
      <Text style={s.label}>{t[kind]}</Text>
      <Text style={s.hint}>
        {NUMBERS[kind].min}–{NUMBERS[kind].max} {NUMBERS[kind].unit} ·{" "}
        {t.target}: {numeric(entity) ?? "—"}
      </Text>
      <View style={s.inputRow}>
        <TextInput
          accessibilityLabel={t[kind]}
          value={draft}
          editable={!disabled}
          onChangeText={(v) => {
            setDraft(v);
            setDirty(true);
            setError("");
          }}
          keyboardType="number-pad"
          maxLength={5}
          selectTextOnFocus
          style={[s.input, s.numberInput, disabled && s.disabled]}
          returnKeyType="done"
        />
        <Text style={s.unitSmall}>{NUMBERS[kind].unit}</Text>
        <Action disabled={disabled || !dirty} onPress={apply}>
          {t.apply}
        </Action>
      </View>
      {!!error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <DrevosApp />
    </SafeAreaProvider>
  );
}
function DrevosApp() {
  const [language, setLanguage] = useState<Language>("de"),
    [client, setClient] = useState<HaClient | null>(null),
    [demo, setDemo] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]),
    [selected, setSelected] = useState<string | undefined>(),
    [tab, setTab] = useState<Tab>("oven");
  const [connected, setConnected] = useState(false),
    [lastRead, setLastRead] = useState(0),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(true),
    [message, setMessage] = useState("");
  const [url, setUrl] = useState(""),
    [signingIn, setSigningIn] = useState(false),
    [confirmation, setConfirmation] = useState<Confirmation | null>(null),
    [tick, setTick] = useState(0);
  const active = useRef(AppState.currentState === "active"),
    writing = useRef(false),
    pollAbort = useRef<AbortController | null>(null),
    writeAbort = useRef<AbortController | null>(null);
  const t = language === "de" ? de : en;
  useEffect(() => {
    if (Platform.OS === "web") {
      setLoading(false);
      return;
    }
    let alive = true;
    secureStore
      .load()
      .then((session) => {
        if (session && alive) {
          setClient(new HaClient(session, secureStore));
          setSelected(session.gatewayId);
          setLanguage(session.language);
          setUrl(session.url);
        }
      })
      .catch(() => setMessage(t.loginError))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    const listener = AppState.addEventListener("change", (state) => {
      active.current = state === "active";
      setConnected(false);
      pollAbort.current?.abort();
      if (!active.current) {
        writeAbort.current?.abort();
        setConfirmation(null);
      }
      setTick((v) => v + 1);
    });
    return () => listener.remove();
  }, []);
  useEffect(() => {
    if (!client || demo || !active.current) return;
    let cancelled = false,
      timer: ReturnType<typeof setTimeout> | undefined;
    async function poll() {
      if (cancelled) return;
      if (!writing.current) {
        const controller = new AbortController();
        pollAbort.current = controller;
        try {
          const found = discover(await client!.states(controller.signal));
          if (!cancelled && !controller.signal.aborted) {
            setDevices(found);
            setConnected(true);
            setLastRead(Date.now());
          }
        } catch (e) {
          if (!cancelled && !controller.signal.aborted) {
            setConnected(false);
            setMessage(errorText(e, language === "de" ? de : en));
          }
        }
      }
      if (!cancelled) timer = setTimeout(poll, 5000);
    }
    poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      pollAbort.current?.abort();
    };
  }, [client, demo, tick, language]);
  useEffect(() => {
    if (devices.length === 1 && !selected) {
      setSelected(devices[0].id);
      if (client)
        void client
          .select(devices[0].id, language)
          .catch(() => setMessage(t.loginError));
    }
  }, [devices, selected, client]);
  const device = devices.find((d) => d.id === selected),
    e = device?.entities ?? {};
  const online = demo || (connected && e.connection?.state === "on");
  const controls =
    online &&
    !busy &&
    !device?.ambiguous &&
    e.controls_available?.state === "on" &&
    e.automatik?.state === "off";
  async function login() {
    if (signingIn) return;
    setMessage("");
    setSigningIn(true);
    try {
      const base = normalizeUrl(url);
      const request = new AuthSession.AuthRequest({
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
        scopes: [],
      });
      const result = await request.promptAsync({
        authorizationEndpoint: base + "/auth/authorize",
      });
      if (result.type === "cancel" || result.type === "dismiss") return;
      if (
        result.type !== "success" ||
        !result.params.code ||
        !request.codeVerifier
      )
        throw new ConnectionError("auth");
      const next = await HaClient.exchange(
        base,
        result.params.code,
        request.codeVerifier,
        secureStore,
        language,
      );
      setDemo(false);
      setDevices([]);
      setSelected(undefined);
      setClient(next);
      setUrl(base);
      setTab("oven");
    } catch (error) {
      setMessage(errorText(error, t));
    } finally {
      setSigningIn(false);
    }
  }
  async function command(command: Command): Promise<boolean> {
    if (!device || !controls || writing.current || !active.current)
      return false;
    writing.current = true;
    setBusy(true);
    setMessage(t.pending);
    pollAbort.current?.abort();
    const controller = new AbortController();
    writeAbort.current = controller;
    try {
      serviceFor(device, command);
      let next: Device[];
      if (demo) {
        next = simulate(Object.values(device.entities), command);
      } else if (client) {
        next = await client.command(device.id, command, controller.signal);
      } else throw new RuleError("offline");
      if (controller.signal.aborted) throw new RuleError("uncertain");
      setDevices(next);
      setConnected(true);
      setLastRead(Date.now());
      setMessage(demo ? t.demoApplied : t.sent);
      return true;
    } catch (error) {
      if (!demo) setConnected(false);
      setMessage(
        error instanceof RuleError ? errorText(error, t) : t.uncertain,
      );
      return false;
    } finally {
      writing.current = false;
      setBusy(false);
      writeAbort.current = null;
      setTick((v) => v + 1);
    }
  }
  function switchCommand(key: SwitchKey) {
    const value = e[key]?.state !== "on";
    if (value && (key === "heizelement" || key === "rauchbetrieb"))
      setConfirmation({
        text: key === "heizelement" ? t.heatAsk : t.smokeAsk,
        action: () => {
          void command({ key, value: true });
        },
      });
    else void command({ key, value });
  }
  async function choose(id: string) {
    setSelected(id);
    setConfirmation(null);
    setMessage("");
    if (client)
      try {
        await client.select(id, language);
      } catch {
        setMessage(t.loginError);
      }
  }
  async function changeLanguage(next: Language) {
    setLanguage(next);
    if (client)
      try {
        await client.select(selected, next);
      } catch {
        setMessage(t.loginError);
      }
  }
  async function logout() {
    pollAbort.current?.abort();
    writeAbort.current?.abort();
    setConnected(false);
    try {
      if (client) await client.logout();
    } catch {
      /* Local credentials are cleared even if revocation is unreachable. */
    }
    setClient(null);
    setDemo(false);
    setDevices([]);
    setSelected(undefined);
    setMessage("");
    setTab("oven");
  }
  const showApp = !!client || demo;
  function switches(keys: SwitchKey[]) {
    return keys.map((key) => (
      <View key={key} style={s.switchRow}>
        <View style={s.switchLabel}>
          <Text style={s.controlName}>{t[key]}</Text>
          <Text style={[s.hint, e[key]?.state === "on" && { color: C.green }]}>
            {online && available(e[key])
              ? e[key].state === "on"
                ? t.on
                : t.off
              : t.offline}
          </Text>
        </View>
        <Action
          disabled={!controls || !available(e[key])}
          subtle={e[key]?.state !== "on"}
          onPress={() => switchCommand(key)}
        >
          {e[key]?.state === "on" ? t.off : t.on}
        </Action>
      </View>
    ));
  }
  return (
    <SafeAreaView style={s.safe} edges={["top", "left", "right", "bottom"]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={s.flex}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.content}
        >
          <Brand />
          {loading ? (
            <Text style={s.hint}>{t.refreshing}</Text>
          ) : !showApp ? (
            <View style={s.panel}>
              <Text style={s.title}>{t.loginTitle}</Text>
              <Text style={s.body}>{t.loginSubtitle}</Text>
              <Text style={s.label}>{t.server}</Text>
              <TextInput
                accessibilityLabel={t.server}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                placeholder="http://homeassistant.local:8123"
                placeholderTextColor="#829197"
                style={s.input}
              />
              <Text style={s.hint}>{t.loginHint}</Text>
              {url.trim().startsWith("http:") && (
                <Text style={s.hint}>{t.localHttp}</Text>
              )}
              {Platform.OS === "web" ? (
                <Text style={s.hint}>{t.nativeOnly}</Text>
              ) : (
                <Action
                  disabled={signingIn || !url.trim()}
                  onPress={() => void login()}
                >
                  {signingIn ? t.refreshing : t.login}
                </Action>
              )}
              <Action
                subtle
                onPress={() => {
                  setDevices(discover(demoStates()));
                  setDemo(true);
                  setTab("oven");
                  setMessage("");
                }}
              >
                {t.tryDemo}
              </Action>
              <View style={s.inputRow}>
                <Action subtle onPress={() => void changeLanguage("de")}>
                  Deutsch
                </Action>
                <Action subtle onPress={() => void changeLanguage("en")}>
                  English
                </Action>
              </View>
            </View>
          ) : (
            <>
              <View style={s.statusRow}>
                <View
                  style={[s.dot, { backgroundColor: online ? C.green : C.red }]}
                />
                <Text style={s.status}>
                  {demo ? t.demo : online ? t.online : t.offline}
                </Text>
              </View>
              {device && <Text style={s.deviceName}>{device.name}</Text>}
              {!online && (
                <Text accessibilityRole="alert" style={s.banner}>
                  {t.disconnected}
                </Text>
              )}
              {online && !controls && !busy && (
                <Text style={s.banner}>{t.locked}</Text>
              )}
              {(!device || tab === "connection") && (
                <View style={s.panel}>
                  <Text style={s.sectionTitle}>{t.select}</Text>
                  <Text style={s.body}>
                    {devices.length ? t.choose : t.noDevices}
                  </Text>
                  {devices.map((d) => (
                    <Action
                      key={d.id}
                      subtle={selected !== d.id}
                      disabled={busy}
                      onPress={() => void choose(d.id)}
                    >
                      {d.name}
                      {selected === d.id ? " ✓" : ""}
                    </Action>
                  ))}
                </View>
              )}
              {device && tab === "oven" && (
                <View key={device.id} style={s.cabinet}>
                  <View style={s.boltRow}>
                    <View style={s.bolt} />
                    <Text style={s.eyebrow}>
                      DREVOS · {t.oven.toUpperCase()}
                    </Text>
                    <View style={s.bolt} />
                  </View>
                  <View style={s.meters}>
                    <Meter
                      title={t.chamber}
                      entity={e.kammertemperatur}
                      unit="°C"
                      online={online}
                    />
                    <Meter
                      title={t.core}
                      entity={e.kerntemperatur}
                      unit="°C"
                      online={online}
                    />
                  </View>
                  <View style={s.smoke}>
                    <Text style={s.label}>{t.smoke}</Text>
                    <Text style={s.smokeValue}>
                      {online ? (numeric(e.raucheinstellung) ?? "—") : "—"} %
                    </Text>
                  </View>
                  <View style={s.smokeTrack}>
                    <View
                      style={[
                        s.smokeFill,
                        {
                          width: `${online ? Math.min(100, Math.max(0, numeric(e.raucheinstellung) ?? 0)) : 0}%`,
                        },
                      ]}
                    />
                  </View>
                  {(
                    [
                      "kammertemperatur_soll",
                      "kerntemperatur_ziel",
                      "rauch_soll",
                    ] as NumberKey[]
                  ).map((key) => (
                    <Setpoint
                      key={key}
                      kind={key}
                      entity={e[key]}
                      disabled={!controls || !available(e[key])}
                      onApply={command}
                      t={t}
                    />
                  ))}
                  <Text style={s.hint}>
                    {t.coreHint} {t.zeroHint}
                  </Text>
                  <View style={s.divider} />
                  {switches([
                    "heizelement",
                    "rauchbetrieb",
                    "konvektion",
                    "luefter",
                  ])}
                  <View style={s.handle} />
                  <View style={s.boltRow}>
                    <View style={s.bolt} />
                    <View style={s.bolt} />
                  </View>
                </View>
              )}
              {device && tab === "timer" && (
                <View key={device.id} style={s.panel}>
                  <Text style={s.sectionTitle}>{t.timer}</Text>
                  <View style={s.meters}>
                    {(["timer_restzeit", "timer_laufzeit"] as const).map(
                      (key, i) => (
                        <View style={s.meter} key={key}>
                          <Text style={s.label}>
                            {i === 0 ? t.remaining : t.elapsed}
                          </Text>
                          <Text style={s.clock}>
                            {online ? formatTimer(e[key]) : "—"}
                          </Text>
                          <Text style={s.hint}>{t.hoursMinutes}</Text>
                        </View>
                      ),
                    )}
                  </View>
                  <Setpoint
                    kind="timer_dauer"
                    entity={e.timer_dauer}
                    disabled={!controls || !available(e.timer_dauer)}
                    onApply={command}
                    t={t}
                  />
                  <Text style={s.body}>{t.timerHint}</Text>
                  <Action
                    disabled={!controls || !available(e.timer_lauf)}
                    onPress={() => switchCommand("timer_lauf")}
                  >
                    {e.timer_lauf?.state === "on" ? t.pause : t.start}
                  </Action>
                  <Action
                    subtle
                    disabled={!controls || !available(e.timer_reset)}
                    onPress={() =>
                      setConfirmation({
                        text: t.resetAsk,
                        action: () => {
                          void command({ key: "timer_reset" });
                        },
                      })
                    }
                  >
                    {t.timer_reset}
                  </Action>
                </View>
              )}
              {tab === "connection" && (
                <View style={s.panel}>
                  <Text style={s.sectionTitle}>{t.connection}</Text>
                  {client && (
                    <Text selectable style={s.body}>
                      {client.session.url}
                    </Text>
                  )}
                  <Text style={s.hint}>
                    {t.lastRead}:{" "}
                    {lastRead
                      ? new Date(lastRead).toLocaleTimeString(language)
                      : "—"}
                  </Text>
                  <Action
                    subtle
                    disabled={busy}
                    onPress={() => {
                      setConnected(false);
                      setTick((v) => v + 1);
                    }}
                  >
                    {t.refresh}
                  </Action>
                  <Text style={s.label}>{t.language}</Text>
                  <View style={s.inputRow}>
                    <Action
                      subtle={language !== "de"}
                      onPress={() => void changeLanguage("de")}
                    >
                      Deutsch
                    </Action>
                    <Action
                      subtle={language !== "en"}
                      onPress={() => void changeLanguage("en")}
                    >
                      English
                    </Action>
                  </View>
                  <View style={s.divider} />
                  <Text style={s.hint}>{t.shutdownHint}</Text>
                  <Action
                    danger
                    disabled={!controls || !available(e.shutdown)}
                    onPress={() =>
                      setConfirmation({
                        text: t.shutdownAsk,
                        action: () => {
                          void command({ key: "shutdown" });
                        },
                      })
                    }
                  >
                    {t.shutdown}
                  </Action>
                  <Action
                    subtle
                    disabled={busy}
                    onPress={() =>
                      setConfirmation({
                        text: t.logoutAsk,
                        action: () => {
                          void logout();
                        },
                      })
                    }
                  >
                    {demo ? t.back : t.logout}
                  </Action>
                </View>
              )}
            </>
          )}
          {!!message && (
            <Text accessibilityRole="alert" style={s.message}>
              {message}
            </Text>
          )}
          <Text style={s.footer}>{t.version}</Text>
        </ScrollView>
        {showApp && (
          <View style={s.tabs}>
            {(["oven", "timer", "connection"] as Tab[]).map((name) => (
              <Pressable
                key={name}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === name }}
                onPress={() => setTab(name)}
                style={[s.tab, tab === name && s.tabActive]}
              >
                <Text style={[s.tabText, tab === name && { color: C.orange }]}>
                  {t[name]}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </KeyboardAvoidingView>
      <Modal
        visible={!!confirmation}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirmation(null)}
      >
        <View style={s.modalShade}>
          <View style={s.modal} accessibilityViewIsModal>
            <Text style={s.sectionTitle}>{t.confirm}</Text>
            <Text style={s.body}>{confirmation?.text}</Text>
            <Action
              onPress={() => {
                const action = confirmation?.action;
                setConfirmation(null);
                action?.();
              }}
            >
              {t.confirm}
            </Action>
            <Action subtle onPress={() => setConfirmation(null)}>
              {t.cancel}
            </Action>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    padding: 18,
    gap: 16,
    paddingBottom: 28,
  },
  brand: { alignItems: "center", gap: 12, marginVertical: 10 },
  plaque: {
    backgroundColor: "#d5d5cf",
    paddingHorizontal: 27,
    paddingVertical: 12,
    borderRadius: 5,
    borderColor: "#f6f4ed",
    borderWidth: 1,
  },
  logo: { width: 190, height: 62 },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 3,
    color: C.muted,
    fontWeight: "700",
  },
  title: { fontSize: 29, fontWeight: "700", color: C.text },
  body: { fontSize: 15, lineHeight: 23, color: C.muted },
  panel: {
    backgroundColor: C.panel,
    borderRadius: 18,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: C.edge,
  },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: C.text },
  label: { color: C.text, fontSize: 14, fontWeight: "600" },
  hint: { color: C.muted, fontSize: 12, lineHeight: 18 },
  button: {
    backgroundColor: C.orange,
    borderRadius: 10,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 17,
    paddingVertical: 12,
  },
  buttonSubtle: {
    backgroundColor: "#2a343a",
    borderColor: "#44535c",
    borderWidth: 1,
  },
  buttonDanger: {
    backgroundColor: "#392a29",
    borderColor: "#77504a",
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#21180f",
    textAlign: "center",
  },
  disabled: { opacity: 0.4 },
  input: {
    borderWidth: 1,
    borderColor: "#61717a",
    borderRadius: 10,
    color: C.text,
    fontSize: 17,
    paddingHorizontal: 13,
    minHeight: 50,
    paddingVertical: 10,
    backgroundColor: "#11181c",
  },
  numberInput: {
    flex: 1,
    fontSize: 22,
    fontVariant: ["tabular-nums"],
    minWidth: 66,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  unitSmall: { color: C.muted, fontSize: 15 },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  status: { color: C.muted, fontSize: 12 },
  deviceName: {
    fontSize: 22,
    color: C.text,
    fontWeight: "600",
    textAlign: "center",
  },
  banner: {
    color: C.red,
    backgroundColor: "#322628",
    borderRadius: 10,
    padding: 14,
    lineHeight: 22,
    fontSize: 14,
  },
  message: { color: C.orange, lineHeight: 22, fontSize: 14, padding: 10 },
  error: { color: C.red, fontSize: 13, lineHeight: 20 },
  cabinet: {
    backgroundColor: "#252d32",
    borderColor: "#67757b",
    borderWidth: 2,
    borderRadius: 16,
    padding: 18,
    gap: 18,
  },
  boltRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bolt: {
    width: 8,
    height: 8,
    borderWidth: 2,
    borderColor: "#94a0a5",
    borderRadius: 4,
    backgroundColor: "#30393e",
  },
  meters: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  meter: {
    flex: 1,
    minWidth: 115,
    backgroundColor: "#11191d",
    padding: 14,
    borderRadius: 12,
    gap: 7,
    borderWidth: 1,
    borderColor: "#354249",
  },
  reading: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
    flexWrap: "wrap",
  },
  temperature: {
    color: C.orange,
    fontSize: 38,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
  },
  unit: { color: C.muted, fontSize: 18 },
  smoke: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  smokeValue: { fontSize: 22, color: C.orange, fontVariant: ["tabular-nums"] },
  smokeTrack: {
    height: 5,
    backgroundColor: "#10191d",
    borderRadius: 3,
    overflow: "hidden",
    marginTop: -10,
  },
  smokeFill: { height: 5, backgroundColor: C.orange },
  setpoint: { gap: 8 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 5,
  },
  switchLabel: { flex: 1, gap: 4 },
  controlName: { fontSize: 17, color: C.text, fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#455258", marginVertical: 4 },
  handle: {
    alignSelf: "flex-end",
    height: 5,
    width: 90,
    borderRadius: 4,
    backgroundColor: "#a8b3b7",
    marginVertical: 5,
  },
  clock: {
    fontSize: 32,
    color: C.orange,
    fontVariant: ["tabular-nums"],
    fontWeight: "600",
  },
  footer: { color: "#75878e", fontSize: 11, textAlign: "center", marginTop: 5 },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#1b2429",
    borderTopWidth: 1,
    borderTopColor: C.edge,
  },
  tab: {
    flex: 1,
    paddingVertical: 18,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { borderTopWidth: 2, borderTopColor: C.orange, paddingTop: 16 },
  tabText: { color: C.muted, fontSize: 13, fontWeight: "600" },
  modalShade: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,.8)",
    justifyContent: "center",
    padding: 24,
  },
  modal: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 480,
    backgroundColor: C.panel,
    padding: 24,
    borderRadius: 18,
    gap: 20,
    borderWidth: 1,
    borderColor: C.edge,
  },
});
