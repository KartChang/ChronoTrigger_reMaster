"""Synthetic observations exercise camera report assertions; not browser evidence."""
import copy
import unittest
from early_camera import assert_camera


def fixture():
    a = dict(id='p0',left=.4,right=.6,top=.36,bottom=.50)
    frame = dict(x=0,z=0,half=6.2,ratio=390/844,active=True,portrait=True,
                 bounds=dict(left=.045,right=.955,top=.12,bottom=.8),actors=[a.copy()])
    return dict(source='actual-scene-vertex-projection',chapter='bedroom',mode='explore',stage='home',
                viewport=dict(width=390,height=844),camera=dict(profile='vq01b-readable-actors',camera=frame,
                motion=dict(approved=False),rects=[a.copy()],fullScenePublished=False))


class CameraEvidence(unittest.TestCase):
    def test_valid_whole_sprite_and_readable_portrait(self):
        assert_camera(fixture(),readable_portrait=True)

    def test_each_clipped_actual_edge_fails_even_when_predicted_bounds_pass(self):
        for key,value in [('left',-.1),('right',1.1),('top',0),('bottom',.95)]:
            m=fixture();m['camera']['rects'][0][key]=value
            with self.assertRaises(AssertionError): assert_camera(m)

    def test_missing_duplicate_or_mismatching_actual_subject_fails(self):
        for f in [lambda c:c.update(rects=[]),lambda c:c['rects'].append(c['rects'][0].copy()),
                  lambda c:c['rects'][0].update(id='unknown')]:
            m=fixture();f(m['camera'])
            with self.assertRaises(AssertionError): assert_camera(m)

    def test_nonfinite_and_zero_area_actual_projection_fails(self):
        for k,v in [('left',float('nan')),('right',float('inf')),('bottom',.35),('right',.4)]:
            m=fixture();m['camera']['rects'][0][k]=v
            with self.assertRaises(AssertionError): assert_camera(m)

    def test_stale_ratio_missing_profile_and_disabled_policy_fail(self):
        for f in [lambda c:c.update(profile='other'),lambda c:c['camera'].update(active=False),
                  lambda c:c['camera'].update(ratio=2),lambda c:c['camera'].update(half=-1),
                  lambda c:c['camera'].update(x=float('nan'))]:
            m=fixture();f(m['camera'])
            with self.assertRaises(AssertionError): assert_camera(m)

    def test_unreadably_small_portrait_fails_only_explicit_stationary_check(self):
        m=fixture();m['camera']['rects'][0].update(bottom=.38)
        assert_camera(m)
        with self.assertRaises(AssertionError): assert_camera(m,readable_portrait=True)

    def test_unrelated_chapter_or_waking_cannot_claim_active_camera_acceptance(self):
        for patch in [dict(chapter='overworld1000'),dict(stage='waking'),dict(source='synthetic')]:
            m=fixture();m.update(patch)
            with self.assertRaises(AssertionError): assert_camera(m)

    def test_observation_is_read_only_and_not_final_scene_approval(self):
        m=fixture();before=copy.deepcopy(m);assert_camera(m);self.assertEqual(m,before)
        m['camera']['fullScenePublished']=True
        with self.assertRaises(AssertionError): assert_camera(m)
