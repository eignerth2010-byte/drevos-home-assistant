const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const source=fs.readFileSync('custom_components/drevos/www/drevos-smoker-card.js','utf8');
const classes=new Map();
const shadow={addEventListener(){},querySelector(){return {hidden:true,textContent:'',classList:{toggle(){}}};}};
class Element {attachShadow(){this.shadowRoot=Object.create(shadow);return this.shadowRoot;}}
vm.runInNewContext(source,{HTMLElement:Element,customElements:{get:k=>classes.get(k),define:(k,v)=>classes.set(k,v)},window:{},document:{createElement(){}},console});
const Card=classes.get('drevos-smoker-card');
function card(){
 const c=new Card();c.render=()=>{};c.message=(text,error)=>{c.feedback={text,error}};
 c.config={language:'en'};c._map={luefter:'switch.fixture_fan',kammertemperatur_soll:'number.fixture_target',shutdown:'button.fixture_shutdown',timer_lauf:'switch.fixture_timer',heizelement:'switch.fixture_heat',rauchbetrieb:'switch.fixture_smoke'};
 c.intents=[];c._hass={states:Object.fromEntries(Object.values(c._map).map(id=>[id,{entity_id:id,state:id.startsWith('number.')?'0':'off',attributes:{}}])),callService:async(...args)=>c.intents.push(args)};
 return c;
}
test('source registers real card and editor once',()=>{assert.ok(Card);assert.ok(classes.get('drevos-smoker-card-editor'));});
test('exact explicit switch command; no optimistic mutation',async()=>{
 const c=card();assert.equal(await c.perform('luefter','turn_on',{},'off'),true);
 assert.equal(c.intents.length,1);assert.equal(c.intents[0][0],'switch');assert.equal(c.intents[0][1],'turn_on');assert.equal(c.intents[0][2].entity_id,'switch.fixture_fan');
 assert.equal(c.state('luefter').state,'off');
});
test('busy double submission produces one intent',async()=>{
 const c=card();let release;c._hass.callService=(...args)=>{c.intents.push(args);return new Promise(r=>release=r)};
 const first=c.perform('luefter','turn_on');assert.equal(await c.perform('luefter','turn_on'),false);release();await first;assert.equal(c.intents.length,1);
});
test('failed command remains failed and is not retried',async()=>{
 const c=card();c._hass.callService=async()=>{c.intents.push('failed');throw Error('unreachable')};
 assert.equal(await c.perform('luefter','turn_on'),false);assert.equal(c.intents.length,1);assert.equal(c.feedback.error,true);assert.equal(c._pending,false);
});
test('unavailable, removed and concurrently changed entities do not dispatch',async()=>{
 for(const state of ['unavailable','unknown','on']){const c=card();c.state('luefter').state=state;assert.equal(await c.perform('luefter','turn_on',{},'off'),false);assert.equal(c.intents.length,0);}
 const c=card();delete c._hass.states[c._map.luefter];assert.equal(await c.perform('luefter','turn_on'),false);assert.equal(c.intents.length,0);
});
test('shutdown guard blocks active heat smoke and timer',async()=>{
 for(const key of ['heizelement','rauchbetrieb','timer_lauf']){const c=card();c.state(key).state='on';assert.equal(await c.perform('shutdown','press'),false);assert.equal(c.intents.length,0);}
});
test('a never-pressed but available HA button is usable',async()=>{
 const c=card();c.state('shutdown').state='unknown';
 assert.equal(await c.perform('shutdown','press'),true);
 assert.equal(c.intents.length,1);
});
test('invalid numeric drafts never dispatch; valid draft survives delayed HA echo',async()=>{
 for(const value of ['','121','-1','12.5','NaN']){const c=card();const input={value,dataset:{dirty:'true'},focus(){}};c.shadowRoot.getElementById=()=>input;await c.applyNumber('kammertemperatur_soll');assert.equal(c.intents.length,0);}
 const c=card();const input={value:'35',dataset:{dirty:'true'},blur(){}};c.shadowRoot.getElementById=()=>input;await c.applyNumber('kammertemperatur_soll');assert.equal(c.intents.length,1);assert.equal(c.intents[0][2].value,35);assert.equal(input.dataset.dirty,'true');assert.equal(input.dataset.awaiting,'35');
});
test('auto selection never mixes two gateways',()=>{
 const c=card();c.config={};c._hass.states={a:{entity_id:'sensor.a',state:'10',attributes:{drevos_gateway_id:'fixture_a',drevos_key:'kammertemperatur'}},b:{entity_id:'sensor.b',state:'20',attributes:{drevos_gateway_id:'fixture_b',drevos_key:'kammertemperatur'}}};c.resolveEntities();assert.equal(c._map.kammertemperatur,undefined);c.config.gateway_id='fixture_b';c.resolveEntities();assert.equal(c._map.kammertemperatur,'sensor.b');
});
