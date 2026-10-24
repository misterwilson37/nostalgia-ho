#!/usr/bin/env python3
"""Stand-in sounds: the turn timer's, for skins whose version had no time limit.

  python3 tools/skins/fill_sounds.py           writes them and lists them in each manifest
  python3 tools/skins/fill_sounds.py --check   says whether they're up to date (exit 1 if not)

The time limit (4.0.5's and 5.0.5's rules) plays 7004 (bonus time) and 7012 (time is almost
up). 1.2, 2.0 and 3.0.1 had no time limit, so their skins have neither. As with pictures
(fill_art.py), each comes from the nearest later version that has it: the Mac skins from the
Mac 4.0.5's own 7004 and 7012; the DOS and Amiga skins from the Windows 4.0.5's (bonus,
timeup), the DOS line's next version. The filter makes it sound like its skin's: 8-bit mono
at 11025 Hz, as most of their own sounds are. Needs ffmpeg.
"""
import json, os, subprocess, sys, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MAC4 = {7004: 'assets/skins/mac4/sounds/7004.wav', 7012: 'assets/skins/mac4/sounds/7012.wav'}
W95 = {7004: 'assets/skins/w95/sounds/bonus.wav', 7012: 'assets/skins/w95/sounds/timeup.wav'}
TARGETS = {s: MAC4 for s in ('mac12', 'mac2', 'mac2c', 'mac3', 'mac3c')}
TARGETS.update({'dos': W95, 'amiga': W95})


def convert(src):
    return subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(ROOT, src), '-ac', '1', '-ar', '11025',
                           '-acodec', 'pcm_u8', '-map_metadata', '-1', '-fflags', '+bitexact', '-f', 'wav', '-'],
                          check=True, capture_output=True).stdout


def main(check):
    bad = False
    for skin, srcs in TARGETS.items():
        d = os.path.join(ROOT, 'assets', 'skins', skin)
        man_path = os.path.join(d, 'manifest.json'); raw = open(man_path).read(); man = json.loads(raw)
        stale = []
        for n, src in srcs.items():
            data, p = convert(src), os.path.join(d, 'sounds', '%d.wav' % n)
            if not os.path.exists(p) or open(p, 'rb').read() != data:
                stale.append(n)
                if not check: open(p, 'wb').write(data)
        nums = sorted(set(man['sounds']) | set(srcs))
        if nums != man['sounds']:
            stale.append('manifest')
            if not check:
                man['sounds'] = nums
                open(man_path, 'w').write(json.dumps(man, indent=1) + ('\n' if raw.endswith('\n') else ''))
        print(f"{skin}: {'up to date' if not stale else ('out of date: ' if check else 'wrote ') + ', '.join(map(str, stale))}")
        bad |= bool(stale)
    return 1 if check and bad else 0


if __name__ == '__main__':
    sys.exit(main('--check' in sys.argv))
