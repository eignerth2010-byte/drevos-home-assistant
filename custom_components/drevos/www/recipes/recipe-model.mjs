// MIT licensed. Recipe preparation deliberately produces numeric settings only.
import { recipes as bundled } from './catalog.mjs?v=0.3.0';
import {createCatalogClient,phaseStamp,recipeImageUrl} from './catalog-client.mjs?v=0.3.0';
export {phaseStamp};
const fallback = {schemaVersion:1,updated:'2026-11-26',recipes:bundled};
export const catalogClient = createCatalogClient({fallback,store:{
  async getItem(key){return globalThis.localStorage?.getItem(key) ?? null;},
  async setItem(key,value){if(!globalThis.localStorage)throw Error('storage-unavailable');globalThis.localStorage.setItem(key,value);}
}});
export let recipes = catalogClient.snapshot().catalog.recipes;
catalogClient.subscribe(state=>{recipes=state.catalog.recipes;});
const localImages = new Set(bundled.map(recipe=>recipe.image));
export function imageUrl(recipe){return !recipe.imageRevision&&localImages.has(recipe.image)?new URL(`images/${recipe.image}.jpg`,import.meta.url).href:recipeImageUrl(recipe);}
export const FORM_URL = 'https://drevos-smoker-control.thankfulchick1.chatgpt.site/recipe-submit.html';
export function phaseFor(id, index, expected) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe || !Number.isInteger(index) || index < 0 || index >= recipe.phases.length) throw Error('recipe');
  const phase = recipe.phases[index];
  if(expected!==undefined&&phaseStamp(phase)!==expected)throw Error('recipe-changed');
  for (const [value, max] of [[phase.durationMinutes,9999],[phase.chamberC,120],[phase.coreC,115],[phase.smokePercent,100]]) {
    if (!Number.isInteger(value) || value < 0 || value > max) throw Error('recipe-range');
  }
  if (![phase.durationMinutes,phase.chamberC,phase.coreC,phase.smokePercent].some(v => v > 0)) throw Error('recipe-empty');
  return { recipe, phase: {...phase} };
}
export function commandsFor(id, index) {
  const {phase:p} = phaseFor(id,index);
  const commands = [['kammertemperatur_soll',p.chamberC],['kerntemperatur_ziel',p.coreC],['rauch_soll',p.smokePercent]];
  if (p.durationMinutes > 0) commands.push(['timer_dauer',p.durationMinutes]);
  return commands;
}
