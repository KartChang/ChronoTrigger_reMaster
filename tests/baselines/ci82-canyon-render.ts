import {Scene,Mesh,MeshBuilder,TransformNode,Color3,StandardMaterial,DynamicTexture,Texture,Material,ShadowGenerator} from '@babylonjs/core';
import {CANYON_ROCKS} from './story-data';
import {drawWoodlandOak} from './woodland-art';
import {drawCanyonFloor,drawCanyonRock,drawCanyonTurf} from './canyon-art';
export function buildCanyon(scene:Scene,shadow:ShadowGenerator){
  const root=new TransformNode('truce-canyon-600',scene),materials=new Map<string,StandardMaterial>();
  const mat=(hex:string)=>{let m=materials.get(hex);if(m)return m;m=new StandardMaterial('canyon-'+hex,scene);m.diffuseColor=Color3.FromHexString(hex);m.specularColor=Color3.Black();materials.set(hex,m);return m;};
  const box=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,material:StandardMaterial)=>{const m=MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene);m.parent=root;m.position.set(x,y,z);m.material=material;m.receiveShadows=true;if(h>.4)shadow.addShadowCaster(m);return m;};
  const groundTex=new DynamicTexture('canyon-floor',{width:512,height:448},scene,false,Texture.NEAREST_SAMPLINGMODE),ctx=groundTex.getContext();
  drawCanyonFloor(ctx as CanvasRenderingContext2D);
  groundTex.update();const gm=mat('#ffffff');gm.diffuseTexture=groundTex;
  const ground=MeshBuilder.CreateGround('canyon-floor',{width:24,height:22},scene);ground.parent=root;ground.position.y=.05;ground.position.z=1;ground.material=gm;ground.receiveShadows=true;
  const rt=new DynamicTexture('stratified-rock',{width:64,height:64},scene,false,Texture.NEAREST_SAMPLINGMODE),rc=rt.getContext();drawCanyonRock(rc as CanvasRenderingContext2D);rt.update();const rm=mat('#f7f1dc');rm.diffuseTexture=rt;
  const turfTex=new DynamicTexture('canyon-turf',{width:64,height:64},scene,false,Texture.NEAREST_SAMPLINGMODE);drawCanyonTurf(turfTex.getContext() as CanvasRenderingContext2D);turfTex.update();
  const turf=mat('#688241');turf.diffuseColor=Color3.White();turf.diffuseTexture=turfTex;
  box('canyon-bed',0,-.5,1,24,1,22,mat('#3b4933'));
  for(const rock of CANYON_ROCKS){box('terrace-cliff',rock.x,rock.h/2,rock.z,rock.w,rock.h,rock.d,rm);box('terrace-turf',rock.x,rock.h+.04,rock.z,rock.w+.1,.12,rock.d+.1,turf);}
  // Scene boundary cliffs leave a clearly visible southern exit instead of a fake world-map teleport.
  for(const x of [-11.8,11.8])box('ridge',x,2,1,1.7,4,21,rm);
  const treeTex=new DynamicTexture('canyon-tree',{width:64,height:80},scene,false,Texture.NEAREST_SAMPLINGMODE);treeTex.hasAlpha=true;drawWoodlandOak(treeTex.getContext() as CanvasRenderingContext2D);treeTex.update();
  const tm=new StandardMaterial('canyon-tree',scene);tm.diffuseTexture=treeTex;tm.emissiveTexture=treeTex;tm.disableLighting=true;tm.useAlphaFromDiffuseTexture=true;tm.transparencyMode=Material.MATERIAL_ALPHATEST;tm.backFaceCulling=false;
  for(const [x,z] of [[-9,9],[9,9],[-10,-6],[9,-7],[-9,-4],[9,2],[-7,10],[6,10]]){const m=MeshBuilder.CreatePlane('pixel-canopy',{width:4.2,height:5.25},scene);m.parent=root;m.material=tm;m.billboardMode=Mesh.BILLBOARDMODE_ALL;m.position.set(x!,2.6,z!);}
  const gate=MeshBuilder.CreateTorus('canyon-closed-gate',{diameter:1.4,thickness:.045,tessellation:32},scene);gate.parent=root;gate.rotation.x=Math.PI/2;gate.position.set(0,1.2,9.9);gate.material=mat('#5d83ae');
  for(let i=0;i<24;i++){const x=Math.sin(i*7.3)*10,z=Math.cos(i*3.1)*9;if(Math.abs(x)<3)continue;box('wildflower',x,.2,z,.08,.25,.08,mat(i%2?'#d2bf72':'#d4d8ba'));}
  root.setEnabled(false);return {root};
}
