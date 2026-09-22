"""Exact-P source checks and negative metadata cases, not native screenshots."""
from pathlib import Path
import hashlib,json,unittest
from copy import deepcopy
from woodland_preservation import restore_woodland_source
from story_npc_preservation import restore_story_source,EDITS
from story_npc_observation import assert_story_npcs,PROFILE
ROOT=Path(__file__).resolve().parents[1]
BASE=json.loads((ROOT/'tests/baselines/vq02q-declared-scene-edits.json').read_text())['originalSha256']
class StorySourceTests(unittest.TestCase):
    def test_inverse_matches_exact_p_source(self):
        for name in EDITS:
            with self.subTest(name=name):self.assertEqual(hashlib.sha256(restore_story_source(name,(ROOT/name).read_text()).encode()).hexdigest(),BASE[name])
    def test_every_missing_or_mutated_hunk_fails(self):
        for name,edits in EDITS.items():
            s=(ROOT/name).read_text()
            if name=='src/kingdom-render.ts': s=restore_woodland_source(name,s)
            for i,e in enumerate(edits):
                for v in ['',e['after']+'/* changed */']:
                    with self.subTest(name=name,i=i):
                        changed=s.replace(e['after'],v,1)
                        try:r=restore_story_source(name,changed,include_woodland=False)
                        except AssertionError:continue
                        self.assertNotEqual(hashlib.sha256(r.encode()).hexdigest(),BASE[name])
    def test_duplicate_fails(self):
        for name,edits in EDITS.items():
            s=(ROOT/name).read_text()
            if name=='src/kingdom-render.ts': s=restore_woodland_source(name,s)
            with self.assertRaises(AssertionError):restore_story_source(name,s+edits[0]['after'],include_woodland=False)
    def test_other_files_not_exempt(self):
        for name in ['src/main.ts','src/core.ts','src/input.ts','src/prologue-render.ts']:
            with self.assertRaises(ValueError):restore_story_source(name,'changed')
    def test_outside_delta_not_erased(self):
        for name in EDITS:self.assertNotEqual(hashlib.sha256(restore_story_source(name,(ROOT/name).read_text()+'\nextra').encode()).hexdigest(),BASE[name])
class StoryObservationTests(unittest.TestCase):
    def observation(self,chapter='cathedral',mode='explore',stage='entered'):
        return {'state':{'chapter':chapter,'mode':mode,'rescue':{'stage':stage}},'storyNpcs':{o:{'profile':PROFILE,'approved':False,'actors':[]} for o in ['kingdom','rescue']}}
    def actor(self,name,kind):return {'name':name,'kind':kind,'frame':1,'uploads':2,'cell':{'width':48,'height':64}}
    def test_real_visibility_contract_matrix(self):
        for chapter,mode,stage,owner,roles in [('truce','explore','none','kingdom',[('innkeeper','innkeeper'),('townsperson','resident')]),('castle','explore','none','kingdom',[('king','king'),('guard','guard')]),('cathedral','explore','entered','rescue',[('disguised-nun','nun')]*3),('cathedral','battle','entered','rescue',[]),('cathedral','explore','cleared','rescue',[]),('sanctum','battle','none','rescue',[]),('sanctum','explore','none','rescue',[('queen-leene','queen'),('false-chancellor','chancellor')]),('fair','explore','returned','rescue',[])]:
            with self.subTest(chapter=chapter,mode=mode):
                v=self.observation(chapter,mode,stage);v['storyNpcs'][owner]['actors']=[self.actor(*x) for x in roles];assert_story_npcs(v)
    def test_missing_wrong_hidden_claim_cell_frame_and_counter_rejected(self):
        v=self.observation();v['storyNpcs']['rescue']['actors']=[self.actor('disguised-nun','nun') for _ in range(3)]
        for key,value in [('profile','old'),('approved',True),('actors',[])]:
            c=deepcopy(v);c['storyNpcs']['rescue'][key]=value
            with self.subTest(key=key),self.assertRaises(AssertionError):assert_story_npcs(c)
        for key,value in [('kind','king'),('frame',True),('frame',4),('uploads',-1),('cell',{'width':24,'height':32})]:
            c=deepcopy(v);c['storyNpcs']['rescue']['actors'][0][key]=value
            with self.subTest(key=key,value=value),self.assertRaises(AssertionError):assert_story_npcs(c)
    def test_rescued_castle_visibility_and_offmap_leaks(self):
        v=self.observation('sanctum');v['state']['rescue'].update(yakraWon=True,chancellorFreed=True)
        v['storyNpcs']['rescue']['actors']=[self.actor('queen-leene','queen'),self.actor('true-chancellor','chancellor')];assert_story_npcs(v)
        v['state']['chapter']='fair'
        with self.assertRaises(AssertionError):assert_story_npcs(v)
if __name__=='__main__':unittest.main()
