import {fairStoneGeometry,fairStoneBevel,FAIR_HUMAN_WIDTH,FAIR_HUMAN_HEIGHT} from './fair-cohesion';
import {drawFairPlaza,inspectFairPlaza} from './fair-paving';
import {finishFair,FAIR_TREE_ROOTS} from './fair-finish';
import {bannerPose,sceneryPose,FAIR_SCENERY_MOTION} from './fair-scenery-motion';
import {shadeFairGround,inspectFairGround} from './fair-ground';
import {EarlyOcclusion} from './early-occlusion';
import {fairOcclusionPoints} from './fair-occlusion-points';
import type {CameraSubject} from './early-camera-view';
import {buildFestivalKit} from './festival-kit';
import {NpcMotion} from './npc-motion';
import {drawWitness,WITNESS_SIZE} from './witness-art';
import {placeSpriteContact,inspectSpriteContacts} from './sprite-contact';
import type {SpriteContact} from './sprite-contact';
import {buildFairConduct} from './fair-conduct-render';
import {drawHDHero,HD_ART} from './hd-hero-art';
import {drawTree,drawGato} from './pixel-art';
import {Scene,Mesh,MeshBuilder,TransformNode,Color3,StandardMaterial,DynamicTexture,Texture,Material,ShadowGenerator,Vector3} from '@babylonjs/core';
import {FAIR_STALLS} from './fair-data';
import type {State} from './core';

/** Reference-aligned art pass, still a compact layout rather than the whole original map. */
export function buildFair(scene:Scene,shadow:ShadowGenerator){
  const root=new TransformNode('millennial-fair',scene);
  const reducedMedia=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
  const occlusion=new EarlyOcclusion(scene);
  scene.onDisposeObservable.add(()=>occlusion.dispose());
  const materials=new Map<string,StandardMaterial>();
  const staticBoxes:Mesh[]=[];
  const material=(hex:string)=>{
    let m=materials.get(hex);if(m)return m;
    m=new StandardMaterial('fair-'+hex,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor=Color3.Black();materials.set(hex,m);return m;
  };
  const attach=(m:Mesh,mat:StandardMaterial,cast=true)=>{m.parent=root;m.material=mat;m.receiveShadows=true;m.isPickable=false;m.metadata={...m.metadata,fairCastShadow:cast};if(cast)shadow.addShadowCaster(m);return m;};
  const stoneForms=new Set(['bell-foot','bell-post','bell-capital','bell-arch-stone']);
  const box=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,hex:string)=>{
    const stone=stoneForms.has(name),geometry=stone?new Mesh(name,scene):MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);
    if(stone){fairStoneGeometry(w,h,d).applyToMesh(geometry,false);geometry.useVertexColors=true;}
    const m=attach(geometry,material(hex),(stone||name==='telepod-beam'||h>.35)&&name!=='fair-plinth');
    m.metadata.fairBevel=stone?fairStoneBevel(w,h,d):null;m.position.set(x,y,z);staticBoxes.push(m);return m;
  };
  const cylinder=(name:string,x:number,y:number,z:number,top:number,bottom:number,h:number,hex:string)=>{
    const m=attach(MeshBuilder.CreateCylinder(name,{diameterTop:top,diameterBottom:bottom,height:h,tessellation:12},scene),material(hex));m.position.set(x,y,z);return m;
  };
  box('fair-plinth',0,-.55,1,27,1.05,21,'#67725b');
  // North is the top of the authored canvas; the old ground path was vertically reversed.
  const t=new DynamicTexture('fair-ground-reference',{width:512,height:512},scene,true,Texture.NEAREST_NEAREST_MIPLINEAR);
  drawFairPlaza(t.getContext() as CanvasRenderingContext2D);t.anisotropicFilteringLevel=4;t.update(true);
  const groundMat=new StandardMaterial('fair-ground-material',scene);groundMat.diffuseTexture=t;groundMat.specularColor=Color3.Black();
  const ground=attach(MeshBuilder.CreateGround('fair-ground',{width:26.8,height:20.8,subdivisions:32},scene),groundMat,false);ground.position.z=1;ground.position.y=.04;shadeFairGround(ground);
  const festival=buildFestivalKit(scene,root,shadow),vendorMotion=new NpcMotion();
  const contacts:(SpriteContact&{height:number})[]=[];
  // Stone bell arch, bronze bell and flower frieze follow the reference's landmarks.
  for(const x of [-4.7,-2.3]){
    box('bell-foot',x,.2,-.5,.58,.35,.8,'#afa58a');
    box('bell-post',x,1.6,-.5,.35,2.8,.65,'#afa58a');
    box('bell-capital',x,3,-.5,.64,.25,.85,'#afa58a');
    for(let i=0;i<3;i++)box('bell-stone-seam',x,.8+i*.67,-.84,.37,.045,.025,'#7e806d');
  }
  for(let i=0;i<14;i++){
    const a=(i+.5)/14*Math.PI;
    const part=box('bell-arch-stone',-3.5+Math.cos(a)*1.22,3+Math.sin(a)*.86,-.5,.31,.35,.72,'#afa58a');part.rotation.z=a+Math.PI/2;
  }
  const bell=new TransformNode('leene-bell-assembly',scene);bell.parent=root;bell.position.set(-3.5,3.01,-.5);
  const shell=attach(MeshBuilder.CreateLathe('leene-bell',{shape:[[.06,0],[.24,-.12],[.30,-.30],[.36,-.64],[.50,-.96],[.64,-1.1],[.65,-1.17],[.54,-1.16],[.43,-.98],[.29,-.62]].map(([r,y])=>new Vector3(r,y,0)),tessellation:24,sideOrientation:Mesh.DOUBLESIDE},scene),material('#a88a54'));
  shell.parent=bell;
  const rim=cylinder('bell-rim',0,-1.12,0,1.29,1.3,.08,'#c1a773');rim.parent=bell;
  const lip=cylinder('bell-interior',0,-1.175,0,1.04,1.04,.015,'#4f4c3a');lip.parent=bell;
  const clapper=cylinder('bell-clapper',0,-1.22,0,.11,.16,.25,'#745b3d');clapper.parent=bell;
  // North: two low, walkable demonstration platforms, not a 600 AD time gate.
  const rings:Mesh[]=[];
  for(const x of [-2.4,2.4]){
    cylinder('telepod-base',x,.10,9,2.2,2.4,.17,'#758993');
    cylinder('telepod-dial',x,.20,9,1.9,1.9,.05,'#c3b994');
    const ring=attach(MeshBuilder.CreateTorus('telepod-ring',{diameter:1.6,thickness:.055,tessellation:32},scene),material('#95afa6'),false);ring.position.set(x,.24,9);rings.push(ring);
    box('telepod-pole',x-1.1,1.1,10.3,.17,2.2,.17,'#758993');box('telepod-pole',x+1.1,1.1,10.3,.17,2.2,.17,'#758993');
    box('telepod-beam',x,2.2,10.3,2.4,.2,.2,'#b9a269');
  }
  const makeSprite=(name:string,x:number,y:number,z:number,robot=false,witness=false)=>{
    const tex=new DynamicTexture(name,{width:robot?48:HD_ART.width,height:robot?48:HD_ART.height},scene,false,Texture.NEAREST_SAMPLINGMODE);tex.hasAlpha=true;
    const ctx=tex.getContext() as CanvasRenderingContext2D;
    if(robot)drawGato(ctx);else drawHDHero(ctx,'lucca',0,0);
    tex.update();const m=new StandardMaterial(name,scene);m.diffuseTexture=tex;m.emissiveTexture=tex;m.disableLighting=true;m.useAlphaFromDiffuseTexture=true;m.transparencyMode=Material.MATERIAL_ALPHATEST;m.alphaCutOff=.4;m.backFaceCulling=false;
    const mesh=attach(MeshBuilder.CreatePlane(name,{width:robot?2.8:FAIR_HUMAN_WIDTH,height:robot?2.8:FAIR_HUMAN_HEIGHT},scene),m,false);mesh.billboardMode=Mesh.BILLBOARDMODE_ALL;mesh.position.set(x,y,z);
    if(!robot){
      mesh.metadata.fairHuman=true;
      const ground=MeshBuilder.CreateDisc(name+'-contact',{radius:.5,tessellation:24},scene);ground.parent=root;ground.rotation.x=Math.PI/2;ground.isPickable=false;
      const shade=new StandardMaterial(name+'-shade',scene);shade.disableLighting=true;shade.diffuseColor=Color3.Black();shade.alpha=.20;shade.backFaceCulling=false;ground.material=shade;
      contacts.push({id:name,mesh,shadow:ground,foot:{x,y:.14,z},height:FAIR_HUMAN_HEIGHT,pivotY:witness?WITNESS_SIZE.pivot.y:HD_ART.pivot.y,cellHeight:witness?WITNESS_SIZE.h:HD_ART.height});
    }
    return mesh;
  };
  const lucca=makeSprite('lucca-handdrawn',0,1,7.7);
  const robot=makeSprite('gato-handdrawn',-7,1.3,4.8,true);


  const save=cylinder('fair-save-point',3.5,.15,-5.5,.9,1.1,.22,'#8ebfc8');
  // Pixel canopies retain crisp leaf clusters instead of low-poly green balls.
  const tt=new DynamicTexture('fair-tree',{width:64,height:80},scene,false,Texture.NEAREST_SAMPLINGMODE);tt.hasAlpha=true;drawTree(tt.getContext() as CanvasRenderingContext2D);tt.update();
  const tm=new StandardMaterial('fair-tree',scene);tm.diffuseTexture=tt;tm.emissiveTexture=tt;tm.disableLighting=true;tm.useAlphaFromDiffuseTexture=true;tm.transparencyMode=Material.MATERIAL_ALPHATEST;tm.backFaceCulling=false;
  const trees:Mesh[]=[];
  for(const [x,z]of FAIR_TREE_ROOTS){
    const tree=attach(MeshBuilder.CreatePlane('fair-tree',{width:4.2,height:5.25},scene),tm,false);tree.billboardMode=Mesh.BILLBOARDMODE_ALL;tree.position.set(x!,2.65,z!);trees.push(tree);
  }
  for(const [x,z]of [[-5.5,-.5],[-1.5,-.5]]){
    box('bell-flowerbed',x!,.22,z!,1,.14,1.7,'#827b63');
    for(let i=0;i<10;i++)box('bell-flowers',x!+(i%2-.5)*.32,.48,z!+(Math.floor(i/2)-2)*.25,.10,.10,.10,i%2?'#c36c81':'#d7bc67');
  }
  // The dropped pendant and gate are story-state visuals, never progression authorities.
  const pendant=attach(MeshBuilder.CreatePolyhedron('dropped-pendant',{type:1,size:.17},scene),material('#dcdfa6'),false);pendant.position.set(-2.4,.5,9);pendant.setEnabled(false);
  const gate=attach(MeshBuilder.CreateTorus('opening-gate',{diameter:2.2,thickness:.12,tessellation:48},scene),material('#6ca6dd'),false);gate.rotation.x=Math.PI/2;gate.position.set(-2.4,1.45,9);gate.setEnabled(false);
  // Retain the four original cloth/sign meshes; only their top-fixed pivots move.
  const banners:TransformNode[]=[];
  let scenery=sceneryPose(0);
  // The reference uses vertical red banners; avoid decorative wires crossing character faces.
  for(const [x,z] of [[-9.9,-2.8],[9.8,2.5],[-9.8,7.8],[4.8,7.2]]){
    cylinder('banner-post',x!,1.5,z!,.065,.075,3,'#9f967b');
    const cloth=box('vertical-banner',x!+.26,2.32,z!,.55,1.10,.025,'#b84568');
    cloth.rotation.z=.04;
    box('banner-cross',x!+.26,2.9,z!,.73,.045,.04,'#c3b68b');
    const emblem=box('banner-gold-symbol',x!+.26,2.35,z!-.025,.08,.37,.025,'#e4bd64');
    const pivot=new TransformNode('fair-banner-pivot-'+banners.length,scene);pivot.parent=root;pivot.position.set(x!+.26,2.87,z!);
    cloth.parent=pivot;cloth.position.set(0,-.55,0);emblem.parent=pivot;emblem.position.set(0,-.52,-.025);
    for(const part of [cloth,emblem]){staticBoxes.splice(staticBoxes.indexOf(part),1);part.isPickable=false;part.checkCollisions=false;}
    banners.push(pivot);
  }
  for(const stall of FAIR_STALLS){
    const vendor=makeSprite('fair-vendor-'+stall.id,stall.x,1.0,stall.z+.48,false,true);
    const tex=(vendor.material as StandardMaterial).diffuseTexture as DynamicTexture;
    // Existing 48x64 witness painter, not a stretched 24px resident or repainted party asset.
    drawWitness(tex.getContext() as CanvasRenderingContext2D,'shopper');tex.update();vendorMotion.add(vendor,'shopper');
  }
  // Merge only immobile opaque boxes. Animated bell, sprites, rings and gate stay separate.
  // Keep the original per-part caster decision after merging. Low seams, flowers,
  // trim and plinth must not become casters just because they share a colour.
  const groups=new Map<Material,Map<boolean,Mesh[]>>();
  for(const mesh of staticBoxes){
    const mat=mesh.material!,casts=mesh.metadata.fairCastShadow===true,byCast=groups.get(mat)??new Map<boolean,Mesh[]>();
    const group=byCast.get(casts)??[];group.push(mesh);byCast.set(casts,group);groups.set(mat,byCast);shadow.removeShadowCaster(mesh);
  }
  for(const byCast of groups.values())for(const [casts,group] of byCast){
    const parts=group.map(m=>({name:m.name,casts,bevel:m.metadata.fairBevel as number|null}));
    const merged=Mesh.MergeMeshes(group,true,true,undefined,false,false);
    if(merged){merged.name='fair-static-batch';merged.parent=root;merged.receiveShadows=true;merged.isPickable=false;
      merged.metadata={fairParts:parts,gameCollision:false};if(casts)shadow.addShadowCaster(merged);}
  }
  const conductView=buildFairConduct(scene,root);
  const finish=finishFair(scene,root,shadow,trees);
  root.setEnabled(false);
  return {root,resetOcclusion:()=>occlusion.reset(),inspectOcclusion:()=>occlusion.inspect(),
    updateOcclusion(ticks:number,subjects:readonly CameraSubject[]){
      const camera=scene.activeCamera;
      occlusion.update(ticks,root.isEnabled()?'fair':'outside-festival',camera?.getDirection(Vector3.Forward())??Vector3.Zero(),root.isEnabled()?fairOcclusionPoints(subjects):[]);
    },inspect:()=>({...conductView.inspect(),ground:inspectFairGround(ground,t),paving:inspectFairPlaza(t),finish:finish.inspect(),festival:festival.inspect(),scenery:{profile:FAIR_SCENERY_MOTION,tick:scenery.tick,reducedMotion:scenery.reducedMotion,banners:banners.map(b=>({id:b.name,anchor:b.position.asArray(),rotation:b.rotation.asArray(),parts:b.getChildMeshes().map(m=>m.name)})),rotations:{gate:gate.rotation.z,pendant:pendant.rotation.y,ring:rings.map(r=>r.rotation.y),save:save.rotation.y,robotY:robot.position.y,bell:bell.rotation.z},approved:false},vendors:vendorMotion.inspect(),vendorContacts:inspectSpriteContacts(contacts),bell:{parts:bell.getChildMeshes().map(m=>m.name),swing:bell.rotation.z},groundingApproved:false}),draw(s:State,_time:number,reducedMotion=reducedMedia?.matches??false){
    finish.draw();
    scenery=sceneryPose(s.ticks,reducedMotion);
    banners.forEach((b,i)=>{const pose=bannerPose(scenery.tick,i,reducedMotion);b.rotation.set(pose.x,0,pose.z);});
    conductView.draw(s);vendorMotion.draw(s.ticks);
    lucca.setEnabled(s.rescue.stage!=='returned');
    const up=scene.activeCamera?.getDirection(Vector3.Up());
    for(const a of contacts){a.shadow.setEnabled(a.mesh.isEnabled());if(up&&a.mesh.isEnabled())placeSpriteContact(a.mesh,a.shadow,a.foot,up,a.height,a.pivotY,a.cellHeight,.86,.42);}
    pendant.setEnabled(s.opening.phase==='lost');
    gate.setEnabled(['resonance','lost','pendant','crossing'].includes(s.opening.phase));gate.rotation.z=scenery.gate;pendant.rotation.y=scenery.pendant;
    robot.setEnabled(s.mode!=='victory'&&!(s.mode==='battle'&&s.enemies[0]?.hp===0));
    robot.position.y=1.3+(s.mode==='battle'?scenery.robotLift:0);
    for(const ring of rings)ring.rotation.y=scenery.ring;
    bell.rotation.z=s.fair.bellHeard?scenery.bell:0;
    save.rotation.y=scenery.save;
  }};
}
