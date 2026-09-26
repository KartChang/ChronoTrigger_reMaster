import {DynamicTexture,Material,Mesh,MeshBuilder,StandardMaterial,Texture,Vector3} from '@babylonjs/core';
import type {Effect,Enemy,State,Vec} from './core';
import type {FieldEnemySprite} from './field-enemy-palette';
import {preservePixelPalette} from './pixel-presentation';

/** Authored presentation, not original-ROM timing. No gameplay or save mutations. */
export const FIELD_BODY=Object.freeze({id:'vq03o-field-body-response',attackTicks:24,recoilTicks:18,deathTicks:24,attackReach:.20,recoilReach:.10,limit:3,historyLimit:24,textureBytes:24*32*4,approved:false});
type Kind='attack'|'recoil'|'death';
type Cause={kind:Kind;index:number;tick:number;receivedTick:number;origin:Vec|null;target:Vec;effect:Effect;hpBefore:number;hpAfter:number};
type Move={cause:Cause;direction:Vec};
type Slot={sprite:FieldEnemySprite;anchor:Vec;shown:boolean;offset:Vec;phase:string};
type Ghost={mesh:Mesh;material:StandardMaterial;texture:DynamicTexture;cause:Cause;base:Vector3;scale:Vector3;up:Vector3;height:number;lastTick:number;phase:string};
type Observation={index:number;tick:number;phase:string;kind:Kind;cause:Cause;position:number[];offset:Vec;enabled:boolean;originalEnabled:boolean;alpha:number;scale:number[];scope:'render-only-transform-not-framebuffer';texture?:{cell:{width:number;height:number};samples:{x:number;y:number;rgba:number[]}[]}};
const zero=():Vec=>({x:0,z:0});
const finite=(p:Vec|undefined|null):p is Vec=>!!p&&Number.isFinite(p.x)&&Number.isFinite(p.z);
const direction=(a:Vec,b:Vec):Vec=>{const x=b.x-a.x,z=b.z-a.z,d=Math.hypot(x,z);return d>1e-8?{x:x/d,z:z/d}:zero();};
const same=(a:Vec,b:Vec)=>a.x===b.x&&a.z===b.z;
const field=(s:State)=>s.chapter==='canyon'||s.chapter==='forest';
const shown=(s:FieldEnemySprite)=>!s.mesh.isDisposed()&&s.mesh.isEnabled()&&s.mesh.isVisible&&s.mesh.visibility>0;
/** Zero at both endpoints. Every sample is a pure function of the simulation tick. */
export function bodyEnvelope(age:number,duration:number):number{
 return Number.isFinite(age)&&age>0&&age<duration?Math.sin(Math.PI*age/duration):0;
}

/** Only three existing field sprites participate. Alive sprites retain their texture,
 * scale and geometry; killed sprites still hide immediately in the original renderer.
 * A short-lived independent copy may settle/fade after an observed live -> dead hit.
 */
export class FieldEnemyBody{
 private state:State|null=null;
 private chapter='';
 private tick:number|null=null;
 private reduced=false;
 private disposed=false;
 private previousHp:number[]=[];
 private previousEnemies:Enemy[]=[];
 private previousMode='';
 private previousTick:number|null=null;
 private moves:(Move|null)[]=[null,null,null];
 private slots:(Slot|null)[]=[null,null,null];
 private pending:(Cause|null)[]=[null,null,null];
 private ghosts:(Ghost|null)[]=[null,null,null];
 private history:Observation[]=[];
 private keys:(string|null)[]=[null,null,null];
 private dropped=0;
 private created=0;
 private released=0;
 private creationFailures=0;
 begin(s:State,reduced:boolean):void{
  if(this.disposed)return;
  if(this.state!==s||this.chapter!==s.chapter||(this.tick!==null&&s.ticks<this.tick))this.reset();
  this.state=s;this.chapter=s.chapter;this.tick=s.ticks;this.reduced=reduced;
  if(!field(s)||!['battle','victory'].includes(s.mode)){this.moves.fill(null);this.pending.fill(null);this.clearGhosts();}
 }
 receive(s:State,e:Effect):void{
  if(this.disposed||s!==this.state||!field(s)||!['battle','victory'].includes(s.mode))return;
  if(!finite(e))return;
  const a=e.enemyAction;
  if(a){
   const foe=s.enemies[a.index];
   if(s.mode!=='battle'||e.kind!=='hit'||e.actor!==undefined||e.guest||!Number.isInteger(a.index)||a.index<0||a.index>=3||!foe||foe.hp<=0||
    !Number.isSafeInteger(a.tick)||a.tick<0||a.tick>s.ticks||s.ticks-a.tick>=FIELD_BODY.attackTicks||!finite(a.origin)||!finite(a.target)||!same(a.origin,foe)||!same(a.target,e))return;
   const old=this.moves[a.index];if(old?.cause.kind==='attack'&&old.cause.tick>=a.tick)return;
   // A current recoil takes priority over an already-delivered attack.
   if(old?.cause.kind==='recoil'&&s.ticks-old.cause.tick<FIELD_BODY.recoilTicks)return;
   const cause:Cause={kind:'attack',index:a.index,tick:a.tick,receivedTick:s.ticks,origin:{...a.origin},target:{...a.target},effect:structuredClone(e),hpBefore:foe.hp,hpAfter:foe.hp};
   this.moves[a.index]={cause,direction:direction(a.origin,a.target)};return;
  }
  const allied=e.actor===0||e.actor===1||e.guest===true||e.kind==='combo';
  if(!allied||(e.kind!=='hit'&&e.kind!=='combo'))return;
  const matches=s.enemies.map((v,i)=>({v,i})).filter(({v,i})=>i<3&&Math.hypot(v.x-e.x,v.z-e.z)<.01);
  if(matches.length!==1)return;
  const {v,i}=matches[0]!;
  if(v.hp<=0){
   // A load/rebase/first draw at zero HP is not a witnessed death. No guessed source.
   if(this.previousEnemies[i]!==v||!(this.previousHp[i]!>0)||this.previousMode!=='battle'||this.previousTick===null||this.previousTick>s.ticks||this.pending[i]||this.ghosts[i])return;
   this.moves[i]=null;
   this.pending[i]={kind:'death',index:i,tick:s.ticks,receivedTick:s.ticks,origin:finite(e.origin)?{...e.origin}:null,target:{x:v.x,z:v.z},effect:structuredClone(e),hpBefore:this.previousHp[i]!,hpAfter:v.hp};return;
  }
  if(s.mode!=='battle'||!finite(e.origin))return; // A combo without an origin cannot invent a recoil direction.
  if(this.moves[i]?.cause.kind==='recoil'&&this.moves[i]!.cause.tick===s.ticks)return;
  const cause:Cause={kind:'recoil',index:i,tick:s.ticks,receivedTick:s.ticks,origin:{...e.origin},target:{x:v.x,z:v.z},effect:structuredClone(e),hpBefore:this.previousHp[i]??v.hp,hpAfter:v.hp};
  this.moves[i]={cause,direction:direction(e.origin,v)};
 }
 update(sprite:FieldEnemySprite,index:number):void{
  if(this.disposed||!this.state||!field(this.state)||!Number.isInteger(index)||index<0||index>=3)return;
  const s=this.state,enemy=s.enemies[index],old=this.slots[index],pending=this.pending[index];
  if(pending){
   this.pending[index]=null;
   if(!this.reduced&&old?.sprite===sprite&&old.shown&&enemy&&enemy.hp<=0&&!shown(sprite))this.makeGhost(sprite,pending);
  }
  if(!enemy||enemy.hp<=0||!shown(sprite)){
   if(old)old.shown=false;this.moves[index]=null;return;
  }
  const anchor={x:enemy.x,z:enemy.z},m=this.moves[index];let offset=zero(),phase='rest';
  if(m&&s.mode==='battle'){
   const age=s.ticks-m.cause.tick,duration=m.cause.kind==='attack'?FIELD_BODY.attackTicks:FIELD_BODY.recoilTicks;
   if(age>=duration||age<0)this.moves[index]=null;
   else if(!this.reduced){const reach=m.cause.kind==='attack'?FIELD_BODY.attackReach:FIELD_BODY.recoilReach,weight=bodyEnvelope(age,duration);offset={x:m.direction.x*reach*weight,z:m.direction.z*reach*weight};phase=age<duration/2?'out':'return';}
  }
  // Absolute anchor prevents cumulative displacement when rendering the same tick twice.
  sprite.mesh.position.x=anchor.x+offset.x;sprite.mesh.position.z=anchor.z+offset.z;
  this.slots[index]={sprite,anchor,shown:true,offset,phase};
  if(m&&this.moves[index]&&!this.reduced&&phase!=='rest')this.record(m.cause,phase,sprite.mesh,offset,1,true);
 }
 end():void{
  const s=this.state;if(this.disposed||!s||this.tick===null)return;
  for(let i=0;i<3;i++){
   const g=this.ghosts[i];if(!g)continue;
   const age=s.ticks-g.cause.tick;
   if(age<0||age>=FIELD_BODY.deathTicks||!field(s)||!['battle','victory'].includes(s.mode)){
    this.record(g.cause,'expired',g.mesh,zero(),0,false);this.release(i);continue;
   }
   g.mesh.setEnabled(!this.reduced);
   if(this.reduced)continue;
   if(g.lastTick!==s.ticks){const t=age/FIELD_BODY.deathTicks,scale=1-.70*t;
    g.mesh.scaling.copyFrom(g.scale);g.mesh.scaling.y*=scale;
    // Move along the billboard's up vector so its lower edge does not float upwards.
    g.mesh.position.copyFrom(g.base).subtractInPlace(g.up.scale(g.height*g.scale.y*.5*(1-scale)));
    g.material.alpha=1-t;g.lastTick=s.ticks;
   }
   this.record(g.cause,age<FIELD_BODY.deathTicks/2?'settle':'fade',g.mesh,zero(),g.material.alpha,false);
  }
  this.previousEnemies=s.enemies.slice(0,3);this.previousHp=this.previousEnemies.map(e=>e.hp);this.previousMode=s.mode;this.previousTick=s.ticks;
 }
 private makeGhost(sprite:FieldEnemySprite,cause:Cause):void{
  let texture:DynamicTexture|undefined,material:StandardMaterial|undefined,mesh:Mesh|undefined;
  try{
   if(sprite.mesh.isDisposed()||sprite.texture.getSize().width!==24||sprite.texture.getSize().height!==32)return;
   const scene=sprite.mesh.getScene(),pixels=sprite.texture.getContext().getImageData(0,0,24,32),size=sprite.mesh.getBoundingInfo().boundingBox.extendSize;
   texture=new DynamicTexture('field-remnant-'+cause.index,{width:24,height:32},scene,false,Texture.NEAREST_SAMPLINGMODE);texture.hasAlpha=true;
   texture.getContext().putImageData(pixels,0,0);texture.update();
   material=new StandardMaterial('field-remnant-'+cause.index,scene);material.diffuseTexture=texture;material.emissiveTexture=texture;material.opacityTexture=texture;
   material.disableLighting=true;material.backFaceCulling=false;material.transparencyMode=Material.MATERIAL_ALPHABLEND;preservePixelPalette(material);
   mesh=MeshBuilder.CreatePlane('field-remnant-'+cause.index,{width:size.x*2,height:size.y*2},scene);mesh.material=material;mesh.billboardMode=sprite.mesh.billboardMode;mesh.isPickable=false;
   mesh.position.copyFrom(sprite.mesh.position);mesh.scaling.copyFrom(sprite.mesh.scaling);
   const g:Ghost={mesh,material,texture,cause:structuredClone(cause),base:mesh.position.clone(),scale:mesh.scaling.clone(),up:scene.activeCamera?.getDirection(Vector3.Up())??Vector3.Up(),height:size.y*2,lastTick:-1,phase:''};
   this.ghosts[cause.index]=g;this.created++;
  }catch{
   // An allocation/context failure cannot change a combat result or leave half-owned resources.
   mesh?.dispose();material?.dispose(false,false);texture?.dispose();this.creationFailures++;
  }
 }
 private record(cause:Cause,phase:string,mesh:Mesh,offset:Vec,alpha:number,originalEnabled:boolean):void{
  const key=`${cause.kind}/${cause.tick}/${phase}`;if(this.keys[cause.index]===key)return;this.keys[cause.index]=key;
  this.history.push({index:cause.index,tick:this.tick!,phase,kind:cause.kind,cause:structuredClone(cause),position:mesh.position.asArray(),offset:{...offset},enabled:phase==='expired'?false:mesh.isEnabled(),originalEnabled,alpha,scale:mesh.scaling.asArray(),scope:'render-only-transform-not-framebuffer',...(cause.kind==='death'&&this.ghosts[cause.index]?{texture:{cell:{...this.ghosts[cause.index]!.texture.getSize()},samples:[[8,15],[9,16],[6,29]].map(([x,y])=>({x:x!,y:y!,rgba:Array.from(this.ghosts[cause.index]!.texture.getContext().getImageData(x!,y!,1,1).data)}))}}:{})});
  if(this.history.length>FIELD_BODY.historyLimit){this.history.shift();this.dropped++;}
 }
 private release(index:number):void{const g=this.ghosts[index];if(!g)return;this.ghosts[index]=null;g.mesh.dispose();g.material.dispose(false,false);g.texture.dispose();this.released++;}
 private clearGhosts():void{for(let i=0;i<3;i++)this.release(i);}
 reset():void{
  for(const slot of this.slots)if(slot&&!slot.sprite.mesh.isDisposed()){slot.sprite.mesh.position.x=slot.anchor.x;slot.sprite.mesh.position.z=slot.anchor.z;}
  this.clearGhosts();this.state=null;this.tick=null;this.chapter='';this.previousHp=[];this.previousEnemies=[];this.previousMode='';this.previousTick=null;
  this.moves.fill(null);this.slots.fill(null);this.pending.fill(null);this.history=[];this.keys.fill(null);this.dropped=0;
 }
 dispose():void{this.reset();this.disposed=true;}
 inspect(){return {profile:FIELD_BODY.id,tick:this.tick,chapter:this.chapter,reducedMotion:this.reduced,disposed:this.disposed,approved:false,
  actors:this.slots.flatMap((v,index)=>v&&v.shown&&shown(v.sprite)?[{index,position:v.sprite.mesh.position.asArray(),anchor:{...v.anchor},offset:{...v.offset},phase:v.phase}]:[]),
  remnants:this.ghosts.flatMap((g,index)=>g?[{index,tick:this.tick,deathTick:g.cause.tick,hpBefore:g.cause.hpBefore,hpAfter:g.cause.hpAfter,originalEnabled:this.slots[index]?.sprite.mesh.isEnabled()??false,enabled:g.mesh.isEnabled(),position:g.mesh.position.asArray(),scale:g.mesh.scaling.asArray(),alpha:g.material.alpha,cell:{...g.texture.getSize()},textureUploads:1,pixels:[[8,15],[9,16],[6,29]].map(([x,y])=>({x,y,rgba:Array.from(g.texture.getContext().getImageData(x!,y!,1,1).data)}))}]:[]),
  resources:{active:this.ghosts.filter(Boolean).length,limit:FIELD_BODY.limit,rawTextureBytes:this.ghosts.filter(Boolean).length*FIELD_BODY.textureBytes,created:this.created,released:this.released,creationFailures:this.creationFailures},history:structuredClone(this.history),historyLimit:FIELD_BODY.historyLimit,historyDropped:this.dropped};}
}
