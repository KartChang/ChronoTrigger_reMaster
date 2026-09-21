import {Color3,HemisphericLight,Material,Mesh,Scene,StandardMaterial,TransformNode,Vector3,VertexBuffer,VertexData} from '@babylonjs/core';
import type {Light} from '@babylonjs/core';
import {inspectSpriteContacts,placeSpriteContact} from './sprite-contact';
import type {SpriteContact} from './sprite-contact';

/** Fair-only presentation; retained textures, camera, collision and party are not modified. */
export const FAIR_FINISH_PROFILE='vq01w-fair-light-and-contact';
export const FAIR_TREE_ROOTS=Object.freeze([[-11.5,8],[11.5,-6],[-12.9,-5],[12.9,7],[-10.5,11],[8,11]].map(p=>Object.freeze(p)));
const metalNames=new Set(['leene-bell','bell-rim','telepod-ring','vq01-festival-telepod-copper-inlay','vq01-festival-telepod-coil']);

/** Small vertex-alpha mesh: no image, screen-space blur, render target or shadow map. */
export function contactGeometry(){
 const positions:number[]=[0,0,0],normals:number[]=[0,0,-1],colors:number[]=[1,1,1,1],indices:number[]=[];
 const sectors=24,radii=[.12,.28,.42,.5],alphas=[.88,.44,.12,0];
 for(let ring=0;ring<radii.length;ring++)for(let i=0;i<sectors;i++){
  const a=i/sectors*Math.PI*2;positions.push(Math.cos(a)*radii[ring]!,Math.sin(a)*radii[ring]!,0);normals.push(0,0,-1);colors.push(1,1,1,alphas[ring]!);
 }
 for(let i=0;i<sectors;i++)indices.push(0,1+i,1+(i+1)%sectors);
 for(let ring=1;ring<radii.length;ring++)for(let i=0;i<sectors;i++){
  const a=1+(ring-1)*sectors+i,b=1+(ring-1)*sectors+(i+1)%sectors,c=a+sectors,d=b+sectors;indices.push(a,c,b,b,c,d);
 }
 const data=new VertexData();Object.assign(data,{positions,normals,colors,indices});return data;
}

export function finishFair(scene:Scene,root:TransformNode,key:Light,trees:readonly Mesh[]){
 const lit=root.getChildMeshes().filter(m=>m.material instanceof StandardMaterial&&!m.material.disableLighting);
 const litSet=new Set(lit);
 // Keep the original key/shadow generator. Replace only this scene's generic fill;
 // lights belonging to the technical village no longer illuminate fair geometry.
 const exclusions=scene.lights.filter(l=>l!==key).map(light=>({light,added:lit.filter(m=>!light.excludedMeshes.includes(m))}));
 for(const {light,added} of exclusions)light.excludedMeshes.push(...added);
 const fill=new HemisphericLight('fair-local-skylight',new Vector3(-.2,1,-.15),scene);
 fill.diffuse=Color3.FromHexString('#b9d1e1');fill.groundColor=Color3.FromHexString('#384b44');fill.specular=Color3.Black();fill.intensity=.28;
 fill.includedOnlyMeshes=lit;fill.parent=root;
 const finishes:{mesh:Mesh;original:StandardMaterial;material:StandardMaterial}[]=[];
 for(const mesh of lit){
  if(!(mesh instanceof Mesh)||!metalNames.has(mesh.name))continue;
  const original=mesh.material as StandardMaterial,material=original.clone(mesh.name+'-brushed-bronze');
  material.specularColor=new Color3(.24,.19,.12);material.specularPower=48;mesh.material=material;finishes.push({mesh,original,material});
 }
 const shadowMaterial=new StandardMaterial('fair-soft-contact',scene);
 shadowMaterial.disableLighting=true;shadowMaterial.diffuseColor=Color3.Black();shadowMaterial.emissiveColor=Color3.FromHexString('#26382f');
 shadowMaterial.alpha=.24;shadowMaterial.transparencyMode=Material.MATERIAL_ALPHABLEND;shadowMaterial.backFaceCulling=false;
 const data=contactGeometry(),shadows:Mesh[]=[],contacts:SpriteContact[]=[];
 function shade(name:string,x:number,z:number,width:number,depth:number){
  const m=new Mesh(name,scene);data.applyToMesh(m,false);m.parent=root;m.material=shadowMaterial;m.rotation.x=Math.PI/2;
  m.position.set(x,.075,z);m.scaling.set(width,depth,1);m.isPickable=false;m.checkCollisions=false;m.useVertexColors=true;m.hasVertexAlpha=true;
  m.metadata={presentation:FAIR_FINISH_PROFILE,gameCollision:false};shadows.push(m);return m;
 }
 trees.forEach((mesh,i)=>{
  const p=FAIR_TREE_ROOTS[i];if(!p)throw new Error('Unexpected fair tree');
  const shadow=shade('fair-tree-soft-contact-'+i,p[0]!,p[1]!,3.4,1.3);
  contacts.push({id:'fair-tree-'+i,mesh,shadow,foot:{x:p[0]!,y:.075,z:p[1]!},pivotY:77,cellHeight:80});
 });
 for(const x of [-4.7,-2.3])shade('fair-bell-foot-contact',x,-.5,1.0,1.05);
 let disposed=false;
 function dispose(){
  if(disposed)return;disposed=true;
  for(const {light,added} of exclusions)for(const m of added){const i=light.excludedMeshes.indexOf(m);if(i>=0)light.excludedMeshes.splice(i,1);}
  for(const {mesh,original,material} of finishes){if(!mesh.isDisposed()&&mesh.material===material)mesh.material=original;material.dispose();}
  fill.dispose();for(const m of shadows)m.dispose();shadowMaterial.dispose();
 }
 root.onDisposeObservable.add(dispose);
 return {dispose,draw(){
  const up=scene.activeCamera?.getDirection(Vector3.Up());if(!up)return;
  for(const c of contacts)placeSpriteContact(c.mesh,c.shadow,c.foot,up,5.25,77,80,3.4,1.3);
 },inspect(){
  const alphas=shadows[0]?.getVerticesData(VertexBuffer.ColorKind)?.filter((_,i)=>i%4===3)??[];
  return {profile:FAIR_FINISH_PROFILE,source:'actual-fair-light-material-contact',approved:false,
   fill:{intensity:fill.intensity,diffuse:fill.diffuse.asArray(),ground:fill.groundColor.asArray(),enabled:fill.isEnabled(),included:fill.includedOnlyMeshes.length,onlyFair:fill.includedOnlyMeshes.length>0&&fill.includedOnlyMeshes.every(m=>litSet.has(m)&&m.isDescendantOf(root))},
   excluded:exclusions.map(({light,added})=>({light:light.name,count:added.length,complete:added.every(m=>light.excludedMeshes.includes(m))})),
   key:{name:key.name,intensity:key.intensity,enabled:key.isEnabled(),receivesKey:lit.every(m=>key.canAffectMesh(m))},
   metals:finishes.map(({mesh})=>{const m=mesh.material as StandardMaterial;return {mesh:mesh.name,specular:m.specularColor.asArray(),power:m.specularPower};}),
   contacts:inspectSpriteContacts(contacts),softShadows:{count:shadows.length,vertices:shadows.reduce((n,m)=>n+m.getTotalVertices(),0),triangles:shadows.reduce((n,m)=>n+m.getTotalIndices()/3,0),alphaMin:Math.min(...alphas),alphaMax:Math.max(...alphas),dynamic:shadows.some(m=>m.getVertexBuffer(VertexBuffer.ColorKind)?.isUpdatable()),decorativeOnly:shadows.every(m=>!m.isPickable&&!m.checkCollisions)},
   physicalDevice:false,artApproved:false};
 }};
}
