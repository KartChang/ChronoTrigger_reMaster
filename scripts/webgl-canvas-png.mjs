import {inflateSync} from 'node:zlib';
const need=(ok,why)=>{if(!ok)throw Error('WebGL canvas evidence: '+why);};
const crcTable=Array.from({length:256},(_,v)=>{for(let i=0;i<8;i++)v=v&1?0xedb88320^(v>>>1):v>>>1;return v>>>0;});
const crc=bytes=>{let v=0xffffffff;for(const b of bytes)v=crcTable[(v^b)&255]^(v>>>8);return(v^0xffffffff)>>>0;};
/** The original keyboard WebGL visit is 960x640, not a CPU 640x480 buffer.
 * This separate, bounded evidence decoder never changes the CPU decoder/policy,
 * renderer, captures, dimensions or pixels. Caller still checks exact dimensions.
 */
export function decodeWebglCanvasPng(bytes){
 need(Buffer.isBuffer(bytes)&&bytes.length>=45&&bytes.length<=4*1024*1024,'PNG byte bound');
 need(bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a','PNG signature');
 let width=0,height=0,channels=0,ended=false,afterData=false;const blocks=[];
 for(let p=8;p<bytes.length;){
  need(p+12<=bytes.length,'truncated chunk');const n=bytes.readUInt32BE(p),type=bytes.toString('ascii',p+4,p+8);
  need(/^[A-Za-z]{4}$/.test(type)&&type[2]===type[2].toUpperCase()&&p+n+12<=bytes.length,'chunk bounds/type');
  const body=bytes.subarray(p+8,p+8+n);need(crc(bytes.subarray(p+4,p+8+n))===bytes.readUInt32BE(p+8+n),'chunk CRC');
  if(type==='IHDR'){
   need(p===8&&n===13,'unique first IHDR');width=body.readUInt32BE(0);height=body.readUInt32BE(4);channels=body[9]===6?4:body[9]===2?3:0;
   need(width>0&&height>0&&width<=1280&&height<=1280&&width*height<=960*640&&body[8]===8&&channels>0&&body[10]===0&&body[11]===0&&body[12]===0,'bounded 8-bit RGB/RGBA PNG');
  }else{
   need(width>0&&height>0,'IHDR before image');
   if(type==='IDAT'){need(!afterData,'contiguous IDAT');blocks.push(body);}
   else if(type==='IEND'){need(n===0&&p+12===bytes.length&&blocks.length>0,'final IEND');ended=true;}
   else{need(type[0]===type[0].toLowerCase(),'unsupported critical chunk');if(blocks.length)afterData=true;}
  }
  p+=n+12;
 }
 need(ended&&blocks.length>0,'PNG image missing');
 const stride=width*channels,limit=(stride+1)*height,input=Buffer.concat(blocks);
 const inflated=inflateSync(input,{maxOutputLength:limit,info:true}),raw=inflated.buffer;
 need(raw.length===limit&&inflated.engine.bytesWritten===input.length,'scanline length/stream boundary');
 const decoded=Buffer.alloc(stride*height),rgba=Buffer.alloc(width*height*4);
 const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){
  const filter=raw[y*(stride+1)];need(filter<=4,'PNG filter');
  for(let x=0;x<stride;x++){
   const at=y*stride+x,a=x>=channels?decoded[at-channels]:0,b=y?decoded[at-stride]:0,c=y&&x>=channels?decoded[at-stride-channels]:0;
   decoded[at]=(raw[y*(stride+1)+1+x]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;
  }
 }
 for(let i=0;i<width*height;i++){rgba[i*4]=decoded[i*channels];rgba[i*4+1]=decoded[i*channels+1];rgba[i*4+2]=decoded[i*channels+2];rgba[i*4+3]=channels===4?decoded[i*channels+3]:255;}
 return {width,height,rgba};
}
