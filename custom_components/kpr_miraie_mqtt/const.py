"""Constants for Panasonic MirAIe MQTT integration."""

DOMAIN = "kpr_miraie_mqtt"

# MirAIe Cloud API
API_CLIENT_ID = "PBcMcfG19njNCL8AOgvRzIC8AjQa"
API_SCOPE = "an_14214235325"
API_LOGIN_URL = "https://auth.miraie.in/simplifi/v1/userManagement/login"
API_HOMES_URL = "https://app.miraie.in/simplifi/v1/homeManagement/homes"
API_DEVICE_STATUS_URL = "https://app.miraie.in/simplifi/v1/deviceManagement/devices/{device_id}/mobile/status"
API_USER_AGENT = "okhttp/3.13.1"

# Cloud MQTT
CLOUD_MQTT_HOST = "mqtt.miraie.in"
CLOUD_MQTT_PORT = 8883

# Local MQTT topic prefix
TOPIC_PREFIX = "miraie"

# MirAIe HVAC modes
HVAC_MODES_MAP = {
    "cool": "cool",
    "heat": "heat",
    "auto": "auto",
    "dry": "dry",
    "fan": "fan_only",
}
HVAC_MODES_REV = {v: k for k, v in HVAC_MODES_MAP.items()}

# Fan modes
FAN_MODES = ["auto", "quiet", "low", "medium", "high"]

# Swing positions
SWING_POSITIONS = ["Auto", "1", "2", "3", "4", "5"]

# Converti options
CONVERTI_OPTIONS = ["0", "50", "100"]

# Temp range
TEMP_MIN = 16
TEMP_MAX = 30
TEMP_STEP = 0.5

# Token refresh margin (seconds before expiry)
TOKEN_REFRESH_MARGIN = 3600

# Config keys
CONF_USER_ID = "user_id"
CONF_ACCESS_TOKEN = "access_token"
CONF_HOME_ID = "home_id"
CONF_EXPIRES_AT = "expires_at"
