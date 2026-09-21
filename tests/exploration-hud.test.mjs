import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const source=readFileSync('src/main.ts','utf8');
const begin=source.indexOf('function layoutFeedback():void{'),end=source.indexOf('\n}',begin)+2;
// Production measurement logic with synthetic layout ports, not browser evidence.
const code=source.slice(begin,end).replace('():void','()');
function run({mode='explore',started=true,top=650,height=844}={}){
 const writes=[],reads=[],state={mode,untouched:{hp:100,ticks:400}},before=structuredClone(state);
 const document={documentElement:{style:{setProperty:(...args)=>writes.push(args)}}};
 const $=id=>({getBoundingClientRect(){reads.push(id);return {top};}});
 const layout=new Function('$','document','state','started','window',code+';return layoutFeedback;')($,document,state,started,{innerHeight:height});
 layout();assert.deepEqual(state,before);return {writes,reads};
}
test('content-sized exploration dock reserves all wrapped rows without a hardcoded height',()=>{
 for(const top of [420,560,700.2]){const r=run({top});assert.deepEqual(r.reads,['exploration-dock']);assert.deepEqual(r.writes,[['--exploration-clearance',`${Math.ceil(844-top+12)}px`]]);}
});
test('battle feedback still uses the exact party panel and previous clearance rule',()=>{
 const r=run({mode:'battle',top:470,height:720});assert.deepEqual(r.reads,['party']);assert.deepEqual(r.writes,[['--party-clearance','262px']]);
});
test('startup and noninteractive result modes never measure or write layout variables',()=>{
 for(const options of [{started:false},{mode:'victory'},{mode:'defeat'}])assert.deepEqual(run(options),{writes:[],reads:[]});
});
test('short viewport and fractional layout round outward rather than clipping one pixel',()=>{
 assert.deepEqual(run({height:320,top:180.25}).writes,[['--exploration-clearance','152px']]);
});
test('reviewed layout block stays pinned with the explicit VQ02B context/density main version',()=>{
 const old=`/** Content-sized battle panels, including tonics, must never cover feedback. */
function layoutFeedback():void{
 if(!started||state.mode!=='battle')return;
 const box=$('party').getBoundingClientRect();
 document.documentElement.style.setProperty('--party-clearance',Math.ceil(window.innerHeight-box.top+12)+'px');
}
new ResizeObserver(layoutFeedback).observe($('party'));window.addEventListener('resize',layoutFeedback);`;
 const first=source.indexOf('/** Measure presentation only:'),last=source.indexOf('\n\nfunction openBag()',first);
 assert(first>0&&last>first);
 const normalized=source.slice(0,first)+old+source.slice(last);
 assert.equal(createHash('sha256').update(normalized).digest('hex'),'f878ea33231c6ca5f1f9b2f0e7a815c1a384b14de08e0e3c0eef3778643eb0cd');
});
test('the dock never owns keyboard events, state writes, new timers or synthetic input',()=>{
 assert.doesNotMatch(code,/addEventListener|setTimeout|setInterval|requestAnimationFrame|\.focus\(|\.click\(/);
 assert.doesNotMatch(code,/state\.[\w.]+\s*=(?!=)/);
 assert(source.includes("new ResizeObserver(layoutFeedback).observe($('exploration-dock'))"));
});
test('battle/start remain display-contents, and the original native input IDs are not cloned',()=>{
 const html=readFileSync('index.html','utf8'),css=readFileSync('src/exploration-hud.css','utf8');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);
 for(const id of ['world','interact','control-hint','touch','fps','guest-panel','save-file'])assert(ids.includes(id));
 assert(css.includes('#exploration-dock{display:contents}'));
 assert(css.includes('pointer-events:none'));assert(css.includes('pointer-events:auto'));
});
test('no silent first-contact policy regression: quiet cue stays unique, full guide stays available',()=>{
 const css=readFileSync('src/adventure.css','utf8'),dock=readFileSync('src/exploration-hud.css','utf8');
 assert(css.includes('body[data-adventure="true"][data-early-meeting="true"][data-hud="quiet"][data-mode="explore"] #interact-hint{display:none}'));
 assert(dock.includes('[data-early-meeting="true"][data-hud="quiet"] #exploration-dock>#party{display:flex;justify-content:center}'));
 assert(!dock.includes('#interact-hint{display:none}'));
});
