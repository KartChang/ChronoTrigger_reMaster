/** Authored reconstruction slice, not a ROM map or verified original event script. */
export type Chapter = 'lab' | 'fair';
export type FairFlags = { bellHeard: boolean; gatoWon: boolean; luccaMet: boolean; telepodTested: boolean };
export const newFairFlags = (): FairFlags => ({ bellHeard: false, gatoWon: false, luccaMet: false, telepodTested: false });
export const FAIR_STALLS = [
  { id: 'cloth', x: -8, z: -5.8, w: 3.6, d: 2.6, tint: '#6378ad' },
  { id: 'candy', x: 7.5, z: -1.5, w: 3.6, d: 2.6, tint: '#ad5c63' },
  { id: 'craft', x: 8, z: 6.3, w: 3.6, d: 2.6, tint: '#69937b' },
] as const;
export const FAIR_SOLIDS = [
  ...FAIR_STALLS,
  { id: 'bell-left', x: -4.7, z: -.5, w: .35, d: .65 },
  { id: 'bell-right', x: -2.3, z: -.5, w: .35, d: .65 },
  { id: 'gato', x: -7, z: 4.8, w: 1.3, d: 1.0 },
  { id: 'tree-left', x: -11.5, z: 8, w: 1.1, d: 1.1 },
  { id: 'tree-right', x: 11.5, z: -6, w: 1.1, d: 1.1 },
] as const;
export const FAIR_POINTS = [
  { id: 'bell', label: '莉妮之鐘', x: -3.5, z: -.5 },
  { id: 'gato', label: '岡薩雷斯挑戰', x: -7, z: 3.4 },
  { id: 'lucca', label: '露卡', x: 0, z: 7.2 },
  { id: 'telepod', label: '傳送裝置', x: -2.4, z: 9 },
  { id: 'candy', label: '糖果攤', x: 7.5, z: -3.1 },
  { id: 'save', label: '試玩存檔點', x: 3.5, z: -5.5 },
] as const;
export type FairPoint = typeof FAIR_POINTS[number];
export function nearestFair(x: number, z: number): FairPoint | undefined {
  let best: FairPoint | undefined, distance = 2.05;
  for (const p of FAIR_POINTS) {
    const d = Math.hypot(p.x - x, p.z - z);
    if (d < distance) { best = p; distance = d; }
  }
  return best;
}
export function fairWalkable(x: number, z: number): boolean {
  if (!Number.isFinite(x) || !Number.isFinite(z) || x < -12.6 || x > 12.6 || z < -8.6 || z > 10.6) return false;
  return !FAIR_SOLIDS.some(o => Math.abs(x - o.x) < o.w / 2 + .25 && Math.abs(z - o.z) < o.d / 2 + .25);
}
