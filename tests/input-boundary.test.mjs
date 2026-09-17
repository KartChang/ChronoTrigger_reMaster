import test from 'node:test';
import assert from 'node:assert/strict';
import {InputBoundary} from '../.test/input-boundary.mjs';
import {createState,step,IDLE} from '../.test/core.mjs';

test('first frame in the initial scene does not invalidate held input',()=>{
 const s=createState('fair'),gate=new InputBoundary(s);
 assert.equal(gate.consume(s),false);
});
test('fair-to-lab start rebases before the first frame and held movement continues',()=>{
 const gate=new InputBoundary(createState('fair')),s=createState('lab');s.joined=true;
 gate.rebase(s);let input=[{x:1,z:0},{x:0,z:0}];
 for(let i=0;i<30;i++){step(s,input,1/60);if(gate.consume(s))input=IDLE;}
 assert.ok(s.players[0].x>.9);assert.equal(s.players[1].x,1);
});
test('without synchronous rebase the old regression is reproducible',()=>{
 const gate=new InputBoundary(createState('fair')),s=createState('lab');s.joined=true;
 let input=[{x:1,z:0},{x:0,z:0}];
 for(let i=0;i<30;i++){step(s,input,1/60);if(gate.consume(s))input=IDLE;}
 assert.ok(s.players[0].x<-.9);
});
test('load/import rebases without invalidating a subsequent new key',()=>{
 const s=createState('fair'),gate=new InputBoundary(s);
 s.chapter='canyon';s.opening.phase='canyon';gate.rebase(s);
 assert.equal(gate.consume(s),false);
});
test('a simulated story transition invalidates exactly once',()=>{
 const s=createState('fair'),gate=new InputBoundary(s);s.opening.phase='resonance';
 assert.equal(gate.consume(s),true);assert.equal(gate.consume(s),false);
});
test('kingdom transition invalidates input without requiring a different chapter',()=>{
 const s=createState('fair'),gate=new InputBoundary(s);s.kingdom.phase='missing';
 assert.equal(gate.consume(s),true);assert.equal(gate.consume(s),false);
});
test('presentation ticks and event flags do not manufacture an input boundary',()=>{
 const s=createState('fair'),gate=new InputBoundary(s);s.ticks=300;s.fair.bellHeard=true;
 assert.equal(gate.consume(s),false);
});
