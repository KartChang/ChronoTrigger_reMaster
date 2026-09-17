import {drawTree,drawLucca,drawGato,drawResident} from './pixel-art';
import {drawSurface,drawMasonry} from './world-art';
import {Scene,Mesh,MeshBuilder,TransformNode,Color3,StandardMaterial,DynamicTexture,Texture,Material,ShadowGenerator} from '@babylonjs/core';
import {FAIR_STALLS} from './fair-data';
import type {State} from './core';

/** Reference-aligned art pass, still a compact layout rather than the whole original map. */
export function buildFair(scene:Scene,shadow:ShadowGenerator){
  const root=new TransformNode('millennial-fair',scene);
  const materials=new Map<string,StandardMaterial>();
  const staticBoxes:Mesh[]=[];
  const material=(hex:string)=>{
    let m=materials.get(hex);if(m)return m;
    m=new StandardMaterial('fair-'+hex,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor=Color3.Black();materials.set(hex,m);return m;
  };
  const attach=(m:Mesh,mat:StandardMaterial,cast=true)=>{m.parent=root;m.material=mat;m.receiveShadows=true;if(cast)shadow.addShadowCaster(m);return m;};
  const box=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,hex:string)=>{
    const m=attach(MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene),material(hex),h>.35);m.position.set(x,y,z);staticBoxes.push(m);return m;
  };
  const cylinder=(name:string,x:number,y:number,z:number,top:number,bottom:number,h:number,hex:string)=>{
    const m=attach(MeshBuilder.CreateCylinder(name,{diameterTop:top,diameterBottom:bottom,height:h,tessellation:12},scene),material(hex));m.position.set(x,y,z);return m;
  };
  box('fair-plinth',0,-.55,1,27,1.05,21,'#485d59');
  // North is the top of the authored canvas; the old ground path was vertically reversed.
  const t=new DynamicTexture('fair-ground-reference',{width:512,height:512},scene,false,Texture.NEAREST_SAMPLINGMODE);
  drawSurface(t.getContext() as CanvasRenderingContext2D,512,512,'fair');t.update(true);
  const groundMat=new StandardMaterial('fair-ground-material',scene);groundMat.diffuseTexture=t;groundMat.specularColor=Color3.Black();
  const ground=attach(MeshBuilder.CreateGround('fair-ground',{width:26.8,height:20.8},scene),groundMat,false);ground.position.z=1;ground.position.y=.04;
  const masonry=new DynamicTexture('fair-masonry',{width:128,height:128},scene,false,Texture.NEAREST_SAMPLINGMODE);
  drawMasonry(masonry.getContext() as CanvasRenderingContext2D);masonry.update();
  const stone=material('#c2baa4');stone.diffuseTexture=masonry;
  // The collision footprints and rendered stalls are driven by the same records.
  for(const stall of FAIR_STALLS){
    box(stall.id+'-counter',stall.x,.65,stall.z,stall.w,1.25,stall.d,'#95724f');
    box(stall.id+'-front',stall.x,.85,stall.z-stall.d/2-.025,stall.w+.1,.25,.15,'#c6a779');
    for(const side of [-1,1])for(const front of [-1,1])box(stall.id+'-post',stall.x+side*(stall.w/2-.1),1.6,stall.z+front*(stall.d/2-.08),.13,3.0,.13,'#584c46');
    const tint=stall.id==='cloth'?'#977098':stall.id==='candy'?'#c35b78':'#cc863a';
    for(let i=0;i<8;i++){
      for(let d=0;d<3;d++){
        const roof=box(stall.id+'-awning',stall.x-stall.w/2+(i+.5)*stall.w/8,2.67-d*.12,stall.z+.75-d*.9,stall.w/8+.01,.07,.96,i%2?'#dfd4b4':tint);
        roof.rotation.x=-.07-d*.09;
      }
      box(stall.id+'-fringe',stall.x-stall.w/2+(i+.5)*stall.w/8,2.15,stall.z-stall.d/2-.3,stall.w/8,.28,.055,i%2?'#dfd4b4':tint);
    }
    // Counter detail stays within the existing collision footprint.
    box(stall.id+'-tray',stall.x,.99,stall.z-stall.d/2+.22,stall.w-.4,.08,.58,'#644b36');
    for(let i=0;i<6;i++){
      const x=stall.x-1.25+i*.48;
      cylinder(stall.id+'-pot',x,1.4,stall.z-.58,.20,.32,.31,['#788fa5','#b26c69','#92a378'][i%3]!);
      cylinder(stall.id+'-pot-lip',x,1.57,stall.z-.58,.22,.22,.06,'#d7be8b');
    }
    for(let i=0;i<4;i++)box(stall.id+'-boards',stall.x-stall.w/2+.18+i*.82,.55,stall.z-stall.d/2-.055,.04,.8,.04,'#725539');
  }
  // Stone bell arch, bronze bell and flower frieze follow the reference's landmarks.
  for(const x of [-4.7,-2.3]){
    box('bell-foot',x,.2,-.5,.58,.35,.8,'#c2baa4');
    box('bell-post',x,1.6,-.5,.35,2.8,.65,'#c2baa4');
    box('bell-capital',x,3,-.5,.64,.25,.85,'#c2baa4');
    for(let i=0;i<3;i++)box('bell-stone-seam',x,.8+i*.67,-.84,.37,.045,.025,'#7e806d');
  }
  for(let i=0;i<14;i++){
    const a=(i+.5)/14*Math.PI;
    const part=box('bell-arch-stone',-3.5+Math.cos(a)*1.22,3+Math.sin(a)*.86,-.5,.31,.35,.72,'#c2baa4');part.rotation.z=a+Math.PI/2;
  }
  const bell=cylinder('leene-bell',-3.5,2.35,-.5,.55,1.12,1.05,'#876342');
  cylinder('bell-rim',-3.5,1.87,-.5,1.28,1.28,.14,'#b18b55');
  cylinder('bell-shoulder',-3.5,2.87,-.5,.55,.67,.16,'#a17a48');
  cylinder('bell-clapper',-3.5,1.70,-.5,.14,.18,.22,'#4f4538');
  // North: two low, walkable demonstration platforms, not a 600 AD time gate.
  const rings:Mesh[]=[];
  for(const x of [-2.4,2.4]){
    cylinder('telepod-base',x,.10,9,2.2,2.4,.17,'#758993');
    cylinder('telepod-dial',x,.20,9,1.9,1.9,.05,'#c3b994');
    const ring=attach(MeshBuilder.CreateTorus('telepod-ring',{diameter:1.6,thickness:.055,tessellation:32},scene),material('#85bbb5'),false);ring.position.set(x,.24,9);rings.push(ring);
    box('telepod-pole',x-1.1,1.1,10.3,.17,2.2,.17,'#758993');box('telepod-pole',x+1.1,1.1,10.3,.17,2.2,.17,'#758993');
    box('telepod-beam',x,2.2,10.3,2.4,.2,.2,'#b9a269');
  }
  const makeSprite=(name:string,x:number,y:number,z:number,robot=false)=>{
    const tex=new DynamicTexture(name,{width:robot?48:24,height:robot?48:32},scene,false,Texture.NEAREST_SAMPLINGMODE);tex.hasAlpha=true;
    const ctx=tex.getContext() as CanvasRenderingContext2D;
    if(robot)drawGato(ctx);else drawLucca(ctx);
    tex.update();const m=new StandardMaterial(name,scene);m.diffuseTexture=tex;m.emissiveTexture=tex;m.disableLighting=true;m.useAlphaFromDiffuseTexture=true;m.transparencyMode=Material.MATERIAL_ALPHATEST;m.alphaCutOff=.4;m.backFaceCulling=false;
    const mesh=attach(MeshBuilder.CreatePlane(name,{width:robot?2.8:1.35,height:robot?2.8:1.85},scene),m,false);mesh.billboardMode=Mesh.BILLBOARDMODE_ALL;mesh.position.set(x,y,z);return mesh;
  };
  const lucca=makeSprite('lucca-handdrawn',0,1,7.7);
  const robot=makeSprite('gato-handdrawn',-7,1.3,4.8,true);


  const save=cylinder('fair-save-point',3.5,.15,-5.5,.9,1.1,.22,'#8ebfc8');
  // Pixel canopies retain crisp leaf clusters instead of low-poly green balls.
  const tt=new DynamicTexture('fair-tree',{width:64,height:80},scene,false,Texture.NEAREST_SAMPLINGMODE);tt.hasAlpha=true;drawTree(tt.getContext() as CanvasRenderingContext2D);tt.update();
  const tm=new StandardMaterial('fair-tree',scene);tm.diffuseTexture=tt;tm.emissiveTexture=tt;tm.disableLighting=true;tm.useAlphaFromDiffuseTexture=true;tm.transparencyMode=Material.MATERIAL_ALPHATEST;tm.backFaceCulling=false;
  for(const [x,z]of [[-11.5,8],[11.5,-6],[-12.9,-5],[12.9,7],[-10.5,11],[8,11]]){
    const tree=attach(MeshBuilder.CreatePlane('fair-tree',{width:4.2,height:5.25},scene),tm,false);tree.billboardMode=Mesh.BILLBOARDMODE_ALL;tree.position.set(x!,2.65,z!);
  }
  for(const [x,z]of [[-5.5,-.5],[-1.5,-.5]]){
    box('bell-flowerbed',x!,.22,z!,1,.14,1.7,'#827b63');
    for(let i=0;i<10;i++)box('bell-flowers',x!+(i%2-.5)*.32,.48,z!+(Math.floor(i/2)-2)*.25,.10,.10,.10,i%2?'#c36c81':'#d7bc67');
  }
  // The dropped pendant and gate are story-state visuals, never progression authorities.
  const pendant=attach(MeshBuilder.CreatePolyhedron('dropped-pendant',{type:1,size:.17},scene),material('#dcdfa6'),false);pendant.position.set(-2.4,.5,9);pendant.setEnabled(false);
  const gate=attach(MeshBuilder.CreateTorus('opening-gate',{diameter:2.2,thickness:.12,tessellation:48},scene),material('#6ca6dd'),false);gate.rotation.x=Math.PI/2;gate.position.set(-2.4,1.45,9);gate.setEnabled(false);
  // The reference uses vertical red banners; avoid decorative wires crossing character faces.
  for(const [x,z] of [[-9.9,-2.8],[9.8,2.5],[-9.8,7.8],[4.8,7.2]]){
    cylinder('banner-post',x!,1.5,z!,.065,.075,3,'#9f967b');
    const cloth=box('vertical-banner',x!+.26,2.32,z!,.55,1.10,.025,'#b84568');
    cloth.rotation.z=.04;
    box('banner-cross',x!+.26,2.9,z!,.73,.045,.04,'#c3b68b');
    box('banner-gold-symbol',x!+.26,2.35,z!-.025,.08,.37,.025,'#e4bd64');
  }
  for(const stall of FAIR_STALLS){
    const vendor=makeSprite('fair-vendor-'+stall.id,stall.x,1.0,stall.z+.48);
    const tex=(vendor.material as StandardMaterial).diffuseTexture as DynamicTexture;
    drawResident(tex.getContext() as CanvasRenderingContext2D,'resident');tex.update();
  }
  // Merge only immobile opaque boxes. Animated bell, sprites, rings and gate stay separate.
  const groups=new Map<Material,Mesh[]>();
  for(const mesh of staticBoxes){const mat=mesh.material!;const group=groups.get(mat)??[];group.push(mesh);groups.set(mat,group);shadow.removeShadowCaster(mesh);}
  for(const group of groups.values()){
    const merged=Mesh.MergeMeshes(group,true,true,undefined,false,false);
    if(merged){merged.name='fair-static-batch';merged.parent=root;merged.receiveShadows=true;shadow.addShadowCaster(merged);}
  }
  root.setEnabled(false);
  return {root,draw(s:State,time:number){
    lucca.setEnabled(true);pendant.setEnabled(s.opening.phase==='lost');
    gate.setEnabled(['resonance','lost','pendant','crossing'].includes(s.opening.phase));gate.rotation.z=time*.5;pendant.rotation.y=time;
    robot.setEnabled(s.mode!=='victory'&&!(s.mode==='battle'&&s.enemies[0]?.hp===0));
    robot.position.y=1.3+(s.mode==='battle'?Math.sin(time*4)*.035:0);
    for(const ring of rings)ring.rotation.y=time*.18;
    bell.rotation.z=s.fair.bellHeard?Math.sin(time*1.3)*.025:0;
    save.rotation.y=time*.25;
  }};
}
