import {RenderPolicy,backendHint,WEBGL_OPTIONS} from './render-capability';
import {placeSpriteContact,inspectSpriteContacts} from './sprite-contact';
import type {SpriteContact} from './sprite-contact';
import {EarlyCameraMotion} from './camera-motion';
import {frameEarlyActors,EARLY_COMFORT} from './early-comfort';
import type {CameraFrame} from './early-comfort';
import {observeCameraSubjects,projectCameraSubjects} from './early-camera-view';
import type {CameraSubject} from './early-camera-view';
import {PixelPalettePass} from './pixel-presentation';
import {MOTION_PROFILE} from './actor-motion';
import {drawHDHero,HD_ART} from './hd-hero-art';
import {HeroFrameCache} from './hero-frame-cache';
import {ART_PROFILE,cameraHalf} from './art-profile';
import {buildTrial} from './trial-render';
import {trialMap} from './trial-data';
import {buildPrologue} from './prologue-render';
import {prologueMap} from './prologue-data';
import {buildRescue} from './rescue-render';
import {rescueMap} from './rescue-data';
import {drawYakra,drawNaga} from './rescue-art';
import {ActorTimeline,victoryFrame} from './actor-timeline';
import type {HeroPose} from './hero-art';
import type {PoseSample} from './pose-player';
import {buildKingdom} from './kingdom-render';
import {buildCanyon} from './canyon-render';
import {drawImp} from './pixel-art';
import {activeSlot,selectedEnemy,guestKind} from './core';
import {buildFair} from './fair-render';
import {
  Engine, Scene, Vector3, Color3, Color4, FreeCamera, Camera, HemisphericLight,
  DirectionalLight, PointLight, MeshBuilder, Mesh, StandardMaterial, DynamicTexture,
  Texture, Material, ShadowGenerator, GlowLayer, TransformNode
} from '@babylonjs/core';
import type { State, Effect, Era } from './core';

type Sprite={mesh:Mesh;texture:DynamicTexture;material:StandardMaterial;last:string};
const color=(hex:string)=>Color3.FromHexString(hex);
export class World {
  readonly engine:Engine;
  private scene:Scene;
  private camera:FreeCamera;
  private cameraMotion=new EarlyCameraMotion();
  private comfortFrame:CameraFrame|null=null;
  private cameraSubjects:CameraSubject[]=[];
  private cameraState:State|null=null;
  private reducedMotion=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
  private grass:StandardMaterial;
  private stone:StandardMaterial;
  private leaf:StandardMaterial;
  private roof:StandardMaterial;
  private water:StandardMaterial;
  private lamp:StandardMaterial;
  private sun:DirectionalLight;
  private shadow:ShadowGenerator;
  private rendering:RenderPolicy;
  private heroes:Sprite[]=[];
  private heroFrames=new HeroFrameCache(96,drawHDHero);
  private foes:Sprite[]=[];
  private markers:Mesh[]=[];
  private labels:Mesh[]=[];
  private particles:Mesh[]=[];
  private floats:{mesh:Mesh;time:number}[]=[];
  private portal:Mesh;
  private crystal:Mesh;
  private repairs:TransformNode;
  private era:Era|null=null;
  private flag=false;
  private time=0;
  private labRoot:TransformNode;
  private prologueWorld:ReturnType<typeof buildPrologue>;
  private prologueKind='field';
  private fairWorld:ReturnType<typeof buildFair>;
  private trialWorld:ReturnType<typeof buildTrial>;
  private rescueWorld:ReturnType<typeof buildRescue>;
  private guest:Sprite;
  private guestPose=new ActorTimeline();
  private guestView:PoseSample={pose:'idle',frame:0};
  private rescueFoes:Sprite[]=[];
  private yakra:Sprite;
  private guestVisible=false;
  private kingdomWorld:ReturnType<typeof buildKingdom>;
  private slashes:{mesh:Mesh;time:number}[]=[];
  private lunges:{time:number;dx:number;dz:number}[]=[{time:1,dx:0,dz:0},{time:1,dx:0,dz:0}];
  private canyonWorld:ReturnType<typeof buildCanyon>;
  private chapter:State['chapter']|null=null;
  private posePlayers=[new ActorTimeline(),new ActorTimeline()];
  private poseViews:PoseSample[]=[{pose:'idle',frame:0},{pose:'idle',frame:0}];
  private poseHistory:{slot:number;pose:HeroPose;frame:number;tick:number}[]=[];
  private targetMarkers:Mesh[]=[];
  private drawFrames=0;
  private palettePass=new PixelPalettePass();
  private actorShadows:Mesh[]=[];
  private contacts:SpriteContact[]=[];
  private contactHistory:ReturnType<typeof inspectSpriteContacts>[number][]=[];
  private presentationState:State|null=null;
  inspect(){return {actorPlayback:{profile:'vq02c-tick-and-distance-playback',actors:this.posePlayers.map(p=>p.inspect()),guest:this.guestPose.inspect(),cache:this.heroFrames.inspect()},renderer:this.inspectRenderer(),grounding:{profile:'vq01l-texture-foot-contact',actors:inspectSpriteContacts(this.contacts),history:this.contactHistory.map(v=>({...v,foot:{...v.foot},actualFoot:{...v.actualFoot},shadow:{...v.shadow},scale:{...v.scale}})),approved:false},earlyComfort:this.inspectEarlyCamera(),transient:{floats:this.floats.length,strokes:this.slashes.length},fairMotion:this.fairWorld.inspect(),festivalOcclusion:this.fairWorld.inspectOcclusion(),presentation:{profile:MOTION_PROFILE,paletteMode:'single-unlit-emission',actors:this.heroes.map(s=>({name:s.mesh.name,emissionOnly:s.material.useEmissiveAsIllumination,emissiveColor:s.material.emissiveColor.asArray(),texture:s.texture.getSize(),position:s.mesh.position.asArray()})),normalizedMaterials:this.palettePass.count},actorArt:{profile:HD_ART.id,nativeCell:{w:HD_ART.width,h:HD_ART.height},textures:this.heroes.map(h=>h.texture.getSize()),guestTexture:this.guest.texture.getSize(),approved:false},trialMaps:this.trialWorld.inspect(),prologue:this.prologueWorld.inspect(),mapKind:this.prologueKind,guest:{visible:this.guestVisible,pose:{...this.guestView}},rescueMaps:this.rescueWorld.inspect(),frame:this.drawFrames,poses:this.poseViews.map(p=>({...p})),history:this.poseHistory.map(h=>({...h})),meshes:this.scene.meshes.filter(m=>m.isEnabled()).length,chapter:this.chapter};}
  private materials=new Map<string,StandardMaterial>();
  constructor(canvas:HTMLCanvasElement){
    // Babylon tries WebGL2, then WebGL1 on this same canvas. The browser alone
    // chooses GPU/software; do not reject a usable slow context or force unsafe flags.
    this.engine=new Engine(canvas,true,{...WEBGL_OPTIONS},true);
    let renderer='';try{renderer=this.engine.getGlInfo().renderer;}catch{}
    this.rendering=new RenderPolicy(backendHint(renderer));
    this.engine.setHardwareScalingLevel(this.rendering.scale(canvas.clientWidth,canvas.clientHeight,window.devicePixelRatio));
    this.scene=new Scene(this.engine);
    this.scene.onDisposeObservable.add(()=>this.heroFrames.clear());
    this.scene.clearColor=Color4.FromHexString('#15292fff');
    this.scene.fogMode=Scene.FOGMODE_EXP2;this.scene.fogDensity=0.010;this.scene.fogColor=color('#a7b2aa');
    this.scene.ambientColor=Color3.Black();
    this.labRoot=new TransformNode('technical-village',this.scene);
    this.camera=new FreeCamera('shared-camera',new Vector3(0,23,-25),this.scene);
    this.camera.mode=Camera.ORTHOGRAPHIC_CAMERA;this.camera.setTarget(new Vector3(0,0,1));
    this.camera.minZ=.1;this.camera.maxZ=150;
    const ambient=new HemisphericLight('sky',new Vector3(0,1,0),this.scene);ambient.intensity=.75;ambient.groundColor=color('#697969');
    this.sun=new DirectionalLight('evening-sun',new Vector3(-.45,-1,.55),this.scene);this.sun.position=new Vector3(12,24,-13);this.sun.intensity=1.0;this.sun.diffuse=color('#ffe6bd');
    this.shadow=new ShadowGenerator(1024,this.sun);this.shadow.usePercentageCloserFiltering=true;this.shadow.bias=.004;this.shadow.normalBias=.015;
    this.grass=this.mat('grass','#729270');this.stone=this.mat('stone','#c0b68f');this.leaf=this.mat('leaf','#426c58');
    this.roof=this.mat('roof','#555f64');this.water=this.mat('water','#488e94');this.water.specularColor=color('#648b8e');this.water.emissiveColor=color('#123b43');
    this.lamp=this.mat('light','#ffdba0');this.lamp.emissiveColor=color('#d99b54');
    this.groundTexture();
    this.box('island',0,-.5,1,27,.9,21,this.mat('earth','#495b48'));
    const ground=this.box('ground',0,-.01,1,26.8,.15,20.8,this.grass);ground.receiveShadows=true;
    this.box('north-path',0,.09,.8,3,.08,19,this.stone).receiveShadows=true;
    this.box('cross-path',0,.10,-1,25,.08,2.2,this.stone).receiveShadows=true;
    for(let i=0;i<29;i++){
      const x=(i%3-1)*.86,z=-8+Math.floor(i/3)*1.78;
      this.box('paving',x,.16,z,.68,.035,1.25,this.mat('paving'+i%3,['#d7cba1','#b6ae8f','#c7bb96'][i%3]!));
    }
    this.box('river',10.3,.12,1,2.8,.06,20.7,this.water);
    for(let i=0;i<12;i++)this.box('bridge',8.8+i*.26,.25,-1,.24,.23,2.2,this.mat('wood','#96744e'));
    for(const z of [-2.12,.12]){
      this.box('bridge-rail',10.3,.9,z,3.4,.1,.12,this.mat('wood','#96744e'));
      for(const x of [8.7,11.9])this.box('bridge-post',x,.58,z,.16,1,.16,this.mat('wood','#96744e'));
    }
    this.house(-8,2,4,3.3);this.house(6,6,3.5,3);
    for(const [x,z,scale] of [[-10.5,-1,1], [5.8,-5,1],[-5.5,7.5,1],[-11,8,1.1],[-11,-6,1.2],[6,-8,.8],[12.8,8,.9],[-6,-8,.75],[-9,10,.8],[3,10,.65]])this.tree(x!,z!,scale!);
    for(const [x,z] of [[-2,-6],[2,-1],[-3,7],[4,4],[-9,-4]])this.lantern(x!,z!);
    for(let i=0;i<50;i++){
      const x=Math.sin(i*32.13)*12,z=Math.cos(i*17.9)*9+1;
      if(Math.abs(x)<2||Math.abs(z+1)<1.6||x>8.5)continue;
      this.box('flower',x,.20,z,.12,.16,.12,this.mat('flower'+i%3,['#e4c183','#d6d8b0','#b6d0be'][i%3]!));
      if(i%3===0)this.box('grass-blade',x+.2,.20,z+.1,.07,.22,.06,this.leaf);
    }
    const rim=this.mat('portal-stone','#a3ac9d');
    for(const x of [-1.8,1.8])this.box('gate-pillar',x,1.65,9,.65,3.3,.8,rim);
    this.box('gate-lintel',0,3.4,9,4.3,.55,1,rim);
    this.portal=MeshBuilder.CreateTorus('time-gate',{diameter:2.65,thickness:.13,tessellation:48},this.scene);
    this.portal.rotation.x=Math.PI/2;this.portal.position.set(0,1.9,8.95);
    this.portal.material=this.mat('gate-glow','#9ee7dc');(this.portal.material as StandardMaterial).emissiveColor=color('#65d8cf');
    this.label('時門 · E',0,4.15,9,'#d6faf0',1.9);
    this.crystal=MeshBuilder.CreatePolyhedron('repair-crystal',{type:1,size:.55},this.scene);this.crystal.position.set(-5,1.35,-1);
    this.crystal.material=this.mat('crystal','#a4d9dc');(this.crystal.material as StandardMaterial).emissiveColor=color('#265a62');
    this.box('crystal-base',-5,.4,-1,1.3,.8,1.3,rim);this.label('修復晶核 · E',-5,2.5,-1,'#e6e0c5',2.3);
    const saveCrystal=MeshBuilder.CreatePolyhedron('save-stone',{type:1,size:.35},this.scene);saveCrystal.position.set(-8,1,-5);saveCrystal.material=this.mat('save-glow','#78bdd5');(saveCrystal.material as StandardMaterial).emissiveColor=color('#417ca8');
    this.label('存檔 · E',-8,1.9,-5,'#acd9ea',1.8);
    this.repairs=new TransformNode('future-regrowth',this.scene);
    for(let i=0;i<8;i++){const blossom=this.box('renewal',-5+Math.cos(i)*1.1,.30,-1+Math.sin(i)*1.1,.18,.22,.18,this.mat('renewal','#f1c799'));blossom.parent=this.repairs;}
    this.repairs.setEnabled(false);
    for(const mesh of this.scene.meshes)if(!mesh.parent)mesh.parent=this.labRoot;
    this.repairs.parent=this.labRoot;
    for(const light of this.scene.lights)if(light instanceof PointLight)light.parent=this.labRoot;
    this.prologueWorld=buildPrologue(this.scene,this.shadow);
    this.fairWorld=buildFair(this.scene,this.shadow);
    this.canyonWorld=buildCanyon(this.scene,this.shadow);
    this.kingdomWorld=buildKingdom(this.scene,this.shadow);this.rescueWorld=buildRescue(this.scene,this.shadow);this.trialWorld=buildTrial(this.scene,this.shadow);
    this.guest=this.sprite('guest-companion',1.36,1.85,HD_ART.width,HD_ART.height);this.yakra=this.sprite('yakra',3.5,3.5,48,48);
    for(let i=0;i<3;i++)this.rescueFoes.push(this.sprite('rescue-enemy-'+i,1.35,1.85));
    for(const sprite of [this.guest,this.yakra,...this.rescueFoes]){sprite.mesh.setEnabled(false);sprite.material.disableLighting=true;sprite.material.emissiveTexture=sprite.texture;}
    const glow=new GlowLayer('subtle-light',this.scene,{blurKernelSize:16});glow.intensity=.22;
    // Pixel actors and labels must not bloom into unreadable white silhouettes.
    glow.addIncludedOnlyMesh(this.portal);glow.addIncludedOnlyMesh(this.crystal);glow.addIncludedOnlyMesh(saveCrystal);
    for(let i=0;i<2;i++){
      this.heroes.push(this.sprite('player-'+i,1.36,1.85,HD_ART.width,HD_ART.height));
      const ring=MeshBuilder.CreateTorus('ownership-'+i,{diameter:.85,thickness:.035,tessellation:32},this.scene);ring.material=this.mat('p'+i,i===0?'#dfb87e':'#80c9c0');this.markers.push(ring);
      this.labels.push(this.label('P'+(i+1),0,0,0,i===0?'#ffe4b3':'#b6fff0',.75));
      const target=MeshBuilder.CreateCylinder('target-pointer-'+i,{diameterTop:.30,diameterBottom:0,height:.40,tessellation:3},this.scene);
      target.material=this.mat('target-'+i,i===0?'#ffe09a':'#85ddda');(target.material as StandardMaterial).emissiveColor=color(i===0?'#b7a070':'#5eafad');
      target.setEnabled(false);this.targetMarkers.push(target);
      this.foes.push(this.sprite('enemy-'+i,1.5,1.2));this.drawEnemy(this.foes[i]!);
    }
    const imp=this.sprite('enemy-2',1.5,1.2);this.foes.push(imp);this.drawEnemy(imp);
    for(let i=0;i<26;i++){
      const m=MeshBuilder.CreateSphere('mote',{diameter:.035,segments:4},this.scene);m.material=this.mat('motes','#eddda0');(m.material as StandardMaterial).emissiveColor=color('#eddda0');
      m.position.set(Math.sin(i*8.31)*12,.6+(i%5)*.35,Math.cos(i*9.31)*9);this.particles.push(m);
    }
    for(let i=0;i<3;i++){const d=MeshBuilder.CreateDisc('actor-ground-shadow-'+i,{radius:.43,tessellation:24},this.scene);d.rotation.x=Math.PI/2;d.scaling.y=.52;const m=new StandardMaterial('actor-shadow-'+i,this.scene);m.diffuseColor=Color3.Black();m.disableLighting=true;m.alpha=.25;m.backFaceCulling=false;d.material=m;d.position.y=.13;d.isPickable=false;this.actorShadows.push(d);}
    this.resize();window.addEventListener('resize',()=>this.resize());
  }
  private mat(name:string,hex:string):StandardMaterial {
    const known=this.materials.get(name);if(known)return known;
    const m=new StandardMaterial(name,this.scene);m.diffuseColor=color(hex);m.specularColor=Color3.Black();this.materials.set(name,m);return m;
  }
  private box(name:string,x:number,y:number,z:number,w:number,h:number,d:number,material:StandardMaterial):Mesh {
    const m=MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},this.scene);m.position.set(x,y,z);m.material=material;m.receiveShadows=true;
    if(h>.3)this.shadow.addShadowCaster(m);return m;
  }
  private groundTexture():void {
    const t=new DynamicTexture('pixel-ground',{width:128,height:128},this.scene,false,Texture.NEAREST_SAMPLINGMODE);
    const ctx=t.getContext();ctx.fillStyle='#b8c6ab';ctx.fillRect(0,0,128,128);
    for(let i=0;i<2600;i++){ctx.fillStyle=i%3===0?'#a5b89a':i%3===1?'#b2c0a4':'#c2ccb3';ctx.fillRect((i*47)%128,(i*31+Math.floor(i/128)*13)%128,2,2);}
    t.update();t.uScale=12;t.vScale=10;this.grass.diffuseTexture=t;
  }
  private house(x:number,z:number,w:number,d:number):void {
    this.box('house-base',x,.22,z,w+.4,.45,d+.4,this.mat('foundation','#8e9785'));
    this.box('house-wall',x,1.55,z,w,2.5,d,this.mat('plaster','#ddd0aa'));
    const timber=this.mat('timber','#746a51');
    for(const sx of [-1,1])this.box('corner-beam',x+sx*(w/2-.13),1.6,z-d/2-.025,.20,2.7,.16,timber);
    this.box('horizontal-beam',x,2.2,z-d/2-.06,w,.15,.12,timber);
    for(const side of [-1,1]){const roof=this.box('sloped-roof',x+side*w/4,3.25,z,w*.61,.24,d+.6,this.roof);roof.rotation.z=side*-.5;}
    this.box('roof-ridge',x,3.77,z,.22,.22,d+.8,this.roof);
    this.box('door',x,.9,z-d/2-.07,.78,1.6,.10,this.mat('door','#5c6557'));
    for(const sx of [-1,1]){this.box('window-frame',x+sx*w*.31,1.55,z-d/2-.075,.76,.8,.12,timber);this.box('window-glow',x+sx*w*.31,1.55,z-d/2-.15,.58,.63,.05,this.lamp);}
    this.box('chimney',x+w*.25,3.9,z+.7,.48,1.3,.55,this.mat('chimney','#90948b'));
  }
  private tree(x:number,z:number,s:number):void {
    this.box('trunk',x,1*s,z,.45*s,2*s,.45*s,this.mat('trunk','#6b7155'));
    for(let i=0;i<3;i++){
      const m=MeshBuilder.CreateSphere('foliage',{diameter:(3-i*.42)*s,segments:5},this.scene);m.position.set(x,2.4*s+i*.65*s,z);m.scaling.y=.7;m.material=this.leaf;this.shadow.addShadowCaster(m);m.receiveShadows=true;
    }
  }
  private lantern(x:number,z:number):void {
    this.box('lantern-post',x,.9,z,.12,1.8,.12,this.mat('iron','#626656'));
    this.box('lantern-glass',x,1.8,z,.24,.40,.24,this.lamp);
    const light=new PointLight('warm-lamp',new Vector3(x,1.8,z),this.scene);light.diffuse=color('#ffce8b');light.intensity=.8;light.range=4;
  }
  private sprite(name:string,w:number,h:number,tw=24,th=32):Sprite {
    const t=new DynamicTexture(name+'-pixels',{width:tw,height:th},this.scene,false,Texture.NEAREST_SAMPLINGMODE);t.hasAlpha=true;
    const m=new StandardMaterial(name+'-material',this.scene);m.diffuseTexture=t;m.useAlphaFromDiffuseTexture=true;m.transparencyMode=Material.MATERIAL_ALPHATEST;m.alphaCutOff=.4;m.backFaceCulling=false;m.emissiveColor=new Color3(.52,.52,.52);m.specularColor=Color3.Black();
    const mesh=MeshBuilder.CreatePlane(name,{width:w,height:h},this.scene);mesh.material=m;mesh.billboardMode=Mesh.BILLBOARDMODE_ALL;
    return {mesh,texture:t,material:m,last:''};
  }
  private drawHero(sprite:Sprite,slot:number,facing:number,frame:number,fair:boolean,lucca=false,pose:HeroPose='walk'):void {
    const key=`${fair}:${lucca}:${facing}:${frame}:${pose}`;if(sprite.last===key)return;sprite.last=key;
    const width=fair?HD_ART.width:24,height=fair?HD_ART.height:32;
    if(sprite.texture.getSize().width!==width)sprite.texture.scaleTo(width,height);
    const c=sprite.texture.getContext();c.clearRect(0,0,width,height);
    if(fair){this.heroFrames.draw(c as CanvasRenderingContext2D,lucca?'lucca':slot===0?'crono':'marle',facing,frame,pose);sprite.material.disableLighting=true;sprite.material.emissiveTexture=sprite.texture;sprite.texture.update();return;}
    sprite.material.disableLighting=false;sprite.material.emissiveTexture=null;
    const rect=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
    const hair=slot===0?(fair?'#b6423d':'#835746'):'#d6b568',coat=slot===0?'#52758b':(fair?'#c6cebd':'#619d8d');
    const step=frame?1:0;
    rect(8,25+step,3,5-step,'#3a4546');rect(14,25-step,3,5,'#3a4546');
    rect(7,16,11,10,'#334b59');rect(8,16,9,8,coat);rect(6,18,2,7,coat);rect(18,18,2,7,coat);
    rect(6,24,2,2,'#e6c39a');rect(18,24,2,2,'#e6c39a');rect(8,24,10,2,'#b6a170');
    rect(8,7,10,10,'#e6c39a');rect(7,7,12,5,hair);rect(9,4,8,4,hair);rect(7,8,2,7,hair);rect(18,8,2,6,hair);
    rect(8,16,11,2,slot===0?'#c39a70':'#c3cbad');rect(16,17,2,5,slot===0?'#c39a70':'#c3cbad');
    if(facing===2)rect(8,10,11,7,hair);
    else if(facing===1){rect(17,11,2,2,'#24333a');rect(18,13,2,2,'#edcaa2');}
    else if(facing===3){rect(8,11,2,2,'#24333a');rect(6,13,2,2,'#edcaa2');}
    else {rect(10,11,2,2,'#24333a');rect(15,11,2,2,'#24333a');rect(12,15,3,1,'#a87966');}
    if(fair&&slot===0){rect(7,3,3,5,hair);rect(12,1,3,5,hair);rect(16,3,4,4,hair);rect(8,8,10,2,'#d7d6aa');rect(8,16,11,2,'#cfa04d');}
    if(fair&&slot===1){rect(16,2,4,8,hair);rect(18,7,3,9,hair);rect(17,6,4,2,'#91a6ba');}
    sprite.texture.update();
  }
  private drawEnemy(sprite:Sprite):void {
    const c=sprite.texture.getContext();c.clearRect(0,0,24,32);
    const r=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
    r(4,16,16,12,'#426b60');r(2,21,20,6,'#426b60');r(7,13,10,3,'#426b60');r(5,16,13,9,'#8aad82');r(7,15,8,3,'#b9cea0');r(7,21,3,3,'#233d3d');r(14,21,3,3,'#233d3d');r(8,21,1,1,'#eff8dd');r(15,21,1,1,'#eff8dd');sprite.texture.update();
  }
  private label(text:string,x:number,y:number,z:number,hex:string,width:number):Mesh {
    const t=new DynamicTexture('label-'+text,{width:256,height:64},this.scene,false);t.hasAlpha=true;
    const ctx=t.getContext() as CanvasRenderingContext2D;ctx.clearRect(0,0,256,64);ctx.font='bold 27px sans-serif';ctx.textAlign='center';ctx.fillStyle=hex;ctx.shadowColor='#152829';ctx.shadowBlur=4;ctx.fillText(text,128,42);t.update();
    const mat=new StandardMaterial('label-material',this.scene);mat.diffuseTexture=t;mat.emissiveTexture=t;mat.opacityTexture=t;mat.disableLighting=true;mat.backFaceCulling=false;
    const mesh=MeshBuilder.CreatePlane('label',{width,height:width/4},this.scene);mesh.material=mat;mesh.billboardMode=Mesh.BILLBOARDMODE_ALL;mesh.position.set(x,y,z);return mesh;
  }
  private effect(e:Effect,s:State):void {
    if(e.guest)this.guestPose.trigger(e.kind==='heal'?'cast':'attack',s.ticks);
    else if(e.kind==='hit'&&guestKind(s)&&Math.hypot(s.rescue.guest.x-e.x,s.rescue.guest.z-e.z)<.2)this.guestPose.trigger('hurt',s.ticks);
    if(e.actor!==undefined)this.posePlayers[e.actor]!.trigger(e.style==='fire'||e.style==='spin'?'cast':'attack',s.ticks);
    else if(e.kind==='combo')this.posePlayers.forEach((player,i)=>{if(activeSlot(s,i as 0|1))player.trigger('cast',s.ticks);});
    else if(e.kind==='hit')s.players.forEach((p,i)=>{if(activeSlot(s,i as 0|1)&&Math.hypot(p.x-e.x,p.z-e.z)<.2)this.posePlayers[i]!.trigger('hurt',s.ticks);});
    const mesh=this.label(e.kind==='combo'?'✦ '+e.text:e.text,e.x,2.2,e.z,e.kind==='combo'?'#f8d68a':'#fff2d6',1.7);this.floats.push({mesh,time:0});
    if(e.style){
      if(e.actor!==undefined&&e.origin){const d=Math.hypot(e.x-e.origin.x,e.z-e.origin.z)||1;this.lunges[e.actor]={time:0,dx:(e.x-e.origin.x)/d*.55,dz:(e.z-e.origin.z)/d*.55};}
      const t=new DynamicTexture('battle-stroke',{width:64,height:64},this.scene,false,Texture.NEAREST_SAMPLINGMODE);t.hasAlpha=true;
      const c=t.getContext() as CanvasRenderingContext2D;c.clearRect(0,0,64,64);c.lineWidth=4;c.strokeStyle=e.style==='fire'?'#ffae58':e.style==='shot'?'#b6eaf0':'#fff3b4';
      c.beginPath();if(e.style==='spin'){c.arc(32,32,24,-.4,Math.PI*1.6);}else if(e.style==='fire'){c.moveTo(15,52);c.lineTo(28,10);c.lineTo(32,33);c.lineTo(46,16);c.lineTo(42,52);}else{c.moveTo(8,50);c.quadraticCurveTo(22,12,57,9);}c.stroke();t.update();
      const m=new StandardMaterial('battle-stroke',this.scene);m.diffuseTexture=t;m.emissiveTexture=t;m.opacityTexture=t;m.disableLighting=true;m.backFaceCulling=false;
      const fx=MeshBuilder.CreatePlane('battle-stroke',{width:2.3,height:2.3},this.scene);fx.material=m;fx.billboardMode=Mesh.BILLBOARDMODE_ALL;fx.position.set(e.x,1.3,e.z);this.slashes.push({mesh:fx,time:0});
    }

  }
  inspectRenderer(){return {...this.rendering.inspect(),webglVersion:this.engine.webGLVersion,
    width:this.engine.getRenderWidth(),height:this.engine.getRenderHeight(),scaling:this.engine.getHardwareScalingLevel()};}
  setRenderMode(mode:string):void{this.rendering.setMode(mode);this.resize();}
  observeRenderFrame(milliseconds:number,active:boolean):void{if(this.rendering.sample(milliseconds,active))this.resize();}
  resize():void {
    const canvas=this.engine.getRenderingCanvas();
    if(canvas)this.engine.setHardwareScalingLevel(this.rendering.scale(canvas.clientWidth,canvas.clientHeight,window.devicePixelRatio));
    this.engine.resize();const ratio=this.engine.getRenderWidth()/Math.max(1,this.engine.getRenderHeight());const viewHalf=cameraHalf(this.chapter??'lab',ratio);
    this.camera.orthoLeft=-viewHalf*ratio;this.camera.orthoRight=viewHalf*ratio;this.camera.orthoTop=viewHalf;this.camera.orthoBottom=-viewHalf;
  }
  private resetTransientPresentation():void {
    // Dispose only owned, temporary meshes. Shared characters/scenery remain cached.
    for(const list of [this.floats,this.slashes]){
      for(const effect of list){effect.mesh.material?.dispose(true,true);effect.mesh.dispose();}
      list.length=0;
    }
    this.posePlayers.forEach(p=>p.reset());this.guestPose.reset();
    this.contacts=[];this.contactHistory=[];
    this.fairWorld?.resetOcclusion?.();
    this.poseHistory.length=0;this.guestView={pose:'idle',frame:0};
    this.lunges.forEach(l=>{l.time=1;l.dx=0;l.dz=0;});
  }
  draw(s:State,delta:number,animate:boolean,frameEffects:readonly Effect[]=[]):void {
    if(this.presentationState!==s||this.chapter!==s.chapter){
      this.resetTransientPresentation();this.presentationState=s;
    }
    const dt=animate?Math.min(delta,.05):0;this.time+=dt;
    const fair=s.chapter==='fair',canyon=s.chapter==='canyon',forest=s.chapter==='forest',adventure=s.chapter!=='lab';
    if(this.chapter!==s.chapter){
      this.chapter=s.chapter;this.resize();this.guestPose.reset();this.posePlayers.forEach(p=>p.reset());this.labRoot.setEnabled(!adventure);this.fairWorld.root.setEnabled(fair);this.canyonWorld.root.setEnabled(canyon);
      this.scene.fogDensity=adventure?0:.01;
      this.foes.forEach(f=>{if(canyon||forest){drawImp(f.texture.getContext() as CanvasRenderingContext2D);f.texture.update();}else this.drawEnemy(f);});
      for(const light of this.scene.lights)if(light instanceof PointLight)light.setEnabled(!adventure);
      this.era=null;
    }
    this.prologueWorld.draw(s);this.prologueKind=s.chapter==='overworld1000'?'overworld':(prologueMap(s.chapter)||(trialMap(s.chapter)&&!['guardia1000','prisonbridge'].includes(s.chapter)))?'interior':'field';
    if(fair)this.fairWorld.draw(s,this.time);
    this.kingdomWorld.draw(s);this.rescueWorld.draw(s);this.trialWorld.draw(s);
    for(const effect of frameEffects)this.effect(effect,s);
    if(s.era!==this.era||s.flags.repaired!==this.flag){
      this.era=s.era;this.flag=s.flags.repaired;const future=s.era==='future';
      this.grass.diffuseColor=color(future?'#8e9991':'#729270');this.leaf.diffuseColor=color(future?(s.flags.repaired?'#779a87':'#636f78'):'#426c58');
      this.stone.diffuseColor=color(future?'#adb9b2':'#c0b68f');this.roof.diffuseColor=color(future?'#596476':'#555f64');
      this.water.diffuseColor=color(future?'#506c8c':'#488e94');this.sun.diffuse=color(future?'#b1c6e6':'#ffe6bd');
      this.scene.fogColor=color(future?'#8596ab':'#a7b2aa');this.lamp.emissiveColor=color(future&&!s.flags.repaired?'#1a2431':'#d99b54');
      this.repairs.setEnabled(future&&s.flags.repaired);
    }
    s.players.forEach((p,i)=>{
      let pose=this.posePlayers[i]!.sample(s.ticks,p.walking,s.mode==='battle',{x:p.x,z:p.z,scale:s.chapter==='overworld1000'?ART_PROFILE.actors.worldScale:ART_PROFILE.actors.fieldScale,seed:i,reducedMotion:this.reducedMotion?.matches??false});
      if(s.prologue.stage==='waking'&&s.prologue.elapsed<1.8)pose={pose:'down',frame:0};
      if(s.prologue.stage==='collision'&&s.prologue.elapsed<.6)pose={pose:'hurt',frame:Math.min(3,Math.floor(s.prologue.elapsed*6))};
      if(p.hp<=0)pose={pose:'down',frame:3};
      else if(s.mode==='victory'&&pose.pose==='idle')pose={pose:'victory',frame:victoryFrame(s.ticks,this.reducedMotion?.matches??false)};
      const previous=this.poseViews[i]!;
      if(adventure&&activeSlot(s,i as 0|1)&&!['idle','walk','ready'].includes(pose.pose)&&(previous.pose!==pose.pose||previous.frame!==pose.frame)){
        this.poseHistory.push({slot:i,...pose,tick:s.ticks});if(this.poseHistory.length>48)this.poseHistory.shift();
      }
      this.poseViews[i]=pose;
      const targetIndex=selectedEnemy(s,i as 0|1),target=targetIndex===null?undefined:s.enemies[targetIndex];
      const facing=target?(Math.abs(target.x-p.x)>Math.abs(target.z-p.z)?(target.x>p.x?1:3):(target.z>p.z?2:0)):p.facing;
      const marker=this.targetMarkers[i]!;marker.setEnabled(!!target&&(i===0||s.joined));
      if(target)marker.position.set(target.x+(i===0?-.25:.25),2.15,target.z);
      const sprite=this.heroes[i]!;this.drawHero(sprite,i,facing,pose.frame,adventure,i===1&&s.kingdom.phase==='rescue',pose.pose);
      const l=this.lunges[i]!;l.time+=dt;const push=Math.sin(Math.min(1,l.time/.42)*Math.PI);
      sprite.mesh.position.set(p.x+l.dx*push,1.02+(p.walking?Math.sin(this.time*15)*.035:0),p.z+l.dz*push);sprite.mesh.setEnabled(activeSlot(s,i as 0|1));
      this.markers[i]!.setEnabled(s.joined&&activeSlot(s,i as 0|1));this.labels[i]!.setEnabled(s.joined&&activeSlot(s,i as 0|1));
      const vanish=i===1&&s.opening.phase==='resonance'?Math.max(.05,1-s.opening.elapsed/2):1;const scale=s.chapter==='overworld1000'?ART_PROFILE.actors.worldScale:ART_PROFILE.actors.fieldScale;sprite.mesh.scaling.set(vanish*scale,vanish*scale,scale);if(s.chapter==='overworld1000')sprite.mesh.position.y=.43;if(s.prologue.stage==='waking'&&s.prologue.elapsed<1.8)sprite.mesh.position.set(3.6,1.35,1.6);
      this.markers[i]!.position.set(p.x,.21,p.z);this.labels[i]!.position.set(p.x,2.1,p.z);
    });
    this.foes.forEach((f,i)=>{
      const enemy=s.enemies[i];const visible=(s.chapter==='lab'||canyon||forest)&&(s.mode==='battle'?!!enemy&&enemy.hp>0:s.mode==='explore'&&(forest?!s.kingdom.forestWon:canyon?!s.opening.canyonWon:!s.flags.won)&&i<(canyon?3:2));
      const positions=[{x:-1.8,z:2.4},{x:1.8,z:3},{x:.2,z:1.5}];const position=enemy??(forest?{x:i===0?-1.8:1.8,z:2.8}:canyon?positions[i]!:{x:i===0?-2:2,z:4.5});
      f.mesh.setEnabled(visible);f.mesh.scaling.y=canyon||forest?1.3:1;f.mesh.position.set(position.x,canyon||forest?1.0:.86+Math.sin(this.time*2+i)*.035,position.z);
    });
    const kind=guestKind(s),g=s.rescue.guest;this.guestVisible=!!kind;this.guest.mesh.setEnabled(!!kind);
    if(kind){
      const pose=g.hp<=0?{pose:'down' as const,frame:3}:s.mode==='victory'?{pose:'victory' as const,frame:victoryFrame(s.ticks,this.reducedMotion?.matches??false)}:this.guestPose.sample(s.ticks,g.walking,s.mode==='battle',{x:g.x,z:g.z,scale:s.chapter==='overworld1000'?ART_PROFILE.actors.worldScale:ART_PROFILE.actors.fieldScale,seed:2,reducedMotion:this.reducedMotion?.matches??false});this.guestView=pose;
      const key=`${kind}/${g.facing}/${pose.pose}/${pose.frame}`;
      if(this.guest.last!==key){this.guest.last=key;const c=this.guest.texture.getContext() as CanvasRenderingContext2D;this.heroFrames.draw(c,kind,g.facing,pose.frame,pose.pose);this.guest.texture.update();}
      const gs=s.chapter==='overworld1000'?ART_PROFILE.actors.worldScale:ART_PROFILE.actors.fieldScale;this.guest.mesh.scaling.setAll(gs);this.guest.mesh.position.set(g.x,s.chapter==='overworld1000'?.43:1.02,g.z);
    }
    const inRescue=rescueMap(s.chapter),boss=inRescue&&s.mode==='battle'&&s.enemies[0]?.kind==='yakra'&&s.enemies[0]!.hp>0;
    this.yakra.mesh.setEnabled(!!boss);
    if(boss){const e=s.enemies[0]!,f=e.atb>.78?Math.floor(this.time*12)%2:0;if(this.yakra.last!==String(f)){drawYakra(this.yakra.texture.getContext() as CanvasRenderingContext2D,f);this.yakra.texture.update();this.yakra.last=String(f);}this.yakra.mesh.position.set(e.x,1.68,e.z);}
    this.rescueFoes.forEach((sprite,i)=>{const e=s.enemies[i],visible=inRescue&&s.mode==='battle'&&!!e&&e.hp>0&&e.kind!=='yakra';sprite.mesh.setEnabled(visible);if(visible&&e){if(sprite.last!==e.kind){sprite.last=e.kind??'';drawNaga(sprite.texture.getContext() as CanvasRenderingContext2D,e.kind==='hench');sprite.texture.update();}sprite.mesh.position.set(e.x,1.02,e.z);}});
    this.groundActors(s);
    const midX=activeSlot(s,1)?(s.players[0].x+s.players[1].x)/2:s.players[0].x,midZ=activeSlot(s,1)?(s.players[0].z+s.players[1].z)/2:s.players[0].z;
    const fixed=prologueMap(s.chapter)||s.chapter==='prisonbridge'||s.chapter==='courtroom';const tx=fixed?0:adventure?Math.max(-4,Math.min(4,midX*.72)):midX*.18,tz=fixed?0:midZ*(adventure?.72:.16)+1;
    const ratio=this.engine.getRenderWidth()/Math.max(1,this.engine.getRenderHeight());
    this.frameEarlyScene(s,ratio,{x:tx,z:tz,half:cameraHalf(s.chapter,ratio)});
    // Use actual billboard vertices after framing, including the current attack lunge.
    // Only tagged festival canopies participate; no material alpha or collision changes.
    this.fairWorld.updateOcclusion(s.ticks,fair?this.cameraSubjects:[]);
    this.portal.rotation.z=Math.sin(this.time)*.08;this.crystal.rotation.y=this.time*.4;
    this.particles.forEach((p,i)=>{p.setEnabled(!prologueMap(s.chapter));p.position.y=.65+(i%5)*.35+Math.sin(this.time*.6+i)*.22;});
    for(let i=this.floats.length-1;i>=0;i--){const f=this.floats[i]!;f.time+=dt;f.mesh.position.y+=dt*.8;if(f.time>1.25){f.mesh.material?.dispose(true,true);f.mesh.dispose();this.floats.splice(i,1);}}
    for(let i=this.slashes.length-1;i>=0;i--){const v=this.slashes[i]!;v.time+=dt;v.mesh.scaling.setAll(1+v.time*.6);(v.mesh.material as StandardMaterial).alpha=Math.max(0,1-v.time/.6);if(v.time>.6){v.mesh.material?.dispose(true,true);v.mesh.dispose();this.slashes.splice(i,1);}}
    this.palettePass.apply(this.scene);
    this.scene.render();this.drawFrames++;
  }
  private groundActors(s:State):void {
    const up=this.camera.getDirection(Vector3.Up()),awake=s.prologue.stage!=='waking',adventure=s.chapter!=='lab';
    this.contacts=[];
    s.players.forEach((p,i)=>{
      const mesh=this.heroes[i]!.mesh,shadow=this.actorShadows[i]!,shown=adventure&&awake&&activeSlot(s,i as 0|1);
      shadow.setEnabled(shown);if(!shown)return;
      const l=this.lunges[i]!,push=Math.sin(Math.min(1,l.time/.42)*Math.PI);
      const foot={x:p.x+l.dx*push,y:.14,z:p.z+l.dz*push};
      placeSpriteContact(mesh,shadow,foot,up,1.85,HD_ART.pivot.y,HD_ART.height);
      this.contacts.push({id:'p'+i,mesh,shadow,foot,pivotY:HD_ART.pivot.y,cellHeight:HD_ART.height});
      if(Math.hypot(foot.x-p.x,foot.z-p.z)>.001){
        this.contactHistory.push(inspectSpriteContacts([this.contacts[this.contacts.length-1]!])[0]!);
        if(this.contactHistory.length>24)this.contactHistory.shift();
      }
    });
    const mesh=this.guest.mesh,shadow=this.actorShadows[2]!,kind=guestKind(s);
    shadow.setEnabled(!!kind);if(kind){
      const foot={x:s.rescue.guest.x,y:.14,z:s.rescue.guest.z};
      placeSpriteContact(mesh,shadow,foot,up,1.85,HD_ART.pivot.y,HD_ART.height);
      this.contacts.push({id:'guest',mesh,shadow,foot,pivotY:HD_ART.pivot.y,cellHeight:HD_ART.height});
    }
  }
  private inspectEarlyCamera(){
    return {profile:EARLY_COMFORT.id,camera:this.comfortFrame?{...this.comfortFrame,bounds:{...this.comfortFrame.bounds},actors:this.comfortFrame.actors.map(a=>({...a}))}:null,
      motion:this.cameraMotion.inspect(),rects:projectCameraSubjects(this.cameraSubjects,this.camera),fullScenePublished:false};
  }
  private frameEarlyScene(s:State,ratio:number,base:{x:number;z:number;half:number}):void {
    // Reuse the preserved framing/filter independently of the held scenery work.
    // Fresh state identity (including same-map import) must not interpolate an old camera.
    if(this.cameraState!==s){this.cameraMotion.reset();this.cameraState=s;}
    this.cameraSubjects=[];
    const early=s.prologue.stage!=='waking'&&EARLY_COMFORT.chapters.includes(s.chapter);
    if(early){
      this.heroes.forEach((sprite,i)=>{if(activeSlot(s,i as 0|1))this.cameraSubjects.push({id:'p'+i,mesh:sprite.mesh});});
      if(guestKind(s))this.cameraSubjects.push({id:'guest',mesh:this.guest.mesh});
      const p=s.players[0];
      // Use existing visible meshes, including their actual foot pivot and current lunge.
      // Including a nearby conversation partner keeps the context readable without revealing distant scenery.
      for(const name of ['prologue-home-mother','prologue-meeting-marle','prologue-meeting-pendant','lucca-handdrawn','fair-melchior','fair-cat-owner','fair-lunch-owner']){
        const mesh=this.scene.getMeshByName(name);
        if(mesh?.isEnabled()&&Math.hypot(mesh.position.x-p.x,mesh.position.z-p.z)<4)
          this.cameraSubjects.push({id:name,mesh});
      }
      if(s.chapter==='fair'&&s.mode==='battle'){
        const mesh=this.scene.getMeshByName('gato-handdrawn');
        if(mesh?.isEnabled()&&s.enemies.some(e=>e.hp>0))this.cameraSubjects.push({id:'gato',mesh});
      }
    }
    const target=frameEarlyActors(early?s.chapter:'outside-early',ratio,base,observeCameraSubjects(this.cameraSubjects),s.mode==='battle');
    this.comfortFrame=this.cameraMotion.update(s.ticks,`${s.chapter}/${s.mode}/${s.prologue.stage==='waking'}`,target,this.reducedMotion?.matches??false);
    const f=this.comfortFrame;
    this.camera.orthoLeft=-f.half*ratio;this.camera.orthoRight=f.half*ratio;this.camera.orthoTop=f.half;this.camera.orthoBottom=-f.half;
    this.camera.position.set(f.x,ART_PROFILE.camera.height,f.z-ART_PROFILE.camera.back);this.camera.setTarget(new Vector3(f.x,0,f.z));
  }
  start(loop:()=>void):void{this.engine.runRenderLoop(loop);}
}
