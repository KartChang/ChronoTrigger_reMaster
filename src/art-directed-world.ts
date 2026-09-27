import {World} from './render';
import {installProductionEnvironment} from './production-environment';
/** Application composition: the existing engine/World remains the only gameplay renderer.
 * Base-World tests remain useful component regressions; this entrypoint is also tested as a whole.
 * Every browser launch, including CPU fallback, uses this class (no test/device/quality bypass).
 */
export class ArtDirectedWorld extends World {
 private readonly productionEnvironment:ReturnType<typeof installProductionEnvironment>;
 constructor(canvas:HTMLCanvasElement){
  super(canvas);
  const scene=this.engine.scenes[0];if(!scene){this.engine.dispose();throw new Error('World scene was not constructed');}
  this.productionEnvironment=installProductionEnvironment(scene);
 }
 inspectProductionArt(){return this.productionEnvironment.inspect();}
 override inspect(){return {...super.inspect(),productionArt:this.inspectProductionArt()};}
}
