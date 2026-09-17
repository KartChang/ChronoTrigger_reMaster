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
  private grass:StandardMaterial;
  private stone:StandardMaterial;
  private leaf:StandardMaterial;
  private roof:StandardMaterial;
  private water:StandardMaterial;
  private lamp:StandardMaterial;
  private sun:DirectionalLight;
  private shadow:ShadowGenerator;
  private heroes:Sprite[]=[];
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
  private materials=new Map<string,StandardMaterial>();
  constructor(canvas:HTMLCanvasElement){
    this.engine=new Engine(canvas,true,{preserveDrawingBuffer:true,stencil:true},true);
    this.engine.setHardwareScalingLevel(Math.max(1,window.devicePixelRatio/1.5));
    this.scene=new Scene(this.engine);
    this.scene.clearColor=Color4.FromHexString('#15292fff');
    this.scene.fogMode=Scene.FOGMODE_EXP2;this.scene.fogDensity=0.010;this.scene.fogColor=color('#a7b2aa');
    this.scene.ambientColor=color('#dce3c2');
    this.camera=new FreeCamera('shared-camera',new Vector3(0,23,-25),this.scene);
    this.camera.mode=Camera.ORTHOGRAPHIC_CAMERA;this.camera.setTarget(new Vector3(0,0,1));
    this.camera.minZ=.1;this.camera.maxZ=150;
    const ambient=new HemisphericLight('sky',new Vector3(0,1,0),this.scene);ambient.intensity=.75;ambient.groundColor=color('#697969');
    this.sun=new DirectionalLight('evening-sun',new Vector3(-.45,-1,.55),this.scene);this.sun.position=new Vector3(12,24,-13);this.sun.intensity=1.65;this.sun.diffuse=color('#ffe6bd');
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
    const glow=new GlowLayer('subtle-light',this.scene,{blurKernelSize:24});glow.intensity=.4;
    for(let i=0;i<2;i++){
      this.heroes.push(this.sprite('player-'+i,1.36,1.85));
      const ring=MeshBuilder.CreateTorus('ownership-'+i,{diameter:.85,thickness:.035,tessellation:32},this.scene);ring.material=this.mat('p'+i,i===0?'#dfb87e':'#80c9c0');this.markers.push(ring);
      this.labels.push(this.label('P'+(i+1),0,0,0,i===0?'#ffe4b3':'#b6fff0',.75));
      this.foes.push(this.sprite('enemy-'+i,1.5,1.2));this.drawEnemy(this.foes[i]!);
    }
    for(let i=0;i<26;i++){
      const m=MeshBuilder.CreateSphere('mote',{diameter:.035,segments:4},this.scene);m.material=this.mat('motes','#eddda0');(m.material as StandardMaterial).emissiveColor=color('#eddda0');
      m.position.set(Math.sin(i*8.31)*12,.6+(i%5)*.35,Math.cos(i*9.31)*9);this.particles.push(m);
    }
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
  private sprite(name:string,w:number,h:number):Sprite {
    const t=new DynamicTexture(name+'-pixels',{width:24,height:32},this.scene,false,Texture.NEAREST_SAMPLINGMODE);t.hasAlpha=true;
    const m=new StandardMaterial(name+'-material',this.scene);m.diffuseTexture=t;m.useAlphaFromDiffuseTexture=true;m.transparencyMode=Material.MATERIAL_ALPHATEST;m.alphaCutOff=.4;m.backFaceCulling=false;m.emissiveColor=new Color3(.52,.52,.52);m.specularColor=Color3.Black();
    const mesh=MeshBuilder.CreatePlane(name,{width:w,height:h},this.scene);mesh.material=m;mesh.billboardMode=Mesh.BILLBOARDMODE_ALL;
    return {mesh,texture:t,material:m,last:''};
  }
  private drawHero(sprite:Sprite,slot:number,facing:number,frame:number):void {
    const key=`${facing}:${frame}`;if(sprite.last===key)return;sprite.last=key;
    const c=sprite.texture.getContext();c.clearRect(0,0,24,32);
    const rect=(x:number,y:number,w:number,h:number,col:string)=>{c.fillStyle=col;c.fillRect(x,y,w,h);};
    const hair=slot===0?'#835746':'#ceb779',coat=slot===0?'#52758b':'#619d8d';
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
  private effect(e:Effect):void {
    const mesh=this.label(e.kind==='combo'?'✦ '+e.text:e.text,e.x,2.2,e.z,e.kind==='combo'?'#f8d68a':'#fff2d6',1.7);this.floats.push({mesh,time:0});
  }
  resize():void {
    this.engine.resize();const ratio=this.engine.getRenderWidth()/Math.max(1,this.engine.getRenderHeight());const half=Math.max(8.2,14/ratio);
    this.camera.orthoLeft=-half*ratio;this.camera.orthoRight=half*ratio;this.camera.orthoTop=half;this.camera.orthoBottom=-half;
  }
  draw(s:State,delta:number,animate:boolean):void {
    const dt=animate?Math.min(delta,.05):0;this.time+=dt;
    if(s.era!==this.era||s.flags.repaired!==this.flag){
      this.era=s.era;this.flag=s.flags.repaired;const future=s.era==='future';
      this.grass.diffuseColor=color(future?'#8e9991':'#729270');this.leaf.diffuseColor=color(future?(s.flags.repaired?'#779a87':'#636f78'):'#426c58');
      this.stone.diffuseColor=color(future?'#adb9b2':'#c0b68f');this.roof.diffuseColor=color(future?'#596476':'#555f64');
      this.water.diffuseColor=color(future?'#506c8c':'#488e94');this.sun.diffuse=color(future?'#b1c6e6':'#ffe6bd');
      this.scene.fogColor=color(future?'#8596ab':'#a7b2aa');this.lamp.emissiveColor=color(future&&!s.flags.repaired?'#1a2431':'#d99b54');
      this.repairs.setEnabled(future&&s.flags.repaired);
    }
    s.players.forEach((p,i)=>{
      const sprite=this.heroes[i]!;this.drawHero(sprite,i,p.facing,p.walking?Math.floor(this.time*7)%2:0);
      sprite.mesh.position.set(p.x,1.02+(p.walking?Math.sin(this.time*15)*.035:0),p.z);sprite.mesh.setEnabled(p.hp>0);
      this.markers[i]!.position.set(p.x,.21,p.z);this.labels[i]!.position.set(p.x,2.1,p.z);
    });
    this.foes.forEach((f,i)=>{
      const enemy=s.enemies[i];const visible=s.mode==='battle'?!!enemy&&enemy.hp>0:s.mode==='explore'&&!s.flags.won;
      f.mesh.setEnabled(visible);f.mesh.position.set(enemy?.x??(i===0?-2:2),.75+Math.sin(this.time*2+i)*.08,enemy?.z??4.5);
    });
    const midX=(s.players[0].x+s.players[1].x)/2,midZ=(s.players[0].z+s.players[1].z)/2;
    const tx=midX*.18,tz=midZ*.16+1;
    this.camera.position.set(tx,23,tz-26);this.camera.setTarget(new Vector3(tx,0,tz));
    this.portal.rotation.z=Math.sin(this.time)*.08;this.crystal.rotation.y=this.time*.4;
    this.particles.forEach((p,i)=>{p.position.y=.65+(i%5)*.35+Math.sin(this.time*.6+i)*.22;});
    while(s.effects.length){const e=s.effects.shift();if(e)this.effect(e);}
    for(let i=this.floats.length-1;i>=0;i--){const f=this.floats[i]!;f.time+=dt;f.mesh.position.y+=dt*.8;if(f.time>1.25){f.mesh.material?.dispose(true,true);f.mesh.dispose();this.floats.splice(i,1);}}
    this.scene.render();
  }
  start(loop:()=>void):void{this.engine.runRenderLoop(loop);}
}
