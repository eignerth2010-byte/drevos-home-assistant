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

function notesFixture({seen=null,brokenStorage=false}={}) {
 const registry=new Map(),stored=new Map(seen?[['drevos.ha.release-notes.v1',seen]]:[]);
 const environment={visibilityState:'visible',createElement(){}};
 let dirty=false,opened=0,current;
 const dialog={open:false,showModal(){this.open=true;opened++;},close(){this.open=false;current.acknowledgeRelease();}};
 const root={activeElement:null,addEventListener(){},querySelector(selector){
   if(selector==='dialog[data-release-notes]')return dialog;
   if(selector==='input[data-dirty="true"]')return dirty?{}:null;
   return null;
 }};
 class NotesElement {isConnected=true;attachShadow(){this.shadowRoot=root;return root;}}
 vm.runInNewContext(source,{HTMLElement:NotesElement,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},
   window:{localStorage:{getItem(k){if(brokenStorage)throw Error('storage unavailable');return stored.get(k)||null;},setItem(k,v){if(brokenStorage)throw Error('storage unavailable');stored.set(k,v);}}},document:environment,console});
 const NotesCard=registry.get('drevos-smoker-card');
 function make(){const c=new NotesCard();c.config={language:'en'};c.render=()=>{};c._hass={states:{}};current=c;return c;}
 const instance=make();
 return {instance,make,root,dialog,stored,environment,setDirty:value=>dirty=value,opened:()=>opened};
}

test('Info navigation dispatches nothing and is deferred during commands/confirmations',()=>{
 const c=card();c.selectTab('info');assert.equal(c._tab,'info');assert.equal(c.intents.length,0);
 c._pending=true;c.selectTab('oven');assert.equal(c._tab,'info');c._pending=false;
 c._dialog={key:'heizelement'};c.selectTab('oven');assert.equal(c._tab,'info');c._dialog=null;
 c._notesOpen=true;c.selectTab('oven');assert.equal(c._tab,'info');c._notesOpen=false;
 c.selectTab('unsupported');assert.equal(c._tab,'info');c.selectTab('oven');assert.equal(c._tab,'oven');
});
test('release notes defer commands, confirmations, hidden views and target drafts',()=>{
 const f=notesFixture(),c=f.instance;
 c._pending=true;c.showReleaseNotes();assert.equal(f.opened(),0);c._pending=false;
 c._dialog={};c.showReleaseNotes();assert.equal(f.opened(),0);c._dialog=null;
 f.environment.visibilityState='hidden';c.showReleaseNotes();assert.equal(f.opened(),0);f.environment.visibilityState='visible';
 f.setDirty(true);c.showReleaseNotes();assert.equal(f.opened(),0);f.setDirty(false);
 f.root.activeElement={tagName:'INPUT'};c.showReleaseNotes();assert.equal(f.opened(),0);f.root.activeElement=null;
 c.showReleaseNotes();assert.equal(f.opened(),1);assert.equal(c._notesOpen,true);
});
test('acknowledgement stores only the public version and notes can be reopened manually',()=>{
 const f=notesFixture(),c=f.instance;c.showReleaseNotes();f.dialog.close();
 assert.equal(c._notesOpen,false);assert.equal(f.stored.size,1);assert.equal(f.stored.get('drevos.ha.release-notes.v1'),'0.3.0');
 const second=f.make();second.showReleaseNotes();assert.equal(f.opened(),1);
 second.showReleaseNotes(true);assert.equal(f.opened(),2);
});
test('already acknowledged release does not reopen and unavailable storage is tolerated',()=>{
 const seen=notesFixture({seen:'0.3.0'});seen.instance.showReleaseNotes();assert.equal(seen.opened(),0);
 const blocked=notesFixture({brokenStorage:true});blocked.instance.showReleaseNotes();assert.equal(blocked.opened(),1);
 assert.doesNotThrow(()=>blocked.dialog.close());blocked.instance.showReleaseNotes();assert.equal(blocked.opened(),1);
});
test('removing an open card does not record an unread release as acknowledged',()=>{
 const f=notesFixture();f.instance.showReleaseNotes();f.instance.disconnectedCallback();
 assert.equal(f.stored.size,0);assert.equal(f.instance._notesOpen,false);
});
test('Info and release-note surfaces cannot dispatch an oven command',async()=>{
 for(const surface of ['info','notes']){
  const c=card();if(surface==='info')c._tab='info';else c._notesOpen=true;
  assert.equal(await c.perform('luefter','turn_on',{},'off'),false);assert.equal(c.intents.length,0);
 }
});
test('card, integration and manifest advertise the same release',()=>{
 const manifest=JSON.parse(fs.readFileSync('custom_components/drevos/manifest.json','utf8'));
 const version=source.match(/const CARD_VERSION = '([^']+)'/)[1];
 assert.equal(manifest.version,version);
 assert.match(fs.readFileSync('custom_components/drevos/const.py','utf8'),new RegExp('VERSION = "'+version.replaceAll('.','\\.')+'"'));
});
