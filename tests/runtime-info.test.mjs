import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {FrameWindow} from '../.test/frame-window.mjs';
import {backendHint,cpuRenderScale,renderScale,RenderPolicy} from '../.test/render-capability.mjs';
import {renderLabel,buildLabel,RUNTIME_BUILD} from '../.test/runtime-info.mjs';
import {CpuEngine} from '../.test/cpu-entry.mjs';
import {cpuTestCanvas} from './cpu-test-canvas.mjs';
import {runtimeBaseline} from './helpers/runtime-baseline.mjs';
const hash=s=>createHash('sha256').update(s).digest('hex');
test('six presentation-only wires reverse exactly to CI47 main, including original rule/input/save functions',()=>{
 const fixture=JSON.parse(readFileSync('tests/fixtures/runtime-info-integration.json'));
 assert.equal(fixture.replacements.length,6);assert.equal(fixture.baseSource,'f07a42bfa7357e1a9ddcebfa8a790855927051b4');
 const source=readFileSync('src/main.ts','utf8');assert.equal(hash(runtimeBaseline(source)),fixture.baseMainSha256);
 assert(source.includes("renderLabel(world.inspectRenderer())"));assert(!source.includes('world.engine.getFps()'));
 assert.throws(()=>runtimeBaseline(source.replace("import {buildLabel,renderLabel}","import {buildLabel}")));
});
test('CPU identity uses only the exact project-owned label; browser software strings stay WebGL hints',()=>{
 assert.equal(backendHint('CPU Software Rasterizer / Canvas2D'),'cpu');
 for(const v of ['Software Rasterizer','ANGLE SwiftShader','llvmpipe'])assert.equal(backendHint(v),'software');
 assert.equal(backendHint('unknown'),'unverified');
});
for(const [w,h] of [[960,640],[1920,1080],[3840,2160],[390,844],[844,390]])test(`CPU automatic tiers really reduce capped buffer ${w}x${h}`,()=>{
 const port=cpuTestCanvas(w,h),engine=new CpuEngine(port.canvas,port.context);const sizes=[];
 try{
  for(let level=0;level<4;level++){
   engine.setHardwareScalingLevel(cpuRenderScale('auto',level,w,h,1));
   const area=engine.getRenderWidth()*engine.getRenderHeight();assert(area<=640*480);
   if(level)assert(area<sizes[level-1]);sizes.push(area);
  }
  engine.setHardwareScalingLevel(cpuRenderScale('quality',3,w,h,1));const quality=engine.getRenderWidth()*engine.getRenderHeight();
  engine.setHardwareScalingLevel(cpuRenderScale('compatibility',0,w,h,1));assert(engine.getRenderWidth()*engine.getRenderHeight()<quality);
 }finally{engine.dispose();}
});
test('CPU default density and WebGL density preserve the pre-F initial behavior',()=>{
 for(const [w,h] of [[960,640],[1920,1080],[390,844]])for(const dpr of [1,2,3]){
  const old=Math.max(renderScale('auto','software',0,w,h,dpr),Math.sqrt(w*h/(640*480)),w/1280,h/1280);
  assert.equal(cpuRenderScale('auto',0,w,h,dpr),old);
  for(const hint of ['software','unverified']){const p=new RenderPolicy(hint);assert.equal(p.scale(w,h,dpr),renderScale('auto',hint,0,w,h,dpr));}
 }
 for(const n of [NaN,Infinity,-1,0])assert(Number.isFinite(cpuRenderScale('auto',n,n,n,n)));
});
test('CPU auto adapts only after original sustained threshold and manual quality is stable',()=>{
 const p=new RenderPolicy('cpu'),base=p.scale(1920,1080,1);for(let i=0;i<119;i++)assert(!p.sample(70,true));
 assert(p.sample(70,true));assert(p.scale(1920,1080,1)>base);assert.equal(p.inspect().densityPolicy,'cpu-pixel-budget');
 p.setMode('quality');const quality=p.scale(1920,1080,1);for(let i=0;i<2000;i++)assert(!p.sample(70,true));assert.equal(p.scale(1920,1080,1),quality);
 assert(p.inspect().frames.ready);p.setMode('auto');assert.equal(p.scale(1920,1080,1),base);
});
test('frame window records actual active intervals, not a NullEngine FPS constant',()=>{
 const w=new FrameWindow();w.sample(5000,true);assert.equal(w.inspect().samples,0);
 for(let i=0;i<30;i++)w.sample(50,true);const a=w.inspect();assert.equal(a.meanMs,50);assert.equal(a.fps,20);assert.equal(a.p95Ms,50);assert(a.ready);
 a.fps=999;assert.equal(w.inspect().fps,20);for(let i=0;i<1000;i++)w.sample(25,true);assert.equal(w.inspect().samples,120);assert.equal(w.inspect().fps,40);
});
test('active long frames remain in the statistics; pause and resume intervals do not',()=>{
 const w=new FrameWindow();w.sample(1,true);for(let i=0;i<29;i++)w.sample(10,true);w.sample(1000,true);
 assert.equal(w.inspect().maxMs,1000);assert(w.inspect().meanMs>40);w.sample(8000,false);assert.equal(w.inspect().samples,30);assert.equal(w.inspect().active,false);
 w.sample(9000,true);assert.equal(w.inspect().samples,0);for(let i=0;i<30;i++)w.sample(20,true);assert.equal(w.inspect().maxMs,20);
 for(const x of [NaN,Infinity,0,-1,60001])w.sample(x,true);assert.equal(w.inspect().rejected,5);assert.equal(w.inspect().samples,30);w.reset();assert.equal(w.inspect().samples,0);
});
test('runtime labels never call the CPU backend WebGL zero or invent hardware certification',()=>{
 const w=new FrameWindow();w.sample(1,true);for(let i=0;i<30;i++)w.sample(50,true);
 const r={backend:'cpu-canvas2d',backendHint:'software',webglVersion:0,width:640,height:480,frames:w.inspect()};
 const label=renderLabel(r);assert(label.text.includes('CPU／Canvas2D'));assert(label.text.includes('20 FPS'));assert(!label.text.includes('WebGL'));assert(label.title.includes('P95 50.0 ms'));
 w.sample(100,false);assert(renderLabel({...r,frames:w.inspect()}).text.includes('已暫停'));
 w.reset();w.sample(1,true);assert(renderLabel({...r,frames:w.inspect()}).text.includes('取樣中'));
 assert(renderLabel({...r,backend:'webgl',webglVersion:2}).text.startsWith('軟體 WebGL 2'));
 assert(renderLabel({...r,backend:'webgl',backendHint:'unverified',webglVersion:1}).text.startsWith('WebGL 1'));
});
test('bundle identity and build metadata use the same injected object, never a copied old label',async()=>{
 assert.equal(RUNTIME_BUILD.sourceSha,null);assert(buildLabel().includes('本機建置'));
 const identity={version:'0.9.28',batch:'VQ02F',sourceSha:'a'.repeat(40)};
 await build({entryPoints:['src/runtime-info.ts'],bundle:true,format:'esm',platform:'node',outfile:'.test/runtime-info-injected.mjs',define:{__CHRONO_BUILD__:JSON.stringify(identity)}});
 const module=await import('../.test/runtime-info-injected.mjs');assert.deepEqual(module.RUNTIME_BUILD,identity);assert(module.buildLabel().includes('aaaaaaaa'));
 const source=readFileSync('scripts/build.mjs','utf8');assert(source.includes('define:{__CHRONO_BUILD__:JSON.stringify(buildInfo)}'));assert(source.includes('JSON.stringify({...buildInfo,'));
 const html=readFileSync('index.html','utf8');assert.equal(html.split('id="build-info"').length,2);assert(!html.includes('WEBGL · LOADING'));
});

test('pause build identity is the only versioned runtime badge, not an old review label',()=>{
 const html=readFileSync('index.html','utf8');
 assert.ok(html.includes('id="build-info"'));
 assert.ok(html.includes('reMASTER / DEVELOPMENT PREVIEW'));
 assert.doesNotMatch(html,/MENU COMFORT REVIEW|0\.9\.17/);
});
