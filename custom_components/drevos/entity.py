"""Shared device identity and availability."""
from homeassistant.helpers.entity import DeviceInfo
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from .const import DOMAIN


class DrevosEntity(CoordinatorEntity):
    _attr_has_entity_name = True

    def __init__(self, coordinator, key, control=False):
        super().__init__(coordinator)
        self.key = key
        self.control = control
        self._attr_unique_id = coordinator.info["id"] + "_" + key
        self._attr_translation_key = key
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, coordinator.info["id"])}, name=coordinator.info["name"],
            manufacturer="Drevos", model="FX3U profile v1 (community integration)",
            sw_version=coordinator.info["version"],
        )

    @property
    def available(self):
        data = self.coordinator.data or {}
        return (super().available and data.get("available", False)
                and (not self.control or data.get("controls_available", False)))

    @property
    def extra_state_attributes(self):
        return {"drevos_key": self.key, "drevos_gateway_id": self.coordinator.info["id"]}
