"""Dual-owner regression/cost tests; NO browser, native acceptance or positive save."""
from copy import deepcopy
from pathlib import Path
import json
import math
import subprocess
import unittest
from cpu_native_pair import move_pair_axis
from cpu_native_route import OBSERVATION
from cpu_native_route_cost_test import ReadbackCostPort
from cpu_native_chord_test import ChordCostPort

ROOT=Path(__file__).resolve().parents[1]
FIXTURE=json.loads((ROOT/'tests/fixtures/ci55-peer-drift.json').read_text())


def active(p):
    p.state.update(joined=True,trial={'stage':'none','luccaJoined':False})
    return p


def run(p,axis='x',target=0,trace=None):
    return move_pair_axis(p,axis,target,trace,clock=lambda:p.seconds)


class PairTests(unittest.TestCase):
    def test_both_owners_converge_with_latency_in_either_direction_axis_and_scale(self):
        for chapter in ['truce','overworld1000']:
            for axis in ['x','z']:
                for target in [-7.6,0,3.2]:
                    for cost in [(0,0),(1,3),(2,5),(4,7)]:
                        with self.subTest(chapter=chapter,axis=axis,target=target,cost=cost):
                            p=active(ReadbackCostPort(chapter=chapter,costs=[cost]));trace=[]
                            result=run(p,axis,target,trace)
                            self.assertTrue(all(abs(a[axis]-target)<.12 for a in result['players']))
                            self.assertLessEqual(result['ticks'],trace[0]['budget']);self.assertFalse(p.keyboard.held)

    def test_no_new_budget_when_only_peer_needs_correction(self):
        p=active(ReadbackCostPort(x=0,z=0,costs=[(1,3)]));trace=[]
        result=run(p,trace=trace)
        self.assertEqual(trace[0]['budget'],120)
        self.assertEqual(result['players'][0]['x'],0)
        self.assertTrue(all(e[1].startswith('Arrow') for e in p.keyboard.events))

    def test_a_ready_peer_is_not_drifted_by_primary_precision(self):
        p=active(ReadbackCostPort(x=1,z=0,costs=[(1,3)]));p.state['players'][1]['x']=0
        run(p);self.assertEqual(p.state['players'][1]['x'],0)
        self.assertFalse(any(k.startswith('Arrow') for _,k in p.keyboard.events))

    def test_opposite_errors_use_independent_owners(self):
        p=active(ReadbackCostPort(x=-1,z=0,costs=[(1,3)]));p.state['players'][1]['x']=1
        trace=[];run(p,trace=trace)
        self.assertTrue(all(len(t['owners'])==1 for t in trace[0]['pulses']))

    def test_original_chord_cost_model_does_not_accumulate_peer_lag(self):
        for axis in ['x','z']:
            for target in [-6.8,3,7.6]:
                with self.subTest(axis=axis,target=target):
                    p=active(ChordCostPort(x=0,z=0,chapter='truce'));trace=[]
                    run(p,axis,target,trace)
                    self.assertTrue(all(abs(a[axis]-target)<.12 for a in p.state['players']))
                    self.assertFalse(p.keyboard.held)

    def test_timeout_and_unheld_ticks_count_against_original_limits(self):
        p=active(ReadbackCostPort(x=0,z=0,costs=[(1,150)]));trace=[]
        with self.assertRaisesRegex(AssertionError,'boundary/budget'):run(p,'x',1,trace)
        self.assertEqual(trace[0]['budget'],135);self.assertEqual(trace[0]['status'],'failed')
        p=active(ReadbackCostPort());calls=[0];trace=[]
        def clock():calls[0]+=1;return calls[0]*8
        with self.assertRaisesRegex(AssertionError,'boundary/budget'):move_pair_axis(p,'x',8,trace,clock)
        self.assertEqual(trace[0]['timeoutMs'],30000)

    def test_blockage_pause_boundary_and_lost_ownership_fail_closed(self):
        for mode in ['blocked','paused','chapter','peer']:
            with self.subTest(mode=mode):
                p=active(ReadbackCostPort());trace=[]
                if mode=='blocked':p.blocked=True
                if mode=='paused':p.paused=True
                if mode=='chapter':p.change_chapter_at=1
                if mode=='peer':p.state['trial']={'stage':'cell','luccaJoined':False}
                with self.assertRaises(AssertionError):run(p,'z',7.6,trace)
                self.assertEqual(trace[0]['status'],'failed');self.assertFalse(p.keyboard.held)

    def test_all_attempted_keys_are_released_even_on_partial_or_wait_failure(self):
        for mode in ['down','up','wait']:
            p=active(ReadbackCostPort(x=0,z=0));trace=[]
            if mode=='down':p.fail_down=p.fail_up='ArrowUp'
            if mode=='up':p.fail_up='ArrowUp'
            if mode=='wait':p.fail_wait=True
            with self.subTest(mode=mode),self.assertRaises(RuntimeError):run(p,'z',7.6,trace)
            self.assertFalse(p.keyboard.held);self.assertEqual(trace[0]['status'],'failed')
            self.assertIn(('up','w'),p.keyboard.events)

    def test_emitted_traces_pass_the_real_same_source_verifier(self):
        traces=[]
        for axis in ['x','z']:
            for sign in [-1,1]:
                p=active(ChordCostPort(x=0,z=0,chapter='truce'))
                run(p,axis,sign*7.6,traces)
        js="import {checkReleasedRoute} from './scripts/cpu-adventure-evidence.mjs';let s='';for await(const c of process.stdin)s+=c;JSON.parse(s).forEach(checkReleasedRoute);"
        r=subprocess.run(['node','--input-type=module','-e',js],cwd=ROOT,input=json.dumps(traces),text=True,capture_output=True,timeout=15)
        self.assertEqual(r.returncode,0,r.stderr)

    def test_already_arrived_pair_keeps_complete_snapshot_and_sends_no_keys(self):
        p=active(ReadbackCostPort(x=0,z=0));p.state['players'][1]['x']=.1
        before=deepcopy(p.state);trace=[];run(p,trace=trace)
        self.assertEqual(p.state,before);self.assertEqual(trace[0]['pulses'],[])
        self.assertFalse(p.keyboard.events)

    def test_trace_preserves_every_observed_boundary_without_projecting_actor_identity(self):
        p=active(ChordCostPort(x=0,z=0));trace=[];run(p,'z',7.6,trace)
        t=trace[0];previous=t['before']
        for pulse in t['pulses']:
            self.assertEqual(pulse['before'],previous)
            previous=pulse['afterRelease']
            self.assertEqual(len(previous['state']['players']),2)
            self.assertEqual(pulse['releaseKeys'],list(reversed(pulse['keys'])))
        self.assertEqual(previous,t['afterRelease'])
        self.assertTrue(any(p['owners']==[1,0] for p in t['pulses']))

    def test_invalid_targets_never_send_input(self):
        for axis,target in [('y',0),('x',float('nan')),('z',float('inf')),('x',True)]:
            p=active(ReadbackCostPort())
            with self.assertRaises(ValueError):run(p,axis,target)
            self.assertFalse(p.keyboard.events)


class RulesPort(ChordCostPort):
    """Model command latency, but use the actual core for every movement/collision tick."""
    def __init__(self, bridge, state, costs):
        super().__init__(costs=costs)
        self.bridge=bridge;self.state=self.ask({'op':'init','state':state})['state']
    def ask(self,r):
        self.bridge.stdin.write(json.dumps(r)+'\n');self.bridge.stdin.flush()
        data=json.loads(self.bridge.stdout.readline())
        if 'error' in data:raise AssertionError(data['error'])
        return data
    def step(self,ticks):
        self.seconds+=ticks/60
        self.state=self.ask({'op':'step','ticks':ticks,'keys':list(self.keyboard.held)})['state']


class ActualRulesTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bridge=subprocess.Popen(['node','tests/cpu_pair_rules_port.mjs'],cwd=ROOT,text=True,
            stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    @classmethod
    def tearDownClass(cls):
        cls.bridge.stdin.close();cls.bridge.wait(timeout=15);cls.bridge.stdout.close();cls.bridge.stderr.close()

    def port(self,state,costs):return RulesPort(self.bridge,state,costs)

    def test_ci55_actual_failure_state_is_correctly_refused_by_unchanged_rule(self):
        p=self.port(FIXTURE['failedState'],[(5,1,3)])
        result=p.ask({'op':'talk'})
        self.assertEqual(result['dialog']['title'],'等待同行者')
        self.assertEqual(result['state']['chapter'],'truce')

    def test_last_two_original_legs_close_the_peer_gap_and_allow_actual_transition(self):
        case=FIXTURE['cases'][-2]
        for costs in [[(3,1,3)],[(5,1,5)],[(7,2,6)]]:
            with self.subTest(costs=costs):
                s=deepcopy(FIXTURE['failedState']);s['ticks']=0
                for i,p in enumerate(case['players']):s['players'][i].update(p)
                p=self.port(s,costs);trace=[]
                run(p,'x',0,trace);run(p,'z',7.6,trace)
                self.assertTrue(all(abs(a['x'])<.12 and abs(a['z']-7.6)<.12 for a in p.state['players']))
                result=p.ask({'op':'talk'})
                self.assertIn('山道',result['dialog']['title']);self.assertEqual(result['state']['chapter'],'canyon')
                self.assertTrue(result['state']['rescue']['yakraWon'])

    def test_all_36_observed_leg_positions_with_actual_collision_and_three_latency_models(self):
        # Context is deliberately constructed with encounters already cleared.
        # This checks collision/ownership/convergence, NOT full story acceptance.
        for case in FIXTURE['cases']:
            for costs in [[(3,1,3)],[(5,1,5)],[(7,2,6)]]:
                with self.subTest(chapter=case['chapter'],axis=case['axis'],target=case['target'],costs=costs):
                    s=deepcopy(FIXTURE['failedState']);s.update(chapter=case['chapter'],ticks=0)
                    for i,a in enumerate(case['players']):s['players'][i].update(a)
                    p=self.port(s,costs);trace=[]
                    run(p,case['axis'],case['target'],trace)
                    self.assertTrue(all(abs(a[case['axis']]-case['target'])<.12 for a in p.state['players']))
                    self.assertLessEqual(p.state['ticks'],trace[0]['budget']);self.assertFalse(p.keyboard.held)

if __name__=='__main__':unittest.main()
