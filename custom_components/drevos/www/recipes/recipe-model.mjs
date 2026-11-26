// MIT licensed. Recipe preparation deliberately produces numeric settings only.
import { recipes } from './catalog.mjs?v=0.2.0';
export { recipes };
export const FORM_URL = 'https://drevos-smoker-control.thankfulchick1.chatgpt.site/recipe-submit.html';
export function phaseFor(id, index) {
  const recipe = recipes.find(r => r.id === id);
  if (!recipe || !Number.isInteger(index) || index < 0 || index >= recipe.phases.length) throw Error('recipe');
  const phase = recipe.phases[index];
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
