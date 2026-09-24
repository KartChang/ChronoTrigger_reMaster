/** Original synthesis instructions, not sampled/transcribed game audio.
 * Keep the existing frequency API: 660 is intentionally shared by bell/combo. */
export const SOUND_EFFECT_PROFILE='vq03g-authored-effect-motifs';
export type EffectNote=Readonly<{frequency:number;endFrequency:number;offset:number;duration:number;level:number;wave:'sine'|'triangle'}>;
export type EffectScore=Readonly<{id:string;notes:readonly EffectNote[]}>;
const note=(frequency:number,endFrequency:number,offset:number,duration:number,level:number,wave:'sine'|'triangle'='triangle'):EffectNote=>Object.freeze({frequency,endFrequency,offset,duration,level,wave});
const score=(id:string,notes:readonly EffectNote[]):EffectScore=>Object.freeze({id,notes:Object.freeze(notes)});
/** Each motif has at most three voices, <=.04 summed gain and <=.5s tail.
 * Offsets use the audio clock, never timers or simulation state. */
export const SOUND_EFFECTS:Readonly<Record<number,EffectScore>>=Object.freeze({
 262:score('organ',[note(262,262,0,.28,.025,'sine'),note(393,393,.015,.25,.015,'sine')]),
 330:score('strike',[note(660,165,0,.09,.028),note(165,82.5,.018,.09,.012,'sine')]),
 440:score('interact',[note(440,440,0,.12,.04)]),
 520:score('skill',[note(520,780,0,.15,.02,'sine'),note(780,1040,.045,.14,.012,'sine'),note(1040,1040,.09,.12,.008,'sine')]),
 620:score('restore',[note(620,620,0,.12,.018,'sine'),note(775,775,.06,.14,.014,'sine'),note(930,930,.12,.16,.008,'sine')]),
 660:score('chime',[note(660,660,0,.21,.028,'sine'),note(1320,1320,.015,.16,.012,'sine')]),
 800:score('gate',[note(400,800,0,.28,.024,'sine'),note(804,1200,.035,.28,.016,'sine')]),
});
export function effectScore(frequency:number):EffectScore|null {
 if(!Number.isFinite(frequency)||frequency<40||frequency>4000)return null;
 return SOUND_EFFECTS[frequency]??score('tone',[note(frequency,frequency,0,.12,.04)]);
}
