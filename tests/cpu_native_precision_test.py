"""CPU command transport MODELS, not browser/device or successful save evidence."""
from copy import deepcopy
import hashlib
import json
import math
from pathlib import Path
import subprocess
import unittest
from unittest.mock import patch
import cpu_native_route as route
import cpu_native_pair as pair
from cpu_native_precision import PrecisionStall, native_driver_pulse
from cpu_native_route_test import NativePort
from native_operator_preservation import restore_i_route

ROOT = Path(__file__).resolve().parents[1]
OBSERVED = json.loads((ROOT/'tests/fixtures/ci56-quantized-pulse.json').read_text())


class QueueKeyboard:
    """Model task-boundary cost; driver timer latency is a test parameter."""
    def __init__(self, page):
        self.page=page;self.held=set();self.events=[];self.order=[];self.ms=0;self.compact=False
    def down(self,key):
        self.events.append(('down',key));self.held.add(key);self.order.append(key)
    def up(self,key):
        self.events.append(('up',key));self.held.discard(key)
        if not self.held and self.order:self.flush()
    def press(self,key,delay=0):
        self.compact=True;self.down(key);self.ms=delay;self.up(key)
    def flush(self):
        order=self.order;ms=self.ms;compact=self.compact
        self.order=[];self.ms=0;self.compact=False
        hold=math.ceil(ms*60/1000)
        if compact:
            inner=max(self.page.driver_floor,hold+self.page.driver_cost)
            durations=[inner+4,inner] if len(order)==2 else [inner]
            total=max(durations)+8
        elif len(order)==2:
            # Reproduce CI56 coarse records and its measured 0/17ms floor.
            # Extending the same task quantum through 66ms is a MODEL assumption.
            if ms<=66:durations=[12,4];total=20
            elif self.page.cycles==0:durations=[hold+10,hold+2];total=hold+17
            else:durations=[hold+11,hold+3];total=hold+18
        else:
            durations=[4 if ms<=66 else hold+3];total=durations[0]+8
        for tick in range(total):
            self.held={key for i,key in enumerate(order) if tick<durations[i]}
            self.page.step(1)
        self.held.clear();self.page.cycles+=1


class QueuePort(NativePort):
    def __init__(self,axis='z',sign=1,driver_cost=0,driver_floor=0):
        super().__init__(x=0,z=0,chapter='fair')
        self.state=deepcopy(OBSERVED['before']['state']);self.state['ticks']=0
        for p in self.state['players']:p.update(x=0,z=0);p[axis]=-3*sign
        self.keyboard=QueueKeyboard(self);self.cycles=0
        self.driver_cost=driver_cost;self.driver_floor=driver_floor
    def wait_for_timeout(self,ms):self.keyboard.ms=ms


class QuantizedTests(unittest.TestCase):
    def test_original_negative_record_has_four_tick_oscillation_and_185_of_165_ticks(self):
        t=OBSERVED;self.assertEqual(t['budget'],165)
        for p in t['pulses'][2:]:
            b=p['before']['state'];a=p['afterRelease']['state']
            self.assertAlmostEqual(abs(a['players'][0]['z']-b['players'][0]['z']),4*4/60)
            self.assertGreaterEqual(abs(a['players'][0]['z']+2),.12)
            self.assertEqual(a['ticks']-b['ticks'],20)
        self.assertEqual(t['pulses'][-1]['afterRelease']['state']['ticks']-t['before']['state']['ticks'],185)
        self.assertIn('negative',t['kind'])

    def test_split_operator_reproduces_exact_coarse_and_plateau_records(self):
        p=QueuePort();p.state=deepcopy(OBSERVED['before']['state'])
        for pulse in OBSERVED['pulses']:
            route.native_pulse(p,pulse['keys'],pulse['holdMs'])
            for i,player in enumerate(p.state['players']):
                self.assertAlmostEqual(player['z'],pulse['afterRelease']['state']['players'][i]['z'])
            self.assertEqual(p.state['ticks'],pulse['afterRelease']['state']['ticks'])
        self.assertFalse(p.keyboard.held)

    def test_without_driver_transport_model_fails_original_budget(self):
        p=QueuePort();trace=[]
        with patch.object(route,'native_driver_pulse',lambda p,k,ms,ops:route.native_pulse(p,k,ms)):
            with self.assertRaisesRegex(AssertionError,'boundary/budget'):
                p.run('z',0,True,trace)
        self.assertEqual(trace[0]['budget'],165);self.assertFalse(p.keyboard.held)

    def test_all_directions_axes_and_driver_costs_use_same_budget_and_real_release(self):
        # 2 axes x 2 signs x 3 modeled driver costs = 12, not native runs.
        for axis in ['x','z']:
            for sign in [-1,1]:
                for cost in [0,1,2]:
                    with self.subTest(axis=axis,sign=sign,cost=cost):
                        p=QueuePort(axis,sign,cost);trace=[];p.run(axis,0,True,trace)
                        t=trace[0];self.assertEqual(t['budget'],165)
                        self.assertLessEqual(p.state['ticks'],165)
                        self.assertLess(abs(p.state['players'][0][axis]),.12)
                        compact=[x for x in t['pulses'] if x['transport']=='driver-press']
                        self.assertTrue(compact);self.assertFalse(p.keyboard.held)
                        for x in compact:
                            self.assertEqual(x['driverOperations'][1]['method'],'press')
                            self.assertEqual(x['driverOperations'][1]['key'],x['keys'][-1])
                            self.assertTrue(all(o['status']=='completed' for o in x['driverOperations']))

    def test_paired_precision_keeps_both_arrivals_and_uncommanded_axes(self):
        # Force the already-arrived owner to remain untouched during a peer fix.
        for owner in [0,1]:
            for axis in ['x','z']:
                for sign in [-1,1]:
                    with self.subTest(owner=owner,axis=axis,sign=sign):
                        p=QueuePort(axis,sign);p.state['players'][0][axis]=0
                        p.state['players'][1][axis]=0;p.state['players'][owner][axis]=sign*2/15
                        before=deepcopy(p.state['players'][1-owner]);trace=[]
                        pair.move_pair_axis(p,axis,0,trace,clock=lambda:p.seconds)
                        self.assertTrue(all(abs(a[axis])<.12 for a in p.state['players']))
                        self.assertEqual(p.state['players'][1-owner],before)
                        self.assertLessEqual(p.state['ticks'],trace[0]['budget'])
                        self.assertTrue(any(x['transport']=='driver-press' for x in trace[0]['pulses']))
                        self.assertFalse(p.keyboard.held)

    def test_impossible_command_resolution_still_fails_not_projects_to_target(self):
        p=QueuePort(driver_floor=4);trace=[]
        with self.assertRaisesRegex(AssertionError,'boundary/budget'):p.run('z',0,True,trace)
        self.assertEqual(trace[0]['status'],'failed');self.assertEqual(trace[0]['budget'],165)
        self.assertFalse(p.keyboard.held)

    def test_stall_requires_two_reversing_misses_not_arrival_or_blockage(self):
        for args in [(1,.8,0),(.13,.13,0),(.13,-.1,0),(.13,-.13,250)]:
            d=PrecisionStall(.12)
            for _ in range(8):self.assertFalse(d.observe(*args))
        d=PrecisionStall(.12);self.assertFalse(d.observe(.133,-.133,0))
        self.assertTrue(d.observe(-.133,.133,17));self.assertTrue(d.active)
        d.observe(.1,0,33);self.assertTrue(d.active)

    def test_original_helper_preservation_reverses_only_declared_wires(self):
        s=(ROOT/'tests/cpu_native_route.py').read_text()
        self.assertEqual(hashlib.sha256(restore_i_route(s).encode()).hexdigest(),
                         'ac94e055c80dbc790350b6b421092e55dc542b6650b7546bb5cf95788fb72ae1')
        for old,new in [('TIMEOUT_SECONDS = 30','TIMEOUT_SECONDS = 31'),
                        ('ARRIVAL_EPSILON = .12','ARRIVAL_EPSILON = .13'),
                        ('+2)*60)', '+3)*60)'),
                        ("state['mode'] != 'explore'", "state['mode'] == 'explore'")]:
            self.assertIn(old,s)
            self.assertNotEqual(hashlib.sha256(restore_i_route(s.replace(old,new,1)).encode()).hexdigest(),
                                'ac94e055c80dbc790350b6b421092e55dc542b6650b7546bb5cf95788fb72ae1')
        with self.assertRaises(AssertionError):restore_i_route(s.replace('native_driver_pulse(page, keys, milliseconds,', 'native_driver_pulse(page, keys, 0,'))


class CoreQueuePort(QueuePort):
    """Apply MODEL key scheduling to the current core, not to a browser."""
    def __init__(self, bridge, cost):
        super().__init__(driver_cost=cost)
        self.bridge=bridge
        self.state=self.ask({'op':'init','state':OBSERVED['before']['state']})['state']
    def ask(self, request):
        self.bridge.stdin.write(json.dumps(request)+'\n');self.bridge.stdin.flush()
        result=json.loads(self.bridge.stdout.readline())
        if 'error' in result:raise AssertionError(result['error'])
        return result
    def step(self,ticks):
        self.seconds+=ticks/60
        self.state=self.ask({'op':'step','ticks':ticks,'keys':list(self.keyboard.held)})['state']


class CorePrecisionTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.bridge=subprocess.Popen(['node','tests/cpu_pair_rules_port.mjs'],cwd=ROOT,text=True,
            stdin=subprocess.PIPE,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    @classmethod
    def tearDownClass(cls):
        cls.bridge.stdin.close();cls.bridge.wait(timeout=15)
        cls.bridge.stdout.close();cls.bridge.stderr.close()
    def test_actual_ci56_state_and_existing_core_reach_original_fair_target(self):
        for cost in [0,1,2]:
            with self.subTest(cost=cost):
                p=CoreQueuePort(self.bridge,cost);trace=[];before=deepcopy(p.state)
                p.run('z',-2,True,trace)
                self.assertLess(abs(p.state['players'][0]['z']+2),.12)
                self.assertLessEqual(p.state['ticks']-before['ticks'],165)
                self.assertEqual([a['x'] for a in p.state['players']],[a['x'] for a in before['players']])
                for key in ['chapter','fair','opening','kingdom','rescue','trial','flags']:
                    self.assertEqual(p.state[key],before[key])
                self.assertFalse(p.keyboard.held)
    def test_new_paired_traces_satisfy_unchanged_owner_and_arrival_verifier(self):
        p=CoreQueuePort(self.bridge,0);trace=[]
        # Construct only a near-target unit context for independent P2 precision.
        state=deepcopy(p.state);state['players'][0]['z']=-2;state['players'][1]['z']=-2-2/15
        p.state=p.ask({'op':'init','state':state})['state']
        pair.move_pair_axis(p,'z',-2,trace,clock=lambda:p.seconds)
        js="import {checkReleasedRoute} from './scripts/cpu-adventure-evidence.mjs';let s='';for await(const c of process.stdin)s+=c;JSON.parse(s).forEach(checkReleasedRoute);"
        result=subprocess.run(['node','--input-type=module','-e',js],cwd=ROOT,input=json.dumps(trace),text=True,capture_output=True,timeout=15)
        self.assertEqual(result.returncode,0,result.stderr)


class ErrorKeyboard:
    def __init__(self,fail=None,release_fail=None):
        self.fail=fail;self.release_fail=release_fail;self.held=set();self.events=[]
    def down(self,key):
        self.held.add(key);self.events.append(('down',key))
        if self.fail==('down',key):raise RuntimeError('original down error')
    def press(self,key,delay=0):
        self.held.add(key);self.events.append(('press',key,delay))
        if self.fail==('press',key):raise RuntimeError('original press error')
        self.held.remove(key)
    def up(self,key):
        self.events.append(('up',key));self.held.discard(key)
        if key==self.release_fail:raise ValueError('cleanup error')


class DriverLifecycleTests(unittest.TestCase):
    def make(self,**kwargs):
        p=type('PagePort',(),{})();p.keyboard=ErrorKeyboard(**kwargs);return p
    def test_success_uses_one_driver_press_no_python_wait_or_duplicate_inner_up(self):
        for keys in [['w'],['ArrowUp','w'],['w','ArrowUp']]:
            p=self.make();ops=[];native_driver_pulse(p,keys,33,ops)
            expected=([('down',keys[0])] if len(keys)==2 else [])+[('press',keys[-1],33)]+([('up',keys[0])] if len(keys)==2 else [])
            self.assertEqual(p.keyboard.events,expected);self.assertFalse(p.keyboard.held)
            self.assertTrue(all(x['status']=='completed' for x in ops))
    def test_partial_down_failure_releases_attempted_key_and_preserves_error(self):
        p=self.make(fail=('down','ArrowUp'),release_fail='ArrowUp');ops=[]
        with self.assertRaisesRegex(RuntimeError,'original down'):native_driver_pulse(p,['ArrowUp','w'],0,ops)
        self.assertFalse(p.keyboard.held);self.assertEqual(len(ops),2)
    def test_partial_press_failure_releases_both_keys_and_preserves_original_error(self):
        for key in ['w','ArrowUp']:
            p=self.make(fail=('press','w'),release_fail=key);ops=[]
            with self.assertRaisesRegex(RuntimeError,'original press'):native_driver_pulse(p,['ArrowUp','w'],17,ops)
            self.assertFalse(p.keyboard.held)
            self.assertEqual(p.keyboard.events[-2:],[('up','w'),('up','ArrowUp')])
            self.assertEqual(ops[1]['status'],'failed')
    def test_successful_press_does_not_swallow_outer_release_error(self):
        p=self.make(release_fail='ArrowUp');ops=[]
        with self.assertRaisesRegex(ValueError,'cleanup'):native_driver_pulse(p,['ArrowUp','w'],0,ops)
        self.assertFalse(p.keyboard.held);self.assertEqual(ops[-1]['status'],'failed')
    def test_invalid_pulse_is_rejected_before_any_native_command(self):
        for keys,ms in [([],0),(['x'],0),(['w','w'],0),(['w'],251),(['w'],-1),(['w'],float('nan')),(['w'],True),(['w'],'17')]:
            p=self.make()
            with self.subTest(keys=keys,ms=ms),self.assertRaises(ValueError):native_driver_pulse(p,keys,ms)
            self.assertFalse(p.keyboard.events)

if __name__=='__main__':unittest.main()
