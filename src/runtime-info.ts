import type {FrameObservation} from './frame-window';
type BuildInfo={version:string;batch:string;sourceSha:string|null};
declare const __CHRONO_BUILD__:BuildInfo;
/** The build injects this same object into the bundle and build-meta.json. */
export const RUNTIME_BUILD:Readonly<BuildInfo>=Object.freeze(typeof __CHRONO_BUILD__==='undefined'
 ?{version:'unbundled',batch:'development',sourceSha:null}:__CHRONO_BUILD__);
export function buildLabel(info:Readonly<BuildInfo>=RUNTIME_BUILD):string {
 return `開發試玩 ${info.version} · ${info.batch} · ${info.sourceSha?info.sourceSha.slice(0,8):'本機建置'}`;
}
type RenderInfo={backend?:string;backendHint?:string;webglVersion:number;width:number;height:number;mode?:string;frames?:FrameObservation};
export function renderLabel(r:RenderInfo):{text:string;title:string} {
 const cpu=r.backend==='cpu-canvas2d',backend=cpu?'CPU／Canvas2D':`${r.backendHint==='software'?'軟體 WebGL':'WebGL'} ${r.webglVersion}`;
 const f=r.frames,measurement=!f?.active?'已暫停':!f.ready?'取樣中':`${Math.round(f.fps!)} FPS`;
 const quality=cpu?(r.mode==='quality'?'CPU 基準':r.mode==='compatibility'?'CPU 相容':'CPU 自動'):(r.mode==='quality'?'原畫質':r.mode==='compatibility'?'相容解析度':'自動');
 return {text:`${backend} · ${measurement} · ${r.width}×${r.height}`,
  title:`${quality}；${f?.ready?`最近 ${f.samples} 個活動影格，平均 ${f.meanMs!.toFixed(1)} ms，P95 ${f.p95Ms!.toFixed(1)} ms，最大 ${f.maxMs!.toFixed(1)} ms`:'尚無足夠活動影格'}。這是繪圖迴圈間隔，不是 GPU 時間或實體裝置驗收。`};
}
