<img src="https://raw.githubusercontent.com/hareeshmu/kpr-miraie-mqtt/main/icon.png" alt="KPR MirAIe" width="80">

# KPR MirAIe Local MQTT — Home Assistant Integration

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)

Home Assistant custom integration for Panasonic MirAIe smart air conditioners via local MQTT.

![Device Page](https://raw.githubusercontent.com/hareeshmu/kpr-miraie-mqtt/main/images/device-page.png)

> 🎨 **Also available: a matching Lovelace card** — [LVGL-inspired](https://github.com/hareeshmu/climate-control-display) circular dial,
> mode-colored halo, room-temp needle, pill-row popups, responsive layout. See
> **[kpr-miraie-card](https://github.com/hareeshmu/kpr-miraie-card)** for install + YAML + screenshots.
>
> <img src="https://raw.githubusercontent.com/hareeshmu/kpr-miraie-card/main/images/cool.png" width="360" alt="KPR MirAIe Card preview"/>

## Features

- **Zero YAML** — UI-based setup, auto-discovers all your ACs
- **Full climate control** — temperature, HVAC mode (cool / heat / auto / dry / fan), fan speed
- **Positional swing** — vertical and horizontal vane positions (Auto, 1-5)
- **Extra controls** — Eco (`acem`), Clean (`acec`), Powerful, Nanoe, Display, Buzzer switches
- **Converti8 mode** — compressor capacity select with 9 levels (Off / 40-90% / FC / HC)
- **Diagnostics** — room temperature, WiFi signal, online status
- **Auto token refresh** — no manual re-authentication needed
- **Matching Lovelace card** — polished circular dial with drag-to-set, see [kpr-miraie-card](https://github.com/hareeshmu/kpr-miraie-card)

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

The HA component handles device discovery and entity creation. A separate **bridge** relays MQTT messages between MirAIe cloud and your local broker. You have two options — choose one:

---

### Option A — HA Add-on (Recommended for HAOS users)

If you are running Home Assistant OS or Supervised, the easiest way is the
**MirAIe MQTT Bridge add-on** — developed by
[@pranjal-joshi](https://github.com/pranjal-joshi). It runs the bridge directly
inside HA with zero extra infrastructure needed.

[![Open your Home Assistant instance and show the dashboard of an app.](https://my.home-assistant.io/badges/supervisor_addon.svg)](https://my.home-assistant.io/redirect/supervisor_addon/?addon=miraie-mqtt-bridge&repository_url=https%3A%2F%2Fgithub.com%2Fhareeshmu%2Fkpr-miraie-mqtt)

**Quick install:**

1. Click the button above — it opens HA and pre-fills the repository URL.  
   _Or manually:_ **Settings → Add-ons → Add-on Store → ⋮ → Repositories** → paste `https://github.com/hareeshmu/kpr-miraie-mqtt`
2. Find **MirAIe MQTT Bridge** in the store → **Install**
3. Go to the **Configuration** tab, enter your MirAIe credentials and leave `mqtt_*` fields empty if you use the Mosquitto add-on
4. **Start** the add-on — devices are auto-discovered on first run
5. Restart once after discovery, then check **Settings → Devices & Services → MQTT** for your entities

Full add-on documentation: [`addon-miraie-bridge/DOCS.md`](addon-miraie-bridge/DOCS.md)

---

### Option B — Standalone Docker bridge

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

> Companion card changes are tracked in the **[kpr-miraie-card](https://github.com/hareeshmu/kpr-miraie-card/releases)** repo. Most recent: **v1.3.4** — auto-derive companion entities survives climate renames (resolves via HA entity registry `device_id`).

### v1.4.2
- Silence HA template warnings for devices that omit optional status fields:
  - Switches (`acec`, `acem`, `acpm`, `acng`, `acdc`, `bzr`) default to `off` (PR #5 by [@timaseth](https://github.com/timaseth))
  - Converti select (`cnv`) defaults to `0` (PR #5 by [@timaseth](https://github.com/timaseth))
  - Swing selects (`acvs`, `achs`) default to `Auto` when field missing (PR #6)
  - Model Number sensor (`mo`) defaults to `unknown` (PR #6)
  - Online binary sensor (`onlineStatus`) defaults to `false` / offline (PR #6)

### v1.4.1
- New diagnostic sensor: **Firmware** (status field `V`) — shows indoor-unit firmware version
- New diagnostic sensor: **Model Number** (status field `mo`) — matches the label printed on the indoor unit
- Bridge: adds `V` and `mo` to KNOWN fields so they no longer show up in `UNKNOWN_FIELDS` log noise

### v1.4.0
- **New: MirAIe MQTT Bridge HA add-on** (add-on v1.0.0) by [@pranjal-joshi](https://github.com/pranjal-joshi)
  - Runs the bridge natively inside Home Assistant OS — no separate Docker host needed
  - Auto-discovers Mosquitto credentials via Supervisor API
  - Auto-discovers MirAIe devices on first run; persists across restarts
  - Full configuration via HA UI (no YAML files to edit)
- Bridge: remove dead HA Discovery code (HA component owns discovery exclusively)
- README: corrected entity table

### v1.3.0
- **New Lovelace card** ([kpr-miraie-card](https://github.com/hareeshmu/kpr-miraie-card)) — [LVGL-inspired](https://github.com/hareeshmu/climate-control-display) circular dial, mode-color halo, draggable handle, room-temp needle, pill-row popups, responsive layout, auto-derived companion entities. Shipped as a separate HACS plugin repo.
- **Protocol fix: Clean vs Eco** — `acec` is the MirAIe app's Clean button, not Eco. `acem` is real Eco mode. Both are now exposed as separate switches (`switch.kpr_<id>_acec` kept for history; new `switch.kpr_<id>_acem` added)
- **Converti8** — expanded from 3 levels (0/50/100) to 9 (Off / 40-90% / FC / HC)
- Bridge: unknown-field logger to help discover future MirAIe protocol additions
- Integration manifest version bumped to 1.3.0

### v1.2.8
- New KPR brand icon

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

## Contributors

A warm thank-you to everyone who has helped shape this project 💙

- [@hareeshmu](https://github.com/hareeshmu) — original author & maintainer
- [@pranjal-joshi](https://github.com/pranjal-joshi) — HA add-on developer
- [@timaseth](https://github.com/timaseth) — swapped room-temperature fix (PR #1)

Bug reports, issues, and PRs are all genuinely appreciated — the integration, bridge, and card are better because of the community poking at them on real hardware. If you've tested a new MirAIe model, caught a quirk, or just helped validate behaviour, thank you.

> _Special thanks to everyone who shared MirAIe app captures and packet dumps that helped uncover undocumented protocol fields (e.g. `acec` = Clean vs `acem` = Eco, the full 9-level Converti8 set)._

### 🇮🇳 Special shout-out — Home Automation India

A huge thank-you to the **[Home Automation India Discord](https://discord.gg/KfAjVkAG)** — a community for home automation enthusiasts of Indian origin. The testing, encouragement, real-world device diversity, and late-night debugging sessions from this group made this project possible. Come say hi — lots of friendly, knowledgeable folks building cool things.

Want to contribute? Open an issue, send a PR, or drop by the [Home Automation India Discord](https://discord.gg/KfAjVkAG) — even "works on my model" confirmations help.

## License

MIT

