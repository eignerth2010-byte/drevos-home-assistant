/* Drevos Smoker Panel — MIT License; see ../LICENSE. */
import './drevos-smoker-card.js?v=0.1.5';

class DrevosSmokerPanel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this._cards = new Map();
    this.shadowRoot.innerHTML = `
      <style>
        :host {display:block;height:100%;min-height:0;color:var(--primary-text-color);background:var(--primary-background-color);}
        .layout {display:flex;flex-direction:column;height:100%;overflow:hidden;}
        header {display:flex;align-items:center;flex:none;min-height:56px;padding:0 16px 0 4px;background:var(--app-header-background-color,var(--primary-color));color:var(--app-header-text-color,white);box-shadow:0 1px 3px #0002;z-index:1;}
        button {border:0;background:transparent;color:inherit;min-width:48px;min-height:48px;font:24px system-ui;cursor:pointer;}
        button:focus-visible {outline:2px solid currentColor;outline-offset:-5px;border-radius:8px;}
        h1 {margin:0 0 0 12px;font:500 20px var(--paper-font-common-base_-_font-family,system-ui);}
        main {flex:1;min-height:0;overflow:auto;padding:24px 16px;box-sizing:border-box;}
        .ovens {display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,480px),1fr));gap:24px;max-width:1120px;margin:auto;align-items:start;}
        drevos-smoker-card {display:block;width:100%;max-width:560px;justify-self:center;}
        .empty {text-align:center;padding:32px 12px;color:var(--secondary-text-color);}
        [hidden] {display:none !important;}
        @media(max-width:600px) {main {padding:12px 8px;} .ovens {gap:12px;}}
      </style>
      <div class="layout"><header><button type="button" aria-label="Toggle sidebar">☰</button><h1>Drevos</h1></header>
      <main><div class="empty" role="status"></div><div class="ovens"></div></main></div>`;
    this._container = this.shadowRoot.querySelector('.ovens');
    this._empty = this.shadowRoot.querySelector('.empty');
    this._menu = this.shadowRoot.querySelector('button');
    this._menu.addEventListener('click', () => this.dispatchEvent(new CustomEvent(
      'hass-toggle-menu', {bubbles: true, composed: true}
    )));
  }

  set panel(value) {
    this._panel = value;
    this._syncCards();
  }

  set hass(value) {
    this._hass = value;
    const de = value?.language?.startsWith('de');
    this._menu.setAttribute('aria-label', de ? 'Seitenleiste umschalten' : 'Toggle sidebar');
    this._empty.textContent = de
      ? 'Keine eingerichteten Drevos-Öfen verfügbar.'
      : 'No configured Drevos ovens are available.';
    this._syncCards();
    for (const card of this._cards.values()) card.hass = value;
  }

  _syncCards() {
    // HA may supply panel metadata before its context. Wait so the first
    // render, including release notes, already has the correct language.
    if (!this._hass) return;
    const raw = this._panel?.config?.gateways;
    const gateways = new Map();
    if (Array.isArray(raw)) {
      for (const item of raw) {
        if (item && typeof item.id === 'string' && item.id.length > 0) {
          gateways.set(item.id, typeof item.name === 'string' ? item.name : 'Drevos');
        }
      }
    }
    for (const [id, card] of this._cards) {
      if (!gateways.has(id)) {
        card.remove();
        this._cards.delete(id);
      }
    }
    for (const [id, name] of gateways) {
      let card = this._cards.get(id);
      if (!card) {
        card = document.createElement('drevos-smoker-card');
        card.hass = this._hass;
        card.setConfig({type: 'custom:drevos-smoker-card', gateway_id: id, title: name, language: 'auto'});
        this._cards.set(id, card);
        this._container.append(card);
        if (this._hass) card.hass = this._hass;
      }
    }
    this._empty.hidden = this._cards.size > 0;
  }
}

if (!customElements.get('drevos-smoker-panel')) {
  customElements.define('drevos-smoker-panel', DrevosSmokerPanel);
}
