"""Offline ports only: lifecycle, raw receipt, cleanup and public API wiring."""
import ast,hashlib,tempfile,unittest
from pathlib import Path
from native_video import video_options,begin_native_video,retain_native_video
class Video:
    def __init__(self,raw):self.raw=raw;self.deleted=False
    def save_as(self,path):Path(path).write_bytes(self.raw)
    def delete(self):self.deleted=True
class Page:
    def __init__(self,raw):self.video=Video(raw)
class NativeVideoTests(unittest.TestCase):
    def test_raw_recording_receipt_after_closed_context(self):
        raw=bytes.fromhex('1a45dfa3')+b'unit-only'*200;p=Page(raw);r=begin_native_video({'sourceSha':'unit-only'})
        with tempfile.TemporaryDirectory() as d:
            retain_native_video(p,d,r);self.assertEqual((Path(d)/'era600/native-session.webm').read_bytes(),raw)
        self.assertEqual(r['status'],'retained');self.assertEqual(r['sha256'],hashlib.sha256(raw).hexdigest());self.assertTrue(p.video.deleted)
        self.assertFalse(r['physicalDevice']);self.assertFalse(r['audioRecorded']);self.assertFalse(r['frameExactAlignment'])
    def test_bad_or_absent_recording_fails_without_success(self):
        for p in [Page(b'bad'),Page(b'\0'*2048)]:
            r=begin_native_video({})
            with tempfile.TemporaryDirectory() as d,self.assertRaises(AssertionError):retain_native_video(p,d,r)
            self.assertEqual(r['status'],'failed');self.assertFalse(p.video.deleted)
    def test_no_video_object(self):
        p=Page(b'');p.video=None;r=begin_native_video({})
        with tempfile.TemporaryDirectory() as d,self.assertRaises(AssertionError):retain_native_video(p,d,r)
        self.assertEqual(r['status'],'failed')
    def test_public_context_same_page_and_original_input_path(self):
        root=Path(__file__).parent;s=(root/'cpu_renderer_browser.py').read_text();tree=ast.parse(s)
        self.assertEqual(sum(isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute) and n.func.attr=='new_context' for n in ast.walk(tree)),1)
        self.assertEqual(s.count('context.new_page()'),1);self.assertIn('**video_options(OUT)',s)
        self.assertLess(s.index('context.close()'),s.index('retain_native_video(page,'));self.assertIn('if primary is None:',s)
        self.assertEqual(video_options('/unit')['record_video_size'],{'width':960,'height':844})
        for token in ['new_cdp_session','setState','dispatch_event','set_input_files']:self.assertNotIn(token,(root/'native_video.py').read_text())
    def test_stop_clock_markers_are_read_only_and_original_six_legs_preserved(self):
        from town_route_capture_test import Page,snap,observed
        from town_route_capture import TownRouteCapture
        p=Page();record={};routes=[{}]*9
        with tempfile.TemporaryDirectory() as d:
            with TownRouteCapture(p,d,record,snap,observed,routes) as t:
                for name,n in [('resident',2),('inn',3),('exit',1)]:routes.extend([{}]*n);t.stop(name)
        times=[record['nativeVideoWindow']['startUs']]+[v['videoClockUs'] for v in record['stops']]+[record['nativeVideoWindow']['endUs']]
        self.assertEqual(times,sorted(times));self.assertEqual(record['routeEnd'],15);self.assertFalse(record['motionVideo'])
if __name__=='__main__':unittest.main()
