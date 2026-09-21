/** Presentation-only samples. Simulation ticks, never render frame count or wall time. */
export const FAIR_SCENERY_MOTION = 'vq01v-tick-scenery';
export const BANNER_COUNT = 4;
const TAU = Math.PI * 2;
const phase = (ticks:number, period:number) => (ticks % period) / period * TAU;
export function sceneryTick(ticks:number):number {
  return Number.isFinite(ticks) && ticks >= 0 ? Math.min(Number.MAX_SAFE_INTEGER, Math.floor(ticks)) : 0;
}
export function bannerPose(ticks:number,index:number,reducedMotion=false):{x:number;z:number} {
  if (!Number.isInteger(index) || index < 0 || index >= BANNER_COUNT) throw new RangeError('Unknown fair banner');
  if (reducedMotion) return {x:0,z:0};
  const t=sceneryTick(ticks),offset=index*.83;
  return {x:Math.sin(phase(t,300)+offset)*.055+Math.sin(phase(t,150)+offset)*.010,
    z:Math.sin(phase(t,420)+offset)*.028};
}
export function sceneryPose(ticks:number,reducedMotion=false) {
  const t=sceneryTick(ticks);
  return {tick:t,reducedMotion,
    bell:reducedMotion?0:Math.sin(phase(t,290))*.025,
    gate:reducedMotion?0:phase(t,754),pendant:reducedMotion?0:phase(t,377),
    ring:reducedMotion?0:phase(t,2094),save:reducedMotion?0:phase(t,1508),
    robotLift:reducedMotion?0:Math.sin(phase(t,94))*.035};
}
