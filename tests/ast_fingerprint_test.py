"""Unit structural checks only; not a Python 3.12 execution or browser claim."""
import ast
from copy import deepcopy
import json
from pathlib import Path
import unittest
from unittest.mock import patch
from ast_fingerprint import SCHEMA, structural_dump, structural_hash
from cpu_journey_support_test import normalized

ROOT = Path(__file__).resolve().parents[1]


class StructuralFingerprintTests(unittest.TestCase):
    def test_empty_fields_none_and_primitive_types_have_a_fixed_encoding(self):
        tree = ast.Module(body=[ast.Expr(value=ast.Constant(value=None, kind=None))], type_ignores=[])
        self.assertEqual(structural_dump(tree),
            '["Module",[["body",[["Expr",[["value",["Constant",[["value",["NoneType","None"]],["kind",["NoneType","None"]]]]]]]]],'
            '["type_ignores",[]]]]')

    def test_formatter_output_is_never_used_for_fingerprinting(self):
        tree = ast.parse('def f(a=None):\n    return []\n')
        before = structural_hash(tree)
        with patch.object(ast, 'dump', side_effect=AssertionError('display formatter used')):
            self.assertEqual(structural_hash(tree), before)

    def test_pre_313_node_metadata_without_field_types_serializes_identically(self):
        # Clone every actual field into plain AST subclasses with no newer metadata.
        # This is a version-shape unit port, NOT execution on a second interpreter.
        classes = {}
        def older_shape(value):
            if isinstance(value, ast.AST):
                fields = tuple(name for name, _ in ast.iter_fields(value))
                cls = classes.setdefault(type(value).__name__, type(type(value).__name__, (ast.AST,), {'_fields': fields}))
                result = cls()
                for name, child in ast.iter_fields(value):
                    setattr(result, name, older_shape(child))
                return result
            if isinstance(value, list):
                return [older_shape(child) for child in value]
            return value
        for stage in ('rescue', 'trial'):
            tree = ast.parse((ROOT/'tests'/f'{stage}_browser.py').read_text())
            self.assertEqual(structural_dump(tree), structural_dump(older_shape(tree)))

    def test_locations_are_ignored_but_semantic_fields_and_list_order_are_not(self):
        original = ast.parse('x = [1, 2]\n')
        shifted = deepcopy(original); ast.increment_lineno(shifted, 100)
        self.assertEqual(structural_hash(original), structural_hash(shifted))
        for text in ('x = [2, 1]', 'x = []', 'x = [True, 2]', 'x = [1.0, 2]', 'y = [1, 2]'):
            with self.subTest(text=text):
                self.assertNotEqual(structural_hash(original), structural_hash(ast.parse(text)))

    def test_optional_and_empty_list_changes_cannot_be_dropped(self):
        original = ast.parse('def f():\n    return None\n')
        changed = deepcopy(original); changed.body[0].returns = ast.Name(id='int', ctx=ast.Load())
        self.assertNotEqual(structural_hash(original), structural_hash(changed))
        changed = deepcopy(original); changed.body[0].decorator_list = [ast.Name(id='other', ctx=ast.Load())]
        self.assertNotEqual(structural_hash(original), structural_hash(changed))
        changed = deepcopy(original); changed.body[0].type_params = [ast.TypeVar(name='T', bound=None)]
        self.assertNotEqual(structural_hash(original), structural_hash(changed))

    def test_unknown_values_fail_explicitly_instead_of_producing_a_display_address(self):
        with self.assertRaises(TypeError): structural_dump('not an AST')
        tree = ast.Constant(value=object(), kind=None)
        with self.assertRaises(TypeError): structural_dump(tree)

    def test_preservation_reference_declares_source_and_does_not_select_by_python_version(self):
        record = json.loads((ROOT/'tests/cpu-journey-preservation.json').read_text())
        self.assertEqual(record['fingerprintSchema'], SCHEMA)
        self.assertEqual(record['sourceSha'], '3028e2499d5a268d20c5251a3aec6e8c2c5a09e2')
        self.assertEqual(set(record['originalSourceSha256']), {'rescue', 'trial'})
        for value in record['originalSourceSha256'].values(): self.assertRegex(value, r'^[a-f0-9]{64}$')
        self.assertEqual(record['legacyDisplayHashes']['rescue'], '4c1f48a85b86850a399c07175d283274373bab5af0879a3995235c1879bd1440')

    def test_original_gameplay_assertions_actions_targets_and_budgets_remain_protected(self):
        sources = {stage: (ROOT/'tests'/f'{stage}_browser.py').read_text() for stage in ('rescue', 'trial')}
        changes = [
            ('rescue', "['maxHp']==720", "['maxHp']==721"),
            ('rescue', "talk(page,'管風琴')", "talk(page,'木箱')"),
            ('rescue', "move(page,'x',7.8)", "move(page,'x',8.8)"),
            ('rescue', "assert saved['rescue']['tonics']==2", "assert saved['rescue']['tonics']==3"),
            ('trial', "for day in range(1,4)", "for day in range(1,5)"),
            ('trial', "['trial']['experience']==30", "['trial']['experience']==31"),
            ('trial', "page.keyboard.press('q')", "page.keyboard.press('r')"),
            ('trial', "['enemies'][1]['hp']>after['enemies'][1]['hp']", "['enemies'][1]['hp']>=after['enemies'][1]['hp']"),
        ]
        for stage, old, new in changes:
            with self.subTest(stage=stage, mutation=old):
                self.assertIn(old, sources[stage])
                self.assertNotEqual(normalized(sources[stage]), normalized(sources[stage].replace(old, new, 1)))

if __name__ == '__main__': unittest.main()
