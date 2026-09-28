/** Authored offline cells, not native gameplay evidence. */
import test from 'node:test';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {readFileSync} from 'node:fs';import {inflateSync} from 'node:zlib';
import {partyCell,decodePartyCell,partyFingerprint,PARTY_POSES} from '../.test/production-party-cell.mjs';
import {drawProductionParty,PARTY_ART} from '../.test/production-party-art.mjs';import {LEGACY_PARTY_CELLS} from '../.test/production-party-index.mjs';import {drawHDHero} from '../.test/hd-hero-art.mjs';
import {paintCanyonHorizon} from '../.test/canyon-horizon-finish.mjs';import {surface} from '../scripts/asset-export.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
for(let h=0;h<4;h++)for(let p=0;p<8;p++)test('D '+['crono','marle','lucca','frog'][h]+' '+PARTY_POSES[p]+' sixteen actual source cells and honest preservation',()=>{
 const cells=[];for(let d=0;d<4;d++)for(let f=0;f<4;f++){const code=h*128+p*16+d*4+f,meta=decodePartyCell(code),out=partyCell(code),legacy=surface(48,64);drawHDHero(legacy.ink,meta.hero,d,f,meta.pose);
  assert.equal(LEGACY_PARTY_CELLS[code],partyFingerprint(legacy.rgba));assert.deepEqual(Buffer.from(partyCell(code,true)),legacy.rgba);assert.deepEqual(out,partyCell(code));
  if(PARTY_ART.retainedPoses.includes(meta.pose))assert.deepEqual(Buffer.from(out),legacy.rgba);else{
   assert.notEqual(sha(out),sha(legacy.rgba));let count=0,bottom=0;const palette=new Set();
   for(let y=0;y<64;y++)for(let x=0;x<48;x++){const i=(y*48+x)*4;assert([0,255].includes(out[i+3]));if(out[i+3]){count++;bottom=Math.max(y,bottom);assert(x>=2&&x<=45&&y>=2&&y<=61);palette.add(out.slice(i,i+3).join(','));}}
   assert(count>450&&count<1600);assert.equal(bottom,61);assert(palette.size>=12);cells.push(sha(out));
  }
 }if(cells.length)assert(new Set(cells).size>=4);
});
test('D retains old contact/stride phase slots and all four readable directions',()=>{
 for(let h=0;h<4;h++){for(let d=0;d<4;d++){const code=h*128+PARTY_POSES.indexOf('walk')*16+d*4;assert.deepEqual(partyCell(code),partyCell(code+2));assert.notEqual(sha(partyCell(code+1)),sha(partyCell(code+3)));}assert.equal(new Set([0,1,2,3].map(d=>sha(partyCell(h*128+d*4)))).size,4);}
});
test('D cell inputs are bounded and legacy hints cannot manufacture source pixels',()=>{
 for(const code of [-1,512,.5,NaN,Infinity])assert.throws(()=>partyCell(code));assert.equal(LEGACY_PARTY_CELLS.length,512);assert.throws(()=>drawProductionParty(surface(48,64).ink,'mother',0,0));assert.throws(()=>drawProductionParty(surface(48,64).ink,'crono',4,0));assert.throws(()=>drawProductionParty(surface(48,64).ink,'crono',0,4));
});
test('D rear-bank alpha is irregular and has a clear upper margin and solid grounded base',()=>{const p=paintCanyonHorizon();assert.equal(p.width,512);assert.equal(p.height,128);assert.deepEqual(p.rgba,paintCanyonHorizon().rgba);const tops=new Set();for(let x=0;x<p.width;x++){assert.equal(p.rgba[x*4+3],0);assert.equal(p.rgba[((127*512)+x)*4+3],255);for(let y=0;y<128;y++)if(p.rgba[(y*512+x)*4+3]){tops.add(y);break;}}assert(tops.size>12);});
test('D build atlases decode exactly to runtime cells; retained rows never labelled new',async()=>{
 const {exportProductionParty}=await import('../scripts/production-party-export.mjs'),out='.test/d-export-check',m=await exportProductionParty(out);assert.equal(m.assets.length,5);assert.equal(m.redrawnCells,256);assert.equal(m.retainedCombatReactionCells,256);assert.equal(m.fullCharacterArtComplete,false);assert.equal(m.approved,false);
 for(const a of m.assets){const z=readFileSync(out+'/'+a.file);assert.equal(sha(z),a.pngSha256);let at=8;const chunks=[];while(at<z.length){const n=z.readUInt32BE(at);if(z.toString('ascii',at+4,at+8)==='IDAT')chunks.push(z.subarray(at+8,at+8+n));at+=n+12;}const rows=inflateSync(Buffer.concat(chunks)),pix=Buffer.alloc(a.width*a.height*4),stride=a.width*4;for(let y=0;y<a.height;y++){assert.equal(rows[y*(stride+1)],0);rows.copy(pix,y*stride,y*(stride+1)+1,(y+1)*(stride+1));}assert.equal(sha(pix),a.rgbaSha256);
  if(a.cells)for(const cell of a.cells){const code=['crono','marle','lucca','frog'].indexOf(cell.hero)*128+PARTY_POSES.indexOf(cell.pose)*16+cell.facing*4+cell.frame,expected=partyCell(code);assert.equal(cell.redrawn,PARTY_ART.redrawnPoses.includes(cell.pose));assert.equal(cell.rgbaSha256,sha(expected));for(let y=0;y<64;y++)assert.deepEqual(pix.subarray(((y+cell.y)*a.width+cell.x)*4,((y+cell.y)*a.width+cell.x+48)*4),Buffer.from(expected.subarray(y*48*4,(y+1)*48*4)));}
 }
});
