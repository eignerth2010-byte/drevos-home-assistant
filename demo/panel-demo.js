import '../custom_components/drevos/www/drevos-smoker-panel.js?v=0.1.5';

const panel = document.querySelector('drevos-smoker-panel');
const ledger = document.getElementById('ledger');
const groups = {
  sensor: {kammertemperatur:'28.4', kerntemperatur:'16.8', raucheinstellung:'0', timer_restzeit:'01:30:00', timer_laufzeit:'00:00:00'},
  number: {kammertemperatur_soll:'0', kerntemperatur_ziel:'0', rauch_soll:'0', timer_dauer:'90'},
  switch: {heizelement:'off', rauchbetrieb:'off', konvektion:'off', luefter:'off', timer_lauf:'off'},
  button: {timer_reset:'unknown', shutdown:'unknown'},
  binary_sensor: {automatik:'off', controls_available:'on'},
};
let states = {}, online = true, second = false, count = 0;
const language = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'de';
for (const oven of ['one', 'two']) {
  for (const [domain, keys] of Object.entries(groups)) {
    for (const [key, state] of Object.entries(keys)) {
      const id = `${domain}.fixture_${oven}_${key}`;
      states[id] = {entity_id:id, state, attributes:{drevos_key:key, drevos_gateway_id:`fixture_${oven}`}};
    }
  }
}
function push() {
  panel.hass = {language, states:{...states}, callService:async (domain, service, data) => {
    if (!online || !states[data.entity_id] || !['set_value','turn_on','turn_off','press'].includes(service)) throw Error('Mock request rejected');
    count++;
    ledger.textContent = `${count} simulierte Befehle`;
    states[data.entity_id] = {...states[data.entity_id], state:service === 'set_value' ? String(data.value) : service === 'turn_on' ? 'on' : service === 'turn_off' ? 'off' : 'unknown'};
    push();
  }};
}
function configure() {
  panel.panel = {config:{gateways:[{id:'fixture_one',name:'Drevos Räucherofen'}, ...(second ? [{id:'fixture_two',name:'Zweiter Ofen'}] : [])]}};
  push();
}
document.getElementById('offline').addEventListener('click', () => {
  online = !online;
  for (const state of Object.values(states)) state.state = online ? groups[state.entity_id.split('.')[0]][state.attributes.drevos_key] : 'unavailable';
  push();
});
document.getElementById('language').addEventListener('click', () => {location.href = `panel.html?lang=${language === 'de' ? 'en' : 'de'}`;});
document.getElementById('second').addEventListener('click', () => {second = !second;configure();});
panel.addEventListener('hass-toggle-menu', () => document.body.classList.toggle('hide-sidebar'));
configure();
