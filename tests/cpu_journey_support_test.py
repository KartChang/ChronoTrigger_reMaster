"""Unit input/file/AST ports only. These fixtures are NOT native browser evidence."""
import ast
from copy import deepcopy
import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from cpu_journey_support import CpuJourney, enabled_from_environment, controls_peer, assert_observation
from ast_fingerprint import structural_hash
from native_operator_preservation import restore_i_route
from cpu_native_route_test import NativePort
from rescue_route_test import PageDouble
from rescue_route import approach_organ

ROOT = Path(__file__).resolve().parents[1]


def observation():
    return {'state': {'chapter': 'fair', 'mode': 'explore', 'ticks': 1}, 'viewChapter': 'fair', 'paused': False,
            'renderer': {'backend': 'cpu-canvas2d', 'webglVersion': 0, 'canvas2dFallback': True, 'width': 8, 'height': 8,
                'cpu': {'profile': 'vq02d-existing-scene-cpu-raster', 'draws': 1, 'triangles': 2, 'fragments': 64,
                    'unsupportedResources': 0, 'textureMemory': {'bytes': 256, 'budget': 33554432, 'entries': 1, 'entryLimit': 512, 'mipBytes': 0},
                    'sampling': {'enabled': False, 'alphaCutouts': 'nearest'}}, 'frames': {'samples': 120}},
            'pixels': {'source': 'actual-cpu-canvas', 'context2d': True, 'webgl1': True, 'webgl2': True,
                'width': 8, 'height': 8, 'opaque': 64, 'min': 0, 'max': 255, 'sum': 999}}


class CpuJourneyTests(unittest.TestCase):
    def make(self, root, stage='rescue', enabled=True):
        return CpuJourney(stage, root, {'CHRONO_CPU_CHAIN': '1'} if enabled else {})

    def test_explicit_environment_only(self):
        self.assertFalse(enabled_from_environment({}))
        self.assertTrue(enabled_from_environment({'CHRONO_CPU_CHAIN': '1'}))
        for bad in ['0', 'yes', 'true', 'false', ' 1', None, True]:
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                enabled_from_environment({'CHRONO_CPU_CHAIN': bad})

    def test_default_adapter_has_no_io_and_returns_original_paths(self):
        with tempfile.TemporaryDirectory() as d:
            a=self.make(d, enabled=False)
            self.assertEqual(a.source('old'), 'old');self.assertEqual(a.output('old'), 'old')
            a.begin(None,None);a.observe(None,'no-op');a.finish('missing.json')
            self.assertEqual(list(Path(d).iterdir()), [])

    def test_same_run_source_paths_are_different_and_fixed(self):
        for stage, source in [('rescue','era600/cpu-kingdom-v4.json'),('trial','rescue/rescue-returned-v5.json')]:
            a=self.make('/unit',stage)
            self.assertEqual(a.source(None),Path('/unit/test-results/cpu-renderer')/source)
            self.assertEqual(a.output(None),Path('/unit/test-results/cpu-renderer')/stage)
        with self.assertRaises(ValueError):self.make('/unit','unknown')

    def test_begin_requires_actual_build_source_and_original_bytes(self):
        with tempfile.TemporaryDirectory() as d:
            a=self.make(d);source=a.source(None);source.parent.mkdir(parents=True);source.write_bytes(b'UNIT ONLY')
            dist=Path(d)/'dist';dist.mkdir();(dist/'index.html').write_bytes(b'UNIT HTML')
            (dist/'build-meta.json').write_text(json.dumps({'sourceSha':'a'*40,'bytes':9}))
            with patch.dict('os.environ',{'GITHUB_SHA':'a'*40,'GITHUB_RUN_ID':'unit','GITHUB_RUN_ATTEMPT':'1'}):
                a.begin(source,b'UNIT ONLY')
                saved=json.loads((a.out/'cpu-journey.json').read_text());self.assertEqual(saved['status'],'running')
                self.assertEqual(saved['sourceSave']['sha256'],hashlib.sha256(b'UNIT ONLY').hexdigest())
                with self.assertRaises(AssertionError):a.begin(source,b'edited')
            self.assertFalse((a.out/'cpu-journey.json.tmp').exists())

    def test_ownership_stays_inactive_until_real_recruitment(self):
        for joined,stage,lucca,result in [(False,'none',False,False),(True,'none',False,True),(True,'escort',False,False),(True,'cell',False,False),(True,'escaped',True,True)]:
            self.assertEqual(controls_peer({'joined':joined,'trial':{'stage':stage,'luccaJoined':lucca}}),result)

    def test_normal_move_releases_and_checks_both_owners_with_original_budget(self):
        p=NativePort();p.state.update(joined=True,trial={'stage':'none','luccaJoined':False})
        a=self.make('/unit');before=deepcopy(p.state)
        a.move(p,'x',0,False,None,lambda p:deepcopy(p.state))
        t=a.data['nativeRoutes'][0]
        self.assertEqual(t['status'],'arrived');self.assertLess(abs(p.state['players'][0]['x']),.12)
        self.assertFalse(p.keyboard.held);self.assertEqual(t['before']['state'],before)
        self.assertEqual(t['timeoutMs'],30000);self.assertEqual(t['maxHoldMs'],250)
        self.assertLess(abs(p.state['players'][1]['x']),.12)

    def test_inactive_peer_never_receives_cpu_route_arrows(self):
        p=NativePort();p.state.update(joined=True,trial={'stage':'cell','luccaJoined':False})
        a=self.make('/unit');a.move(p,'x',0,False,None,lambda p:deepcopy(p.state))
        self.assertFalse(any(k.startswith('Arrow') for _,k in p.keyboard.events))

    def test_encounter_wait_keeps_original_distance_budget_and_all_key_releases(self):
        p=NativePort();p.state.update(joined=True,trial={'stage':'none','luccaJoined':False})
        a=self.make('/unit');calls=[]
        def wait(page,expression,budget,modes):
            calls.append((budget,modes));page.state.update(mode='battle',ticks=20)
        a.move(p,'z',2,True,wait,lambda p:deepcopy(p.state))
        r=a.data['encounters'][0];self.assertEqual(r['status'],'entered-battle')
        self.assertEqual(r['keys'],['w','ArrowUp']);self.assertEqual(r['releasedKeys'],['ArrowUp','w'])
        self.assertEqual(calls,[(129,('explore','battle'))]);self.assertFalse(p.keyboard.held)

    def test_encounter_second_down_failure_preserves_root_even_if_release_also_fails(self):
        p=NativePort();p.state.update(joined=True,trial={'stage':'none','luccaJoined':False})
        p.fail_down=p.fail_up='ArrowUp';a=self.make('/unit')
        with self.assertRaisesRegex(RuntimeError,'key-down'):
            a.move(p,'z',2,True,None,lambda p:deepcopy(p.state))
        self.assertEqual(p.keyboard.events[-2:],[('up','ArrowUp'),('up','w')]);self.assertFalse(p.keyboard.held)
        self.assertEqual(a.data['encounters'][0]['status'],'failed')

    def test_crossed_target_without_encounter_is_not_claimed_as_battle(self):
        p=NativePort();p.state.update(joined=False,trial={'stage':'cell','luccaJoined':False})
        a=self.make('/unit')
        with self.assertRaises(AssertionError):a.move(p,'z',2,True,lambda *_:None,lambda p:deepcopy(p.state))
        self.assertFalse(p.keyboard.held);self.assertEqual(a.data['encounters'][0]['status'],'failed')

    def test_actual_observation_checks_default_sampling_and_native_canvas(self):
        good=observation();assert_observation(good)
        for branch,field,value in [('pixels','source','fixture'),('pixels','opaque',0),('pixels','max',1),('renderer','backend','webgl2'),('state','chapter','other')]:
            bad=deepcopy(good);bad[branch][field]=value
            with self.subTest(field=field), self.assertRaises(AssertionError):assert_observation(bad)
        for name,value in [('enabled',True),('alphaCutouts','linear')]:
            bad=deepcopy(good);bad['renderer']['cpu']['sampling'][name]=value
            with self.assertRaises(AssertionError):assert_observation(bad)

    def test_partial_capture_is_retained_before_image_failure(self):
        class Page:
            def wait_for_function(self,*args,**kwargs):pass
            def evaluate(self,*args):return observation()
            def screenshot(self,*args,**kwargs):raise TimeoutError('native image timeout')
        with tempfile.TemporaryDirectory() as d:
            a=self.make(d)
            with self.assertRaises(TimeoutError):a.observe(Page(),'unit only')
            self.assertEqual(len(a.data['observations']),1)
            self.assertNotIn('image',a.data['observations'][0])

    def test_sustain_observes_three_real_count_windows_without_changing_page_state(self):
        class Handle:
            disposed=False
            def json_value(self):return {'ok':True}
            def dispose(self):self.disposed=True
        class Page:
            def __init__(self):self.value=observation();self.calls=[]
            def evaluate(self,*args):return deepcopy(self.value)
            def wait_for_function(self,source,**kwargs):
                self.calls.append(kwargs);self.value['state']['ticks']+=120;self.value['renderer']['cpu']['draws']+=120
                return Handle()
        with tempfile.TemporaryDirectory() as d:
            a=self.make(d);p=Page();a.sustain(p,'unit only')
            self.assertEqual(len(a.data['performanceWindows']),3)
            self.assertTrue(all(c['timeout']==30000 for c in p.calls))
            self.assertTrue(all(w['status']=='observed-not-certified' for w in a.data['performanceWindows']))

    def test_sustain_timeout_retains_running_window_not_success(self):
        class Page:
            def evaluate(self,*args):return observation()
            def wait_for_function(self,*args,**kwargs):raise TimeoutError('unit timeout')
        with tempfile.TemporaryDirectory() as d:
            a=self.make(d)
            with self.assertRaises(TimeoutError):a.sustain(Page(),'unit only')
            r=json.loads((a.out/'cpu-journey.json').read_text());self.assertEqual(r['performanceWindows'][0]['status'],'running')

    def test_finish_does_not_rewrite_original_report_or_relabel_prior_failure(self):
        with tempfile.TemporaryDirectory() as d:
            a=self.make(d);a.out.mkdir(parents=True);path=a.out/'rescue-report.json';raw=b'{"status":"passed","errors":[]}'
            path.write_bytes(raw)
            try:raise AssertionError()
            except AssertionError:a.finish(path.name)
            self.assertEqual(path.read_bytes(),raw);r=json.loads((a.out/'cpu-journey.json').read_text())
            self.assertEqual(r['status'],'failed');self.assertEqual(r['failure']['message'],'AssertionError')
            self.assertIn('test_finish',r['failure']['traceback']);self.assertEqual(len(r['files']),1)

    def test_missing_final_report_is_failed_and_original_exception_is_not_overwritten(self):
        with tempfile.TemporaryDirectory() as d:
            a=self.make(d)
            with self.assertRaises(FileNotFoundError):a.finish('missing.json')
            self.assertEqual(json.loads((a.out/'cpu-journey.json').read_text())['status'],'failed')
            try:raise RuntimeError('primary')
            except RuntimeError:a.finish('missing.json')

    def test_cpu_prop_timeout_is_shorter_without_changing_tick_budget_or_prompt(self):
        p=PageDouble(True);trace=[]
        approach_organ(p,lambda *_:None,lambda _:deepcopy(p.state),trace,timeout_ms=30000)
        self.assertEqual(p.wait_args[2],30000);self.assertEqual(p.wait_args[0]['budget'],230)
        self.assertEqual(trace[0]['status'],'reached')
        for bad in [0,-1,120001,True,None]:
            with self.subTest(bad=bad),self.assertRaises(ValueError):
                approach_organ(p,None,None,[],timeout_ms=bad)


class OriginalOnly(ast.NodeTransformer):
    """Reverse only the explicit CPU adapter wires; everything else remains pinned."""
    def visit_ImportFrom(self,n):return None if n.module=='cpu_journey_support' else n
    def visit_Import(self,n):
        if any(a.name=='os' for a in n.names) and any(a.name=='hashlib' for a in n.names):
            n.names=[a for a in n.names if a.name!='os']
        return n
    def visit_Assign(self,n):
        if any(isinstance(t,ast.Name) and t.id=='cpu' for t in n.targets):return None
        return self.generic_visit(n)
    def visit_Expr(self,n):
        if isinstance(n.value,ast.Call) and isinstance(n.value.func,ast.Attribute) and ast.unparse(n.value.func.value)=='cpu':return None
        return self.generic_visit(n)
    def visit_IfExp(self,n):
        if ast.unparse(n.test)=='cpu.enabled':return self.visit(n.orelse)
        return self.generic_visit(n)
    def visit_If(self,n):return None if ast.unparse(n.test)=='cpu.enabled' else self.generic_visit(n)
    def visit_Call(self,n):
        if isinstance(n.func,ast.Attribute) and ast.unparse(n.func.value)=='cpu' and n.func.attr in ('output','source'):return self.visit(n.args[0])
        if isinstance(n.func,ast.Name) and n.func.id in ('approach_organ','approach_supply_chest'):
            n.keywords=[k for k in n.keywords if k.arg!='timeout_ms']
        return self.generic_visit(n)
    def visit_Try(self,n):
        if len(n.body)==1 and isinstance(n.body[0],ast.Expr) and isinstance(n.body[0].value,ast.Call) and ast.unparse(n.body[0].value.func)=='cpu.finish':
            return [self.visit(x) for x in n.finalbody]
        return self.generic_visit(n)


def normalized(source):
    tree=OriginalOnly().visit(ast.parse(source));return structural_hash(tree)


def contract(source,stage):
    tree=ast.parse(source);functions={n.name:n for n in tree.body if isinstance(n,ast.FunctionDef)}
    result={'moves':[],'encounters':[],'labels':[]}
    def walk(n):
        if isinstance(n,ast.FunctionDef):return
        if isinstance(n,ast.Call):
            name=n.func.id if isinstance(n.func,ast.Name) else ''
            if name=='move':
                battle=any(k.arg=='battle' and ast.literal_eval(k.value) for k in n.keywords)
                result['encounters' if battle else 'moves'].append([ast.literal_eval(n.args[1]),ast.literal_eval(n.args[2])])
            elif name=='to_warden':
                for node in functions[name].body:walk(node)
            elif name in ('approach_organ','approach_supply_chest'):
                route=json.loads((ROOT/'tests'/('organ-route.json' if name=='approach_organ' else 'rescue-route.json')).read_text())
                result['moves'].extend([[w['axis'],w['target']] for w in route['waypoints'][:-1]])
            elif name=='passed':result['labels'].append(ast.literal_eval(n.args[0]))
        for child in ast.iter_child_nodes(n):walk(child)
    walk(tree);return result


class PreservationTests(unittest.TestCase):
    def test_original_webgl_ast_reverses_exactly_after_only_declared_cpu_wires(self):
        pinned=json.loads((ROOT/'tests/cpu-journey-preservation.json').read_text())
        for stage,expected in pinned['journeys'].items():
            with self.subTest(stage=stage):self.assertEqual(normalized((ROOT/'tests'/f'{stage}_browser.py').read_text()),expected)
        for name,expected in pinned['files'].items():
            with self.subTest(path=name):
                raw=(ROOT/name).read_bytes()
                if name=='tests/cpu_native_route.py':raw=restore_i_route(raw.decode()).encode()
                self.assertEqual(hashlib.sha256(raw).hexdigest(),expected)

    def test_all_original_story_actions_and_both_branch_route_calls_match_verifier(self):
        expected=json.loads((ROOT/'tests/cpu-adventure-contract.json').read_text())
        for stage in ('rescue','trial'):
            self.assertEqual(contract((ROOT/'tests'/f'{stage}_browser.py').read_text(),stage),expected[stage])

    def test_ci_keeps_original_routes_and_adds_serial_source_chain_once(self):
        source=(ROOT/'.github/workflows/ci.yml').read_text()
        positions=[]
        for command in ['python tests/cpu_renderer_browser.py','node scripts/cpu-era-evidence.mjs',
                        'CHRONO_CPU_CHAIN=1 python tests/rescue_browser.py','CHRONO_CPU_CHAIN=1 python tests/trial_browser.py',
                        'node scripts/cpu-adventure-evidence.mjs']:
            self.assertEqual(source.count('run: '+command),1);positions.append(source.index('run: '+command))
        self.assertEqual(positions,sorted(positions));self.assertNotIn('continue-on-error',source)
        self.assertEqual(source.count('run: python tests/rescue_browser.py'),1)
        self.assertEqual(source.count('run: python tests/trial_browser.py'),1)
        self.assertEqual(source.count('timeout-minutes: 45'),2)
        self.assertIn("if: always()\n        run: node scripts/cpu-adventure-evidence.mjs",source)

if __name__=='__main__':unittest.main()
