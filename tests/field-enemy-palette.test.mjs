import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {World,createState} from '../.test/cpu-entry.mjs';
import {World as BWorld} from '../.test/field-enemy-baseline-cpu-entry.mjs';
import {FieldEnemyPalette,FIELD_ENEMY_ART} from '../.test/field-enemy-palette.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
import {fieldEnemyBaseline} from './helpers/field-enemy-baseline.mjs';
import {paletteCounts,assertFieldEnemies} from '../scripts/field-enemy-evidence.mjs';
import {png} from '../scripts/asset-export.mjs';
const hash=b=>createHash('sha256').update(b).digest('hex');
const spec=JSON.parse(readFileSync('tests/baselines/vq03c-declared-enemy-palette-edits.json'));
for(const [path,edits]of Object.entries(spec.files))test('C exact B source inverse '+path,()=>{
 const s=readFileSync(path,'utf8');assert.equal(hash(fieldEnemyBaseline(path,s)),spec.originalSha256[path]);
 // Mutate the B-normalized source back into only this declared edit, ensuring the negative is not a no-op.
 for(const e of edits){assert.throws(()=>fieldEnemyBaseline(path,s+e.after));const bad=s.replace(e.after,'');assert.notEqual(bad,s);assert.throws(()=>fieldEnemyBaseline(path,bad));}
 assert.notEqual(hash(fieldEnemyBaseline(path,s+'\n// unrelated drift\n')),spec.originalSha256[path]);
});
export function rig(width=320,height=240,dpr=1){
 const oldDoc=globalThis.document,oldWindow=globalThis.window;const doc={createElement:t=>t==='canvas'?cpuTestCanvas(1,1).canvas:{style:{}},getElementById:()=>null,addEventListener(){},removeEventListener(){}};
 globalThis.document=doc;globalThis.window={devicePixelRatio:dpr,addEventListener(){},removeEventListener(){},navigator:{}};
 const a=cpuTestCanvas(width,height),b=cpuTestCanvas(width,height);a.canvas.ownerDocument=b.canvas.ownerDocument=doc;
 const current=new World(a.canvas),old=new BWorld(b.canvas);
 return{a,b,current,old,close(){current.engine.dispose();old.engine.dispose();globalThis.document=oldDoc;globalThis.window=oldWindow;}};
}
const geometry=m=>({name:m.name,position:m.position.asArray(),rotation:m.rotation.asArray(),scale:m.scaling.asArray(),vertices:m.getTotalVertices(),indices:m.getTotalIndices(),material:m.material?.name,enabled:m.isEnabled()});
const resource=w=>[w.scene.meshes.length,w.scene.materials.length,w.scene.textures.length];
const material=m=>({disableLighting:m.disableLighting,emissive:m.emissiveColor.asArray(),ambient:m.ambientColor.asArray(),specular:m.specularColor.asArray(),emissionOnly:m.useEmissiveAsIllumination,linked:m.linkEmissiveWithDiffuse,emissiveTexture:m.emissiveTexture?.name??null,mode:m.transparencyMode,alpha:m.alpha,diffuse:m.diffuseColor.asArray(),opacity:m.opacityTexture?.name??null});
for(const chapter of ['canyon','forest'])for(const dpr of [1,2])test('C real World '+chapter+' authored pixels and PNG gate (offline only) DPR'+dpr,()=>{
 const k=rig(640,480,dpr);try{const s=createState(chapter),before=structuredClone(s);k.current.draw(s,0,false);k.old.draw(structuredClone(s),0,false);
 const art=k.current.inspect().fieldEnemyArt,r=k.current.inspectRenderer(),raw=k.a.pixels();
 assert.deepEqual(s,before);assert.deepEqual(k.current.scene.meshes.map(geometry),k.old.scene.meshes.map(geometry));assert.deepEqual(resource(k.current),resource(k.old));
 assert.notDeepEqual(raw,k.b.pixels());assert.equal(art.actors.length,chapter==='canyon'?3:2);
 const bytes=png({width:r.width,height:r.height,rgba:Buffer.from(raw)}),o={profile:'vq03c-native-field-enemies',state:s,art,renderer:r,canvas:{width:r.width,height:r.height,source:'actual-cpu-canvas',palette:[[55,125,144,255],[224,209,122,255],[41,43,56,255],[48,45,64,255]],counts:paletteCounts(raw,r.width,r.height,art.rects)},canvasImage:{path:'field-'+chapter+'-canvas.png',bytes:bytes.length,sha256:hash(bytes)},physicalDevice:false,artApproved:false};
 assert(assertFieldEnemies(o,chapter,bytes));
 for(let i=0;i<3;i++){assert.deepEqual(k.current.foes[i].texture.getContext().getImageData(0,0,24,32).data,k.old.foes[i].texture.getContext().getImageData(0,0,24,32).data);}
 const n=resource(k.current),frozen=raw.slice();for(let i=0;i<4;i++){k.current.draw(s,0,false);assert.deepEqual(k.a.pixels(),frozen);assert.deepEqual(s,before);assert.deepEqual(resource(k.current),n);}
 console.log(JSON.stringify({kind:'offline-C-field-palette-not-native',chapter,dpr,buffer:[r.width,r.height],counts:o.canvas.counts,oldCounts:paletteCounts(k.b.pixels(),r.width,r.height,art.rects)}));
 }finally{k.close();}
});
test('C field exit restores every original material property and lab pixels',()=>{
 const k=rig();try{const s=createState('lab');k.current.draw(s,0,false);k.old.draw(structuredClone(s),0,false);const props=k.current.foes.map(f=>material(f.material));
 for(const c of ['canyon','forest','lab','canyon','lab']){k.current.draw(createState(c),0,false);k.old.draw(createState(c),0,false);if(c==='lab'){assert.deepEqual(k.current.foes.map(f=>material(f.material)),props);assert.deepEqual(k.a.pixels(),k.b.pixels());}}
 assert.equal(k.current.inspect().fieldEnemyArt.active,false);assert.deepEqual(k.current.inspect().fieldEnemyArt.actors,[]);
 }finally{k.close();}
});
test('C direct reset restores cached values without changing textures, topology or unrelated materials',()=>{
 const k=rig();try{const sprite=k.current.foes[0],m=sprite.material,controller=new FieldEnemyPalette(),before=material(m),n=resource(k.current);controller.apply(sprite,true);assert.equal(m.disableLighting,true);assert.equal(m.emissiveTexture,sprite.texture);assert.deepEqual(m.emissiveColor.asArray(),[0,0,0]);controller.reset();assert.deepEqual(material(m),before);controller.reset();assert.deepEqual(resource(k.current),n);assert.equal(FIELD_ENEMY_ART.approved,false);
 }finally{k.close();}
});
for(const portrait of [false,true])test('C non-field chapters and six return cycles preserve B pixels/state/resources '+portrait,()=>{
 const k=rig(portrait?156:240,portrait?338:160);try{const chapters=['lab','truce','castle','chamber','fair','bedroom','downstairs','overworld1000','cathedral','future'];
 for(const chapter of chapters){const s=createState(chapter),before=structuredClone(s);k.current.draw(s,0,false);k.old.draw(structuredClone(s),0,false);assert.deepEqual(k.a.pixels(),k.b.pixels(),chapter);assert.deepEqual(k.current.scene.meshes.map(geometry),k.old.scene.meshes.map(geometry),chapter);assert.deepEqual(s,before);}
 for(const c of ['canyon','forest','lab'])k.current.draw(createState(c),0,false);const n=resource(k.current);for(let i=0;i<6;i++)for(const c of ['canyon','forest','lab']){k.current.draw(createState(c),0,false);assert.deepEqual(resource(k.current),n);}
 }finally{k.close();}
});
test('C active battle enemies retain authored art, defeated field enemies disappear normally',()=>{
 const k=rig();try{const s=createState('canyon');s.mode='battle';s.enemies=[{x:-1.8,z:2.4,hp:30,atb:0,kind:'imp'},{x:1.8,z:3,hp:0,atb:0,kind:'imp'}];const before=structuredClone(s);k.current.draw(s,0,false);assert.deepEqual(k.current.inspect().fieldEnemyArt.actors.map(a=>a.name),['enemy-0']);assert.deepEqual(s,before);
 s.mode='victory';s.opening.canyonWon=true;k.current.draw(s,0,false);assert.deepEqual(k.current.inspect().fieldEnemyArt.actors,[]);
 }finally{k.close();}
});
test('C cannot invert forbidden engine, painter, game rules or held source',()=>{for(const p of ['src/core.ts','src/main.ts','src/input.ts','src/cpu-scene.ts','src/cpu-raster.ts','src/pixel-art.ts','src/prologue-render.ts','.github/workflows/ci.yml'])assert.throws(()=>fieldEnemyBaseline(p,'changed'));const b=readFileSync('src/prologue-render.ts');assert.equal(createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${b.length}\0`),b])).digest('hex'),'2711a74185aacf3c6bddf9db85ba99a2afbc507a');assert.match(readFileSync('scripts/build.mjs','utf8'),/version:'0\.9\.50',batch:'VQ03C'/);});
import {runInNewContext} from 'node:vm';
for(const chapter of ['canyon','forest'])test('C actual observer JavaScript executes against production World offline: '+chapter,()=>{const k=rig(640,480);try{
 const s=createState(chapter),frozen=structuredClone(s);k.current.draw(s,0,false);
 k.a.canvas.toDataURL=()=>{const r=k.current.inspectRenderer();return 'data:image/png;base64,'+png({width:r.width,height:r.height,rgba:Buffer.from(k.a.pixels())}).toString('base64');};
 const py=readFileSync('tests/field_enemy_capture.py','utf8'),script=py.split("SCRIPT = r'''")[1].split("'''",1)[0];
 const raw=runInNewContext('('+script+')()',{window:{__CHRONO_TEST__:{snapshot:()=>structuredClone(s),view:()=>k.current.inspect()}},document:{getElementById:id=>id==='world'?k.a.canvas:null}});
 const o=JSON.parse(JSON.stringify(raw)),bytes=Buffer.from(o.png.split(',')[1],'base64');delete o.png;o.canvasImage={path:'field-'+chapter+'-canvas.png',bytes:bytes.length,sha256:hash(bytes)};assert(assertFieldEnemies(o,chapter,bytes));assert.deepEqual(s,frozen);
 }finally{k.close();}});
