import {MOVEMENT_CODES,UI_CODES,physicalCode,editableTarget,keyboardVectors} from './keyboard-policy';
import type { Input, Slot, Vec } from './core';
export type Command='attack'|'skill'|'combo'|'interact'|'pause'|'join'|'targetPrevious'|'targetNext'|'tonic';
export type KeyboardOptions={solo?:()=>boolean;routeUi?:(code:string,repeat:boolean)=>boolean};
export class Controls {
  private keys=new Set<string>();
  private observedSolo=false;
  private ownershipReleased=new Set<string>();
  private touch=new Map<number,string>();
  private previous=new Map<string,boolean>();
  private bindings: Record<string,[Slot,Command]>={KeyU:[0,'tonic'],Backslash:[1,'tonic'],KeyQ:[0,'targetPrevious'],KeyR:[0,'targetNext'],BracketLeft:[1,'targetPrevious'],BracketRight:[1,'targetNext'],KeyJ:[0,'attack'],KeyK:[0,'skill'],KeyL:[0,'combo'],KeyE:[0,'interact'],Comma:[1,'attack'],Period:[1,'skill'],Slash:[1,'combo'],Numpad1:[1,'attack'],Numpad2:[1,'skill'],Numpad3:[1,'combo'],Enter:[1,'interact'],Escape:[0,'pause'],KeyC:[1,'join']};
  constructor(private command:(slot:Slot,command:Command)=>void,private keyboard:KeyboardOptions={}) {
    this.observedSolo=this.keyboard.solo?.()??false;
    window.addEventListener('keydown',e=>{
      if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||editableTarget(e.target))return;
      this.syncOwnership();
      const code=physicalCode(e);
      if(this.ownershipReleased.has(code)){if(e.repeat){e.preventDefault();return;}this.ownershipReleased.delete(code);}
      if(this.keyboard.routeUi?.(code,e.repeat)){e.preventDefault();this.clear();return;}
      const binding=code==='Space'?[0,'interact'] as [Slot,Command]:code==='Enter'&&this.keyboard.solo?.()?[0,'interact'] as [Slot,Command]:this.bindings[code];
      if(binding||MOVEMENT_CODES.includes(code as typeof MOVEMENT_CODES[number])||UI_CODES.includes(code as typeof UI_CODES[number]))e.preventDefault();
      this.keys.add(code);
      if(binding&&!e.repeat){this.command(...binding);this.syncOwnership();}
    });
    window.addEventListener('keyup',e=>{const code=physicalCode(e);this.keys.delete(code);this.ownershipReleased.delete(code);});
    window.addEventListener('blur',()=>this.clear());
    document.querySelectorAll<HTMLElement>('[data-move]').forEach(el=>{
      el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);this.touch.set(e.pointerId,el.dataset.move!);});
      for(const event of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(event,e=>this.touch.delete((e as PointerEvent).pointerId));
    });
  }
  /** A held P2 arrow must never turn into P1 movement when ownership changes. */
  private syncOwnership():boolean{
    const solo=this.keyboard.solo?.()??false;
    if(solo===this.observedSolo)return false;
    for(const code of this.keys)if(MOVEMENT_CODES.includes(code as typeof MOVEMENT_CODES[number]))this.ownershipReleased.add(code);
    this.observedSolo=solo;this.clear();return true;
  }
  clear():void{this.keys.clear();this.touch.clear();}
  poll():Input {
    this.syncOwnership();
    const held=(key:string)=>this.keys.has(key)||[...this.touch.values()].includes(key);
    const result:Input=keyboardVectors(held,this.keyboard.solo?.()??false);
    let pads: (Gamepad|null)[]=[];
    try{pads=Array.from(navigator.getGamepads?.()??[]);}catch{}
    ([0,1] as Slot[]).forEach(slot=>{
      const pad=pads[slot];if(!pad?.connected){for(const key of [...this.previous.keys()])if(key.startsWith(`${slot}:`))this.previous.delete(key);return;}
      const axis=(v:number|undefined)=>Math.abs(v??0)>0.18?(v??0):0;
      result[slot].x+=axis(pad.axes[0])+Number(pad.buttons[15]?.pressed??false)-Number(pad.buttons[14]?.pressed??false);
      result[slot].z+=-axis(pad.axes[1])+Number(pad.buttons[12]?.pressed??false)-Number(pad.buttons[13]?.pressed??false);
      const mapping:[number,Command][]=[[4,'targetPrevious'],[5,'targetNext'],[0,'attack'],[2,'skill'],[3,'combo'],[1,'interact'],[9,slot===1?'join':'pause']];
      for(const [index,cmd] of mapping){const key=`${slot}:${index}`,pressed=pad.buttons[index]?.pressed??false;if(pressed&&!this.previous.get(key))this.command(slot,cmd);this.previous.set(key,pressed);}
    });
    if(this.syncOwnership())return [{x:0,z:0},{x:0,z:0}];
    return result.map((v:Vec)=>{const length=Math.max(1,Math.hypot(v.x,v.z));return{x:v.x/length,z:v.z/length};}) as Input;
  }
}
