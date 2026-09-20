import {Color3,DynamicTexture,Material,Mesh,MeshBuilder,Scene,ShadowGenerator,StandardMaterial,Texture,TransformNode,Vector3} from '@babylonjs/core';
import {drawEarlyProp} from './early-art';
import type {EarlyPropArt} from './early-art';
/** Small art construction kit, not a second game framework. No collision or story writes. */
export function earlyKit(scene:Scene,root:TransformNode,shadow:ShadowGenerator,prefix:string){
 let occlusionGroup:string|null=null;
 const cache=new Map<string,StandardMaterial>(),staticParts:Mesh[]=[],records:{id:string;kind:string}[]=[];
 const mat=(name:string,hex:string)=>{const key=name+hex;let m=cache.get(key);if(m)return m;m=new StandardMaterial(prefix+'-'+name,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor=Color3.Black();cache.set(key,m);return m;};
 const attach=(m:Mesh,material:StandardMaterial,kind:string,cast=true)=>{m.parent=root;m.material=material;m.receiveShadows=true;m.isPickable=false;records.push({id:m.name,kind});m.metadata={artKit:'vq01',kind,gameCollision:false};if(occlusionGroup&&kind!=='contact-shadow')m.metadata.occlusionGroup=occlusionGroup;if(cast)shadow.addShadowCaster(m);return m;};
 const box=(id:string,x:number,y:number,z:number,w:number,h:number,d:number,hex:string)=>{const m=attach(MeshBuilder.CreateBox(prefix+'-'+id,{width:w,height:h,depth:d},scene),mat(hex,hex),'joinery',h>.22);m.position.set(x,y,z);staticParts.push(m);return m;};
 const cylinder=(id:string,x:number,y:number,z:number,top:number,bottom:number,h:number,hex:string,sides=16)=>{const m=attach(MeshBuilder.CreateCylinder(prefix+'-'+id,{diameterTop:top,diameterBottom:bottom,height:h,tessellation:sides},scene),mat(hex,hex),'turned-prop');m.position.set(x,y,z);return m;};
 const lathe=(id:string,x:number,y:number,z:number,profile:readonly (readonly [number,number])[],hex:string)=>{const m=attach(MeshBuilder.CreateLathe(prefix+'-'+id,{shape:profile.map(([r,yy])=>new Vector3(r,yy,0)),tessellation:20,sideOrientation:Mesh.DOUBLESIDE},scene),mat(hex,hex),'turned-prop');m.position.set(x,y,z);return m;};
 const torus=(id:string,x:number,y:number,z:number,diameter:number,thickness:number,hex:string)=>{const m=attach(MeshBuilder.CreateTorus(prefix+'-'+id,{diameter,thickness,tessellation:12},scene),mat(hex,hex),'metal-band',false);m.position.set(x,y,z);return m;};
 function imageMaterial(kind:EarlyPropArt){
  const key='paint-'+kind;let m=cache.get(key);if(m)return m;
  const t=new DynamicTexture(prefix+'-'+key,{width:128,height:128},scene,false,Texture.NEAREST_SAMPLINGMODE);t.hasAlpha=true;drawEarlyProp(t.getContext() as CanvasRenderingContext2D,kind);t.update(true);
  m=mat(key,'#ffffff');m.diffuseTexture=t;m.useAlphaFromDiffuseTexture=true;m.transparencyMode=kind==='curtain'?Material.MATERIAL_ALPHATESTANDBLEND:Material.MATERIAL_ALPHATEST;m.backFaceCulling=false;cache.set(key,m);return m;
 }
 const decal=(id:string,kind:EarlyPropArt,x:number,z:number,w:number,d:number,y=.075)=>{const m=attach(MeshBuilder.CreateGround(prefix+'-'+id,{width:w,height:d},scene),imageMaterial(kind),'textile',false);m.position.set(x,y,z);return m;};
 const panel=(id:string,kind:EarlyPropArt,x:number,y:number,z:number,w:number,h:number)=>{const m=attach(MeshBuilder.CreatePlane(prefix+'-'+id,{width:w,height:h},scene),imageMaterial(kind),'wall-art',false);m.position.set(x,y,z);return m;};
 function contact(id:string,x:number,z:number,w:number,d:number,alpha=.16,y=.085){
  const m=mat('contact-'+alpha,'#33372e');m.alpha=alpha;m.disableLighting=true;m.backFaceCulling=false;
  const disk=attach(MeshBuilder.CreateDisc(prefix+'-'+id,{radius:.5,tessellation:32},scene),m,'contact-shadow',false);disk.rotation.x=Math.PI/2;disk.scaling.set(w,d,1);disk.position.set(x,y,z);return disk;
 }
 function group<T>(id:string,make:()=>T):T{const previous=occlusionGroup;occlusionGroup=prefix+'-'+id;try{return make();}finally{occlusionGroup=previous;}}
 const occluder=(mesh:Mesh,id:string)=>{mesh.metadata={...mesh.metadata,occlusionGroup:prefix+'-'+id};return mesh;};
 function table(id:string,x:number,z:number,w:number,d:number,top=1.02){
  contact(id+'-contact',x,z,w+.2,d+.18,.12);
  group(id,()=>{
  for(const a of [-1,1])for(const b of [-1,1]){box(id+'-leg',x+a*(w/2-.15),top/2,z+b*(d/2-.15),.16,top,.16,'#72513c');box(id+'-foot',x+a*(w/2-.15),.13,z+b*(d/2-.15),.20,.22,.20,'#634b39');}
  box(id+'-apron',x,top-.18,z,w-.12,.27,d-.12,'#7d5940');box(id+'-lip',x,top,z,w+.06,.12,d+.06,'#79553e');box(id+'-top',x,top+.085,z,w,.09,d,'#a37e55');
  for(let i=1;i<4;i++)box(id+'-board-seam',x,top+.133,z-d/2+i*d/4,w-.07,.003,.015,'#936c4b');
  });
 }
 function stool(id:string,x:number,z:number){
  for(const a of [-1,1])for(const b of [-1,1])box(id+'-leg',x+a*.21,.24,z+b*.2,.1,.48,.1,'#6c4c37');box(id+'-seat',x,.53,z,.67,.13,.62,'#a58059');box(id+'-back',x,.94,z-.26,.62,.62,.11,'#896445');box(id+'-back-inset',x,.98,z-.325,.43,.3,.018,'#ab855d');
 }
 function pot(id:string,x:number,y:number,z:number,size=.5,hex='#aa7359'){
  lathe(id,x,y,z,[[size*.26,0],[size*.43,size*.12],[size*.47,size*.55],[size*.32,size*.78],[size*.35,size*.83],[size*.25,size*.85],[size*.25,size*.74]],hex);
  cylinder(id+'-soil',x,y+size*.74,z,size*.46,size*.46,.018,'#554b37');
 }
 function plant(id:string,x:number,y:number,z:number,size=.6){
  pot(id,x,y,z,size,'#a6775a');
  // Tapered leaves have volume and a vein, with no spherical green placeholder canopy.
  for(let i=0;i<7;i++){
   const a=i*Math.PI*2/7,h=size*(.45+(i%3)*.12),r=size*.52;
   const paths=[[new Vector3(0,0,0),new Vector3(Math.cos(a)*r,h*.65,Math.sin(a)*r),new Vector3(Math.cos(a)*r*.92,h,Math.sin(a)*r*.92)],
    [new Vector3(.025,0,.025),new Vector3(Math.cos(a)*r+Math.sin(a)*size*.16,h*.56,Math.sin(a)*r-Math.cos(a)*size*.16),new Vector3(Math.cos(a)*r*.92,h,Math.sin(a)*r*.92)]];
   const leaf=attach(MeshBuilder.CreateRibbon(prefix+'-'+id+'-leaf',{pathArray:paths,sideOrientation:Mesh.DOUBLESIDE},scene),mat('leaf-'+i%2,i%2?'#6d8854':'#507151'),'foliage',false);leaf.position.set(x,y+size*.74,z);
  }
 }
 function plate(id:string,x:number,y:number,z:number,size=.43){cylinder(id+'-rim',x,y,z,size,size,.045,'#c9bfa0');cylinder(id+'-well',x,y+.028,z,size*.8,size*.8,.008,'#abac92');}
 function cup(id:string,x:number,y:number,z:number,size=.22){
  lathe(id,x,y,z,[[size*.42,0],[size*.49,size],[size*.38,size],[size*.32,size*.2]],'#c6bfa4');
  const h=torus(id+'-handle',x+size*.47,y+size*.53,z,size*.65,size*.13,'#b1a88b');h.rotation.x=Math.PI/2;
 }
 function books(id:string,x:number,y:number,z:number,w=1.5){
  for(let i=0;i<8;i++){const h=.26+(i%3)*.05;box(id+'-book',x-w/2+i*w/8,y+h/2,z,w/10,h,.20,['#687e79','#9a6b60','#b39d71','#8d8391'][i%4]!);box(id+'-spine',x-w/2+i*w/8,y+h*.75,z-.105,w/12,.025,.018,'#c6b789');}
 }
 function curtain(id:string,x:number,y:number,z:number,w:number,h:number){
  const paths:Vector3[][]=[];for(let row=0;row<2;row++){const line:Vector3[]=[];for(let i=0;i<=16;i++){const xx=(i/16-.5)*w;line.push(new Vector3(xx,(row-.5)*h,Math.cos(i/16*Math.PI*8)*.07));}paths.push(line);}
  const m=attach(MeshBuilder.CreateRibbon(prefix+'-'+id,{pathArray:paths,sideOrientation:Mesh.DOUBLESIDE},scene),imageMaterial('curtain'),'curtain',false);m.position.set(x,y,z);return m;
 }
 const finish=()=>{
  // A table or awning must not be merged with an unrelated wall sharing its colour.
  const groups=new Map<Material,Map<string,Mesh[]>>();
  for(const m of staticParts){let byGroup=groups.get(m.material!);if(!byGroup){byGroup=new Map();groups.set(m.material!,byGroup);}const id=m.metadata?.occlusionGroup??'';const a=byGroup.get(id)??[];a.push(m);byGroup.set(id,a);shadow.removeShadowCaster(m);}
  for(const byGroup of groups.values())for(const [id,a] of byGroup){const m=Mesh.MergeMeshes(a,true,true,undefined,false,false);if(m){m.parent=root;m.receiveShadows=true;m.isPickable=false;m.name=prefix+'-joinery-batch';m.metadata={artKit:'vq01',kind:'joinery-batch',gameCollision:false,...(id?{occlusionGroup:id}:{})};shadow.addShadowCaster(m);}}
 };
 return {mat,attach,box,cylinder,lathe,torus,panel,decal,contact,table,stool,pot,plant,plate,cup,books,curtain,finish,records,group,occluder};
}
