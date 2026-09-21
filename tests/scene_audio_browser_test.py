"""Protocol/AST units only; fake pages below do not constitute audio evidence."""
import ast
import copy
import json
from pathlib import Path
import unittest
from scene_audio_browser import wait_playing, wait_silent

ROOT=Path(__file__).resolve().parent
FIXTURE=json.loads((ROOT/'fixtures/scene-audio-evidence-unit.json').read_text())['report']
class Handle:
    def __init__(self,data):self.data=data;self.disposed=False
    def json_value(self):return copy.deepcopy(self.data)
    def dispose(self):self.disposed=True
class Page:
    def __init__(self,data):self.handle=Handle(data);self.calls=[]
    def wait_for_function(self,expression,**kwargs):self.calls.append((expression,kwargs));return self.handle

class AudioObservation(unittest.TestCase):
    def test_play_observation_uses_same_atomic_sample_not_a_second_evaluation(self):
        page=Page(FIXTURE['playing']);self.assertEqual(wait_playing(page),FIXTURE['playing'])
        self.assertTrue(page.handle.disposed);self.assertEqual(len(page.calls),1)
        self.assertEqual(page.calls[0][1]['timeout'],15000)
    def test_silence_wait_is_bounded_and_releases_handle(self):
        page=Page(FIXTURE['muted']);self.assertEqual(wait_silent(page),FIXTURE['muted'])
        self.assertTrue(page.handle.disposed);self.assertEqual(page.calls[0][1]['timeout'],10000)
    def test_play_error_never_becomes_a_success(self):
        data=copy.deepcopy(FIXTURE['playing']);data['error']='device failed'
        with self.assertRaises(AssertionError):wait_playing(Page(data))
    def test_zero_or_invalid_play_energy_is_not_accepted(self):
        for rms in [0,-1,float('nan')]:
            with self.subTest(rms=rms):
                data=copy.deepcopy(FIXTURE['playing']);data['rms']=rms
                with self.assertRaises(AssertionError):wait_playing(Page(data))
    def test_voice_limit_remains_sixteen(self):
        data=copy.deepcopy(FIXTURE['playing']);data['activeVoices']=17
        with self.assertRaises(AssertionError):wait_playing(Page(data))
    def test_silence_requires_zero_nodes_gain_and_waveform(self):
        for key,value in [('activeVoices',1),('masterGain',.1),('rms',.01),('error','device failed')]:
            with self.subTest(key=key):
                data=copy.deepcopy(FIXTURE['muted']);data[key]=value
                with self.assertRaises(AssertionError):wait_silent(Page(data))
    def test_browser_helper_never_builds_audio_graphs_or_plays_synthetic_audio(self):
        source=(ROOT/'scene_audio_browser.py').read_text()
        for forbidden in ['new AudioContext','OfflineAudioContext','set_files','set_input_files','force=True','dispatch_event','add_init_script','setInterval','setTimeout']:
            self.assertNotIn(forbidden,source)
        self.assertIn('handle.json_value();handle.dispose()',source)
    def test_actual_driver_keeps_original_first_import_and_embeds_observations(self):
        source=(ROOT/'equipment_browser.py').read_text()
        self.assertEqual(source.count('imported(page,SOURCE)'),1)
        self.assertLess(source.index('audio_report=begin_audio_observation'),source.index('imported(page,SOURCE)'))
        self.assertLess(source.index('imported(page,SOURCE)'),source.index('audio_report=finish_audio_observation'))
        self.assertIn('report.update(audio=audio_report,contextHandoff=handoff',source)
        self.assertIn("attempt['audioChooserOpen']=audio(page)",source)
    def test_only_existing_user_keyboard_controls_open_and_close_modals(self):
        tree=ast.parse((ROOT/'scene_audio_browser.py').read_text())
        attrs={n.func.attr for n in ast.walk(tree) if isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute)}
        self.assertNotIn('click',attrs);self.assertNotIn('focus',attrs);self.assertIn('press',attrs)
        self.assertIn('snapshot()', (ROOT/'scene_audio_browser.py').read_text())
