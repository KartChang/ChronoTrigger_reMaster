import type {Enemy, State} from './core';

/** Read-only queue guard, NOT an event delivery or a source of animation phases.
 * A paused draw must not discard an already drawn living source while its real
 * lethal effect still belongs to the frame owner's queue. Only the subsequently
 * delivered frame effect may create a remnant; no effect is consumed here.
 */
export function awaitingLethalDelivery(s:State,foe:Enemy|undefined):boolean {
 if(!foe||foe.hp>0||!Number.isFinite(foe.hp)||!Number.isFinite(foe.x)||!Number.isFinite(foe.z)||!['battle','victory'].includes(s.mode))return false;
 if(!s.enemies.includes(foe)||s.enemies.filter(e=>e.x===foe.x&&e.z===foe.z).length!==1)return false;
 return s.effects.some(e=>!e.enemyAction&&(e.kind==='hit'||e.kind==='combo')&&(e.actor===0||e.actor===1||e.guest===true||e.kind==='combo')&&e.x===foe.x&&e.z===foe.z);
}
