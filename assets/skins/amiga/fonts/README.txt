Topaz_a1200_v1.0.raw: Topaz (Kickstart 2.x), from "Multi Platform Amiga Fonts" v1.02 by dMG of TrueSchool / Divine Stylers (https://github.com/rewtnull/amigafonts):
256 glyphs of 8 x 16 pixels (each of Topaz's 8 rows twice), the leftmost pixel the top bit, in ISO 8859-1 order.
tools/amiga-topaz.py builds assets/fonts/Topaz.woff2 and TopazTall.woff2 (the Amiga skin's file requester) from it:  python3 tools/amiga-topaz.py assets/skins/amiga/fonts/Topaz_a1200_v1.0.raw

Licence, from the pack's README (section 14, "Legal stuff"): "These fonts are released under the GPL-FE license: http://www.gnu.org/licenses/gpl-faq.html#FontException"
(the GNU General Public License with the font exception: a document or program that embeds the font is not itself made subject to the GPL; the font files stay under it).
"Topaz is (c) AmigaInc. ttf, fon, eot, raw & psf v1/v2 versions of Topaz are (c) dMG/t!s^dS!"
The two woff2 files in assets/fonts/ are derived from this raw file, so they are under the same terms.
