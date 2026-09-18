"""Read-only ordinary SNES header fingerprint; no emulator or asset extraction.
Layout reference: snes9xgit/snes9x memmap.cpp ParseSNESHeader, InitROM,
Revision and Checksum_Calculate. Deliberately does not implement interleaving,
BS-X, special-chip checksum rules or infer a translation patch from a title.
Output contains metadata/digests only, never a ROM slice or executable bytes.
"""
from pathlib import Path
import argparse
import hashlib
import json

REFERENCE = 'https://github.com/snes9xgit/snes9x/blob/master/memmap.cpp'


def inspect_bytes(raw: bytes) -> dict:
    if not isinstance(raw, bytes) or len(raw)<0x8000 or len(raw)>8*1024*1024+512:
        raise ValueError('Expected an ordinary 32 KiB–8 MiB ROM, optionally with a 512-byte copier header.')
    skip=512 if len(raw)%0x8000==512 else 0
    data=raw[skip:]
    power_two=len(data)>0 and (len(data)&(len(data)-1))==0
    checksum=sum(data)&0xffff if power_two else None
    candidates=[]
    for kind,offset in [('LoROM',0x7fc0),('HiROM',0xffc0),('ExHiROM',0x40ffc0)]:
        if offset+0x40>len(data):
            continue
        title_bytes=data[offset:offset+21]
        title=title_bytes.decode('ascii',errors='replace').rstrip(' \x00')
        read16=lambda relative:int.from_bytes(data[offset+relative:offset+relative+2],'little')
        mode=data[offset+0x15]
        complement,stored=read16(0x1c),read16(0x1e)
        expected_mode=(mode&15)==(0 if kind=='LoROM' else 1 if kind=='HiROM' else 5)
        candidates.append({'kind':kind,'headerOffset':offset,'title':title,'titleAsciiPrintable':all(32<=b<127 for b in title_bytes),
            'mappingByte':mode,'mappingFitsLocation':expected_mode,'cartridgeTypeByte':data[offset+0x16],
            'romSizeExponent':data[offset+0x17],'sramSizeExponent':data[offset+0x18],'regionByte':data[offset+0x19],
            'revisionByte':data[offset+0x1b],'checksumStored':stored,'checksumComplement':complement,
            'checksumPairValid':(stored+complement)==0xffff,'ordinaryPowerOfTwoChecksumMatches':stored==checksum if checksum is not None else None,
            'resetVector':read16(0x3c)})
    plausible=[c for c in candidates if c['mappingFitsLocation'] and c['titleAsciiPrintable'] and c['resetVector']>=0x8000]
    return {'schemaVersion':1,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'copierHeaderBytesBySizeHeuristic':skip,
        'payloadBytes':len(data),'payloadSha256':hashlib.sha256(data).hexdigest(),'ordinaryPowerOfTwoChecksum':checksum,
        'plausibleHeader':plausible[0] if len(plausible)==1 else None,'candidates':candidates,
        'emulated':False,'assetsExtracted':False,'gameRulesDecoded':False,'reference':REFERENCE,
        'limitations':['Header identity and checksum cannot establish an unmodified commercial revision or patch compatibility.',
            'A 512-byte prefix is inferred from file length only; interleaved/BS-X/special-chip images are not normalized.',
            'No jury, item, growth, event or map tables were decoded. Whole T03 original fidelity remains open.']}


def main() -> None:
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input',type=Path)
    parser.add_argument('--output',type=Path,required=True)
    args=parser.parse_args()
    if args.output.resolve()==args.input.resolve() or args.output.suffix.lower()!='.json':
        parser.error('Output must be a distinct JSON path; the input is never modified.')
    if not args.input.is_file() or args.input.stat().st_size>8*1024*1024+512:
        parser.error('Input missing or larger than the supported bound.')
    report=inspect_bytes(args.input.read_bytes())
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')


if __name__=='__main__':
    main()
