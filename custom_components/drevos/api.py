"""Small asynchronous client. Commands are deliberately never retried."""
import asyncio
from urllib.parse import urlsplit
from aiohttp import ClientError, ClientSession, ClientTimeout


class DrevosError(Exception):
    """Connection, protocol or command error without credentials in the message."""


class DrevosAuthError(DrevosError):
    """Gateway authentication failed."""


class DrevosBusyError(DrevosError):
    """Another command is still in progress; this command was not sent."""


class DrevosRejectedError(DrevosError):
    """The gateway refused a command, including a busy serial connection."""


def validate_url(url):
    parts = urlsplit(url)
    if (parts.scheme not in ("http", "https") or not parts.hostname or parts.username
            or parts.password or parts.query or parts.fragment or parts.path not in ("", "/")):
        raise ValueError("Use a base URL without credentials, path, query or fragment")
    return url.rstrip("/")


class DrevosClient:
    def __init__(self, session: ClientSession, url: str, token: str):
        self.session = session
        self.url = validate_url(url)
        self._headers = {"Authorization": "Bearer " + token}
        self._command_in_flight = False

    async def request(self, method, path, payload=None):
        try:
            async with self.session.request(
                method, self.url + "/api/v1/" + path, headers=self._headers, json=payload,
                timeout=ClientTimeout(total=12), allow_redirects=False,
            ) as response:
                if response.status == 401:
                    raise DrevosAuthError("Gateway authentication failed")
                if response.status == 409:
                    raise DrevosRejectedError("Gateway refused the command")
                if response.status != 200:
                    # No response body or URL in exceptions: neither can leak credentials.
                    raise DrevosError("Gateway rejected request or PLC is unavailable")
                result = await response.json()
                if not isinstance(result, dict):
                    raise DrevosError("Invalid gateway response")
                return result
        except (ClientError, asyncio.TimeoutError, ValueError):
            raise DrevosError("Gateway connection or response failed") from None

    async def info(self):
        return await self.request("GET", "info")

    async def state(self):
        return await self.request("GET", "state")

    async def command(self, name, value):
        # Shared by every entity/card using this config entry. Refuse overlapping
        # commands before the first await; never wait in a lock or retry them.
        if self._command_in_flight:
            raise DrevosBusyError("Another command is still in progress")
        self._command_in_flight = True
        try:
            return await self.request("POST", "command", {"name": name, "value": str(value)})
        finally:
            self._command_in_flight = False
