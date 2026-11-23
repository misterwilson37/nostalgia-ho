// Mac 3.0.1's end of the game and Armageddon, beside Jake's captures (23 Nov 2026).
//
//   NODE_PATH=$(npm root -g) node tools/mac301-end.js elim,won,namestar,close,arm1,arm2 [skin] [rules]
//   NODE_PATH=$(npm root -g) node tools/mac301-end.js lost
//
// Serve the repo first (python3 -m http.server 8790). Starts a game in the 3.0.1 colour skin (mac3c, rules 301) at 1280 x 960 and
// writes m301_<view>.png for each view, in order: elim (another player's elimination bubble, shot 149), won (the win alert, 150),
// namestar (OK on it: Name a Star, 151), close, arm1 (Armageddon's first question, 152), arm2 (OK on it: the second, 153), lost
// (your elimination, 195). Captures: audit/mac-3.0.1/captures/mac301-jake-shotNNN.png in the sources repo. The Armageddon on the map
// (154-163): start a game, HO.setArmageddon(G, ME, true), End Turn, Continue, and step through the reports (docs/status-301.md).
const { chromium } = require('playwright');
const views = {
  elim: `(() => { const a=HOAPI,G=a.G; const q=G.players.find(x=>x.id!==a.ME); a.UI.inbox=[{text: q.name+' has just been eliminated from the game.', icon:'p3040'}]; a.UI.msgIdx=0; a.renderMsg(); })()`,
  won: `(() => { const a=HOAPI,G=a.G; G.over=true; G.winner=a.ME; G.players.forEach(q=>{ if(q.id!==a.ME) q.alive=false; }); a.UI.inbox=[{text:'Congratulations! You have just won the game.', big:'p3030'}]; a.UI.msgIdx=0; a.renderMsg(); })()`,
  namestar: `(() => { const b=document.querySelector('.scrim button'); if(b) b.click(); })()`,
  arm1: `(() => { HOAPI.toggleArmageddon(); })()`,
  arm2: `(() => { const b=document.querySelector('.scrim button.def20'); if(b) b.click(); })()`,
  lost: `(() => { const a=HOAPI,G=a.G; a.me().alive=false; a.UI.inbox=[{text:'You have just been eliminated from the game.', big:'p3040', icon:'p3040'}]; a.UI.msgIdx=0; a.renderMsg(); })()`,
};
const order = (process.argv[2] || "elim,won,namestar,close,arm1,arm2").split(','), SKIN = process.argv[3] || 'mac3c', RULES = process.argv[4] || '301';
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 960 } });
  p.on('pageerror', e => console.log('PAGEERROR', e.message));
  await p.goto(`http://localhost:8790/?skin=${SKIN}`); await p.waitForTimeout(2500);
  await p.evaluate(() => document.getElementById('tnew').click()); await p.waitForTimeout(800);
  await p.evaluate((r) => { const f=document.querySelector('form.newgame'); const rr=f.querySelector('[name=rules]'); if (rr) rr.value=r; f.querySelector('button[type=submit]').click(); }, RULES);
  for (let k=0;k<30 && !await p.evaluate(()=>!!(window.HOAPI&&HOAPI.G));k++){ await p.keyboard.press('Enter'); await p.waitForTimeout(300);} 
  for (let i=0;i<10;i++){ if(!await p.evaluate(()=>!!document.querySelector('.scrim'))) break; await p.keyboard.press('Enter'); await p.waitForTimeout(300);} 
  await p.waitForTimeout(800);
  console.log(await p.evaluate(()=>HOAPI.G.rules+' '+(window.HOSKINS&&HOSKINS.current)));
  for (const v of order) { if (v==='close') { await p.evaluate(()=>{ try{HOAPI.closeModal();}catch(e){} }); continue; } await p.evaluate(views[v]); await p.waitForTimeout(900); await p.screenshot({ path: `m301_${v}.png` }); }
  await b.close(); })();
