/** Conservative homogeneous visibility. Reads current vertices, never cached bounds:
 * billboard, deformation and in-place buffer edits must not disappear offscreen. */
export function clipOutcode(x:number,y:number,z:number,w:number):number {
 if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(z)||!Number.isFinite(w))return 64;
 return (w+x<0?1:0)|(w-x<0?2:0)|(w+y<0?4:0)|(w-y<0?8:0)|(w+z<0?16:0)|(w-z<0?32:0);
}
export function outsideClipVolume(positions:ArrayLike<number>,m:ArrayLike<number>,start:number,count:number):boolean {
 if(!Number.isInteger(start)||!Number.isInteger(count)||start<0||count<1||(start+count)*3>positions.length)return false;
 let common=63;
 for(let i=start;i<start+count;i++){
  const x=positions[i*3]!,y=positions[i*3+1]!,z=positions[i*3+2]!;
  const code=clipOutcode(x*m[0]!+y*m[4]!+z*m[8]!+m[12]!,x*m[1]!+y*m[5]!+z*m[9]!+m[13]!,
   x*m[2]!+y*m[6]!+z*m[10]!+m[14]!,x*m[3]!+y*m[7]!+z*m[11]!+m[15]!);
  // Invalid input is not permission to discard a partially visible primitive.
  if(code===64)return false;
  common&=code;if(common===0)return false;
 }
 return common!==0;
}
