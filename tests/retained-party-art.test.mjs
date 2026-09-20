import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {surface} from '../scripts/asset-export.mjs';
import {HD_ART,HD_HERO_IDS,drawHDHero} from '../.test/hd-hero-art.mjs';
test('runtime party painter is the exact saved VQ01 original redraw, not a newly enlarged or substituted asset',()=>{
 assert.equal(createHash('sha256').update(readFileSync('src/hd-hero-art.ts')).digest('hex'),'5669a62f90149d6162036190ebae9616cb76db39b8bb36ca4d60c246a65ec39a');
 assert.equal(HD_ART.id,'party-redraw-48x64-vq01');assert.equal(HD_ART.approved,false);
});
for(const hero of HD_HERO_IDS)test(`${hero}: saved side costume is narrower than frontal torso with the authored four-slot left/contact/right/contact walking cycle`,()=>{
 const width=(s,y)=>{const xs=[];for(let x=0;x<48;x++)if(s.rgba[(y*48+x)*4+3])xs.push(x);return Math.max(...xs)-Math.min(...xs)+1;};
 const images=[];for(let f=0;f<4;f++){const s=surface(48,64);drawHDHero(s.ink,hero,1,f,'walk');images.push(s.rgba.toString('hex'));}assert.equal(images[0],images[2]);assert.equal(new Set(images).size,3);
 const front=surface(48,64),side=surface(48,64);drawHDHero(front.ink,hero,0,0,'idle');drawHDHero(side.ink,hero,1,0,'idle');
 // Exact painter reuse above protects costume pixels; this excludes accidental all-front direction routing.
 assert.notDeepEqual(front.rgba,side.rgba);assert(width(side,43)<=width(front,43));
});
