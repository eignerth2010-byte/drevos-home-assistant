const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('custom_components/drevos/www/drevos-smoker-panel.js', 'utf8');

function fixture() {
  class Node {
    constructor() { this.children = []; this.attributes = {}; this.listeners = {}; }
    append(child) { this.children.push(child); child.parent = this; }
    remove() { this.parent.children = this.parent.children.filter(child => child !== this); }
    setAttribute(name, value) { this.attributes[name] = value; }
    addEventListener(name, listener) { this.listeners[name] = listener; }
  }
  const container = new Node(), empty = new Node(), menu = new Node();
  class Element extends Node {
    attachShadow() {
      this.shadowRoot = {querySelector: selector => ({'.ovens': container, '.empty': empty, button: menu})[selector]};
    }
    dispatchEvent(event) { this.event = event; }
  }
  class Card extends Node {
    setConfig(value) { this.config = value; this.configCount = (this.configCount || 0) + 1; }
  }
  const classes = new Map();
  const context = {HTMLElement: Element, document: {createElement: tag => {
    assert.equal(tag, 'drevos-smoker-card'); return new Card();
  }}, customElements: {get: key => classes.get(key), define: (key, value) => classes.set(key, value)},
  CustomEvent: class {constructor(type, options) { this.type = type; Object.assign(this, options); }}};
  const executable = source.replace(/^import [^\n]+;\s*$/m, '');
  vm.runInNewContext(executable, context);
  const Constructor = classes.get('drevos-smoker-panel');
  const panel = new Constructor();
  return {panel, container, empty, menu, classes, context, executable};
}

test('panel imports the same local versioned card as the integration resource', () => {
  const version = JSON.parse(fs.readFileSync('custom_components/drevos/manifest.json', 'utf8')).version;
  assert.ok(source.includes(`import './drevos-smoker-card.js?v=${version}';`));
  assert.equal((source.match(/^import /gm) || []).length, 1);
});

test('each oven is explicitly bound to its own gateway; updates retain drafts and card instances', () => {
  const {panel, container} = fixture();
  panel.hass = {language: 'de', states: {}};
  const config = {config: {gateways: [{id: 'oven_a', name: 'First'}, {id: 'oven_b', name: 'Second'}]}};
  panel.panel = config;
  const [first, second] = container.children;
  first.draft = '42';
  panel.hass = {language: 'de', states: {a: {state: 'unavailable'}}};
  panel.panel = {config: {gateways: [...config.config.gateways]}};
  panel.hass = {language: 'de', states: {a: {state: '24'}}};
  assert.equal(container.children[0], first);
  assert.equal(first.config.gateway_id, 'oven_a');
  assert.equal(second.config.gateway_id, 'oven_b');
  assert.equal(first.draft, '42');
  assert.equal(first.configCount, 1);
  assert.equal(first.hass, second.hass);
});

test('an oven added after hass arrives receives the current state and removing it preserves the other', () => {
  const {panel, container} = fixture();
  const hass = {language: 'en', states: {}};
  panel.hass = hass;
  panel.panel = {config: {gateways: [{id: 'a'}, {id: 'b'}]}};
  const remaining = container.children[1];
  assert.equal(remaining.hass, hass);
  panel.panel = {config: {gateways: [{id: 'b'}]}};
  assert.equal(container.children.length, 1);
  assert.equal(container.children[0], remaining);
});

test('missing and malformed gateway metadata never create an automatically targeted card', () => {
  const {panel, container, empty} = fixture();
  panel.hass = {language: 'de', states: {}};
  for (const value of [{}, {config: {gateways: [null, {}, {id: ''}, {id: 5}]}}, {config: {gateways: 'a'}}]) {
    panel.panel = value;
    assert.equal(container.children.length, 0);
    assert.equal(empty.hidden, false);
  }
  panel.panel = {config: {gateways: [{id: 'a'}, {id: 'a'}]}};
  assert.equal(container.children.length, 1);
  assert.equal(empty.hidden, true);
});

test('gateway names are text configuration and cannot become panel HTML', () => {
  const {panel, container} = fixture();
  panel.hass = {language: 'de', states: {}};
  const title = '<img src=x onerror=alert(1)>';
  panel.panel = {config: {gateways: [{id: 'a', name: title}]}};
  assert.equal(container.children[0].config.title, title);
  assert.ok(!panel.shadowRoot.innerHTML.includes(title));
});

test('sidebar button emits the native navigation event and has localized accessible text', () => {
  const {panel, menu, empty} = fixture();
  panel.hass = {language: 'de', states: {}};
  assert.equal(menu.attributes['aria-label'], 'Seitenleiste umschalten');
  assert.match(empty.textContent, /Keine eingerichteten/);
  menu.listeners.click();
  assert.equal(panel.event.type, 'hass-toggle-menu');
  assert.equal(panel.event.bubbles, true);
  assert.equal(panel.event.composed, true);
  panel.hass = {language: 'en', states: {}};
  assert.equal(menu.attributes['aria-label'], 'Toggle sidebar');
});

test('loading the panel module again does not redefine the custom element', () => {
  const f = fixture();
  const first = f.classes.get('drevos-smoker-panel');
  vm.runInNewContext(f.executable, {...f.context});
  assert.equal(f.classes.get('drevos-smoker-panel'), first);
});

test('panel metadata arriving before hass waits for the first localized context', () => {
  const {panel, container} = fixture();
  panel.panel = {config: {gateways: [{id: 'a'}]}};
  assert.equal(container.children.length, 0);
  panel.hass = {language: 'de', states: {}};
  assert.equal(container.children.length, 1);
  assert.equal(container.children[0].hass.language, 'de');
});
