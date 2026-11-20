"""Confirmed manual request bits, never raw PLC output forces."""
from homeassistant.components.switch import SwitchEntity
from .const import SWITCHES
from .entity import DrevosEntity

# The shared client rejects overlapping commands; HA must not queue them.
PARALLEL_UPDATES = 0


async def async_setup_entry(hass, entry, async_add_entities):
    async_add_entities(DrevosSwitch(entry.runtime_data, key, *values)
                       for key, values in SWITCHES.items())


class DrevosSwitch(DrevosEntity, SwitchEntity):
    def __init__(self, coordinator, key, state_key, icon):
        super().__init__(coordinator, key, control=True)
        self.state_key = state_key
        self._attr_icon = icon

    @property
    def is_on(self):
        return self.coordinator.data.get(self.state_key)

    async def async_turn_on(self, **kwargs):
        await self.coordinator.command(self.key, "ON")

    async def async_turn_off(self, **kwargs):
        await self.coordinator.command(self.key, "OFF")
