/** SYNTHETIC validator input only. Not a game save, browser run or rendered proof. */
export function actorPlaybackFixture(){
 const actor=tick=>({profile:'vq02c-tick-and-distance-playback',clock:'simulation-ticks',stateMutation:false,reducedMotion:false,current:{tick,pose:'walk',frame:1,distance:.5,cycle:1.85},history:[{tick:tick-10,pose:'walk',frame:0,distance:0,cycle:1.85},{tick,pose:'walk',frame:1,distance:.5,cycle:1.85}]});
 const moves=[60,120,180].map(tick=>({tick,playback:{profile:'vq02c-tick-and-distance-playback',actors:[actor(tick),actor(tick)],cache:{profile:'vq02c-retained-pixel-span-cache',entries:8,limit:96,hits:5,additionalGpuTextures:0,spanBytes:5000}}}));
 const before={tick:190,unitOnly:true};
 return {profile:'vq02c-tick-and-distance-playback',source:'actual-reference-journey-renderer',moves,pause:{before,after:structuredClone(before),stateUnchanged:true},reduced:{poses:[{pose:'victory',frame:0},{pose:'victory',frame:0}],playback:{actors:[{reducedMotion:true},{reducedMotion:true}]}},artApproved:false,physicalDevice:false};
}
