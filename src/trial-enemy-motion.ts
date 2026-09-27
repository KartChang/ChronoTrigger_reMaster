import {DynamicTexture,Mesh,StandardMaterial,Scene} from '@babylonjs/core';
import {trialHistoryEviction,TRIAL_MOTION_HISTORY} from './trial-motion-history';
import type {State,Effect,Enemy} from './core';
import {tankVisualFrame} from './art-profile';
import {drawTrialEnemy,trialEnemyKind,TRIAL_ENEMY_ART} from './trial-enemy-art';
import type {TrialEnemyKind,TrialEnemyFrame} from './trial-enemy-art';
export const TRIAL_ENEMY_MOTION=Object.freeze({id:'vq03u-trial-enemy-motion',actionTicks:24,hurtTicks:18,historyLimit:24,approved:false});
type Cause={kind:'attack'|'repair'|'hurt';tick:number;receivedTick:number;index:number;effect:Effect;hpBefore?:number;hpAfter?:number};
type Binding={mesh:Mesh;texture:DynamicTexture;kind:TrialEnemyKind;index:number;chapter:string;frame:TrialEnemyFrame;uploads:number;owner:Enemy|null;historyOwner:Enemy|null;hp:number|null;cause:Cause|null;key:string};
type Row={index:number;kind:TrialEnemyKind;chapter:string;tick:number;mode:State['mode'];hp:number;atb:number;frame:TrialEnemyFrame;reducedMotion:boolean;cause:Cause|null;cell:{width:number;height:number;fnv1a32:number}|null;scope:'texture-not-framebuffer'};
const fnv=(data:ArrayLike<number>)=>{let h=2166136261;for(let i=0;i<data.length;i++)h=Math.imul(h^data[i]!,16777619);return h>>>0;};
export function trialEnemyFrame(tick:number,kind:TrialEnemyKind,reduced:boolean,cause:{kind:Cause['kind'];tick:number}|null):TrialEnemyFrame{
 if(!Number.isSafeInteger(tick)||tick<0||!trialEnemyKind(kind)||typeof reduced!=='boolean')throw new RangeError('Invalid trial animation input');
 if(reduced)return 0;
 if(cause&&Number.isSafeInteger(cause.tick)&&cause.tick>=0&&tick>=cause.tick){const age=tick-cause.tick;if(cause.kind==='hurt'&&age<18)return 4;if(cause.kind!=='hurt'){if(age<8)return 2;if(age<16)return 3;if(age<24)return 1;}}
 return kind==='prisonGuard'?0:tankVisualFrame(tick,true) as 0|1;
}
/** Single presentation owner for borrowed trial textures; no rule, transform or save writes. */
export class TrialEnemyMotion{
 private bindings:Binding[]=[];private state:State|null=null;private chapter='';private tick:number|null=null;private reduced=false;private disposed=false;
 private history:Row[]=[];private dropped=0;private readFailures=0;
 private evictions={idle:0,superseded:0,duplicate:0,capacity:0};
 constructor(private readonly scene:Scene){scene.onDisposeObservable.addOnce(()=>this.dispose());}
 bind(mesh:Mesh,kind:TrialEnemyKind,index:number,chapter:string):void{
  const texture=(mesh.material as StandardMaterial)?.diffuseTexture as DynamicTexture,size=texture?.getSize(),w=kind==='prisonGuard'?48:64;
  if(this.disposed||this.scene.isDisposed||mesh.isDisposed()||mesh.getScene()!==this.scene||!trialEnemyKind(kind)||!Number.isInteger(index)||index<0||index>2||!(texture instanceof DynamicTexture)||size.width!==w||size.height!==64||this.bindings.some(b=>b.mesh===mesh||b.texture===texture))throw new Error('Invalid trial texture ownership');
  this.bindings.push({mesh,texture,kind,index,chapter,frame:0,uploads:0,owner:null,historyOwner:null,hp:null,cause:null,key:''});
  mesh.onDisposeObservable.addOnce(()=>{this.bindings=this.bindings.filter(b=>b.mesh!==mesh);this.history=this.history.filter(h=>h.chapter!==chapter||h.index!==index);});
 }
 private clear():void{for(const b of this.bindings){b.owner=null;b.historyOwner=null;b.hp=null;b.cause=null;b.key='';}this.history=[];this.dropped=0;this.readFailures=0;this.evictions={idle:0,superseded:0,duplicate:0,capacity:0};}
 draw(s:State,reduced=false,effects:readonly Effect[]=[]):void{
  if(this.disposed)return;
  if(!Number.isSafeInteger(s.ticks)||s.ticks<0||typeof reduced!=='boolean')throw new RangeError('Invalid trial simulation input');
  if(this.state!==s||this.chapter!==s.chapter||(this.tick!==null&&s.ticks<this.tick))this.clear();
  this.state=s;this.chapter=s.chapter;this.tick=s.ticks;this.reduced=reduced;
  for(const b of this.bindings){
   const e=s.enemies[b.index],active=b.chapter===s.chapter&&s.mode==='battle'&&e?.kind===b.kind&&e.hp>0;
   const visible=!b.mesh.isDisposed()&&b.mesh.isEnabled()&&b.mesh.isVisible&&b.mesh.visibility>0;
   if(!active){b.owner=null;b.hp=null;b.cause=null;b.key='';if(visible&&b.kind!=='prisonGuard'&&(!e||e.kind!==b.kind||e.hp>0))this.paint(b,0);continue;}
   // Keep the completed battle history at victory, but never carry it into a new encounter owner.
   if(b.historyOwner!==e){if(b.historyOwner)this.history=this.history.filter(h=>h.chapter!==b.chapter||h.index!==b.index);b.historyOwner=e;}
   if(b.owner!==e){b.owner=e;b.hp=null;b.cause=null;b.key='';}
   if(!visible){b.cause=null;b.hp=e.hp;b.key='';continue;}
   if(b.cause&&s.ticks-b.cause.tick>=(b.cause.kind==='hurt'?18:24))b.cause=null;
   for(const effect of effects){
    const a=effect.enemyAction;
    if(a){
     const repair=b.kind==='tankHead'&&effect.kind==='heal',attack=b.kind!=='tankHead'&&effect.kind==='hit';
     if((!repair&&!attack)||effect.actor!==undefined||effect.guest||a.index!==b.index||!Number.isSafeInteger(a.tick)||a.tick<0||a.tick>s.ticks||s.ticks-a.tick>=24||!a.origin||!a.target||![a.origin.x,a.origin.z,a.target.x,a.target.z,effect.x,effect.z].every(Number.isFinite)||a.origin.x!==e.x||a.origin.z!==e.z||a.target.x!==effect.x||a.target.z!==effect.z)continue;
     if(repair&&!s.enemies.some(target=>target!==e&&target.hp>0&&(target.kind==='tankBody'||target.kind==='tankWheel')&&target.x===effect.x&&target.z===effect.z))continue;
     if(attack&&!s.players.some(p=>p.x===effect.x&&p.z===effect.z))continue;
     if(b.cause&&b.cause.tick>=a.tick)continue;
     b.cause={kind:repair?'repair':'attack',tick:a.tick,receivedTick:s.ticks,index:b.index,effect:structuredClone(effect)};
    }else if((effect.kind==='hit'||effect.kind==='combo')&&(effect.actor===0||effect.actor===1||effect.guest||effect.kind==='combo')&&effect.x===e.x&&effect.z===e.z&&b.hp!==null&&e.hp<b.hp&&s.enemies.filter(f=>f.hp>0&&trialEnemyKind(f.kind)&&f.x===effect.x&&f.z===effect.z).length===1){
     // Shielded zero-damage hits do not invent a hurt pose. First-draw HP is unknown.
     b.cause={kind:'hurt',tick:s.ticks,receivedTick:s.ticks,index:b.index,effect:structuredClone(effect),hpBefore:b.hp,hpAfter:e.hp};
    }
   }
   const frame=trialEnemyFrame(s.ticks,b.kind,reduced,b.cause);this.paint(b,frame);b.hp=e.hp;
   const key=`${frame}/${b.cause?.kind}/${b.cause?.tick}/${reduced}`;if(key===b.key)continue;b.key=key;
   let cell:Row['cell']=null;try{const size=b.texture.getSize(),data=b.texture.getContext().getImageData(0,0,size.width,size.height).data;cell={...size,fnv1a32:fnv(data)};}catch{this.readFailures++;}
   this.history.push({index:b.index,kind:b.kind,chapter:s.chapter,tick:s.ticks,mode:s.mode,hp:e.hp,atb:e.atb,frame,reducedMotion:reduced,cause:structuredClone(b.cause),cell,scope:'texture-not-framebuffer'});
   if(this.history.length>24){const eviction=trialHistoryEviction(this.history);this.history.splice(eviction.index,1);this.evictions[eviction.reason]++;this.dropped++;}
  }
 }
 private paint(b:Binding,frame:TrialEnemyFrame):void{if(b.frame===frame)return;drawTrialEnemy(b.texture.getContext() as CanvasRenderingContext2D,b.kind,frame);b.texture.update();b.frame=frame;b.uploads++;}
 /** Last successfully drawn cell, not a clock-derived substitute. */
 drawnFrame(mesh:Mesh):TrialEnemyFrame|null{return this.bindings.find(b=>b.mesh===mesh)?.frame??null;}
 dispose():void{this.clear();this.bindings=[];this.state=null;this.tick=null;this.disposed=true;}
 inspect(){return {profile:TRIAL_ENEMY_MOTION.id,artProfile:TRIAL_ENEMY_ART.id,clock:'simulation-ticks',tick:this.tick,chapter:this.chapter,reducedMotion:this.reduced,disposed:this.disposed,historyLimit:24,historyPolicy:TRIAL_MOTION_HISTORY.id,historyEvictions:{...this.evictions},historyDropped:this.dropped,textureReadFailures:this.readFailures,history:structuredClone(this.history),bindings:this.bindings.map(b=>({name:b.mesh.name,index:b.index,chapter:b.chapter,kind:b.kind,frame:b.frame,uploads:b.uploads,visible:b.mesh.isEnabled()&&b.mesh.isVisible&&b.mesh.visibility>0})),stateMutation:false,additionalGpuResources:0,approved:false};}
}
