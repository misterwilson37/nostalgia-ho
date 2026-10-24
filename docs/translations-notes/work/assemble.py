# Version 1.1.0 (was unversioned): each language's file has its own version (V); a row edit is a patch bump.
import sys,os
V={'fr':'1.0.1 (1.0.1: the Gemini review’s French fixes, in the 6 rows that share their wording)','de':'1.0.1 (1.0.1: the Gemini review’s German fixes, in the 4 rows that share their wording)','tr':'1.0.1 (1.0.1: the Gemini review’s Turkish fixes, in the 5 rows that share their wording)','es':'1.0.1 (1.0.1: the Gemini review’s seven Spanish fixes, in the 15 rows that share their wording)'}
HERE=os.path.dirname(os.path.abspath(__file__))
lang=sys.argv[1]
H={
'fr':("French","en français","// French \"vous\", 1.2F's and the iOS game's words (vaisseau, flotte, recycler,\n// évacuer, Épargne, Fin Tour; Transport, Croiseur, Épouvante for the classes)."),
'de':("German","auf Deutsch","// German \"Sie\", the German DOS 2.0's words wherever it has them, and the remake's\n// German for the rest (Schiff, Flotte, verschrotten, räumen / verlassen,\n// Meteoritenschauer, Funkspruch; Späher, Kampfschiff, Kolonieschiff,\n// Schlachtschiff, Tanker, Bioschiff, Täuschschiff; Weite, Tempo, Waffen,\n// Schilder, Mini, Radikal), numbers as \"1.234\", quotes „ “."),
'tr':("Turkish","Türkçe",'// Turkish "sen", the iOS game\'s words wherever it has them (tr.lproj) and the remake\'s Turkish\n// (js/lang-remake.js, js/ui-text.js) for the rest (gemi, filo, hurdaya çıkarmak, Tahliye Et / Terk Et, meteor yağmuru,\n// Birikim, Gemi Tasarrufu, Sıran Bitti; İzci, Savaş, Koloni Gemisi, Aba, Tanker, Biyolojik, Tuzak; Menzil, Hız,\n// Silâhlar, Kalkanlar, Mini, Radikal), numbers as "1.234", percentages "%15", quotes “ ”; in prose a suffix\n// after a name or number takes the apostrophe and agrees with it (3.0.1’in, 4.0.5’te, Mac’te).'),
'es':("Spanish","en español","// Spanish \"tú\", the remake's own Spanish (js/lang-remake.js, js/ui-text.js) in the spirit of the official\n// translations (nave, flota, desguazar, evacuar / abandonar, lluvia de meteoritos; Explorador, Caza, Nave colonia,\n// Acorazado, Cisterna, Bionave, Señuelo; Alcance, Velocidad, Armas, Escudos, Miniaturización, Radical), numbers as\n// \"1.234\" and \"$12.345M\", quotes “ ”.")
}
name,_,voice=H[lang]
cols=', '.join(name if c==lang else 'null' for c in ['English']) 
cols='English, '+', '.join(name if c==lang else 'null' for c in ['fr','de','tr','es'])
rows=open(f'{HERE}/rows-{lang}.txt',encoding='utf8').read()
head=f"""// Spaceward Ho! web remake — the version notes and patch notes in {name}.
// Version {V[lang]}
//
// The long English documents' first translation (docs/translations.md, "What
// stays English"): every line of the Ho menu's "About this version" (the
// lists in js/version-notes.js, Delta Tao's change lists included) and of
// "Patch notes" (each version's rs.fixes titles and texts), in {name}.
//
// Rows as js/ui-text.js, with only the {name} column filled: [{cols}] (the other columns come with their own files;
// HOUI.add leaves a null alone). The English is the source line exactly as
// js/version-notes.js and the rulesets write it, so HOUI.tr finds it; a line
// edited there needs its row edited here: node tools/notes-check.js says
// which (docs/translations-notes/README.md). Every row is the remake's own
// translation (no official {name} exists for these notes), in the official
// translations' voice:
{voice}
// Delta Tao's own change lists are translated from their English; the window
// says so where it shows them.
(function (root) {{
'use strict';
root.HOUI.add([
"""
# the column position differs by language: rows already carry null placeholders in the right column
open(f'{HERE}/../../../js/ui-text-notes-{lang}.js','w',encoding='utf8').write(head+rows+"\n]);\n})(typeof window !== 'undefined' ? window : globalThis);\n")
