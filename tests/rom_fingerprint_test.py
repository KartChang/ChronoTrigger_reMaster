"""Synthetic headers only; no game ROM is committed to or downloaded by CI."""
import importlib.util
from pathlib import Path
import unittest
spec=importlib.util.spec_from_file_location('rom_fingerprint',Path(__file__).parents[1]/'scripts'/'rom_fingerprint.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)


def fake(prefix=False):
    data=bytearray(0x10000);at=0xffc0
    data[at:at+21]=b'AUTHORED TEST HEADER'.ljust(21,b' ')
    data[at+0x15]=0x31;data[at+0x17]=6;data[at+0x19]=1
    data[at+0x3c:at+0x3e]=(0x8000).to_bytes(2,'little')
    # A complementary pair always contributes 510 to the byte sum.
    checksum=(sum(data)+510)&0xffff
    data[at+0x1c:at+0x1e]=(checksum^0xffff).to_bytes(2,'little')
    data[at+0x1e:at+0x20]=checksum.to_bytes(2,'little')
    return (b'\0'*512 if prefix else b'')+bytes(data)


class HeaderTests(unittest.TestCase):
    def test_hirom_checksum_and_mapping(self):
        r=module.inspect_bytes(fake());h=r['plausibleHeader']
        self.assertEqual(h['kind'],'HiROM');self.assertTrue(h['checksumPairValid']);self.assertTrue(h['ordinaryPowerOfTwoChecksumMatches'])
        self.assertFalse(r['emulated']);self.assertFalse(r['assetsExtracted'])
    def test_unchanged_payload_with_prefix(self):
        a,b=module.inspect_bytes(fake()),module.inspect_bytes(fake(True))
        self.assertEqual(b['copierHeaderBytesBySizeHeuristic'],512);self.assertEqual(a['payloadSha256'],b['payloadSha256']);self.assertNotEqual(a['sha256'],b['sha256'])
    def test_mismatch_is_not_silently_fixed(self):
        raw=bytearray(fake());raw[0]=1;r=module.inspect_bytes(bytes(raw));self.assertFalse(r['plausibleHeader']['ordinaryPowerOfTwoChecksumMatches']);self.assertEqual(raw[0],1)
    def test_non_power_of_two_is_not_certified(self):
        r=module.inspect_bytes(fake()+b'\0'*0x8000);self.assertIsNone(r['ordinaryPowerOfTwoChecksum']);self.assertIsNone(r['plausibleHeader']['ordinaryPowerOfTwoChecksumMatches'])
    def test_bad_input_rejected(self):
        for raw in [b'',b'x'*10,'not bytes',b'\0'*(8*1024*1024+513)]:
            with self.assertRaises(ValueError):module.inspect_bytes(raw)
    def test_ambiguous_header_does_not_invent_identity(self):
        r=module.inspect_bytes(b'\0'*0x10000);self.assertIsNone(r['plausibleHeader'])


if __name__=='__main__':unittest.main()
