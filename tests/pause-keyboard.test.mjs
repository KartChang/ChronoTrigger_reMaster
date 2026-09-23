// Production route + real Controls on event ports. Not a browser/device success claim.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import {Controls} from '../.test/input.mjs';
import {runtimeBaseline} from './helpers/runtime-baseline.mjs';
const main=readFileSync('src/main.ts','utf8');
const edit=JSON.parse(readFileSync('tests/baselines/vq02u-declared-pause-edit.json','utf8')).files['src/main.ts'][0];
function productionRoute(source){
 const tree=ts.createSourceFile('main.ts',source,ts.ScriptTarget.Latest,true);
 const nodes=tree.statements.filter(n=>ts.isFunctionDeclaration(n)&&n.name?.text==='routeKeyboardUi');
 assert.equal(nodes.length,1,'exactly one production router');
 return ts.transpileModule(nodes[0].getText(tree),{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
}
class Element {constructor(id){this.id=id;}isContentEditable=false;getClientRects(){return [{}];}closest(){return null;}}
class Input extends Element {type='checkbox';checked=true;}
class Button extends Element {disabled=false;hidden=false;}
function harness({source=main,paused=true,solo=false}={}){
 const handlers={},checkbox=new Input('cpu-sampling'),resume=new Button('resume'),world=new Element('world');
 const elements={'cpu-sampling':checkbox,resume,world};
 const doc={activeElement:checkbox,querySelectorAll:()=>[],getElementById:id=>elements[id]};
 globalThis.window={addEventListener:(key,fn)=>{handlers[key]=fn;}};globalThis.document=doc;
 globalThis.HTMLElement=Element;globalThis.HTMLInputElement=Input;globalThis.HTMLButtonElement=Button;
 globalThis.HTMLTextAreaElement=class extends Element{};globalThis.HTMLSelectElement=class extends Element{};
 Object.defineProperty(globalThis,'navigator',{value:{getGamepads:()=>[]},configurable:true});
 const calls=[],context={document:doc,HTMLButtonElement:Button,$:id=>elements[id],started:true,manualPause:paused,
  filePickerOpen:false,dialogOpen:false,bagOpen:false,state:{mode:'explore',prologue:{choice:null},trial:{choice:null}},
  resumes:0,togglePause(){context.manualPause=!context.manualPause;context.resumes++;}};
 vm.createContext(context);new vm.Script(productionRoute(source)).runInContext(context);
 const controls=new Controls((...v)=>calls.push(v),{solo:()=>solo,routeUi:(...v)=>context.routeKeyboardUi(...v)});
 const down=(code,extra={})=>{const e={code,key:code,repeat:false,defaultPrevented:false,target:doc.activeElement,
  ctrlKey:false,metaKey:false,altKey:false,preventDefault(){this.defaultPrevented=true;},...extra};handlers.keydown(e);return e;};
 const up=code=>handlers.keyup({code,key:code});
 // This default-action port deliberately lives outside the production router.
 // Browser truth comes from the unchanged native CI journey, not this simulation.
 const space=()=>{const e=down('Space');up('Space');if(!e.defaultPrevented&&doc.activeElement===checkbox)checkbox.checked=!checkbox.checked;return e;};
 return {context,controls,doc,checkbox,resume,world,calls,down,up,space};
}
const zeros=[{x:0,z:0},{x:0,z:0}];
test('CI62 exact old router reproduces premature resume; correction keeps native checkbox Space',()=>{
 assert.equal(main.split(edit.after).length,2);
 const old=harness({source:main.replace(edit.after,edit.before)});old.space();
 assert.equal(old.context.manualPause,false);assert.equal(old.checkbox.checked,true);assert.equal(old.context.resumes,1);
 const fixed=harness();const first=fixed.space();assert.equal(first.defaultPrevented,false);
 assert.equal(fixed.checkbox.checked,false);assert.equal(fixed.context.manualPause,true);assert.equal(fixed.context.resumes,0);
 fixed.space();assert.equal(fixed.checkbox.checked,true);assert.equal(fixed.context.manualPause,true);
 assert.deepEqual(fixed.calls,[]);assert.deepEqual(fixed.controls.poll(),zeros);
});
for(const solo of [false,true])test(`checkbox native Space preserves independent input ownership solo=${solo}`,()=>{
 const h=harness({solo,paused:false});h.doc.activeElement=h.world;h.down('KeyW');h.down('ArrowRight');
 h.context.manualPause=true;h.doc.activeElement=h.checkbox;h.space();
 assert.deepEqual(h.controls.poll(),zeros);assert.deepEqual(h.calls,[]);h.up('KeyW');h.up('ArrowRight');
 h.context.manualPause=false;h.doc.activeElement=h.world;h.down('Enter');
 assert.deepEqual(h.calls,[[solo?0:1,'interact']]);
});
test('repeat Space stays native without toggling pause or synthesizing checkbox clicks',()=>{
 const h=harness();for(const repeat of [false,true,true])assert.equal(h.down('Space',{repeat}).defaultPrevented,false);
 assert.equal(h.checkbox.checked,true);assert.equal(h.context.manualPause,true);assert.equal(h.context.resumes,0);
 assert.deepEqual(h.calls,[]);h.up('Space');
});
for(const key of ['Space','Enter','KeyE','Escape'])test(`original resume control still consumes ${key} once`,()=>{
 const h=harness();h.doc.activeElement=h.resume;assert.equal(h.down(key).defaultPrevented,true);
 assert.equal(h.context.manualPause,false);assert.equal(h.context.resumes,1);assert.deepEqual(h.calls,[]);
});
for(const key of ['Enter','KeyE','Escape'])test(`checkbox ${key} preserves the existing non-Space resume shortcut`,()=>{
 const h=harness();assert.equal(h.down(key).defaultPrevented,true);assert.equal(h.context.resumes,1);assert.equal(h.checkbox.checked,true);
});
test('checkbox ownership is not applied to the world, another input, picker or inactive game',()=>{
 for(const focus of ['world','other']){const h=harness();h.doc.activeElement=focus==='world'?h.world:new Input('other');h.space();assert.equal(h.context.resumes,1);}
 const h=harness({paused:false});h.space();assert.deepEqual(h.calls,[[0,'interact']]);
 const picker=harness();picker.context.filePickerOpen=true;assert.equal(picker.down('Space').defaultPrevented,false);assert.equal(picker.context.resumes,0);
});
test('movement/battle keys remain consumed while paused and modifiers remain native',()=>{
 const h=harness();for(const key of ['KeyW','ArrowLeft','KeyJ','KeyK','Comma','Period'])assert.equal(h.down(key).defaultPrevented,true);
 assert.deepEqual(h.controls.poll(),zeros);assert.deepEqual(h.calls,[]);assert.equal(h.context.manualPause,true);
 for(const modifier of ['ctrlKey','altKey','metaKey'])assert.equal(h.down('Space',{[modifier]:true}).defaultPrevented,false);
});
test('Tab remains owned by the existing ModalFocus rather than triggering pause or interaction',()=>{
 const h=harness();assert.equal(h.context.routeKeyboardUi('Tab',false),false);
 assert.equal(h.down('Tab',{defaultPrevented:true}).defaultPrevented,true);assert.equal(h.context.manualPause,true);assert.deepEqual(h.calls,[]);
});
test('declared pause inverse rejects missing, duplicate and mutated wires without changing old hashes',()=>{
 const old=main.replace(edit.after,edit.before);assert.throws(()=>runtimeBaseline(old));
 assert.throws(()=>runtimeBaseline(main.replace(edit.after,edit.after+'\n'+edit.after)));
 assert.throws(()=>runtimeBaseline(main.replace("code==='Space'&&document.activeElement===", "code==='Enter'&&document.activeElement===")));
 const modifiedElsewhere=main.replace('if(filePickerOpen)', 'if(false&&filePickerOpen)');
 assert.notEqual(runtimeBaseline(modifiedElsewhere),runtimeBaseline(main));
 assert.equal(readFileSync('src/prologue-render.ts').length>0,true);
});
