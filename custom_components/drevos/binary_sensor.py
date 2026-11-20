"""Diagnostic state of the gateway and controller."""
from homeassistant.components.binary_sensor import BinarySensorEntity, BinarySensorDeviceClass
from homeassistant.helpers.entity import EntityCategory
from .entity import DrevosEntity

PARALLEL_UPDATES = 0


async def async_setup_entry(hass, entry, async_add_entities):
    async_add_entities(DrevosBinarySensor(entry.runtime_data, key)
                       for key in ("connection", "automatik", "controls_available"))


class DrevosBinarySensor(DrevosEntity, BinarySensorEntity):
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(self, coordinator, key):
        super().__init__(coordinator, key)
        if key == "connection":
            self._attr_device_class = BinarySensorDeviceClass.CONNECTIVITY

    @property
    def available(self):
        if self.key == "connection":
            return self.coordinator.last_update_success
        return super().available

    @property
    def is_on(self):
        return self.coordinator.data.get("available" if self.key == "connection" else self.key, False)
