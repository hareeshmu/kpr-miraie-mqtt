<img src="https://raw.githubusercontent.com/hareeshmu/kpr-miraie-mqtt/main/icon.png" alt="KPR MirAIe" width="80">

# KPR MirAIe Local MQTT — Home Assistant Integration

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

Home Assistant custom integration for Panasonic MirAIe smart air conditioners via local MQTT.

![Device Page](https://raw.githubusercontent.com/hareeshmu/kpr-miraie-mqtt/main/images/device-page.png)

## Features

- **Zero YAML** — UI-based setup, auto-discovers all your ACs
- **Full climate control** — temperature, HVAC mode, fan speed
- **Positional swing** — vertical and horizontal vane positions (Auto, 1-5)
- **Extra controls** — Eco, Powerful, Nanoe, Display, Buzzer switches
- **Converti mode** — compressor capacity select (0/50/100%)
- **Diagnostics** — room temperature, WiFi signal, online status
- **Auto token refresh** — no manual re-authentication needed

## Installation

### HACS (Recommended)

1. Open HACS in Home Assistant → **Integrations**
2. Click the three dots menu (top right) → **Custom repositories**
3. URL: `https://github.com/hareeshmu/kpr-miraie-mqtt`
4. Category: **Integration** → Click **Add**
5. Search for "KPR MirAIe" and click **Install**
6. Restart Home Assistant

### Manual

1. Download this repository
2. Copy `custom_components/kpr_miraie_mqtt/` to your HA `config/custom_components/` directory
3. Restart Home Assistant

## Setup

### Prerequisites

- Home Assistant with [MQTT integration](https://www.home-assistant.io/integrations/mqtt/) configured and connected to a broker
- A Panasonic MirAIe app account

### Steps

1. Go to **Settings → Devices & Services → Add Integration**
2. Search for **KPR MirAIe**

![Search](https://raw.githubusercontent.com/hareeshmu/kpr-miraie-mqtt/main/images/search.png)

3. Enter your MirAIe app credentials (email or mobile number + password)

![Login](https://raw.githubusercontent.com/hareeshmu/kpr-miraie-mqtt/main/images/login.png)

4. All your ACs appear automatically under the integration

![Integration](https://raw.githubusercontent.com/hareeshmu/kpr-miraie-mqtt/main/images/integration.png)

5. View and control your AC devices under **MQTT** integration

![MQTT Devices](https://raw.githubusercontent.com/hareeshmu/kpr-miraie-mqtt/main/images/mqtt-devices.png)

## Entities

Each AC device gets these entities:

| Entity | Type | Description |
|--------|------|-------------|
| Climate | `climate` | Temperature, HVAC mode (cool/heat/auto/dry/fan), fan speed |
| Vertical Swing | `select` | Vane position: Auto, 1 (up) to 5 (down) |
| Horizontal Swing | `select` | Vane position: Auto, 1 (left) to 5 (right) |
| Eco Mode | `switch` | Energy saving mode |
| Powerful Mode | `switch` | Boost cooling/heating |
| Nanoe | `switch` | Air purification |
| Display | `switch` | LED panel on/off |
| Buzzer | `switch` | Beep on/off |
| Converti Mode | `select` | Compressor capacity: 0%, 50%, 100% |
| Room Temperature | `sensor` | Current room temperature |
| WiFi Signal | `sensor` | Signal strength in dBm (diagnostic) |
| Online | `binary_sensor` | Device connectivity (diagnostic) |

## How It Works

The integration bridges MirAIe's cloud MQTT to your local MQTT broker:

1. Logs into MirAIe cloud API with your credentials
2. Discovers your home and all AC devices
3. Connects to MirAIe's cloud MQTT broker
4. Relays device status to your local MQTT broker
5. Forwards control commands from HA through cloud MQTT to your ACs
6. Auto-refreshes the auth token before it expires (~84 days)

Your Home Assistant only communicates with your local MQTT broker — it never talks to the cloud directly.

## Bridge Setup (Required)

The HA component handles device discovery and entity creation. A separate **bridge** container relays MQTT messages between MirAIe cloud and your local broker. Both are needed.

### 1. Copy bridge files to your server

Copy the `bridge/` folder to any machine that can reach both your MQTT broker and the internet (e.g. the same host as your MQTT broker):

```bash
git clone https://github.com/hareeshmu/kpr-miraie-mqtt.git
cd kpr-miraie-mqtt/bridge
```

### 2. Configure credentials

The bridge reads `credentials.json` — you must create this file:

**If you login with email:**
```bash
cp credentials-email.json.example credentials.json
```

**If you login with mobile number:**
```bash
cp credentials-mobile.json.example credentials.json
```

Edit `credentials.json` with your MirAIe app login details.

### 3. Configure MQTT broker

```bash
cp devices.yaml.example devices.yaml
# Edit devices.yaml — set your MQTT broker IP, port, username, password
# Leave the devices section empty — they will be auto-discovered
```

### 4. Run the bridge

**Important:** You must create both `credentials.json` and `devices.yaml` files (steps 2-3) before running Docker. If these files don't exist, Docker will create them as directories and the bridge will fail.

**With Docker (recommended):**
```bash
docker compose up -d
```

**Or directly with Python:**
```bash
pip install -r requirements.txt
python3 miraie_bridge.py
```

On first run, the bridge auto-discovers all your ACs from MirAIe cloud, saves them to `devices.yaml`, and starts relaying.

### 5. Verify

```bash
docker logs miraie-bridge
```

You should see devices connecting and status flowing.

## Architecture

```
┌──────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────┐
│ MirAIe   │◄───►│ miraie-bridge│◄───►│ MQTT Broker   │◄───►│   Home   │
│ Cloud    │     │ (Docker)     │     │ (EMQX/Mosq.) │     │ Assistant│
│ MQTT     │     │              │     │              │     │          │
└──────────┘     └──────────────┘     └──────────────┘     └──────────┘
                  relay control        local topics          MQTT
                  + status             miraie/{id}/*         Discovery
```

- **Bridge**: relays cloud MQTT ↔ local broker (control + status)
- **HA Component**: publishes MQTT Discovery configs, manages auth tokens

## Troubleshooting

**Integration not found after install:**
- Restart Home Assistant after installing
- Check that `custom_components/kpr_miraie_mqtt/` exists in your HA config directory

**Login fails:**
- Verify your credentials work in the MirAIe mobile app
- Try both email and mobile number formats

**Entities show unavailable:**
- Check that the bridge container is running: `docker logs miraie-bridge`
- Check that your MQTT broker is running and HA's MQTT integration is connected
- Verify the AC is online in the MirAIe app

**Controls not responding:**
- Check bridge logs: `docker logs miraie-bridge`
- Ensure bridge is forwarding commands (look for `[local→cloud]` in logs)
- The AC must be online (check the Online binary sensor)

**Changed MirAIe password:**
- Update `bridge/credentials.json` with the new password, then `docker compose restart`
- In HA: Settings → Devices & Services → KPR MirAIe → Delete → Re-add with new password

**`IsADirectoryError: 'devices.yaml'`:**
- You created `devices.yaml` as a folder instead of a file. Fix: `rm -rf devices.yaml && cp devices.yaml.example devices.yaml`

## Changelog

### v1.2.7
- Updated brand icon — cropped and optimized for HA display

### v1.2.6
- Add brand/ folder for HA 2026.3+ local icon support

### v1.2.5
- New logo
- Fix swapped room temperature on affected AC models (PR #1 by @timaseth)

### v1.2.4
- Round operating hours to 1 decimal place

### v1.2.3
- Hide filter/operating hours sensors for devices that don't support them

### v1.2.2
- Fix Operating Hours, Filter Dust Level, Filter Cleaning sensors (now polled from REST API every 15 min)
- These fields are not in MQTT status — requires REST API polling

### v1.2.1
- Fix weekly energy sensor (MirAIe Weekly API broken, now sums daily values)
- Removed stale Energy Today entity

### v1.2.0
- Energy sensors: daily, weekly, monthly consumption (kWh)
- Energy polled from cloud API every 30 min

### v1.1.0
- AC model number shown in device info (e.g. CS-CU-NU18ZKY5W)
- Total Operating Hours sensor
- Filter Dust Level sensor
- Filter Cleaning Required alert
- MAC address and serial number in device info
- Auto-discover devices on first run (no manual device ID lookup)

### v1.0.0
- Initial release
- Climate control (temp, HVAC mode, fan speed)
- Vertical and horizontal swing (positional, Auto/1-5)
- Eco, Powerful, Nanoe, Display, Buzzer switches
- Converti mode select
- Room temperature and WiFi signal sensors
- Online status binary sensor
- Config flow with email/mobile login
- Token auto-refresh

## License

MIT
