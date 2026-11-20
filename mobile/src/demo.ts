import { HaState, Command, discover } from "./model";
const values: Record<string, [string, string]> = {
  kammertemperatur: ["sensor", "68.4"],
  kerntemperatur: ["sensor", "52.1"],
  raucheinstellung: ["sensor", "35"],
  timer_laufzeit: ["sensor", "00:42:00"],
  timer_restzeit: ["sensor", "01:18:00"],
  kammertemperatur_soll: ["number", "75"],
  kerntemperatur_ziel: ["number", "65"],
  rauch_soll: ["number", "35"],
  timer_dauer: ["number", "120"],
  konvektion: ["switch", "on"],
  luefter: ["switch", "off"],
  heizelement: ["switch", "off"],
  rauchbetrieb: ["switch", "off"],
  timer_lauf: ["switch", "off"],
  connection: ["binary_sensor", "on"],
  automatik: ["binary_sensor", "off"],
  controls_available: ["binary_sensor", "on"],
  timer_reset: ["button", "unknown"],
  shutdown: ["button", "unknown"],
};
export function demoStates(): HaState[] {
  return Object.entries(values).map(([key, [domain, state]]) => ({
    entity_id: `${domain}.demo_${key}`,
    state,
    attributes: {
      drevos_key: key,
      drevos_gateway_id: "demo-only",
      drevos_device_name: "Drevos · Demo",
      min: key === "timer_dauer" ? 1 : 0,
      max: (
        {
          kammertemperatur_soll: 120,
          kerntemperatur_ziel: 115,
          rauch_soll: 100,
          timer_dauer: 9999,
        } as Record<string, number>
      )[key],
    },
  }));
}
export function simulate(states: HaState[], command: Command) {
  return discover(
    states.map((s) => {
      const key = s.attributes.drevos_key;
      if (key === command.key && "value" in command)
        return {
          ...s,
          state:
            typeof command.value === "boolean"
              ? command.value
                ? "on"
                : "off"
              : String(command.value),
        };
      if (command.key === "timer_reset" && key === "timer_laufzeit")
        return { ...s, state: "00:00:00" };
      if (
        command.key === "kammertemperatur_soll" &&
        command.value === 0 &&
        key === "heizelement"
      )
        return { ...s, state: "off" };
      if (
        command.key === "rauch_soll" &&
        command.value === 0 &&
        key === "rauchbetrieb"
      )
        return { ...s, state: "off" };
      return s;
    }),
  );
}
