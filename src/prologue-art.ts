import {overworldLand} from './prologue-data';
/** Original, deterministic pixel textures. Reference cues, never copied original pixels. */
export function drawRoomFloor(c:CanvasRenderingContext2D,w=384,h=320):void{
 c.fillStyle='#514735';c.fillRect(0,0,w,h);
 for(let x=0;x<w;x+=14){for(let y=-20;y<h;y+=48){const yy=y+((x/14)%3)*12;c.fillStyle=['#756849','#827251','#685d43','#8d7852'][(x/14+Math.floor((y+20)/48))%4]!;c.fillRect(x+1,yy,12,46);c.fillStyle='#9b8659';c.fillRect(x+2,yy,1,42);c.fillStyle='#5b513d';c.fillRect(x+8,yy+6,1,27);c.fillRect(x+3,yy+40,2,1);}}
 // A broad, uneven patch of light from the north window, not a bloom filter.
 for(let y=0;y<Math.floor(h*.7);y+=3){const left=Math.floor(w*(.42-.05*y/(h*.7))),right=Math.floor(w*(.62+.22*y/(h*.7)));c.fillStyle=y%2?'#94845a':'#9d8c60';c.fillRect(left,y,right-left,1);}
}
export function drawRegionalMap(c:CanvasRenderingContext2D,w=384,h=352):void{
 const unit=2;c.fillStyle='#193f65';c.fillRect(0,0,w,h);
 for(let py=0;py<h;py+=unit)for(let px=0;px<w;px+=unit){const x=px/w*24-12,z=11-py/h*22;const land=overworldLand(x,z);
  const n=(px*17+py*31+Math.floor(px/7)*13)%19;
  if(land){const shore=!overworldLand(x+.3,z)||!overworldLand(x-.3,z)||!overworldLand(x,z-.3)||!overworldLand(x,z+.3);c.fillStyle=shore?(n%2?'#d2c18c':'#ac9d65'):['#6c9858','#709b58','#648d4a','#8baa65'][n%4]!;}
  else c.fillStyle=n===0?'#3c7291':n<4?'#245573':'#1b486a';c.fillRect(px,py,unit,unit);
 }
 const path=(x:number,z:number,ww:number,hh:number)=>{c.fillStyle='#bea973';c.fillRect(Math.floor((x+12)/24*w),Math.floor((11-z)/22*h),Math.ceil(ww/24*w),Math.ceil(hh/22*h));};
 path(1.7,5.7,.6,10);path(-3.5,1.4,5.8,.6);path(1.7,-4.6,3,.6);
}
