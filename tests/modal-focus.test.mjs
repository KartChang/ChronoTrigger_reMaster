import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {equipmentPanel} from '../.test/equipment-ui.mjs';
import * as core from '../.test/core.mjs';
import {newConduct} from '../.test/fair-conduct-data.mjs';
import {ModalFocus,nextModalTabIndex,retainPanelPosition,modalTabStops,scrollInventory} from '../.test/modal-focus.mjs';
// Minimal DOM contract double: no layout engine, browser, real input or assistive-technology certification.
class Element {
 constructor(doc,id,tagName='DIV'){Object.assign(this,{ownerDocument:doc,id,tagName,children:[],parentElement:null,inert:false,hidden:false,disabled:false,tabIndex:tagName==='BUTTON'?0:-1,dataset:{},scrollTop:0,rect:true});}
 setAttribute(name,value){this[name]=value;}
 replaceChildren(){const owned=this.contains(this.ownerDocument.activeElement);for(const c of this.children)c.parentElement=null;this.children=[];if(owned){this.ownerDocument.activeElement=this.ownerDocument.body;this.ownerDocument.emit('focusin',{});}}
 append(...children){for(const c of children){this.children.push(c);c.parentElement=this;}}
 get isConnected(){let e=this;while(e.parentElement)e=e.parentElement;return e===this.ownerDocument.body;}
 contains(other){return this===other||this.children.some(c=>c.contains(other));}
 getClientRects(){return this.rect?[{}]:[];}
 matches(s){return s===':disabled'&&this.disabled;}
 closest(s){for(let e=this;e;e=e.parentElement){if(s==='[hidden],[inert]'&&(e.hidden||e.inert))return e;if(s==='[data-focus-row]'&&e.dataset.focusRow)return e;if(s==='.inventory-dialog'&&e.scroller)return e;if(s==='.inventory-content'&&e.contentScroller)return e;}return null;}
 querySelectorAll(selector){const out=[];for(const c of this.children){if(c.tagName==='BUTTON'||c.tabIndex>=0)out.push(c);out.push(...c.querySelectorAll(selector));}return out;}
 querySelector(selector){const el=this.ownerDocument.getElementById(selector.slice(1));return el&&this.contains(el)?el:null;}
 focus(options){if(this.disabled||!this.isConnected||this.closest('[hidden],[inert]'))return;this.ownerDocument.activeElement=this;this.focusOptions=options;this.ownerDocument.emit('focusin',{});}
}
class Document {
 constructor(){this.listeners=new Map();this.body=new Element(this,'body','BODY');this.activeElement=this.body;}
 addEventListener(name,fn){const a=this.listeners.get(name)??[];a.push(fn);this.listeners.set(name,a);}
 removeEventListener(name,fn){this.listeners.set(name,(this.listeners.get(name)??[]).filter(f=>f!==fn));}
 emit(name,event){for(const fn of this.listeners.get(name)??[])fn(event);}
 createElement(tag){return new Element(this,'',tag.toUpperCase());}
 getElementById(id){const find=e=>e.id===id?e:e.children.map(find).find(Boolean);return find(this.body)??null;}
 tab(shiftKey=false,modifiers={}){const e={key:'Tab',shiftKey,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},stopPropagation(){this.stopped=true;},...modifiers};this.emit('keydown',e);return e;}
}
function setup(){const d=new Document(),world=new Element(d,'world','CANVAS'),toolbar=new Element(d,'toolbar'),save=new Element(d,'save','BUTTON'),bag=new Element(d,'bag'),close=new Element(d,'close','BUTTON'),buy=new Element(d,'buy','BUTTON'),pause=new Element(d,'pause'),resume=new Element(d,'resume','BUTTON');d.body.append(world,toolbar,bag,pause);toolbar.append(save);bag.append(close,buy);pause.append(resume);const m=new ModalFocus(d);return {d,m,world,toolbar,save,bag,close,buy,pause,resume};}
test('DOM double: active modal isolates background and wraps Tab both ways',()=>{
 const k=setup();k.m.set(k.bag,k.close);assert.equal(k.d.activeElement,k.close);assert.equal(k.world.inert,true);assert.equal(k.toolbar.inert,true);assert.equal(k.pause.inert,true);assert.equal(k.bag.inert,false);
 k.d.tab(true);assert.equal(k.d.activeElement,k.buy);k.d.tab();assert.equal(k.d.activeElement,k.close);k.d.tab();assert.equal(k.d.activeElement,k.buy);k.m.dispose();
});
test('DOM double: background focus is refused by inert while current modal stays active',()=>{const k=setup();k.m.set(k.bag,k.close);k.save.focus();assert.equal(k.d.activeElement,k.close);assert.equal(k.m.inspect().active,'bag');k.m.dispose();});
test('DOM double: focus guard restores the active overlay if focus escapes unexpectedly',()=>{const k=setup();k.m.set(k.bag,k.close);k.d.activeElement=k.d.body;k.d.emit('focusin',{});assert.equal(k.d.activeElement,k.close);k.m.dispose();});
test('DOM double: pausing over a bag restores that bag action, not the canvas or its close button',()=>{
 const k=setup();k.m.set(k.bag,k.close);k.buy.focus();k.m.set(k.pause,k.resume);assert.equal(k.d.activeElement,k.resume);assert.equal(k.bag.inert,true);
 k.m.set(k.bag,k.close);assert.equal(k.d.activeElement,k.buy);assert.equal(k.pause.inert,true);k.m.dispose();
});
test('DOM double: restoring invalid/disabled remembered action falls back safely',()=>{const k=setup();k.m.set(k.bag,k.close);k.buy.focus();k.m.set(k.pause,k.resume);k.buy.disabled=true;k.m.set(k.bag,k.close);assert.equal(k.d.activeElement,k.close);k.m.dispose();});
test('DOM double: closing all overlays clears memory; reopening starts at the specified control',()=>{const k=setup();k.m.set(k.bag,k.close);k.buy.focus();k.m.set(null);assert.equal(k.world.inert,false);k.m.set(k.bag,k.close);assert.equal(k.d.activeElement,k.close);k.m.dispose();});
test('DOM double: ordinary HUD sync does not steal focus or recreate ownership',()=>{const k=setup();k.m.set(k.bag,k.close);k.buy.focus();for(let i=0;i<100;i++)assert.equal(k.m.set(k.bag,k.close),false);assert.equal(k.d.activeElement,k.buy);k.m.dispose();});
test('DOM double: original inert values and active-modal marker are restored on close/dispose',()=>{const k=setup();k.toolbar.inert=true;k.m.set(k.bag,k.close);assert.equal(k.bag.dataset.activeModal,'true');k.m.set(null);assert.equal(k.toolbar.inert,true);assert.equal(k.world.inert,false);assert.equal(k.bag.dataset.activeModal,undefined);k.m.dispose();k.m.dispose();assert.equal(k.d.listeners.get('keydown').length,0);assert.throws(()=>k.m.set(k.bag));});
test('DOM double: dynamically added background sibling is isolated on the next HUD sync',()=>{const k=setup();k.m.set(k.bag,k.close);const external=new Element(k.d,'new','BUTTON');k.d.body.append(external);k.m.set(k.bag,k.close);assert.equal(external.inert,true);k.m.dispose();assert.equal(external.inert,false);});
test('DOM double: nested overlay isolates ancestor siblings but never its own ancestor',()=>{const k=setup(),wrapper=new Element(k.d,'wrapper'),nested=new Element(k.d,'nested'),button=new Element(k.d,'nested-close','BUTTON'),sibling=new Element(k.d,'side');k.d.body.append(wrapper);wrapper.append(nested,sibling);nested.append(button);k.m.set(nested,button);assert.equal(wrapper.inert,false);assert.equal(nested.inert,false);assert.equal(sibling.inert,true);assert.equal(k.world.inert,true);assert.equal(k.d.activeElement,button);k.m.dispose();});
test('DOM double: empty dialog has a focusable root rather than leaking Tab to background',()=>{const k=setup();k.close.disabled=true;k.buy.hidden=true;k.m.set(k.bag,k.close);assert.equal(k.d.activeElement,k.bag);k.d.tab();assert.equal(k.d.activeElement,k.bag);k.m.dispose();});
test('DOM double: hidden, disabled, detached and negative-tabindex controls are not sequential stops',()=>{const k=setup();k.m.set(k.bag,k.close);k.buy.disabled=true;const n=new Element(k.d,'n','BUTTON');n.tabIndex=-1;const h=new Element(k.d,'h','BUTTON');h.rect=false;k.bag.append(n,h);assert.deepEqual(modalTabStops(k.bag),[k.close]);k.m.dispose();});
for(const modifiers of [{ctrlKey:true},{metaKey:true},{altKey:true},{defaultPrevented:true}])test(`DOM double: browser shortcut ${JSON.stringify(modifiers)} is not intercepted`,()=>{const k=setup();k.m.set(k.bag,k.close);const e=k.d.tab(false,modifiers);assert.equal(e.stopped,undefined);assert.equal(k.d.activeElement,k.close);k.m.dispose();});
for(const [len,index,backward,expected] of [[0,0,false,-1],[2,-1,false,0],[2,-1,true,1],[2,1,false,0],[2,0,true,1],[2,5,false,0],[2,NaN,false,0]])test(`focus index ${len}/${index}/${backward} remains bounded`,()=>assert.equal(nextModalTabIndex(len,index,backward),expected));
function panel(){const k=setup(),r=new Element(k.d,'equipment-panel'),row=new Element(k.d,'equipment-shop-row-bronze-helm'),b=new Element(k.d,'sell-bronze-helm','BUTTON');k.bag.scroller=true;k.bag.scrollTop=500;k.bag.append(r);r.append(row);row.dataset.focusRow='bronze-helm';row.tabIndex=-1;row.append(b);k.m.set(k.bag,k.close);b.focus();return {...k,r,row,b};}
test('DOM double: a now-disabled trade action retains its row and scroll, never selects another purchase',()=>{const k=panel(),restore=retainPanelPosition(k.r);k.b.disabled=true;k.bag.scrollTop=0;restore();assert.equal(k.d.activeElement,k.row);assert.equal(k.row.focusOptions.preventScroll,true);assert.equal(k.bag.scrollTop,500);k.m.dispose();});
test('DOM double: still-available trade restores identical action without scrolling',()=>{const k=panel(),restore=retainPanelPosition(k.r);k.close.focus();k.bag.scrollTop=0;restore();assert.equal(k.d.activeElement,k.b);assert.equal(k.bag.scrollTop,500);k.m.dispose();});
test('DOM double: panel refresh does not steal focus from another section',()=>{const k=panel();k.close.focus();const restore=retainPanelPosition(k.r);restore();assert.equal(k.d.activeElement,k.close);k.m.dispose();});
test('DOM double: missing row/action uses readable status rather than a destructive command',()=>{const k=panel(),status=new Element(k.d,'equipment-stats','P');status.tabIndex=-1;k.r.append(status);const restore=retainPanelPosition(k.r);k.r.children=k.r.children.filter(c=>c!==k.row);k.row.parentElement=null;restore();assert.equal(k.d.activeElement,status);k.m.dispose();});
test('public overlay wiring preserves same-run picker assertions and native utility activation',()=>{
 const main=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8'),html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),css=readFileSync(new URL('../src/adventure.css',import.meta.url),'utf8');
 assert.match(main,/new ModalFocus\(document\)/);assert.match(main,/manualPause\?'pause-screen':dialogOpen\?'dialog':bagOpen\?'inventory-screen'/);assert.match(main,/return repeat\?true:'native'/);
 assert.match(main,/syncModal\(\);layoutFeedback\(\)/);assert.match(html,/aria-labelledby="pause-title"/);assert.match(html,/aria-labelledby="result-title"/);assert.match(html,/class="inventory-heading"/);
 assert.match(css,/prefers-reduced-motion:reduce/);assert.match(css,/overscroll-behavior:contain/);
 const browser=readFileSync(new URL('./equipment_browser.py',import.meta.url),'utf8');assert.match(browser,/page.expect_file_chooser\(\)/);assert.doesNotMatch(browser,/\.set_input_files\(/);
});

test('DOM double: CSS-hidden controls are not focus stops',()=>{const k=setup();k.d.defaultView={getComputedStyle:el=>({visibility:el===k.buy?'hidden':'visible'})};k.m.set(k.bag,k.close);assert.deepEqual(modalTabStops(k.bag),[k.close]);k.m.dispose();});
function realPanel(){const k=setup();k.bag.scroller=true;const root=new Element(k.d,'equipment-panel');k.bag.append(root);globalThis.document=k.d;const state=core.createState('fair');state.prologue={...state.prologue,stage:'companions',first:'marle',returned:true,accepted:true,conduct:newConduct()};Object.assign(state.players[0],{x:7.5,z:-6.3});assert.equal(core.shopAvailable(state),true);let canAct=true;const messages=[];const ui=equipmentPanel(root,()=>state,m=>messages.push(m),()=>canAct);ui.refresh();k.m.set(k.bag,k.close);return {...k,root,state,ui,messages,setCanAct:value=>canAct=value,done(){k.m.dispose();delete globalThis.document;}};}
function press(k,id){const b=k.d.getElementById(id);assert.ok(b);assert.equal(b.disabled,false);b.focus();b.onclick();}
test('DOM double using actual equipmentPanel and core: buy/equip/sell preserve funds, row focus and viewport scroll',()=>{
 const k=realPanel();try{
  k.bag.scrollTop=460;press(k,'buy-bronze-katana');assert.equal(k.state.equipment.gold,250);assert.equal(k.d.activeElement.id,'buy-bronze-katana');assert.equal(k.bag.scrollTop,460);
  press(k,'buy-bronze-mail');press(k,'buy-bronze-helm');assert.equal(k.state.equipment.gold,50);assert.equal(k.d.activeElement.id,'equipment-shop-row-bronze-helm');
  press(k,'equip-crono-bronze-katana');assert.equal(k.state.equipment.worn.crono.weapon,'bronze-katana');assert.equal(k.d.activeElement.id,'equipment-row-weapon');assert.equal(k.d.getElementById('sell-bronze-katana').disabled,true);
  press(k,'sell-bronze-helm');assert.equal(k.state.equipment.gold,90);assert.equal(k.state.equipment.owned['bronze-helm'],0);assert.equal(k.d.activeElement.id,'equipment-shop-row-bronze-helm');assert.equal(k.bag.scrollTop,460);
 }finally{k.done();}
});
test('DOM double using actual equipmentPanel: selecting a member preserves selected section rather than jumping to close',()=>{const k=realPanel();try{press(k,'equipment-member-marle');assert.equal(k.d.activeElement.id,'equipment-members');assert.ok(k.d.getElementById('equipment-stats').textContent.includes('瑪兒'));assert.equal(k.state.equipment,null);}finally{k.done();}});
test('DOM double using actual equipmentPanel: paused ownership prevents programmatic action with no partial mutation',()=>{const k=realPanel();try{k.setCanAct(false);const before=structuredClone(k.state);press(k,'buy-bronze-katana');assert.deepEqual(k.state,before);assert.equal(k.messages.length,0);}finally{k.done();}});
test('DOM double using actual equipmentPanel: ordinary refresh keeps the same DOM and active button',()=>{const k=realPanel();try{const b=k.d.getElementById('buy-bronze-katana');b.focus();for(let i=0;i<20;i++)k.ui.refresh();assert.equal(k.d.getElementById('buy-bronze-katana'),b);assert.equal(k.d.activeElement,b);}finally{k.done();}});

test('DOM double: dedicated content scrolling is retained, not the non-scrolling dialog shell',()=>{
 const k=panel(),content=new Element(k.d,'inventory-content');content.contentScroller=true;content.scrollTop=320;
 k.bag.children=k.bag.children.filter(c=>c!==k.r);k.bag.append(content);content.append(k.r);k.bag.scrollTop=0;
 const restore=retainPanelPosition(k.r);content.scrollTop=0;k.b.disabled=true;restore();
 assert.equal(content.scrollTop,320);assert.equal(k.bag.scrollTop,0);assert.equal(k.d.activeElement,k.row);k.m.dispose();
});
for(const [code,start,expected] of [['PageDown',0,170],['PageUp',400,230],['PageUp',20,0],['PageDown',760,800],['Home',400,0],['End',0,800]])test(`content ${code} scroll is bounded without moving focus: ${start}`,()=>{
 const k=setup();Object.assign(k.bag,{scrollTop:start,clientHeight:200,scrollHeight:1000});k.close.focus();
 assert.equal(scrollInventory(k.bag,code),true);assert.equal(k.bag.scrollTop,expected);assert.equal(k.d.activeElement,k.close);k.m.dispose();
});
test('non-scroll keys and a short content region do not produce negative scroll',()=>{
 const content={scrollTop:0,clientHeight:400,scrollHeight:200};assert.equal(scrollInventory(content,'Tab'),false);assert.equal(scrollInventory(content,'End'),true);assert.equal(content.scrollTop,0);
});
test('actual equipmentPanel disclosure is collapsed, labelled, reversible and never changes a save',()=>{
 const k=realPanel();try{
  const before=structuredClone(k.state),toggle=k.d.getElementById('equipment-details-toggle'),note=k.d.getElementById('equipment-notes');
  assert.equal(note.hidden,true);assert.equal(toggle['aria-expanded'],'false');assert.equal(toggle['aria-controls'],note.id);
  press(k,toggle.id);assert.equal(note.hidden,false);assert.equal(toggle['aria-expanded'],'true');assert.equal(k.d.activeElement,toggle);
  press(k,toggle.id);assert.equal(note.hidden,true);assert.deepEqual(k.state,before);assert.equal(k.messages.length,0);
 }finally{k.done();}
});
test('actual equipmentPanel keeps disclosure choice across trades/member repaint, but clears it on state replacement',()=>{
 const k=realPanel();try{
  press(k,'equipment-details-toggle');press(k,'buy-bronze-katana');assert.equal(k.d.getElementById('equipment-notes').hidden,false);
  press(k,'equipment-member-marle');assert.equal(k.d.getElementById('equipment-details-toggle')['aria-expanded'],'true');
  k.ui.reset();k.ui.refresh();assert.equal(k.d.getElementById('equipment-notes').hidden,true);
 }finally{k.done();}
});
test('paused disclosure cannot mutate presentation or game state',()=>{
 const k=realPanel();try{k.setCanAct(false);const before=structuredClone(k.state);press(k,'equipment-details-toggle');assert.equal(k.d.getElementById('equipment-notes').hidden,true);assert.deepEqual(k.state,before);}finally{k.done();}
});
test('public inventory layout separates body from chrome and routes page keys only inside the bag',()=>{
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),css=readFileSync(new URL('../src/inventory.css',import.meta.url),'utf8'),focus=readFileSync(new URL('../src/modal-focus.ts',import.meta.url),'utf8'),build=readFileSync(new URL('../scripts/build.mjs',import.meta.url),'utf8');
 assert.match(html,/id="inventory-content" class="inventory-content" role="region"/);
 assert.match(html,/<\/div><p id="inventory-feedback" role="status"/);
 assert.match(css,/\.inventory-content\{[^}]*min-height:0;overflow-y:auto/);
 assert.doesNotMatch(css,/#inventory-feedback[^}]*position:sticky/);
 assert.match(css,/#inventory-screen button,#inventory-screen #inventory-close\{min-height:44px/);
 assert.match(focus,/this\.root\.querySelector<HTMLElement>\('#inventory-content'\)/);assert.match(build,/src\/inventory\.css/);
});

test('modal page keys scroll only an owned inventory and are consumed before world input',()=>{
 const k=setup(),content=new Element(k.d,'inventory-content');k.bag.append(content);Object.assign(content,{clientHeight:200,scrollHeight:1000});k.m.set(k.bag,k.close);
 const e={key:'PageDown',preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}};
 k.d.emit('keydown',e);assert.equal(content.scrollTop,170);assert.equal(e.prevented,true);assert.equal(e.stopped,true);assert.equal(k.d.activeElement,k.close);
 k.m.set(k.pause,k.resume);const other={...e,prevented:false,stopped:false};k.d.emit('keydown',other);assert.equal(content.scrollTop,170);assert.equal(other.prevented,false);k.m.dispose();
});
test('modal page scrolling leaves browser modifier shortcuts alone',()=>{
 const k=setup(),content=new Element(k.d,'inventory-content');k.bag.append(content);Object.assign(content,{clientHeight:200,scrollHeight:1000});k.m.set(k.bag,k.close);
 const e={key:'End',ctrlKey:true,preventDefault(){this.prevented=true;},stopPropagation(){}};k.d.emit('keydown',e);assert.equal(content.scrollTop,0);assert.equal(e.prevented,undefined);k.m.dispose();
});
