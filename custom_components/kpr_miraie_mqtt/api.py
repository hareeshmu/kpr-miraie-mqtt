"""MirAIe Cloud API client."""
from __future__ import annotations

import logging
import time

import requests

from .const import (
    API_CLIENT_ID,
    API_DEVICE_STATUS_URL,
    API_HOMES_URL,
    API_LOGIN_URL,
    API_SCOPE,
    API_USER_AGENT,
)

_LOGGER = logging.getLogger(__name__)


class MirAIeApiError(Exception):
    """MirAIe API error."""


class MirAIeApi:
    """MirAIe Cloud API client."""

    def __init__(self) -> None:
        self.user_id: str | None = None
        self.access_token: str | None = None
        self.home_id: str | None = None
        self.expires_at: float = 0
        self._username: str = ""
        self._password: str = ""

    async def async_login(
        self, hass, username: str, password: str
    ) -> dict:
        """Login to MirAIe cloud. Runs in executor to avoid blocking."""
        self._username = username
        self._password = password
        return await hass.async_add_executor_job(self._login)

    def _login(self) -> dict:
        data: dict = {
            "clientId": API_CLIENT_ID,
            "password": self._password,
            "scope": API_SCOPE,
        }
        if "@" in self._username:
            data["email"] = self._username
        else:
            data["mobile"] = self._username

        resp = requests.post(
            API_LOGIN_URL,
            json=data,
            headers={"User-Agent": API_USER_AGENT},
            timeout=15,
        )
        if resp.status_code != 200:
            _LOGGER.debug("Login response: %s %s", resp.status_code, resp.text)
            raise MirAIeApiError(f"Login failed (HTTP {resp.status_code})")

        result = resp.json()
        self.user_id = result["userId"]
        self.access_token = result["accessToken"]
        self.expires_at = time.time() + result.get("expiresIn", 86400)
        _LOGGER.debug("Logged in as %s", self.user_id)
        return result

    async def async_get_homes(self, hass) -> list[dict]:
        """Get homes and devices."""
        return await hass.async_add_executor_job(self._get_homes)

    def _get_homes(self) -> list[dict]:
        resp = requests.get(
            API_HOMES_URL,
            headers=self._headers(),
            timeout=15,
        )
        resp.raise_for_status()
        homes = resp.json()
        if homes:
            self.home_id = homes[0]["homeId"]
        return homes

    async def async_get_device_status(self, hass, device_id: str) -> dict:
        """Get device status."""
        return await hass.async_add_executor_job(self._get_device_status, device_id)

    def _get_device_status(self, device_id: str) -> dict:
        resp = requests.get(
            API_DEVICE_STATUS_URL.format(device_id=device_id),
            headers=self._headers(),
            timeout=15,
        )
        resp.raise_for_status()
        return resp.json()

    async def async_refresh_token(self, hass) -> None:
        """Re-login to refresh the token."""
        await self.async_login(hass, self._username, self._password)
        _LOGGER.info("Token refreshed, expires at %s", self.expires_at)

    def needs_refresh(self) -> bool:
        """Check if token needs refresh."""
        return time.time() > (self.expires_at - 3600)

    def _headers(self) -> dict:
        return {
            "User-Agent": API_USER_AGENT,
            "Authorization": f"Bearer {self.access_token}",
        }

    def get_devices_from_homes(self, homes: list[dict]) -> list[dict]:
        """Extract devices from home listing."""
        devices = []
        for home in homes:
            for space in home.get("spaces", []):
                for dev in space.get("devices", []):
                    dev["_space_name"] = space.get("spaceName", "")
                    dev["_home_id"] = home["homeId"]
                    devices.append(dev)
        return devices
