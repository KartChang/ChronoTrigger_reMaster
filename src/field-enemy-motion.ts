import type {State,Effect} from './core';
import type {FieldEnemySprite} from './field-enemy-palette';
import {drawImpFrame,impFrame,IMP_MOTION} from './imp-motion';
import type {ImpFrame} from './imp-motion';
type Slot={sprite:FieldEnemySprite;frame:ImpFrame;tick:number;uploads:number;hurtTick:number|null};
/** Presentation only: existing simulation ticks and delivered player/guest effects.
 * No wall-clock phase, extra scene resources, enemy actions or gameplay mutations.
 */
export class FieldEnemyMotion{
 private slots:(Slot|null)[]=[null,null,null];
 private hurts:(number|null)[]=[null,null,null];
 private tick:number|null=null;
 private reduced=false;
 private battle=false;
 private active=false;
 private disposed=false;
 /** Record the original scene-entry drawImp upload, without repainting it. */
 seedOriginal(sprite:FieldEnemySprite,index:number):void{
  if(this.disposed)return;
  if(!Number.isInteger(index)||index<0||index>2)throw new RangeError('Invalid imp slot');
  this.slots[index]={sprite,frame:0,tick:0,uploads:this.slots[index]?.uploads??0,hurtTick:null};
 }
 begin(s:State,reduced:boolean):void{
  if(this.disposed)return;
  if(this.tick!==null&&s.ticks<this.tick)this.hurts.fill(null);
  this.tick=s.ticks;this.reduced=reduced;this.battle=s.mode==='battle';
  this.active=s.chapter==='canyon'||s.chapter==='forest';
  if(!this.active||!this.battle)this.hurts.fill(null);
 }
 receive(s:State,e:Effect):void{
  if(this.disposed||!this.active||s.mode!=='battle'||(e.kind!=='hit'&&e.kind!=='combo')||(e.actor===undefined&&!e.guest&&e.kind!=='combo'))return;
  // Effects identify the target position, not which enemy performed an attack.
  // Only unambiguous hits on an existing living field foe receive a recoil pose.
  const matches=s.enemies.map((v,i)=>({v,i})).filter(({v,i})=>i<3&&v.hp>0&&Math.hypot(v.x-e.x,v.z-e.z)<.01);
  if(matches.length===1)this.hurts[matches[0]!.i]=s.ticks;
 }
 update(sprite:FieldEnemySprite,index:number):void{
  if(this.disposed||!this.active||this.tick===null||sprite.mesh.isDisposed()||!sprite.mesh.isEnabled()||!sprite.mesh.isVisible||sprite.mesh.visibility<=0)return;
  const frame=impFrame(this.tick,index,this.battle,this.reduced,this.hurts[index]??null);
  let slot=this.slots[index];
  if(!slot||slot.sprite!==sprite){slot={sprite,frame:0,tick:this.tick,uploads:0,hurtTick:null};this.slots[index]=slot;}
  if(slot.frame!==frame){drawImpFrame(sprite.texture.getContext() as CanvasRenderingContext2D,frame);sprite.texture.update();slot.uploads++;slot.frame=frame;}
  slot.tick=this.tick;slot.hurtTick=this.hurts[index]??null;
 }
 // Keep only the physical texture-frame cache across a same-scene state rebase.
 // Clearing transient hits must not repaint invisible sprites or assume their pixels are frame0.
 reset():void{this.hurts.fill(null);for(const slot of this.slots)if(slot)slot.hurtTick=null;this.tick=null;this.active=false;}
 dispose():void{this.reset();this.slots.fill(null);this.disposed=true;}
 inspect(){return {profile:IMP_MOTION.id,active:this.active,tick:this.tick,reducedMotion:this.reduced,battle:this.battle,uploadScope:'pose-changes-only',approved:false,disposed:this.disposed,
  actors:this.slots.flatMap((slot,index)=>{if(!slot||!this.active||slot.sprite.mesh.isDisposed()||!slot.sprite.mesh.isEnabled()||!slot.sprite.mesh.isVisible||slot.sprite.mesh.visibility<=0)return [];
   const t=slot.sprite.texture;return [{index,name:slot.sprite.mesh.name,frame:slot.frame,tick:slot.tick,uploads:slot.uploads,hurtTick:slot.hurtTick,cell:t.getSize(),samples:[[3,19],[3,20],[3,25],[21,22]].map(([x,y])=>({x:x!,y:y!,rgba:Array.from(t.getContext().getImageData(x!,y!,1,1).data)}))}];})};}
}
