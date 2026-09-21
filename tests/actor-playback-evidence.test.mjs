import test from 'node:test';import assert from 'node:assert/strict';
import {assertActorPlaybackEvidence} from '../scripts/actor-playback-evidence.mjs';
import {actorPlaybackFixture} from './helpers/actor-playback-fixture.mjs';
test('synthetic fixture exercises validator only, never GPU evidence',()=>assert.equal(assertActorPlaybackEvidence(actorPlaybackFixture()),true));
for(const [name,mutate] of Object.entries({
 missing:r=>delete r.moves,partial:r=>r.moves.pop(),art:r=>r.artApproved=true,device:r=>r.physicalDevice=true,
 clock:r=>r.moves[0].playback.actors[0].clock='wall-time',tick:r=>r.moves[0].playback.actors[0].current.tick++,
 distance:r=>r.moves[0].playback.actors[0].history[1].frame=3,frozenGait:r=>r.moves[0].playback.actors[0].history.pop(),
 capacity:r=>r.moves[0].playback.cache.entries=97,noReplay:r=>r.moves[0].playback.cache.hits=0,gpu:r=>r.moves[0].playback.cache.additionalGpuTextures=1,
 pause:r=>r.pause.after.tick++,reduced:r=>r.reduced.poses[0].frame=2,
}))test(`mutated playback evidence fails closed: ${name}`,()=>{const r=actorPlaybackFixture();mutate(r);assert.throws(()=>assertActorPlaybackEvidence(r));});
