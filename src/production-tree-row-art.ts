/** Authored variation for the existing sixteen 600 AD oak billboards. The actual
 * source texture/UV/palette and planted bottom edge stay intact. No held home,
 * canopy-atlas (N), gameplay positions or collision/navigation are involved. */
export const TREE_ROW_ART=Object.freeze({id:'vq04o-600-oak-row-silhouettes',approved:false,maxRoots:2,maxTrees:16,maxGeometryPayloadBytes:2432});
export type TreeRow={x:number;z:number;width:number;topWidth:number;height:number;lean:number};
export const TREE_ROWS:Readonly<Record<string,readonly TreeRow[]>>=Object.freeze({
 'kingdom-truce':Object.freeze([
  {x:-10,z:-7,width:3.7,topWidth:.82,height:.92,lean:-.045},
  {x:10,z:8,width:3.7,topWidth:.94,height:.96,lean:.025},
  {x:-10,z:9,width:3.7,topWidth:.76,height:.87,lean:.025},
  {x:9,z:-8,width:3.7,topWidth:.88,height:.94,lean:-.035},
 ].map(row=>Object.freeze(row))),
 'kingdom-forest':Object.freeze([
  {x:-10.5,z:-7,width:4.8,topWidth:.76,height:.87,lean:-.055},
  {x:-10.5,z:-2,width:4.8,topWidth:.91,height:.96,lean:.03},
  {x:-10.5,z:3,width:4.8,topWidth:.81,height:.91,lean:-.015},
  {x:-10.5,z:8,width:4.8,topWidth:.94,height:.99,lean:.02},
  {x:10.5,z:-7,width:4.8,topWidth:.90,height:.95,lean:.025},
  {x:10.5,z:-2,width:4.8,topWidth:.77,height:.86,lean:-.035},
  {x:10.5,z:3,width:4.8,topWidth:.93,height:.98,lean:.025},
  {x:10.5,z:8,width:4.8,topWidth:.83,height:.92,lean:-.045},
  {x:-7,z:7,width:3.7,topWidth:.86,height:.92,lean:.04},
  {x:7,z:8,width:3.7,topWidth:.78,height:.88,lean:-.045},
  {x:-6,z:-6,width:3.7,topWidth:.92,height:.97,lean:.025},
  {x:6,z:-5,width:3.7,topWidth:.81,height:.90,lean:-.035},
 ].map(row=>Object.freeze(row))),
});
export function reshapeTreeRow(owner:string,x:number,z:number,positions:readonly number[]):number[]|null{
 const row=(Object.hasOwn(TREE_ROWS,owner)?TREE_ROWS[owner]:undefined)?.find(r=>r.x===x&&r.z===z);if(!row)return null;
 const w=row.width,h=w*1.25;
 if(positions.length!==12||!positions.every(Number.isFinite))throw new RangeError('Original oak plane required');
 const corners=new Set<string>();
 for(let i=0;i<12;i+=3){const px=positions[i]!,py=positions[i+1]!,pz=positions[i+2]!;
  if(Math.abs(Math.abs(px)-w/2)>1e-6||Math.abs(Math.abs(py)-h/2)>1e-6||pz!==0)throw new RangeError('Unmodified oak plane required');
  corners.add(`${Math.sign(px)}:${Math.sign(py)}`);
 }
 if(corners.size!==4)throw new RangeError('Four distinct oak corners required');
 const out=[...positions];
 for(let i=0;i<12;i+=3)if(out[i+1]!>0){out[i]=out[i]!*row.topWidth+w*row.lean;out[i+1]=-h/2+h*row.height;}
 return out;
}
