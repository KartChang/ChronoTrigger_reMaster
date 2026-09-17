import type { Input, Slot, Vec } from './core';
export type Command='attack'|'skill'|'combo'|'interact'|'pause'|'join'|'targetPrevious'|'targetNext';
export class Controls {
  private keys=new Set<string>();
  private touch=new Map<number,string>();
  private previous=new Map<string,boolean>();
  private bindings: Record<string,[Slot,Command]>={KeyQ:[0,'targetPrevious'],KeyR:[0,'targetNext'],BracketLeft:[1,'targetPrevious'],BracketRight:[1,'targetNext'],KeyJ:[0,'attack'],KeyK:[0,'skill'],KeyL:[0,'combo'],KeyE:[0,'interact'],Comma:[1,'attack'],Period:[1,'skill'],Slash:[1,'combo'],Numpad1:[1,'attack'],Numpad2:[1,'skill'],Numpad3:[1,'combo'],Enter:[1,'interact'],Escape:[0,'pause'],KeyC:[1,'join']};
  constructor(private command:(slot:Slot,command:Command)=>void) {
    window.addEventListener('keydown',e=>{
      if(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)return;
      if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Slash'].includes(e.code))e.preventDefault();
      this.keys.add(e.code);const binding=this.bindings[e.code];
      if(binding&&!e.repeat)this.command(...binding);
    });
    window.addEventListener('keyup',e=>this.keys.delete(e.code));
    window.addEventListener('blur',()=>this.clear());
    document.querySelectorAll<HTMLElement>('[data-move]').forEach(el=>{
      el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);this.touch.set(e.pointerId,el.dataset.move!);});
      for(const event of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(event,e=>this.touch.delete((e as PointerEvent).pointerId));
    });
  }
  clear():void{this.keys.clear();this.touch.clear();}
  poll():Input {
    const held=(key:string)=>this.keys.has(key)||[...this.touch.values()].includes(key);
    const result:Input=[{x:Number(held('KeyD'))-Number(held('KeyA')),z:Number(held('KeyW'))-Number(held('KeyS'))},{x:Number(held('ArrowRight'))-Number(held('ArrowLeft')),z:Number(held('ArrowUp'))-Number(held('ArrowDown'))}];
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
    return result.map((v:Vec)=>{const length=Math.max(1,Math.hypot(v.x,v.z));return{x:v.x/length,z:v.z/length};}) as Input;
  }
}
