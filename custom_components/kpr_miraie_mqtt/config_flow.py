"""Config flow for Panasonic MirAIe MQTT."""
from __future__ import annotations

import logging
import re
from typing import Any

import requests
import voluptuous as vol

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.const import CONF_PASSWORD, CONF_USERNAME

from .api import MirAIeApi, MirAIeApiError
from .const import CONF_ACCESS_TOKEN, CONF_EXPIRES_AT, CONF_HOME_ID, CONF_USER_ID, DOMAIN

_LOGGER = logging.getLogger(__name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MOBILE_RE = re.compile(r"^\+\d{10,15}$")

STEP_USER_DATA_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_USERNAME): str,
        vol.Required(CONF_PASSWORD): str,
    }
)


class MirAIeConfigFlow(ConfigFlow, domain=DOMAIN):
    """Handle a config flow for MirAIe."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> ConfigFlowResult:
        """Handle the initial step."""
        errors: dict[str, str] = {}

        if user_input is not None:
            username = user_input[CONF_USERNAME].strip()

            if not EMAIL_RE.match(username) and not MOBILE_RE.match(username):
                errors["base"] = "invalid_auth"
            else:
                api = MirAIeApi()
                try:
                    await api.async_login(
                        self.hass,
                        username,
                        user_input[CONF_PASSWORD],
                    )
                    homes = await api.async_get_homes(self.hass)
                    if not homes:
                        errors["base"] = "cannot_connect"
                    else:
                        await self.async_set_unique_id(api.user_id)
                        self._abort_if_unique_id_configured()

                        home_name = homes[0].get("homeName", "MirAIe")
                        devices = api.get_devices_from_homes(homes)
                        device_names = ", ".join(
                            d.get("deviceName", "AC") for d in devices
                        )
                        title = f"KPR MirAIe Local MQTT - {home_name} ({len(devices)} ACs: {device_names}) — View devices under MQTT"
                        return self.async_create_entry(
                            title=title,
                            data={
                                CONF_USERNAME: username,
                                CONF_PASSWORD: user_input[CONF_PASSWORD],
                                CONF_USER_ID: api.user_id,
                                CONF_ACCESS_TOKEN: api.access_token,
                                CONF_HOME_ID: api.home_id,
                                CONF_EXPIRES_AT: api.expires_at,
                            },
                        )
                except MirAIeApiError:
                    errors["base"] = "invalid_auth"
                except (OSError, requests.RequestException):
                    _LOGGER.exception("Connection error")
                    errors["base"] = "cannot_connect"

        return self.async_show_form(
            step_id="user",
            data_schema=STEP_USER_DATA_SCHEMA,
            errors=errors,
        )
