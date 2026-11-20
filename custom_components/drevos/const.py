"""Integration constants and the verified profile's entities."""
from homeassistant.const import Platform
DOMAIN = "drevos"
VERSION = "0.1.2"
API_VERSION = 1
PROFILE = "drevos_fx3u_v1"
PLATFORMS = [Platform.SENSOR, Platform.NUMBER, Platform.SWITCH, Platform.BUTTON, Platform.BINARY_SENSOR]
CARD_PATH = "/drevos_static/drevos-smoker-card.js"
CARD_URL = CARD_PATH + "?v=" + VERSION
NUMBERS = {
    "kammertemperatur_soll": (0, 120, "°C", "mdi:thermometer"),
    "kerntemperatur_ziel": (0, 115, "°C", "mdi:food-steak"),
    "rauch_soll": (0, 100, "%", "mdi:smoke"),
    "timer_dauer": (1, 9999, "min", "mdi:timer-outline"),
}
SWITCHES = {
    "konvektion": ("konvektion", "mdi:fan"),
    "luefter": ("luefter", "mdi:fan"),
    "heizelement": ("heizung_freigabe", "mdi:heating-coil"),
    "rauchbetrieb": ("rauch_freigabe", "mdi:smoke"),
    "timer_lauf": ("timer_laeuft", "mdi:timer-play-outline"),
}
