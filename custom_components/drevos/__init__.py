"""Native Drevos integration and bundled dashboard card."""
import logging
from pathlib import Path
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace import LOVELACE_DATA
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from .api import DrevosClient, DrevosError, DrevosAuthError
from .const import DOMAIN, PLATFORMS, CARD_PATH, CARD_URL, PROFILE, API_VERSION
from .coordinator import DrevosCoordinator
from homeassistant.exceptions import ConfigEntryNotReady, ConfigEntryAuthFailed

LOG = logging.getLogger(__name__)


async def async_setup_entry(hass, entry):
    client = DrevosClient(async_get_clientsession(hass), entry.data["url"], entry.data["token"])
    try:
        info = await client.info()
    except DrevosAuthError:
        raise ConfigEntryAuthFailed("Gateway authentication failed") from None
    except DrevosError:
        raise ConfigEntryNotReady("Drevos gateway unavailable") from None
    if info.get("profile") != PROFILE or info.get("api_version") != API_VERSION or info.get("id") != entry.unique_id:
        raise ConfigEntryNotReady("Gateway profile or identity changed")
    coordinator = DrevosCoordinator(hass, entry, client, info)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator
    if not hass.data.setdefault(DOMAIN, {}).get("frontend_registered"):
        await hass.http.async_register_static_paths([
            StaticPathConfig(CARD_PATH, str(Path(__file__).parent / "www" / "drevos-smoker-card.js"), True)
        ])
        hass.data[DOMAIN]["frontend_registered"] = True
    # Use the resource collection API; never edit HA's storage files directly.
    lovelace = hass.data.get(LOVELACE_DATA)
    if lovelace and lovelace.resource_mode == "storage":
        resources = lovelace.resources
        await resources.async_get_info()
        matches = [r for r in resources.async_items() if r["url"].split("?")[0] == CARD_PATH]
        if not matches:
            await resources.async_create_item({"res_type": "module", "url": CARD_URL})
        elif matches[0]["url"] != CARD_URL:
            await resources.async_update_item(matches[0]["id"], {"res_type": "module", "url": CARD_URL})
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass, entry):
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
