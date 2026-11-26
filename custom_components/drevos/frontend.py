"""Bundled resources and the integration-owned sidebar panel."""

import logging
from pathlib import Path

from homeassistant.components import frontend
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace import LOVELACE_DATA
from homeassistant.core import callback

from .const import (
    CARD_PATH,
    CARD_URL,
    DOMAIN,
    PANEL_MODULE_PATH,
    PANEL_MODULE_URL,
    PANEL_PATH,
)

LOG = logging.getLogger(__name__)


async def async_setup_frontend(hass):
    """Serve local modules once and retain the existing dashboard-card resource."""
    data = hass.data.setdefault(DOMAIN, {})
    if not data.get("frontend_registered"):
        directory = Path(__file__).parent / "www"
        await hass.http.async_register_static_paths([
            StaticPathConfig(CARD_PATH, str(directory / "drevos-smoker-card.js"), True),
            StaticPathConfig(PANEL_MODULE_PATH, str(directory / "drevos-smoker-panel.js"), True),
            StaticPathConfig("/drevos_static/recipes", str(directory / "recipes"), True),
        ])
        data["frontend_registered"] = True
    if data.get("card_resource_registered"):
        return
    # YAML-mode users can keep their existing manually registered card resource.
    lovelace = hass.data.get(LOVELACE_DATA)
    if lovelace and lovelace.resource_mode == "storage":
        resources = lovelace.resources
        await resources.async_get_info()
        matches = [r for r in resources.async_items() if r["url"].split("?")[0] == CARD_PATH]
        if not matches:
            await resources.async_create_item({"res_type": "module", "url": CARD_URL})
        elif matches[0]["url"] != CARD_URL:
            await resources.async_update_item(matches[0]["id"], {"res_type": "module", "url": CARD_URL})
        data["card_resource_registered"] = True


@callback
def async_add_entry(hass, entry):
    """Expose only the public gateway identity, including during connection retries."""
    data = hass.data.setdefault(DOMAIN, {})
    entries = data.setdefault("panel_entries", {})
    value = {"id": entry.unique_id, "name": entry.title}
    if entries.get(entry.entry_id) == value and data.get("panel_registered"):
        return
    entries[entry.entry_id] = value
    _async_update_panel(hass)


@callback
def async_remove_entry(hass, entry):
    """Remove this oven; remove the sidebar panel after the last oven is unloaded."""
    data = hass.data.get(DOMAIN, {})
    entries = data.get("panel_entries", {})
    if entries.pop(entry.entry_id, None) is None:
        return
    _async_update_panel(hass)


@callback
def _async_update_panel(hass):
    data = hass.data[DOMAIN]
    # DATA_PANELS is used on HA 2026.3 as well as newer versions; the newer
    # async_panel_exists helper is not available on our minimum HA version.
    existing = hass.data.get(frontend.DATA_PANELS, {}).get(PANEL_PATH)
    owned = existing is not None and (existing.config or {}).get("drevos_panel") == DOMAIN
    if existing is not None and not owned:
        LOG.warning("The /%s panel is already in use; leaving the existing panel untouched", PANEL_PATH)
        return
    gateways = list(data.get("panel_entries", {}).values())
    if not gateways:
        if owned:
            frontend.async_remove_panel(hass, PANEL_PATH)
        data["panel_registered"] = False
        return
    # This is the same custom-panel contract used by HA's panel_custom helper.
    # No gateway URL, token, config-entry data or private settings enter it.
    frontend.async_register_built_in_panel(
        hass,
        component_name="custom",
        sidebar_title="Drevos",
        sidebar_icon="mdi:grill",
        frontend_url_path=PANEL_PATH,
        require_admin=False,
        update=owned,
        config={
            "drevos_panel": DOMAIN,
            "gateways": gateways,
            "_panel_custom": {
                "name": "drevos-smoker-panel",
                "module_url": PANEL_MODULE_URL,
                "embed_iframe": False,
                "trust_external": False,
            },
        },
    )
    data["panel_registered"] = True
