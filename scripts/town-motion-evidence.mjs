import {createHash} from 'node:crypto';
const need=(ok,why)=>{if(!ok)throw Error('Town motion evidence: '+why);};
export function assertTownMotion(video,route,identity,raw){
 need(video?.schema==='chrono-native-video-v1'&&video.status==='retained'&&video.method==='public-playwright-context-video','native video identity');
 for(const k of ['sourceSha','runId','runAttempt','htmlSha256','htmlBytes'])need(video[k]===identity[k],'same session source '+k);
 need(video.closedContext===true&&video.physicalDevice===false&&video.artApproved===false&&video.audioRecorded===false&&video.frameExactAlignment===false,'honest recording scope');
 need(video.path==='native-session.webm'&&video.relativeTo==='cpu-renderer/era600'&&video.size?.width===960&&video.size?.height===844,'known raw video owner');
 need(Buffer.isBuffer(raw)&&raw.length>1024&&raw.subarray(0,4).toString('hex')==='1a45dfa3','retained WebM bytes');
 need(raw.length===video.bytes&&createHash('sha256').update(raw).digest('hex')===video.sha256,'native video bytes/hash');
 const w=route?.nativeVideoWindow,t=[video.originUs,w?.startUs,...(route?.stops??[]).map(s=>s.videoClockUs),w?.endUs,video.endUs];
 need(w?.clock==='host-monotonic-us'&&route.stops.length===4&&t.every(x=>Number.isSafeInteger(x)&&x>0),'route recording clock');
 need(t.every((x,i)=>!i||x>=t[i-1])&&video.endUs>video.originUs&&w.endUs>w.startUs,'continuous route recording interval');
 return {path:video.path,bytes:video.bytes,sha256:video.sha256};
}
