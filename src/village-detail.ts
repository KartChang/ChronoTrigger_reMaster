import {Color3,DynamicTexture,Scene,StandardMaterial,Texture,TransformNode,Vector3,VertexBuffer} from '@babylonjs/core';
import type {AbstractMesh} from '@babylonjs/core';
import {DETAIL_SAMPLE_POINTS,DETAIL_SIZES,drawTownDetail,TOWN_DETAIL_ART} from './village-detail-art';
import type {DetailKind} from './village-detail-art';
/** Finishes exactly the existing eight windows. Only the original inn plane's
 * presentation scale changes; no mesh, collider, position, actor or rule is added. */
export class VillageDetail{
 private root:TransformNode|undefined;
 private sign:AbstractMesh|undefined;
 private readonly materials=new Map<DetailKind,StandardMaterial>();
 constructor(private readonly scene:Scene){}
 private material(kind:DetailKind):StandardMaterial{
  const cached=this.materials.get(kind);if(cached)return cached;
  const name='truce-detail-'+kind,t=new DynamicTexture(name,DETAIL_SIZES[kind],this.scene,false,Texture.NEAREST_SAMPLINGMODE);
  t.hasAlpha=false;drawTownDetail(t.getContext() as CanvasRenderingContext2D,kind);t.update();
  const m=new StandardMaterial(name,this.scene);m.diffuseTexture=t;m.diffuseColor=Color3.White();m.specularColor=Color3.Black();
  if(kind==='glass')m.emissiveColor=Color3.FromHexString('#302615');
  this.materials.set(kind,m);return m;
 }
 apply(root:TransformNode):void{
  if(root.name!=='kingdom-truce'||root.getScene()!==this.scene||root.isDisposed())throw new Error('Town details require the live Truce owner');
  if(this.root===root)return;if(this.root)throw new Error('Town details already have an owner');
  const meshes=root.getChildMeshes(false),group=(name:string)=>meshes.filter(m=>m.name===name);
  const frames=group('truce-window'),panes=group('truce-glass'),mullions=group('truce-mullion'),signs=group('inn-sign');
  if(frames.length!==8||panes.length!==8||mullions.length!==8||signs.length!==1)throw new Error('Original town detail geometry missing or duplicated');
  const sign=signs[0]!,t=(sign.material as StandardMaterial|null)?.diffuseTexture;
  if(!(t instanceof DynamicTexture)||t.name!=='truce-inn-sign'||t.getSize().width!==80||t.getSize().height!==40||!sign.scaling.equals(Vector3.One()))throw new Error('Original inn sign resource or scale changed');
  // Validate the complete owner before allocating or changing any of its resources.
  const frame=this.material('frame'),glass=this.material('glass');
  for(const mesh of [...frames,...mullions])mesh.material=frame;
  for(const mesh of panes)mesh.material=glass;
  sign.scaling.set(TOWN_DETAIL_ART.signScale,TOWN_DETAIL_ART.signScale,1);
  this.root=root;this.sign=sign;
 }
 private projection(sign:AbstractMesh){
  const camera=this.scene.activeCamera,positions=sign.getVerticesData(VertexBuffer.PositionKind);
  if(!camera||!positions)return null;
  const engine=this.scene.getEngine(),width=engine.getRenderWidth(),height=engine.getRenderHeight();
  if(width<1||height<1)return null;
  const viewport=camera.viewport.toGlobal(width,height),points:Vector3[]=[];
  for(let i=0;i<positions.length;i+=3)points.push(Vector3.Project(new Vector3(positions[i]!,positions[i+1]!,positions[i+2]!),sign.getWorldMatrix(),this.scene.getTransformMatrix(),viewport));
  const x=Math.min(...points.map(p=>p.x)),y=Math.min(...points.map(p=>p.y));
  const right=Math.max(...points.map(p=>p.x)),bottom=Math.max(...points.map(p=>p.y));
  return {source:'scene-matrix-projection',viewport:{width,height},rect:{x,y,width:right-x,height:bottom-y},inside:points.every(p=>[p.x,p.y,p.z].every(Number.isFinite)&&p.x>=0&&p.x<=width&&p.y>=0&&p.y<=height&&p.z>=0&&p.z<=1)};
 }
 inspect(){
  if(!this.root||this.root.isDisposed()||!this.root.isEnabled()||!this.sign||this.sign.isDisposed())return null;
  const meshes=this.root.getChildMeshes(false);
  return {profile:TOWN_DETAIL_ART.id,approved:false,owner:this.root.name,windows:[...this.materials].map(([kind,m])=>{
   const t=m.diffuseTexture as DynamicTexture;
   return {kind,name:t.name,...t.getSize(),sampling:t.samplingMode,alpha:t.hasAlpha,
    meshes:meshes.filter(b=>b.material===m&&b.isEnabled()).length,
    samples:DETAIL_SAMPLE_POINTS.map(([x,y])=>({x,y,rgba:Array.from(t.getContext().getImageData(x,y,1,1).data)}))};
  }),sign:{name:this.sign.name,texture:(this.sign.material as StandardMaterial).diffuseTexture?.name,
   position:this.sign.position.asArray(),scaling:this.sign.scaling.asArray(),vertices:this.sign.getTotalVertices(),indices:this.sign.getTotalIndices(),projection:this.projection(this.sign)}};
 }
}
