"""Temperature, smoke and timer readings."""
from homeassistant.components.sensor import SensorEntity, SensorDeviceClass, SensorStateClass
from .entity import DrevosEntity

SENSORS = {"kammertemperatur": ("°C", "mdi:thermometer"),
           "kerntemperatur": ("°C", "mdi:food-steak"),
           "raucheinstellung": ("%", "mdi:smoke"),
           "timer_restzeit": (None, "mdi:timer-sand"),
           "timer_laufzeit": (None, "mdi:timer-outline")}


async def async_setup_entry(hass, entry, async_add_entities):
    async_add_entities(DrevosSensor(entry.runtime_data, key, *values)
                       for key, values in SENSORS.items())


class DrevosSensor(DrevosEntity, SensorEntity):
    def __init__(self, coordinator, key, unit, icon):
        super().__init__(coordinator, key)
        self._attr_native_unit_of_measurement = unit
        self._attr_icon = icon
        if unit:
            self._attr_state_class = SensorStateClass.MEASUREMENT
        if unit == "°C":
            self._attr_device_class = SensorDeviceClass.TEMPERATURE
            self._attr_suggested_display_precision = 1

    @property
    def native_value(self):
        return self.coordinator.data.get(self.key)
