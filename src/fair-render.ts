import {drawTree} from './pixel-art';
import {Scene,Mesh,MeshBuilder,TransformNode,Color3,StandardMaterial,DynamicTexture,Texture,Material,ShadowGenerator,Vector3} from '@babylonjs/core';
import {FAIR_STALLS} from './fair-data';
import type {State} from './core';

/** A hand-authored 3D blockout of the fair. No image, model, music or ROM downloads. */
export function buildFair(scene:Scene,shadow:ShadowGenerator){
  const root=new TransformNode('millennial-fair',scene);
  const materials=new Map<string,StandardMaterial>();
  const material=(hex:string)=>{
    let m=materials.get(hex);if(m)return m;
    m=new StandardMaterial('fair-'+hex,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor=Color3.Black();materials.set(hex,m);return m;
  };
  const attach=(m:Mesh,mat:StandardMaterial,cast=true)=>{m.parent=root;m.material=mat;m.receiveShadows=true;if(cast)shadow.addShadowCaster(m);return m;};
  const box=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,hex:string)=>{
    const m=attach(MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene),material(hex),h>.35);m.position.set(x,y,z);return m;
  };
  const cylinder=(name:string,x:number,y:number,z:number,top:number,bottom:number,h:number,hex:string)=>{
    const m=attach(MeshBuilder.CreateCylinder(name,{diameterTop:top,diameterBottom:bottom,height:h,tessellation:12},scene),material(hex));m.position.set(x,y,z);return m;
  };
  const label=(text:string,x:number,y:number,z:number,width=2.7)=>{
    const t=new DynamicTexture('fair-label',{width:384,height:64},scene,false);t.hasAlpha=true;
    const c=t.getContext() as CanvasRenderingContext2D;c.font='bold 26px sans-serif';c.textAlign='center';c.fillStyle='#fff3cf';c.shadowColor='#203745';c.shadowBlur=5;c.fillText(text,192,43);t.update();
    const m=new StandardMaterial('fair-label',scene);m.diffuseTexture=t;m.emissiveTexture=t;m.opacityTexture=t;m.disableLighting=true;m.backFaceCulling=false;
    const mesh=attach(MeshBuilder.CreatePlane('fair-label',{width,height:width/6},scene),m,false);mesh.billboardMode=Mesh.BILLBOARDMODE_ALL;mesh.position.set(x,y,z);return mesh;
  };
  box('fair-plinth',0,-.55,1,27,1.05,21,'#485d59');
  // One authored pixel texture supplies the grass, cobbled paths and flower beds.
  const t=new DynamicTexture('fair-ground',{width:384,height:288},scene,false,Texture.NEAREST_SAMPLINGMODE);
  const c=t.getContext();c.fillStyle='#536e32';c.fillRect(0,0,384,288);
  for(let i=0;i<3300;i++){c.fillStyle=['#49642a','#779143','#648039'][i%3]!;c.fillRect((i*53)%384,(i*37+Math.floor(i/384)*17)%288,2,2);}
  // Coordinates are mapped to the top surface of a ground mesh (north at texture v=1).
  const path=(x:number,z:number,w:number,d:number)=>{
    const px=(x-w/2+13.4)/26.8*384,py=(z-d/2+9.4)/20.8*288,pw=w/26.8*384,ph=d/20.8*288;
    c.fillStyle='#4f4939';c.fillRect(px-2,py-2,pw+4,ph+4);
    c.fillStyle='#776f58';c.fillRect(px,py,pw,ph);
    for(let yy=0;yy<ph;yy+=7)for(let xx=0;xx<pw;xx+=11){c.fillStyle=['#a39a7e','#b7ac91','#8e8a72'][(xx+yy)%3]!;c.fillRect(px+xx+(yy%2)*2,py+yy,Math.min(9,pw-xx),Math.min(5,ph-yy));c.fillStyle='#d0c5a0';c.fillRect(px+xx+(yy%2)*2,py+yy,Math.min(7,pw-xx),1);}
  };
  path(0,1,4.2,20);path(-2.1,.1,18,3.2);path(-7,3.7,5.1,7.5);path(0,8.4,9,4.4);
  t.update();const groundMat=material('#ffffff');groundMat.diffuseTexture=t;
  const ground=attach(MeshBuilder.CreateGround('fair-ground',{width:26.8,height:20.8},scene),groundMat,false);ground.position.z=1;ground.position.y=.04;
  // The collision footprints and rendered stalls are driven by the same records.
  for(const stall of FAIR_STALLS){
    box(stall.id+'-counter',stall.x,.65,stall.z,stall.w,1.25,stall.d,'#95724f');
    box(stall.id+'-front',stall.x,.85,stall.z-stall.d/2-.025,stall.w+.1,.25,.15,'#c6a779');
    for(const side of [-1,1])for(const front of [-1,1])box(stall.id+'-post',stall.x+side*(stall.w/2-.1),1.6,stall.z+front*(stall.d/2-.08),.13,3.0,.13,'#584c46');
    for(let i=0;i<8;i++){
      const roof=box(stall.id+'-awning',stall.x-stall.w/2+(i+.5)*stall.w/8,2.65,stall.z-.05,stall.w/8+.01,.12,stall.d+.55,i%2?'#e5d6ad':stall.tint);
      roof.rotation.x=-.15;
      box(stall.id+'-fringe',stall.x-stall.w/2+(i+.5)*stall.w/8,2.39,stall.z-stall.d/2-.3,stall.w/8,.4,.07,i%2?'#e5d6ad':stall.tint);
    }
    for(let i=0;i<5;i++)box(stall.id+'-goods',stall.x-1.25+i*.6,1.38,stall.z-stall.d/2+.2,.3,.22,.3,['#d7866d','#e2c36d','#82a2a1'][i%3]!);
  }
  // Bell framework: clear passage below the bell, only the two posts block movement.
  for(const x of [-4.7,-2.3])box('bell-post',x,1.85,-.5,.35,3.7,.65,'#90957e');
  box('bell-crossbeam',-3.5,3.6,-.5,3.0,.38,.85,'#b8baa2');
  const bell=cylinder('leene-bell',-3.5,2.7,-.5,.58,1.25,1.1,'#bda15a');
  cylinder('bell-rim',-3.5,2.15,-.5,1.35,1.35,.15,'#dbc781');
  cylinder('bell-clapper',-3.5,1.98,-.5,.18,.18,.32,'#6b5647');
  const clock=cylinder('bell-crest',-3.5,4.1,-.5,.72,.72,.16,'#d2bf83');clock.rotation.x=Math.PI/2;
  label('莉妮之鐘',-3.5,4.7,-.5);
  // North: two low, walkable demonstration platforms, not a 600 AD time gate.
  const rings:Mesh[]=[];
  for(const x of [-2.4,2.4]){
    cylinder('telepod-base',x,.10,9,2.2,2.4,.17,'#758993');
    cylinder('telepod-dial',x,.20,9,1.9,1.9,.05,'#c3b994');
    const ring=attach(MeshBuilder.CreateTorus('telepod-ring',{diameter:1.6,thickness:.055,tessellation:32},scene),material('#85bbb5'),false);ring.position.set(x,.24,9);rings.push(ring);
    box('telepod-pole',x-1.1,1.1,10.3,.17,2.2,.17,'#758993');box('telepod-pole',x+1.1,1.1,10.3,.17,2.2,.17,'#758993');
    box('telepod-beam',x,2.2,10.3,2.4,.2,.2,'#b9a269');
  }
  label('露卡 · 傳送展示',0,3.55,9,4);
  const makeSprite=(name:string,x:number,y:number,z:number,robot=false)=>{
    const tex=new DynamicTexture(name,{width:24,height:32},scene,false,Texture.NEAREST_SAMPLINGMODE);tex.hasAlpha=true;
    const ctx=tex.getContext();const r=(x:number,y:number,w:number,h:number,col:string)=>{ctx.fillStyle=col;ctx.fillRect(x,y,w,h);};
    if(robot){
      r(4,9,16,18,'#733f49');r(6,6,12,4,'#b95461');r(6,10,12,16,'#b95c69');r(8,12,8,8,'#bcbb9d');r(8,7,3,3,'#efd581');r(14,7,3,3,'#efd581');r(1,14,4,9,'#aeb4ac');r(19,14,4,9,'#aeb4ac');r(0,20,6,5,'#893a48');r(18,20,6,5,'#893a48');r(5,26,5,5,'#596970');r(14,26,5,5,'#596970');r(10,15,4,2,'#415459');
    }else{
      r(7,26,4,5,'#54464e');r(14,26,4,5,'#54464e');r(7,17,11,11,'#b98754');r(5,19,3,7,'#6f7396');r(18,19,3,7,'#6f7396');r(8,8,10,10,'#e6c5a0');r(6,7,14,6,'#66567e');r(7,4,12,5,'#af9b72');r(5,7,16,3,'#c2b082');r(7,11,5,4,'#455465');r(14,11,5,4,'#455465');r(8,12,3,2,'#cfddd9');r(15,12,3,2,'#cfddd9');r(12,12,2,1,'#455465');r(8,17,10,2,'#e5c68d');
    }
    tex.update();const m=new StandardMaterial(name,scene);m.diffuseTexture=tex;m.emissiveTexture=tex;m.disableLighting=true;m.useAlphaFromDiffuseTexture=true;m.transparencyMode=Material.MATERIAL_ALPHATEST;m.alphaCutOff=.4;m.backFaceCulling=false;
    const mesh=attach(MeshBuilder.CreatePlane(name,{width:robot?1.8:1.35,height:robot?2.4:1.85},scene),m,false);mesh.billboardMode=Mesh.BILLBOARDMODE_ALL;mesh.position.set(x,y,z);return mesh;
  };
  const lucca=makeSprite('lucca-handdrawn',0,1,7.7);
  const robot=makeSprite('gato-handdrawn',-7,1.3,4.8,true);

  label('岡薩雷斯 · 挑戰',-7,3.1,4.8,3.2);
  const save=cylinder('fair-save-point',3.5,.15,-5.5,.9,1.1,.22,'#8ebfc8');label('存檔',3.5,1.25,-5.5,1.7);
  // Pixel canopies retain crisp leaf clusters instead of low-poly green balls.
  const tt=new DynamicTexture('fair-tree',{width:64,height:80},scene,false,Texture.NEAREST_SAMPLINGMODE);tt.hasAlpha=true;drawTree(tt.getContext() as CanvasRenderingContext2D);tt.update();
  const tm=new StandardMaterial('fair-tree',scene);tm.diffuseTexture=tt;tm.emissiveTexture=tt;tm.disableLighting=true;tm.useAlphaFromDiffuseTexture=true;tm.transparencyMode=Material.MATERIAL_ALPHATEST;tm.backFaceCulling=false;
  for(const [x,z]of [[-11.5,8],[11.5,-6],[-12.9,-5],[12.9,7],[-10.5,11],[8,11]]){
    const tree=attach(MeshBuilder.CreatePlane('fair-tree',{width:4.2,height:5.25},scene),tm,false);tree.billboardMode=Mesh.BILLBOARDMODE_ALL;tree.position.set(x!,2.65,z!);
  }
  for(const [x,z]of [[-5.5,-.5],[-1.5,-.5]]){
    box('bell-flowerbed',x!,.22,z!,1,.35,1.7,'#777e65');
    for(let i=0;i<10;i++)box('bell-flowers',x!+(i%2-.5)*.32,.48,z!+(Math.floor(i/2)-2)*.25,.19,.17,.19,i%2?'#c36c81':'#d7bc67');
  }
  // The dropped pendant and gate are story-state visuals, never progression authorities.
  const pendant=attach(MeshBuilder.CreatePolyhedron('dropped-pendant',{type:1,size:.17},scene),material('#dcdfa6'),false);pendant.position.set(-2.4,.5,9);pendant.setEnabled(false);
  const gate=attach(MeshBuilder.CreateTorus('opening-gate',{diameter:2.2,thickness:.12,tessellation:48},scene),material('#6ca6dd'),false);gate.rotation.x=Math.PI/2;gate.position.set(-2.4,1.45,9);gate.setEnabled(false);
  // Pennant strings run east-west; no collision or gameplay role.
  for(const z of [-3.9,5.9]){
    for(const x of [-11,11])box('flag-pole',x,1.8,z,.12,3.6,.12,'#837258');
    const wire=MeshBuilder.CreateLines('bunting-wire',{points:[new Vector3(-11,3.55,z),new Vector3(0,3.05,z),new Vector3(11,3.55,z)]},scene);wire.parent=root;wire.color=Color3.FromHexString('#d9cba6');
    for(let i=0;i<17;i++){
      const x=-10+i*1.25,y=3.05+Math.abs(x)/22;
      const flag=box('pennant',x,y-.25,z,.42,.55,.025,['#b86b73','#d4b471','#7698ac'][i%3]!);flag.rotation.z=.1;
    }
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
