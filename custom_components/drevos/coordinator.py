"""One coordinated update for every entity; stale states become unavailable."""
from datetime import timedelta
from homeassistant.exceptions import HomeAssistantError, ConfigEntryAuthFailed
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from .api import DrevosError, DrevosAuthError


class DrevosCoordinator(DataUpdateCoordinator):
    def __init__(self, hass, entry, client, info):
        import logging
        super().__init__(hass, logging.getLogger(__name__), config_entry=entry,
                         name="Drevos", update_interval=timedelta(seconds=5))
        self.client = client
        self.info = info

    async def _async_update_data(self):
        try:
            return await self.client.state()
        except DrevosAuthError:
            # A local token can be changed in Reconfigure without leaking it in diagnostics.
            raise ConfigEntryAuthFailed("Gateway authentication failed") from None
        except DrevosError:
            raise UpdateFailed("Drevos gateway unavailable") from None

    async def command(self, name, value):
        try:
            data = await self.client.command(name, value)
            self.async_set_updated_data(data)
        except DrevosError:
            await self.async_request_refresh()
            raise HomeAssistantError("Drevos rejected the command or the connection failed. Check the current oven state before retrying.") from None
