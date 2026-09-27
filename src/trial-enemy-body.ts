import {DynamicTexture, Material, Mesh, MeshBuilder, Scene, StandardMaterial, Texture, Vector3, Matrix} from '@babylonjs/core';
import type {Effect, Enemy, State} from './core';
import {awaitingLethalDelivery} from './pending-death';
import {trialEnemyKind} from './trial-enemy-art';
import type {TrialEnemyKind} from './trial-enemy-art';

export const TRIAL_BODY = Object.freeze({id:'vq03v-trial-body',actionTicks:24,hurtTicks:18,deathTicks:24,historyLimit:24,remnantLimit:3,maxTextureBytes:49152,approved:false});
type Vec = {x:number;z:number};
type Cause = {kind:'attack'|'recoil'|'death';tick:number;receivedTick:number;index:number;foeKind:TrialEnemyKind;chapter:string;effect:Effect;hpBefore:number;hpAfter:number};
type Cell = {width:number;height:number;fnv1a32:number};
type Ghost = {mesh:Mesh;material:StandardMaterial;texture:DynamicTexture;base:Vector3;scale:Vector3;up:Vector3;height:number;cause:Cause;cell:Cell};
type Slot = {mesh:Mesh;kind:TrialEnemyKind;index:number;chapter:string;owner:Enemy|null;hp:number|null;wasVisible:boolean;base:Vector3;lastPosition:Vector3|null;move:Cause|null;lastAction:number;ghost:Ghost|null;key:string};
type Row = {tick:number;phase:string;cause:Cause;base:number[];position:number[];offset:Vec;scale:number[];alpha:number;enabled:boolean;originalEnabled:boolean;reducedMotion:boolean;cell:Cell|null;geometry:{base:number[];scale:number[];up:number[];height:number}|null;scope:'transform-texture-not-framebuffer'};
const hash=(data:ArrayLike<number>)=>{let h=2166136261;for(let i=0;i<data.length;i++)h=Math.imul(h^data[i]!,16777619);return h>>>0;};
const point=(p:Vec|undefined):p is Vec=>!!p&&Number.isFinite(p.x)&&Number.isFinite(p.z);
const enabled=(m:Mesh)=>!m.isDisposed()&&m.isEnabled()&&m.isVisible&&m.visibility>0;
const direction=(a:Vec,b:Vec):Vec=>{const x=b.x-a.x,z=b.z-a.z,n=Math.hypot(x,z);return n>0?{x:x/n,z:z/n}:{x:0,z:0};};

/** Authored presentation offsets only. All phases come from delivered simulation ticks. */
export function trialBodyOffset(cause:Cause,tick:number,reduced:boolean):Vec {
 if(!Number.isSafeInteger(tick)||tick<0||typeof reduced!=='boolean')throw new RangeError('Invalid trial body clock');
 const age=tick-cause.tick,duration=cause.kind==='attack'?24:18;
 if(reduced||age<=0||age>=duration||cause.kind==='death')return {x:0,z:0};
 const e=cause.effect,origin=cause.kind==='attack'?e.enemyAction?.origin:e.origin;
 if(!point(origin)||!point(e))return {x:0,z:0};
 const d=direction(origin,e),distance=cause.kind==='recoil'?-.10:cause.foeKind==='prisonGuard'?.20:cause.foeKind==='tankBody'?-.08:cause.foeKind==='tankWheel'?.10:0;
 const phase=Math.sin(Math.PI*age/duration)*distance;
 return {x:d.x*phase,z:d.z*phase};
}

/** Borrows existing trial meshes. Only independent death copies are owned/disposed here. */
export class TrialEnemyBody {
 private slots:Slot[]=[];private state:State|null=null;private chapter='';private tick:number|null=null;private reduced=false;private disposed=false;
 private history:Row[]=[];private dropped=0;private created=0;private released=0;private failures=0;
 constructor(private readonly scene:Scene){scene.onDisposeObservable.addOnce(()=>this.dispose());}
 bind(mesh:Mesh,kind:TrialEnemyKind,index:number,chapter:string):void {
  const texture=(mesh.material as StandardMaterial)?.diffuseTexture,size=texture?.getSize();
  if(this.disposed||this.scene.isDisposed||mesh.isDisposed()||mesh.getScene()!==this.scene||!trialEnemyKind(kind)||(kind==='prisonGuard'?(!['cellblock','prisonstairs'].includes(chapter)||index>1):(chapter!=='prisonbridge'||index!==['tankHead','tankBody','tankWheel'].indexOf(kind)))||!Number.isInteger(index)||index<0||index>2||!(texture instanceof DynamicTexture)||size?.width!==(kind==='prisonGuard'?48:64)||size.height!==64||this.slots.some(b=>b.mesh===mesh||b.chapter===chapter&&b.index===index))throw new Error('Invalid trial body binding');
  const b:Slot={mesh,kind,index,chapter,owner:null,hp:null,wasVisible:false,base:mesh.position.clone(),lastPosition:null,move:null,lastAction:-1,ghost:null,key:''};this.slots.push(b);
  mesh.onDisposeObservable.addOnce(()=>{this.release(b,'cancelled');this.slots=this.slots.filter(x=>x!==b);});
 }
 /** Run before the original trial renderer establishes this draw's authoritative anchors. */
 beforeDraw():void {
  for(const b of this.slots){if(!b.mesh.isDisposed()&&b.lastPosition&&b.mesh.position.equals(b.lastPosition))b.mesh.position.copyFrom(b.base);b.lastPosition=null;}
 }
 private reset():void {
  this.beforeDraw();for(const b of this.slots){this.release(b,'cancelled');b.owner=null;b.hp=null;b.wasVisible=false;b.move=null;b.lastAction=-1;b.key='';}
  this.history=[];this.dropped=0;
 }
 draw(s:State,reduced=false,effects:readonly Effect[]=[]):void {
  if(this.disposed)return;
  if(!Number.isSafeInteger(s.ticks)||s.ticks<0||typeof reduced!=='boolean')throw new RangeError('Invalid trial body input');
  if(this.state!==s||this.chapter!==s.chapter||(this.tick!==null&&s.ticks<this.tick))this.reset();
  this.state=s;this.chapter=s.chapter;this.tick=s.ticks;this.reduced=reduced;
  for(const b of this.slots){
   const e=s.enemies[b.index],current=b.chapter===s.chapter&&e?.kind===b.kind;
   if(!current||!['battle','victory'].includes(s.mode)||b.mesh.isDisposed()){
    this.release(b,'cancelled');b.owner=null;b.hp=null;b.wasVisible=false;b.move=null;b.lastAction=-1;continue;
   }
   if(b.owner!==e){this.release(b,'cancelled');b.owner=e;b.hp=null;b.wasVisible=false;b.move=null;b.lastAction=-1;b.key='';}
   b.base.copyFrom(b.mesh.position);
   const visible=enabled(b.mesh),wasLiving=b.hp!==null&&b.hp>0;
   const hits=effects.filter(f=>!f.enemyAction&&(f.kind==='hit'||f.kind==='combo')&&(f.actor===0||f.actor===1||f.guest===true||f.kind==='combo')&&f.x===e.x&&f.z===e.z);
   const unique=s.enemies.filter(f=>trialEnemyKind(f.kind)&&f.x===e.x&&f.z===e.z).length===1;
   const hit=unique?hits.at(-1):undefined;
   if(e.hp<=0){
    b.move=null;
    if(wasLiving&&b.wasVisible&&hit&&!reduced&&!b.ghost&&!b.mesh.isEnabled())this.makeGhost(b,{kind:'death',tick:s.ticks,receivedTick:s.ticks,index:b.index,foeKind:b.kind,chapter:b.chapter,effect:structuredClone(hit),hpBefore:b.hp!,hpAfter:e.hp});
   }else if(!visible||s.mode!=='battle')b.move=null;
   else {
    if(b.move&&s.ticks-b.move.tick>=(b.move.kind==='attack'?24:18)){this.record(b,b.move,'expired',{x:0,z:0});b.move=null;}
    for(const f of effects){
     const a=f.enemyAction;
     if(b.kind!=='tankHead'&&f.kind==='hit'&&f.actor===undefined&&!f.guest&&a&&a.index===b.index&&Number.isSafeInteger(a.tick)&&a.tick>=0&&a.tick<=s.ticks&&s.ticks-a.tick<24&&a.tick>b.lastAction&&point(a.origin)&&point(a.target)&&point(f)&&a.origin.x===e.x&&a.origin.z===e.z&&a.target.x===f.x&&a.target.z===f.z&&s.players.some(p=>p.x===f.x&&p.z===f.z)){
      b.lastAction=a.tick;b.move={kind:'attack',tick:a.tick,receivedTick:s.ticks,index:b.index,foeKind:b.kind,chapter:b.chapter,effect:structuredClone(f),hpBefore:e.hp,hpAfter:e.hp};
     }
    }
    // Actual HP loss is essential: shielded zero-damage fire must not displace a tank part.
    if(hit&&wasLiving&&e.hp<b.hp!){b.move=null;if(point(hit.origin))b.move={kind:'recoil',tick:s.ticks,receivedTick:s.ticks,index:b.index,foeKind:b.kind,chapter:b.chapter,effect:structuredClone(hit),hpBefore:b.hp!,hpAfter:e.hp};}
    if(b.move){const offset=trialBodyOffset(b.move,s.ticks,reduced);b.mesh.position.set(b.base.x+offset.x,b.base.y,b.base.z+offset.z);b.lastPosition=b.mesh.position.clone();const age=s.ticks-b.move.tick,half=b.move.kind==='attack'?12:9;this.record(b,b.move,age===0?'start':age<half?'out':'return',offset);}
   }
   if(b.ghost){
    const g=b.ghost,age=s.ticks-g.cause.tick;
    if(reduced||e.hp>0||age<0)this.release(b,'cancelled');
    else if(age>=24)this.release(b,'expired');
    else {const q=age/24;g.mesh.scaling.set(g.scale.x,g.scale.y*(1-.6*q),g.scale.z);g.mesh.position.copyFrom(g.base).subtractInPlace(g.up.scale(g.height*g.scale.y*.3*q));g.material.alpha=.82*(1-q);g.mesh.setEnabled(true);this.recordGhost(b,age===0?'start':age<12?'fading':'late');}
   }
   // Keep the observed living source across a paused, undelivered lethal event.
   // Ghost creation above still requires the actual frame-owned delivered hit.
   if(!awaitingLethalDelivery(s,e)){b.hp=e.hp;b.wasVisible=visible&&e.hp>0;}
  }
 }
 private makeGhost(b:Slot,cause:Cause):void {
  if(this.slots.filter(x=>x.ghost).length>=3)return;
  let texture:DynamicTexture|undefined,material:StandardMaterial|undefined,mesh:Mesh|undefined;
  try{
   const source=b.mesh.material as StandardMaterial,t=source.diffuseTexture as DynamicTexture,size=t.getSize(),pixels=t.getContext().getImageData(0,0,size.width,size.height);
   texture=new DynamicTexture('trial-remnant-'+b.index,size,this.scene,false,Texture.NEAREST_SAMPLINGMODE);texture.hasAlpha=true;texture.getContext().putImageData(pixels,0,0);texture.update();
   const cell={width:size.width,height:size.height,fnv1a32:hash(texture.getContext().getImageData(0,0,size.width,size.height).data)};if(cell.fnv1a32!==hash(pixels.data))throw new Error('Trial remnant copy mismatch');
   material=new StandardMaterial('trial-remnant-'+b.index,this.scene);material.diffuseTexture=texture;material.emissiveTexture=texture;material.opacityTexture=texture;material.disableLighting=true;material.backFaceCulling=false;material.transparencyMode=Material.MATERIAL_ALPHABLEND;
   material.diffuseColor.copyFrom(source.diffuseColor);material.emissiveColor.copyFrom(source.emissiveColor);material.specularColor.copyFrom(source.specularColor);
   const bounds=b.mesh.getBoundingInfo().boundingBox.extendSize;
   mesh=MeshBuilder.CreatePlane('trial-remnant-'+b.index,{width:bounds.x*2,height:bounds.y*2},this.scene);mesh.parent=b.mesh.parent;mesh.material=material;mesh.billboardMode=b.mesh.billboardMode;mesh.isPickable=false;mesh.position.copyFrom(b.base);mesh.scaling.copyFrom(b.mesh.scaling);
   b.ghost={mesh,material,texture,base:mesh.position.clone(),scale:mesh.scaling.clone(),up:Vector3.TransformNormal(this.scene.activeCamera?.getDirection(Vector3.Up())??Vector3.Up(),b.mesh.parent?Matrix.Invert(b.mesh.parent.getWorldMatrix()):Matrix.Identity()).normalize(),height:bounds.y*2,cause,cell};this.created++;
  }catch{mesh?.dispose();material?.dispose(false,false);texture?.dispose();this.failures++;}
 }
 private push(row:Row):void {this.history.push(row);if(this.history.length>24){this.history.shift();this.dropped++;}}
 private record(b:Slot,cause:Cause,phase:string,offset:Vec):void {
  const key=`${cause.kind}/${cause.tick}/${phase}/${this.reduced}`;if(key===b.key)return;b.key=key;
  this.push({tick:this.tick!,phase,cause:structuredClone(cause),base:b.base.asArray(),position:b.mesh.position.asArray(),offset:{...offset},scale:b.mesh.scaling.asArray(),alpha:1,enabled:enabled(b.mesh),originalEnabled:b.mesh.isEnabled(),reducedMotion:this.reduced,cell:null,geometry:null,scope:'transform-texture-not-framebuffer'});
 }
 private recordGhost(b:Slot,phase:string):void {
  const g=b.ghost;if(!g)return;const key=`death/${g.cause.tick}/${phase}`;if(key===b.key)return;b.key=key;
  this.push({tick:this.tick!,phase,cause:structuredClone(g.cause),base:g.base.asArray(),position:g.mesh.position.asArray(),offset:{x:0,z:0},scale:g.mesh.scaling.asArray(),alpha:g.material.alpha,enabled:!['expired','cancelled'].includes(phase)&&g.mesh.isEnabled(),originalEnabled:b.mesh.isEnabled(),reducedMotion:this.reduced,cell:{...g.cell},geometry:{base:g.base.asArray(),scale:g.scale.asArray(),up:g.up.asArray(),height:g.height},scope:'transform-texture-not-framebuffer'});
 }
 private release(b:Slot,phase:string):void {
  const g=b.ghost;if(!g)return;g.mesh.setEnabled(false);this.recordGhost(b,phase);b.ghost=null;g.mesh.dispose();g.material.dispose(false,false);g.texture.dispose();this.released++;
 }
 dispose():void {if(this.disposed)return;this.reset();this.disposed=true;this.slots=[];}
 inspect(){return {profile:TRIAL_BODY.id,clock:'simulation-ticks',tick:this.tick,chapter:this.chapter,reducedMotion:this.reduced,disposed:this.disposed,stateMutation:false,approved:false,historyLimit:24,historyDropped:this.dropped,history:structuredClone(this.history),resources:{active:this.slots.filter(b=>b.ghost).length,limit:3,rawTextureBytes:this.slots.reduce((n,b)=>n+(b.ghost?b.ghost.cell.width*b.ghost.cell.height*4:0),0),maxTextureBytes:49152,created:this.created,released:this.released,creationFailures:this.failures},remnants:this.slots.flatMap(b=>b.ghost?[{index:b.index,kind:b.kind,deathTick:b.ghost.cause.tick,cell:{...b.ghost.cell},textureUploads:1,enabled:b.ghost.mesh.isEnabled(),originalEnabled:b.mesh.isEnabled()}]:[])};}
}
