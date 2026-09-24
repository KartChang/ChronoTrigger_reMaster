/** Deterministic Web Audio ports for UNIT tests only, never native evidence. */
export class Param {
 value=0;calls=[];
 setValueAtTime(v,t){this.calls.push(['set',v,t]);}
 linearRampToValueAtTime(v,t){this.calls.push(['ramp',v,t]);}
 cancelScheduledValues(t){this.calls.push(['cancel',t]);}
}
export class Port {
 connections=[];disconnects=0;
 connect(n){this.connections.push(n);return n;}
 disconnect(){this.disconnects++;this.connections=[];}
}
export class AudioPorts {
 state='running';currentTime=2;destination={};gains=[];oscillators=[];analysers=[];closed=0;resumes=0;reads=[];
 createGain(){const n=new Port();n.gain=new Param();this.gains.push(n);return n;}
 createAnalyser(){const n=new Port();n.fftSize=1024;n.getFloatTimeDomainData=a=>{this.reads.push(a);a.fill(.125);};this.analysers.push(n);return n;}
 createOscillator(){const n=new Port();n.frequency=new Param();n.starts=[];n.stops=[];n.start=t=>n.starts.push(t);n.stop=t=>n.stops.push(t??this.currentTime);this.oscillators.push(n);return n;}
 async close(){this.closed++;this.state='closed';}
 async resume(){this.resumes++;this.state='running';}
}
export function startAudio(SceneAudio,context=new AudioPorts()){
 const audio=new SceneAudio(()=>context),state={chapter:'fair',mode:'explore',era:'present',ticks:0};
 audio.setEnabled(true);audio.update(state,false);
 // Same-tick release of fixture music isolates effects without advancing time.
 audio.hold();audio.update(state,false);
 return {audio,context,state};
}
