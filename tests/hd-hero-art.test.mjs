import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {surface,png} from '../scripts/asset-export.mjs';
import {hdSheet} from '../scripts/hd-asset-export.mjs';
import {drawHDHero,HD_ART,HD_HERO_IDS} from '../.test/hd-hero-art.mjs';
import {drawReferenceHero,CLIP_MS} from '../.test/hero-art.mjs';
const poses=['idle','ready','walk','attack','cast','hurt','down','victory'];
const image=(hero,d=0,f=0,p='idle')=>{const s=surface(48,64);drawHDHero(s.ink,hero,d,f,p);return s;};
function oddDetail(s){let total=0;for(let y=0;y<64;y+=2)for(let x=0;x<48;x+=2){const colors=[];for(const [dx,dy] of [[0,0],[1,0],[0,1],[1,1]]){const pos=((y+dy)*48+x+dx)*4;colors.push(s.rgba.subarray(pos,pos+4).toString('hex'));}if(new Set(colors).size>1)total++;}return total;}
for(const hero of HD_HERO_IDS){
 test(`${hero}: native 48x64 contains new subpixel-size details, not enlarged24x32`,()=>{
  const s=image(hero);assert(oddDetail(s)>65,`${hero} lacks native-resolution details`);
  if(hero!=='frog'){const legacy=surface(24,32);drawReferenceHero(legacy.ink,hero,0,0,'idle');const up=surface(48,64);for(let y=0;y<64;y++)for(let x=0;x<48;x++){const p=(Math.floor(y/2)*24+Math.floor(x/2))*4;legacy.rgba.copy(up.rgba,(y*48+x)*4,p,p+4);}assert.notDeepEqual(s.rgba,up.rgba);assert.equal(oddDetail(up),0);}
 });
 for(const pose of poses)test(`${hero}/${pose}: four directions and frames export deterministically with alpha margin`,()=>{
  const variants=new Set();for(let d=0;d<4;d++)for(let f=0;f<4;f++){
   const s=image(hero,d,f,pose);assert.deepEqual(png(s),png(image(hero,d,f,pose)));assert(s.rgba.filter((_,i)=>i%4===3).some(v=>v===255));
   for(let x=0;x<48;x++){assert.equal(s.rgba[x*4+3],0);assert.equal(s.rgba[(63*48+x)*4+3],0);}
   for(let y=0;y<64;y++){assert.equal(s.rgba[y*48*4+3],0);assert.equal(s.rgba[(y*48+47)*4+3],0);}
   variants.add(s.rgba.toString('hex'));
  }assert(variants.size>=2,'Direction or pose collapsed to one frame');
 });
 test(`${hero}: atlas packs128 native frames without cropping/resampling and with exact runtime parity`,()=>{
  const {sheet,frames,clips}=hdSheet((c,d,f,p)=>drawHDHero(c,hero,d,f,p),HD_ART,CLIP_MS);
  assert.equal(frames.length,128);assert.equal(Object.keys(clips).length,32);assert.equal(sheet.width,416);assert.equal(sheet.height,1088);
  for(const f of frames){assert.deepEqual(f.pivot,{x:24,y:62});assert(f.rect.x+48<=sheet.width&&f.rect.y+64<=sheet.height);const [pose,dir,n]=f.name.split('.');const original=image(hero,['down','right','up','left'].indexOf(dir),+n,pose);
   for(let row=0;row<64;row++){const start=((f.rect.y+row)*sheet.width+f.rect.x)*4;assert.deepEqual(sheet.rgba.subarray(start,start+48*4),original.rgba.subarray(row*48*4,(row+1)*48*4));}
  }
 });
}
test('new silhouettes remain distinguishable and each character has directional identity',()=>{
 assert.equal(new Set(HD_HERO_IDS.map(h=>image(h).rgba.toString('hex'))).size,4);
 for(const hero of HD_HERO_IDS)assert.equal(new Set([0,1,2,3].map(d=>image(hero,d).rgba.toString('hex'))).size,4);
});
test('invalid actor/frame arguments fail rather than corrupt export',()=>{
 for(const args of [['unknown',0,0],['crono',NaN,0],['crono',4,0],['crono',0,1.2],['crono',0,-1],['crono',0,4],['crono',0,0,'missing']])assert.throws(()=>drawHDHero(surface(48,64).ink,...args));
});
test('density is used at runtime for party, meeting and recruitment, not only exports',()=>{
 for(const file of ['render','prologue-render','fair-render','kingdom-render','rescue-render','trial-render']){
  const text=readFileSync(`src/${file}.ts`,'utf8');assert.match(text,/drawHDHero/);assert.match(text,/HD_ART.width/);assert.match(text,/HD_ART.height/);
 }
 // Vendor painter is now the retained native 48x64 witness, verified against real texture sizes/foot pivots in festival-integration.
 // Keep the no-stretched-24px contract, rather than requiring the retired 24px downscale implementation.
 assert.doesNotMatch(readFileSync('src/fair-render.ts','utf8'),/tex.scaleTo\(24,32\)/);
 assert.match(readFileSync('src/fair-render.ts','utf8'),/drawWitness\(tex.getContext\(\) as CanvasRenderingContext2D,'shopper'\)/);
 const text=readFileSync('src/hd-hero-art.ts','utf8');assert.doesNotMatch(text,/drawImage\(|\.scale\(|drawReferenceHero\(/);assert.equal(HD_ART.approved,false);
});

test('same-run browser journeys observe actual native GPU texture dimensions and write review evidence',()=>{
 const helper=readFileSync('tests/hd_party_browser.py','utf8');assert.match(helper,/textures.every/);assert.match(helper,/guestTexture.width===48/);assert.match(helper,/page.screenshot/);
 for(const path of ['tests/prologue_browser.py','tests/trial_browser.py'])assert.match(readFileSync(path,'utf8'),/record_hd_party\(page,OUT/);
 assert.doesNotMatch(helper,/set_input_files|keyboard|\.click\(|snapshot\(\)\.[a-zA-Z]+\s*=/);
});
