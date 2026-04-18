const KPR_CARD_VERSION = "1.3.1";
console.info(
  `%c KPR-MIRAIE-CARD %c v${KPR_CARD_VERSION} `,
  "background:#00bfff;color:#000;font-weight:700;padding:2px 4px;border-radius:3px 0 0 3px;",
  "background:#11151e;color:#00bfff;font-weight:700;padding:2px 4px;border-radius:0 3px 3px 0;"
);

const LitElement = Object.getPrototypeOf(
  customElements.get("ha-panel-lovelace")
);
const html = LitElement.prototype.html;
const css = LitElement.prototype.css;

class KprMiraieCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _time: { type: Number },
      _expandVSwing: { type: Boolean },
      _expandHSwing: { type: Boolean },
      _expandConverti: { type: Boolean },
      _expandFeatures: { type: Boolean },
      _expandEnergy: { type: Boolean },
      _showMoreModes: { type: Boolean },
      _dragTargetTemp: { type: Number },
    };
  }

  constructor() {
    super();
    this._expandVSwing = false;
    this._expandHSwing = false;
    this._expandConverti = false;
    this._expandFeatures = false;
    this._expandEnergy = false;
    this._dragTargetTemp = null;
  }

  _closeAllPopups() {
    this._expandVSwing = false;
    this._expandHSwing = false;
    this._expandConverti = false;
    this._expandFeatures = false;
    this._expandEnergy = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this._time = Date.now();
    this._timer = setInterval(() => { this._time = Date.now(); }, 30000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._timer);
  }

  updated() {
    // Populate tick groups via createElementNS so they're in the SVG namespace.
    // lit-html's html`` tag creates HTML-namespaced elements; using .map() inside
    // an <svg> parent would emit invalid HTMLUnknownElements instead of real lines.
    const root = this.shadowRoot;
    if (!root || !this._ticks) return;
    const NS = "http://www.w3.org/2000/svg";
    const bg = root.querySelector(".tick-group-bg");
    const glow = root.querySelector(".tick-group-glow");
    const lit = root.querySelector(".tick-group-lit");
    if (!bg || !glow || !lit) return;
    const { modeColor, dimTickColor, tickW } = this._tickStyle;
    bg.replaceChildren();
    glow.replaceChildren();
    lit.replaceChildren();
    for (const t of this._ticks) {
      const mkLine = (opts) => {
        const el = document.createElementNS(NS, "line");
        el.setAttribute("x1", t.p1.x);
        el.setAttribute("y1", t.p1.y);
        el.setAttribute("x2", t.p2.x);
        el.setAttribute("y2", t.p2.y);
        el.setAttribute("stroke", opts.stroke);
        el.setAttribute("stroke-width", opts.width);
        el.setAttribute("stroke-linecap", opts.cap);
        if (opts.opacity != null) el.setAttribute("opacity", opts.opacity);
        return el;
      };
      bg.appendChild(mkLine({ stroke: dimTickColor, width: tickW, cap: "butt", opacity: 0.55 }));
      if (t.lit) {
        glow.appendChild(mkLine({ stroke: modeColor, width: 4, cap: "round", opacity: 0.25 }));
        lit.appendChild(mkLine({ stroke: modeColor, width: tickW, cap: "butt" }));
      }
    }

    // Needle — populate via createElementNS so lines render in the SVG namespace.
    const needleG = root.querySelector(".needle-group");
    if (needleG) {
      needleG.replaceChildren();
      const ns = this._needleState;
      if (ns && ns.visible) {
        const mkNeedle = (width, opacity, glow) => {
          const el = document.createElementNS(NS, "line");
          el.setAttribute("x1", ns.needleA.x);
          el.setAttribute("y1", ns.needleA.y);
          el.setAttribute("x2", ns.needleB.x);
          el.setAttribute("y2", ns.needleB.y);
          el.setAttribute("stroke", ns.needleColor);
          el.setAttribute("stroke-width", width);
          el.setAttribute("stroke-linecap", "round");
          if (opacity != null) el.setAttribute("opacity", opacity);
          if (glow) el.setAttribute("style", `filter: drop-shadow(0 0 3px ${ns.needleColor})`);
          return el;
        };
        needleG.appendChild(mkNeedle(6, 0.25, false));
        needleG.appendChild(mkNeedle(3, null, true));
      }
    }

    // Handle — populate via createElementNS.
    const handleG = root.querySelector(".handle-group");
    if (handleG) {
      handleG.replaceChildren();
      const hs = this._handleState;
      if (hs && hs.visible) {
        const halo = document.createElementNS(NS, "circle");
        halo.setAttribute("cx", hs.handle.x);
        halo.setAttribute("cy", hs.handle.y);
        halo.setAttribute("r", 16);
        halo.setAttribute("fill", hs.modeColor);
        halo.setAttribute("opacity", 0.45);
        handleG.appendChild(halo);

        const disc = document.createElementNS(NS, "circle");
        disc.setAttribute("cx", hs.handle.x);
        disc.setAttribute("cy", hs.handle.y);
        disc.setAttribute("r", 8);
        disc.setAttribute("fill", "#ffffff");
        disc.setAttribute("stroke", hs.modeColor);
        disc.setAttribute("stroke-width", 3);
        disc.setAttribute("style", `cursor: grab; filter: drop-shadow(0 0 6px ${hs.modeColor})`);
        handleG.appendChild(disc);
      }
    }

    // Seed snowflakes once (each flake composites 3 independent animations for organic motion)
    const particles = root.querySelector(".particles");
    if (particles && !particles.dataset.seeded) {
      const rand = (min, max) => min + Math.random() * (max - min);
      for (let i = 0; i < 7; i++) {
        const outer = document.createElement("span");
        outer.className = "snowflake";
        const sway = document.createElement("span");
        sway.className = "sway";
        const spin = document.createElement("span");
        spin.className = "spin";
        spin.textContent = "❄";
        sway.appendChild(spin);
        outer.appendChild(sway);
        outer.style.left = `${rand(3, 97).toFixed(1)}%`;
        outer.style.fontSize = `${rand(8, 24).toFixed(1)}px`;
        outer.style.setProperty("--fall-dur", `${rand(5, 12).toFixed(2)}s`);
        outer.style.setProperty("--fall-delay", `-${rand(0, 12).toFixed(2)}s`);
        sway.style.setProperty("--sway-dur", `${rand(1.8, 4.5).toFixed(2)}s`);
        sway.style.setProperty("--sway-delay", `-${rand(0, 4).toFixed(2)}s`);
        sway.style.setProperty("--sway-amp", `${rand(4, 22).toFixed(1)}px`);
        spin.style.setProperty("--spin-dur", `${rand(4, 14).toFixed(2)}s`);
        const spinDir = Math.random() < 0.5 ? -1 : 1;
        spin.style.setProperty("--spin-amount", `${(rand(120, 540) * spinDir).toFixed(0)}deg`);
        particles.appendChild(outer);
      }
      particles.dataset.seeded = "1";
    }
  }

  setConfig(config) {
    if (!config.entity) throw new Error("Please define a climate entity");

    // Auto-derive companion entities from the climate entity's slug.
    // Example: climate.kpr_05f448d0cfa6 → base slug "kpr_05f448d0cfa6"
    // → switch.kpr_05f448d0cfa6_acem, select.kpr_05f448d0cfa6_v_swing, etc.
    // User-supplied values always override.
    const slugMatch = config.entity.match(/^climate\.(.+)$/);
    const slug = slugMatch ? slugMatch[1] : null;
    const derive = (domain, suffix) => slug ? `${domain}.${slug}_${suffix}` : "";

    this.config = {
      entity: config.entity,
      name: config.name || "",
      eco_entity:      config.eco_entity      || derive("switch", "acem"),
      clean_entity:    config.clean_entity    || derive("switch", "acec"),
      powerful_entity: config.powerful_entity || derive("switch", "acpm"),
      nanoe_entity:    config.nanoe_entity    || derive("switch", "acng"),
      display_entity:  config.display_entity  || derive("switch", "acdc"),
      buzzer_entity:   config.buzzer_entity   || derive("switch", "bzr"),
      v_swing_entity:  config.v_swing_entity  || derive("select", "v_swing"),
      h_swing_entity:  config.h_swing_entity  || derive("select", "h_swing"),
      converti_entity: config.converti_entity || derive("select", "converti"),
      room_temp_entity: config.room_temp_entity || "",
      energy_daily_entity:   config.energy_daily_entity   || derive("sensor", "energy_daily"),
      energy_weekly_entity:  config.energy_weekly_entity  || derive("sensor", "energy_weekly"),
      energy_monthly_entity: config.energy_monthly_entity || derive("sensor", "energy_monthly"),
      rssi_entity:     config.rssi_entity     || derive("sensor", "rssi"),
      show_energy: config.show_energy !== false,
      show_swing: config.show_swing !== false,
      show_extras: config.show_extras !== false,
    };
  }

  getCardSize() { return 6; }

  static getStubConfig() {
    return { entity: "climate.miraie_living_room" };
  }

  _getState(entityId) {
    return entityId && this.hass ? this.hass.states[entityId] : undefined;
  }

  _callService(domain, service, data) {
    this.hass.callService(domain, service, data);
  }

  _setClimateMode(mode) {
    this._callService("climate", "set_hvac_mode", { entity_id: this.config.entity, hvac_mode: mode });
  }

  _setTemp(temp) {
    this._callService("climate", "set_temperature", { entity_id: this.config.entity, temperature: temp });
  }

  _setFanMode(mode) {
    this._callService("climate", "set_fan_mode", { entity_id: this.config.entity, fan_mode: mode });
  }

  _toggleSwitch(entityId) {
    const state = this._getState(entityId);
    if (state) {
      this._callService("switch", state.state === "on" ? "turn_off" : "turn_on", { entity_id: entityId });
    }
  }

  _setSelect(entityId, option) {
    this._callService("select", "select_option", { entity_id: entityId, option });
  }

  _cycleFan(dir, fanMode) {
    const speeds = ["auto", "quiet", "low", "medium", "high"];
    const i = speeds.indexOf(fanMode);
    this._setFanMode(speeds[(i + dir + speeds.length) % speeds.length]);
  }

  _getModeColor(mode) {
    const colors = { cool: "#00bfff", heat: "#ff1493", auto: "#2fd1c5", dry: "#ff8c00", fan_only: "#87ceeb", off: "#616161" };
    return colors[mode] || "#616161";
  }

  _getModeIcon(mode) {
    const icons = { cool: "mdi:snowflake", heat: "mdi:fire", auto: "mdi:autorenew", dry: "mdi:water-percent", fan_only: "mdi:fan", off: "mdi:power" };
    return icons[mode] || "mdi:help-circle";
  }

  _getFanIcon(mode) {
    const icons = { auto: "mdi:fan-auto", quiet: "mdi:fan-speed-1", low: "mdi:fan-speed-1", medium: "mdi:fan-speed-2", high: "mdi:fan-speed-3" };
    return icons[mode] || "mdi:fan";
  }

  // Relative time — "Xs/m/h/d ago" from an ISO timestamp.
  _relativeTime(iso) {
    if (!iso) return "";
    const then = Date.parse(iso);
    if (Number.isNaN(then)) return "";
    const now = this._time || Date.now();
    const s = Math.max(0, Math.floor((now - then) / 1000));
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }

  // Map RSSI dBm → mdi:wifi-strength-* icon.
  _rssiIcon(rssi) {
    if (rssi == null || Number.isNaN(Number(rssi))) return "mdi:wifi-strength-outline";
    const r = Number(rssi);
    if (r >= -50) return "mdi:wifi-strength-4";
    if (r >= -60) return "mdi:wifi-strength-3";
    if (r >= -70) return "mdi:wifi-strength-2";
    if (r >= -80) return "mdi:wifi-strength-1";
    return "mdi:wifi-strength-outline";
  }

  // Inline SVG: AC vent bar + airflow ray(s). Horizontal swing rotates the whole thing -90°.
  _renderVentIcon(pos, isHorizontal) {
    const rootRot = isHorizontal ? -90 : 0;
    if (pos === "Auto") {
      return html`
        <svg viewBox="0 0 24 24" width="22" height="22" style="transform: rotate(${rootRot}deg)">
          <rect x="3" y="4" width="18" height="2" rx="1" fill="currentColor"/>
          <g stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.9">
            <line x1="12" y1="7" x2="12" y2="20" transform="rotate(-60 12 6)"/>
            <line x1="12" y1="7" x2="12" y2="20" transform="rotate(-30 12 6)"/>
            <line x1="12" y1="7" x2="12" y2="20"/>
            <line x1="12" y1="7" x2="12" y2="20" transform="rotate(30 12 6)"/>
            <line x1="12" y1="7" x2="12" y2="20" transform="rotate(60 12 6)"/>
          </g>
        </svg>
      `;
    }
    const n = parseInt(pos, 10);
    const angle = -60 + (n - 1) * 30; // 1→-60, 2→-30, 3→0, 4→30, 5→60
    return html`
      <svg viewBox="0 0 24 24" width="22" height="22" style="transform: rotate(${rootRot}deg)">
        <rect x="3" y="4" width="18" height="2" rx="1" fill="currentColor"/>
        <g transform="rotate(${angle} 12 6)" stroke="currentColor" stroke-linecap="round">
          <line x1="8"  y1="8" x2="8"  y2="20" stroke-width="1.3" opacity="0.6"/>
          <line x1="12" y1="8" x2="12" y2="22" stroke-width="1.8" opacity="1"/>
          <line x1="16" y1="8" x2="16" y2="20" stroke-width="1.3" opacity="0.6"/>
        </g>
      </svg>
    `;
  }

  _renderDial(currentTemp, targetTemp, modeColor, isOff, mode, fanMode, isUnavailable = false) {
    // Geometry — ported from card/sandbox/dial.html (LVGL-accurate layout).
    const minTemp = 16, maxTemp = 30, cx = 140, cy = 140, viewBox = 280;
    const dialMinTemp = 16, dialMaxTemp = 34;  // visual scale; drag still clamps to maxTemp
    const startA = 210, endA = 510, totalA = endA - startA;  // 300° sweep, gap at 6 o'clock
    const tickCount = 80;
    const tickInnerR = 103, tickOuterR = 129, tickW = 2;  // length 26
    const handleR = (tickInnerR + tickOuterR) / 2;
    const dimTickColor = "#6b7280";
    const needleColor = "#ffffff";  // white — punchiest contrast against arc + ticks

    const dialSpan = dialMaxTemp - dialMinTemp;
    const pct = isOff ? 0 : Math.max(0, Math.min(1, (targetTemp - dialMinTemp) / dialSpan));
    const valAngle = startA + pct * totalA;

    const curPct = currentTemp != null
      ? Math.max(0, Math.min(1, (currentTemp - dialMinTemp) / dialSpan))
      : null;
    const curAngle = curPct != null ? startA + curPct * totalA : startA;

    const p2c = (a, rad) => {
      const d = ((a - 90) * Math.PI) / 180;
      return { x: cx + rad * Math.cos(d), y: cy + rad * Math.sin(d) };
    };
    const arcPath = (a1, a2, r) => {
      const p1 = p2c(a1, r), p2 = p2c(a2, r);
      const largeArc = (a2 - a1) > 180 ? 1 : 0;
      return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y}`;
    };

    const ticks = [];
    for (let i = 0; i < tickCount; i++) {
      const t = i / (tickCount - 1);
      const a = startA + t * totalA;
      const p1 = p2c(a, tickInnerR);
      const p2 = p2c(a, tickOuterR);
      ticks.push({ p1, p2, lit: !isOff && t <= pct });
    }
    this._ticks = ticks;
    this._tickStyle = { modeColor, dimTickColor, tickW };

    const handle = p2c(valAngle, handleR);
    const needleA = curAngle != null ? p2c(curAngle, 141) : null;  // outer edge of arc
    const needleB = curAngle != null ? p2c(curAngle, tickInnerR - 2) : null;
    // Stash for updated() — native SVG elements need createElementNS to render.
    this._handleState = { handle, modeColor, visible: !isOff };
    this._needleState = { needleA, needleB, needleColor, visible: !isOff && needleA && needleB };

    const arcR = 136;
    const coolArcPath = isOff || curAngle == null
      ? arcPath(startA, endA, arcR)
      : arcPath(startA, curAngle, arcR);
    const warmArcPath = isOff || curAngle == null ? "" : arcPath(curAngle, endA, arcR);
    const rimPath = arcPath(startA, endA, 139);

    // Drag flow: during drag we update _dragTargetTemp and re-render locally so the
    // handle follows the finger smoothly. The actual service call (which echoes back
    // and would cause jumps) only fires on drag-end. This gives native-feeling drag
    // and dispatches exactly ONE command to the device per gesture.
    const computeSnapped = (e) => {
      const svg = this.shadowRoot.querySelector(".dial-svg");
      if (!svg) return null;
      if (e.cancelable && e.type && e.type.startsWith("touch")) e.preventDefault();
      const rect = svg.getBoundingClientRect();
      if (rect.width <= 0) return null;
      const scale = viewBox / rect.width;
      const pt = e.touches ? e.touches[0] : e;
      if (!pt) return null;
      const px = (pt.clientX - rect.left) * scale;
      const py = (pt.clientY - rect.top) * scale;
      let a = (Math.atan2(py - cy, px - cx) * 180) / Math.PI + 90;
      if (a < 0) a += 360;
      if (a < endA - 360) a += 360;
      if (a < startA - 15 || a > endA + 15) return null;
      const p = Math.max(0, Math.min(1, (a - startA) / totalA));
      const raw = dialMinTemp + p * dialSpan;
      const clamped = Math.min(maxTemp, Math.max(minTemp, raw));
      return Math.round(clamped * 2) / 2;
    };
    const drag = (e) => {
      const snapped = computeSnapped(e);
      if (snapped == null) return;
      if (snapped !== this._dragTargetTemp) {
        this._dragTargetTemp = snapped;
        this.requestUpdate();
      }
    };
    // Only start drag when the initial click lands on (or very close to) the handle.
    // Radius of ~22px in SVG coords ≈ finger-friendly hit area around the knob.
    const isOnHandle = (e) => {
      const svg = this.shadowRoot.querySelector(".dial-svg");
      if (!svg) return false;
      const rect = svg.getBoundingClientRect();
      if (rect.width <= 0) return false;
      const scale = viewBox / rect.width;
      const pt = e.touches ? e.touches[0] : e;
      if (!pt) return false;
      const px = (pt.clientX - rect.left) * scale;
      const py = (pt.clientY - rect.top) * scale;
      const dx = px - handle.x, dy = py - handle.y;
      return Math.sqrt(dx * dx + dy * dy) <= 22;
    };

    const startDrag = (e) => {
      if (isOff) return;
      if (!isOnHandle(e)) return;
      e.preventDefault();
      const initial = computeSnapped(e);
      if (initial != null) {
        this._dragTargetTemp = initial;
        this.requestUpdate();
      }
      const mv = (ev) => drag(ev);
      const up = () => {
        window.removeEventListener("mousemove", mv);
        window.removeEventListener("mouseup", up);
        window.removeEventListener("touchmove", mv);
        window.removeEventListener("touchend", up);
        if (this._dragTargetTemp != null) {
          const v = this._dragTargetTemp;
          this._setTemp(v);
          // Keep the drag value pinned for ~2s so the handle doesn't visibly snap
          // back to the stale entity state while HA/MQTT round-trips the new value.
          if (this._dragHoldTimer) clearTimeout(this._dragHoldTimer);
          this._dragHoldTimer = setTimeout(() => {
            this._dragTargetTemp = null;
            this._dragHoldTimer = null;
            this.requestUpdate();
          }, 2000);
        }
      };
      window.addEventListener("mousemove", mv);
      window.addEventListener("mouseup", up);
      window.addEventListener("touchmove", mv, { passive: false });
      window.addEventListener("touchend", up);
    };

    const modeLabel = mode === "fan_only" ? "Fan" : isOff ? "Off" : mode.charAt(0).toUpperCase() + mode.slice(1);
    const fanLabel = fanMode ? fanMode.toUpperCase() : "";

    return html`
      <div class="dial-container" style="--mode-color: ${modeColor}">
        <svg class="dial-svg" viewBox="0 0 ${viewBox} ${viewBox}"
          @mousedown=${startDrag} @touchstart=${startDrag}>
          <defs>
            <!-- Outer halo radial gradient — concentrated between 82%(r=131) and 100%(r=158) -->
            <radialGradient id="kpr-halo-grad" cx="50%" cy="50%" r="50%">
              <stop offset="82%" stop-color="${modeColor}" stop-opacity="0"/>
              <stop offset="86%" stop-color="${modeColor}" stop-opacity="0.45"/>
              <stop offset="91%" stop-color="${modeColor}" stop-opacity="0.22"/>
              <stop offset="94%" stop-color="${modeColor}" stop-opacity="0.08"/>
              <stop offset="100%" stop-color="${modeColor}" stop-opacity="0"/>
            </radialGradient>
          </defs>

          <!-- Layer 0: Animated halo (soft pulsing glow — tracks mode color) -->
          <circle cx="${cx}" cy="${cy}" r="158" fill="url(#kpr-halo-grad)"
            class="halo-pulse" style="${isOff ? "display:none" : ""}"/>

          <!-- Layer 1: Dark face extending under the full arc -->
          <circle cx="${cx}" cy="${cy}" r="136" fill="#0a0f18"/>

          <!-- Layer 1b: Thick track — full circle so color is uniform across bottom gap -->
          <circle cx="${cx}" cy="${cy}" r="108" fill="none" stroke="#0c1118" stroke-width="46"/>

          <!-- Layer 2a: Outer arc cool segment (startA → needle angle) -->
          <path d="${coolArcPath}" fill="none" stroke="#3a4658" stroke-width="10"
            stroke-linecap="butt" opacity="${isOff ? 0.5 : 0.95}"/>
          <!-- Layer 2b: Outer arc warm segment (needle → endA, "hotter than room" zone) -->
          <path d="${warmArcPath}" fill="none" stroke="#ff6b35" stroke-width="10"
            stroke-linecap="butt" opacity="${isOff ? 0 : 0.75}"/>
          <!-- Layer 3: Thin bright rim along outer edge of arc (full sweep) -->
          <path d="${rimPath}" fill="none" stroke="#8d9bb0" stroke-width="1"
            stroke-linecap="butt" opacity="0.6"/>

          <!-- Tick groups — populated in updated() via createElementNS (SVG namespace) -->
          <g class="tick-group-bg"></g>
          <g class="tick-group-glow"></g>
          <g class="tick-group-lit"></g>

          <!-- Room-temp needle — populated in updated() via createElementNS -->
          <g class="needle-group"></g>

          <!-- Inner text face (bg circle for temp/room/mode text) -->
          <circle cx="${cx}" cy="${cy}" r="95" fill="#05080d"/>

          <!-- Handle — populated in updated() via createElementNS -->
          <g class="handle-group"></g>
        </svg>

        <!-- Falling snowflakes (populated in updated() once, toggled by 'active' class) -->
        <div class="particles ${!isOff && mode === "cool" ? "active" : ""}"></div>

        <!-- Center text stack -->
        <div class="dial-center">
          ${isUnavailable ? html`
            <div class="mode-row">
              <ha-icon class="mode-icon" icon="mdi:wifi-off" style="color: #8a8f9a"></ha-icon>
              <span class="mode-label" style="color: #8a8f9a">Offline</span>
            </div>
            <div class="dial-unavailable">Device unavailable</div>
          ` : html`
            ${(() => {
              const boost = this._getState(this.config.powerful_entity);
              return !isOff && boost && boost.state === "on" ? html`
                <div class="boost-badge" title="Boost active">
                  <ha-icon icon="mdi:rocket-launch"></ha-icon>
                  <span>BOOST</span>
                </div>
              ` : "";
            })()}
            <div class="mode-row">
              <ha-icon class="mode-icon"
                icon="${this._getModeIcon(mode)}"
                style="color: ${isOff ? "#616161" : modeColor}"></ha-icon>
              <span class="mode-label"
                style="color: ${isOff ? "#616161" : modeColor}">${modeLabel}</span>
            </div>
            <div class="dial-temp">${
              isOff
                ? (currentTemp != null ? Number(currentTemp).toFixed(1) : "--")
                : (targetTemp != null ? Number(targetTemp).toFixed(1) : "--")
            }<span class="unit">°C</span></div>
            ${!isOff ? html`
              <div class="room-temp">
                <span class="room-val-wrap">${currentTemp != null ? Number(currentTemp).toFixed(1) : "--"}°C</span>
              </div>
            ` : html`<div class="room-temp">Powered Off</div>`}
          `}
          <div class="brand">KPR</div>
        </div>

        <!-- Fan speed label — sits inside the 60° bottom gap of the tick ring -->
        ${!isOff ? html`
          <div class="fan-gap-label">
            <span class="fan-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="1.4em" height="1.4em" fill="currentColor">
                <path d="M12 11a1 1 0 0 0-1 1 1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-1-1m.5-9C17 2 17.11 5.57 14.75 6.75c-.99.49-1.43 1.54-1.62 2.47.48.2.9.51 1.22.91 3.7-2 7.68-1.21 7.68 2.37 0 4.5-3.57 4.6-4.75 2.23-.5-.99-1.56-1.43-2.49-1.62-.2.48-.51.89-.92 1.23C15.87 18.04 15.08 22 11.5 22c-4.5 0-4.59-3.58-2.23-4.76.98-.49 1.42-1.53 1.62-2.45-.49-.2-.92-.52-1.24-.92C5.95 15.87 2 15.08 2 11.5 2 7 5.56 6.91 6.74 9.27c.5.98 1.55 1.42 2.48 1.61.19-.48.51-.91.92-1.23C8.14 5.95 8.93 2 12.5 2Z"/>
              </svg>
            </span>
            <span>${fanLabel}</span>
          </div>
        ` : ""}
      </div>
    `;
  }

  render() {
    if (!this.hass || !this.config) return html``;

    const stateObj = this._getState(this.config.entity);
    if (!stateObj) return html`<ha-card>Entity not found: ${this.config.entity}</ha-card>`;

    const mode = stateObj.state;
    const currentTemp = stateObj.attributes.current_temperature;
    const targetTemp = stateObj.attributes.temperature;
    const fanMode = stateObj.attributes.fan_mode || "auto";
    const isUnavailable = mode === "unavailable" || mode === "unknown" || stateObj.state === "unavailable";
    const modeColor = isUnavailable ? "#616161" : this._getModeColor(mode);
    const isOff = mode === "off" || isUnavailable;

    const energyDaily = this._getState(this.config.energy_daily_entity);
    const energyWeekly = this._getState(this.config.energy_weekly_entity);
    const energyMonthly = this._getState(this.config.energy_monthly_entity);
    const hasEnergy = energyDaily || energyWeekly || energyMonthly;

    const eco = this._getState(this.config.eco_entity);
    const clean = this._getState(this.config.clean_entity);
    const powerful = this._getState(this.config.powerful_entity);
    const nanoe = this._getState(this.config.nanoe_entity);
    const display = this._getState(this.config.display_entity);
    const buzzer = this._getState(this.config.buzzer_entity);

    const vSwing = this._getState(this.config.v_swing_entity);
    const hSwing = this._getState(this.config.h_swing_entity);
    const converti = this._getState(this.config.converti_entity);

    const fanLabel = fanMode.charAt(0).toUpperCase() + fanMode.slice(1);

    const primaryModes = [
      { key: "off",  icon: "mdi:power",    label: "Off"  },
      { key: "cool", icon: "mdi:snowflake",label: "Cool" },
      { key: "auto", icon: "mdi:autorenew",label: "Auto" },
    ];
    const extraModes = [
      { key: "heat",     icon: "mdi:fire",           label: "Heat" },
      { key: "fan_only", icon: "mdi:fan",            label: "Fan"  },
      { key: "dry",      icon: "mdi:water-percent",  label: "Dry"  },
    ];
    const moreActive = extraModes.some((m) => m.key === mode);

    const cardName = this.config.name || stateObj.attributes.friendly_name || "";

    return html`
      <ha-card style="--mode-color: ${modeColor}">

        ${cardName ? html`
          <div class="card-header">
            <div class="card-title">${cardName}</div>
            <div class="card-meta">
              <span class="status-dot ${isUnavailable ? "offline" : "online"}"></span>
              <span class="last-seen">${this._relativeTime(stateObj.last_changed || stateObj.last_updated)}</span>
              <ha-icon class="wifi" icon="${this._rssiIcon((this._getState(this.config.rssi_entity) || {}).state ?? stateObj.attributes.rssi)}"
                title="RSSI: ${(this._getState(this.config.rssi_entity) || {}).state ?? "n/a"} dBm"></ha-icon>
            </div>
          </div>
        ` : ""}

        <!-- Main 3-column: temp controls | dial | fan controls -->
        <div class="main-area">

          <!-- Left: temperature +/- -->
          <div class="side-controls">
            ${!isOff ? html`
              <button class="side-btn" @click=${() => this._setTemp((targetTemp || 24) + 0.5)}>
                <ha-icon icon="mdi:plus" style="--mdc-icon-size: 20px"></ha-icon>
              </button>
              <ha-icon icon="mdi:thermometer"
                style="--mdc-icon-size: 32px; color: #ff5722; filter: drop-shadow(0 0 8px #ff5722aa)"></ha-icon>
              <button class="side-btn" @click=${() => this._setTemp((targetTemp || 24) - 0.5)}>
                <ha-icon icon="mdi:minus" style="--mdc-icon-size: 20px"></ha-icon>
              </button>
            ` : html`<div class="side-placeholder"></div>`}
          </div>

          ${this._renderDial(currentTemp, this._dragTargetTemp ?? targetTemp, modeColor, isOff, mode, fanMode, isUnavailable)}

          <!-- Right: fan speed up/down -->
          <div class="side-controls">
            ${!isOff ? html`
              <button class="side-btn" @click=${() => this._cycleFan(1, fanMode)}>
                <ha-icon icon="mdi:chevron-up" style="--mdc-icon-size: 20px"></ha-icon>
              </button>
              <ha-icon icon="${this._getFanIcon(fanMode)}"
                style="--mdc-icon-size: 24px; color: var(--mode-color)"></ha-icon>
              <button class="side-btn" @click=${() => this._cycleFan(-1, fanMode)}>
                <ha-icon icon="mdi:chevron-down" style="--mdc-icon-size: 20px"></ha-icon>
              </button>
            ` : html`<div class="side-placeholder"></div>`}
          </div>

        </div>

        <!-- Pill row: Energy | V-Swing | H-Swing | Converti | Features -->
        ${(() => {
          const pills = [];
          const openPill = (key) => (e) => {
            e.stopPropagation();
            const cur = this[key];
            this._closeAllPopups();
            this[key] = !cur;
          };
          if (this.config.show_energy && hasEnergy) {
            const primary = energyDaily || energyMonthly || energyWeekly;
            pills.push(html`
              <button class="pill ${this._expandEnergy ? "active" : ""}" @click=${openPill("_expandEnergy")}
                title="Energy usage">
                <ha-icon icon="mdi:calendar-today" style="color: #FFC107"></ha-icon>
                <span class="pill-val">${primary.state} kWh</span>
              </button>
            `);
          }
          if (!isOff && this.config.show_swing && vSwing) {
            pills.push(html`
              <button class="pill pill-swing ${this._expandVSwing ? "active" : ""}" @click=${openPill("_expandVSwing")} title="Vertical Swing">
                <ha-icon icon="mdi:arrow-up-down"></ha-icon>
                <span class="pill-swing-mini">${this._renderVentIcon(vSwing.state, false)}</span>
              </button>
            `);
          }
          if (!isOff && this.config.show_swing && hSwing) {
            pills.push(html`
              <button class="pill pill-swing ${this._expandHSwing ? "active" : ""}" @click=${openPill("_expandHSwing")} title="Horizontal Swing">
                <ha-icon icon="mdi:arrow-left-right"></ha-icon>
                <span class="pill-swing-mini">${this._renderVentIcon(hSwing.state, true)}</span>
              </button>
            `);
          }
          if (!isOff && this.config.show_swing && converti) {
            const convertiLabel = { "0": "Off", "100": "FC", "110": "HC" }[converti.state] || `${converti.state}%`;
            const convertiOn = converti.state !== "0" && converti.state !== "unavailable" && converti.state !== "unknown";
            pills.push(html`
              <button class="pill ${this._expandConverti ? "active" : ""} ${convertiOn ? "pill-engaged" : ""}"
                @click=${openPill("_expandConverti")} title="Converti8">
                <ha-icon icon="mdi:percent"></ha-icon>
                <span class="pill-val">${convertiLabel}</span>
              </button>
            `);
          }
          if (!isOff && this.config.show_extras) {
            pills.push(html`
              <button class="pill pill-icon ${this._expandFeatures ? "active" : ""}"
                @click=${openPill("_expandFeatures")} title="Features">
                <ha-icon icon="mdi:tune-variant"></ha-icon>
              </button>
            `);
          }
          return pills.length ? html`<div class="pill-row">${pills}</div>` : "";
        })()}

        <!-- Mode bar -->
        <div class="mode-bar-wrap">
          <div class="mode-bar">
            ${primaryModes.map((m, idx) => html`
              ${idx > 0 ? html`<div class="mbar-sep"></div>` : ""}
              <button
                class="mbar-btn ${mode === m.key ? "active" : ""}"
                style="--btn-color: ${this._getModeColor(m.key)}"
                @click=${() => this._setClimateMode(m.key)}>
                <ha-icon icon="${m.icon}" style="--mdc-icon-size: 18px"></ha-icon>
                <span>${m.label}</span>
              </button>
            `)}
            <div class="mbar-sep"></div>
            <button class="mbar-btn ${moreActive || this._showMoreModes ? "active" : ""}"
              style="--btn-color: ${moreActive ? this._getModeColor(mode) : "rgba(255,255,255,0.14)"}"
              @click=${(e) => { e.stopPropagation(); this._showMoreModes = !this._showMoreModes; }}>
              <ha-icon icon="${this._showMoreModes ? "mdi:close" : "mdi:dots-horizontal"}" style="--mdc-icon-size: 18px"></ha-icon>
            </button>
          </div>

          ${this._showMoreModes ? html`
            <div class="mode-backdrop" @click=${() => { this._showMoreModes = false; }}></div>
            <div class="mode-popup" @click=${(e) => e.stopPropagation()}>
              ${extraModes.map((m) => html`
                <button
                  class="popup-btn ${mode === m.key ? "active" : ""}"
                  style="--btn-color: ${this._getModeColor(m.key)}"
                  @click=${() => { this._setClimateMode(m.key); this._showMoreModes = false; }}>
                  <ha-icon icon="${m.icon}" style="--mdc-icon-size: 22px"></ha-icon>
                  <span>${m.label}</span>
                </button>
              `)}
            </div>
          ` : ""}
        </div>

        <!-- Energy popup -->
        ${this._expandEnergy && hasEnergy ? html`
          <div class="popup-backdrop" @click=${() => { this._expandEnergy = false; }}></div>
          <div class="detail-popup" @click=${(e) => e.stopPropagation()}>
            <div class="popup-title">Energy Usage</div>
            <div class="energy-grid">
              <div class="energy-cell">
                <ha-icon icon="mdi:calendar-today"></ha-icon>
                <div class="energy-val">${energyDaily ? energyDaily.state : "—"}<span class="energy-unit"> kWh</span></div>
                <div class="energy-lbl">Today</div>
              </div>
              <div class="energy-cell">
                <ha-icon icon="mdi:calendar-week"></ha-icon>
                <div class="energy-val">${energyWeekly ? energyWeekly.state : "—"}<span class="energy-unit"> kWh</span></div>
                <div class="energy-lbl">Week</div>
              </div>
              <div class="energy-cell">
                <ha-icon icon="mdi:calendar-month"></ha-icon>
                <div class="energy-val">${energyMonthly ? energyMonthly.state : "—"}<span class="energy-unit"> kWh</span></div>
                <div class="energy-lbl">Month</div>
              </div>
            </div>
          </div>
        ` : ""}

        <!-- Vertical Swing popup -->
        ${!isOff && this._expandVSwing && vSwing ? html`
          <div class="popup-backdrop" @click=${() => { this._expandVSwing = false; }}></div>
          <div class="detail-popup" @click=${(e) => e.stopPropagation()}>
            <div class="popup-title">Vertical Swing</div>
            <div class="popup-row">
              <ha-icon icon="mdi:arrow-up-down"></ha-icon>
              <span class="popup-lbl">Angle</span>
              <div class="seg-group">
                ${["Auto", "1", "2", "3", "4", "5"].map((o) => html`
                  <button class="seg ${vSwing.state === o ? "active" : ""}" title="${o}"
                    @click=${() => this._setSelect(this.config.v_swing_entity, o)}>
                    ${this._renderVentIcon(o, false)}
                  </button>
                `)}
              </div>
            </div>
          </div>
        ` : ""}

        <!-- Horizontal Swing popup -->
        ${!isOff && this._expandHSwing && hSwing ? html`
          <div class="popup-backdrop" @click=${() => { this._expandHSwing = false; }}></div>
          <div class="detail-popup" @click=${(e) => e.stopPropagation()}>
            <div class="popup-title">Horizontal Swing</div>
            <div class="popup-row">
              <ha-icon icon="mdi:arrow-left-right"></ha-icon>
              <span class="popup-lbl">Angle</span>
              <div class="seg-group">
                ${["Auto", "1", "2", "3", "4", "5"].map((o) => html`
                  <button class="seg ${hSwing.state === o ? "active" : ""}" title="${o}"
                    @click=${() => this._setSelect(this.config.h_swing_entity, o)}>
                    ${this._renderVentIcon(o, true)}
                  </button>
                `)}
              </div>
            </div>
          </div>
        ` : ""}

        <!-- Converti popup -->
        ${!isOff && this._expandConverti && converti ? html`
          <div class="popup-backdrop" @click=${() => { this._expandConverti = false; }}></div>
          <div class="detail-popup" @click=${(e) => e.stopPropagation()}>
            <div class="popup-title">Converti8 · Cooling Performance</div>
            <div class="popup-row popup-row-wrap">
              <ha-icon icon="mdi:percent"></ha-icon>
              <span class="popup-lbl">Level</span>
              <div class="seg-group seg-group-grid">
                ${[
                  { v: "0",   l: "Off" },
                  { v: "40",  l: "40%" },
                  { v: "50",  l: "50%" },
                  { v: "60",  l: "60%" },
                  { v: "70",  l: "70%" },
                  { v: "80",  l: "80%" },
                  { v: "90",  l: "90%" },
                  { v: "100", l: "FC"  },
                  { v: "110", l: "HC"  },
                ].map((o) => html`
                  <button class="seg ${converti.state === o.v ? "active" : ""}" title="${o.l}"
                    @click=${() => this._setSelect(this.config.converti_entity, o.v)}>${o.l}</button>
                `)}
              </div>
            </div>
          </div>
        ` : ""}

        <!-- Features popup -->
        ${!isOff && this._expandFeatures && this.config.show_extras ? html`
          <div class="popup-backdrop" @click=${() => { this._expandFeatures = false; }}></div>
          <div class="detail-popup" @click=${(e) => e.stopPropagation()}>
            <div class="popup-title">Features</div>
            <div class="toggle-row">
              ${eco ? html`<button class="toggle-btn ${eco.state === "on" ? "active" : ""}" @click=${() => this._toggleSwitch(this.config.eco_entity)}><ha-icon icon="mdi:leaf"></ha-icon><span>Eco</span></button>` : ""}
              ${clean ? html`<button class="toggle-btn ${clean.state === "on" ? "active" : ""}" @click=${() => this._toggleSwitch(this.config.clean_entity)}><ha-icon icon="mdi:broom"></ha-icon><span>Clean</span></button>` : ""}
              ${powerful ? html`<button class="toggle-btn ${powerful.state === "on" ? "active" : ""}" @click=${() => this._toggleSwitch(this.config.powerful_entity)}><ha-icon icon="mdi:rocket-launch"></ha-icon><span>Boost</span></button>` : ""}
              ${nanoe ? html`<button class="toggle-btn ${nanoe.state === "on" ? "active" : ""}" @click=${() => this._toggleSwitch(this.config.nanoe_entity)}><ha-icon icon="mdi:air-purifier"></ha-icon><span>Nanoe</span></button>` : ""}
              ${display ? html`<button class="toggle-btn ${display.state === "on" ? "active" : ""}" @click=${() => this._toggleSwitch(this.config.display_entity)}><ha-icon icon="mdi:monitor"></ha-icon><span>Display</span></button>` : ""}
              ${buzzer ? html`<button class="toggle-btn ${buzzer.state === "on" ? "active" : ""}" @click=${() => this._toggleSwitch(this.config.buzzer_entity)}><ha-icon icon="mdi:volume-high"></ha-icon><span>Buzzer</span></button>` : ""}
            </div>
          </div>
        ` : ""}

      </ha-card>
    `;
  }

  static get styles() {
    return css`
      :host {
        --text-primary: var(--primary-text-color, #fff);
        --text-secondary: var(--secondary-text-color, #888);
        --btn-bg: rgba(255, 255, 255, 0.07);
        --btn-hover: rgba(255, 255, 255, 0.14);
      }

      @keyframes spin-fan {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes fade-in {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      ha-card {
        background: #141824;
        border-radius: 20px;
        overflow: hidden;
        animation: fade-in 0.4s ease;
        position: relative;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 20px 0;
        gap: 10px;
      }
      .card-title {
        font-size: 15px;
        font-weight: 600;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: var(--text-primary);
      }
      .card-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--text-secondary);
      }
      .card-meta .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        display: inline-block;
      }
      .card-meta .status-dot.online {
        background: #2ecc71;
        box-shadow: 0 0 6px #2ecc71aa;
      }
      .card-meta .status-dot.offline {
        background: #e74c3c;
        box-shadow: 0 0 6px #e74c3caa;
      }
      .card-meta .last-seen { white-space: nowrap; }
      .card-meta .wifi { --mdc-icon-size: 16px; color: var(--text-secondary); }

      /* Main 3-column area — wider gap so side controls breathe away from the dial */
      .main-area {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 10px 20px 4px;
      }
      .side-controls {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        width: 52px;
        flex-shrink: 0;
      }
      .side-placeholder {
        width: 42px;
      }
      .side-btn {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(255, 255, 255, 0.07);
        color: var(--text-primary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      .side-btn:hover {
        background: rgba(255, 255, 255, 0.14);
        border-color: rgba(255, 255, 255, 0.24);
        transform: scale(1.08);
      }
      .side-btn:active { transform: scale(0.94); }

      /* Dial — ported from sandbox/dial.html
         Responsive: shrinks to fit narrow viewports while keeping 1:1 aspect ratio.
         Uses container queries so inner text scales with the dial width.
         1cqw = 1% of dial-container width (at 280px: 1cqw = 2.8px). */
      .dial-container {
        position: relative;
        width: 100%;
        max-width: 280px;
        aspect-ratio: 1 / 1;
        flex-shrink: 1;
        min-width: 180px;
        container-type: inline-size;
      }
      .dial-svg {
        width: 100%;
        height: 100%;
        display: block;
        overflow: visible;  /* let halo/shadow extend past the SVG viewBox */
        cursor: pointer;
      }
      .dial-center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        pointer-events: none;
        gap: 0;
      }
      .mode-row {
        display: flex;
        align-items: center;
        gap: 3.6cqw;
        margin-bottom: 2.1cqw;
      }
      .boost-badge {
        display: inline-flex;
        align-items: center;
        gap: 1.4cqw;
        padding: 0.7cqw 2.1cqw;
        margin-bottom: 1.4cqw;
        background: linear-gradient(135deg, #ff5722, #ff9800);
        color: #fff;
        font-size: 3.6cqw;
        font-weight: 700;
        letter-spacing: 0.5px;
        border-radius: 999px;
        box-shadow: 0 0 10px #ff572266;
        animation: boost-pulse 2s ease-in-out infinite;
      }
      .boost-badge ha-icon { --mdc-icon-size: 4.3cqw; }
      @keyframes boost-pulse {
        0%, 100% { box-shadow: 0 0 10px #ff572266; }
        50%      { box-shadow: 0 0 18px #ff5722cc; }
      }
      .mode-row .mode-icon {
        --mdc-icon-size: 9.3cqw;
        line-height: 1;
      }
      .mode-row .mode-label {
        font-size: 7.1cqw;
        font-weight: 600;
        letter-spacing: 2px;
        text-transform: uppercase;
        line-height: 1;
        display: inline;
        margin: 0;
        gap: 0;
      }
      .dial-temp {
        position: relative;
        font-size: 24.3cqw;
        font-weight: 600;
        letter-spacing: -1px;
        line-height: 1;
        color: var(--text-primary);
        padding-left: 7.8cqw;
        padding-right: 7.8cqw;
      }
      .dial-temp .unit {
        position: absolute;
        top: 2.1cqw;
        right: 0;
        font-size: 7.8cqw;
        color: var(--text-secondary);
      }
      .room-temp {
        font-size: 8.6cqw;
        color: var(--text-secondary);
        margin-top: -2.8cqw;
      }
      .room-temp .room-val-wrap { color: #35ffe6; font-weight: 500; }
      .dial-unavailable {
        font-size: 14px;
        color: var(--text-secondary);
        margin-top: 12px;
        letter-spacing: 0.5px;
      }
      .brand {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: 18.5cqw;
        font-size: 6.4cqw;
        font-weight: 700;
        letter-spacing: 2.1cqw;
        color: #0e1420;
      }
      .fan-gap-label {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: 6.4cqw;
        display: flex;
        align-items: center;
        gap: 2.9cqw;
        font-size: 6.1cqw;
        font-weight: 700;
        letter-spacing: 1px;
        color: var(--text-primary);
        line-height: 1;
        pointer-events: none;
      }
      .fan-gap-label .fan-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
        animation: spin-fan 2.4s linear infinite;
      }
      .fan-gap-label .fan-icon svg { display: block; }

      /* Halo pulse */
      @keyframes halo-pulse {
        0%   { opacity: 0.35; transform: scale(0.96); }
        50%  { opacity: 0.9;  transform: scale(1.04); }
        100% { opacity: 0.35; transform: scale(0.96); }
      }
      .halo-pulse {
        transform-box: fill-box;
        transform-origin: center;
        animation: halo-pulse 2.8s ease-in-out infinite;
      }

      /* Falling snowflakes — visible only in cool mode */
      .particles {
        position: absolute;
        inset: 40px;
        pointer-events: none;
        overflow: hidden;
        border-radius: 50%;
        opacity: 0;
        transition: opacity 400ms ease;
      }
      .particles.active { opacity: 1; }
      .snowflake {
        position: absolute;
        top: -20px;
        color: #9cd8ff;
        opacity: 0;
        will-change: transform, opacity;
        filter: drop-shadow(0 0 4px #00bfff);
        animation: flake-fall var(--fall-dur, 7s) linear infinite;
        animation-delay: var(--fall-delay, 0s);
      }
      .snowflake > .sway {
        display: inline-block;
        animation: flake-sway var(--sway-dur, 3s) ease-in-out infinite alternate;
        animation-delay: var(--sway-delay, 0s);
      }
      .snowflake > .sway > .spin {
        display: inline-block;
        animation: flake-spin var(--spin-dur, 6s) linear infinite;
      }
      @keyframes flake-fall {
        0%   { transform: translate3d(0, 0, 0);     opacity: 0; }
        8%   { opacity: 0.95; }
        92%  { opacity: 0.95; }
        100% { transform: translate3d(0, 260px, 0); opacity: 0; }
      }
      @keyframes flake-sway {
        0%   { transform: translateX(calc(var(--sway-amp, 15px) * -1)); }
        100% { transform: translateX(var(--sway-amp, 15px)); }
      }
      @keyframes flake-spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(var(--spin-amount, 360deg)); }
      }

      /* Mode bar */
      .mode-bar-wrap {
        position: relative;
        margin: 4px 16px 8px;
      }
      .mode-bar {
        display: flex;
        align-items: center;
        background: rgba(0, 0, 0, 0.3);
        border-radius: 14px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.06);
        /* Soft drop shadow lifts the bar off the card surface */
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45), 0 1px 0 rgba(255, 255, 255, 0.04) inset;
      }
      .mode-backdrop {
        position: fixed;
        inset: 0;
        z-index: 9;
      }
      .mode-popup {
        position: absolute;
        right: 0;
        bottom: calc(100% + 6px);
        display: grid;
        grid-auto-flow: column;
        gap: 4px;
        padding: 8px;
        background: #111a2a;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.55);
        z-index: 10;
        animation: fade-in 140ms ease-out;
      }
      .popup-btn {
        min-width: 72px;
        padding: 10px 12px;
        border: 1px solid rgba(255, 255, 255, 0.06);
        background: rgba(255, 255, 255, 0.04);
        color: #aaa;
        border-radius: 10px;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        transition: all 0.2s ease;
      }
      .popup-btn span { font-size: 11px; letter-spacing: 0.5px; }
      .popup-btn:hover { background: rgba(255, 255, 255, 0.08); color: #ddd; }
      .popup-btn.active {
        background: var(--btn-color);
        color: #fff;
        border-color: transparent;
        box-shadow: 0 0 18px var(--btn-color)88;
      }
      .mbar-btn {
        flex: 1;
        padding: 11px 2px;
        border: none;
        background: transparent;
        color: #e6e9f0;  /* near-white inactive text for strong contrast */
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
        transition: all 0.25s ease;
        min-width: 0;
      }
      .mbar-btn span { font-size: 10px; white-space: nowrap; font-weight: 500; }
      .mbar-btn:hover { background: rgba(255, 255, 255, 0.08); color: #fff; }
      .mbar-btn.active {
        background: var(--btn-color);
        color: #06121c;                 /* dark text on bright mode color — AA contrast */
        font-weight: 700;
        /* Removed: was leaking a blue glow below the bar. Active bg color + dark text
           already provides enough visual hierarchy. */
      }
      .mbar-btn.active ha-icon { color: #06121c; }
      .mbar-btn.active span { font-weight: 700; }
      .mbar-btn.more-active { color: #cfd4dc; }
      .mbar-sep {
        width: 1px;
        height: 34px;
        background: rgba(255, 255, 255, 0.07);
        flex-shrink: 0;
      }

      /* Pill row */
      .pill-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 4px 16px 8px;
        justify-content: center;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.08);
        color: var(--text-primary);
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .pill.pill-static { cursor: default; }
      .pill ha-icon { --mdc-icon-size: 16px; color: var(--text-secondary); }
      .pill:hover:not(.pill-static) {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(255, 255, 255, 0.18);
      }
      .pill.active {
        background: rgba(81, 160, 228, 0.22);
        border-color: rgba(81, 160, 228, 0.55);
        color: #fff;
      }
      .pill.active ha-icon { color: #90CAF9; }
      /* Engaged state: pill background tinted when the underlying feature is on
         (e.g. Converti non-Off). Distinct from .active (which means popup open). */
      .pill.pill-engaged {
        background: rgba(255, 165, 0, 0.18);
        border-color: rgba(255, 165, 0, 0.55);
        color: #ffcf8a;
      }
      .pill.pill-engaged ha-icon { color: #ffa726; }
      .pill.pill-engaged.active {
        background: rgba(255, 165, 0, 0.3);
        border-color: rgba(255, 165, 0, 0.75);
      }
      .pill-swing { gap: 4px; padding: 4px 10px; }
      .pill-icon { padding: 6px 10px; }
      .pill-swing-mini {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px;
        height: 22px;
        background: rgba(255, 255, 255, 0.06);
        border-radius: 6px;
        color: #cfd8dc;
      }
      .pill-swing-mini svg { width: 16px; height: 16px; }
      .pill.active .pill-swing-mini { background: rgba(255, 255, 255, 0.14); color: #fff; }

      /* Detail popup (shared by swing + features) */
      .popup-backdrop {
        position: fixed;
        inset: 0;
        z-index: 9;
        background: rgba(0, 0, 0, 0.35);
      }
      .detail-popup {
        position: absolute;
        left: 16px;
        right: 16px;
        bottom: 12px;
        z-index: 10;
        padding: 14px 16px 16px;
        background: #111a2a;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
        animation: fade-in 160ms ease-out;
      }
      .popup-title {
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 1px;
        text-transform: uppercase;
        color: var(--text-secondary);
        margin-bottom: 10px;
      }
      .popup-row {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
      }
      .popup-row:last-child { margin-bottom: 0; }
      .popup-row ha-icon { --mdc-icon-size: 18px; color: var(--text-secondary); }
      .popup-lbl {
        font-size: 12px;
        color: var(--text-secondary);
        min-width: 74px;
      }
      .seg-group {
        display: flex;
        gap: 4px;
        flex: 1;
        flex-wrap: wrap;
      }
      .popup-row-wrap { align-items: flex-start; }
      .popup-row-wrap ha-icon,
      .popup-row-wrap .popup-lbl { margin-top: 6px; }
      .seg-group-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
      }
      .seg-group-grid .seg { flex: none; min-width: 0; }
      .seg {
        flex: 1;
        min-width: 36px;
        height: 34px;
        padding: 0;
        font-size: 12px;
        color: var(--text-secondary);
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.15s ease;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .seg:hover { background: rgba(255, 255, 255, 0.09); color: #ddd; }
      .seg.active {
        background: #51a0e4;
        border-color: transparent;
        color: #fff;
        box-shadow: 0 0 14px rgba(81, 160, 228, 0.45);
      }
      .seg svg { display: block; transition: transform 0.2s ease; }

      .energy-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .energy-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 12px 8px;
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.05);
      }
      .energy-cell ha-icon { --mdc-icon-size: 22px; color: #FFC107; }
      .energy-val {
        font-size: 17px;
        font-weight: 600;
        color: var(--text-primary);
      }
      .energy-unit { font-size: 11px; color: var(--text-secondary); font-weight: 400; }
      .energy-lbl {
        font-size: 11px;
        letter-spacing: 0.5px;
        color: var(--text-secondary);
        text-transform: uppercase;
      }


      .toggle-row {
        display: flex;
        gap: 6px;
        justify-content: center;
        flex-wrap: wrap;
      }
      .toggle-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 8px 14px;
        border-radius: 10px;
        border: 1px solid transparent;
        background: var(--btn-bg);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .toggle-btn:hover { background: var(--btn-hover); }
      .toggle-btn.active {
        background: rgba(76, 175, 80, 0.3);
        color: #81C784;
        border-color: rgba(76, 175, 80, 0.4);
      }
      .toggle-btn ha-icon { --mdc-icon-size: 18px; }
      .toggle-btn span { font-size: 10px; }
      .tick {
        transition: stroke 180ms ease, opacity 180ms ease;
      }
      .tick-glow {
        transition: opacity 180ms ease;
      }
      .handle-glow {
        transition: cx 180ms ease, cy 180ms ease, opacity 180ms ease;
      }
    `;
  }
}

customElements.define("kpr-miraie-card", KprMiraieCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: "kpr-miraie-card",
  name: "KPR MirAIe AC Card",
  description: "Custom card for Panasonic MirAIe smart ACs",
  preview: true,
});
