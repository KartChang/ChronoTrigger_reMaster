import {HD_ART} from './hd-hero-art';
/** Production conventions for this reconstruction, NOT claims about the original ROM. */
export const ART_PROFILE = Object.freeze({
 schemaVersion:1, id:'snes-reference-hd2d-r1', status:'implemented-awaiting-browser-review',
 referenceVersion:'SNES composition reference; supplied Traditional Chinese beta ROM retained privately, not extracted',
 actors:{cell:{w:HD_ART.width,h:HD_ART.height},pivot:HD_ART.pivot,padding:HD_ART.padding,worldScale:.4,fieldScale:1,sampling:'nearest'},
 camera:{projection:'orthographic',heading:'north-positive-z',height:23,back:26,
  world:{minimumHalfHeight:9,minimumHalfWidth:12},home:{minimumHalfHeight:5.5,minimumHalfWidth:7},
  court:{minimumHalfHeight:9.5,minimumHalfWidth:10.5},
  field:{minimumHalfHeight:6.2,minimumHalfWidth:8},lab:{minimumHalfHeight:8.2,minimumHalfWidth:14}},
 surfaces:{tilePixels:64,materialWorldSpan:2,nearWallHeight:.95,nearWallPolicy:'cutaway-not-camera-rotation'},
 bridge:{width:16,depth:14,deckHalfDepth:1.8,actorMargin:.25,railZ:1.75},
 animation:{clock:'simulation-ticks',fixedHz:60,tankFrameTicks:18,frames:2},
 assets:{stage:'reference-review-not-approved',romExtracted:false,externalAtlasRuntime:false},
} as const);
export function cameraHalf(chapter:string,ratio:number):number{
 const r=Number.isFinite(ratio)&&ratio>0?ratio:1;
 const c=chapter==='overworld1000'?ART_PROFILE.camera.world:chapter==='bedroom'||chapter==='home'?ART_PROFILE.camera.home:chapter==='lab'?ART_PROFILE.camera.lab:chapter==='courtroom'?ART_PROFILE.camera.court:ART_PROFILE.camera.field;
 return Math.max(c.minimumHalfHeight,c.minimumHalfWidth/r);
}
export function bridgeDeckPixels(height:number):{top:number;bottom:number}{
 if(!Number.isInteger(height)||height<1)throw new Error('Invalid surface height');
 const fraction=ART_PROFILE.bridge.deckHalfDepth/ART_PROFILE.bridge.depth;
 return {top:Math.floor(height*(.5-fraction)),bottom:Math.ceil(height*(.5+fraction))};
}
export function tankVisualFrame(ticks:number,battle:boolean):0|1{
 return battle&&Number.isFinite(ticks)&&ticks>=0?Math.floor(ticks/ART_PROFILE.animation.tankFrameTicks)%2 as 0|1:0;
}
export function materialFor(name:string):'timber'|'plaster'|'roof'|'stone'|'iron'|null{
 if(/north-wall|wall-planks|low-cutaway-wall/.test(name))return 'timber';
 if(/roof/.test(name))return 'roof';
 if(/plaster/.test(name))return 'plaster';
 if(/bars|gate|locker/.test(name))return 'iron';
 if(/wall|pillar|arch|foundation|mountain|stone|dais/.test(name))return 'stone';
 if(/beam|shelf|desk|table|chair|bed-frame|headboard|cupboard|cabinet|rostrum|stand|cot-frame/.test(name))return 'timber';
 return null;
}
