/** Read-only validation of observations embedded in the real equipment journey. */
export function assertAudioEvidence(r){
 const need=(condition,message)=>{if(!condition)throw new Error('Audio: '+message);};
 const observed=a=>a&&a.profile==='vq02a-authored-early-score'&&a.source==='live-web-audio-nodes-and-analyser'&&a.approved===false&&a.physicalAudioVerified===false&&a.originalSoundtrack===false&&a.error===null;
 const playing=a=>observed(a)&&a.enabled===true&&a.blocked===false&&a.context==='running'&&a.contextCount===1&&Number.isFinite(a.rms)&&a.rms>.00001&&Number.isSafeInteger(a.activeVoices)&&a.activeVoices>0&&a.activeVoices<=16&&a.voiceLimit===16&&Number.isFinite(a.masterGain)&&Math.abs(a.masterGain-.55)<.000001;
 const silent=a=>observed(a)&&a.activeVoices===0&&a.masterGain===0;
 need(r?.status==='passed'&&r.physicalDevice===false&&r.listeningReview===false&&r.artApproved===false,'incomplete or overstated report');
 need(Array.isArray(r.errors)&&r.errors.length===0,'errors present');
 need(observed(r.initial)&&r.initial.context==='not-created'&&r.initial.contextCount===0&&r.initial.enabled===false&&r.initial.notesStarted===0,'autoplay boundary');
 need(playing(r.playing)&&r.playing.cue==='hearth','real initial waveform missing');
 need(Array.isArray(r.holds)&&r.holds.map(h=>h.name).sort().join(',')==='dialog,inventory,pause','three real modal holds required');
 for(const h of r.holds){
  need(silent(h.observation)&&h.observation.blocked===true&&Number.isFinite(h.observation.rms)&&h.observation.rms<.000001&&h.stateUnchanged===true,'paused sound/state not held');
  need(playing(h.resumed)&&h.resumed.notesStarted>h.observation.notesStarted,'resumption missing');
 }
 const i=r.import;
 need(i?.originalJourneyImport===true&&i.result==='imported'&&observed(i.before)&&i.before.enabled===true,'native import not observed');
 need(silent(i.opened)&&i.opened.enabled===true&&i.opened.blocked===true,'chooser did not clear old voices');
 need(playing(i.after)&&i.after.cue==='fair'&&i.after.epoch>i.before.epoch&&i.after.notesStarted>i.before.notesStarted,'import kept stale transport');
 need(silent(r.muted)&&r.muted.enabled===false&&r.muted.contextCount===1&&Number.isFinite(r.muted.rms)&&r.muted.rms<.000001,'mute did not restore silence');
 return true;
}
