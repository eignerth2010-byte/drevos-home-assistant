// MIT licensed. This element receives no Home Assistant session or device data.
import {recipes,phaseFor,phaseStamp,catalogClient,imageUrl,FORM_URL} from './recipe-model.mjs?v=0.3.0';
export {recipes,phaseFor,commandsFor} from './recipe-model.mjs?v=0.3.0';
const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const copy = {
  de: {title:'Rezepte',intro:'Rezepte. Originale vom Ofendisplay und Community-Beiträge sind getrennt gekennzeichnet. Jede Phase einzeln vorbereiten und selbst starten; Pausen bleiben erhalten.',search:'Rezept suchen',back:'Alle Rezepte',ingredients:'Zutaten',method:'Zubereitung',original:'Drevos-Originalrezept',origin:'Die Kennzeichnung beschreibt die Herkunft, keine Prüfung der Lebensmittelsicherheit. Die Originaltexte bleiben auf Deutsch.',notes:'Hinweise zur Vorlage',phase:'Phase',choose:'Phase auswählen',unavailable:'In der Vorlage nicht verwendet',range:'Werte außerhalb der unterstützten Grenzen',noTimer:'0 Minuten in der Vorlage: kein manueller Timer wird übernommen oder gestartet.',drying:'Rauch 0 % aus dem SPS-Trocknungsprogramm; kein eigenes Eingabefeld am Rezeptdisplay.',unknown:'Konvektion und Lüfter sind nicht belegt und bleiben unverändert.',needsDevice:'Zum Übertragen einen verfügbaren Ofen wählen.',photo:'Produktbild aus dem Displayfoto mit KI aufbereitet.',own:'Eigene Rezepte speichern oder einreichen',ownHint:'Öffnet das Formular im Browser. Persönliche Entwürfe mit Foto bleiben in diesem Browser. Einsendungen an Thomas werden vor Veröffentlichung geprüft und als Community-Rezepte gekennzeichnet.',none:'Kein Rezept gefunden',chamber:'Kammer',core:'Kernziel',smoke:'Rauch',duration:'Dauer'},
  en: {title:'Recipes',intro:'recipes. Oven-display originals and community contributions have separate labels. Prepare and start each phase yourself; observe pauses.',search:'Search recipes',back:'All recipes',ingredients:'Ingredients',method:'Instructions',original:'Drevos original recipe',origin:'This label describes the source, not a food safety review. Original recipe texts remain in German.',notes:'Source notes',phase:'Phase',choose:'Select phase',unavailable:'Unused in the source',range:'Values outside supported limits',noTimer:'The source shows 0 minutes: no manual timer is copied or started.',drying:'Smoke 0% comes from the PLC drying program; there is no smoke field on the recipe display.',unknown:'Convection and fan are not specified and remain unchanged.',needsDevice:'Select an available oven to transfer settings.',photo:'Product photograph restored from a display photo with AI.',own:'Save or submit your own recipe',ownHint:'Opens the browser form. Personal drafts and photos stay in that browser. Thomas reviews submissions before publication; user submissions are labelled as community recipes.',none:'No matching recipe',chamber:'Chamber',core:'Core target',smoke:'Smoke',duration:'Duration'}
};
class DrevosRecipeBook extends HTMLElement {
  constructor() {
    super();this.attachShadow({mode:'open'});this._language='de';this._ready=false;this.query='';this.selected=null;this._catalogState=catalogClient.snapshot();
    this.shadowRoot.addEventListener('click',event=>{
      const button=event.target.closest('button');if(!button || button.disabled)return;
      event.stopPropagation();
      if(button.hasAttribute('data-refresh')){void catalogClient.refresh(true);return;}
      if(button.dataset.recipe){this.selected=button.dataset.recipe;this.render();this.shadowRoot.querySelector('h2')?.focus();}
      if(button.hasAttribute('data-back')){this.selected=null;this.render();this.shadowRoot.querySelector('input')?.focus();}
      if(button.dataset.phase!==undefined){const index=Number(button.dataset.phase),expected=button.dataset.stamp;try{phaseFor(this.selected,index,expected);}catch{return;}
        this.dispatchEvent(new CustomEvent('drevos-recipe-select',{detail:{id:this.selected,index,expected},bubbles:true,composed:true}));}
    });
    this.shadowRoot.addEventListener('input',event=>{if(event.target.matches('input')){this.query=event.target.value;this.renderList();}});
  }
  connectedCallback(){
    this.render();
    this._unsubscribe=catalogClient.subscribe(state=>{
      const changed=this._catalogState.catalog!==state.catalog;
      this._catalogState=state;
      if(changed){
        const input=this.shadowRoot.querySelector('input'),focused=input&&this.shadowRoot.activeElement===input,start=input?.selectionStart,end=input?.selectionEnd;
        if(this.selected&&!recipes.some(recipe=>recipe.id===this.selected))this.selected=null;
        this.render();
        if(focused){const next=this.shadowRoot.querySelector('input');next?.focus();if(next&&start!==null&&end!==null)next.setSelectionRange(start,end);}
      }else this.updateCatalogStatus();
    });
    void catalogClient.refresh();
  }
  disconnectedCallback(){this._unsubscribe?.();this._unsubscribe=null;}
  updateCatalogStatus(){
    const de=this._language==='de',state=this._catalogState,node=this.shadowRoot.querySelector('[data-catalog-status]'),button=this.shadowRoot.querySelector('[data-refresh]');
    if(node)node.textContent=(state.busy?(de?'Rezeptkatalog wird geladen …':'Loading recipe catalog …'):state.status==='online'?(de?'Online-Rezeptkatalog geladen.':'Online recipe catalog loaded.'):state.status==='offline'?(de?'Online-Aktualisierung nicht möglich. Gespeicherte Rezepte bleiben verfügbar.':'Could not refresh online. Saved recipes remain available.'):(de?'Gespeicherter Rezeptkatalog verfügbar.':'Saved recipe catalog available.'))+' '+(de?'Stand: ':'Catalog date: ')+state.catalog.updated+(!state.persistent?(de?' Speichern auf diesem Gerät nicht möglich.':' Could not save on this device.'):'');
    if(button)button.disabled=state.busy;
  }
  set language(value){const next=value==='de'?'de':'en';if(next!==this._language){this._language=next;this.render();}}
  set canPrepare(value){this._ready=!!value;this.shadowRoot.querySelectorAll('[data-phase]').forEach(b=>b.disabled=!this._ready||b.dataset.invalid==='true');}
  renderList(){
    const t=copy[this._language],q=this.query.toLocaleLowerCase(this._language);
    const rows=recipes.filter(r=>(r.name+' '+r.category).toLocaleLowerCase(this._language).includes(q));
    this.shadowRoot.querySelector('.grid').innerHTML=rows.map(r=>`<button class="tile" data-recipe="${esc(r.id)}"><img loading="lazy" src="${esc(imageUrl(r))}" referrerpolicy="no-referrer" alt="${esc(r.name)}"><strong>${esc(r.name)}</strong><span>${esc(r.category)}</span><span>${r.source.kind==='drevos_original'?t.original:(this._language==='de'?'Community-Rezept':'Community recipe')}</span></button>`).join('')||`<p>${t.none}</p>`;
  }
  render(){
    const t=copy[this._language],de=this._language==='de',r=recipes.find(r=>r.id===this.selected);
    this.shadowRoot.innerHTML=`<style>
      :host{display:block;color:#f3f0e9;font:14px/1.6 system-ui,sans-serif}*{box-sizing:border-box}h2{font-size:25px;line-height:1.3;margin:16px 0}h3{font-size:18px;margin:20px 0 10px}p{margin:10px 0}.muted{color:#b9bec3;font-size:12px}.badge{display:inline-block;color:#ffbd74;background:#5d3a20;padding:4px 9px;border-radius:20px;font-size:12px}button,a,input{font:inherit}button,a{color:inherit;background:#30363c;border:1px solid #73787e;border-radius:9px;padding:12px;min-height:46px;cursor:pointer}button:disabled{opacity:.4;cursor:default}button:focus-visible,a:focus-visible,input:focus{outline:2px solid #ffad55;outline-offset:2px}input{width:100%;padding:13px;background:#14191d;color:inherit;border:1px solid #777d85;border-radius:9px;margin:12px 0}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.tile{text-align:left;padding:0;overflow:hidden}.tile img{width:100%;aspect-ratio:4/3;object-fit:cover;display:block}.tile strong,.tile span{display:block;margin:8px 11px}.tile span{font-size:11px;color:#b9bec3}.hero{display:block;width:100%;max-height:330px;aspect-ratio:4/3;object-fit:cover;border-radius:12px;margin-top:16px}.prose{white-space:pre-line}.phase{background:#ffffff06;border:1px solid #ffffff25;border-radius:12px;padding:14px;margin:12px 0}.values{display:grid;grid-template-columns:1fr 1fr;gap:8px}.values span{color:#b9bec3;font-size:12px}.values strong{display:block;font-size:19px;color:#ffbd74;font-weight:500}.phase button{width:100%;margin-top:10px}.source{border-left:3px solid #ffad55;padding:1px 14px;margin:18px 0;background:#ffad550b}.own{border-top:1px solid #ffffff25;margin-top:24px;padding-top:20px}.own a{display:block;text-align:center;text-decoration:none;background:#a46532}details{margin:16px 0}summary{cursor:pointer;color:#ffbd74} @media(min-width:760px){.grid{grid-template-columns:repeat(3,minmax(0,1fr))}} @media(max-width:310px){.grid{grid-template-columns:1fr}}
    </style><p class="muted" data-catalog-status role="status"></p><button data-refresh>${de?'Rezepte aktualisieren':'Refresh recipes'}</button>${r?`<button data-back>← ${t.back}</button><h2 tabindex="-1">${esc(r.name)}</h2><span class="badge">${r.source.kind==='drevos_original'?t.original:(de?'Community-Rezept':'Community recipe')}${r.source.author?' · '+esc(r.source.author):''}</span><img class="hero" src="${esc(imageUrl(r))}" referrerpolicy="no-referrer" alt="${esc(r.name)}"><p class="muted">${esc(r.imageNote)||(de?'Rezeptfoto':'Recipe photo')}</p><h3>${t.ingredients}</h3><p class="prose">${esc(r.ingredients)}</p><h3>${t.method}</h3><p class="prose">${esc(r.method)}</p>${r.notes?`<aside class="source"><h3>${t.notes}</h3><p>${esc(r.notes)}</p></aside>`:''}<p class="muted">${t.origin}</p>${r.phases.map((p,index)=>{
      let valid=true,reason='';try{phaseFor(r.id,index);}catch(error){valid=false;reason=error.message==='recipe-empty'?t.unavailable:t.range;}
      return `<section class="phase"><h3>${t.phase} ${index+1} · ${esc(p.name)}</h3><div class="values">${[[t.duration,p.durationMinutes,'min'],[t.chamber,p.chamberC,'°C'],[t.core,p.coreC,'°C'],[t.smoke,p.smokePercent,'%']].map(([key,value,unit])=>`<span>${key}<strong>${value} ${unit}</strong></span>`).join('')}</div>${p.smokeFromProgram?`<p class="muted">${t.drying}</p>`:''}${p.durationMinutes===0?`<p class="muted">${t.noTimer}</p>`:''}<button data-phase="${index}" data-stamp="${esc(phaseStamp(p))}" data-invalid="${!valid}" ${!valid||!this._ready?'disabled':''}>${valid?t.choose:reason}</button></section>`;
    }).join('')}<p class="muted">${t.unknown}</p>${!this._ready?`<p>${t.needsDevice}</p>`:''}`:`<h2>${t.title}</h2><p>${recipes.length} ${t.intro}</p><label><span class="muted">${t.search}</span><input type="search" value="${esc(this.query)}" placeholder="${t.search}"></label><div class="grid"></div>`}<section class="own"><a href="${FORM_URL}?lang=${this._language}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${t.own}</a><p class="muted">${t.ownHint}</p></section>`;
    if(!r)this.renderList();this.updateCatalogStatus();
  }
}
if(!customElements.get('drevos-recipe-book'))customElements.define('drevos-recipe-book',DrevosRecipeBook);
