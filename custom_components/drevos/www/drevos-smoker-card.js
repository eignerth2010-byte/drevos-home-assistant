/* Drevos Smoker Card — MIT. No external dependencies or gateway credentials. */
(() => {
  const LOGO_DATA = 'data:image/png;base64,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';
  const CARD_VERSION = '0.1.3';
  const PROJECT_AUTHOR = 'Thomas Eigner';
  const PROJECT_URL = 'https://github.com/eignerth2010-byte/drevos-home-assistant';
  const DONATION_URL = 'https://www.paypal.com/donate/?hosted_button_id=GSMP9644VUY8C';
  const RELEASE_STORAGE_KEY = 'drevos.ha.release-notes.v1';
  let notesOwner = null;
  let acknowledgedRelease = null;
  const RELEASE_NOTES = {
    de: ['Neuer Info-Bereich mit Thomas Eigner als Ersteller, Anleitung und Support.',
      'Freiwillige Unterstützung über den PayPal-Spendenbutton.',
      'Sichtbare Versionsnummer und diese Änderungsübersicht nach Updates.',
      'Die Ofenbedienung verwendet weiterhin die vorhandenen Entitäten und das lokale Pi-Gateway.'],
    en: ['New Info section with creator Thomas Eigner, setup guide and support links.',
      'Optional support through the PayPal donation button.',
      'Visible version and these release notes after updates.',
      'Oven controls continue to use the existing entities and local Pi gateway.']
  };
  const TEXT = {
    de: {chamber:'Kammer',core:'Kern',smoke:'Rauch',target:'Sollwert',coretarget:'Kernziel',
      smokelevel:'Rauchstärke',duration:'Dauer',heat:'Heizelement',ignition:'Rauch / Zündung',
      convection:'Konvektion',fan:'Lüfter',timer:'Timer',remaining:'Restzeit',elapsed:'Laufzeit',
      start:'Start',pause:'Pause',reset:'Zurücksetzen',shutdown:'Pi herunterfahren',apply:'Übernehmen',
      on:'Ein',off:'Aus',online:'Verbunden',offline:'Nicht verfügbar',automatic:'Automatik aktiv · Bedienung gesperrt',
      readonly:'Bedienung gesperrt',missing:'Drevos-Gerät auswählen oder Integration einrichten.',
      heatConfirm:'Heizung einschalten? Kammertemperatur und Betriebsbereitschaft des Ofens prüfen.',
      smokeConfirm:'Rauchbetrieb mit automatischer Zündung starten? Rauchstärke und Rauchgenerator prüfen.',
      shutdownConfirm:'Raspberry Pi herunterfahren? Das schaltet den Ofen nicht aus.',
      help:'Zuerst Sollwerte übernehmen, dann Heizung oder Rauch einschalten. Der Timer startet nur die Uhr. Zum Pausieren oder Zurücksetzen Heizung und Rauch ausschalten.',
      queued:'Befehl gesendet. Rückmeldung der Steuerung abwarten.',error:'Befehl fehlgeschlagen. Aktuellen Ofenzustand prüfen; der Befehl wird nicht automatisch wiederholt.',
      invalid:'Bitte eine ganze Zahl innerhalb des angezeigten Bereichs eingeben.',pending:'Befehl wird verarbeitet …',
      oven:'Ofen',info:'Info',infoTitle:'Info & Unterstützen',created:'Erstellt von',
      community:'Unabhängiges Community-Projekt',version:'HA-Integration',notes:'Was ist neu?',
      support:'Dir hilft die Integration?',donate:'Über PayPal unterstützen',
      voluntary:'Die Spende ist freiwillig; alle Funktionen bleiben kostenlos. PayPal öffnet sich in einem neuen Browser-Tab.',
      thanks:'Mit einer freiwilligen Spende unterstützt du die Weiterentwicklung. Vielen Dank!',
      github:'Projekt auf GitHub',guide:'Installationsanleitung',discussion:'Fragen & Ideen',
      acknowledgement:'Mitwirkende',gotIt:'Alles klar',notesHint:'Diese Übersicht findest du später im Info-Bereich.',
      updateHint:'Neue Integrationsversionen werden über den Marketplace bzw. auf älteren HA-Versionen über HACS installiert. Ein Pi-Update ist für diese Kartenänderung nicht nötig.',
      title:'Titel',device:'Drevos-Gerät',language:'Sprache',notSelected:'Automatisch auswählen',
      confirmations:'Bestätigung',confirmTitle:'Bitte bestätigen',cancel:'Abbrechen',confirm:'Bestätigen',
      timerNote:'Bei Ablauf beendet die Steuerung den Durchgang. Ein erreichtes Kernziel kann ihn früher beenden.',
      limit:'Grenze',timerUnit:'min',commandChanged:'Der Ofenzustand hat sich geändert. Bitte erneut prüfen.'},
    en: {chamber:'Chamber',core:'Core',smoke:'Smoke',target:'Target',coretarget:'Core target',
      smokelevel:'Smoke level',duration:'Duration',heat:'Heating element',ignition:'Smoke / ignition',
      convection:'Convection',fan:'Fan',timer:'Timer',remaining:'Remaining',elapsed:'Elapsed',
      start:'Start',pause:'Pause',reset:'Reset',shutdown:'Shut down Pi',apply:'Apply',on:'On',off:'Off',
      online:'Connected',offline:'Unavailable',automatic:'Automatic program · controls locked',
      readonly:'Controls locked',missing:'Select a Drevos device or set up the integration.',
      heatConfirm:'Enable heating? Check the chamber target and that the oven is ready.',
      smokeConfirm:'Start smoke with automatic ignition? Check the smoke level and prepare the generator.',
      shutdownConfirm:'Shut down the Raspberry Pi? This does not switch off the oven.',
      help:'Apply targets first, then enable heat or smoke. The timer only starts the clock. Turn heat and smoke off before pausing or resetting.',
      queued:'Command sent. Wait for controller feedback.',error:'Command failed. Check the current oven state; the command will not be retried automatically.',
      invalid:'Enter a whole number within the displayed range.',pending:'Processing command …',
      oven:'Oven',info:'Info',infoTitle:'Info & Support',created:'Created by',
      community:'Independent community project',version:'HA integration',notes:'What’s new?',
      support:'Finding the integration useful?',donate:'Support via PayPal',
      voluntary:'Donations are optional; all features remain free. PayPal opens in a new browser tab.',
      thanks:'An optional donation helps support continued development. Thank you!',
      github:'Project on GitHub',guide:'Installation guide',discussion:'Questions & ideas',
      acknowledgement:'Contributors',gotIt:'Got it',notesHint:'You can reopen these notes from Info.',
      updateHint:'Install new integration versions through the Marketplace, or HACS on older HA versions. This card update does not require a Pi update.',
      title:'Title',device:'Drevos device',language:'Language',notSelected:'Select automatically',
      confirmations:'Confirmation',confirmTitle:'Please confirm',cancel:'Cancel',confirm:'Confirm',
      timerNote:'At expiry the controller ends the process. A reached core target may end it earlier.',
      limit:'Limit',timerUnit:'min',commandChanged:'The oven state changed. Please check again.'}
  };
  const FIELDS = [
    ['kammertemperatur_soll','target',0,120,'°C'],
    ['kerntemperatur_ziel','coretarget',0,115,'°C'],
    ['rauch_soll','smokelevel',0,100,'%'],
    ['timer_dauer','duration',1,9999,'min']
  ];
  const SWITCHES = [['heizelement','heat'],['rauchbetrieb','ignition'],['konvektion','convection'],['luefter','fan']];
  const LEGACY = {kammertemperatur:'sensor.drevos_kammertemperatur',kerntemperatur:'sensor.drevos_kerntemperatur',
    raucheinstellung:'sensor.drevos_raucheinstellung',kammertemperatur_soll:'number.drevos_kammertemperatur_soll',
    kerntemperatur_ziel:'number.drevos_kerntemperatur_ziel',rauch_soll:'number.drevos_rauch_soll',
    timer_dauer:'number.drevos_timer_dauer',heizelement:'switch.drevos_heizelement',rauchbetrieb:'switch.drevos_rauchbetrieb',
    konvektion:'switch.drevos_konvektion',luefter:'switch.drevos_luefter',timer_lauf:'switch.drevos_timer_lauf',
    timer_reset:'button.drevos_timer_zuruecksetzen',shutdown:'button.drevos_pi_herunterfahren',
    timer_restzeit:'sensor.drevos_timer_restzeit',timer_laufzeit:'sensor.drevos_timer_laufzeit'};
  const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const alive = s => !!s && s.state!=='unavailable' && (s.state!=='unknown' || s.entity_id?.startsWith('button.'));

  class DrevosSmokerCard extends HTMLElement {
    static getConfigElement() { return document.createElement('drevos-smoker-card-editor'); }
    static getStubConfig(hass) {
      const entity=Object.values(hass?.states||{}).find(s=>s.attributes?.drevos_gateway_id);
      return {type:'custom:drevos-smoker-card',title:'Drevos',language:'auto',
        ...(entity?{gateway_id:entity.attributes.drevos_gateway_id}:{})};
    }
    constructor() {
      super(); this.attachShadow({mode:'open'}); this._pending=false; this._dialog=null; this._tab='oven'; this._notesOpen=false; this._releaseDue=true;
      this.shadowRoot.addEventListener('click',event=>this.clicked(event));
      this.shadowRoot.addEventListener('keydown',event=>{
        if(this._notesOpen)return;
        if(event.key==='Escape' && this._dialog){event.preventDefault();this.cancelDialog();}
        if(event.key==='Tab' && this._dialog){const b=[...this.shadowRoot.querySelectorAll('.dialog button')];if(event.shiftKey&&this.shadowRoot.activeElement===b[0]){event.preventDefault();b[1].focus();}else if(!event.shiftKey&&this.shadowRoot.activeElement===b[1]){event.preventDefault();b[0].focus();}}
        if(event.key==='Enter' && event.target.matches('input')){event.preventDefault();this.applyNumber(event.target.id);}
      });
    }
    disconnectedCallback() {
      if(notesOwner===this)notesOwner=null;
      const dialog=this.shadowRoot.querySelector('dialog[data-release-notes]');
      if(dialog?.open){this._suppressNoteAck=true;dialog.close();}
      this._notesOpen=false;
    }
    setConfig(config) {
      if(!config || typeof config!=='object') throw new Error('Invalid Drevos card configuration');
      const dialog=this.shadowRoot.querySelector('dialog[data-release-notes]');
      if(dialog?.open){this._suppressNoteAck=true;dialog.close();}
      this._notesOpen=false;
      this.config={title:'Drevos',language:'auto',...config};this._mounted=false;this._map={};this.render();
    }
    set hass(value) { this._hass=value;this.resolveEntities();this.render(); }
    getCardSize() { return 14; }
    getGridOptions() { return {columns:12,min_columns:6,rows:14,min_rows:12}; }
    resolveEntities() {
      if(!this._hass || !this.config) return;
      const all=Object.values(this._hass.states);
      const ids=[...new Set(all.map(s=>s.attributes?.drevos_gateway_id).filter(Boolean))];
      const id=this.config.gateway_id || (ids.length===1?ids[0]:null);
      this._map={};
      if(this.config.legacy_mqtt===true) Object.assign(this._map,LEGACY);
      for(const entity of all) {
        if(id && entity.attributes?.drevos_gateway_id===id && entity.attributes.drevos_key) {
          this._map[entity.attributes.drevos_key]=entity.entity_id;
        }
      }
      if(this.config.entities) Object.assign(this._map,this.config.entities);
    }
    state(key) { return this._hass?.states?.[this._map?.[key]]; }
    language() { return (this.config?.language==='auto'?this._hass?.language:this.config?.language)?.startsWith('de')?'de':'en'; }
    text() { return TEXT[this.language()]; }
    selectTab(tab) {
      if(!['oven','info'].includes(tab)||this._pending||this._dialog||this._notesOpen)return;
      this._tab=tab;this.render();
    }
    acknowledgeRelease() {
      if(this._suppressNoteAck){this._suppressNoteAck=false;return;}
      this._notesOpen=false;this._releaseDue=false;acknowledgedRelease=CARD_VERSION;
      if(notesOwner===this)notesOwner=null;
      try{window.localStorage.setItem(RELEASE_STORAGE_KEY,CARD_VERSION);}catch{}
      if(this._mounted&&this.isConnected)this.render();
    }
    showReleaseNotes(manual=false) {
      if(!this._hass||!this.isConnected||this._pending||this._dialog||this._notesOpen)return;
      if(document.visibilityState==='hidden')return;
      if(notesOwner?.isConnected&&notesOwner!==this)return;
      if(!manual) {
        if(!this._releaseDue||acknowledgedRelease===CARD_VERSION)return;
        try{if(window.localStorage.getItem(RELEASE_STORAGE_KEY)===CARD_VERSION){this._releaseDue=false;return;}}catch{}
        if(this.shadowRoot.activeElement?.tagName==='INPUT'||this.shadowRoot.querySelector('input[data-dirty="true"]'))return;
      }
      const dialog=this.shadowRoot.querySelector('dialog[data-release-notes]');
      if(!dialog?.showModal)return;
      try{dialog.showModal();this._notesOpen=true;notesOwner=this;}catch{return;}
    }
    render() {
      if(!this.config) return;
      const t=this.text();
      if(!this._mounted) {
        this.shadowRoot.innerHTML=`<style>
          :host{display:block;--d-accent:#ffad55;--d-text:#f3f0e9;--d-muted:#a8aaae;font-family:var(--paper-font-body1_-_font-family,system-ui,sans-serif)}
          *{box-sizing:border-box}ha-card{display:block;overflow:hidden;color:var(--d-text);border:1px solid #47494c;border-radius:22px;background:linear-gradient(125deg,#343537,#17191c 48%,#222528);box-shadow:0 12px 32px #0003}
          header{display:flex;align-items:center;justify-content:space-between;padding:20px 20px 12px;gap:10px}.brand{display:inline-flex;background:linear-gradient(110deg,#e9e9e4,#bfc2c1);padding:7px 10px;border-radius:6px;box-shadow:inset 0 1px #fff7}.brand img{width:135px;height:auto;display:block}.subtitle{font-size:10px;letter-spacing:2.8px;color:var(--d-muted);margin-top:7px}.status{font-size:11px;color:var(--d-muted);text-align:right}.dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#6ed6a0;margin-right:6px}.offline .dot{background:#d97b76}
          .cabinet{margin:8px 16px 16px;padding:14px;border-radius:14px;border:1px solid #5e6062;background:repeating-linear-gradient(100deg,#ffffff05 0 1px,transparent 1px 4px),linear-gradient(115deg,#62666a,#333639 50%,#66696b);box-shadow:inset 0 1px #ffffff40}
          .door{position:relative;min-height:190px;border:2px solid #242628;border-radius:9px;background:linear-gradient(145deg,#111619,#1f2528);box-shadow:inset 0 0 25px #0008;padding:20px 25px 18px 15px}.handle{position:absolute;right:8px;top:42px;width:8px;height:107px;background:linear-gradient(90deg,#555,#dedddd,#676767);border-radius:5px;box-shadow:3px 1px 3px #0008}
          .temps{display:grid;grid-template-columns:1fr 1fr;gap:12px}.reading small{display:block;color:var(--d-muted);font-size:11px;letter-spacing:.5px}.value{font-variant-numeric:tabular-nums;font-size:clamp(25px,5vw,37px);font-weight:650;letter-spacing:-1px;line-height:1.6;color:var(--d-accent)}.value em{font-size:13px;font-weight:400;font-style:normal;letter-spacing:0}.rack{height:1px;background:repeating-linear-gradient(90deg,#81909650 0 2px,transparent 2px 10px);margin:9px 0}.smoke-line{display:flex;align-items:center;justify-content:space-between;font-size:12px;color:var(--d-muted);margin-top:16px}.smoke-value{color:#e2e5e5;font-size:18px;font-variant-numeric:tabular-nums}.vent{height:5px;margin:12px 65px 0;background:repeating-linear-gradient(90deg,#16191b 0 3px,transparent 3px 9px)}
          .body{padding:0 16px 18px}.fields{display:grid;grid-template-columns:1fr 1fr;gap:10px}.field{background:#ffffff06;border:1px solid #ffffff12;border-radius:10px;padding:10px;min-width:0}label{font-size:11px;color:#babdc1;display:block;margin-bottom:7px}.input-row{display:flex;align-items:center;gap:4px}input{width:100%;min-width:0;border:1px solid #777b80;border-radius:5px;padding:8px 5px;color:var(--d-text);background:#15181b;font:inherit;font-size:16px;appearance:textfield}input:focus{outline:2px solid var(--d-accent);outline-offset:1px}.unit{font-size:11px;color:var(--d-muted)}.apply{width:100%;font-size:11px;margin-top:7px;padding:7px}.range{font-size:9px;color:var(--d-muted);margin-top:5px}.switches{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}button{font:inherit;color:var(--d-text);background:#34383d;border:1px solid #65696d;border-radius:8px;padding:11px 8px;cursor:pointer;min-height:36px}button:focus-visible{outline:2px solid var(--d-accent);outline-offset:2px}button:disabled{opacity:.38;cursor:default}.switches button{display:flex;justify-content:space-between;align-items:center;gap:5px;text-align:left;font-size:12px;min-height:48px}.switches button[aria-pressed=true]{background:#5e3d22;border-color:#d59452}.switches b{font-size:10px;white-space:nowrap;font-weight:500;color:var(--d-muted)}.timer{margin-top:17px;padding-top:15px;border-top:1px solid #ffffff16}.timer-heading{font-size:12px;color:#cfd1d3;display:flex;justify-content:space-between}.clocks{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:10px 0}.clock small{font-size:10px;color:var(--d-muted)}.clock strong{display:block;font-size:23px;font-variant-numeric:tabular-nums;font-weight:500;margin-top:4px}.actions{display:flex;gap:8px}.actions button{flex:1;font-size:12px}.primary{background:#a46531;border-color:#d49354}.foot{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:16px;padding-top:12px;border-top:1px solid #ffffff10}.foot button{font-size:10px;padding:7px 10px;background:transparent}.note{font-size:10px;line-height:1.6;color:var(--d-muted);margin-top:12px}.message{font-size:11px;line-height:1.5;color:#e9c49b;min-height:17px;margin-top:10px}.error{color:#ffaaa5}.missing{padding:10px;font-size:13px;color:#ffbf83}[hidden]{display:none!important}.modal{position:absolute;inset:0;background:#0009;display:flex;align-items:center;justify-content:center;padding:20px;z-index:5;border-radius:22px}.dialog{width:100%;max-width:360px;border:1px solid #6f7377;border-radius:14px;background:#25292d;padding:20px;box-shadow:0 12px 50px #0008}.dialog h3{font-size:16px;margin:0 0 12px}.dialog p{font-size:13px;line-height:1.6;margin:0 0 18px}.dialog .actions button{min-height:44px}ha-card{position:relative}@media(max-width:360px){header{padding:16px}.body{padding:0 12px 14px}.cabinet{margin:6px 12px 12px}.clock strong{font-size:20px}.switches button{font-size:11px}}
          .tabs{display:flex;gap:8px;margin:0 16px 14px}.tabs button{flex:1;font-size:13px}.tabs button[aria-selected=true]{background:#5e3d22;border-color:#d59452}.info-panel{padding:0 18px 18px}.info-panel h2{font-size:19px;margin:12px 0}.info-box{padding:16px;border:1px solid #ffffff16;border-radius:12px;background:#ffffff06;margin-top:12px}.info-box p{font-size:13px;line-height:1.6;margin:8px 0;color:var(--d-muted)}.info-box strong{font-size:21px;display:block}.info-links{display:grid;gap:9px;margin-top:14px}.info-links a{display:block;text-align:center;padding:12px 10px;border:1px solid #65696d;border-radius:9px;background:#34383d;color:var(--d-text);font-size:13px;text-decoration:none}.info-links a.donate{background:var(--d-accent);color:#17191c;font-weight:650;border-color:var(--d-accent)}a:focus-visible{outline:2px solid var(--d-accent);outline-offset:2px}.version-line{padding:12px 18px;text-align:center;font-size:11px;color:var(--d-muted);border-top:1px solid #ffffff12}dialog[data-release-notes]{color:var(--d-text);background:#25292d;border:1px solid #6f7377;border-radius:18px;padding:22px;width:min(440px,calc(100vw - 32px));max-height:85vh;overflow:auto;box-sizing:border-box;box-shadow:0 16px 60px #0008}dialog[data-release-notes]::backdrop{background:#000b}dialog[data-release-notes] h2{font-size:24px;margin:10px 0}dialog[data-release-notes] li{font-size:15px;line-height:1.6;margin:12px 0}dialog[data-release-notes] ul{padding-left:21px}dialog[data-release-notes] button{width:100%;background:var(--d-accent);color:#17191c;font-weight:650;margin-top:10px}.release-version{color:var(--d-accent);font-size:12px;letter-spacing:1px}
        </style><ha-card>
          <header><div><div class="brand"><img src="${LOGO_DATA}" alt="Drevos international"></div><div class="subtitle" data-title></div></div><div class="status"><i class="dot"></i><span data-status></span></div></header>
          <nav class="tabs" role="tablist" aria-label="Drevos"><button id="oven-tab" role="tab" aria-controls="oven-panel" data-tab="oven">${t.oven}</button><button id="info-tab" role="tab" aria-controls="info-panel" data-tab="info">${t.info}</button></nav>
          <section id="oven-panel" role="tabpanel" aria-labelledby="oven-tab" data-panel="oven">
          <div class="cabinet"><div class="door"><div class="handle" aria-hidden="true"></div><div class="temps">
            <div class="reading"><small>${t.chamber}</small><div class="value"><span data-reading="kammertemperatur">—</span><em> °C</em></div></div>
            <div class="reading"><small>${t.core}</small><div class="value"><span data-reading="kerntemperatur">—</span><em> °C</em></div></div>
          </div><div class="rack"></div><div class="rack"></div><div class="rack"></div><div class="smoke-line"><span>≋ &nbsp;${t.smoke}</span><span class="smoke-value"><span data-reading="raucheinstellung">—</span> %</span></div></div><div class="vent" aria-hidden="true"></div></div>
          <div class="body"><div class="missing" hidden></div><div class="fields">${FIELDS.map(([key,label,min,max,unit])=>`<div class="field"><label for="${key}">${t[label]}</label><div class="input-row"><input id="${key}" type="number" min="${min}" max="${max}" step="1" inputmode="numeric" aria-label="${t[label]}"><span class="unit">${unit}</span></div><div class="range">${min}–${max} ${unit}</div><button class="apply" data-number="${key}">${t.apply}</button></div>`).join('')}</div>
          <div class="switches">${SWITCHES.map(([key,label])=>`<button data-switch="${key}" aria-pressed="false"><span>${t[label]}</span><b></b></button>`).join('')}</div>
          <div class="timer"><div class="timer-heading"><span>${t.timer}</span><span data-timer-status></span></div><div class="clocks"><div class="clock"><small>${t.remaining}</small><strong data-clock="timer_restzeit">—</strong></div><div class="clock"><small>${t.elapsed}</small><strong data-clock="timer_laufzeit">—</strong></div></div><div class="actions"><button class="primary" data-timer></button><button data-button="timer_reset">${t.reset}</button></div><div class="note">${t.timerNote}</div></div>
          <div class="message" role="status" aria-live="polite"></div><div class="note">${t.help}</div><div class="foot"><span class="subtitle">LOCAL · FX3U</span><button data-button="shutdown">${t.shutdown}</button></div></div>
          </section>
          <section id="info-panel" class="info-panel" role="tabpanel" aria-labelledby="info-tab" data-panel="info" hidden>
            <h2>${t.infoTitle}</h2><div class="info-box"><p>${t.created}</p><strong>${PROJECT_AUTHOR}</strong><p>${t.community}</p><p>${t.version} ${CARD_VERSION}</p><button data-show-notes>${t.notes}</button></div>
            <div class="info-box"><h2>${t.support}</h2><p>${t.thanks}</p><div class="info-links"><a class="donate" href="${DONATION_URL}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${t.donate}</a></div><p>${t.voluntary}</p></div>
            <div class="info-links"><a href="${PROJECT_URL}" target="_blank" rel="noopener noreferrer">${t.github}</a><a href="${PROJECT_URL}/blob/main/docs/INSTALLATION.${this.language()}.md" target="_blank" rel="noopener noreferrer">${t.guide}</a><a href="${PROJECT_URL}/discussions" target="_blank" rel="noopener noreferrer">${t.discussion}</a><a href="${PROJECT_URL}/blob/main/CONTRIBUTORS.md" target="_blank" rel="noopener noreferrer">${t.acknowledgement}</a></div><p class="note">${t.updateHint}</p>
          </section>
          <div class="version-line">Home Assistant · ${t.version} ${CARD_VERSION}</div>
          <dialog data-release-notes aria-labelledby="release-title"><div class="release-version">DREVOS · ${t.version} ${CARD_VERSION}</div><h2 id="release-title">${t.notes}</h2><ul>${RELEASE_NOTES[this.language()].map(note=>`<li>${esc(note)}</li>`).join('')}</ul><button data-notes-close>${t.gotIt}</button><p class="note">${t.notesHint}</p></dialog>
          <div class="modal" hidden><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-title"><h3 id="confirm-title">${t.confirmTitle}</h3><p></p><div class="actions"><button data-cancel>${t.cancel}</button><button class="primary" data-confirm>${t.confirm}</button></div></section></div>
        </ha-card>`;
        this.shadowRoot.querySelectorAll('input').forEach(input=>input.addEventListener('input',()=>{input.dataset.dirty='true';delete input.dataset.awaiting;}));
        this.shadowRoot.querySelector('dialog[data-release-notes]').addEventListener('close',()=>this.acknowledgeRelease());
        this._mounted=true;
      }
      const s=this.shadowRoot;
      s.querySelectorAll('[data-panel]').forEach(panel=>{panel.hidden=panel.dataset.panel!==this._tab;});
      s.querySelectorAll('[data-tab]').forEach(button=>{button.setAttribute('aria-selected',String(button.dataset.tab===this._tab));button.disabled=this._pending||!!this._dialog||this._notesOpen;});
      s.querySelector('[data-show-notes]').disabled=this._pending||!!this._dialog;
      s.querySelector('[data-title]').textContent=this.config.title;
      const available=alive(this.state('kammertemperatur'));
      const automatic=this.state('automatik')?.state==='on';
      s.querySelector('ha-card').classList.toggle('offline',!available);
      s.querySelector('[data-status]').textContent=!available?t.offline:automatic?t.automatic:this.state('controls_available')?.state==='off'?t.readonly:t.online;
      s.querySelector('.missing').textContent=t.missing;
      s.querySelector('.missing').hidden=!!this._map.kammertemperatur;
      s.querySelectorAll('[data-reading]').forEach(node=>{const e=this.state(node.dataset.reading);node.textContent=alive(e)?e.state:'—';});
      for(const [key] of FIELDS) {
        const input=s.getElementById(key), e=this.state(key);
        if(input.dataset.awaiting!==undefined && alive(e) && Number(e.state)===Number(input.dataset.awaiting)) {
          delete input.dataset.awaiting;delete input.dataset.dirty;
        }
        if(s.activeElement!==input && input.dataset.dirty!=='true') input.value=alive(e)?e.state:'';
        input.disabled=!alive(e)||this._pending;
        s.querySelector(`[data-number="${key}"]`).disabled=!alive(e)||this._pending;
      }
      for(const [key] of SWITCHES) {
        const button=s.querySelector(`[data-switch="${key}"]`), e=this.state(key), on=e?.state==='on';
        button.setAttribute('aria-pressed',String(on));button.querySelector('b').textContent=alive(e)?on?t.on:t.off:'—';button.disabled=!alive(e)||this._pending;
      }
      for(const key of ['timer_restzeit','timer_laufzeit']) s.querySelector(`[data-clock="${key}"]`).textContent=alive(this.state(key))?this.state(key).state:'—';
      const timer=this.state('timer_lauf'), running=timer?.state==='on';
      s.querySelector('[data-timer-status]').textContent=alive(timer)?running?t.on:t.off:t.offline;
      s.querySelector('[data-timer]').textContent=running?t.pause:t.start;
      const energy=this.state('heizelement')?.state==='on'||this.state('rauchbetrieb')?.state==='on';
      s.querySelector('[data-timer]').disabled=!alive(timer)||this._pending||(running&&energy);
      for(const key of ['timer_reset','shutdown']) s.querySelector(`[data-button="${key}"]`).disabled=!alive(this.state(key))||this._pending||energy||running;
      this.showReleaseNotes();
    }
    async clicked(event) {
      const button=event.target.closest('button');if(!button||button.disabled)return;
      if(button.hasAttribute('data-notes-close')){this.shadowRoot.querySelector('dialog[data-release-notes]').close();return;}
      if(button.dataset.tab)return this.selectTab(button.dataset.tab);
      if(button.hasAttribute('data-show-notes'))return this.showReleaseNotes(true);
      if(this._notesOpen||this._tab==='info')return;
      if(button.hasAttribute('data-cancel')) return this.cancelDialog();
      if(button.hasAttribute('data-confirm')) {
        const action=this._dialog;this.cancelDialog();if(action)await this.perform(action.key,action.service,action.data,action.expected);
        return;
      }
      if(this._dialog||this._pending)return;
      if(button.dataset.number) return this.applyNumber(button.dataset.number);
      let key=button.dataset.switch,service,data={},message;
      if(key) {
        const current=this.state(key);if(!alive(current))return;
        service=current.state==='on'?'turn_off':'turn_on';
        if(service==='turn_on' && key==='heizelement')message=this.text().heatConfirm;
        if(service==='turn_on' && key==='rauchbetrieb')message=this.text().smokeConfirm;
      } else if(button.hasAttribute('data-timer')) {key='timer_lauf';service=this.state(key)?.state==='on'?'turn_off':'turn_on';}
      else {key=button.dataset.button;service='press';if(key==='shutdown')message=this.text().shutdownConfirm;}
      if(!key)return;
      const expected=this.state(key)?.state;
      if(message) {
        this._dialog={key,service,data,expected,source:button};
        const modal=this.shadowRoot.querySelector('.modal');modal.hidden=false;modal.querySelector('p').textContent=message;
        this.shadowRoot.querySelector('[data-cancel]').focus();return;
      }
      return this.perform(key,service,data,expected);
    }
    cancelDialog() {
      const action=this._dialog;this._dialog=null;this.shadowRoot.querySelector('.modal').hidden=true;
      if(action?.source?.isConnected)action.source.focus();
    }
    async applyNumber(key) {
      if(this._pending||this._dialog||this._notesOpen||this._tab==='info')return;
      const field=FIELDS.find(f=>f[0]===key);if(!field)return;
      const input=this.shadowRoot.getElementById(key);
      if(!input.value.trim())return this.message(this.text().invalid,true);
      const value=Number(input.value);
      if(!Number.isInteger(value)||value<field[2]||value>field[3]){input.focus();return this.message(this.text().invalid,true);}
      const ok=await this.perform(key,'set_value',{value});
      if(ok){input.dataset.awaiting=String(value);input.blur();this.render();}
    }
    message(text,error=false) {const node=this.shadowRoot.querySelector('.message');node.textContent=text;node.classList.toggle('error',error);}
    async perform(key,service,data={},expected) {
      if(this._pending||this._notesOpen||this._tab==='info')return false;
      const state=this.state(key),entity=this._map[key];
      if(!alive(state)||!entity)return false;
      if(expected!==undefined&&state.state!==expected){this.message(this.text().commandChanged,true);return false;}
      if(['shutdown','timer_reset'].includes(key) && (this.state('timer_lauf')?.state!=='off'||this.state('heizelement')?.state!=='off'||this.state('rauchbetrieb')?.state!=='off'))return false;
      this._pending=true;this.message(this.text().pending);this.render();
      try {await this._hass.callService(entity.split('.')[0],service,{entity_id:entity,...data});this.message(this.text().queued);return true;}
      catch {this.message(this.text().error,true);return false;}
      finally {this._pending=false;this.render();}
    }
  }

  class DrevosSmokerCardEditor extends HTMLElement {
    constructor(){super();this.attachShadow({mode:'open'});}
    setConfig(config){this.config={...config};this.render();}
    set hass(hass){this._hass=hass;this.render();}
    render(){
      if(!this.config||!this._hass)return;
      const t=TEXT[this._hass.language?.startsWith('de')?'de':'en'];
      const groups=new Map();for(const s of Object.values(this._hass.states)){if(s.attributes?.drevos_gateway_id)groups.set(s.attributes.drevos_gateway_id,s.attributes.drevos_device_name||s.attributes.drevos_gateway_id);}
      const signature=JSON.stringify([this.config.title,this.config.gateway_id,this.config.language,[...groups]]);
      if(this._editorSignature===signature)return;this._editorSignature=signature;
      this.shadowRoot.innerHTML=`<style>label{display:block;margin:14px 0 5px}input,select{width:100%;font:inherit;padding:10px;box-sizing:border-box}</style><label>${t.title}</label><input data-field="title" value="${esc(this.config.title||'Drevos')}"><label>${t.device}</label><select data-field="gateway_id"><option value="">${t.notSelected}</option>${[...groups].map(([id,name])=>`<option value="${esc(id)}" ${id===this.config.gateway_id?'selected':''}>${esc(name)}</option>`).join('')}</select><label>${t.language}</label><select data-field="language">${['auto','de','en'].map(l=>`<option ${l===(this.config.language||'auto')?'selected':''}>${l}</option>`).join('')}</select>`;
      this.shadowRoot.querySelectorAll('[data-field]').forEach(el=>el.addEventListener('change',()=>{
        this.config={...this.config,[el.dataset.field]:el.value};this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:this.config},bubbles:true,composed:true}));
      }));
    }
  }
  if(!customElements.get('drevos-smoker-card'))customElements.define('drevos-smoker-card',DrevosSmokerCard);
  if(!customElements.get('drevos-smoker-card-editor'))customElements.define('drevos-smoker-card-editor',DrevosSmokerCardEditor);
  window.customCards=window.customCards||[];
  if(!window.customCards.some(c=>c.type==='drevos-smoker-card'))window.customCards.push({type:'drevos-smoker-card',name:'Drevos Smoker',description:'Complete local smoker control · Räucherofen-Bedienung',preview:true});
})();
