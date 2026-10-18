// The online parts through the page (Chromium, Playwright), against the
// Firebase emulators: node tools/online-test.js [--url=http://127.0.0.1:8801/]
//   [--auth=8811] [--firestore=8810] [--headed]
// Needs the emulators running (docs/online.md, "Testing") and the site served
// at --url (python3 -m http.server 8801). Prints "online ok" or each failure.
//
// It checks, in order:
//  1. a fresh visit loads no Firebase at all (no SDK fetched, no account made);
//  2. the page plays with Firebase unreachable, signed in before or not;
//  3. guest sign-in from the title's button; a game's End Turn uploads it;
//  4. the guest upgraded with an email and password keeps its uid and saves;
//  5. sign out, sign in again in another browser (context): Account saves
//     lists the game and opens it; a turn there makes the account's copy
//     newer, and Continue in the first browser asks which copy to play;
//  6. Delete in Account saves;
//  7. the Hall: a 4.0.5 game put in the Hall of Shame while signed in goes
//     to the shared Hall; the Everyone view lists it;
//  8. the Hall offer: not signed in, the offer comes after the game's
//     windows; Play as a guest posts that entry, and a name the decency
//     filter refuses goes up as "Anonymous Cowboy"; Not now posts nothing;
//  9. the saves offer from Saved Games, and its Don't ask again;
// 10. Google sign-in (the emulator's own account chooser in the popup);
// 11. an email account: create, sign out, sign in, a wrong password, Forgot password;
// 12. shared names: the names file and Name a Star posted to the version's
//     pool, merged into another player's New Game (not with the preference
//     off), a refused name never posted, and Delete my account removing them;
// 13. online play: a 2-player 4.0.5 game and a 3-player 5.0.5 game, each
//     player in their own browser (context), hosted from New Game's Play
//     online…, joined by the ?join= link, through several turns with battles
//     (moves by hand: the bars, a ship built; the rest by Auto-play this
//     turn), a page reloaded mid-turn, a player who doesn't move and the
//     host's End turn for…, a resignation; after every turn every browser's
//     state digest must be the same, each must have played the orders itself
//     to the same game, and each turn's orders must give the page's own game.
'use strict';
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { console.error('Playwright is needed (npm i -g playwright; NODE_PATH=$(npm root -g)).'); process.exit(2); }
const args = process.argv.slice(2);
const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
const SHOTS = opt('shots', null); // a folder for screenshots when an online play step fails
const URL0 = opt('url', 'http://127.0.0.1:8801/'), AUTH = +opt('auth', 8811), FS = +opt('firestore', 8810);
const PAGE = `${URL0}index.html?skin=classic&emulator=${AUTH},${FS}`;
const PROJECT = 'nostalgia-ho';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const fails = [];
let checks = 0;
const check = (ok, what) => { checks++; if (!ok) { fails.push(what); console.log('FAIL', what); } else console.log('ok  ', what); };

// the emulator's data, read past the rules (its owner token)
const fsGet = (path) => fetch(`http://127.0.0.1:${FS}/v1/projects/${PROJECT}/databases/(default)/documents/${path}`, { headers: { Authorization: 'Bearer owner' } }).then(r => r.json());
const fsList = (path) => fsGet(path).then(j => j.documents || []);

async function fresh(browser, o) {
  o = o || {};
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 800 } });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => fails.push(`page error${o.name ? ' (' + o.name + ')' : ''}: ${e.message}`));
  page.on('dialog', d => d.dismiss());
  const fb = [];
  page.on('request', (r) => { const u = r.url(); if (/vendor\/firebase\.js|googleapis|firebaseapp|:881[01]\//.test(u)) fb.push(u); });
  if (o.offline) await ctx.route(/vendor\/firebase\.js|googleapis\.com|firebaseapp\.com|127\.0\.0\.1:881[01]/, r => r.abort());
  if (o.init) await ctx.addInitScript(o.init);
  await page.goto(o.url || PAGE);
  await page.waitForSelector('#titlescreen:not(.loading) .tbtns button', { timeout: 30000 });
  return { ctx, page, fb };
}
// a game put in the browser save, as New Game would leave it
async function putGame(page, o) {
  await page.evaluate((o) => {
    const G = HO.newGame(Object.assign({ rules: 'original', seed: 7, size: 'small', computers: 2, iq: 'average', shape: 'random', name: 'Ann' }, o));
    G.gameId = o.gameId || 1700000000000;
    // out: the human's colonies and fleets given away, so the next turn
    // eliminates them (4.0.5's doGameEndStuff) and puts them in the Hall of Shame
    if (o.out) { for (const s of G.stars) if (s.owner === 0) s.owner = 1; G.fleets = G.fleets.filter(f => f.owner !== 0); delete G.players[0].slots301; delete G.players[0].colOrder; }
    // win: the computers' colonies and fleets given away the other way, so the human wins next turn
    if (o.win) { for (const s of G.stars) if (s.owner > 0) { s.owner = -1; s.pop = 0; } G.fleets = G.fleets.filter(f => f.owner === 0); for (const p of G.players) if (!p.human) { delete p.slots301; delete p.colOrder; } }
    localStorage.setItem('ho5.save', HO.save(G)); localStorage.setItem('ho5.save.when', String(Date.now()));
  }, o);
}
// New Game through its window: o.version, o.rules, o.name; the classic skin
// kept (no reload); o.wait: a condition to wait for before Create galaxy
async function newGameVia(page, o) {
  await page.click('#tnew');
  await page.waitForSelector('.ngwin form.newgame');
  await page.selectOption('.ngwin select[name=version]', o.version);
  await page.selectOption('.ngwin select[name=rules]', o.rules);
  await page.fill('.ngwin input[name=name]', o.name);
  if (await page.$('.ngwin select[name=skin] option[value=classic]')) await page.selectOption('.ngwin select[name=skin]', 'classic');
  if (o.wait) await waitFor(o.wait, 15000);
  await page.click('.ngwin button:text-is("Create galaxy")');
  await page.waitForSelector('#msg .card, #msg .clock', { timeout: 15000 });
}
async function quitToTitle(page) {
  for (let i = 0; i < 5 && await page.$('.scrim'); i++) await page.keyboard.press('Escape');
  await page.click('#menubar .mbtn:text-is("Game")'); await page.click('.dropdown.open [role=menuitem]:text-is("Quit to title")');
  await page.waitForSelector('#titlescreen:not([hidden])');
}
async function continueGame(page) {
  await page.reload();
  await page.waitForSelector('#tcont:not([hidden])', { timeout: 30000 });
  await page.click('#tcont');
}
// click through the reports, then End Turn
async function endTurn(page) {
  for (let i = 0; i < 60; i++) {
    if (await page.$('.scrim')) await page.keyboard.press('Escape');
    if (await page.$('#msg .clock')) break;
    const c = await page.$('#msg .card:not(.end)'); if (c) await c.click(); else await sleep(100);
  }
  await page.click('#msg .clock');
  await sleep(500);
}
async function settle(page) {
  for (let i = 0; i < 60; i++) {
    if (await page.$('#msg .clock') || await page.$('#msg .card.end')) return;
    const c = await page.$('#msg .card:not(.end)'); if (c) await c.click(); else await sleep(100);
  }
}
const uidOf = (page) => page.evaluate(() => HOCLOUD.user && HOCLOUD.user.uid);
const waitFor = async (fn, ms) => { const t = Date.now() + (ms || 10000); while (Date.now() < t) { const v = await fn(); if (v) return v; await sleep(200); } return null; };
async function menu(page, top, item) {
  if (top === 'Ho') await page.click('#menubar .logo'); else await page.click(`#menubar .mbtn:text-is("${top}")`);
  await page.click(`.dropdown.open [role=menuitem]:text-is("${item}")`);
}
async function signInEmail(page, email, pw, create) {
  await page.click('#tacct');
  await page.waitForSelector('.cloudform');
  await page.fill('.cloudform input[type=email]', email);
  await page.fill('.cloudform input[type=password]', pw);
  await page.click(`.cloudform button:text-is("${create ? 'Create account' : 'Sign in'}")`);
  await waitFor(() => page.evaluate(() => !!(HOCLOUD.user && !HOCLOUD.user.anonymous)));
  await page.keyboard.press('Escape');
}

(async () => {
  await fetch(`http://127.0.0.1:${FS}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
  await fetch(`http://127.0.0.1:${AUTH}/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });
  const browser = await chromium.launch({ headless: !args.includes('--headed') });
  // --only=names (or online): just that part
  const only = opt('only', null);
  let A = null, B = null;
  if (!only) {
  // 1. a fresh visit: nothing online
  {
    const { ctx, page, fb } = await fresh(browser, { name: 'fresh' });
    await putGame(page, {}); await continueGame(page); await endTurn(page);
    await sleep(1000);
    check(fb.length === 0, 'a fresh visit fetches nothing from Firebase (and no SDK): ' + fb.join(' '));
    check(await page.evaluate(() => !window.HOFB && !HOCLOUD.user), 'no SDK and no account after playing a turn');
    await page.click('#menubar .mbtn:text-is("Game")'); await page.click('.dropdown.open [role=menuitem]:text-is("Quit to title")');
    check(await page.textContent('#tacct') === 'Sign in', 'the title shows a Sign in button');
    check(await page.$('.tcard h1') && await page.$('.tcard .ver') && await page.$('.tcard .by') && await page.$('.tcard .madeby') && await page.$('.tcard .credit'), 'the title keeps its heading, version and credits');
    await ctx.close();
  }
  // 2. Firebase unreachable: a new player, and one who was signed in before
  for (const was of [false, true]) {
    const { ctx, page } = await fresh(browser, { name: 'offline', offline: true, init: was ? "localStorage.setItem('ho5.cloud.was','1');localStorage.setItem('ho5.cloud.name','Ann')" : null });
    await putGame(page, {}); await continueGame(page); await endTurn(page); await settle(page);
    const year = await page.evaluate(() => JSON.parse(localStorage.getItem('ho5.save')).year);
    check(year > 0 && await page.$('#msg .clock, #msg .card'), `the game plays with Firebase unreachable${was ? ' (signed in before)' : ''}`);
    await menu(page, 'Ho', 'Account…');
    await page.waitForSelector('.account p:not(.sub)', { timeout: 30000 });
    check(/Couldn’t load the account service/.test(await page.textContent('.account')), 'Account says plainly when the service can’t be reached');
    await ctx.close();
  }

  // 3. guest, and a turn's upload
  A = await fresh(browser, { name: 'A' });
  await A.page.click('#tacct');
  await A.page.waitForSelector('.cloudform');
  await A.page.click('.cloudform button:text-is("Play as a guest")');
  const guest = await waitFor(() => uidOf(A.page));
  check(!!guest, 'Play as a guest signs in');
  await A.page.keyboard.press('Escape');
  check(/Guest/.test(await A.page.textContent('#tacct')), 'the title button names the guest');
  await putGame(A.page, { rules: '405', gameId: 1700000000001 });
  await continueGame(A.page); await endTurn(A.page);
  const saves = await waitFor(() => fsList(`users/${guest}/saves`).then(L => L.length ? L : null));
  check(saves && saves.length === 1, 'End Turn uploads the game to users/{uid}/saves');
  const f = saves ? saves[0].fields : {};
  check(f.rules && f.rules.stringValue === '405' && f.enc.stringValue === 'gzip' && +f.size.integerValue > 1000 && f.data.bytesValue && f.updated.timestampValue && f.edition.stringValue, 'the save has its fields and gzipped data');
  const year1 = f.year ? +f.year.integerValue : 0;
  // nothing changed: no new write
  const upd1 = f.updated && f.updated.timestampValue;
  await A.page.evaluate(() => { HOCLOUD.noteSave(() => null); });
  await A.page.evaluate(() => { const ev = new Event('visibilitychange'); document.dispatchEvent(ev); });
  await sleep(800);
  const again = await fsList(`users/${guest}/saves`);
  check(again[0].fields.updated.timestampValue === upd1, 'an unchanged game isn’t uploaded again');

  // 4. upgrade the guest
  await A.page.click('#menubar .logo'); await A.page.click('.dropdown.open [role=menuitem]:text-is("Account…")');
  await A.page.click('.account button:text-is("Keep this account…")');
  await A.page.fill('.cloudform input[type=email]', 'ann@example.com');
  await A.page.fill('.cloudform input[type=password]', 'secret123');
  await A.page.click('.cloudform button:text-is("Add this email")');
  await waitFor(() => A.page.evaluate(() => HOCLOUD.user && !HOCLOUD.user.anonymous));
  check(await uidOf(A.page) === guest && await A.page.evaluate(() => HOCLOUD.user.email) === 'ann@example.com', 'the guest becomes an email account with the same uid');
  check((await fsList(`users/${guest}/saves`)).length === 1, 'and keeps its saves');
  await A.page.keyboard.press('Escape');

  // 5. another browser
  B = await fresh(browser, { name: 'B' });
  await signInEmail(B.page, 'ann@example.com', 'secret123');
  check(await uidOf(B.page) === guest, 'the same account signs in on another browser');
  // from the title: Account, then Account saves…
  await B.page.click('#tacct'); await B.page.click('.account button:text-is("Account saves…")');
  await B.page.waitForSelector('.aclist li', { timeout: 15000 });
  check((await B.page.$$('.aclist li')).length === 1, 'Account saves lists the game');
  await B.page.click('.aclist li button:text-is("Open")');
  await B.page.waitForSelector('#msg .card, #msg .clock', { timeout: 15000 });
  const yB = await B.page.evaluate(() => JSON.parse(localStorage.getItem('ho5.save')).year);
  check(yB === year1, `the other browser opens it at the same year (${yB} = ${year1})`);
  await endTurn(B.page);
  const newer = await waitFor(() => fsList(`users/${guest}/saves`).then(L => L[0] && +L[0].fields.year.integerValue > year1 ? L[0] : null));
  check(!!newer, 'a turn there uploads a newer copy');
  // the first browser's Continue asks
  await A.page.click('#menubar .mbtn:text-is("Game")'); await A.page.click('.dropdown.open [role=menuitem]:text-is("Quit to title")');
  await A.page.evaluate(() => localStorage.setItem('ho5.save.when', String(Date.now() - 3600e3)));
  await A.page.click('#tcont');
  await A.page.waitForSelector('.win[aria-label="Which copy?"]', { timeout: 15000 }).catch(() => null);
  check(!!await A.page.$('.win[aria-label="Which copy?"]'), 'Continue asks which copy when the account’s is newer');
  await A.page.click('button:text-is("The account’s copy")');
  await A.page.waitForSelector('#msg .card, #msg .clock', { timeout: 15000 });
  check(await A.page.evaluate(() => JSON.parse(localStorage.getItem('ho5.save')).year) === +newer.fields.year.integerValue, 'and opens the account’s copy');

  // 6. delete
  await menu(B.page, 'Game', 'Account saves…');
  await B.page.waitForSelector('.aclist li');
  await B.page.click('.aclist li button:text-is("Delete")');
  await B.page.click('.win.alert button:text-is("OK")');
  await waitFor(() => fsList(`users/${guest}/saves`).then(L => L.length === 0));
  check((await fsList(`users/${guest}/saves`)).length === 0, 'Delete removes it from the account');
  check(!!await B.page.evaluate(() => localStorage.getItem('ho5.save')), 'and the browser copy stays');

  // 7. the Hall, signed in: a 4.0.5 player eliminated goes in the Hall of Shame
  await B.page.keyboard.press('Escape');
  await putGame(B.page, { rules: '405', out: true, gameId: 1700000000002, name: 'Ann' });
  await continueGame(B.page); await endTurn(B.page); await settle(B.page);
  const shame = await waitFor(() => fsList('halls/405/entries').then(L => L.length ? L : null));
  check(shame && shame.length === 1 && shame[0].fields.kind.stringValue === 'shame' && shame[0].fields.name.stringValue === 'Ann' && shame[0].fields.uid.stringValue === guest, 'a Hall of Shame entry goes to halls/405/entries when signed in');
  check(!await B.page.$('.offer'), 'no offer when signed in');
  await menu(B.page, 'Game', 'Hall of Shame…');
  await B.page.click('.hwhere label:has-text("Everyone")');
  await B.page.waitForSelector('.hbox .lbrow', { timeout: 15000 });
  check(/Ann \(you\)/.test(await B.page.textContent('.hbox')), 'the Everyone view lists it');
  await B.page.keyboard.press('Escape');

  // 8. the Hall offer, not signed in: Play as a guest posts that entry; a refused name is renamed
  const C = await fresh(browser, { name: 'C' });
  await putGame(C.page, { rules: '405', out: true, gameId: 1700000000003, name: 'Fuck Face' });
  await continueGame(C.page); await endTurn(C.page); await settle(C.page);
  await C.page.waitForSelector('.offer', { timeout: 15000 }).catch(() => null);
  check(!!await C.page.$('.offer') && /Hall of Shame everyone sees/.test(await C.page.textContent('.offer')), 'the Hall offer comes after the reports');
  await C.page.click('.offer button:text-is("Play as a guest")');
  const posted = await waitFor(() => fsList('halls/405/entries').then(L => L.length === 2 ? L : null));
  check(posted && posted.some(d => d.fields.name.stringValue === 'Anonymous Cowboy'), 'Play as a guest posts that entry, the refused name as Anonymous Cowboy');
  check(!posted || !posted.some(d => /fuck/i.test(d.fields.name.stringValue)), 'the refused name is nowhere in the Hall');
  await ctxClose(C);
  // Not now posts nothing
  const D = await fresh(browser, { name: 'D' });
  await putGame(D.page, { rules: '405', out: true, gameId: 1700000000004, name: 'Dora' });
  await continueGame(D.page); await endTurn(D.page); await settle(D.page);
  await D.page.waitForSelector('.offer', { timeout: 15000 }).catch(() => null);
  await D.page.click('.offer input[type=checkbox]');
  await D.page.click('.offer button:text-is("Not now")');
  await sleep(1000);
  check((await fsList('halls/405/entries')).length === 2 && !await D.page.evaluate(() => HOCLOUD.user), 'Not now posts nothing and makes no account');
  check(await D.page.evaluate(() => localStorage.getItem('ho5.cloud.offer.hall')) === 'no', 'Don’t ask again is remembered');

  // 9. the saves offer (Saved Games: the iOS screen)
  await putGame(D.page, { rules: 'ios', gameId: 1700000000005 });
  await continueGame(D.page); await settle(D.page);
  await menu(D.page, 'Game', 'Saved games…');
  await D.page.waitForSelector('.offer', { timeout: 15000 }).catch(() => null);
  check(!!await D.page.$('.offer') && /follow you to another computer/.test(await D.page.textContent('.offer')), 'the saves offer comes with Saved Games');
  await D.page.click('.offer input[type=checkbox]');
  await D.page.click('.offer button:text-is("Not now")');
  await D.page.click('.hoscreen .sback');
  await menu(D.page, 'Game', 'Saved games…');
  await sleep(1500);
  check(!await D.page.$('.offer'), 'and not again after Don’t ask again');
  await ctxClose(D);

  // 10. Google: the auth emulator's account chooser in the popup. The SDK
  // loads apis.google.com/js/api.js first, even with the emulator; where that
  // can't be reached (a sandbox) the check is skipped, and the window must
  // still say what went wrong in words.
  const E = await fresh(browser, { name: 'E' });
  let gapiBlocked = false;
  E.page.on('requestfailed', (r) => { if (/apis\.google\.com/.test(r.url())) gapiBlocked = true; });
  await E.page.click('#tacct'); await E.page.waitForSelector('.cloudform');
  const [pop] = await Promise.all([E.page.waitForEvent('popup', { timeout: 15000 }).catch(() => null), E.page.click('.cloudform button:text-is("Sign in with Google")')]);
  if (pop) {
    try {
      await pop.waitForLoadState();
      await pop.click('#add-account-button, button:has-text("Add new account")', { timeout: 10000 });
      await pop.click('#autogen-button, button:has-text("Auto-generate user information")', { timeout: 10000 }).catch(() => null);
      await pop.click('#sign-in, button:has-text("Sign in with Google.com")', { timeout: 10000 });
    } catch (e) { console.log('(popup:', e.message.split('\n')[0] + ')'); }
  }
  if (!pop && gapiBlocked) {
    await sleep(1500);
    console.log('SKIP Sign in with Google: apis.google.com can’t be reached from here');
    check(/\S/.test(await E.page.textContent('.cloudmsg')) && !/Working/.test(await E.page.textContent('.cloudmsg')), 'a Google sign-in that can’t start says so');
  } else check(await waitFor(() => E.page.evaluate(() => !!(HOCLOUD.user && HOCLOUD.user.google)), 15000), 'Sign in with Google (the emulator’s chooser)');
  await ctxClose(E);

  // 11. an email account: create, sign out, sign in; Forgot password
  const F = await fresh(browser, { name: 'F' });
  await signInEmail(F.page, 'cal@example.com', 'secret456', true);
  check(await F.page.evaluate(() => HOCLOUD.user && HOCLOUD.user.email) === 'cal@example.com', 'Create account signs in with the new email');
  await F.page.click('#tacct'); await F.page.click('.account button:text-is("Sign out")'); await F.page.click('.win.alert button:text-is("OK")');
  await waitFor(() => F.page.evaluate(() => !HOCLOUD.user));
  check(await F.page.evaluate(() => !HOCLOUD.user && !localStorage.getItem('ho5.cloud.was')) && await F.page.textContent('#tacct') === 'Sign in', 'Sign out signs out, and the title says Sign in');
  await signInEmail(F.page, 'cal@example.com', 'secret456');
  check(await F.page.evaluate(() => HOCLOUD.user && HOCLOUD.user.email) === 'cal@example.com', 'Sign in with the email again');
  await F.page.click('#tacct'); await F.page.click('.account button:text-is("Sign out")'); await F.page.click('.win.alert button:text-is("OK")');
  await waitFor(() => F.page.evaluate(() => !HOCLOUD.user));
  await F.page.click('#tacct'); await F.page.waitForSelector('.cloudform');
  await F.page.fill('.cloudform input[type=email]', 'cal@example.com'); await F.page.fill('.cloudform input[type=password]', 'wrong-one');
  await F.page.click('.cloudform button:text-is("Sign in")');
  await waitFor(() => F.page.evaluate(() => /match an account|isn’t right/.test(document.querySelector('.cloudmsg').textContent)));
  check(/match an account|isn’t right/.test(await F.page.textContent('.cloudmsg')), 'a wrong password is explained in plain words');
  await F.page.click('.cloudform button:text-is("Forgot password?")');
  await waitFor(() => F.page.evaluate(() => /on its way/.test(document.querySelector('.cloudmsg').textContent)));
  check(/on its way/.test(await F.page.textContent('.cloudmsg')), 'Forgot password sends the reset email');
  const codes = await fetch(`http://127.0.0.1:${AUTH}/emulator/v1/projects/${PROJECT}/oobCodes`).then(r => r.json());
  check((codes.oobCodes || []).some(c => c.email === 'cal@example.com' && c.requestType === 'PASSWORD_RESET'), 'the emulator has the reset email');
  await ctxClose(F);
  }

  // 12. shared names: a 2.0 player's name in the names file and a 4.0.5
  // winner's star go to the version's pool; another player's New Game takes
  // them in (and not with the preference off); a name the filter refuses
  // never goes up; Delete my account and data takes them away again
  if (!only || only === 'names') {
    const X = await fresh(browser, { name: 'X' });
    await X.page.click('#tacct'); await X.page.waitForSelector('.cloudform');
    await X.page.click('.cloudform button:text-is("Play as a guest")');
    const xuid = await waitFor(() => uidOf(X.page));
    await X.page.keyboard.press('Escape');
    await newGameVia(X.page, { version: '2.0', rules: 'dos', name: 'Zebediah' });
    const zeb = await waitFor(() => fsGet('names/2.0/men/zebediah').then(d => d.fields ? d : null));
    check(zeb && zeb.fields.name.stringValue === 'Zebediah' && zeb.fields.uid.stringValue === xuid && zeb.fields.kind.stringValue === 'men', 'a 2.0 player’s name goes to names/2.0/men (the names file)');
    await quitToTitle(X.page);
    await newGameVia(X.page, { version: '2.0', rules: 'dos', name: 'Fuckface' });
    await sleep(1500);
    check(!(await fsGet('names/2.0/men/fuckface')).fields, 'a name the decency filter refuses isn’t shared');
    await quitToTitle(X.page);
    // a 4.0.5 win: the computers' empires given to the human, so the next turn wins it
    await putGame(X.page, { rules: '405', gameId: 1700000000010, name: 'Xena', win: true });
    await continueGame(X.page); await endTurn(X.page);
    for (let i = 0; i < 80; i++) {
      if (await X.page.$('.namestar input')) { await X.page.fill('.namestar input', 'Quasar'); await X.page.click('.namestar button[type=submit]'); break; }
      const ok = await X.page.$('.scrim .win button:text-is("OK")');
      if (ok) { await ok.click(); continue; }
      const c = await X.page.$('#msg .card:not(.end)'); if (c) await c.click().catch(() => null); else await sleep(150);
    }
    const qua = await waitFor(() => fsGet('names/4.0/stars/quasar').then(d => d.fields ? d : null));
    check(qua && qua.fields.name.stringValue === 'Quasar', 'a 4.0.5 winner’s star goes to names/4.0/stars (Name a Star)');
    // another player, the preference on (the default once signed in)
    const Y = await fresh(browser, { name: 'Y' });
    await Y.page.click('#tacct'); await Y.page.waitForSelector('.cloudform');
    await Y.page.click('.cloudform button:text-is("Play as a guest")');
    await waitFor(() => uidOf(Y.page));
    await Y.page.keyboard.press('Escape');
    await newGameVia(Y.page, { version: '2.0', rules: 'dos', name: 'Yolanda', wait: () => Y.page.evaluate(() => /Zebediah/.test(localStorage.getItem('ho5.names.shared.2.0') || '')) });
    let o = await Y.page.evaluate(() => JSON.parse(localStorage.getItem('ho5.save')).opts);
    check(o.namesKept && (o.namesKept.men || []).includes('Zebediah') && (o.namesKept.men || []).includes('Yolanda'), 'another 2.0 player’s New Game takes the shared name into its names file (opts.namesKept)');
    check(!/Fuckface/.test(JSON.stringify(o)), 'and not the refused one');
    await quitToTitle(Y.page);
    await newGameVia(Y.page, { version: '4.0', rules: '405', name: 'Yolanda', wait: () => Y.page.evaluate(() => /Quasar/.test(localStorage.getItem('ho5.names.shared.4.0') || '')) });
    o = await Y.page.evaluate(() => JSON.parse(localStorage.getItem('ho5.save')).opts);
    check((o.starNamesKept || []).includes('Quasar') && (o.starNamesKept || []).length <= 4, 'a 4.0.5 New Game takes the shared star, within its list of four (opts.starNamesKept)');
    // the preference off: nothing merged
    await quitToTitle(Y.page);
    await Y.page.click('#tacct'); await Y.page.waitForSelector('.account');
    await Y.page.click('.account label:has-text("Use names other players have added") input');
    await Y.page.keyboard.press('Escape');
    await newGameVia(Y.page, { version: '4.0', rules: '405', name: 'Yolanda' });
    o = await Y.page.evaluate(() => JSON.parse(localStorage.getItem('ho5.save')).opts);
    check(!(o.starNamesKept || []).includes('Quasar'), 'with “Use names other players have added” off, no shared names');
    await ctxClose(Y);
    // Delete my account and data takes the names too
    await quitToTitle(X.page);
    await X.page.click('#tacct'); await X.page.waitForSelector('.account');
    await X.page.click('.account a:text-is("Delete my account and data…")');
    await X.page.click('.win.alert button:text-is("OK")');
    await waitFor(() => X.page.evaluate(() => !HOCLOUD.user), 15000);
    const gone = await waitFor(async () => !(await fsGet('names/2.0/men/zebediah')).fields && !(await fsGet('names/4.0/stars/quasar')).fields, 15000);
    check(gone, 'Delete my account and data removes the names it added');
    await ctxClose(X);
  }

  // 13. online play: a 2-player and a 3-player game, each player in their
  // own browser; several turns with battles, every browser's state the same
  if (!only || only === 'play') await onlinePlay(browser);

  if (A) await A.ctx.close();
  if (B) await B.ctx.close();
  await browser.close();
  if (fails.length) { console.log(`\n${fails.length} failed of ${checks}:\n` + fails.join('\n')); process.exit(1); }
  console.log(`online ok: ${checks} checks`);
})().catch((e) => { console.error(e); process.exit(1); });
function ctxClose(x) { return x.ctx.close(); }

// ---------- online play ----------
const view = (page) => page.evaluate(() => window.HOONLINE_VIEW && window.HOONLINE_VIEW());
async function guest(page) {
  await page.click('#tacct'); await page.waitForSelector('.cloudform');
  await page.click('.cloudform button:text-is("Play as a guest")');
  const u = await waitFor(() => uidOf(page));
  await page.keyboard.press('Escape');
  return u;
}
// click through the turn's reports (and any window), until the clock or the waiting card
async function readReports(page) {
  for (let i = 0; i < 200; i++) {
    if (await page.$('.scrim')) { const ok = await page.$('.scrim .win button:text-is("OK")'); if (ok) await ok.click().catch(() => null); else await page.keyboard.press('Escape'); continue; }
    if (await page.$('#msg .clock') || await page.$('#msg .card.waiting') || await page.$('#msg .card.end')) return;
    const c = await page.$('#msg .card:not(.end):not(.waiting)'); if (c) await c.click().catch(() => null); else await sleep(80);
  }
}
// the Budget / Technology bar dragged to share f (tools/human-play.js dragBar)
async function dragBar(page, title, label, f) {
  const row = page.locator('#panel section.box').filter({ has: page.locator('h3', { hasText: new RegExp('^' + title + '$') }) }).locator('.barrow').filter({ has: page.locator('.blabel', { hasText: label }) }).first();
  if (!(await row.count())) return false;
  const b = await row.locator('.track').boundingBox(); if (!b) return false;
  const at = await page.evaluate(([kind, f]) => HO.BAR_SCALES[window.HOVIEW().barScale[kind]].toX(f * 1000), [title === 'Budget' ? 'budget' : 'tech', f]);
  const x = b.x + b.width * at, y = b.y + b.height / 2;
  await page.mouse.move(x - 2, y); await page.mouse.down(); await page.mouse.move(x, y, { steps: 2 }); await page.mouse.up();
  return true;
}
// the Build window at the selected colony: one of the first type it can buy
async function buildOne(page) {
  const btn = page.locator('#panel .planet button', { hasText: /^(Build ships…|Queue ships…)$/ });
  if (!(await btn.count())) return false;
  await btn.first().click(); await sleep(80);
  const plus = page.locator('.scrim .drow button[aria-label="Build one"], .scrim .drow button[aria-label="Queue one"]');
  let ok = false;
  for (let i = 0; i < await plus.count(); i++) if (await plus.nth(i).isEnabled()) { await plus.nth(i).click(); ok = true; break; }
  await page.keyboard.press('Escape'); await sleep(60);
  return ok;
}
async function gameMenu(page, item) {
  await page.click('#menubar .mbtn:text-is("Game")'); await page.click(`.dropdown.open [role=menuitem]:text-is("${item}")`);
}
// one player's turn: the reports read, some moves by hand (the bars, a ship
// built), then the computers' code plays the rest of it (Auto-play this
// turn, which ends the turn) or the clock ends it
async function playTurnIn(page, t, byHand) {
  await readReports(page);
  if (await page.$('#msg .card.waiting') || await page.$('#msg .card.end')) return 'waiting';
  if (byHand) {
    await dragBar(page, 'Technology', 'Weapons', 0.4 + (t % 3) * 0.1);
    await dragBar(page, 'Budget', 'Savings', 0.1);
    await buildOne(page);
  }
  if (byHand && t % 2) await page.click('#msg .clock', { timeout: 10000 }).catch(async (e) => { if (SHOTS) await page.screenshot({ path: SHOTS + '/clock-' + t + '.png' }); throw e; });
  else await gameMenu(page, 'Auto-play this turn');
  await waitFor(() => page.$('#msg .card.waiting, #msg .card.end'), 10000);
  return 'sent';
}
async function onlineGame(browser, o) {
  const P = [];
  for (let i = 0; i < o.seats; i++) { P.push(await fresh(browser, { name: 'P' + (i + 1) })); await guest(P[i].page); }
  const host = P[0].page;
  // New Game, then Play online…: the window's settings, the seats
  await host.click('#tnew'); await host.waitForSelector('.ngwin form.newgame');
  await host.selectOption('.ngwin select[name=version]', o.version); await host.selectOption('.ngwin select[name=rules]', o.rules);
  await host.fill('.ngwin input[name=name]', 'Host');
  if (o.setup) await o.setup(host);
  await host.selectOption('.ngwin select[name=humans]', String(o.seats));
  await host.click('.ngwin button:text-is("Play online…")');
  await host.waitForSelector('.lobby .lobbycode .code', { timeout: 15000 });
  const code = (await host.textContent('.lobby .lobbycode .code')).trim();
  check(/^[A-Z0-9]{6}$/.test(code), `${o.label}: the lobby shows a code (${code})`);
  // the others join by the link
  for (let i = 1; i < o.seats; i++) {
    const pg = P[i].page;
    await pg.goto(PAGE + '&join=' + code);
    await pg.waitForSelector('form.newgame input[name=code]', { timeout: 20000 });
    await pg.fill('form.newgame input[name=name]', 'Player' + (i + 1));
    await pg.click('form.newgame button:text-is("Join")');
    await pg.waitForSelector('.lobby .lobbylist', { timeout: 15000 });
  }
  await waitFor(async () => (await host.$$('.lobby .lobbylist li:not(.sub)')).length === o.seats, 15000);
  check((await host.$$('.lobby .lobbylist li:not(.sub)')).length === o.seats, `${o.label}: the host’s lobby lists everyone who joined`);
  await host.click('.lobby button:text-is("Start the game")');
  for (const x of P) await waitFor(() => view(x.page).then(v => v && v.status === 'playing' && v.turn === 0), 20000);
  const v0 = await Promise.all(P.map(x => view(x.page)));
  check(v0.every(v => v && v.turn === 0 && v.digest === v0[0].digest), `${o.label}: every browser starts from the same state`);
  check(new Set(v0.map(v => v.seat)).size === o.seats, `${o.label}: each player has their own seat`);
  let bad = 0;
  for (let t = 0; t < o.turns; t++) {
    const before = await view(host);
    if (before.over) break;
    // the 3-player game: the third player sits one turn out, and the host ends it for them
    const sitOut = o.skipAt === t ? o.seats - 1 : -1;
    for (let i = 0; i < o.seats; i++) {
      if (i === sitOut) continue;
      if (o.resignAt === t && i === o.seats - 1) {
        // the last player resigns instead of moving: the turn doesn't wait for them, and a computer plays them from now on
        const pg = P[i].page;
        await readReports(pg);
        await gameMenu(pg, 'Online game…'); await pg.click('.scrim button:text-is("Resign…")'); await pg.click('.win.alert button:text-is("OK")');
        continue;
      }
      // a reload in the middle of a turn: the turn goes on from its orders
      if (o.reloadAt === t && i === 1) {
        await readReports(P[i].page);
        await dragBar(P[i].page, 'Technology', 'Shields', 0.5);
        await buildOne(P[i].page);
        await sleep(300);
        await P[i].page.reload();
        await P[i].page.waitForSelector('#tcont:not([hidden])', { timeout: 30000 });
        await P[i].page.click('#tcont');
        const back = await waitFor(() => view(P[i].page).then(v => (v && v.turn === t && v.status === 'playing' ? v : null)), 20000);
        check(!!back, `${o.label}: a page reloaded in the middle of a turn opens the game again (Continue)`);
        check(back && back.self.length === 0 && await P[i].page.evaluate((id) => { const k = JSON.parse(localStorage.getItem('ho5.online.' + id) || 'null'); return !!(k && k.log && k.log.length); }, back.id), `${o.label}: and goes on from the turn’s orders so far`);
      }
      await playTurnIn(P[i].page, t, i === 0 || t % 3 === 0);
    }
    if (sitOut >= 0) {
      const w = await waitFor(() => view(host).then(v => v.waiting.length === 1 ? v : null), 10000);
      check(w && w.waiting[0] === 'Player' + o.seats, `${o.label}: the turn waits for the player who hasn’t moved (${w && w.waiting})`);
      check(/Waiting for: Player/.test(await host.textContent('#msg .card.waiting')), `${o.label}: the page says who the turn waits for`);
      await host.click('#msg .card.waiting button:text-is("End turn for…")');
      await host.click('.scrim button:text-is("End their turn")');
    }
    const ok = await waitFor(async () => { const vs = await Promise.all(P.map(x => view(x.page))); return vs.every(v => v.turn === t + 1 && v.checks.some(c => c.turn === t + 1)) ? vs : null; }, 60000);
    if (!ok) { check(false, `${o.label}: turn ${t} wasn’t played in every browser`); bad++; break; }
    const same = ok.every(v => v.digest === ok[0].digest);
    const checks = ok.map(v => v.checks.find(c => c.turn === t + 1));
    if (!same || !checks.every(c => c.ok)) bad++;
    check(same, `${o.label}: after turn ${t}, every browser has the same state (${ok.map(v => v.digest.slice(0, 8)).join(' ')})`);
    // (a page that played the turn, or more than one when they ended theirs at once: each made the same game itself)
    check(checks.every(c => c.ok && (c.mine || c.replayed)), `${o.label}: turn ${t}: each browser played the orders itself and got the same game (${checks.map(c => (c.mine ? 'played' : c.replayed ? 'replayed' : '-') + (c.ok ? '' : ' MISMATCH')).join(', ')})`);
    if (o.resignAt === t) check(!ok[0].waiting.includes('Player' + o.seats), `${o.label}: a resigned player isn’t waited for`);
  }
  const vs = await Promise.all(P.map(x => view(x.page)));
  const self = vs.flatMap(v => v.self);
  check(self.length && self.every(s => s.ok || s.news), `${o.label}: every turn’s orders give the page’s own game (${self.filter(s => !s.ok).map(s => s.turn + ':' + s.at).join(' ')})`);
  check(vs[0].battles > 0, `${o.label}: battles were fought (${vs[0].battles})`);
  check(!bad, `${o.label}: ${o.turns} turns, every one the same in every browser`);
  console.log(`     ${o.label}: year ${vs[0].year}, ${vs[0].battles} battles`);
  // My online games, from the Account window, lists it
  await host.click('#menubar .logo'); await host.click('.dropdown.open [role=menuitem]:text-is("Account…")');
  await host.click('.account button:text-is("My online games…")');
  await host.waitForSelector('.aclist li', { timeout: 15000 });
  check(/Player2/.test(await host.textContent('.aclist')), `${o.label}: My online games lists the game`);
  await host.keyboard.press('Escape');
  for (const x of P) await x.ctx.close();
}
async function onlinePlay(browser) {
  // 2 players, 4.0.5, a small galaxy with two computers
  await onlineGame(browser, { label: '2 players (4.0.5)', seats: 2, version: '4.0', rules: '405', turns: 14, reloadAt: 3,
    setup: async (pg) => { await pg.selectOption('.ngwin select[name=w_size]', 'small'); await pg.selectOption('.ngwin select[name=computers]', '2'); } });
  // 3 players, 5.0.5: one sits a turn out (End turn for…), one resigns
  await onlineGame(browser, { label: '3 players (5.0.5)', seats: 3, version: '5', rules: 'original', turns: 12, skipAt: 4, resignAt: 8,
    setup: async (pg) => { await pg.selectOption('.ngwin select[name=computers]', '2'); await pg.$eval('.ngwin input[name=o_size]', (e) => { e.value = '0'; e.dispatchEvent(new Event('input', { bubbles: true })); }); } });
}
