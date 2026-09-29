/** Authored low forest-edge vegetation. Integer pixels, no ROM or generated screenshot. */
export const GROVE_ART=Object.freeze({id:'vq04l-grove-understory',cell:64,variants:4,width:256,height:64,maxRoots:2,maxMeshes:32,maxTextureBytes:131072});
export type GroveSurface='fern-fronds'|'root-moss';
export function paintGroveSurface(kind:GroveSurface){
 if(kind!=='fern-fronds'&&kind!=='root-moss')throw new RangeError('Unknown grove surface');
 const width=GROVE_ART.width,height=GROVE_ART.height,rgba=new Uint8ClampedArray(width*height*4);
 const palette=['#253e32','#344d37','#4a6240','#627b48','#819754','#a3ac6a','#423a2c','#5c4c34','#7e6643','#aa8a59'].map(h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16),255]);
 for(let variant=0;variant<4;variant++){
  const dot=(x:number,y:number,c:number)=>{x=Math.round(x);y=Math.round(y);if(x<3||x>60||y<3||y>60)return;rgba.set(palette[c]!,((y*width)+variant*64+x)*4);};
  const line=(x0:number,y0:number,x1:number,y1:number,c:number)=>{const steps=Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0)));for(let i=0;i<=steps;i++){const t=steps?i/steps:0;dot(x0+(x1-x0)*t,y0+(y1-y0)*t,c);}};
  const oval=(cx:number,cy:number,rx:number,ry:number,c:number)=>{for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)dot(x,y,c);};
  if(kind==='root-moss'){
   // Broken ground silhouette rather than a rectangular decal or opaque shadow slab.
   oval(32,36,23,15,0);oval(30,33,22,13,6);
   for(let j=0;j<9;j++){const angle=j*.73+variant*.41,cx=32+Math.cos(angle)*(10+j%3*4),cy=34+Math.sin(angle)*10;oval(cx,cy,5+j%3,3+j%2,1+j%3);}
   for(const side of [-1,1])for(let j=0;j<3;j++){
    const x=32+side*(14+j*4),y=40+j*4-variant;
    line(32+side*2,27,x,y,6);line(32+side*3,29,x,y+1,7);line(32+side*3,28,x-1,y,8);
    line(x-side*5,y-4,x+side*3,y-5,7);
   }
   for(let j=0;j<29;j++){const x=13+(j*13+variant*7)%39,y=24+(j*7+variant*3)%23;if((x-32)**2/440+(y-35)**2/130<1)line(x,y,x+2,y-1,3+j%3);}
  }else{
   // Fronds fan from the same rooted base; species vary in height and leaf cadence.
   oval(32,57,15,3,0);oval(31,56,11,2,1);
   for(let stem=0;stem<7;stem++){
    const spread=stem-3,tipX=32+spread*(7-variant%2),tipY=12+Math.abs(spread)*6+variant*2;
    line(32,57,tipX,tipY,1);line(33,56,tipX+1,tipY,3);
    for(let row=2;row<9;row++){
     const t=row/10,x=32+(tipX-32)*t,y=57+(tipY-57)*t,len=(1-t)*(6+(variant===2?2:0))+1;
     for(const side of [-1,1]){
      const dx=side*len,dy=-2-variant%2;
      line(x,y,x+dx,y+dy,2);line(x,y-1,x+dx,y+dy-1,3+((row+stem+variant)%3===0?1:0));
      if(variant===2)line(x,y,x+dx*.8,y+1,2);
     }
    }
   }
   if(variant===3)for(const [x,y]of [[20,33],[39,25],[46,38]] as const){line(x,56,x,y,3);oval(x,y,2,2,5);dot(x+1,y-1,9);}
  }
 }
 return {width,height,rgba};
}
