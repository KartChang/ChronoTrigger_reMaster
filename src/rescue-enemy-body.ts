import {DynamicTexture,Material,Mesh,MeshBuilder,StandardMaterial,Texture,Vector3} from '@babylonjs/core';
import type {Effect,Enemy,State,Vec} from './core';
import {awaitingLethalDelivery} from './pending-death';
import type {FieldEnemySprite} from './field-enemy-palette';
import {rescueMap} from './rescue-data';
import {preservePixelPalette} from './pixel-presentation';

/** Authored presentation only. The original enemy still disappears at logical death. */
export const RESCUE_BODY=Object.freeze({id:'vq03t-rescue-body',attackTicks:24,recoilTicks:18,deathTicks:24,attackReach:.20,recoilReach:.10,limit:3,historyLimit:24,maxTextureBytes:3*48*48*4,approved:false});
type Kind='attack'|'recoil'|'death';
type Cause={kind:Kind;foeKind:Enemy['kind'];index:number;tick:number;receivedTick:number;origin:Vec|null;target:Vec;effect:Effect;hpBefore:number;hpAfter:number};
type Move={cause:Cause;direction:Vec};
type Slot={sprite:FieldEnemySprite;anchor:Vec;shown:boolean};
type Cell={width:number;height:number;fnv1a32:number};
type Ghost={mesh:Mesh;material:StandardMaterial;texture:DynamicTexture;cause:Cause;base:Vector3;scale:Vector3;up:Vector3;height:number;lastTick:number;cell:Cell};
type Row={tick:number;phase:string;cause:Cause;position:number[];offset:Vec;scale:number[];alpha:number;enabled:boolean;originalEnabled:boolean;cell:Cell|null;scope:'transform-texture-not-framebuffer';geometry?:{base:number[];scale:number[];up:number[];height:number}};
const zero=():Vec=>({x:0,z:0});
const finite=(v:Vec|undefined|null):v is Vec=>!!v&&Number.isFinite(v.x)&&Number.isFinite(v.z);
const same=(a:Vec,b:Vec)=>a.x===b.x&&a.z===b.z;
const valid=(e:Enemy|undefined):e is Enemy=>!!e&&['naga','hench','yakra'].includes(e.kind??'')&&finite(e);
const direction=(a:Vec,b:Vec):Vec=>{const x=b.x-a.x,z=b.z-a.z,n=Math.hypot(x,z);return n>1e-8?{x:x/n,z:z/n}:zero();};
const visible=(s:FieldEnemySprite)=>!s.mesh.isDisposed()&&s.mesh.isEnabled()&&s.mesh.isVisible&&s.mesh.visibility>0;
const hash=(a:ArrayLike<number>)=>{let h=2166136261;for(let i=0;i<a.length;i++)h=Math.imul(h^a[i]!,16777619);return h>>>0;};
export function rescueBodyOffset(age:number,kind:'attack'|'recoil',dir:Vec,reduced:boolean):Vec{
 const ticks=kind==='attack'?24:18,reach=kind==='attack'?.20:.10;
 const k=!reduced&&Number.isFinite(age)&&age>0&&age<ticks?Math.sin(Math.PI*age/ticks)*reach:0;
 return {x:dir.x*k,z:dir.z*k};
}
/** Separate rescue slots: no adapters manufacture a second gameplay State. */
export class RescueEnemyBody{
 private state:State|null=null;private chapter='';private tick:number|null=null;private reduced=false;private disposed=false;
 private owners:(Enemy|null)[]=[null,null,null];private previousHp:number[]=[];private previousMode='';
 private moves:(Move|null)[]=[null,null,null];private slots:(Slot|null)[]=[null,null,null];private pending:(Cause|null)[]=[null,null,null];
 private ghosts:(Ghost|null)[]=[null,null,null];private lastAttack:number[]=[-1,-1,-1];private keys:(string|null)[]=[null,null,null];
 private history:Row[]=[];private dropped=0;private created=0;private released=0;private failures=0;
 begin(s:State,reduced:boolean):void{
  if(this.disposed)return;
  if(!Number.isSafeInteger(s.ticks)||s.ticks<0)throw new RangeError('Invalid rescue body tick');
  if(this.state!==s||this.chapter!==s.chapter||(this.tick!==null&&s.ticks<this.tick))this.reset();
  this.state=s;this.chapter=s.chapter;this.tick=s.ticks;this.reduced=reduced;
  for(let i=0;i<3;i++)if(this.owners[i]!==s.enemies[i]){this.restore(i);this.release(i);this.owners[i]=s.enemies[i]??null;this.previousHp[i]=NaN;this.moves[i]=null;this.slots[i]=null;this.pending[i]=null;this.lastAttack[i]=-1;this.keys[i]=null;this.history=this.history.filter(h=>h.cause.index!==i);}
  if(!rescueMap(s.chapter)||!['battle','victory'].includes(s.mode)){
   for(let i=0;i<3;i++){this.restore(i);if(this.ghosts[i]){const g=this.ghosts[i]!;g.mesh.setEnabled(false);g.material.alpha=0;this.record(g.cause,'cancelled',g.mesh,zero(),g.material.alpha,false,g.cell);}this.release(i);}
   this.moves.fill(null);this.pending.fill(null);
  }
 }
 receive(s:State,e:Effect):void{
  if(this.disposed||s!==this.state||!rescueMap(s.chapter)||!['battle','victory'].includes(s.mode)||!finite(e))return;
  const a=e.enemyAction;
  if(a){
   const foe=s.enemies[a.index];
   if(s.mode!=='battle'||e.kind!=='hit'||e.actor!==undefined||e.guest||!Number.isInteger(a.index)||a.index<0||a.index>=3||!valid(foe)||foe.hp<=0||!Number.isSafeInteger(a.tick)||a.tick<0||a.tick>s.ticks||s.ticks-a.tick>=24||!finite(a.origin)||!finite(a.target)||!same(a.origin,foe)||!same(a.target,e))return;
   if(![...s.players,s.rescue.guest].some(p=>p.hp>=0&&same(p,a.target))||a.tick<=this.lastAttack[a.index]!)return;
   this.lastAttack[a.index]=a.tick;
   if(this.moves[a.index]?.cause.kind==='recoil'&&s.ticks-this.moves[a.index]!.cause.tick<18)return;
   this.moves[a.index]={direction:direction(a.origin,a.target),cause:this.cause('attack',s,e,a.index,a.tick,a.origin,foe.hp)};return;
  }
  if((e.kind!=='hit'&&e.kind!=='combo')||(e.actor!==0&&e.actor!==1&&e.guest!==true&&e.kind!=='combo'))return;
  const targets=s.enemies.map((v,i)=>({v,i})).filter(({v,i})=>i<3&&valid(v)&&same(v,e));if(targets.length!==1)return;
  const {v,i}=targets[0]!;
  if(v.hp<=0){
   if(!(this.previousHp[i]!>0)||this.previousMode!=='battle'||!this.slots[i]?.shown||this.pending[i]||this.ghosts[i])return;
   this.moves[i]=null;this.pending[i]=this.cause('death',s,e,i,s.ticks,finite(e.origin)?e.origin:null,this.previousHp[i]!);return;
  }
  if(s.mode!=='battle'||!finite(e.origin)||this.moves[i]?.cause.tick===s.ticks&&this.moves[i]?.cause.kind==='recoil')return;
  this.moves[i]={direction:direction(e.origin,v),cause:this.cause('recoil',s,e,i,s.ticks,e.origin,Number.isFinite(this.previousHp[i])?this.previousHp[i]!:v.hp)};
 }
 private cause(kind:Kind,s:State,e:Effect,i:number,tick:number,origin:Vec|null,hpBefore:number):Cause{
  const foe=s.enemies[i]!;return {kind,foeKind:foe.kind,index:i,tick,receivedTick:s.ticks,origin:origin?{x:origin.x,z:origin.z}:null,target:{x:foe.x,z:foe.z},effect:structuredClone(e),hpBefore,hpAfter:foe.hp,...(kind==='attack'?{target:{...e.enemyAction!.target}}:{})};
 }
 private awaitingDeath(index:number):boolean{
  const s=this.state,e=s?.enemies[index];
  return !!s&&this.owners[index]===e&&this.previousHp[index]!>0&&this.previousMode==='battle'&&!!this.slots[index]?.shown&&awaitingLethalDelivery(s,e);
 }
 update(sprite:FieldEnemySprite,index:number):void{
  const s=this.state;if(this.disposed||!s||!rescueMap(s.chapter)||!Number.isInteger(index)||index<0||index>=3)return;
  const e=s.enemies[index],old=this.slots[index],pending=this.pending[index];
  if(pending){this.pending[index]=null;if(!this.reduced&&old?.sprite===sprite&&old.shown&&valid(e)&&e.hp<=0&&!visible(sprite))this.makeGhost(sprite,pending);}
  if(!valid(e)||e.hp<=0||!visible(sprite)){if(old&&!this.awaitingDeath(index))old.shown=false;this.moves[index]=null;return;}
  const anchor={x:e.x,z:e.z},move=this.moves[index];let offset=zero();
  if(move&&s.mode==='battle'){
   const age=s.ticks-move.cause.tick,ticks=move.cause.kind==='attack'?24:18;
   if(age<0||age>=ticks){this.moves[index]=null;sprite.mesh.position.x=anchor.x;sprite.mesh.position.z=anchor.z;if(!this.reduced&&age>=ticks)this.record(move.cause,'restored',sprite.mesh,zero(),1,true,null);}
   else{offset=rescueBodyOffset(age,move.cause.kind as 'attack'|'recoil',move.direction,this.reduced);if(!this.reduced){sprite.mesh.position.x=anchor.x+offset.x;sprite.mesh.position.z=anchor.z+offset.z;this.record(move.cause,age===0?'start':age<ticks/2?'out':'return',sprite.mesh,offset,1,true,null);}}
  }
  sprite.mesh.position.x=anchor.x+offset.x;sprite.mesh.position.z=anchor.z+offset.z;this.slots[index]={sprite,anchor,shown:true};
 }
 end():void{
  const s=this.state;if(this.disposed||!s||this.tick===null)return;
  for(let i=0;i<3;i++){
   const g=this.ghosts[i];if(!g)continue;
   // A live current owner invalidates the death copy, even at the same tick.
   if(s.enemies[i]!.hp>0){g.mesh.setEnabled(false);g.material.alpha=0;this.record(g.cause,'cancelled',g.mesh,zero(),0,this.slots[i]?.sprite.mesh.isEnabled()??false,g.cell);this.release(i);continue;}
   const age=s.ticks-g.cause.tick;
   if(age<0||age>=24){g.mesh.setEnabled(false);g.material.alpha=0;this.record(g.cause,'expired',g.mesh,zero(),g.material.alpha,false,g.cell);this.release(i);continue;}
   g.mesh.setEnabled(!this.reduced);if(this.reduced)continue;
   if(g.lastTick!==s.ticks){const t=age/24,scale=1-.7*t;g.mesh.scaling.copyFrom(g.scale);g.mesh.scaling.y*=scale;g.mesh.position.copyFrom(g.base).subtractInPlace(g.up.scale(g.height*g.scale.y*.5*(1-scale)));g.material.alpha=1-t;g.lastTick=s.ticks;}
   this.record(g.cause,age<12?'settle':'fade',g.mesh,zero(),g.material.alpha,false,g.cell);
  }
  // A paused draw cannot consume the living witness of a still-queued lethal hit.
  const awaiting=s.enemies.slice(0,3).map((_,i)=>this.awaitingDeath(i));
  this.previousHp=s.enemies.slice(0,3).map((e,i)=>awaiting[i]?this.previousHp[i]!:e.hp);
  if(!awaiting.some(Boolean))this.previousMode=s.mode;
 }
 private makeGhost(sprite:FieldEnemySprite,cause:Cause):void{
  let texture:DynamicTexture|undefined,material:StandardMaterial|undefined,mesh:Mesh|undefined;
  try{
   const size=sprite.texture.getSize(),w=cause.foeKind==='yakra'?48:24,h=cause.foeKind==='yakra'?48:32;if(sprite.mesh.isDisposed()||size.width!==w||size.height!==h)return;
   const scene=sprite.mesh.getScene(),pixels=sprite.texture.getContext().getImageData(0,0,w,h),bounds=sprite.mesh.getBoundingInfo().boundingBox.extendSize;
   texture=new DynamicTexture('rescue-remnant-'+cause.index,{width:w,height:h},scene,false,Texture.NEAREST_SAMPLINGMODE);texture.hasAlpha=true;texture.getContext().putImageData(pixels,0,0);texture.update();
   const cell={width:w,height:h,fnv1a32:hash(texture.getContext().getImageData(0,0,w,h).data)};if(cell.fnv1a32!==hash(pixels.data))throw Error('Rescue remnant copy mismatch');
   material=new StandardMaterial('rescue-remnant-'+cause.index,scene);material.diffuseTexture=texture;material.emissiveTexture=texture;material.opacityTexture=texture;material.disableLighting=true;material.backFaceCulling=false;material.transparencyMode=Material.MATERIAL_ALPHABLEND;preservePixelPalette(material);
   mesh=MeshBuilder.CreatePlane('rescue-remnant-'+cause.index,{width:bounds.x*2,height:bounds.y*2},scene);mesh.material=material;mesh.billboardMode=sprite.mesh.billboardMode;mesh.isPickable=false;mesh.position.copyFrom(sprite.mesh.position);mesh.scaling.copyFrom(sprite.mesh.scaling);
   this.ghosts[cause.index]={mesh,material,texture,cause:structuredClone(cause),base:mesh.position.clone(),scale:mesh.scaling.clone(),up:scene.activeCamera?.getDirection(Vector3.Up())??Vector3.Up(),height:bounds.y*2,lastTick:-1,cell};this.created++;
  }catch{mesh?.dispose();material?.dispose(false,false);texture?.dispose();this.failures++;}
 }
 private record(cause:Cause,phase:string,mesh:Mesh,offset:Vec,alpha:number,originalEnabled:boolean,cell:Cell|null):void{
  const key=`${cause.kind}/${cause.tick}/${phase}`;if(this.keys[cause.index]===key)return;this.keys[cause.index]=key;
  this.history.push({tick:this.tick!,phase,cause:structuredClone(cause),position:mesh.position.asArray(),offset:{...offset},scale:mesh.scaling.asArray(),alpha,enabled:!['expired','cancelled'].includes(phase)&&mesh.isEnabled(),originalEnabled,cell:cell?{...cell}:null,scope:'transform-texture-not-framebuffer',...(cell&&this.ghosts[cause.index]?{geometry:{base:this.ghosts[cause.index]!.base.asArray(),scale:this.ghosts[cause.index]!.scale.asArray(),up:this.ghosts[cause.index]!.up.asArray(),height:this.ghosts[cause.index]!.height}}:{})});if(this.history.length>24){this.history.shift();this.dropped++;}
 }
 private restore(i:number):void{const old=this.slots[i];if(old&&!old.sprite.mesh.isDisposed()){old.sprite.mesh.position.x=old.anchor.x;old.sprite.mesh.position.z=old.anchor.z;}}
 private release(i:number):void{const g=this.ghosts[i];if(!g)return;this.ghosts[i]=null;g.mesh.dispose();g.material.dispose(false,false);g.texture.dispose();this.released++;}
 reset():void{for(let i=0;i<3;i++){this.restore(i);this.release(i);}this.state=null;this.tick=null;this.chapter='';this.previousHp=[];this.previousMode='';this.owners.fill(null);this.moves.fill(null);this.slots.fill(null);this.pending.fill(null);this.lastAttack.fill(-1);this.keys.fill(null);this.history=[];this.dropped=0;}
 dispose():void{this.reset();this.disposed=true;}
 inspect(){return {profile:RESCUE_BODY.id,tick:this.tick,chapter:this.chapter,reducedMotion:this.reduced,disposed:this.disposed,approved:false,stateMutation:false,historyLimit:24,historyDropped:this.dropped,history:structuredClone(this.history),resources:{active:this.ghosts.filter(Boolean).length,limit:3,rawTextureBytes:this.ghosts.reduce((n,g)=>n+(g?g.cell.width*g.cell.height*4:0),0),maxTextureBytes:RESCUE_BODY.maxTextureBytes,created:this.created,released:this.released,creationFailures:this.failures},remnants:this.ghosts.flatMap((g,index)=>g?[{index,enabled:g.mesh.isEnabled(),position:g.mesh.position.asArray(),scale:g.mesh.scaling.asArray(),alpha:g.material.alpha,deathTick:g.cause.tick,cell:{...g.cell},textureUploads:1,originalEnabled:this.slots[index]?.sprite.mesh.isEnabled()??false}]:[])};}
}
