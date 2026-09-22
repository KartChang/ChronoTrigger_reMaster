/** Authored opaque pixels for the five existing Truce planters, not new geometry.
 * Board rims, soil, stems and flower heads share a single cached 64px texture.
 * No ROM, fonts, random source, clock, network or gameplay dependency.
 */
export const PLANTER_ART=Object.freeze({id:'vq02t-truce-planters',approved:false,romPixels:false,cell:64});
export const PLANTER_SAMPLE_POINTS=[[0,0],[6,36],[17,42],[28,12],[43,15],[60,60]] as const;
export function drawVillagePlanter(c:CanvasRenderingContext2D):void{
 const rect=(color:string,x:number,y:number,w:number,h:number)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 rect('#534c35',0,0,64,64); // dark soil remains behind every leaf, fully opaque
 rect('#394b32',2,2,60,29);
 for(const [x,y] of [[4,5],[20,3],[38,6],[53,2],[8,23],[29,22],[48,24]])rect('#687443',x!,y!,7,4);
 for(const [x,y] of [[12,8],[29,5],[47,10]]){
  rect('#273b2c',x!-1,y!+3,5,21);rect('#718852',x!,y!+7,2,14);
  rect('#526d42',x!-7,y!+12,8,4);rect('#84965a',x!+2,y!+8,7,4);
  rect('#6b514a',x!-4,y!-1,10,9);rect('#ad7177',x!-3,y!,8,7);
  rect('#d8a68e',x!-1,y!-2,4,11);rect('#e2c799',x!,y!+2,2,2);
 }
 // Rim and three broad weathered boards stay readable rather than one-pixel noise.
 rect('#3f352c',0,29,64,35);rect('#b69a69',0,30,64,3);rect('#775a3e',0,33,64,3);
 for(let row=0;row<3;row++){
  const y=36+row*9;rect(row%2?'#806347':'#92744f',2,y,60,8);
  rect('#aa8a5e',3,y,57,2);rect('#604b37',7+row*6,y+5,23,1);rect('#75573d',38-row*3,y+3,16,1);
 }
 rect('#493b2e',0,35,3,29);rect('#493b2e',61,35,3,29);
 for(const x of [5,57])for(const y of [39,48,57])rect('#443c31',x,y,2,2);
}
