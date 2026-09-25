import type {State,Effect,EnemyAction} from './core';
import type {FieldEnemySprite} from './field-enemy-palette';
import {IMP_MOTION} from './imp-motion';
import {IMP_ACTION,impActionFrame,drawImpActionFrame,impHurtActive} from './imp-action';
import type {ImpActionFrame} from './imp-action';
type Slot={sprite:FieldEnemySprite;frame:ImpActionFrame;tick:number;uploads:number;hurtTick:number|null;attackTick:number|null};
type Cause={kind:'attack'|'hurt';index:number;receivedTick:number;effect:Effect};
type Samples={x:number;y:number;rgba:number[]}[];
type Observation={index:number;name:string;tick:number;chapter:string;mode:string;frame:ImpActionFrame;hurtTick:number|null;attackTick:number|null;enemyHp:number;reducedMotion:boolean;cell:{width:number;height:number};samples:Samples;cause:Cause;scope:'actual-texture-after-pose-update-not-framebuffer'};
const visible=(s:FieldEnemySprite)=>!s.mesh.isDisposed()&&s.mesh.isEnabled()&&s.mesh.isVisible&&s.mesh.visibility>0;
const sample=(s:FieldEnemySprite):Samples=>[[3,19],[3,20],[3,25],[21,22]].map(([x,y])=>({x:x!,y:y!,rgba:Array.from(s.texture.getContext().getImageData(x!,y!,1,1).data)}));
/** Presentation only. Real delivered effects and simulation ticks; no wall clock,
 * gameplay mutation, added scene resources or uploads for hidden/dead sprites.
 */
export class FieldEnemyMotion{
 private slots:(Slot|null)[]=[null,null,null];
 private hurts:(number|null)[]=[null,null,null];
 private actions:(EnemyAction|null)[]=[null,null,null];
 private hurtCauses:(Cause|null)[]=[null,null,null];
 private attackCauses:(Cause|null)[]=[null,null,null];
 private keys:(string|null)[]=[null,null,null];
 private history:Observation[]=[];
 private dropped=0;
 private tick:number|null=null;
 private reduced=false;
 private battle=false;
 private active=false;
 private disposed=false;
 private state:State|null=null;
 /** Record the original scene-entry drawImp upload, without repainting it. */
 seedOriginal(sprite:FieldEnemySprite,index:number):void{
  if(this.disposed)return;
  if(!Number.isInteger(index)||index<0||index>2)throw new RangeError('Invalid imp slot');
  this.slots[index]={sprite,frame:0,tick:0,uploads:this.slots[index]?.uploads??0,hurtTick:null,attackTick:null};
 }
 private clearEvents():void{this.hurts.fill(null);this.actions.fill(null);this.hurtCauses.fill(null);this.attackCauses.fill(null);this.keys.fill(null);}
 begin(s:State,reduced:boolean):void{
  if(this.disposed)return;
  if(this.tick!==null&&s.ticks<this.tick){this.clearEvents();this.history=[];this.dropped=0;}
  this.tick=s.ticks;this.state=s;this.reduced=reduced;this.battle=s.mode==='battle';
  this.active=s.chapter==='canyon'||s.chapter==='forest';
  if(!this.active||!this.battle)this.clearEvents();
 }
 receive(s:State,e:Effect):void{
  if(this.disposed||!this.active||s!==this.state||s.mode!=='battle')return;
  const a=e.enemyAction;
  if(a){
   // Exact source index and origin emitted by core. A target alone is never enough.
   const foe=s.enemies[a.index];
   if(e.kind!=='hit'||e.actor!==undefined||e.guest||!Number.isInteger(a.index)||a.index<0||a.index>2||!foe||foe.hp<=0||
    !Number.isSafeInteger(a.tick)||a.tick<0||a.tick>s.ticks||s.ticks-a.tick>=IMP_ACTION.duration||
    ![a.origin.x,a.origin.z,a.target.x,a.target.z,e.x,e.z].every(Number.isFinite)||
    a.origin.x!==foe.x||a.origin.z!==foe.z||a.target.x!==e.x||a.target.z!==e.z)return;
   if(this.actions[a.index]&&this.actions[a.index]!.tick>=a.tick)return;
   this.actions[a.index]=structuredClone(a);this.attackCauses[a.index]={kind:'attack',index:a.index,receivedTick:s.ticks,effect:structuredClone(e)};return;
  }
  if((e.kind!=='hit'&&e.kind!=='combo')||(e.actor===undefined&&!e.guest&&e.kind!=='combo'))return;
  // M's unambiguous living-target recoil remains unchanged. Lethal hits do not
  // keep a dead mesh alive just to obtain evidence.
  const matches=s.enemies.map((v,i)=>({v,i})).filter(({v,i})=>i<3&&v.hp>0&&Math.hypot(v.x-e.x,v.z-e.z)<.01);
  if(matches.length===1){const i=matches[0]!.i;this.hurts[i]=s.ticks;this.hurtCauses[i]={kind:'hurt',index:i,receivedTick:s.ticks,effect:structuredClone(e)};}
 }
 update(sprite:FieldEnemySprite,index:number):void{
  if(this.disposed||!this.active||this.tick===null||!visible(sprite))return;
  const attackTick=this.actions[index]?.tick??null,hurtTick=this.hurts[index]??null;
  const frame=impActionFrame(this.tick,index,this.battle,this.reduced,hurtTick,attackTick);
  let slot=this.slots[index];
  if(!slot||slot.sprite!==sprite){slot={sprite,frame:0,tick:this.tick,uploads:0,hurtTick:null,attackTick:null};this.slots[index]=slot;}
  if(slot.frame!==frame){drawImpActionFrame(sprite.texture.getContext() as CanvasRenderingContext2D,frame);sprite.texture.update();slot.uploads++;slot.frame=frame;}
  slot.tick=this.tick;slot.hurtTick=hurtTick;slot.attackTick=attackTick;
  const cause=impHurtActive(this.tick,hurtTick)?this.hurtCauses[index]:attackTick!==null&&this.tick-attackTick<IMP_ACTION.duration?this.attackCauses[index]:null;
  if(cause&&this.state){
   const key=`${cause.kind}/${cause.receivedTick}/${attackTick}/${hurtTick}/${frame}/${this.reduced}`;
   if(this.keys[index]!==key){
    this.keys[index]=key;
    this.history.push({index,name:sprite.mesh.name,tick:this.tick,chapter:this.state.chapter,mode:this.state.mode,frame,hurtTick,attackTick,enemyHp:this.state.enemies[index]?.hp??0,reducedMotion:this.reduced,cell:sprite.texture.getSize(),samples:sample(sprite),cause:structuredClone(cause),scope:'actual-texture-after-pose-update-not-framebuffer'});
    if(this.history.length>IMP_ACTION.historyLimit){this.history.shift();this.dropped++;}
   }
  }
 }
 // Preserve only the physical texture cache across state rebase; no replay of old actions.
 reset():void{this.clearEvents();this.history=[];this.dropped=0;for(const slot of this.slots)if(slot){slot.hurtTick=null;slot.attackTick=null;}this.tick=null;this.state=null;this.active=false;}
 dispose():void{this.reset();this.slots.fill(null);this.disposed=true;}
 inspect(){return {profile:IMP_MOTION.id,actionProfile:IMP_ACTION.id,active:this.active,tick:this.tick,reducedMotion:this.reduced,battle:this.battle,uploadScope:'pose-changes-only',approved:false,disposed:this.disposed,
  history:structuredClone(this.history),historyLimit:IMP_ACTION.historyLimit,historyDropped:this.dropped,
  actors:this.slots.flatMap((slot,index)=>{if(!slot||!this.active||!visible(slot.sprite))return [];
   return [{index,name:slot.sprite.mesh.name,frame:slot.frame,tick:slot.tick,uploads:slot.uploads,hurtTick:slot.hurtTick,attackTick:slot.attackTick,cell:slot.sprite.texture.getSize(),samples:sample(slot.sprite)}];})};}
}
