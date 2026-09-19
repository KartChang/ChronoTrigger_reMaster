/** Focus ownership for the existing overlays. No gameplay, persistence or native-picker hooks. */
const SELECTOR='button,a[href],input:not([type="hidden"]),select,textarea,[tabindex]';
export function focusUsable(el:Element|null):el is HTMLElement{
 const visibility=el?.ownerDocument.defaultView?.getComputedStyle(el).visibility;
 return visibility!=='hidden'&&visibility!=='collapse'&&!!el&&typeof (el as HTMLElement).focus==='function'&&el.isConnected&&!el.closest('[hidden],[inert]')&&!el.matches(':disabled')&&(el as HTMLElement).getClientRects().length>0;
}
export function modalTabStops(root:HTMLElement):HTMLElement[]{
 return [...root.querySelectorAll<HTMLElement>(SELECTOR)].filter(el=>el.tabIndex>=0&&focusUsable(el));
}
export function nextModalTabIndex(length:number,current:number,backward=false):number{
 if(!Number.isInteger(length)||length<1)return -1;
 if(!Number.isInteger(current)||current<0||current>=length)return backward?length-1:0;
 return (current+(backward?-1:1)+length)%length;
}
/** Only one existing overlay is interactive; pause can temporarily cover bag/dialog/result.
 * Remembered descendants restore on uncover, not on a fresh open after returning to the world.
 */
export class ModalFocus {
 private root:HTMLElement|null=null;
 private fallback:HTMLElement|null=null;
 private memory=new Map<HTMLElement,HTMLElement>();
 private originals=new Map<HTMLElement,boolean>();
 private redirecting=false;
 private disposed=false;
 private key=(event:KeyboardEvent)=>{
  if(!this.root||event.ctrlKey||event.altKey||event.metaKey||event.defaultPrevented)return;
  const content=this.root.querySelector<HTMLElement>('#inventory-content');
  if(content&&scrollInventory(content,event.key)){event.preventDefault();event.stopPropagation();return;}
  if(event.key!=='Tab')return;
  const stops=modalTabStops(this.root),index=nextModalTabIndex(stops.length,stops.indexOf(this.doc.activeElement as HTMLElement),event.shiftKey);
  event.preventDefault();event.stopPropagation();
  (index<0?this.root:stops[index]!).focus();
 };
 private focus=()=>{
  if(!this.root||this.redirecting||this.root.contains(this.doc.activeElement))return;
  this.redirecting=true;
  try{this.focusInside();}finally{this.redirecting=false;}
 };
 constructor(private doc:Document){doc.addEventListener('keydown',this.key,true);doc.addEventListener('focusin',this.focus,true);}
 private restoreInert(){for(const [el,value] of this.originals)el.inert=value;this.originals.clear();}
 private isolate(){
  if(!this.root)return;
  // Isolate siblings up the ancestor chain, including nested overlays, without inverting inherited inert.
  for(let branch:HTMLElement|null=this.root;branch&&branch!==this.doc.body;branch=branch.parentElement){
   for(const child of branch.parentElement?.children??[]){
    if(child===branch||!('inert' in child)||['SCRIPT','STYLE','LINK'].includes(child.tagName))continue;
    const el=child as HTMLElement;if(!this.originals.has(el))this.originals.set(el,el.inert);el.inert=true;
   }
  }
 }
 private focusInside(){
  if(!this.root)return;
  const remembered=this.memory.get(this.root);
  const target=focusUsable(remembered??null)&&this.root.contains(remembered!)?remembered:
   focusUsable(this.fallback)&&this.root.contains(this.fallback)?this.fallback:modalTabStops(this.root)[0]??this.root;
  target!.focus({preventScroll:true});
 }
 /** Returns whether ownership changed; ordinary HUD refreshes never steal a focused button. */
 set(root:HTMLElement|null,fallback:HTMLElement|null=null):boolean{
  if(this.disposed)throw new Error('ModalFocus disposed');
  if(this.root===root){this.fallback=fallback;this.isolate();return false;}
  if(this.root){const active=this.doc.activeElement;if(active&&this.root.contains(active)&&focusUsable(active))this.memory.set(this.root,active);delete this.root.dataset.activeModal;}
  this.restoreInert();this.root=root;this.fallback=fallback;
  if(root){root.tabIndex=-1;root.dataset.activeModal='true';this.isolate();this.focusInside();}
  else this.memory.clear();
  return true;
 }
 inspect(){return {active:this.root?.id??null,focused:this.doc.activeElement?.id??null,isolatedElements:this.originals.size};}
 dispose():void{if(this.disposed)return;this.set(null);this.doc.removeEventListener('keydown',this.key,true);this.doc.removeEventListener('focusin',this.focus,true);this.disposed=true;}
}

/** A repaint may disable the just-used gear button. Focus its stable row, not another purchase.
 * Scroll is restored without exposing a different action to an accidental repeated Enter.
 */
export function retainPanelPosition(root:HTMLElement):()=>void{
 const doc=root.ownerDocument,active=doc.activeElement;
 const owned=!!active&&root.contains(active);
 const id=owned?active!.id:null;
 const row=owned?active!.closest<HTMLElement>('[data-focus-row]')?.id:null;
 const scroller=root.closest<HTMLElement>('.inventory-content')??root.closest<HTMLElement>('.inventory-dialog'),top=scroller?.scrollTop??0;
 return ()=>{
  if(!owned)return;
  const exact=id?doc.getElementById(id):null;
  const parent=row?doc.getElementById(row):null;
  const target=focusUsable(exact)&&root.contains(exact)?exact:focusUsable(parent)&&root.contains(parent)?parent:root.querySelector<HTMLElement>('#equipment-stats');
  if(focusUsable(target))target.focus({preventScroll:true});
  if(scroller)scroller.scrollTop=top;
 };
}

/** Scroll the existing bag body without moving focus, animating or touching game state. */
export function scrollInventory(content:HTMLElement,code:string):boolean{
 if(!['PageUp','PageDown','Home','End'].includes(code))return false;
 const limit=Math.max(0,content.scrollHeight-content.clientHeight);
 const page=Math.max(1,Math.floor(content.clientHeight*.85));
 const next=code==='Home'?0:code==='End'?limit:content.scrollTop+(code==='PageUp'?-page:page);
 content.scrollTop=Math.min(limit,Math.max(0,next));
 return true;
}
