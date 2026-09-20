import {Mesh,MeshBuilder,Scene,ShadowGenerator,TransformNode,Vector3} from '@babylonjs/core';
import {earlyKit} from './early-kit';
import {FAIR_STALLS} from './fair-data';
/** Detailed stalls use the existing collision records; decorative goods stay on their counters. */
export function buildFestivalKit(scene:Scene,root:TransformNode,shadow:ShadowGenerator){
 const k=earlyKit(scene,root,shadow,'vq01-festival'),{box,cylinder,torus}=k;
 for(const stall of FAIR_STALLS){
  const {id,x,z,w,d}=stall,tint=id==='cloth'?'#81758d':id==='candy'?'#ae7375':'#6f8a7a';
  k.contact(id+'-shade',x,z,w+.14,d+.12,.16);
  // Raised joinery, inset front boards and a real counter lip read as a shop rather than a box.
  for(const side of [-1,1])for(const end of [-1,1]){box(id+'-post',x+side*(w/2-.1),1.25,z+end*(d/2-.08),.12,2.48,.12,'#735d43');box(id+'-post-foot',x+side*(w/2-.1),.13,z+end*(d/2-.08),.19,.24,.19,'#96805b');}
  box(id+'-apron',x,.52,z-.07,w-.14,.85,d-.16,'#8d7051');
  for(let n=0;n<7;n++){const xx=x-w/2+.25+n*(w-.5)/6;box(id+'-panel',xx,.5,z-d/2-.005,(w-.5)/7,.59,.02,n%2?'#a2855e':'#9c7c56');}
  box(id+'-rail',x,.88,z-d/2-.018,w,.10,.08,'#c0a378');box(id+'-sill',x,1.00,z,w+.02,.13,d,'#b3976c');
  box(id+'-counter-runner',x,1.076,z-.1,w-.16,.018,d-.12,'#b6a68a');
  box(id+'-canopy-rail',x,2.38,z+d/2-.1,w+.15,.095,.095,'#796044');
  // Curved textile sections: continuous profile, shaded underside and scalloped valance.
  k.group(id+'-canopy',()=>{
  for(let stripe=0;stripe<8;stripe++){
   const paths:Vector3[][]=[];
   for(const sx of [0,1]){const path:Vector3[]=[];for(let step=0;step<=8;step++){
    const t=step/8,xx=x-w/2+(stripe+sx)*w/8;
    path.push(new Vector3(xx,2.42-.36*t-.10*Math.sin(t*Math.PI),z+d/2+.04-t*(d+.34)));
   }paths.push(path);}
   k.attach(MeshBuilder.CreateRibbon(id+'-curved-awning-'+stripe,{pathArray:paths,sideOrientation:Mesh.DOUBLESIDE},scene),k.mat(id+'-cloth-'+stripe%2,stripe%2?'#d0c3a6':tint),'awning',true);
   const xx=x-w/2+(stripe+.5)*w/8;
   box(id+'-valance',xx,1.997,z-d/2-.3,w/8+.003,.19,.042,stripe%2?'#c7b998':tint);
   const tip=box(id+'-scallop',xx,1.887,z-d/2-.3,w/8*.69,.06,.042,stripe%2?'#bfb18f':tint);tip.isPickable=false;
  }
  });
  // Identifiable goods for each stall, located forward of the awning shadow.
  for(let n=0;n<5;n++){
   const xx=x-1.21+n*.60,zz=z-.80;
   if(id==='candy'){
    k.plate(id+'-dish-'+n,xx,1.106,zz,.47);
    for(let j=0;j<3;j++)cylinder(id+'-sweet',xx+(j-1)*.09,1.17,zz+(j%2)*.1,.11,.12,.1,['#b27d63','#c7a568','#a66d6b'][n%3]!);
   }else if(id==='cloth'){
    const roll=cylinder(id+'-cloth-roll',xx,1.25,zz,.26,.26,.52,['#82928b','#a4838e','#b69b75'][n%3]!);roll.rotation.x=Math.PI/2;
    torus(id+'-roll-tie',xx,1.25,zz,.275,.02,'#d8c398').rotation.x=Math.PI/2;
   }else{
    k.pot(id+'-earthenware-'+n,xx,1.094,zz,.30,['#a87c64','#94a28c','#a29a75'][n%3]!);
   }
  }
  k.panel(id+'-emblem','sign',x-w/2+.42,.54,z-d/2-.065,.50,.52);
  k.plant(id+'-counter-flowers',x+w/2-.38,1.09,z+.62,.35);
  // Stock boxes and basket remain within the shop footprint, not new walkway obstacles.
  box(id+'-stock-crate',x-w/2+.38,.24,z+d/2-.35,.55,.45,.50,'#9b805b');
  for(const side of [-1,1])box(id+'-crate-strap',x-w/2+.38+side*.18,.24,z+d/2-.61,.04,.42,.025,'#6b6350');
 }
 // The telepod is an engineered brass apparatus, without new walk-blocking geometry.
 for(const x of [-2.4,2.4]){
  torus('telepod-copper-inlay',x,.22,9,2.03,.055,'#bc996a');
  for(const dx of [-1.1,1.1]){
   cylinder('telepod-anchor',x+dx,.13,10.3,.43,.55,.23,'#788782');
   cylinder('telepod-insulator',x+dx,1.18,10.3,.29,.29,.70,'#b8b7a4');
   for(let n=0;n<6;n++)torus('telepod-coil',x+dx,.93+n*.10,10.3,.32,.039,'#9c805c');
   cylinder('telepod-terminal',x+dx,2.19,10.3,.33,.25,.22,'#b39e70');
  }
  for(let i=0;i<12;i++){const a=i*Math.PI/6;box('telepod-index',x+Math.cos(a)*.82,.241,9+Math.sin(a)*.82,.045,.018,.06,'#786c4f');}
 }
 k.finish();return {inspect:()=>{
  const meshes=root.getChildMeshes().filter(m=>m.metadata?.artKit==='vq01');
  const awnings=meshes.filter(m=>m.metadata?.kind==='awning');
  return {profile:'vq01-festival',models:k.records.map(m=>({...m})),collisionSource:'FAIR_STALLS',approved:false,
   geometry:{meshes:meshes.length,vertices:meshes.reduce((n,m)=>n+m.getTotalVertices(),0),triangles:meshes.reduce((n,m)=>n+m.getTotalIndices()/3,0),
    awnings:awnings.map(m=>{m.computeWorldMatrix(true);const b=m.getBoundingInfo().boundingBox;return {id:m.name,group:m.metadata.occlusionGroup,vertices:m.getTotalVertices(),triangles:m.getTotalIndices()/3,heightSpan:b.maximumWorld.y-b.minimumWorld.y};}),
    canopyGroups:[...new Set(awnings.map(m=>m.metadata.occlusionGroup))],decorativeOnly:meshes.every(m=>m.metadata.gameCollision===false&&!m.checkCollisions&&!m.isPickable)}};
 }};
}
