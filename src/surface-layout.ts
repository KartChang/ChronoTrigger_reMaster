export type SurfaceKind='fair'|'forest';
export function noise(x:number,y:number,seed=1995):number{
 let n=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^seed;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;
}
/** Top-left canvas origin, north at the top. Babylon ground UVs use update(true). */
export function surfaceWorld(px:number,py:number,width:number,height:number,kind:SurfaceKind):{x:number;z:number}{
 const w=kind==='fair'?26.8:24,h=kind==='fair'?20.8:22;
 return{x:(px/width-.5)*w,z:1+(.5-py/height)*h};
}
export function fairStone(x:number,z:number):boolean{
 const garden=Math.abs(x+3.5)<1.7&&Math.abs(z+.5)<1.4;
 const rim=Math.abs(x)>11.2||z<-8||z>10.8;
 return !garden&&!rim;
}
