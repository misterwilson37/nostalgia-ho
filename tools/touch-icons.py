#!/usr/bin/env python3
"""The home-screen (apple-touch) icons: assets/icons/<skin>-touch.png, 180x180, opaque.

iOS fills a transparent icon with black, so each skin's icon (assets/icons/<skin>.png, the original's own
application icon) is put on a background of the original system's desktop colour, centred, the pixel art
scaled by a whole number with nearest-neighbour (no smoothing). Paintings (5.0.5's, iOS's) are not scaled
(1x); the Android skin keeps the default apple-touch-icon.png (its own icon, 180 px already).

    python3 -I tools/touch-icons.py          (needs Pillow)

js/skins.js applyIcon points <link rel="apple-touch-icon"> at these when a skin has one.
"""
import os, shutil
from PIL import Image

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'icons')
# skin: (background, the whole number the stored PNG was enlarged by from the original pixels or None)
# backgrounds: the original system's desktop (Mac System 7: the grey / blue-grey desktop; Windows 3.1: the Program Manager's
# grey; Windows 95: the teal desktop; Workbench 2: grey; Palm: the launcher's white; Mac OS X: Aqua blue)
SKINS = {
    'mac12': ('#aaaaaa', 4), 'mac2': ('#aaaaaa', 4), 'mac3': ('#aaaaaa', 4), 'mac4': ('#aaaaaa', 4),
    'mac2c': ('#8888bb', 4), 'mac3c': ('#8888bb', 4), 'mac4c': ('#8888bb', 4),
    'dos': ('#c0c0c0', 4), 'w95': ('#008080', 4), 'palm': ('#ffffff', 2), 'amiga': ('#aaaaaa', 2),
    'classic': ('#3b6ea8', None), 'ios': ('#000000', None),
}
S = 180

def native(im, f):
    """the icon at its own pixel size (stored enlarged by f), checked to be exactly f-times blocks"""
    if not f:
        return im, 1
    w, h = im.size
    n = im.resize((w // f, h // f), Image.NEAREST)
    assert n.resize((w, h), Image.NEAREST).tobytes() == im.tobytes(), 'not an exact %dx enlargement' % f
    return n, f

def make(skin):
    bg, f = SKINS[skin]
    im = Image.open(os.path.join(D, skin + '.png')).convert('RGBA')
    n, _ = native(im, f)
    k = max(1, S // max(n.size))
    big = n.resize((n.width * k, n.height * k), Image.NEAREST)
    out = Image.new('RGBA', (S, S), bg)
    out.alpha_composite(big, ((S - big.width) // 2, (S - big.height) // 2))
    out.convert('RGB').save(os.path.join(D, skin + '-touch.png'), optimize=True)
    return skin, n.size, k

if __name__ == '__main__':
    for s in SKINS:
        print('%-8s native %s x%d' % make(s))
    shutil.copyfile(os.path.join(D, 'apple-touch-icon.png'), os.path.join(D, 'android-touch.png'))
    print('android  (the default apple-touch-icon.png)')
