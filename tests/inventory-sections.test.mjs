import test from 'node:test';
import assert from 'node:assert/strict';
import {jumpInventorySection} from '../.test/modal-focus.mjs';
// Unit-only geometry port. This does not execute a browser or certify rendered layout.
function harness(){
 let contained=true,hidden=false,top=450,focused=null;
 const doc={getElementById:id=>id==='equipment-shop'?target:null};
 const target={id:'equipment-shop',ownerDocument:doc,isConnected:true,tabIndex:0,
  closest:()=>hidden?{}:null,matches:()=>false,getClientRects:()=>[{}],
  getBoundingClientRect:()=>({top}),focus(options){focused=this;this.options=options;}};
 const content={ownerDocument:doc,scrollTop:50,clientHeight:200,scrollHeight:1000,
  contains:value=>contained&&value===target,getBoundingClientRect:()=>({top:100})};
 return {content,target,focused:()=>focused,hide:()=>hidden=true,outside:()=>contained=false,top:value=>top=value};
}
test('unit section shortcut focuses a non-destructive section and scrolls only bag content',()=>{
 const h=harness();assert(jumpInventorySection(h.content,'equipment-shop'));assert.equal(h.focused(),h.target);assert.equal(h.target.tabIndex,-1);assert.equal(h.target.options.preventScroll,true);assert.equal(h.content.scrollTop,392);
});
test('unit section shortcuts refuse actions, missing, hidden or outside targets',()=>{
 const h=harness();assert.equal(jumpInventorySection(h.content,'sell-bronze-helm'),false);assert.equal(jumpInventorySection(h.content,'equipment-panel'),false);h.hide();assert.equal(jumpInventorySection(h.content,'equipment-shop'),false);
 const outside=harness();outside.outside();assert.equal(jumpInventorySection(outside.content,'equipment-shop'),false);assert.equal(outside.content.scrollTop,50);assert.equal(outside.focused(),null);
});
test('unit section shortcut clamps at real content bounds',()=>{
 const h=harness();h.top(2000);jumpInventorySection(h.content,'equipment-shop');assert.equal(h.content.scrollTop,800);h.top(-2000);jumpInventorySection(h.content,'equipment-shop');assert.equal(h.content.scrollTop,0);
});
