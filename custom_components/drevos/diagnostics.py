"""Deliberately exclude URL, token, addresses and raw PLC data."""
from .const import VERSION


async def async_get_config_entry_diagnostics(hass, entry):
    coordinator = entry.runtime_data
    info = coordinator.info
    data = coordinator.data or {}
    return {"integration_version": VERSION, "gateway_version": info["version"],
            "profile": info["profile"], "api_version": info["api_version"],
            "update_success": coordinator.last_update_success,
            "plc_available": data.get("available", False),
            "controls_available": data.get("controls_available", False),
            "automatic_mode": data.get("automatik"), "fahrenheit_mode": data.get("fahrenheit")}
