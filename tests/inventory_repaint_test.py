"""Synthetic geometry tests of the evidence assertions, not browser results."""
import copy
import unittest
from inventory_repaint import assert_merchant_repaint


def sample():
    return {'scrollTop':500, 'scrollHeight':1300, 'clientHeight':700,
            'row':{'top':590, 'bottom':660}, 'content':{'top':50, 'bottom':750},
            'options':[{'id':'equip-crono-bronze-helm'}], 'focused':'equipment-shop-row-bronze-helm'}


class MerchantRepaintContract(unittest.TestCase):
    def test_stable_real_record_shape_is_accepted_without_mutation(self):
        a=sample();b=copy.deepcopy(a);assert_merchant_repaint(a,b);self.assertEqual(a,b)

    def test_scroll_jump_is_not_masked_by_correct_focus(self):
        a=sample();b=copy.deepcopy(a);b['scrollTop']-=20
        with self.assertRaises(AssertionError):assert_merchant_repaint(a,b)

    def test_row_jump_is_not_masked_by_stable_numeric_scroll(self):
        a=sample();b=copy.deepcopy(a);b['row']['top']-=20
        with self.assertRaises(AssertionError):assert_merchant_repaint(a,b)

    def test_missing_or_reordered_preview_is_rejected(self):
        a=sample();b=copy.deepcopy(a);b['options']=[]
        with self.assertRaises(AssertionError):assert_merchant_repaint(a,b)

    def test_out_of_view_row_is_not_an_acceptable_focus_restore(self):
        a=sample();b=copy.deepcopy(a);b['row']['bottom']=800
        with self.assertRaises(AssertionError):assert_merchant_repaint(a,b)

    def test_a_different_purchase_must_not_receive_focus(self):
        a=sample();b=copy.deepcopy(a);b['focused']='buy-bronze-katana'
        with self.assertRaises(AssertionError):assert_merchant_repaint(a,b)

    def test_invalid_or_unbounded_metrics_fail_closed(self):
        for key,value in [('scrollTop',float('nan')),('scrollHeight',float('inf')),('clientHeight',0),('scrollTop',-2),('scrollTop',900)]:
            with self.subTest(key=key,value=value):
                a=sample();b=copy.deepcopy(a);b[key]=value
                with self.assertRaises(AssertionError):assert_merchant_repaint(a,b)

    def test_non_finite_row_is_rejected(self):
        a=sample();b=copy.deepcopy(a);b['row']['top']=float('nan')
        with self.assertRaises(AssertionError):assert_merchant_repaint(a,b)
