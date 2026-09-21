/** Rect-only unit port: text/curves are not rasterized. Never browser/visual evidence. */
export function cpuTestCanvas(width=64,height=48){
 let data=new Uint8ClampedArray(width*height*4);const canvas={width,height,clientWidth:width,clientHeight:height,style:{},addEventListener(){},removeEventListener(){},setAttribute(){}};
 const current=()=>{if(data.length!==canvas.width*canvas.height*4)data=new Uint8ClampedArray(canvas.width*canvas.height*4);return data;};
 const context={canvas,fillStyle:'#000000',imageSmoothingEnabled:false,clearRect(x,y,w,h){this.paint(x,y,w,h,[0,0,0,0]);},fillRect(x,y,w,h){let s=String(this.fillStyle);const rgba=s.startsWith('#')?[parseInt(s.slice(1,3),16)||0,parseInt(s.slice(3,5),16)||0,parseInt(s.slice(5,7),16)||0,255]:[0,0,0,0];this.paint(x,y,w,h,rgba);},
  paint(x,y,w,h,c){const d=current();for(let row=Math.max(0,Math.floor(y));row<Math.min(canvas.height,y+h);row++)for(let col=Math.max(0,Math.floor(x));col<Math.min(canvas.width,x+w);col++)d.set(c,(row*canvas.width+col)*4);},
  getImageData(x,y,w,h){const src=current(),out=new Uint8ClampedArray(w*h*4);for(let j=0;j<h;j++)for(let i=0;i<w;i++){if(x+i>=0&&x+i<canvas.width&&y+j>=0&&y+j<canvas.height)out.set(src.subarray(((y+j)*canvas.width+x+i)*4,((y+j)*canvas.width+x+i)*4+4),(j*w+i)*4);}return {data:out,width:w,height:h};},
  createImageData(w,h){return {data:new Uint8ClampedArray(w*h*4),width:w,height:h};},putImageData(image){data=new Uint8ClampedArray(image.data);},
  strokeRect(){},fillText(){},measureText(t){return {width:t.length*10};},beginPath(){},closePath(){},moveTo(){},lineTo(){},arc(){},quadraticCurveTo(){},stroke(){},fill(){},save(){},restore(){},translate(){},rotate(){},drawImage(){}};
 canvas.getContext=type=>type==='2d'?context:null;return {canvas,context,pixels:()=>current()};
}
