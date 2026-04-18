console.info("%c KPR-MIRAIE-CARD %c v1.3.1 ","background:#00bfff;color:#000;font-weight:700;padding:2px 4px;border-radius:3px 0 0 3px;","background:#11151e;color:#00bfff;font-weight:700;padding:2px 4px;border-radius:0 3px 3px 0;");const e=Object.getPrototypeOf(customElements.get("ha-panel-lovelace")),t=e.prototype.html,i=e.prototype.css;customElements.define("kpr-miraie-card",class extends e{static get properties(){return{hass:{type:Object},config:{type:Object},_time:{type:Number},_expandVSwing:{type:Boolean},_expandHSwing:{type:Boolean},_expandConverti:{type:Boolean},_expandFeatures:{type:Boolean},_expandEnergy:{type:Boolean},_showMoreModes:{type:Boolean},_dragTargetTemp:{type:Number}}}constructor(){super(),this._expandVSwing=!1,this._expandHSwing=!1,this._expandConverti=!1,this._expandFeatures=!1,this._expandEnergy=!1,this._dragTargetTemp=null}_closeAllPopups(){this._expandVSwing=!1,this._expandHSwing=!1,this._expandConverti=!1,this._expandFeatures=!1,this._expandEnergy=!1}connectedCallback(){super.connectedCallback(),this._time=Date.now(),this._timer=setInterval(()=>{this._time=Date.now()},3e4)}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this._timer)}updated(){const e=this.shadowRoot;if(!e||!this._ticks)return;const t="http://www.w3.org/2000/svg",i=e.querySelector(".tick-group-bg"),o=e.querySelector(".tick-group-glow"),a=e.querySelector(".tick-group-lit");if(!i||!o||!a)return;const{modeColor:n,dimTickColor:s,tickW:r}=this._tickStyle;i.replaceChildren(),o.replaceChildren(),a.replaceChildren();for(const e of this._ticks){const l=i=>{const o=document.createElementNS(t,"line");return o.setAttribute("x1",e.p1.x),o.setAttribute("y1",e.p1.y),o.setAttribute("x2",e.p2.x),o.setAttribute("y2",e.p2.y),o.setAttribute("stroke",i.stroke),o.setAttribute("stroke-width",i.width),o.setAttribute("stroke-linecap",i.cap),null!=i.opacity&&o.setAttribute("opacity",i.opacity),o};i.appendChild(l({stroke:s,width:r,cap:"butt",opacity:.55})),e.lit&&(o.appendChild(l({stroke:n,width:4,cap:"round",opacity:.25})),a.appendChild(l({stroke:n,width:r,cap:"butt"})))}const l=e.querySelector(".needle-group");if(l){l.replaceChildren();const e=this._needleState;if(e&&e.visible){const i=(i,o,a)=>{const n=document.createElementNS(t,"line");return n.setAttribute("x1",e.needleA.x),n.setAttribute("y1",e.needleA.y),n.setAttribute("x2",e.needleB.x),n.setAttribute("y2",e.needleB.y),n.setAttribute("stroke",e.needleColor),n.setAttribute("stroke-width",i),n.setAttribute("stroke-linecap","round"),null!=o&&n.setAttribute("opacity",o),a&&n.setAttribute("style",`filter: drop-shadow(0 0 3px ${e.needleColor})`),n};l.appendChild(i(6,.25,!1)),l.appendChild(i(3,null,!0))}}const c=e.querySelector(".handle-group");if(c){c.replaceChildren();const e=this._handleState;if(e&&e.visible){const i=document.createElementNS(t,"circle");i.setAttribute("cx",e.handle.x),i.setAttribute("cy",e.handle.y),i.setAttribute("r",16),i.setAttribute("fill",e.modeColor),i.setAttribute("opacity",.45),c.appendChild(i);const o=document.createElementNS(t,"circle");o.setAttribute("cx",e.handle.x),o.setAttribute("cy",e.handle.y),o.setAttribute("r",8),o.setAttribute("fill","#ffffff"),o.setAttribute("stroke",e.modeColor),o.setAttribute("stroke-width",3),o.setAttribute("style",`cursor: grab; filter: drop-shadow(0 0 6px ${e.modeColor})`),c.appendChild(o)}}const p=e.querySelector(".particles");if(p&&!p.dataset.seeded){const e=(e,t)=>e+Math.random()*(t-e);for(let t=0;t<7;t++){const t=document.createElement("span");t.className="snowflake";const i=document.createElement("span");i.className="sway";const o=document.createElement("span");o.className="spin",o.textContent="❄",i.appendChild(o),t.appendChild(i),t.style.left=`${e(3,97).toFixed(1)}%`,t.style.fontSize=`${e(8,24).toFixed(1)}px`,t.style.setProperty("--fall-dur",`${e(5,12).toFixed(2)}s`),t.style.setProperty("--fall-delay",`-${e(0,12).toFixed(2)}s`),i.style.setProperty("--sway-dur",`${e(1.8,4.5).toFixed(2)}s`),i.style.setProperty("--sway-delay",`-${e(0,4).toFixed(2)}s`),i.style.setProperty("--sway-amp",`${e(4,22).toFixed(1)}px`),o.style.setProperty("--spin-dur",`${e(4,14).toFixed(2)}s`);const a=Math.random()<.5?-1:1;o.style.setProperty("--spin-amount",`${(e(120,540)*a).toFixed(0)}deg`),p.appendChild(t)}p.dataset.seeded="1"}}setConfig(e){if(!e.entity)throw new Error("Please define a climate entity");const t=e.entity.match(/^climate\.(.+)$/),i=t?t[1]:null,o=(e,t)=>i?`${e}.${i}_${t}`:"";this.config={entity:e.entity,name:e.name||"",eco_entity:e.eco_entity||o("switch","acem"),clean_entity:e.clean_entity||o("switch","acec"),powerful_entity:e.powerful_entity||o("switch","acpm"),nanoe_entity:e.nanoe_entity||o("switch","acng"),display_entity:e.display_entity||o("switch","acdc"),buzzer_entity:e.buzzer_entity||o("switch","bzr"),v_swing_entity:e.v_swing_entity||o("select","v_swing"),h_swing_entity:e.h_swing_entity||o("select","h_swing"),converti_entity:e.converti_entity||o("select","converti"),room_temp_entity:e.room_temp_entity||"",energy_daily_entity:e.energy_daily_entity||o("sensor","energy_daily"),energy_weekly_entity:e.energy_weekly_entity||o("sensor","energy_weekly"),energy_monthly_entity:e.energy_monthly_entity||o("sensor","energy_monthly"),rssi_entity:e.rssi_entity||o("sensor","rssi"),show_energy:!1!==e.show_energy,show_swing:!1!==e.show_swing,show_extras:!1!==e.show_extras}}getCardSize(){return 6}static getStubConfig(){return{entity:"climate.miraie_living_room"}}_getState(e){return e&&this.hass?this.hass.states[e]:void 0}_callService(e,t,i){this.hass.callService(e,t,i)}_setClimateMode(e){this._callService("climate","set_hvac_mode",{entity_id:this.config.entity,hvac_mode:e})}_setTemp(e){this._callService("climate","set_temperature",{entity_id:this.config.entity,temperature:e})}_setFanMode(e){this._callService("climate","set_fan_mode",{entity_id:this.config.entity,fan_mode:e})}_toggleSwitch(e){const t=this._getState(e);t&&this._callService("switch","on"===t.state?"turn_off":"turn_on",{entity_id:e})}_setSelect(e,t){this._callService("select","select_option",{entity_id:e,option:t})}_cycleFan(e,t){const i=["auto","quiet","low","medium","high"],o=i.indexOf(t);this._setFanMode(i[(o+e+i.length)%i.length])}_getModeColor(e){return{cool:"#00bfff",heat:"#ff1493",auto:"#2fd1c5",dry:"#ff8c00",fan_only:"#87ceeb",off:"#616161"}[e]||"#616161"}_getModeIcon(e){return{cool:"mdi:snowflake",heat:"mdi:fire",auto:"mdi:autorenew",dry:"mdi:water-percent",fan_only:"mdi:fan",off:"mdi:power"}[e]||"mdi:help-circle"}_getFanIcon(e){return{auto:"mdi:fan-auto",quiet:"mdi:fan-speed-1",low:"mdi:fan-speed-1",medium:"mdi:fan-speed-2",high:"mdi:fan-speed-3"}[e]||"mdi:fan"}_relativeTime(e){if(!e)return"";const t=Date.parse(e);if(Number.isNaN(t))return"";const i=this._time||Date.now(),o=Math.max(0,Math.floor((i-t)/1e3));if(o<60)return`${o}s ago`;const a=Math.floor(o/60);if(a<60)return`${a}m ago`;const n=Math.floor(a/60);return n<24?`${n}h ago`:`${Math.floor(n/24)}d ago`}_rssiIcon(e){if(null==e||Number.isNaN(Number(e)))return"mdi:wifi-strength-outline";const t=Number(e);return t>=-50?"mdi:wifi-strength-4":t>=-60?"mdi:wifi-strength-3":t>=-70?"mdi:wifi-strength-2":t>=-80?"mdi:wifi-strength-1":"mdi:wifi-strength-outline"}_renderVentIcon(e,i){const o=i?-90:0;if("Auto"===e)return t`
        <svg viewBox="0 0 24 24" width="22" height="22" style="transform: rotate(${o}deg)">
          <rect x="3" y="4" width="18" height="2" rx="1" fill="currentColor"/>
          <g stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.9">
            <line x1="12" y1="7" x2="12" y2="20" transform="rotate(-60 12 6)"/>
            <line x1="12" y1="7" x2="12" y2="20" transform="rotate(-30 12 6)"/>
            <line x1="12" y1="7" x2="12" y2="20"/>
            <line x1="12" y1="7" x2="12" y2="20" transform="rotate(30 12 6)"/>
            <line x1="12" y1="7" x2="12" y2="20" transform="rotate(60 12 6)"/>
          </g>
        </svg>
      `;const a=parseInt(e,10);return t`
      <svg viewBox="0 0 24 24" width="22" height="22" style="transform: rotate(${o}deg)">
        <rect x="3" y="4" width="18" height="2" rx="1" fill="currentColor"/>
        <g transform="rotate(${30*(a-1)-60} 12 6)" stroke="currentColor" stroke-linecap="round">
          <line x1="8"  y1="8" x2="8"  y2="20" stroke-width="1.3" opacity="0.6"/>
          <line x1="12" y1="8" x2="12" y2="22" stroke-width="1.8" opacity="1"/>
          <line x1="16" y1="8" x2="16" y2="20" stroke-width="1.3" opacity="0.6"/>
        </g>
      </svg>
    `}_renderDial(e,i,o,a,n,s,r=!1){const l=140,c=140,p=280,d=210,g=510,h=300,u=a?0:Math.max(0,Math.min(1,(i-16)/18)),f=d+u*h,m=null!=e?Math.max(0,Math.min(1,(e-16)/18)):null,y=null!=m?d+m*h:d,b=(e,t)=>{const i=(e-90)*Math.PI/180;return{x:l+t*Math.cos(i),y:c+t*Math.sin(i)}},x=(e,t,i)=>{const o=b(e,i),a=b(t,i),n=t-e>180?1:0;return`M ${o.x} ${o.y} A ${i} ${i} 0 ${n} 1 ${a.x} ${a.y}`},w=[];for(let e=0;e<80;e++){const t=e/79,i=d+t*h,o=b(i,103),n=b(i,129);w.push({p1:o,p2:n,lit:!a&&t<=u})}this._ticks=w,this._tickStyle={modeColor:o,dimTickColor:"#6b7280",tickW:2};const v=b(f,116),_=null!=y?b(y,141):null,k=null!=y?b(y,101):null;this._handleState={handle:v,modeColor:o,visible:!a},this._needleState={needleA:_,needleB:k,needleColor:"#ffffff",visible:!a&&_&&k};const $=x(d,a||null==y?g:y,136),C=a||null==y?"":x(y,g,136),S=x(d,g,139),M=e=>{const t=this.shadowRoot.querySelector(".dial-svg");if(!t)return null;e.cancelable&&e.type&&e.type.startsWith("touch")&&e.preventDefault();const i=t.getBoundingClientRect();if(i.width<=0)return null;const o=p/i.width,a=e.touches?e.touches[0]:e;if(!a)return null;const n=(a.clientX-i.left)*o,s=(a.clientY-i.top)*o;let r=180*Math.atan2(s-c,n-l)/Math.PI+90;if(r<0&&(r+=360),r<150&&(r+=360),r<195||r>525)return null;const g=16+18*Math.max(0,Math.min(1,(r-d)/h)),u=Math.min(30,Math.max(16,g));return Math.round(2*u)/2},z=e=>{const t=M(e);null!=t&&t!==this._dragTargetTemp&&(this._dragTargetTemp=t,this.requestUpdate())},A=e=>{const t=this.shadowRoot.querySelector(".dial-svg");if(!t)return!1;const i=t.getBoundingClientRect();if(i.width<=0)return!1;const o=p/i.width,a=e.touches?e.touches[0]:e;if(!a)return!1;const n=(a.clientX-i.left)*o,s=(a.clientY-i.top)*o,r=n-v.x,l=s-v.y;return Math.sqrt(r*r+l*l)<=22},F=e=>{if(a)return;if(!A(e))return;e.preventDefault();const t=M(e);null!=t&&(this._dragTargetTemp=t,this.requestUpdate());const i=e=>z(e),o=()=>{if(window.removeEventListener("mousemove",i),window.removeEventListener("mouseup",o),window.removeEventListener("touchmove",i),window.removeEventListener("touchend",o),null!=this._dragTargetTemp){const e=this._dragTargetTemp;this._setTemp(e),this._dragHoldTimer&&clearTimeout(this._dragHoldTimer),this._dragHoldTimer=setTimeout(()=>{this._dragTargetTemp=null,this._dragHoldTimer=null,this.requestUpdate()},2e3)}};window.addEventListener("mousemove",i),window.addEventListener("mouseup",o),window.addEventListener("touchmove",i,{passive:!1}),window.addEventListener("touchend",o)},q="fan_only"===n?"Fan":a?"Off":n.charAt(0).toUpperCase()+n.slice(1),T=s?s.toUpperCase():"";return t`
      <div class="dial-container" style="--mode-color: ${o}">
        <svg class="dial-svg" viewBox="0 0 ${p} ${p}"
          @mousedown=${F} @touchstart=${F}>
          <defs>
            <!-- Outer halo radial gradient — concentrated between 82%(r=131) and 100%(r=158) -->
            <radialGradient id="kpr-halo-grad" cx="50%" cy="50%" r="50%">
              <stop offset="82%" stop-color="${o}" stop-opacity="0"/>
              <stop offset="86%" stop-color="${o}" stop-opacity="0.45"/>
              <stop offset="91%" stop-color="${o}" stop-opacity="0.22"/>
              <stop offset="94%" stop-color="${o}" stop-opacity="0.08"/>
              <stop offset="100%" stop-color="${o}" stop-opacity="0"/>
            </radialGradient>
          </defs>

          <!-- Layer 0: Animated halo (soft pulsing glow — tracks mode color) -->
          <circle cx="${l}" cy="${c}" r="158" fill="url(#kpr-halo-grad)"
            class="halo-pulse" style="${a?"display:none":""}"/>

          <!-- Layer 1: Dark face extending under the full arc -->
          <circle cx="${l}" cy="${c}" r="136" fill="#0a0f18"/>

          <!-- Layer 1b: Thick track — full circle so color is uniform across bottom gap -->
          <circle cx="${l}" cy="${c}" r="108" fill="none" stroke="#0c1118" stroke-width="46"/>

          <!-- Layer 2a: Outer arc cool segment (startA → needle angle) -->
          <path d="${$}" fill="none" stroke="#3a4658" stroke-width="10"
            stroke-linecap="butt" opacity="${a?.5:.95}"/>
          <!-- Layer 2b: Outer arc warm segment (needle → endA, "hotter than room" zone) -->
          <path d="${C}" fill="none" stroke="#ff6b35" stroke-width="10"
            stroke-linecap="butt" opacity="${a?0:.75}"/>
          <!-- Layer 3: Thin bright rim along outer edge of arc (full sweep) -->
          <path d="${S}" fill="none" stroke="#8d9bb0" stroke-width="1"
            stroke-linecap="butt" opacity="0.6"/>

          <!-- Tick groups — populated in updated() via createElementNS (SVG namespace) -->
          <g class="tick-group-bg"></g>
          <g class="tick-group-glow"></g>
          <g class="tick-group-lit"></g>

          <!-- Room-temp needle — populated in updated() via createElementNS -->
          <g class="needle-group"></g>

          <!-- Inner text face (bg circle for temp/room/mode text) -->
          <circle cx="${l}" cy="${c}" r="95" fill="#05080d"/>

          <!-- Handle — populated in updated() via createElementNS -->
          <g class="handle-group"></g>
        </svg>

        <!-- Falling snowflakes (populated in updated() once, toggled by 'active' class) -->
        <div class="particles ${a||"cool"!==n?"":"active"}"></div>

        <!-- Center text stack -->
        <div class="dial-center">
          ${r?t`
            <div class="mode-row">
              <ha-icon class="mode-icon" icon="mdi:wifi-off" style="color: #8a8f9a"></ha-icon>
              <span class="mode-label" style="color: #8a8f9a">Offline</span>
            </div>
            <div class="dial-unavailable">Device unavailable</div>
          `:t`
            ${(()=>{const e=this._getState(this.config.powerful_entity);return!a&&e&&"on"===e.state?t`
                <div class="boost-badge" title="Boost active">
                  <ha-icon icon="mdi:rocket-launch"></ha-icon>
                  <span>BOOST</span>
                </div>
              `:""})()}
            <div class="mode-row">
              <ha-icon class="mode-icon"
                icon="${this._getModeIcon(n)}"
                style="color: ${a?"#616161":o}"></ha-icon>
              <span class="mode-label"
                style="color: ${a?"#616161":o}">${q}</span>
            </div>
            <div class="dial-temp">${a?null!=e?Number(e).toFixed(1):"--":null!=i?Number(i).toFixed(1):"--"}<span class="unit">°C</span></div>
            ${a?t`<div class="room-temp">Powered Off</div>`:t`
              <div class="room-temp">
                <span class="room-val-wrap">${null!=e?Number(e).toFixed(1):"--"}°C</span>
              </div>
            `}
          `}
          <div class="brand">KPR</div>
        </div>

        <!-- Fan speed label — sits inside the 60° bottom gap of the tick ring -->
        ${a?"":t`
          <div class="fan-gap-label">
            <span class="fan-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="1.4em" height="1.4em" fill="currentColor">
                <path d="M12 11a1 1 0 0 0-1 1 1 1 0 0 0 1 1 1 1 0 0 0 1-1 1 1 0 0 0-1-1m.5-9C17 2 17.11 5.57 14.75 6.75c-.99.49-1.43 1.54-1.62 2.47.48.2.9.51 1.22.91 3.7-2 7.68-1.21 7.68 2.37 0 4.5-3.57 4.6-4.75 2.23-.5-.99-1.56-1.43-2.49-1.62-.2.48-.51.89-.92 1.23C15.87 18.04 15.08 22 11.5 22c-4.5 0-4.59-3.58-2.23-4.76.98-.49 1.42-1.53 1.62-2.45-.49-.2-.92-.52-1.24-.92C5.95 15.87 2 15.08 2 11.5 2 7 5.56 6.91 6.74 9.27c.5.98 1.55 1.42 2.48 1.61.19-.48.51-.91.92-1.23C8.14 5.95 8.93 2 12.5 2Z"/>
              </svg>
            </span>
            <span>${T}</span>
          </div>
        `}
      </div>
    `}render(){if(!this.hass||!this.config)return t``;const e=this._getState(this.config.entity);if(!e)return t`<ha-card>Entity not found: ${this.config.entity}</ha-card>`;const i=e.state,o=e.attributes.current_temperature,a=e.attributes.temperature,n=e.attributes.fan_mode||"auto",s="unavailable"===i||"unknown"===i||"unavailable"===e.state,r=s?"#616161":this._getModeColor(i),l="off"===i||s,c=this._getState(this.config.energy_daily_entity),p=this._getState(this.config.energy_weekly_entity),d=this._getState(this.config.energy_monthly_entity),g=c||p||d,h=this._getState(this.config.eco_entity),u=this._getState(this.config.clean_entity),f=this._getState(this.config.powerful_entity),m=this._getState(this.config.nanoe_entity),y=this._getState(this.config.display_entity),b=this._getState(this.config.buzzer_entity),x=this._getState(this.config.v_swing_entity),w=this._getState(this.config.h_swing_entity),v=this._getState(this.config.converti_entity);n.charAt(0).toUpperCase(),n.slice(1);const _=[{key:"heat",icon:"mdi:fire",label:"Heat"},{key:"fan_only",icon:"mdi:fan",label:"Fan"},{key:"dry",icon:"mdi:water-percent",label:"Dry"}],k=_.some(e=>e.key===i),$=this.config.name||e.attributes.friendly_name||"";return t`
      <ha-card style="--mode-color: ${r}">

        ${$?t`
          <div class="card-header">
            <div class="card-title">${$}</div>
            <div class="card-meta">
              <span class="status-dot ${s?"offline":"online"}"></span>
              <span class="last-seen">${this._relativeTime(e.last_changed||e.last_updated)}</span>
              <ha-icon class="wifi" icon="${this._rssiIcon((this._getState(this.config.rssi_entity)||{}).state??e.attributes.rssi)}"
                title="RSSI: ${(this._getState(this.config.rssi_entity)||{}).state??"n/a"} dBm"></ha-icon>
            </div>
          </div>
        `:""}

        <!-- Main 3-column: temp controls | dial | fan controls -->
        <div class="main-area">

          <!-- Left: temperature +/- -->
          <div class="side-controls">
            ${l?t`<div class="side-placeholder"></div>`:t`
              <button class="side-btn" @click=${()=>this._setTemp((a||24)+.5)}>
                <ha-icon icon="mdi:plus" style="--mdc-icon-size: 20px"></ha-icon>
              </button>
              <ha-icon icon="mdi:thermometer"
                style="--mdc-icon-size: 32px; color: #ff5722; filter: drop-shadow(0 0 8px #ff5722aa)"></ha-icon>
              <button class="side-btn" @click=${()=>this._setTemp((a||24)-.5)}>
                <ha-icon icon="mdi:minus" style="--mdc-icon-size: 20px"></ha-icon>
              </button>
            `}
          </div>

          ${this._renderDial(o,this._dragTargetTemp??a,r,l,i,n,s)}

          <!-- Right: fan speed up/down -->
          <div class="side-controls">
            ${l?t`<div class="side-placeholder"></div>`:t`
              <button class="side-btn" @click=${()=>this._cycleFan(1,n)}>
                <ha-icon icon="mdi:chevron-up" style="--mdc-icon-size: 20px"></ha-icon>
              </button>
              <ha-icon icon="${this._getFanIcon(n)}"
                style="--mdc-icon-size: 24px; color: var(--mode-color)"></ha-icon>
              <button class="side-btn" @click=${()=>this._cycleFan(-1,n)}>
                <ha-icon icon="mdi:chevron-down" style="--mdc-icon-size: 20px"></ha-icon>
              </button>
            `}
          </div>

        </div>

        <!-- Pill row: Energy | V-Swing | H-Swing | Converti | Features -->
        ${(()=>{const e=[],i=e=>t=>{t.stopPropagation();const i=this[e];this._closeAllPopups(),this[e]=!i};if(this.config.show_energy&&g){const o=c||d||p;e.push(t`
              <button class="pill ${this._expandEnergy?"active":""}" @click=${i("_expandEnergy")}
                title="Energy usage">
                <ha-icon icon="mdi:calendar-today" style="color: #FFC107"></ha-icon>
                <span class="pill-val">${o.state} kWh</span>
              </button>
            `)}if(!l&&this.config.show_swing&&x&&e.push(t`
              <button class="pill pill-swing ${this._expandVSwing?"active":""}" @click=${i("_expandVSwing")} title="Vertical Swing">
                <ha-icon icon="mdi:arrow-up-down"></ha-icon>
                <span class="pill-swing-mini">${this._renderVentIcon(x.state,!1)}</span>
              </button>
            `),!l&&this.config.show_swing&&w&&e.push(t`
              <button class="pill pill-swing ${this._expandHSwing?"active":""}" @click=${i("_expandHSwing")} title="Horizontal Swing">
                <ha-icon icon="mdi:arrow-left-right"></ha-icon>
                <span class="pill-swing-mini">${this._renderVentIcon(w.state,!0)}</span>
              </button>
            `),!l&&this.config.show_swing&&v){const o={0:"Off",100:"FC",110:"HC"}[v.state]||`${v.state}%`,a="0"!==v.state&&"unavailable"!==v.state&&"unknown"!==v.state;e.push(t`
              <button class="pill ${this._expandConverti?"active":""} ${a?"pill-engaged":""}"
                @click=${i("_expandConverti")} title="Converti8">
                <ha-icon icon="mdi:percent"></ha-icon>
                <span class="pill-val">${o}</span>
              </button>
            `)}return!l&&this.config.show_extras&&e.push(t`
              <button class="pill pill-icon ${this._expandFeatures?"active":""}"
                @click=${i("_expandFeatures")} title="Features">
                <ha-icon icon="mdi:tune-variant"></ha-icon>
              </button>
            `),e.length?t`<div class="pill-row">${e}</div>`:""})()}

        <!-- Mode bar -->
        <div class="mode-bar-wrap">
          <div class="mode-bar">
            ${[{key:"off",icon:"mdi:power",label:"Off"},{key:"cool",icon:"mdi:snowflake",label:"Cool"},{key:"auto",icon:"mdi:autorenew",label:"Auto"}].map((e,o)=>t`
              ${o>0?t`<div class="mbar-sep"></div>`:""}
              <button
                class="mbar-btn ${i===e.key?"active":""}"
                style="--btn-color: ${this._getModeColor(e.key)}"
                @click=${()=>this._setClimateMode(e.key)}>
                <ha-icon icon="${e.icon}" style="--mdc-icon-size: 18px"></ha-icon>
                <span>${e.label}</span>
              </button>
            `)}
            <div class="mbar-sep"></div>
            <button class="mbar-btn ${k||this._showMoreModes?"active":""}"
              style="--btn-color: ${k?this._getModeColor(i):"rgba(255,255,255,0.14)"}"
              @click=${e=>{e.stopPropagation(),this._showMoreModes=!this._showMoreModes}}>
              <ha-icon icon="${this._showMoreModes?"mdi:close":"mdi:dots-horizontal"}" style="--mdc-icon-size: 18px"></ha-icon>
            </button>
          </div>

          ${this._showMoreModes?t`
            <div class="mode-backdrop" @click=${()=>{this._showMoreModes=!1}}></div>
            <div class="mode-popup" @click=${e=>e.stopPropagation()}>
              ${_.map(e=>t`
                <button
                  class="popup-btn ${i===e.key?"active":""}"
                  style="--btn-color: ${this._getModeColor(e.key)}"
                  @click=${()=>{this._setClimateMode(e.key),this._showMoreModes=!1}}>
                  <ha-icon icon="${e.icon}" style="--mdc-icon-size: 22px"></ha-icon>
                  <span>${e.label}</span>
                </button>
              `)}
            </div>
          `:""}
        </div>

        <!-- Energy popup -->
        ${this._expandEnergy&&g?t`
          <div class="popup-backdrop" @click=${()=>{this._expandEnergy=!1}}></div>
          <div class="detail-popup" @click=${e=>e.stopPropagation()}>
            <div class="popup-title">Energy Usage</div>
            <div class="energy-grid">
              <div class="energy-cell">
                <ha-icon icon="mdi:calendar-today"></ha-icon>
                <div class="energy-val">${c?c.state:"—"}<span class="energy-unit"> kWh</span></div>
                <div class="energy-lbl">Today</div>
              </div>
              <div class="energy-cell">
                <ha-icon icon="mdi:calendar-week"></ha-icon>
                <div class="energy-val">${p?p.state:"—"}<span class="energy-unit"> kWh</span></div>
                <div class="energy-lbl">Week</div>
              </div>
              <div class="energy-cell">
                <ha-icon icon="mdi:calendar-month"></ha-icon>
                <div class="energy-val">${d?d.state:"—"}<span class="energy-unit"> kWh</span></div>
                <div class="energy-lbl">Month</div>
              </div>
            </div>
          </div>
        `:""}

        <!-- Vertical Swing popup -->
        ${!l&&this._expandVSwing&&x?t`
          <div class="popup-backdrop" @click=${()=>{this._expandVSwing=!1}}></div>
          <div class="detail-popup" @click=${e=>e.stopPropagation()}>
            <div class="popup-title">Vertical Swing</div>
            <div class="popup-row">
              <ha-icon icon="mdi:arrow-up-down"></ha-icon>
              <span class="popup-lbl">Angle</span>
              <div class="seg-group">
                ${["Auto","1","2","3","4","5"].map(e=>t`
                  <button class="seg ${x.state===e?"active":""}" title="${e}"
                    @click=${()=>this._setSelect(this.config.v_swing_entity,e)}>
                    ${this._renderVentIcon(e,!1)}
                  </button>
                `)}
              </div>
            </div>
          </div>
        `:""}

        <!-- Horizontal Swing popup -->
        ${!l&&this._expandHSwing&&w?t`
          <div class="popup-backdrop" @click=${()=>{this._expandHSwing=!1}}></div>
          <div class="detail-popup" @click=${e=>e.stopPropagation()}>
            <div class="popup-title">Horizontal Swing</div>
            <div class="popup-row">
              <ha-icon icon="mdi:arrow-left-right"></ha-icon>
              <span class="popup-lbl">Angle</span>
              <div class="seg-group">
                ${["Auto","1","2","3","4","5"].map(e=>t`
                  <button class="seg ${w.state===e?"active":""}" title="${e}"
                    @click=${()=>this._setSelect(this.config.h_swing_entity,e)}>
                    ${this._renderVentIcon(e,!0)}
                  </button>
                `)}
              </div>
            </div>
          </div>
        `:""}

        <!-- Converti popup -->
        ${!l&&this._expandConverti&&v?t`
          <div class="popup-backdrop" @click=${()=>{this._expandConverti=!1}}></div>
          <div class="detail-popup" @click=${e=>e.stopPropagation()}>
            <div class="popup-title">Converti8 · Cooling Performance</div>
            <div class="popup-row popup-row-wrap">
              <ha-icon icon="mdi:percent"></ha-icon>
              <span class="popup-lbl">Level</span>
              <div class="seg-group seg-group-grid">
                ${[{v:"0",l:"Off"},{v:"40",l:"40%"},{v:"50",l:"50%"},{v:"60",l:"60%"},{v:"70",l:"70%"},{v:"80",l:"80%"},{v:"90",l:"90%"},{v:"100",l:"FC"},{v:"110",l:"HC"}].map(e=>t`
                  <button class="seg ${v.state===e.v?"active":""}" title="${e.l}"
                    @click=${()=>this._setSelect(this.config.converti_entity,e.v)}>${e.l}</button>
                `)}
              </div>
            </div>
          </div>
        `:""}

        <!-- Features popup -->
        ${!l&&this._expandFeatures&&this.config.show_extras?t`
          <div class="popup-backdrop" @click=${()=>{this._expandFeatures=!1}}></div>
          <div class="detail-popup" @click=${e=>e.stopPropagation()}>
            <div class="popup-title">Features</div>
            <div class="toggle-row">
              ${h?t`<button class="toggle-btn ${"on"===h.state?"active":""}" @click=${()=>this._toggleSwitch(this.config.eco_entity)}><ha-icon icon="mdi:leaf"></ha-icon><span>Eco</span></button>`:""}
              ${u?t`<button class="toggle-btn ${"on"===u.state?"active":""}" @click=${()=>this._toggleSwitch(this.config.clean_entity)}><ha-icon icon="mdi:broom"></ha-icon><span>Clean</span></button>`:""}
              ${f?t`<button class="toggle-btn ${"on"===f.state?"active":""}" @click=${()=>this._toggleSwitch(this.config.powerful_entity)}><ha-icon icon="mdi:rocket-launch"></ha-icon><span>Boost</span></button>`:""}
              ${m?t`<button class="toggle-btn ${"on"===m.state?"active":""}" @click=${()=>this._toggleSwitch(this.config.nanoe_entity)}><ha-icon icon="mdi:air-purifier"></ha-icon><span>Nanoe</span></button>`:""}
              ${y?t`<button class="toggle-btn ${"on"===y.state?"active":""}" @click=${()=>this._toggleSwitch(this.config.display_entity)}><ha-icon icon="mdi:monitor"></ha-icon><span>Display</span></button>`:""}
              ${b?t`<button class="toggle-btn ${"on"===b.state?"active":""}" @click=${()=>this._toggleSwitch(this.config.buzzer_entity)}><ha-icon icon="mdi:volume-high"></ha-icon><span>Buzzer</span></button>`:""}
            </div>
          </div>
        `:""}

      </ha-card>
    `}static get styles(){return i`
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
    `}}),window.customCards=window.customCards||[],window.customCards.push({type:"kpr-miraie-card",name:"KPR MirAIe AC Card",description:"Custom card for Panasonic MirAIe smart ACs",preview:!0});
