import {installProductionStoryNpcs} from './production-story-npc-finish';
import {installProductionPartyArt} from './production-party-finish';
import {installCanyonHorizon} from './canyon-horizon-finish';
import {installEarlySceneFinish} from './early-scene-finish';
import {World} from './render';
import type {State,Effect} from './core';
import {installProductionActorFinish} from './production-actor-finish';
import {installProductionEnvironment} from './production-environment';
/** Application composition: the existing engine/World remains the only gameplay renderer.
 * Base-World tests remain useful component regressions; this entrypoint is also tested as a whole.
 * Every browser launch, including CPU fallback, uses this class (no test/device/quality bypass).
 */
export class ArtDirectedWorld extends World {
 private readonly storyNpcs:ReturnType<typeof installProductionStoryNpcs>;
 private readonly partyArt:ReturnType<typeof installProductionPartyArt>;
 private readonly canyonHorizon:ReturnType<typeof installCanyonHorizon>;
 private readonly earlySceneFinish:ReturnType<typeof installEarlySceneFinish>;
 private readonly actorFinish:ReturnType<typeof installProductionActorFinish>;
 private readonly productionEnvironment:ReturnType<typeof installProductionEnvironment>;
 constructor(canvas:HTMLCanvasElement){
  super(canvas);
  const scene=this.engine.scenes[0];if(!scene){this.engine.dispose();throw new Error('World scene was not constructed');}
  this.productionEnvironment=installProductionEnvironment(scene);
  this.actorFinish=installProductionActorFinish(scene);
  this.earlySceneFinish=installEarlySceneFinish(scene);
  this.partyArt=installProductionPartyArt(scene,slot=>super.inspect().partyCombat.current[slot]);
  this.canyonHorizon=installCanyonHorizon(scene);
  this.storyNpcs=installProductionStoryNpcs(scene);
 }
 override draw(state:State,dt:number,animate:boolean,frameEffects:readonly Effect[]=[]):void{this.storyNpcs.begin(state.chapter);this.actorFinish.begin(state.chapter);this.partyArt.begin(state.chapter);super.draw(state,dt,animate,frameEffects);}
 inspectProductionArt(){return {...this.productionEnvironment.inspect(),actors:this.actorFinish.inspect(),earlyScenes:this.earlySceneFinish.inspect(),party:this.partyArt.inspect(),storyNpcs:this.storyNpcs.inspect(),canyonHorizon:this.canyonHorizon.inspect()};}
 override inspect(){return {...super.inspect(),productionArt:this.inspectProductionArt()};}
}
