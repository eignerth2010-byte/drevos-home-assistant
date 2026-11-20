"""Bounded setpoints; setting a positive value never starts heat or smoke."""
from homeassistant.components.number import NumberEntity, NumberMode, NumberDeviceClass
from .const import NUMBERS
from .entity import DrevosEntity

# The shared client rejects overlapping commands; HA must not queue them.
PARALLEL_UPDATES = 0


async def async_setup_entry(hass, entry, async_add_entities):
    async_add_entities(DrevosNumber(entry.runtime_data, key, *values)
                       for key, values in NUMBERS.items())


class DrevosNumber(DrevosEntity, NumberEntity):
    _attr_mode = NumberMode.BOX
    _attr_native_step = 1

    def __init__(self, coordinator, key, minimum, maximum, unit, icon):
        super().__init__(coordinator, key, control=True)
        self._attr_native_min_value = minimum
        self._attr_native_max_value = maximum
        self._attr_native_unit_of_measurement = unit
        self._attr_icon = icon
        if unit == "°C":
            self._attr_device_class = NumberDeviceClass.TEMPERATURE

    @property
    def native_value(self):
        return self.coordinator.data.get(self.key)

    async def async_set_native_value(self, value):
        await self.coordinator.command(self.key, str(value))
