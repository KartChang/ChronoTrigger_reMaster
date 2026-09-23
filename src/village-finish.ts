import {Color3,DynamicTexture,Scene,StandardMaterial,Texture,TransformNode} from '@babylonjs/core';
import {drawVillageSign,drawVillageSurface,VILLAGE_ART} from './village-art';
import {VillageDetail} from './village-detail';
import type {VillageSurface} from './village-art';
import {drawVillagePlanter,PLANTER_ART,PLANTER_SAMPLE_POINTS} from './village-planter-art';
/** Finishes the existing Truce owner; VillageDetail declares the sign-only scale change. */
export class VillageFinish{
 private root:TransformNode|undefined;
 private readonly surfaces=new Map<VillageSurface,StandardMaterial>();
 private sign:DynamicTexture|undefined;
 private planter:StandardMaterial|undefined;
 private readonly detail:VillageDetail;
 constructor(private readonly scene:Scene){this.detail=new VillageDetail(scene);}
 private material(kind:VillageSurface):StandardMaterial{
  const previous=this.surfaces.get(kind);if(previous)return previous;
  const name='truce-craft-'+kind,t=new DynamicTexture(name,VILLAGE_ART.cell,this.scene,false,Texture.NEAREST_SAMPLINGMODE);
  t.hasAlpha=false;drawVillageSurface(t.getContext() as CanvasRenderingContext2D,kind);t.update();
  const m=new StandardMaterial(name,this.scene);m.diffuseTexture=t;m.diffuseColor=Color3.White();m.specularColor=Color3.Black();
  this.surfaces.set(kind,m);return m;
 }
 private planterMaterial():StandardMaterial{
  if(this.planter)return this.planter;
  const name='truce-planter-craft',t=new DynamicTexture(name,PLANTER_ART.cell,this.scene,false,Texture.NEAREST_SAMPLINGMODE);
  t.hasAlpha=false;drawVillagePlanter(t.getContext() as CanvasRenderingContext2D);t.update();
  const m=new StandardMaterial(name,this.scene);m.diffuseTexture=t;m.diffuseColor=Color3.White();m.specularColor=Color3.Black();
  this.planter=m;return m;
 }
 apply(root:TransformNode):void{
  if(root.name!=='kingdom-truce')throw new Error('Village finish belongs only to Truce');
  if(this.root===root)return;if(this.root)throw new Error('Truce finish already owns a root');this.root=root;
  for(const mesh of root.getChildMeshes(false)){
   const name=mesh.name,old=mesh.material as StandardMaterial|null;let kind:VillageSurface|undefined;
   if(name==='truce-plaster')kind='plaster';
   else if(['truce-stone-plinth','truce-chimney'].includes(name))kind='stone';
   else if(['truce-timber','truce-crossbeam','truce-lintel','truce-ridge'].includes(name))kind='timber';
   else if(name==='truce-door')kind='door';
   else if(['truce-pitched-roof','truce-roof-course'].includes(name))kind=['#876048','#A07A59'].includes(old?.diffuseColor.toHexString()??'')?'clay':'slate';
   if(kind)mesh.material=this.material(kind);
   if(name==='truce-flower-box')mesh.material=this.planterMaterial();
   if(name==='inn-sign'){
    const t=old?.diffuseTexture;if(!(t instanceof DynamicTexture)||t.getSize().width!==80||t.getSize().height!==40)throw new Error('Original inn sign missing');
    drawVillageSign(t.getContext() as CanvasRenderingContext2D);t.update();this.sign=t;
   }
  }
  this.detail.apply(root);
 }
 inspect(){
  if(!this.root||this.root.isDisposed()||!this.root.isEnabled())return null;
  const sample=(t:DynamicTexture,points:readonly (readonly number[])[])=>points.map(([x,y])=>({x:x!,y:y!,rgba:Array.from(t.getContext().getImageData(x!,y!,1,1).data)}));
  const resource=(kind:string,t:DynamicTexture)=>({kind,name:t.name,...t.getSize(),sampling:t.samplingMode,alpha:t.hasAlpha,samples:sample(t,kind==='sign'?[[0,0],[3,3],[13,15],[38,13],[45,19]]:[[0,0],[7,12],[23,41],[48,32],[62,62]])});
  const p=this.planter?.diffuseTexture as DynamicTexture|undefined;
  const planters=p?{profile:PLANTER_ART.id,approved:false,name:p.name,...p.getSize(),sampling:p.samplingMode,alpha:p.hasAlpha,samples:sample(p,PLANTER_SAMPLE_POINTS),meshes:this.root.getChildMeshes(false).filter(b=>b.material===this.planter&&b.isEnabled()).length}:null;
  return {profile:VILLAGE_ART.id,approved:false,chapter:'truce',planters,details:this.detail.inspect(),surfaces:[...this.surfaces].map(([kind,m])=>({...resource(kind,m.diffuseTexture as DynamicTexture),meshes:this.root!.getChildMeshes(false).filter(b=>b.material===m&&b.isEnabled()).length})),sign:this.sign?resource('sign',this.sign):null};
 }
}
