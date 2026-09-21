import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {backendHint,renderMode,renderScale,RenderBudget,RenderPolicy,WEBGL_OPTIONS} from '../.test/render-capability.mjs';
import {showRenderFailure} from '../.test/render-status.mjs';

for(const name of ['ANGLE (Google, Vulkan SwiftShader Device)','llvmpipe (LLVM 19)','softpipe','Software Rasterizer','Microsoft Basic Render Driver'])test('known software hint: '+name,()=>assert.equal(backendHint(name),'software'));
for(const name of [null,undefined,{},'', 'WebKit WebGL','ANGLE Intel','NVIDIA','AMD'])test('unavailable or other driver is unverified, not proven hardware: '+String(name),()=>assert.equal(backendHint(name),'unverified'));
test('browser keeps backend ownership; performance caveat does not reject software',()=>{
 assert.equal(WEBGL_OPTIONS.failIfMajorPerformanceCaveat,false);assert.equal(WEBGL_OPTIONS.powerPreference,'default');
 assert.equal(WEBGL_OPTIONS.preserveDrawingBuffer,true);assert.equal(WEBGL_OPTIONS.stencil,true);assert(Object.isFrozen(WEBGL_OPTIONS));
});
test('mode validates input and original quality preserves existing DPR scaling',()=>{
 for(const v of [undefined,null,'software','gpu','',{},1])assert.equal(renderMode(v),'auto');
 assert.equal(renderMode('quality'),'quality');assert.equal(renderMode('compatibility'),'compatibility');
 for(const dpr of [1,1.5,2,3])for(const hint of ['unverified','software'])assert.equal(renderScale('quality',hint,3,1920,1080,dpr),Math.max(1,dpr/1.5));
 assert.equal(renderScale('auto','unverified',0,1920,1080,1),1);
});
test('software compatibility bounds drawing-buffer area without camera or scene changes',()=>{
 for(const [w,h] of [[1365,900],[1920,1080],[3840,2160],[390,844]]){
  const scale=renderScale('auto','software',0,w,h,1);assert(scale>=1.25);assert(w*h/scale**2<=960*720+1e-6);
 }
 assert.equal(renderScale('compatibility','unverified',0,390,844,1),1.25);
 for(const n of [NaN,Infinity,-1,0])assert(Number.isFinite(renderScale('compatibility','software',n,n,n,n)));
});
test('budget ignores startup, short spikes and normal 60fps; sample memory bounded',()=>{
 const budget=new RenderBudget();for(let i=0;i<30;i++)assert.equal(budget.sample(150,true),false);
 for(let i=0;i<900;i++){assert.equal(budget.sample(i%90===0?120:16.67,true),false);assert(budget.inspect().samples<90);}
 assert.equal(budget.inspect().level,0);
});
test('sustained budget miss has a finite three-step resolution reduction',()=>{
 const budget=new RenderBudget();let changes=0;for(let i=0;i<1200;i++)if(budget.sample(70,true))changes++;
 assert.equal(changes,3);assert.equal(budget.inspect().level,3);
});
test('paused, hidden or context-lost intervals restart warmup, not elapsed catchup',()=>{
 const b=new RenderBudget();for(let i=0;i<118;i++)b.sample(70,true);assert.equal(b.inspect().samples,88);
 b.sample(70,false);assert.deepEqual(b.inspect(),{level:0,samples:0,warmup:30});
 for(let i=0;i<118;i++)b.sample(70,true);assert.equal(b.inspect().level,0);
 for(const dt of [NaN,Infinity,0,-1,251,20000]){assert.equal(b.sample(dt,true),false);assert.equal(b.inspect().samples,0);}
 b.reset();assert.deepEqual(b.inspect(),{level:0,samples:0,warmup:30});
});
test('manual quality does not adapt and auto can reset without changing backend hint',()=>{
 const p=new RenderPolicy('software');p.setMode('quality');for(let i=0;i<1000;i++)assert(!p.sample(80,true));
 assert.equal(p.scale(1365,900,1),1);p.setMode('auto');assert(p.scale(1365,900,1)>1);
 const inspected=p.inspect();inspected.mode='quality';assert.equal(p.inspect().mode,'auto');
 assert.equal(inspected.browserChoosesBackend,true);assert.equal(inspected.forcedSoftware,false);assert.equal(inspected.canvas2dFallback,false);
});
test('unknown renderer only adapts after observation, without classifying it as software',()=>{
 const p=new RenderPolicy('unverified');for(let i=0;i<120;i++)p.sample(65,true);
 assert.equal(p.inspect().reason,'sustained-frame-budget');assert.equal(p.inspect().backendHint,'unverified');assert(p.scale(1920,1080,1)>1);
});
class Element {
 children=[];attributes={};textContent='';
 constructor(tagName){this.tagName=tagName;}
 append(...children){this.children.push(...children);}
 setAttribute(k,v){this.attributes[k]=v;}
}
test('failure UI is actionable and safely renders arbitrary error as text, never a playable claim',()=>{
 let reloads=0;const doc={body:new Element('body'),createElement:n=>new Element(n),defaultView:{location:{reload:()=>reloads++}}};
 const bad='<img src=x onerror=alert(1)>',panel=showRenderFailure(doc,Error(bad));
 assert.equal(panel.attributes.role,'alertdialog');assert.equal(panel.attributes['aria-modal'],'true');assert.equal(panel.id,'render-unavailable');
 assert.equal(panel.children[3].children[1].textContent,bad);assert.equal(panel.innerHTML,undefined);
 assert.match(panel.children[2].textContent,/CPU／Canvas2D 相容繪圖/);assert.equal(doc.body.children[0],panel);
 panel.children[4].onclick();assert.equal(reloads,1);
});
test('host freezes on actual context loss and restores the existing simulation clock',()=>{
 const main=readFileSync('src/main.ts','utf8'),renderer=readFileSync('src/render.ts','utf8');
 assert.match(main,/renderBlocked\|\|document.hidden/);assert.match(main,/onContextLostObservable.add\(\(\)=>contextHold\(true\)\)/);
 assert.match(main,/onContextRestoredObservable.add/);assert.match(main,/accumulator=0;last=performance.now\(\)/);
 assert.match(main,/observeRenderFrame\(frameMs,running\)/);assert.match(main,/showRenderFailure\(document,error\)/);
 assert.match(readFileSync('src/cpu-engine.ts','utf8'),/new Engine\(canvas,true,\{\.\.\.WEBGL_OPTIONS\},true\)/);
 assert.match(renderer,/createRenderEngine\(canvas\)/);
 assert.doesNotMatch(renderer,/NullEngine|fair-surfaces|fair-composition/);
 const capability=readFileSync('src/render-capability.ts','utf8');assert.doesNotMatch(capability,/userAgent|fetch\(|setTimeout|setInterval|localStorage/);
});
