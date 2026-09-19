/** One native input activation per user action. No retry, synthetic chooser or save mutation.
 * `open` means requested, NOT proof that an OS picker has appeared; browser CI observes that event.
 */
type Phase='closed'|'open'|'reading'|'error';
type ImportHooks={canStart:()=>boolean;busy:(value:boolean)=>void;apply:(raw:string)=>void;notice:(message:string)=>void;released:()=>void};
export function bindSaveImport(input:HTMLInputElement,hooks:ImportHooks){
 let phase:Phase='closed',sequence=0;
 const events:{sequence:number;event:string;phase:Phase}[]=[];
 const trace=(event:string)=>{events.push({sequence:++sequence,event,phase});if(events.length>24)events.shift();input.dataset.pickerEvent=event;};
 const set=(next:Phase)=>{phase=next;input.dataset.picker=next;};
 const finish=(event:string,message:string,error=false)=>{
  input.value='';set(error?'error':'closed');trace(event);hooks.busy(false);hooks.notice(message);hooks.released();
 };
 function request():boolean{
  if(phase==='open'||phase==='reading'){trace('duplicate-request-ignored');return false;}
  if(!hooks.canStart()){trace('unavailable');hooks.notice('請在探索模式匯入存檔。');return false;}
  input.value='';set('open');trace('requested');hooks.busy(true);
  try{
   // Keep this synchronous with the original button's native click/Enter/Space/tap activation.
   // A single input.click() uses the input's normal activation; do not call showPicker and then retry.
   input.click();trace('activation-returned');return true;
  }catch(error){finish('activation-error','無法開啟檔案選擇：'+String(error instanceof Error?error.message:error),true);return false;}
 }
 async function changed():Promise<void>{
  if(phase!=='open'){trace('unexpected-change-ignored');return;}
  const file=input.files?.[0];
  if(!file){finish('empty-selection','已取消匯入，原進度不變。');return;}
  set('reading');trace('selection-received');
  try{
   if(file.size>65536)throw new Error('存檔不得超過 64 KiB。');
   const raw=await file.text();
   hooks.apply(raw);finish('imported','存檔已匯入，請再按「存檔」保存到本機。');
  }catch(error){finish('read-error','匯入失敗：'+String(error instanceof Error?error.message:error),true);}
 }
 function cancelled():void{
  // A delayed cancel must not release a file read that is already in progress.
  if(phase!=='open'){trace('late-cancel-ignored');return;}
  finish('cancelled','已取消匯入，原進度不變。');
 }
 input.addEventListener('change',()=>{void changed();});input.addEventListener('cancel',cancelled);
 return {request,inspect:()=>({phase,events:events.map(e=>({...e}))})};
}
