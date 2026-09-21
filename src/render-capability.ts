import {FrameWindow} from './frame-window';
export type RenderMode='auto'|'quality'|'compatibility';
export type BackendHint='software'|'unverified'|'cpu';
export const RENDER_PROFILE='vq02b-browser-managed-webgl' as const;
/** Hints only. Missing/private driver information is NOT proof of a GPU. */
export function backendHint(renderer:unknown):BackendHint {
 // This exact label is owned by CpuEngine; arbitrary GPU strings stay hints only.
 if(renderer==='CPU Software Rasterizer / Canvas2D')return 'cpu';
 return typeof renderer==='string'&&/swiftshader|llvmpipe|softpipe|software rasterizer|microsoft basic render driver/i.test(renderer)?'software':'unverified';
}
export function renderMode(value:unknown):RenderMode {
 return value==='quality'||value==='compatibility'?value:'auto';
}
export const WEBGL_OPTIONS=Object.freeze({preserveDrawingBuffer:true,stencil:true,
 failIfMajorPerformanceCaveat:false,powerPreference:'default' as const});
const positive=(n:number,fallback:number)=>Number.isFinite(n)&&n>0?n:fallback;
/** Drawing-buffer density only. No camera, mesh, animation, shadow or rule changes. */
export function renderScale(mode:RenderMode,hint:BackendHint,slowLevel:number,width:number,height:number,dpr:number):number {
 const base=Math.max(1,positive(dpr,1)/1.5);
 if(mode==='quality'||(mode==='auto'&&hint!=='software'&&slowLevel===0))return base;
 const level=Math.max(0,Math.min(3,Number.isFinite(slowLevel)?Math.floor(slowLevel):0));
 const area=Math.min(16384,positive(width,1))*Math.min(16384,positive(height,1)),budget=960*720;
 return Math.max(base,1.25+level*.25,Math.sqrt(area/budget));
}
/** CPU tiers apply AFTER the fixed CPU pixel cap. Otherwise a large canvas can
 * consume every automatic tier without changing its actual drawing-buffer size. */
export function cpuRenderScale(mode:RenderMode,level:number,width:number,height:number,dpr:number):number {
 const w=positive(width,1),h=positive(height,1);
 const baseline=Math.max(renderScale(mode,'software',0,w,h,dpr),Math.sqrt(w*h/(640*480)),w/1280,h/1280);
 const tier=mode==='quality'?0:mode==='compatibility'?2:Math.max(0,Math.min(3,Number.isFinite(level)?Math.floor(level):0));
 return baseline*(1+tier*.25);
}
/** Bound memory and change resolution only after a sustained frame-budget miss.
 * Never sample paused/hidden/loading intervals; a long one-off stall is not a GPU verdict. */
export class RenderBudget {
 private samples:number[]=[];private warmup=30;private level=0;
 sample(milliseconds:number,active:boolean):boolean {
  if(!active){this.samples=[];this.warmup=30;return false;}
  if(!Number.isFinite(milliseconds)||milliseconds<=0||milliseconds>250){this.samples=[];return false;}
  if(this.warmup>0){this.warmup--;return false;}
  this.samples.push(milliseconds);if(this.samples.length<90)return false;
  const sorted=[...this.samples].sort((a,b)=>a-b),mean=this.samples.reduce((a,b)=>a+b,0)/this.samples.length;
  this.samples=[];
  if(this.level<3&&mean>45&&sorted[80]!>55){this.level++;return true;}
  return false;
 }
 reset(){this.samples=[];this.warmup=30;this.level=0;}
 inspect(){return {level:this.level,samples:this.samples.length,warmup:this.warmup};}
}
export class RenderPolicy {
 private mode:RenderMode='auto';private budget=new RenderBudget();private frames=new FrameWindow();
 constructor(readonly hint:BackendHint){}
 setMode(value:unknown){this.mode=renderMode(value);this.budget.reset();this.frames.reset();}
 sample(ms:number,active:boolean){this.frames.sample(ms,active);return this.budget.sample(ms,active&&this.mode==='auto');}
 scale(width:number,height:number,dpr:number){return this.hint==='cpu'?cpuRenderScale(this.mode,this.budget.inspect().level,width,height,dpr):renderScale(this.mode,this.hint,this.budget.inspect().level,width,height,dpr);}
 inspect(){const b=this.budget.inspect();return {profile:RENDER_PROFILE,mode:this.mode,backendHint:this.hint==='cpu'?'software':this.hint,densityPolicy:this.hint==='cpu'?'cpu-pixel-budget':'webgl-density',frames:this.frames.inspect(),
  reason:this.mode==='quality'?'user-quality':this.mode==='compatibility'?'user-compatibility':b.level?'sustained-frame-budget':this.hint==='cpu'?'cpu-pixel-budget':this.hint==='software'?'software-driver-hint':'browser-default',
  ...b,browserChoosesBackend:true,forcedSoftware:false,canvas2dFallback:false,physicalDeviceApproved:false};}
}
