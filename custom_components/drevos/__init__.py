"""Native Drevos integration and bundled dashboard card."""
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from .api import DrevosClient, DrevosError, DrevosAuthError
from .const import DOMAIN, PLATFORMS, PROFILE, API_VERSION
from .coordinator import DrevosCoordinator
from .frontend import async_setup_frontend, async_add_entry, async_remove_entry as async_remove_frontend_entry
from homeassistant.exceptions import ConfigEntryNotReady, ConfigEntryAuthFailed

async def async_setup(hass, config):
    """Make the sidebar available even while an oven is temporarily offline."""
    await async_setup_frontend(hass)
    for entry in hass.config_entries.async_entries(DOMAIN):
        if entry.disabled_by is None:
            async_add_entry(hass, entry)
    return True


async def async_setup_entry(hass, entry):
    await async_setup_frontend(hass)
    async_add_entry(hass, entry)
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
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass, entry):
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        async_remove_frontend_entry(hass, entry)
    return unloaded


async def async_remove_entry(hass, entry):
    """Also clean up an entry removed while its gateway was never reachable."""
    async_remove_frontend_entry(hass, entry)
