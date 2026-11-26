const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const model=import(pathToFileURL(path.resolve('custom_components/drevos/www/recipes/recipe-model.mjs')));
const source=fs.readFileSync('custom_components/drevos/www/drevos-smoker-card.js','utf8');
function fixture(){
  const registry=new Map(),inputs=new Map();
  class Element{isConnected=true;attachShadow(){return this.shadowRoot={addEventListener(){},querySelector(){return {focus(){},hidden:true}},getElementById(key){if(!inputs.has(key))inputs.set(key,{value:'',dataset:{}});return inputs.get(key);}};}}
  const document={visibilityState:'visible'};
  vm.runInNewContext(source,{HTMLElement:Element,customElements:{get:k=>registry.get(k),define:(k,v)=>registry.set(k,v)},window:{},document,console,setTimeout,clearTimeout});
  const card=new (registry.get('drevos-smoker-card'))();card.config={language:'en'};card.render=()=>{};card.message=(text,error)=>card.feedback={text,error};card.intents=[];
  const values={kammertemperatur_soll:'0',kerntemperatur_ziel:'0',rauch_soll:'0',timer_dauer:'10',heizelement:'off',rauchbetrieb:'off',timer_lauf:'off',timer_laufzeit:'0:00:00',connection:'on',controls_available:'on',automatik:'off'};
  const maxima={kammertemperatur_soll:120,kerntemperatur_ziel:115,rauch_soll:100,timer_dauer:9999};
  card._map={};const states={};
  for(const [key,state] of Object.entries(values)){const id=(key in maxima?'number.':key==='timer_laufzeit'?'sensor.':'switch.')+'fixture_'+key;card._map[key]=id;states[id]={entity_id:id,state,attributes:key in maxima?{min:key==='timer_dauer'?1:0,max:maxima[key]}:{}};}
  card._hass={states,callService:async(domain,service,data)=>{card.intents.push({domain,service,...data});const state=card._hass.states[data.entity_id];card._hass={...card._hass,states:{...card._hass.states,[data.entity_id]:{...state,state:String(data.value)}}};}};
  return {card,inputs,document};
}
test('catalog contains 40 original-source recipes and preserves the user correction evidence',async()=>{
 const m=await model;assert.equal(m.recipes.length,40);assert.equal(new Set(m.recipes.map(r=>r.id)).size,40);
 const r=m.recipes.find(r=>r.id==='rippen-methode-2');assert.equal(r.phases[1].chamberC,85);assert.equal(r.phases[1].coreC,55);
 const raw=JSON.parse(fs.readFileSync('custom_components/drevos/www/recipes/catalog.json','utf8')).recipes.find(item=>item.id==='rippen-methode-2');assert.equal(raw.originalDisplaySettings[1][1],185);assert.equal(raw.correction.status,'user_suggested');
 assert.ok(m.recipes.every(r=>r.source.kind==='drevos_original'&&r.source.foodSafetyReviewed===false));
});
test('preparing a selected phase writes only its four numbers and requires controller feedback',async()=>{
 const {card:c,inputs}=fixture();c._recipeModule=await model;c.stageRecipe({id:'lachs-kalt',index:1});assert.equal(c.intents.length,0);assert.equal(inputs.get('kammertemperatur_soll').value,'20');
 assert.equal(await c.prepareRecipe(),true);assert.equal(c.intents.length,4);assert.ok(c.intents.every(i=>i.domain==='number'&&i.service==='set_value'));
 assert.equal(c._recipeDraft.prepared,true);for(const k of ['heizelement','rauchbetrieb','timer_lauf'])assert.equal(c.state(k).state,'off');
});
test('zero time omits the timer and unused phases cannot stage or write',async()=>{
 const m=await model;assert.ok(!m.commandsFor('gemischte-wuerstchen',2).some(([key])=>key==='timer_dauer'));
 const {card:c}=fixture();c._recipeModule=m;c.stageRecipe({id:'haehnchenfilet-rollen',index:0});assert.equal(c._recipeDraft,null);assert.equal(c.intents.length,0);
});
test('active equipment and an old elapsed timer prevent any preparation write',async()=>{
 for(const key of ['heizelement','rauchbetrieb','timer_lauf','timer_laufzeit']){const {card:c}=fixture();c._recipeModule=await model;c.stageRecipe({id:'lachs-kalt',index:1});c.state(key).state=key==='timer_laufzeit'?'0:01:00':'on';assert.equal(await c.prepareRecipe(),false);assert.equal(c.intents.length,0);}
});
test('partial failure is not retried, never starts equipment and keeps the phase unprepared',async()=>{
 const {card:c}=fixture();c._recipeModule=await model;c.stageRecipe({id:'lachs-kalt',index:1});const send=c._hass.callService;
 c._hass.callService=async(...args)=>{if(c.intents.length===1){c.intents.push({failed:true});throw Error('disconnected');}return send(...args);};
 assert.equal(await c.prepareRecipe(),false);assert.equal(c.intents.length,2);assert.equal(c._recipeDraft.prepared,false);assert.equal(c.feedback.error,true);
 assert.equal(await c.perform('heizelement','turn_on'),false);assert.equal(c.intents.length,2);
});
test('duplicate transfer, disconnect, hidden page and gateway changes stop remaining writes',async()=>{
 for(const fault of ['disconnect','hidden','gateway']){
  const {card:c,document}=fixture();c._recipeModule=await model;c.stageRecipe({id:'lachs-kalt',index:1});let release;const send=c._hass.callService;
  c._hass.callService=(...args)=>new Promise(resolve=>{release=async()=>{await send(...args);if(fault==='disconnect')c.state('connection').state='off';if(fault==='hidden')document.visibilityState='hidden';if(fault==='gateway')c._map.rauch_soll='number.other_gateway';resolve();};});
  const first=c.prepareRecipe();assert.equal(await c.prepareRecipe(),false);await release();assert.equal(await first,false);assert.equal(c.intents.length,1);assert.equal(c._recipeDraft.prepared,false);
 }
});
test('a later external target change blocks starting a prepared phase',async()=>{
 const {card:c}=fixture();c._recipeModule=await model;c.stageRecipe({id:'lachs-kalt',index:1});await c.prepareRecipe();c.state('rauch_soll').state='99';const count=c.intents.length;
 assert.equal(await c.perform('heizelement','turn_on'),false);assert.equal(c.intents.length,count);
});

test('a catalog refresh adds recipes without writes and preserves a previously selected phase',async()=>{
 const m=await model,raw=JSON.parse(fs.readFileSync('custom_components/drevos/www/recipes/catalog.json','utf8'));
 const next=structuredClone(raw);next.revision='test-next';next.recipes.find(r=>r.id==='rippen-methode-2').phases[1].chamberC=90;
 next.recipes.push({...structuredClone(next.recipes[0]),id:'community-test',image:'community-test',source:{kind:'community',author:'Test author'}});
 const {card:c}=fixture();c._recipeModule=m;c.stageRecipe({id:'rippen-methode-2',index:1,expected:m.phaseStamp(m.phaseFor('rippen-methode-2',1).phase)});
 const original=globalThis.fetch;
 try{
  globalThis.fetch=async()=>new Response(JSON.stringify(next));await m.catalogClient.refresh(true);
  assert.equal(m.recipes.length,41);assert.equal(m.recipes.at(-1).source.kind,'community');assert.ok(m.imageUrl(m.recipes.at(-1)).startsWith('https://raw.githubusercontent.com/'));
  assert.equal(c.intents.length,0);assert.equal(c._recipeDraft.phase.chamberC,85);
  assert.equal(await c.prepareRecipe(),true);assert.equal(c.intents[0].value,85);
  const stale=fixture().card;stale._recipeModule=m;stale.stageRecipe({id:'rippen-methode-2',index:1,expected:m.phaseStamp({...m.phaseFor('rippen-methode-2',1).phase,chamberC:85})});
  assert.equal(stale._recipeDraft,null);assert.equal(stale.intents.length,0);
 }finally{globalThis.fetch=async()=>new Response(JSON.stringify(raw));await m.catalogClient.refresh(true);globalThis.fetch=original;}
});

test('the HA catalog client retains the last valid content offline and rejects invalid updates atomically',async()=>{
 const {createCatalogClient}=await import(pathToFileURL(path.resolve('custom_components/drevos/www/recipes/catalog-client.mjs')));
 const raw=JSON.parse(fs.readFileSync('custom_components/drevos/www/recipes/catalog.json','utf8'));let cache=null;
 const store={getItem:async()=>cache,setItem:async(key,value)=>{assert.equal(key,'drevos.recipes.public.v1');cache=value;}};
 const next=structuredClone(raw);next.recipes.push({...structuredClone(raw.recipes[0]),id:'offline-test',image:'offline-test',source:{kind:'community'}});
 await createCatalogClient({fallback:raw,store,fetcher:async()=>new Response(JSON.stringify(next))}).refresh();
 const bad=structuredClone(next);bad.recipes[0].phases[0].chamberC=999;
 const offline=await createCatalogClient({fallback:raw,store,fetcher:async()=>new Response(JSON.stringify(bad))}).refresh();
 assert.equal(offline.status,'offline');assert.equal(offline.catalog.recipes.length,41);assert.equal(JSON.parse(cache).recipes[0].phases[0].chamberC,20);
});
