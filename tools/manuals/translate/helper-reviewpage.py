# Version 1.0.1 (1.0.1: the brief says quotes from an official translation are kept as shipped). Run from the repo root: python3 tools/manuals/translate/helper-reviewpage.py <out-dir> [codes...]
# Writes review-<code>-<language>.html: every notes line and manual run beside its English, with a review brief for a
# second reader (an AI or a native speaker). The page is made from the tables, so regenerate it after any fix; don't keep copies.
import json,glob,re,html,sys,subprocess
W='docs/translations-notes/manuals/'
LANG={'fr':('French','français','vous'),'de':('German','Deutsch','Sie'),'es':('Spanish','español','tú'),'tr':('Turkish','Türkçe','sen')}
MK=re.compile(r'\{/?[a-z:_-]+\d+/?\}')
def clean(t):
    t=re.sub(r'\{br\d+/\}',' / ',t); t=MK.sub('',t); return re.sub(r'\s+',' ',t).strip()
NODE = "global.window=global; global.HOUI={add:r=>{global.R=(global.R||[]).concat(r)}}; require('./js/ui-text-notes-%s.js'); const c={fr:1,de:2,tr:3,es:4}[process.argv[1]]; console.log(JSON.stringify(global.R.map(r=>[r[0],r[c]])))"
MAN=[('5.0.5','Spaceward Ho! 5 manual (Mac OS 9 and X, 2003)'),('4.0.5','Spaceward Ho! 4.0.5 help (Windows 95, 1996)'),('3.0.1','Spaceward Ho! 3.0 printed manual (Mac, 1992–93)'),('2.0-dos','Spaceward Ho! 2.0 manual (DOS / Windows 3.1, 1993)')]
OFF={'fr':'the official French of the Mac 1.2 and the iOS / Android games','de':'the official German of the DOS / Amiga 2.0','tr':'the official Turkish of the iOS / Android games'}
def page(code):
    name,native,voice=LANG[code]; E=html.escape
    OFFICIAL=(f'Where a line quotes the game’s own text from {OFF[code]} (a message, a joke, a button), that quotation is kept exactly as the official translation wrote it, even where it misses a pun or has a mistake: it is what a {name} player sees in the game. ') if code in OFF else ''
    out=[]; total=0
    out.append(f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Review: the remake's {name} translations of Spaceward Ho!'s notes and manuals</title>
<style>body{{font:15px/1.45 system-ui,sans-serif;max-width:1200px;margin:2em auto;padding:0 1em;color:#222}}table{{border-collapse:collapse;width:100%;margin-bottom:2em}}td,th{{border:1px solid #ccc;padding:.35em .5em;vertical-align:top;text-align:left}}th{{background:#eee}}td.id{{white-space:nowrap;color:#666;font:12px monospace}}td.en{{width:46%;color:#444}}h2{{margin-top:2.5em;border-bottom:2px solid #444}}.box{{background:#f6f6ee;border:1px solid #cc9;padding:1em 1.3em}}</style></head><body>
<h1>Review request: the {name} ({native}) translation of Spaceward Ho!’s supplemental texts</h1>
<div class="box">
<p><b>What this is.</b> Nostalgia Ho! is a fan-made, developer-approved web remake of the 1990s strategy game <i>Spaceward Ho!</i> (Delta Tao Software). Its long supplemental texts were translated from English into {name} by Claude (an AI made by Anthropic). The remake’s developer does not speak {name}, so nobody has checked this translation. You are asked to be that check.</p>
<p><b>What is on this page.</b> Every translated line, each beside its English source: first the in-game “About this version” and “Patch notes” texts, then four manuals of different game versions. The four manuals share many passages, so the same sentence may appear several times; the {name} is meant to be the same each time. Formatting (links, bold, pictures) has been removed from both columns, and “ / ” marks a line break. Rows marked “picture” are image descriptions (alt text).</p>
<p><b>Please look for:</b> mistranslations (the meaning differs from the English); grammar, spelling or agreement errors; unnatural or stiff phrasing a native speaker would not write; inconsistent terms for the same game thing; and jokes or idioms that no longer land, with a better {name} rendering.</p>
<p><b>Already decided, please don’t flag:</b> the address form is “{voice}” throughout. Game, book and product titles stay in English (books get a translated title in brackets). Sounds the game says aloud (“Hyahh!”, “Whoa!”, “Check this out!”) stay English, and so does the quoted Clash lyric “Should I stay, or should I go?” in the 5.0.5 manual. Menu and button names follow the game’s own {name} interface, even where another word would also work. Old phone numbers, addresses, and 1990s online-service instructions are translated as they stood. {OFFICIAL}The English source has its own oddities (a heading cut off mid-word, “Ouput”), which are mirrored or fixed on purpose.</p>
<p><b>How to answer.</b> In English, one item per problem: the row’s ID (first column), the current {name} text (or the part of it at fault), your suggested {name}, and a short reason. End with an overall judgement of the translation’s quality. If a row is fine, say nothing about it.</p>
</div>''')
    rows=json.loads(subprocess.check_output(['node','-e',NODE%code,code]))
    out.append(f'<h2>In-game notes: “About this version” and “Patch notes” ({len(rows)} lines)</h2><table><tr><th>ID</th><th>English</th><th>{name}</th></tr>')
    for i,(en,t) in enumerate(rows,1):
        out.append(f'<tr><td class="id">notes-{i}</td><td class="en">{E(en)}</td><td lang="{code}">{E(t or "")}</td></tr>'); total+=1
    out.append('</table>')
    for m,title in MAN:
        segs=json.load(open(W+m+'/segments.json')); tr={}
        for f in glob.glob(W+m+f'/{code}-*.tsv'):
            for l in open(f,encoding='utf8'):
                if l.strip(): i,t=l.rstrip('\n').split('\t',1); tr[int(i)]=t
        out.append(f'<h2>{E(title)} ({len(segs)} lines)</h2><table><tr><th>ID</th><th>English</th><th>{name}</th></tr>')
        for x in segs:
            en=x['en']; t=tr[x['id']]; pic=en.startswith('@alt:')
            en=en[5:] if pic else en
            ce,ct=clean(en),clean(t)
            if not re.search(r'[A-Za-zÀ-ÿ]',ce): continue
            out.append(f'<tr><td class="id">{m} #{x["id"]}{" (picture)" if pic else ""}</td><td class="en">{E(ce)}</td><td lang="{code}">{E(ct)}</td></tr>'); total+=1
        out.append('</table>')
    out.append('</body></html>')
    p=f'{OUT}/review-{code}-{name.lower()}.html'
    open(p,'w',encoding='utf8').write('\n'.join(out)); print(p,total,'rows')
OUT=sys.argv[1]
for c in (sys.argv[2:] or list(LANG)): page(c)
