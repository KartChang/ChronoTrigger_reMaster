/** Unit-only camera schema, never imported by a native observer or game. */
export function townCameraFixture({width,height},ticks=0,sign){
 const portrait=width/height<.85;
 const inn=sign?{id:'inn-sign',left:sign.rect.x/width,right:(sign.rect.x+sign.rect.width)/width,top:sign.rect.y/height,bottom:(sign.rect.y+sign.rect.height)/height}:{id:'inn-sign',left:.1,right:.4,top:.5,bottom:.65};
 const rects=portrait?[{id:'p0',left:.6,right:.75,top:.25,bottom:.45},{id:'p1',left:.6,right:.75,top:.25,bottom:.45},inn]:[];
 return {profile:'vq01b-readable-actors',townProfile:portrait?'vq02x-town-portrait':null,fullScenePublished:false,
  camera:{x:0,z:0,half:portrait?8:6.2,ratio:width/height,active:portrait,portrait,bounds:{left:.045,right:.955,top:.12,bottom:.8},actors:structuredClone(rects)},
  motion:{tick:ticks,approved:false},rects};
}

/** Complete unit-only story tuple for camera oracle tests; never a native save. */
export function townPartyStateFixture(){return {chapter:'truce',joined:false,players:[{},{}],ticks:7,prologue:{stage:'legacy'},opening:{phase:'vista'},kingdom:{phase:'rescue'},rescue:{stage:'none'},trial:{stage:'none',luccaJoined:false,marleJoined:false}};}
