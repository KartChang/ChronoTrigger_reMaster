"""Fixed semantic AST serialization for preservation checks, not ast.dump display.

Python 3.13 changed ast.dump's treatment of empty fields. Preserve every semantic
field, None, empty list, primitive type and list order; omit only source locations.
No dependence on _field_types, optional-field class defaults or Python version.
"""
import ast
import hashlib
import json

SCHEMA = 'chrono-semantic-ast-v1'


def structural_value(value):
    if isinstance(value, ast.AST):
        return [type(value).__name__, [
            [name, structural_value(child)] for name, child in ast.iter_fields(value)
        ]]
    if isinstance(value, list):
        return [structural_value(child) for child in value]
    if value is None or value is Ellipsis or type(value) in (str, bytes, int, float, complex, bool):
        return [type(value).__name__, repr(value)]
    raise TypeError('unsupported semantic AST value: ' + type(value).__name__)


def structural_dump(tree):
    if not isinstance(tree, ast.AST):
        raise TypeError('expected AST')
    return json.dumps(structural_value(tree), ensure_ascii=True, separators=(',', ':'))


def structural_hash(tree):
    return hashlib.sha256(structural_dump(tree).encode('utf-8')).hexdigest()
