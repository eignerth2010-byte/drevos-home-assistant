"""Set up and reconfigure a Drevos gateway through Home Assistant's UI."""
try:
    import probatio as vol
except ImportError:
    import voluptuous as vol
from homeassistant import config_entries
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.helpers.selector import TextSelector, TextSelectorConfig, TextSelectorType
from .api import DrevosClient, DrevosError, DrevosAuthError, validate_url
from .const import DOMAIN, API_VERSION, PROFILE

DESCRIPTION_PLACEHOLDERS = {
    "gateway_url": "http://drevos-pi.local:8756",
    "installation_url": "https://github.com/eignerth2010-byte/drevos-home-assistant/blob/main/README.md",
}


def schema(defaults=None):
    defaults = defaults or {}
    return vol.Schema({
        vol.Required("url", default=defaults.get("url", "http://drevos-pi.local:8756")): str,
        vol.Required("token"): TextSelector(TextSelectorConfig(type=TextSelectorType.PASSWORD)),
    })


class DrevosConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def _validate(self, user_input):
        validate_url(user_input["url"])
        client = DrevosClient(async_get_clientsession(self.hass), **user_input)
        info = await client.info()
        if (info.get("api_version") != API_VERSION or info.get("profile") != PROFILE
                or not isinstance(info.get("id"), str)):
            raise ValueError("Unsupported gateway profile")
        return info

    async def async_step_user(self, user_input=None):
        errors = {}
        if user_input is not None:
            try:
                info = await self._validate(user_input)
                await self.async_set_unique_id(info["id"])
                self._abort_if_unique_id_configured()
                return self.async_create_entry(title=info.get("name", "Drevos"), data=user_input)
            except DrevosAuthError:
                errors["base"] = "invalid_auth"
            except DrevosError:
                errors["base"] = "cannot_connect"
            except ValueError:
                errors["base"] = "invalid_gateway"
        return self.async_show_form(step_id="user", data_schema=schema(user_input), errors=errors,
                                    description_placeholders=DESCRIPTION_PLACEHOLDERS)

    async def async_step_reconfigure(self, user_input=None):
        entry = self._get_reconfigure_entry()
        errors = {}
        if user_input is not None:
            try:
                info = await self._validate(user_input)
                if info["id"] != entry.unique_id:
                    errors["base"] = "wrong_gateway"
                else:
                    return self.async_update_reload_and_abort(entry, data_updates=user_input)
            except DrevosAuthError:
                errors["base"] = "invalid_auth"
            except DrevosError:
                errors["base"] = "cannot_connect"
            except ValueError:
                errors["base"] = "invalid_gateway"
        return self.async_show_form(step_id="reconfigure", data_schema=schema(entry.data), errors=errors,
                                    description_placeholders=DESCRIPTION_PLACEHOLDERS)

    async def async_step_reauth(self, entry_data):
        return await self.async_step_reauth_confirm()

    async def async_step_reauth_confirm(self, user_input=None):
        entry = self._get_reauth_entry()
        errors = {}
        if user_input is not None:
            try:
                info = await self._validate(user_input)
                if info["id"] != entry.unique_id:
                    errors["base"] = "wrong_gateway"
                else:
                    return self.async_update_reload_and_abort(entry, data_updates=user_input)
            except DrevosAuthError:
                errors["base"] = "invalid_auth"
            except DrevosError:
                errors["base"] = "cannot_connect"
            except ValueError:
                errors["base"] = "invalid_gateway"
        return self.async_show_form(step_id="reauth_confirm", data_schema=schema(entry.data), errors=errors,
                                    description_placeholders=DESCRIPTION_PLACEHOLDERS)
