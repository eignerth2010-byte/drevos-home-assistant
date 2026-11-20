export type HaState = {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
};
export type Device = {
  id: string;
  name: string;
  entities: Record<string, HaState>;
  ambiguous: boolean;
};
export const NUMBERS = {
  kammertemperatur_soll: { min: 0, max: 120, unit: "°C" },
  kerntemperatur_ziel: { min: 0, max: 115, unit: "°C" },
  rauch_soll: { min: 0, max: 100, unit: "%" },
  timer_dauer: { min: 1, max: 9999, unit: "min" },
} as const;
export type NumberKey = keyof typeof NUMBERS;
export type SwitchKey =
  "konvektion" | "luefter" | "heizelement" | "rauchbetrieb" | "timer_lauf";
export type Command =
  | { key: NumberKey; value: number }
  | { key: SwitchKey; value: boolean }
  | { key: "timer_reset" | "shutdown" };
const DOMAINS: Record<string, string> = {
  kammertemperatur: "sensor",
  kerntemperatur: "sensor",
  raucheinstellung: "sensor",
  timer_restzeit: "sensor",
  timer_laufzeit: "sensor",
  kammertemperatur_soll: "number",
  kerntemperatur_ziel: "number",
  rauch_soll: "number",
  timer_dauer: "number",
  konvektion: "switch",
  luefter: "switch",
  heizelement: "switch",
  rauchbetrieb: "switch",
  timer_lauf: "switch",
  timer_reset: "button",
  shutdown: "button",
  connection: "binary_sensor",
  automatik: "binary_sensor",
  controls_available: "binary_sensor",
};
export class RuleError extends Error {
  constructor(
    public code:
      | "offline"
      | "locked"
      | "missing"
      | "invalid"
      | "heatTarget"
      | "smokeTarget"
      | "heatSmokeOff"
      | "timerOff"
      | "busy"
      | "uncertain",
  ) {
    super(code);
  }
}
export function discover(states: HaState[]): Device[] {
  const groups = new Map<string, Device>();
  for (const state of states) {
    const a = state.attributes;
    const id = a?.drevos_gateway_id,
      key = a?.drevos_key;
    if (
      typeof id !== "string" ||
      !id ||
      typeof key !== "string" ||
      !DOMAINS[key] ||
      state.entity_id.split(".")[0] !== DOMAINS[key]
    )
      continue;
    const device = groups.get(id) ?? {
      id,
      name:
        typeof a.drevos_device_name === "string"
          ? a.drevos_device_name
          : "Drevos",
      entities: {},
      ambiguous: false,
    };
    if (device.entities[key]) device.ambiguous = true;
    device.entities[key] = state;
    groups.set(id, device);
  }
  return [...groups.values()].sort(
    (a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id),
  );
}
export const numeric = (entity?: HaState): number | undefined => {
  if (
    !entity ||
    entity.state.trim() === "" ||
    ["unavailable", "unknown"].includes(entity.state)
  )
    return undefined;
  const value = Number(entity.state);
  return Number.isFinite(value) ? value : undefined;
};
export function available(entity?: HaState): boolean {
  return (
    !!entity &&
    entity.state !== "unavailable" &&
    (entity.entity_id.startsWith("button.") || entity.state !== "unknown")
  );
}
export function parseNumber(text: string, key: NumberKey): number {
  if (!/^\d+$/.test(text.trim())) throw new RuleError("invalid");
  const value = Number(text);
  if (
    !Number.isSafeInteger(value) ||
    value < NUMBERS[key].min ||
    value > NUMBERS[key].max
  )
    throw new RuleError("invalid");
  return value;
}
export function serviceFor(device: Device, command: Command) {
  if (device.ambiguous) throw new RuleError("missing");
  const e = device.entities,
    entity = e[command.key];
  if (!available(entity)) throw new RuleError("missing");
  if (e.connection?.state !== "on") throw new RuleError("offline");
  if (e.controls_available?.state !== "on" || e.automatik?.state !== "off")
    throw new RuleError("locked");
  if (command.key in NUMBERS) {
    const key = command.key as NumberKey,
      value = (command as { value: number }).value;
    if (
      !Number.isInteger(value) ||
      value < NUMBERS[key].min ||
      value > NUMBERS[key].max
    )
      throw new RuleError("invalid");
    const min = Number(entity.attributes.min),
      max = Number(entity.attributes.max);
    if (
      !Number.isFinite(min) ||
      !Number.isFinite(max) ||
      value < min ||
      value > max
    )
      throw new RuleError("invalid");
    return {
      domain: "number",
      service: "set_value",
      data: { entity_id: entity.entity_id, value },
    };
  }
  const heatSmokeOff = () => {
    if (e.heizelement?.state !== "off" || e.rauchbetrieb?.state !== "off")
      throw new RuleError("heatSmokeOff");
  };
  if (command.key === "shutdown" || command.key === "timer_reset") {
    heatSmokeOff();
    if (e.timer_lauf?.state !== "off") throw new RuleError("timerOff");
    return {
      domain: "button",
      service: "press",
      data: { entity_id: entity.entity_id },
    };
  }
  const value = (command as { value: boolean }).value;
  if (typeof value !== "boolean") throw new RuleError("invalid");
  if (
    command.key === "heizelement" &&
    value &&
    !(Number(numeric(e.kammertemperatur_soll)) > 0)
  )
    throw new RuleError("heatTarget");
  if (
    command.key === "rauchbetrieb" &&
    value &&
    !(Number(numeric(e.rauch_soll)) > 0)
  )
    throw new RuleError("smokeTarget");
  if (command.key === "timer_lauf" && !value) heatSmokeOff();
  return {
    domain: "switch",
    service: value ? "turn_on" : "turn_off",
    data: { entity_id: entity.entity_id },
  };
}
export function formatMinutes(value: number | undefined): string {
  if (value === undefined || value < 0) return "—";
  const minutes = Math.floor(value);
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}
export function formatTimer(entity?: HaState): string {
  if (!available(entity)) return "—";
  // The integration exposes PLC duration as HHH:MM:SS, not decimal minutes.
  const match = entity!.state.match(/^(\d+):([0-5]\d):([0-5]\d)$/);
  if (match) return `${Number(match[1])}:${match[2]}`;
  return "—";
}
