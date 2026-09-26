import type {State,Effect,Enemy} from './core';
import {rescueMap} from './rescue-data';
import type {FieldEnemySprite} from './field-enemy-palette';
import {drawRescueEnemyFrame,RESCUE_ENEMY_ART} from './rescue-enemy-art';
import type {RescueEnemyKind,RescueEnemyFrame} from './rescue-enemy-art';
export const RESCUE_ENEMY_MOTION=Object.freeze({id:'vq03s-rescue-enemy-motion',attackTicks:24,hurtTicks:18,historyLimit:24,approved:false});
type Cause={kind:'attack'|'hurt';tick:number;receivedTick:number;index:number;effect:Effect};
type Event={enemy:Enemy;cause:Cause};
type Cache={sprite:FieldEnemySprite;kind:RescueEnemyKind;frame:RescueEnemyFrame;uploads:number};
type Row={index:number;kind:RescueEnemyKind;tick:number;mode:State['mode'];hp:number;atb:number;frame:RescueEnemyFrame;reducedMotion:boolean;cause:Cause|null;cell:{width:number;height:number;fnv1a32:number}|null;scope:'texture-not-framebuffer'};
const validKind=(kind:Enemy['kind']):kind is RescueEnemyKind=>kind==='naga'||kind==='hench'||kind==='yakra';
const fingerprint=(data:ArrayLike<number>)=>{let h=2166136261;for(let i=0;i<data.length;i++)h=Math.imul(h^data[i]!,16777619);return h>>>0;};
export function rescueEnemyFrame(tick:number,index:number,kind:RescueEnemyKind,atb:number,reduced:boolean,attackTick:number|null,hurtTick:number|null):RescueEnemyFrame{
 if(!Number.isSafeInteger(tick)||tick<0||!Number.isInteger(index)||index<0||index>2||!validKind(kind)||!Number.isFinite(atb))throw new RangeError('Invalid rescue presentation input');
 if(reduced)return 0;
 if(hurtTick!==null&&Number.isSafeInteger(hurtTick)&&hurtTick>=0&&tick>=hurtTick&&tick-hurtTick<18)return 4;
 if(attackTick!==null&&Number.isSafeInteger(attackTick)&&attackTick>=0&&tick>=attackTick){const age=tick-attackTick;if(age<8)return 2;if(age<16)return 3;if(age<24)return 1;}
 // Preserve Yakra's existing two ready cells, now on the simulation clock.
 if(kind==='yakra')return atb>.78?(Math.floor(tick/5)%2 as 0|1):0;
 return atb>.78||((tick+index*37)%180>=150)?1:0;
}
/** Consumes existing effects; no rule/position/ATB/save writes or added GPU objects. */
export class RescueEnemyMotion{
 private state:State|null=null;private chapter='';private tick:number|null=null;private active=false;private reduced=false;private disposed=false;
 private owners:(Enemy|null)[]=[null,null,null];private attacks:(Event|null)[]=[null,null,null];private hurts:(Event|null)[]=[null,null,null];
 private cache:(Cache|null)[]=[null,null,null];private keys:(string|null)[]=[null,null,null];
 private history:Row[]=[];private dropped=0;private readFailures=0;
 begin(s:State,reduced:boolean):void{
  if(this.disposed)return;
  if(!Number.isSafeInteger(s.ticks)||s.ticks<0)throw new RangeError('Invalid simulation tick');
  if(this.state!==s||this.chapter!==s.chapter||(this.tick!==null&&s.ticks<this.tick))this.reset();
  this.state=s;this.chapter=s.chapter;this.tick=s.ticks;this.reduced=reduced;this.active=rescueMap(s.chapter)&&s.mode==='battle';
  for(let i=0;i<3;i++){
   const foe=s.enemies[i];
   if(!this.active||!foe||foe.hp<=0||!validKind(foe.kind)){this.owners[i]=null;this.attacks[i]=null;this.hurts[i]=null;this.keys[i]=null;continue;}
   if(this.owners[i]!==foe){this.owners[i]=foe;this.attacks[i]=null;this.hurts[i]=null;this.keys[i]=null;}
   if(this.attacks[i]&&s.ticks-this.attacks[i]!.cause.tick>=24)this.attacks[i]=null;
   if(this.hurts[i]&&s.ticks-this.hurts[i]!.cause.tick>=18)this.hurts[i]=null;
  }
 }
 receive(s:State,e:Effect):void{
  if(this.disposed||!this.active||s!==this.state)return;
  const a=e.enemyAction;
  if(a){
   if(e.kind!=='hit'||e.actor!==undefined||e.guest||!Number.isInteger(a.index)||a.index<0||a.index>2||!Number.isSafeInteger(a.tick)||a.tick<0||a.tick>s.ticks||s.ticks-a.tick>=24)return;
   const foe=s.enemies[a.index];
   if(!foe||foe.hp<=0||!validKind(foe.kind)||!a.origin||!a.target||![a.origin.x,a.origin.z,a.target.x,a.target.z,e.x,e.z].every(Number.isFinite)||a.origin.x!==foe.x||a.origin.z!==foe.z||a.target.x!==e.x||a.target.z!==e.z)return;
   // A multi-target boss pulse is one delivered action, not one animation per victim.
   if(this.attacks[a.index]?.enemy===foe&&this.attacks[a.index]!.cause.tick>=a.tick)return;
   this.attacks[a.index]={enemy:foe,cause:{kind:'attack',tick:a.tick,receivedTick:s.ticks,index:a.index,effect:structuredClone(e)}};return;
  }
  if((e.kind!=='hit'&&e.kind!=='combo')||(e.actor!==0&&e.actor!==1&&!e.guest&&e.kind!=='combo')||![e.x,e.z].every(Number.isFinite))return;
  const matches=s.enemies.map((foe,index)=>({foe,index})).filter(({foe,index})=>index<3&&foe.hp>0&&validKind(foe.kind)&&foe.x===e.x&&foe.z===e.z);
  if(matches.length!==1)return;
  const {foe,index}=matches[0]!;this.hurts[index]={enemy:foe,cause:{kind:'hurt',tick:s.ticks,receivedTick:s.ticks,index,effect:structuredClone(e)}};
 }
 update(sprite:FieldEnemySprite,index:number):void{
  if(this.disposed||!this.active||!this.state||this.tick===null||!Number.isInteger(index)||index<0||index>2)return;
  const foe=this.state.enemies[index];if(!foe||foe.hp<=0||!validKind(foe.kind)||sprite.mesh.isDisposed()||!sprite.mesh.isEnabled()||!sprite.mesh.isVisible||sprite.mesh.visibility<=0)return;
  const attack=this.attacks[index],hurt=this.hurts[index],frame=rescueEnemyFrame(this.tick,index,foe.kind,foe.atb,this.reduced,attack?.cause.tick??null,hurt?.cause.tick??null);
  let cache=this.cache[index];
  if(!cache||cache.sprite!==sprite){cache={sprite,kind:foe.kind,frame:0,uploads:0};this.cache[index]=cache;drawRescueEnemyFrame(sprite.texture.getContext(),foe.kind,frame);sprite.texture.update();cache.frame=frame;cache.uploads++;}
  else if(cache.kind!==foe.kind||cache.frame!==frame){drawRescueEnemyFrame(sprite.texture.getContext(),foe.kind,frame);sprite.texture.update();cache.kind=foe.kind;cache.frame=frame;cache.uploads++;}
  const cause=hurt&&this.tick-hurt.cause.tick<18?hurt.cause:attack&&this.tick-attack.cause.tick<24?attack.cause:null;
  const key=`${foe.kind}/${frame}/${cause?.kind}/${cause?.tick}/${this.reduced}`;
  if(this.keys[index]===key)return;this.keys[index]=key;
  const row:Row={index,kind:foe.kind,tick:this.tick,mode:this.state.mode,hp:foe.hp,atb:foe.atb,frame,reducedMotion:this.reduced,cause:structuredClone(cause),cell:null,scope:'texture-not-framebuffer'};
  try{const size=sprite.texture.getSize(),data=sprite.texture.getContext().getImageData(0,0,size.width,size.height).data;row.cell={width:size.width,height:size.height,fnv1a32:fingerprint(data)};}catch{this.readFailures++;}
  this.history.push(row);if(this.history.length>24){this.history.shift();this.dropped++;}
 }
 reset():void{this.state=null;this.chapter='';this.tick=null;this.active=false;this.owners.fill(null);this.attacks.fill(null);this.hurts.fill(null);this.keys.fill(null);this.history=[];this.dropped=0;this.readFailures=0;/* Keep physical texture cache; reset is not a redraw. */}
 dispose():void{this.reset();this.cache.fill(null);this.disposed=true;}
 inspect(){return {profile:RESCUE_ENEMY_MOTION.id,artProfile:RESCUE_ENEMY_ART.id,clock:'simulation-ticks',tick:this.tick,chapter:this.chapter,active:this.active,reducedMotion:this.reduced,disposed:this.disposed,historyLimit:24,historyDropped:this.dropped,textureReadFailures:this.readFailures,history:structuredClone(this.history),cache:this.cache.map(c=>c?{kind:c.kind,frame:c.frame,uploads:c.uploads}:null),stateMutation:false,additionalGpuResources:0,approved:false};}
}
