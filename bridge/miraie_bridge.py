#!/usr/bin/env python3
"""
MirAIe Cloud ↔ Local MQTT Bridge.

Single cloud MQTT client bridges all devices to a local broker.
HA MQTT Discovery is published by the kpr_miraie_mqtt HA component —
this bridge is purely a relay.
"""

import argparse
import json
import ssl
import time
import threading
import requests
import yaml
import paho.mqtt.client as mqtt

# ── Constants ───────────────────────────────────────────────────────

CLIENT_ID_API = "PBcMcfG19njNCL8AOgvRzIC8AjQa"
USER_AGENT = "okhttp/3.13.1"
SCOPE = "an_14214235325"
LOCAL_TOPIC_PREFIX = "miraie"
TOKEN_REFRESH_MARGIN = 3600  # refresh 1h before expiry

# ── Cloud Auth ──────────────────────────────────────────────────────

class CloudAuth:
    def __init__(self, credentials_file):
        with open(credentials_file) as f:
            creds = json.load(f)
        self.username = creds.get("mobile", creds.get("email", ""))
        self.password = creds["password"]
        self.user_id = None
        self.access_token = None
        self.home_id = None
        self.expires_at = 0

    def login(self):
        data = {
            "clientId": CLIENT_ID_API,
            "password": self.password,
            "scope": SCOPE,
        }
        if "@" in self.username:
            data["email"] = self.username
        else:
            data["mobile"] = self.username

        r = requests.post(
            "https://auth.miraie.in/simplifi/v1/userManagement/login",
            json=data,
            headers={"User-Agent": USER_AGENT},
            timeout=15,
        )
        r.raise_for_status()
        resp = r.json()

        self.user_id = resp["userId"]
        self.access_token = resp["accessToken"]
        self.expires_at = time.time() + resp.get("expiresIn", 86400)
        print(f"[auth] logged in as {self.user_id}, expires in {resp.get('expiresIn', '?')}s")
        return resp

    def get_homes(self):
        r = requests.get(
            "https://app.miraie.in/simplifi/v1/homeManagement/homes",
            headers=self._headers(),
            timeout=15,
        )
        r.raise_for_status()
        homes = r.json()
        if homes:
            self.home_id = homes[0]["homeId"]
            print(f"[auth] home: {homes[0].get('homeName', self.home_id)}")
        return homes

    def get_device_status(self, device_id):
        r = requests.get(
            f"https://app.miraie.in/simplifi/v1/deviceManagement/devices/{device_id}/mobile/status",
            headers=self._headers(),
            timeout=15,
        )
        r.raise_for_status()
        return r.json()

    def ensure_token(self):
        if time.time() > (self.expires_at - TOKEN_REFRESH_MARGIN):
            print("[auth] token expiring, refreshing...")
            self.login()
            return True
        return False

    def _headers(self):
        return {
            "User-Agent": USER_AGENT,
            "Authorization": f"Bearer {self.access_token}",
        }


# ── Bridge ──────────────────────────────────────────────────────────

class MirAIeBridge:
    def __init__(self, auth, config):
        self.auth = auth
        self.config = config

        mqtt_cfg = config["mqtt"]
        self.local_host = mqtt_cfg["host"]
        self.local_port = mqtt_cfg["port"]
        self.local_user = mqtt_cfg.get("username", "")
        self.local_pass = mqtt_cfg.get("password", "")

        cloud_cfg = config.get("cloud", {})
        self.cloud_host = cloud_cfg.get("broker", "mqtt.miraie.in")
        self.cloud_port = cloud_cfg.get("port", 8883)

        self.devices = {d["device_id"]: d for d in config["devices"]}
        self.cloud_sub = f"{auth.user_id}/{auth.home_id}/#"

        self.cloud_client = None
        self.local_client = None
        self._token_timer = None

    def start(self):
        self._connect_local()
        self._connect_cloud()
        self._schedule_token_refresh()
        print(f"\n[bridge] running with {len(self.devices)} device(s)")
        print(f"[bridge] local topics: {LOCAL_TOPIC_PREFIX}/{{deviceId}}/status|control|connection")

        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n[bridge] shutting down")
            if self._token_timer:
                self._token_timer.cancel()
            self.cloud_client.disconnect()
            self.local_client.disconnect()

    def _connect_cloud(self):
        client = mqtt.Client(client_id=f"miraie-bridge-cloud-{self.auth.user_id[:8]}")
        client.tls_set(tls_version=ssl.PROTOCOL_TLSv1_2)
        client.tls_insecure_set(True)
        client.username_pw_set(self.auth.home_id, self.auth.access_token)
        client.on_connect = self._on_cloud_connect
        client.on_message = self._on_cloud_message
        client.on_disconnect = self._on_cloud_disconnect

        print(f"[cloud] connecting to {self.cloud_host}:{self.cloud_port}...")
        client.connect_async(self.cloud_host, self.cloud_port, 60)
        client.loop_start()
        self.cloud_client = client

    def _connect_local(self):
        client = mqtt.Client(client_id="miraie-bridge-local")
        if self.local_user:
            client.username_pw_set(self.local_user, self.local_pass)
        client.on_connect = self._on_local_connect
        client.on_message = self._on_local_message
        client.on_disconnect = self._on_local_disconnect

        print(f"[local] connecting to {self.local_host}:{self.local_port}...")
        client.connect(self.local_host, self.local_port, 60)
        client.loop_start()
        self.local_client = client

    def _schedule_token_refresh(self):
        """Refresh token before expiry and reconnect cloud client."""
        wait = max(self.auth.expires_at - time.time() - TOKEN_REFRESH_MARGIN, 60)
        self._token_timer = threading.Timer(wait, self._refresh_token)
        self._token_timer.daemon = True
        self._token_timer.start()
        print(f"[auth] token refresh scheduled in {int(wait)}s")

    def _refresh_token(self):
        try:
            self.auth.login()
            self.cloud_client.username_pw_set(self.auth.home_id, self.auth.access_token)
            self.cloud_client.reconnect()
            print("[auth] token refreshed, cloud reconnected")
        except Exception as e:
            print(f"[auth] refresh failed: {e}, retrying in 60s")
        self._schedule_token_refresh()

    # ── Cloud callbacks ──

    def _on_cloud_connect(self, client, userdata, flags, rc):
        if rc != 0:
            print(f"[cloud] connection failed: rc={rc}")
            return
        print(f"[cloud] connected, subscribing to {self.cloud_sub}")
        client.subscribe(self.cloud_sub)

    def _on_cloud_message(self, client, userdata, msg):
        topic = msg.topic
        payload = msg.payload.decode(errors="replace")
        parts = topic.split("/")

        # Topic format: userId/homeId/deviceId/type
        if len(parts) < 4:
            return

        device_id = parts[2]
        msg_type = "/".join(parts[3:])

        # Only bridge known devices
        if device_id not in self.devices:
            return

        # Don't bridge control messages back from cloud (prevents loop) — but
        # still log them so we can see raw commands the MirAIe app sends.
        if msg_type == "control":
            try:
                dev_name = self.devices[device_id].get("name", device_id)
                print(f"[cloud/ctrl ] {dev_name}: {payload}")
            except Exception:
                pass
            return

        local_topic = f"{LOCAL_TOPIC_PREFIX}/{device_id}/{msg_type}"

        # Fix swapped rmtmp (firmware bug on some models e.g. 130251):
        # e.g. '61.29' actually means 29.61°C, '02.27' actually means 27.02°C
        # Zero-pad to 5 chars before swapping so '2.27' -> '0227' -> '2702' -> 27.02
        if msg_type == "status":
            try:
                d = json.loads(payload)
                raw = d.get("rmtmp")
                if raw is not None and (float(raw) > 50 or float(raw) < 10):
                    s = f"{float(raw):05.2f}".replace(".", "")  # '61.29' -> '6129'
                    corrected = s[2:] + s[:2]                   # '6129'  -> '2961'
                    d["rmtmp"] = float(f"{corrected[:2]}.{corrected[2:]}")  # 29.61
                    payload = json.dumps(d)
            except (ValueError, TypeError, json.JSONDecodeError):
                pass

        self.local_client.publish(local_topic, payload, retain=True)

        # Log status updates with key fields + flag any unknown fields (useful for
        # discovering undocumented MirAIe protocol fields like Self-Clean).
        if msg_type == "status":
            try:
                d = json.loads(payload)
                dev_name = self.devices[device_id].get("name", device_id)
                KNOWN = {"ps","acmd","actmp","rmtmp","acfs","acvs","achs","acec","acem",
                         "acpm","acng","acdc","bzr","cnv","rssi","ki","cnt","sid",
                         "ts","onlineStatus","errCode","wt","ver","V","mo"}
                unknown = {k: v for k, v in d.items() if k not in KNOWN}
                print(f"[cloud→local] {dev_name}: ps={d.get('ps')} acmd={d.get('acmd')} actmp={d.get('actmp')} acfs={d.get('acfs')} acvs={d.get('acvs')} achs={d.get('achs')}")
                if unknown:
                    print(f"[cloud→local] {dev_name}: UNKNOWN_FIELDS={unknown}")
            except Exception:
                pass

    def _on_cloud_disconnect(self, client, userdata, rc):
        if rc != 0:
            print(f"[cloud] disconnected (rc={rc}), auto-reconnecting...")

    # ── Local callbacks ──

    def _on_local_connect(self, client, userdata, flags, rc):
        if rc != 0:
            print(f"[local] connection failed: rc={rc}")
            return
        print("[local] connected")
        # Subscribe to control topics for all devices
        for device_id in self.devices:
            topic = f"{LOCAL_TOPIC_PREFIX}/{device_id}/control"
            client.subscribe(topic)
            print(f"[local] subscribed: {topic}")

    def _on_local_message(self, client, userdata, msg):
        if not self.cloud_client or not self.cloud_client.is_connected():
            return

        # Extract device_id from topic: miraie/{deviceId}/control
        parts = msg.topic.split("/")
        if len(parts) < 3:
            return
        device_id = parts[1]

        if device_id not in self.devices:
            return

        payload = msg.payload.decode(errors="replace")
        cloud_topic = f"{self.auth.user_id}/{self.auth.home_id}/{device_id}/control"
        self.cloud_client.publish(cloud_topic, payload)
        dev_name = self.devices[device_id].get("name", device_id)
        print(f"[local→cloud] {dev_name}: {payload[:150]}")

    def _on_local_disconnect(self, client, userdata, rc):
        if rc != 0:
            print(f"[local] disconnected (rc={rc}), auto-reconnecting...")


# ── Main ────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="MirAIe MQTT Bridge for Home Assistant")
    parser.add_argument("--config", default="devices.yaml", help="Device config file")
    parser.add_argument("--credentials", default="credentials.json", help="Cloud credentials")
    args = parser.parse_args()

    with open(args.config) as f:
        config = yaml.safe_load(f)

    auth = CloudAuth(args.credentials)
    auth.login()
    homes = auth.get_homes()

    # Auto-discover and populate devices if none configured
    if not config.get("devices"):
        print("\n[discovery] No devices in devices.yaml — discovering...")
        discovered = []
        for home in homes:
            for space in home.get("spaces", []):
                for dev in space.get("devices", []):
                    device_id = dev.get("deviceId", "")
                    name = dev.get("deviceName", "AC")
                    space_name = space.get("spaceName", "")
                    discovered.append({
                        "name": name,
                        "slug": f"kpr_{device_id}",
                        "space": space_name,
                        "device_id": device_id,
                        "manufacturer": "KPR",
                        "model": "Panasonic MirAIe Smart AC",
                    })
                    print(f"  Found: {name} ({device_id}) in {space_name}")

        if discovered:
            config["devices"] = discovered
            with open(args.config, "w") as f:
                yaml.dump(config, f, default_flow_style=False, sort_keys=False)
            print(f"\n[discovery] Saved {len(discovered)} device(s) to {args.config}")
            print("[discovery] Restarting bridge with discovered devices...\n")
        else:
            print("[discovery] No devices found in your MirAIe home.")
            return

    # Print device status
    for dev in config["devices"]:
        try:
            status = auth.get_device_status(dev["device_id"])
            ps = status.get("ps", "?")
            temp = status.get("actmp", "?")
            room = status.get("rmtmp", "?")
            mode = status.get("acmd", "?")
            online = status.get("onlineStatus", "?")
            print(f"  {dev['name']}: power={ps} mode={mode} set={temp} room={room} online={online}")
        except Exception as e:
            print(f"  {dev['name']}: {e}")

    bridge = MirAIeBridge(auth, config)
    bridge.start()


if __name__ == "__main__":
    main()
