"""Guarded timer reset and gateway power-off."""
from homeassistant.components.button import ButtonEntity
from homeassistant.helpers.entity import EntityCategory
from .entity import DrevosEntity


async def async_setup_entry(hass, entry, async_add_entities):
    async_add_entities([DrevosButton(entry.runtime_data, "timer_reset", "RESET"),
                        DrevosButton(entry.runtime_data, "shutdown", "SHUTDOWN")])


class DrevosButton(DrevosEntity, ButtonEntity):
    def __init__(self, coordinator, key, payload):
        super().__init__(coordinator, key, control=True)
        self.payload = payload
        self._attr_icon = "mdi:power" if key == "shutdown" else "mdi:timer-refresh-outline"
        if key == "shutdown":
            self._attr_entity_category = EntityCategory.CONFIG

    @property
    def available(self):
        data = self.coordinator.data or {}
        return (super().available and not data.get("timer_laeuft", True)
                and not data.get("heizung_freigabe", True)
                and not data.get("rauch_freigabe", True))

    async def async_press(self):
        await self.coordinator.command(self.key, self.payload)
