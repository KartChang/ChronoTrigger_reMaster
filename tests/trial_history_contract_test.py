from death_delivery_x_preservation import restore_death_delivery_x_if_declared
"""Offline contract and source preservation tests; never changes a native report."""
import copy,gzip,hashlib,inspect,json,unittest
from pathlib import Path
from trial_history_contract import assert_trial_history_contract,POLICY
from trial_enemy_motion import assert_trial_observation,assert_trial_report,capture_trial_motion
from trial_enemy_body import assert_trial_body_report
from trial_history_w_preservation import SPEC,restore_trial_history_w_source,restore_trial_history_w_if_declared
ROOT=Path(__file__).resolve().parents[1]
FIXTURE=json.loads(gzip.decompress((ROOT/'tests/fixtures/trial-motion-offline.json.gz').read_bytes()))
def sample():
    o=copy.deepcopy(FIXTURE['tankHead']);m=o['motion'];m['historyPolicy']=POLICY;m['historyEvictions']={'idle':m['historyDropped'],'superseded':0,'duplicate':0,'capacity':0};return o
class TrialHistoryContract(unittest.TestCase):
    def test_actual_offline_cells_and_causes_still_pass_original_checker(self):
        o=sample();self.assertGreater(assert_trial_observation(o)['repairActions'],0);self.assertEqual(assert_trial_history_contract(o['motion'])['contiguousTimeline'],False)
    def test_unknown_policy_rejected(self):
        m=sample()['motion'];m['historyPolicy']='unbounded'
        with self.assertRaises(AssertionError):assert_trial_history_contract(m)
    def test_bound_is_not_relaxed(self):
        for n in [23,25,48]:
            m=sample()['motion'];m['historyLimit']=n
            with self.assertRaises(AssertionError):assert_trial_history_contract(m)
    def test_25_samples_rejected(self):
        m=sample()['motion'];m['history']=[m['history'][0]]*25
        with self.assertRaises(AssertionError):assert_trial_history_contract(m)
    def test_counter_missing_or_unaccounted_rejected(self):
        for change in ['missing','mismatch','extra']:
            m=sample()['motion']
            if change=='missing':del m['historyEvictions']['capacity']
            if change=='mismatch':m['historyDropped']+=1
            if change=='extra':m['historyEvictions']['secret']=0
            with self.assertRaises(AssertionError):assert_trial_history_contract(m)
    def test_counter_types_and_negative_rejected(self):
        for bad in [-1,True,1.2,'0']:
            m=sample()['motion'];m['historyEvictions']['idle']=bad
            with self.assertRaises(AssertionError):assert_trial_history_contract(m)
    def test_future_tick_and_reordered_history_rejected(self):
        for op in ['future','reverse']:
            m=sample()['motion']
            if op=='future':m['history'][-1]['tick']=m['tick']+1
            else:m['history'].reverse()
            with self.assertRaises(AssertionError):assert_trial_history_contract(m)
    def test_cannot_relabel_texture_as_framebuffer(self):
        m=sample()['motion'];m['history'][0]['scope']='native-framebuffer'
        with self.assertRaises(AssertionError):assert_trial_history_contract(m)
    def test_contract_is_readonly(self):
        m=sample()['motion'];before=copy.deepcopy(m);assert_trial_history_contract(m);self.assertEqual(m,before)
    def test_original_repair_requirement_is_unchanged(self):
        self.assertIn("assert out['tank-repair']['repairActions']>0",inspect.getsource(assert_trial_report))
        self.assertIn("'No positive source-directed trial body action'",inspect.getsource(assert_trial_body_report))
    def test_native_capture_remains_one_read_and_no_inputs_or_waits(self):
        s=inspect.getsource(capture_trial_motion);self.assertEqual(s.count('page.evaluate('),1)
        for bad in ['.wait','.keyboard','.click','setState','localStorage']:self.assertNotIn(bad,s)
    def test_original_native_routes_and_checks_restore_exact_V(self):
        for name in ['tests/trial_browser.py','tests/rescue_browser.py','tests/field_enemy_action_browser.py','tests/trial_enemy_motion.py','tests/trial_enemy_body.py']:
            old=restore_trial_history_w_source(name,(ROOT/name).read_text());self.assertEqual(hashlib.sha256(old.encode()).hexdigest(),SPEC['originalSha256'][name])
    def test_missing_duplicate_unrelated_source_edits_rejected(self):
        for name,edits in SPEC['files'].items():
            raw=restore_death_delivery_x_if_declared(name,(ROOT/name).read_text());old=restore_trial_history_w_source(name,raw);self.assertEqual(restore_trial_history_w_if_declared(name,old),old);e=edits[0]
            for bad in [raw.replace(e['after'],'',1),raw+e['after'],raw+'\n// unrelated drift']:
                with self.assertRaises(AssertionError):restore_trial_history_w_source(name,bad)
if __name__=='__main__':unittest.main()
