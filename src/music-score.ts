import type {State} from './core';

/** Authored here, not transcribed/extracted from the game's original soundtrack. */
export const MUSIC_PROFILE='vq02a-authored-early-score';
export type Cue='hearth'|'fair'|'road'|'tension'|'battle'|'victory'|'defeat';
export type Voice='lead'|'bass'|'harmony';
export type ScoreNote=Readonly<{step:number;midi:number;duration:number;voice:Voice;level:number}>;
export type Score=Readonly<{id:Cue;stepTicks:number;steps:number;loop:boolean;notes:readonly ScoreNote[]}>;
export type AudioScene=Readonly<Pick<State,'chapter'|'mode'|'era'|'ticks'>>;

function arrange(id:Cue,stepTicks:number,melody:readonly number[],roots:readonly number[],loop=true):Score {
 const notes:ScoreNote[]=[],steps=melody.length*2;
 melody.forEach((midi,i)=>{if(midi)notes.push(Object.freeze({step:i*2,midi,duration:i%4===3?1:1.65,voice:'lead',level:.045}));});
 roots.forEach((midi,i)=>{
  notes.push(Object.freeze({step:i*8,midi,duration:5.5,voice:'bass',level:.055}));
  for(const [offset,interval] of [[1,19],[4,24],[6,19]])notes.push(Object.freeze({step:i*8+offset!,midi:midi+interval!,duration:1.25,voice:'harmony',level:.022}));
 });
 notes.sort((a,b)=>a.step-b.step);
 return Object.freeze({id,stepTicks,steps,loop,notes:Object.freeze(notes)});
}
/** Seven short arrangements, intentionally not presented as a complete OST. */
export const SCORES:Readonly<Record<Cue,Score>>=Object.freeze({
 hearth:arrange('hearth',20,[72,76,79,0,74,72,69,67,69,72,76,74,71,67,69,0,76,79,81,79,76,74,72,0,69,72,74,71,67,71,72,0],[48,45,53,55,48,45,53,55]),
 fair:arrange('fair',15,[74,78,81,78,83,81,78,0,76,79,83,81,78,76,74,0,81,78,74,76,78,81,86,83,81,79,78,76,74,78,74,0],[50,55,52,57,50,47,55,57]),
 road:arrange('road',23,[67,71,74,0,76,74,71,69,67,64,67,71,69,66,62,0,71,74,79,76,74,71,69,0,67,69,71,74,66,69,67,0],[43,40,48,50,43,40,48,50]),
 tension:arrange('tension',26,[64,0,67,71,65,0,64,62,60,64,0,67,63,62,59,0,64,67,71,72,71,67,65,0,64,62,60,59,62,59,64,0],[40,41,45,47,40,41,45,47]),
 battle:arrange('battle',12,[64,67,71,74,72,71,67,65,64,67,76,74,71,65,67,0],[40,48,45,47]),
 victory:arrange('victory',15,[72,76,79,84,81,79,84,0],[48,53],false),
 defeat:arrange('defeat',25,[67,63,60,0,62,59,55,0],[48,43],false),
});
export function sceneCue(s:AudioScene):Cue {
 if(s.mode==='battle'||s.mode==='victory'||s.mode==='defeat')return s.mode;
 if(s.chapter==='bedroom'||s.chapter==='home')return 'hearth';
 if(s.chapter==='fair')return 'fair';
 if(['overworld1000','truce','castle','chamber'].includes(s.chapter))return 'road';
 if(s.chapter==='lab'&&s.era==='present')return 'road';
 return 'tension';
}
export function notesAt(score:Score,step:number):readonly ScoreNote[] {
 if(!Number.isSafeInteger(step)||step<0||(!score.loop&&step>=score.steps))return [];
 return score.notes.filter(n=>n.step===step%score.steps);
}
export function noteFrequency(midi:number):number {
 if(!Number.isFinite(midi)||midi<0||midi>127)throw new Error('Invalid MIDI note');
 return 440*2**((midi-69)/12);
}
