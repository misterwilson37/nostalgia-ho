// The Amiga skin beside Jake's captures of the real program (22 Nov 2026).
//
//   NODE_PATH=$(npm root -g) node tools/amiga-captures.js [--port=8790] [--lang=en|de] [--skill=novice] [--rules=dos]
//        [--caps=../nostalgia-ho-sources/audit/amiga-2.1/captures] [--out=dir] [--only=main,types,...]
//
// Serve the repo first (python3 -m http.server 8790). The page is opened at 1280 x 1024, so the Amiga screen is exactly 2 x 4 CSS
// pixels to its pixel (the tall-pixel look); a game is started (Big Bang, the name typed in), each view below is opened as a person
// opens it (its menu and item), and the remake's screen is sampled back to 640 x 256 at each pixel's centre and put above the capture
// named for it (captures/amiga21-jake-shotNNN.png in the sources repo: the English 2.1, Kickstart 3.1; docs/amiga-skin.md, "Against
// the English 2.1 captures"). Out: <out>/<view>.png (the remake, full size) and <out>/pair-<view>.png (capture above, remake below,
// both doubled). A view can also be a list of steps: see VIEWS.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const args = process.argv.slice(2), opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const PORT = +opt('port', 8790), LANG = opt('lang', 'en'), SKILL = opt('skill', 'novice'), RULES = opt('rules', '');
const CAPS = opt('caps', path.join(__dirname, '..', '..', 'nostalgia-ho-sources', 'audit', 'amiga-2.1', 'captures'));
const OUT = opt('out', 'amiga-captures-out'), ONLY = opt('only', '') ? opt('only').split(',') : null;
// a menu (its place in the bar: 1 Project … 6 Info, 0 being the remake's Ho!) and an item, as a person picks them
const pick = (i, re) => `(async () => {
  for (let k = 0; k < 4; k++) { const sc = document.querySelector('.scrim'); if (!sc) break; const b = [...sc.querySelectorAll('button')].find(b => /^(cancel|abbruch|ok, ok|ok)$/i.test(b.textContent.trim())); if (b) b.click(); await new Promise(r => setTimeout(r, 200)); }
  const b = [...document.querySelectorAll('#menubar .mbtn')][${i}]; document.getElementById('menubar').classList.add('am-menus'); b.click(); await new Promise(r => setTimeout(r, 120));
  const it = [...b.parentElement.querySelectorAll('.dropdown button')].find(x => new RegExp(${JSON.stringify(re)}).test(x.textContent));
  if (it) it.click(); else document.title = 'NO ITEM ${re}';
  document.getElementById('menubar').classList.remove('am-menus'); })()`;
const menu = (i) => `(() => { document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open')); document.getElementById('menubar').classList.add('am-menus'); [...document.querySelectorAll('#menubar .mbtn')][${i}].click(); })()`;
// view: [capture shot, steps (JS run in the page, one after another)]
const VIEWS = {
  main: [60, []],
  menu1: [53, [menu(1)]], menu2: [54, [menu(2)]], menu3: [55, [menu(3)]], menu4: [56, [menu(4)]], menu5: [57, [menu(5)]], menu6: [58, [menu(6)]],
  types: [66, [pick(3, '^(Ship Types|Schiffstypen)')]],
  newtype: [69, [pick(3, '^(New Ship Type|Neuer Schiffstyp)')]],
  roster: [70, [pick(3, '^(Fleet Roster|Liste der Flotten)')]],
  organize: [71, [pick(3, '^(Organize Ships|Flottenaufteilung)')]],
  build: [72, [pick(3, '^(Build Ships|Schiffbau)')]],
  compare: [73, [pick(4, '^(Compare|Spielervergleich)')]],
  players: [74, [pick(4, '^(Compare|Spielervergleich)'), `(() => { const b = [...document.querySelectorAll('.scrim button')].find(b => /^Info$/.test(b.textContent.trim())); b && b.click(); })()`]],
  stars: [141, [pick(4, '^(Star List|Liste der Sterne)')]],
  screen: [144, [pick(2, '^(ScreenMode|Bildschirm)')]],
  about: [58, [pick(6, '^(About|Über)')]],
  // a battle (shots 097-129): eight of your fighters put at the nearest computer's home, End Turn, the report caught as it plays
  // (it changes the game: keep it last, or alone with --only=battle)
  battle: [104, [`(() => { const a = HOAPI, G = a.G, me = a.me(), h = G.stars[me.homeStar];
      const e = G.players.filter(q => q.id !== a.ME).map(q => G.stars[q.homeStar]).sort((x, y) => HO.starDist(G, h.id, x.id) - HO.starDist(G, h.id, y.id))[0];
      const d = me.designs.find(x => x.type === 'fighter'); HO.addShipsToStar(G, a.ME, e.id, d, 8); a.renderPanel(); a.draw(); a.doEndTurn(); })()`,
    'new Promise(r => setTimeout(r, 2500))']],
  // (the last battle again, skipped to its end: run with battle, after it)
  battleEnd: [126, [`(() => { const a = HOAPI, bs = a.G.battles || []; if (bs.length) a.openBattle(bs[bs.length - 1].id); })()`, 'new Promise(r => setTimeout(r, 600))', `(() => { const b = document.querySelector('.am-battle .am-btn'); if (b) b.click(); })()`, 'new Promise(r => setTimeout(r, 600))']],
};
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1280, height: 1024 } });
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.addInitScript((lang) => { try { localStorage.setItem('ho5.language', lang); localStorage.setItem('ho5.language.at', '1'); } catch (e) { /* no storage */ } }, LANG);
  await p.goto(`http://localhost:${PORT}/?skin=amiga`); await p.waitForTimeout(2500);
  await p.evaluate(() => document.getElementById('tnew').click()); await p.waitForTimeout(800);
  await p.evaluate(([skill, rules]) => {
    const f = document.querySelector('form.newgame');
    if (rules) { const r = f.querySelector('[name=rules]'); if (r) r.value = rules; }
    for (const n of ['d_skill', 'w_skill']) { const k = f.querySelector(`[name=${n}]`); if (k) { k.value = skill; k.dispatchEvent(new Event('change', { bubbles: true })); } }
    const m = f.querySelector('[name=modern]'); if (m) { m.checked = false; m.dispatchEvent(new Event('change', { bubbles: true })); }
    const b = [...document.querySelectorAll('.scrim button, .win button')].find(b => b.offsetParent && /^(big bang|urknall)/i.test(b.textContent.trim()));
    if (b) b.click(); else f.querySelector('button[type=submit]').click();
  }, [SKILL, RULES]);
  // the Registration and Enter game windows: a name, then Ok
  for (let k = 0; k < 40; k++) {
    const r = await p.evaluate(() => { const i = document.querySelector('.am-enname input, input.am-enname'); if (i && !i.value) { i.value = 'Jake'; i.dispatchEvent(new Event('input', { bubbles: true })); }
      const b = [...document.querySelectorAll('.scrim button, .win button')].find(b => b.offsetParent && /^(ok|ok, ok|enter|nope|nö)$/i.test(b.textContent.trim()) && !b.disabled); if (b) { b.click(); return true; } return false; });
    if (!r && k > 4 && await p.evaluate(() => !!(window.HOAPI && HOAPI.G))) break;
    await p.waitForTimeout(350);
  }
  await p.waitForTimeout(800);
  for (const [name, [shot, steps]] of Object.entries(VIEWS)) {
    if (ONLY && !ONLY.includes(name)) continue;
    await p.evaluate(() => { const a = HOAPI; a.closeModal && a.closeModal(); document.querySelectorAll('.scrim').forEach(s => s.remove()); document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open')); document.getElementById('menubar').classList.remove('am-menus'); });
    await p.waitForTimeout(200);
    for (const js of steps) { await p.evaluate(js); await p.waitForTimeout(700); }
    const t = await p.title(); if (/^NO ITEM/.test(t)) console.log(name + ': ' + t);
    const file = path.join(OUT, name + '.png'); await p.screenshot({ path: file });
    const cap = path.join(CAPS, `amiga21-jake-shot${String(shot).padStart(3, '0')}.png`);
    const pair = await p.evaluate(async ([rem, capData]) => {
      const load = (src) => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
      const r = await load(rem), c = capData ? await load(capData) : null;
      const k = document.createElement('canvas'); k.width = 1280; k.height = 1048; const x = k.getContext('2d'); x.imageSmoothingEnabled = false;
      x.fillStyle = '#f00'; x.fillRect(0, 0, 1280, 1048);
      if (c) x.drawImage(c, 0, 0, 640, 256, 0, 0, 1280, 512);
      // the remake sampled at each Amiga pixel's centre (2 x 4 CSS pixels), then doubled
      const s = document.createElement('canvas'); s.width = 1280; s.height = 1024; s.getContext('2d').drawImage(r, 0, 0);
      const d = s.getContext('2d').getImageData(0, 0, 1280, 1024).data, o = x.createImageData(640, 256);
      for (let y = 0; y < 256; y++) for (let X = 0; X < 640; X++) { const i = ((y * 4 + 2) * 1280 + X * 2 + 1) * 4, j = (y * 640 + X) * 4; o.data[j] = d[i]; o.data[j + 1] = d[i + 1]; o.data[j + 2] = d[i + 2]; o.data[j + 3] = 255; }
      const t = document.createElement('canvas'); t.width = 640; t.height = 256; t.getContext('2d').putImageData(o, 0, 0);
      x.drawImage(t, 0, 0, 640, 256, 0, 536, 1280, 512);
      return k.toDataURL('image/png');
    }, ['data:image/png;base64,' + fs.readFileSync(file).toString('base64'), fs.existsSync(cap) ? 'data:image/png;base64,' + fs.readFileSync(cap).toString('base64') : null]);
    fs.writeFileSync(path.join(OUT, 'pair-' + name + '.png'), Buffer.from(pair.split(',')[1], 'base64'));
    console.log(name, '-> shot', shot);
  }
  await b.close();
})();
