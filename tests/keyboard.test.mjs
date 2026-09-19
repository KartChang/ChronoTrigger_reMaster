import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {keyboardVectors,physicalCode,editableTarget} from '../.test/keyboard-policy.mjs';
import {Controls} from '../.test/input.mjs';
// Small event surface for the real Controls implementation. No game or UI state injection.
class Element{isContentEditable=false;getClientRects(){return [{}];}}
class Input extends Element{constructor(type='text'){super();this.type=type;}}
globalThis.HTMLElement=Element;globalThis.HTMLInputElement=Input;globalThis.HTMLTextAreaElement=class extends Element{};globalThis.HTMLSelectElement=class extends Element{};
function harness(solo=true,ui=()=>false){
 const handlers={};globalThis.window={addEventListener:(key,fn)=>handlers[key]=fn};globalThis.document={querySelectorAll:()=>[]};Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[]},configurable:true});
 const calls=[],control=new Controls((...v)=>calls.push(v),{solo:()=>typeof solo==='function'?solo():solo,routeUi:ui});
 const emit=(code,options={})=>{const e={code,key:code,defaultPrevented:false,repeat:false,target:new Element(),ctrlKey:false,metaKey:false,altKey:false,preventDefault(){this.defaultPrevented=true;},...options};handlers.keydown(e);return e;};
 return {control,calls,emit,up:code=>handlers.keyup({code,key:code}),blur:()=>handlers.blur()};
}
test('single player arrows and WASD operate P1; P2 vector remains zero',()=>{const h=harness();h.emit('ArrowUp');assert.deepEqual(h.control.poll(),[{x:0,z:1},{x:0,z:0}]);h.up('ArrowUp');h.emit('KeyD');assert.deepEqual(h.control.poll(),[{x:1,z:0},{x:0,z:0}]);});
test('co-op keeps independent P2 arrows and Enter rather than stealing P1',()=>{const h=harness(false);h.emit('ArrowLeft');h.emit('KeyW');h.emit('Enter');assert.deepEqual(h.control.poll(),[{x:0,z:1},{x:-1,z:0}]);assert.deepEqual(h.calls,[[1,'interact']]);});
test('single Enter/Space/E all confirm once and suppress native button default',()=>{const h=harness();for(const code of ['Enter','Space','KeyE']){const e=h.emit(code);assert(e.defaultPrevented);}assert.deepEqual(h.calls,[[0,'interact'],[0,'interact'],[0,'interact']]);h.emit('Enter',{repeat:true});assert.equal(h.calls.length,3);});
test('UI consumes key before command and clears held movement; no duplicate Enter',()=>{let modal=false,count=0;const h=harness(false,code=>{if(modal){if(code==='Enter')count++;return true;}return false;});h.emit('KeyW');modal=true;const e=h.emit('Enter');assert(e.defaultPrevented);assert.equal(count,1);assert.deepEqual(h.calls,[]);assert.deepEqual(h.control.poll(),[{x:0,z:0},{x:0,z:0}]);});
test('window blur clears held movement and key release still works',()=>{const h=harness();h.emit('KeyA');h.blur();assert.deepEqual(h.control.poll()[0],{x:0,z:0});h.emit('ArrowRight');h.up('ArrowRight');assert.deepEqual(h.control.poll()[0],{x:0,z:0});});
test('real text editors and browser shortcuts keep native keyboard behavior',()=>{const h=harness();for(const target of [new Input(),new HTMLTextAreaElement(),new HTMLSelectElement(),Object.assign(new Element(),{isContentEditable:true})]){assert(editableTarget(target));assert.equal(h.emit('KeyW',{target}).defaultPrevented,false);}for(const modifier of ['ctrlKey','metaKey','altKey'])assert.equal(h.emit('KeyW',{[modifier]:true}).defaultPrevented,false);assert.deepEqual(h.control.poll()[0],{x:0,z:0});});
test('file chooser focus no longer discards all subsequent game keys',()=>{const h=harness();assert.equal(editableTarget(new Input('file')),false);h.emit('KeyW',{target:new Input('file')});assert.equal(h.control.poll()[0].z,1);});
test('physical code survives non-English key label; fallback only when code missing',()=>{assert.equal(physicalCode({code:'KeyW',key:'ㄊ'}),'KeyW');assert.equal(physicalCode({code:'',key:'w'}),'KeyW');assert.equal(physicalCode({code:'Unidentified',key:'Enter'}),'Enter');assert.equal(physicalCode({code:'',key:' '}),'Space');});
test('opposing keys cancel; diagonal controls normalize to original movement speed',()=>{const h=harness();h.emit('KeyW');h.emit('ArrowUp');h.emit('KeyD');const v=h.control.poll()[0];assert(Math.abs(Math.hypot(v.x,v.z)-1)<1e-12);h.control.clear();for(const c of ['KeyW','KeyS','ArrowUp','ArrowDown'])h.emit(c);assert.deepEqual(h.control.poll()[0],{x:0,z:0});});
test('keyup/default-prevented events do not trigger commands',()=>{const h=harness();h.emit('KeyJ',{defaultPrevented:true});h.up('KeyJ');assert.deepEqual(h.calls,[]);});
test('production UI has result confirmation, context help and focus return; legacy controls kept',()=>{const s=readFileSync('src/main.ts','utf8'),html=readFileSync('index.html','utf8');assert.match(s,/solo:\(\)=>!state.joined/);assert.match(s,/if\(state.mode==='victory'\|\|state.mode==='defeat'\)\{if\(confirm&&!repeat\)continueEncounter\(\)/);assert.match(s,/function focusWorld/);assert.match(s,/released:\(\)=>\{updateHud\(\);if\(started&&!halted\(\)\)focusWorld\(\)/);assert.match(html,/<canvas(?=[^>]*id="world")(?=[^>]*tabindex="0")/);assert.match(s,/routeUi:routeKeyboardUi/);});

test('ownership change clears held arrows instead of transferring P2 motion to P1',()=>{let solo=false;const h=harness(()=>solo);h.emit('ArrowUp');assert.equal(h.control.poll()[1].z,1);solo=true;assert.deepEqual(h.control.poll(),[{x:0,z:0},{x:0,z:0}]);h.emit('ArrowUp');assert.equal(h.control.poll()[0].z,1);});
test('a new direction key after ownership change survives the next poll',()=>{let solo=false;const h=harness(()=>solo);h.emit('ArrowUp');solo=true;h.up('ArrowUp');h.emit('KeyD');assert.deepEqual(h.control.poll(),[{x:1,z:0},{x:0,z:0}]);});
test('entering co-op cannot reassign a held solo arrow to P2',()=>{let solo=true;const h=harness(()=>solo);h.emit('ArrowLeft');assert.equal(h.control.poll()[0].x,-1);solo=false;assert.deepEqual(h.control.poll(),[{x:0,z:0},{x:0,z:0}]);h.up('ArrowLeft');h.emit('ArrowLeft');assert.equal(h.control.poll()[1].x,-1);});

test('physical auto-repeat after a mode change stays blocked until key release',()=>{let solo=false;const h=harness(()=>solo);h.emit('ArrowUp');solo=true;h.control.poll();h.emit('ArrowUp',{repeat:true});assert.deepEqual(h.control.poll()[0],{x:0,z:0});h.up('ArrowUp');h.emit('ArrowUp');assert.equal(h.control.poll()[0].z,1);});

for(const key of ['Enter','Space'])test(`native utility ${key} keeps browser activation and clears gameplay ownership`,()=>{
 let native=false;const h=harness(false,()=>native?'native':false);h.emit('KeyW');h.emit('ArrowUp');native=true;
 const event=h.emit(key);assert.equal(event.defaultPrevented,false);
 assert.deepEqual(h.calls,[]);assert.deepEqual(h.control.poll(),[{x:0,z:0},{x:0,z:0}]);
 h.up(key);assert.deepEqual(h.calls,[]);
});
test('native route neither synthesizes a click nor falls through to co-op interaction',()=>{
 let activations=0;const h=harness(false,()=>{activations++;return 'native';});
 const e=h.emit('Enter');assert.equal(activations,1);assert.equal(e.defaultPrevented,false);assert.deepEqual(h.calls,[]);
});
test('file chooser has explicit open/change/cancel/error lifecycle and native activation path',()=>{
 const s=readFileSync('src/main.ts','utf8');assert.match(s,/filePickerOpen/);const picker=readFileSync('src/save-import.ts','utf8');assert.match(s,/bindSaveImport/);assert.match(picker,/input\.click\(\)/);assert.doesNotMatch(picker,/\.showPicker\(/);
 assert.match(picker,/set\('open'\)/);assert.match(picker,/input.addEventListener\('cancel',cancelled\)/);assert.match(picker,/activation-error/);assert.match(picker,/read-error/);
 assert.match(s,/return repeat\?true:'native'/);assert.match(s,/filePickerOpen=value/);
});
