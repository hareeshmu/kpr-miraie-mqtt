# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Home Assistant custom integration + standalone MQTT bridge for Panasonic MirAIe smart ACs, plus a custom Lovelace card. Three components:
- **HA component** (`custom_components/kpr_miraie_mqtt/`) — config flow, device discovery, MQTT Discovery publishing
- **Bridge** (`bridge/`) — Docker container relaying cloud MQTT ↔ local MQTT broker
- **Card** — Lovelace custom card (`kpr-miraie-card`) with LVGL-inspired dial. Maintained in a **separate repo**: https://github.com/hareeshmu/kpr-miraie-card (HACS plugin). All new card changes go there only. The `card/` subdir in THIS repo is a frozen v1.3.0-era mirror kept for historical reference — do not update it for new card work. Sandbox (`card/sandbox/dial.html`) is still useful for local visual iteration (gitignored). Card build: `cd` into the separate repo checkout and run `pnpm build`.

The HA component does NOT connect to cloud MQTT itself. It only publishes MQTT Discovery configs so HA auto-creates entities. The bridge handles all cloud relay.

## Architecture

```
MirAIe Cloud MQTT ←→ bridge (paho-mqtt) ←→ Local MQTT Broker ←→ HA (MQTT Discovery entities)
```

- Bridge subscribes to `{userId}/{homeId}/#` on cloud, republishes to `miraie/{deviceId}/{type}` locally (retained)
- Bridge subscribes to `miraie/{deviceId}/control` locally, forwards to cloud
- HA component publishes discovery configs to `homeassistant/{component}/{slug}/config`
- Cloud echoes control messages back — bridge filters `/control` from cloud→local to prevent loops

## Key Domain Knowledge

- MirAIe API login requires `scope: "an_14214235325"` (not empty string)
- Login supports both email and mobile (`+91...`) — field name changes (`email` vs `mobile`)
- Cloud MQTT: `mqtt.miraie.in:8883`, username=`homeId`, password=`accessToken`
- Token expires in ~84 days (`expiresIn: 7257599s`)
- Device cert-pins TLS on all endpoints — DNS override / MITM is not possible
- `achs` (horizontal swing) is positional 0-5, not just on/off
- Converti mode (`cnv`) supports 9 levels: **0 (Off), 40, 50, 60, 70, 80, 90, 100 (FC), 110 (HC)** — not the "Auto" mapping used by swing. (Earlier versions only exposed 0/50/100 — the app supports the full set)
- **`acec` = Clean mode** (the MirAIe app's "Clean" button). **`acem` = Eco mode** (the app's "Eco mode" button). They are SEPARATE fields — earlier integration versions incorrectly labeled `acec` as "Eco Mode". As of 1.3.0 both switches are exposed correctly.
- `rssi` WiFi signal is exposed as its own sensor entity (`sensor.kpr_{id}_rssi`, dBm, device_class=signal_strength)

## Commands

```bash
# Lint
ruff check custom_components/kpr_miraie_mqtt/ bridge/miraie_bridge.py

# Syntax check all Python
python3 -m py_compile custom_components/kpr_miraie_mqtt/coordinator.py

# Test bridge locally
cd bridge
cp credentials-email.json.example credentials.json  # fill in
cp devices.yaml.example devices.yaml                # fill in
pip install -r requirements.txt
python3 miraie_bridge.py

# Deploy bridge as Docker
cd bridge
docker compose up -d
docker logs miraie-bridge

# Deploy HA component
scp -r custom_components/kpr_miraie_mqtt root@<HA_IP>:/config/custom_components/

# Build the Lovelace card
cd card
pnpm install
pnpm build           # → dist/kpr-miraie-card.js

# Iterate on dial visuals without HA deploy loop
open card/sandbox/dial.html   # standalone mockup with live sliders

# Deploy card
scp card/dist/kpr-miraie-card.js <user>@<HA_IP>:/config/www/kpr-miraie-card.js
# Then in HA: Settings → Dashboards → Resources → bump ?v= → hard-refresh
```

## Consistency Rules

- Domain is `kpr_miraie_mqtt` — must match in `const.py DOMAIN`, `manifest.json domain`, and folder name
- All entity unique_ids use prefix `kpr_miraie_{device_id}_`
- Device identifiers use `kpr_miraie_{device_id}`
- MQTT topics use prefix `miraie/` (not `kpr_miraie/`) — this is the local broker topic namespace
- Display name is "KPR MirAIe Local MQTT" — consistent across manifest, hacs.json, strings.json, translations
- Bridge does NOT publish MQTT Discovery — that's exclusively the HA component's job. The bridge is a pure cloud↔local relay.
- HAOS add-on lives in `addon-miraie-bridge/` and contains a copy of `bridge/miraie_bridge.py` (Docker build context can't reach `bridge/`). Keep them in sync via `scripts/sync-addon-bridge.sh`; CI (`.github/workflows/addon-sync-check.yml`) fails any PR where they diverge.
- Card version is in `card/package.json` + a `KPR_CARD_VERSION` banner at the top of `card/src/kpr-miraie-card.js` — keep both in sync
- Card auto-derives companion entity IDs from the climate entity's slug (e.g. `climate.kpr_xyz` → `switch.kpr_xyz_acem`, `sensor.kpr_xyz_rssi`). Users can override any field in YAML. Entity naming in coordinator must follow `{slug}_{suffix}` or auto-derive breaks.
- Inside the card's `css\`...\``template literal, backticks are FORBIDDEN (even inside comments). They close the template literal. Learned the hard way — use regular quotes in CSS comments.
- SVG elements that need a guaranteed SVG namespace (animated ticks, needle, handle) must be populated via `createElementNS` in the `updated()` lifecycle. Lit's `html\`\``inside an SVG parent creates HTML-namespaced elements that render as invisible `HTMLUnknownElement`s.

## MirAIe Control Payload Format

All commands to `miraie/{deviceId}/control`:
```json
{"<field>": "<value>", "ki": 0, "cnt": "an", "sid": "0"}
```

Status fields: `ps`, `actmp`, `rmtmp`, `acmd`, `acfs`, `acvs`, `achs`, `acec`, `acpm`, `acng`, `acdc`, `bzr`, `cnv`, `rssi`
