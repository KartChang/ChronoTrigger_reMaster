/** Decoder fixtures only. These are not native captures or visual acceptance. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {deflateSync} from 'node:zlib';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {decodeWebglCanvasPng} from '../scripts/webgl-canvas-png.mjs';
import {decodeCanvasPng} from '../scripts/field-enemy-evidence.mjs';
const crc=bytes=>{let n=0xffffffff;for(const x of bytes){n^=x;for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;}return(n^0xffffffff)>>>0;};
const chunk=(type,body)=>{const name=Buffer.from(type),n=Buffer.alloc(4),c=Buffer.alloc(4);n.writeUInt32BE(body.length);c.writeUInt32BE(crc(Buffer.concat([name,body])));return Buffer.concat([n,name,body,c]);};
const signature=Buffer.from('89504e470d0a1a0a','hex');
const paeth=(a,b,c)=>{const v=a+b-c,x=Math.abs(v-a),y=Math.abs(v-b),z=Math.abs(v-c);return x<=y&&x<=z?a:y<=z?b:c;};
function fixture({w=9,h=7,channels=4,filter=0,depth=8,interlace=0,extraRows=0}={}){
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(w);ihdr.writeUInt32BE(h,4);ihdr[8]=depth;ihdr[9]=channels===4?6:2;ihdr[12]=interlace;
 const pixels=Buffer.alloc(w*h*channels);for(let i=0;i<pixels.length;i++)pixels[i]=(i*31+(i>>>4)*17)%256;
 const stride=w*channels,scan=Buffer.alloc((stride+1)*(h+extraRows));
 for(let y=0;y<h;y++){scan[y*(stride+1)]=filter;for(let x=0;x<stride;x++){const at=y*stride+x,a=x>=channels?pixels[at-channels]:0,b=y?pixels[at-stride]:0,c=y&&x>=channels?pixels[at-stride-channels]:0;scan[y*(stride+1)+x+1]=(pixels[at]-[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;}}
 const compressed=deflateSync(scan),parts=[chunk('IHDR',ihdr),chunk('IDAT',compressed),chunk('IEND',Buffer.alloc(0))];
 const rgba=Buffer.alloc(w*h*4);for(let i=0;i<w*h;i++){pixels.copy(rgba,i*4,i*channels,i*channels+3);rgba[i*4+3]=channels===4?pixels[i*channels+3]:255;}
 return {bytes:Buffer.concat([signature,...parts]),rgba,parts,compressed,ihdr};
}
for(const channels of [3,4])for(const filter of [0,1,2,3,4])test(`WebGL RGB/RGBA independent reconstruction channels${channels} filter${filter}`,()=>{const f=fixture({channels,filter});assert.deepEqual(decodeWebglCanvasPng(f.bytes),{width:9,height:7,rgba:f.rgba});assert.deepEqual(decodeCanvasPng(f.bytes).rgba,f.rgba);});
for(const channels of [3,4])test('native-size 960x640 supported without changing CPU pixel cap channels'+channels,()=>{const f=fixture({w:960,h:640,channels});assert.deepEqual(decodeWebglCanvasPng(f.bytes).rgba,f.rgba);assert.throws(()=>decodeCanvasPng(f.bytes),/bounded 8-bit/);});
for(const options of [{w:961,h:640},{w:1,h:1281},{w:1281,h:1},{w:640,h:481,depth:16},{depth:16},{interlace:1},{filter:5},{extraRows:1}])test('invalid or oversized native format rejected '+JSON.stringify(options),()=>{assert.throws(()=>decodeWebglCanvasPng(fixture(options).bytes));});
test('CPU original decoder source stays byte-exact',()=>{assert.equal(createHash('sha256').update(readFileSync('scripts/field-enemy-evidence.mjs')).digest('hex'),'6a45b8ff6adf2605cb33b3f34f9f5ce59408034a87430c07dcb852733a721190');});
test('CRC, truncation, trailing and invalid file input rejected',()=>{const f=fixture(),bad=Buffer.from(f.bytes);bad[bad.length-1]^=1;for(const b of [bad,f.bytes.subarray(0,-1),Buffer.concat([f.bytes,Buffer.from([0])]),Buffer.alloc(4*1024*1024+1),null,'PNG'])assert.throws(()=>decodeWebglCanvasPng(b));});
test('IHDR ownership, critical chunks, IDAT ordering and zlib stream boundary enforced',()=>{
 const f=fixture(),empty=Buffer.alloc(0),text=chunk('tEXt',Buffer.from('a\0b'));
 const sequences=[
 [f.parts[1],f.parts[0],f.parts[2]],
 [f.parts[0],f.parts[0],f.parts[1],f.parts[2]],
 [f.parts[0],chunk('ABCD',empty),f.parts[1],f.parts[2]],
 [f.parts[0],chunk('IDAT',f.compressed.subarray(0,5)),text,chunk('IDAT',f.compressed.subarray(5)),f.parts[2]],
 [f.parts[0],chunk('IDAT',Buffer.concat([f.compressed,Buffer.from([0])])),f.parts[2]],
 [f.parts[0],f.parts[2]],
 [f.parts[0],f.parts[1],chunk('IEND',Buffer.from([0]))]
 ];for(const parts of sequences)assert.throws(()=>decodeWebglCanvasPng(Buffer.concat([signature,...parts])));
 assert.deepEqual(decodeWebglCanvasPng(Buffer.concat([signature,f.parts[0],text,chunk('IDAT',f.compressed.subarray(0,5)),chunk('IDAT',f.compressed.subarray(5)),f.parts[2]])).rgba,f.rgba);
});
