"""Synthetic geometry tests for the assertions only; these are NOT gameplay evidence."""
import copy
import unittest
from inventory_comfort import assert_inventory_layout


def geometry():
    return {'viewport':{'width':844,'height':390},
            'panel':{'top':8,'left':42,'right':802,'bottom':382,'height':374},
            'content':{'top':60,'bottom':348,'height':288},
            'header':{'bottom':60},'status':{'top':348,'bottom':382},'hasFeedback':True,
            'clientWidth':720,'scrollWidth':720,'shellClientWidth':758,'shellScrollWidth':758,
            'shellScrollTop':0,'coarse':False,'buttonHeights':[{'id':'close','height':36}]}


class InventoryGeometryContract(unittest.TestCase):
    def test_separate_chrome_and_readable_body_pass(self):
        assert_inventory_layout(geometry())

    def test_coarse_targets_require_44_not_36(self):
        m=geometry();m['coarse']=True
        with self.assertRaises(AssertionError):assert_inventory_layout(m)
        m['buttonHeights'][0]['height']=44;assert_inventory_layout(m)

    def test_empty_feedback_does_not_require_a_status_rectangle(self):
        m=geometry();m['hasFeedback']=False;m['status']={'top':0,'bottom':0};assert_inventory_layout(m)

    def test_reject_regressions_instead_of_merely_recording_geometry(self):
        for section,key,value in [('panel','bottom',400),('header','bottom',120),('status','top',300),('content','height',150)]:
            with self.subTest(section=section,key=key):
                m=geometry();m[section][key]=value
                with self.assertRaises(AssertionError):assert_inventory_layout(m)
        for key,value in [('scrollWidth',800),('shellScrollWidth',800),('shellScrollTop',30),('buttonHeights',[])]:
            with self.subTest(key=key):
                m=copy.deepcopy(geometry());m[key]=value
                with self.assertRaises(AssertionError):assert_inventory_layout(m)

if __name__=='__main__':unittest.main()
