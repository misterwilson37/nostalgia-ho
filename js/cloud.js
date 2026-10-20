// Spaceward Ho! web remake — the online parts: accounts, saved games kept in
// an account, and the shared Hall of Fame (window.HOCLOUD).
//
// The game is a static page that plays offline, and it must go on doing so
// exactly as before for anyone who never signs in. So this file is small and
// does nothing at load: the Firebase SDK (js/vendor/firebase.js, built by
// tools/firebase/build-firebase.mjs) is fetched only
// - when the player opens Account (or one of the two offers in the skin: a
//   finished game for the shared Hall, a deliberate save), or
// - at start-up, after the page has loaded, when this browser was signed in
//   before (localStorage "ho5.cloud.was"), so the account comes back by itself.
// No anonymous account is ever made behind the player's back: "Play as a
// guest" is a button. Every call fails soft: if the SDK can't load or the
// network is down, the promise resolves to false / null / [] (or rejects
// with a plain-English message for the window that asked), and the game
// carries on with its browser saves.
//
// The single-file offline build (tools/bundle.py) and a page opened from disk
// have no server to talk to: there HOCLOUD.supported is false and the skin
// shows none of this.
//
// What is stored, where, and the rules that guard it: docs/online.md and
// firestore.rules. The skin (js/skins/classic/ui.js, "online") draws the
// windows; this file has no UI.
(function (root) {
'use strict';
// The project's web config. It is public by design (every visitor's browser
// gets it); what protects the data is firestore.rules and the API key's
// referrer restriction. No measurementId: no Analytics, by Jake's choice.
const CONFIG = {
  apiKey: 'AIzaSyBOLeRA8ez6PT8FgjTe1rk4XgbtmOzsj8s',
  authDomain: 'nostalgia-ho.firebaseapp.com',
  projectId: 'nostalgia-ho',
  storageBucket: 'nostalgia-ho.firebasestorage.app',
  messagingSenderId: '725464059135',
  appId: '1:725464059135:web:7f7c0bd548d8fcc68010ca',
};
// the client written with each save and Hall entry (firestore.rules: 40 characters)
const CLIENT = 'web 5.1 Alpha';
// Firestore's document limit is 1 MiB (1,048,576 bytes, field names and
// all); a game's compressed data may be up to 1,000,000 bytes of it
// (firestore.rules checks the same number)
const MAX_DATA = 1000000;
// uploads while playing: at most one a minute (End Turn and leaving the page
// don't wait). The free tier allows 20,000 writes a day.
const MIN_GAP = 60000;

const doc = root.document;
const store = {
  get(k) { try { return root.localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { if (v == null) root.localStorage.removeItem(k); else root.localStorage.setItem(k, v); } catch (e) {} },
  sget(k) { try { return root.sessionStorage.getItem(k); } catch (e) { return null; } },
  sset(k, v) { try { if (v == null) root.sessionStorage.removeItem(k); else root.sessionStorage.setItem(k, v); } catch (e) {} },
};
let params = null;
try { params = new URLSearchParams(root.location.search); } catch (e) {}
const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test((root.location && root.location.hostname) || '');
// ?emulator=1 on localhost: the Auth and Firestore emulators on their usual
// ports (9099, 8080); ?emulator=<auth port>,<firestore port> for others
const emulator = local && params && params.get('emulator') ? params.get('emulator') : null;
const supported = !root.HOSKINS_INLINE && !!root.location && /^https?:$/.test(root.location.protocol) && typeof Promise !== 'undefined';

// ---------- loading ----------
function loadScript(src, timeout) {
  return new Promise((resolve, reject) => {
    const s = doc.createElement('script');
    const t = setTimeout(() => { s.onload = s.onerror = null; reject(new Error('timeout')); }, timeout || 20000);
    s.src = src; s.async = true;
    s.onload = () => { clearTimeout(t); resolve(); };
    s.onerror = () => { clearTimeout(t); s.remove(); reject(new Error('load')); };
    doc.head.append(s);
  });
}
let sdkP = null, readyP = null, decencyP = null;
// the SDK file only (no network beyond this site); resolves false on failure
function loadSdk() {
  if (!supported) return Promise.resolve(false);
  if (root.HOFB) return Promise.resolve(true);
  if (!sdkP) sdkP = loadScript('js/vendor/firebase.js').then(() => !!root.HOFB, () => { sdkP = null; return false; });
  return sdkP;
}
const S = { app: null, auth: null, db: null, user: null, known: false, listeners: [] };
// the SDK loaded and started, and the account (if any) restored: resolves
// true, or false when it can't be
function ready() {
  if (!supported) return Promise.resolve(false);
  if (!readyP) {
    readyP = loadSdk().then((ok) => {
      if (!ok) return false;
      const F = root.HOFB;
      S.app = F.initializeApp(CONFIG);
      S.auth = F.initializeAuth(S.app, { persistence: [F.indexedDBLocalPersistence, F.browserLocalPersistence], popupRedirectResolver: F.browserPopupRedirectResolver });
      S.db = F.initializeFirestore(S.app, {});
      if (emulator) {
        const [ap, fp] = emulator === '1' ? [9099, 8080] : emulator.split(',').map(Number);
        F.connectAuthEmulator(S.auth, `http://127.0.0.1:${ap}`, { disableWarnings: true });
        F.connectFirestoreEmulator(S.db, '127.0.0.1', fp);
      }
      return new Promise((resolve) => {
        let first = true;
        F.onAuthStateChanged(S.auth, (u) => {
          S.user = u ? describe(u) : null; S.known = true;
          // remembered so the next visit restores the account at start-up
          store.set('ho5.cloud.was', u ? '1' : null);
          store.set('ho5.cloud.name', u ? S.user.name : null);
          if (first) { first = false; resolve(true); }
          for (const f of S.listeners.slice()) { try { f(S.user); } catch (e) {} }
        }, () => { if (first) { first = false; resolve(true); } });
        // back from a Google sign-in done by redirect (popups blocked)
        if (store.sget('ho5.cloud.redirect')) {
          store.sset('ho5.cloud.redirect', null);
          F.getRedirectResult(S.auth).catch((e) => { S.redirectError = errorText(e); });
        }
      });
    }).catch(() => { readyP = null; return false; });
  }
  return readyP;
}
// a promise that gives up after ms (resolving to dflt)
const within = (p, ms, dflt) => Promise.race([p, new Promise(r => setTimeout(() => r(dflt), ms))]);

function describe(u) {
  const google = (u.providerData || []).some(p => p.providerId === 'google.com');
  const email = u.email || ((u.providerData || []).find(p => p.email) || {}).email || null;
  return { uid: u.uid, anonymous: !!u.isAnonymous, email, google, password: (u.providerData || []).some(p => p.providerId === 'password'),
    name: u.isAnonymous ? 'Guest' : (u.displayName || email || 'Signed in') };
}

// ---------- plain-English errors ----------
const ERRORS = {
  'auth/invalid-email': 'That doesn’t look like an email address.',
  'auth/missing-email': 'Type your email address first.',
  'auth/missing-password': 'Type your password.',
  'auth/weak-password': 'Choose a password of at least 6 characters.',
  'auth/invalid-credential': 'That email and password don’t match an account. Check them, or create an account.',
  'auth/invalid-login-credentials': 'That email and password don’t match an account. Check them, or create an account.',
  'auth/wrong-password': 'That password isn’t right.',
  'auth/user-not-found': 'There’s no account with that email. Create one?',
  'auth/user-disabled': 'That account has been turned off.',
  'auth/email-already-in-use': 'There’s already an account with that email. Sign in to it instead (or use Forgot password).',
  'auth/credential-already-in-use': 'That account already exists, so this guest can’t become it. Sign out of the guest and sign in to that account instead; the guest’s games stay with the guest.',
  'auth/provider-already-linked': 'This account already has that way of signing in.',
  'auth/popup-closed-by-user': 'The sign-in window was closed before you finished.',
  'auth/popup-blocked': 'Your browser blocked the Google sign-in window. Allow pop-ups for this site (in the address bar or the browser settings) and try again.',
  'auth/operation-not-supported-in-environment': 'This browser can’t open the Google sign-in window. Try another browser, or sign in with an email and password.',
  'auth/cancelled-popup-request': 'The sign-in window was closed before you finished.',
  'auth/user-cancelled': 'Sign-in was cancelled.',
  'auth/network-request-failed': 'Couldn’t reach the sign-in service. Check your connection and try again.',
  'auth/too-many-requests': 'Too many tries. Wait a few minutes and try again.',
  'auth/unauthorized-domain': 'This web address isn’t allowed to sign in (Firebase: Authentication, Settings, Authorized domains).',
  'auth/operation-not-allowed': 'That way of signing in is turned off for this site.',
  'auth/admin-restricted-operation': 'That way of signing in is turned off for this site.',
  'auth/internal-error': 'The sign-in service couldn’t start. Check your connection, or try again in a moment.',
  'auth/requires-recent-login': 'For safety, Firebase wants a fresh sign-in first: sign out, sign in again, and repeat.',
  'permission-denied': 'The account service refused that.',
  'unavailable': 'Couldn’t reach the account service. Check your connection and try again.',
  'deadline-exceeded': 'The account service took too long to answer. Try again.',
  'resource-exhausted': 'The account service is over its limit for today. Your games are still saved in this browser.',
};
function errorText(e) {
  if (!e) return 'Something went wrong.';
  if (e.hoText) return e.hoText;
  if (e.code && ERRORS[e.code]) return ERRORS[e.code];
  return 'Something went wrong' + (e.code ? ` (${e.code})` : e.message ? ` (${e.message})` : '') + '.';
}
const fail = (text) => { const e = new Error(text); e.hoText = text; return e; };
// run fn once the SDK is up (rejecting in plain English when it can't be)
function withSdk(fn) {
  return ready().then((ok) => {
    if (!ok) throw fail('Couldn’t load the account service. Check your connection and try again; your games are still saved in this browser.');
    return fn(root.HOFB);
  });
}
const needUser = () => { if (!S.auth || !S.auth.currentUser) throw fail('Sign in first.'); return S.auth.currentUser; };

// ---------- signing in ----------
function google(link) {
  // The popup must open in the click itself: Safari blocks one opened even a
  // moment later. So once the SDK is loaded (it is by the time the sign-in
  // window shows) the popup opens at once, with no promise in between. No
  // redirect fallback: signInWithRedirect through nostalgia-ho.firebaseapp.com
  // fails in browsers that partition storage (Safari, newer Chrome: "missing
  // initial state"), so a blocked popup is explained instead (errorText).
  const open = (F) => {
    const p = new F.GoogleAuthProvider();
    p.setCustomParameters({ prompt: 'select_account' });
    const cur = S.auth.currentUser;
    return (link && cur ? F.linkWithPopup(cur, p) : F.signInWithPopup(S.auth, p)).then(r => { refresh(); return r; });
  };
  if (root.HOFB && S.auth) { try { return open(root.HOFB); } catch (e) { return Promise.reject(e); } }
  return withSdk(open);
}
// the user's details after a link (the auth state doesn't change on a link)
function refresh() { const u = S.auth && S.auth.currentUser; S.user = u ? describe(u) : null; if (u) store.set('ho5.cloud.name', S.user.name); for (const f of S.listeners.slice()) { try { f(S.user); } catch (e) {} } }

const API = {
  supported,
  client: CLIENT,
  MAX_DATA,
  // the SDK started and the account known (see ready above)
  ready,
  loadSdk,
  within,
  errorText,
  // the signed-in player, or null: { uid, anonymous, email, google, password, name }
  get user() { return S.user; },
  // true once the account state is known this visit
  get known() { return S.known; },
  // this browser was signed in last time (the name shown before the SDK is back)
  get wasSignedIn() { return store.get('ho5.cloud.was') === '1'; },
  get lastName() { return store.get('ho5.cloud.name'); },
  // a sign-in by redirect that failed (shown once by the Account window)
  takeRedirectError() { const e = S.redirectError; S.redirectError = null; return e || null; },
  // fn(user) on every change of account (null: signed out)
  onChange(fn) { S.listeners.push(fn); return () => { S.listeners = S.listeners.filter(f => f !== fn); }; },
  signInGoogle: () => google(false),
  // a guest keeps its uid, and so its saves and Hall entries, when it links
  linkGoogle: () => google(true),
  signInEmail: (email, pw) => withSdk(F => F.signInWithEmailAndPassword(S.auth, String(email).trim(), pw)),
  createAccount: (email, pw) => withSdk(F => F.createUserWithEmailAndPassword(S.auth, String(email).trim(), pw)),
  linkEmail: (email, pw) => withSdk(F => F.linkWithCredential(needUser(), F.EmailAuthProvider.credential(String(email).trim(), pw)).then(r => { refresh(); return r; })),
  resetPassword: (email) => withSdk(F => F.sendPasswordResetEmail(S.auth, String(email).trim())),
  signInGuest: () => withSdk(F => F.signInAnonymously(S.auth)),
  signOut: () => withSdk(F => F.signOut(S.auth)).then(() => { store.set('ho5.cloud.was', null); store.set('ho5.cloud.name', null); }),
};

// ---------- saved games in the account (users/{uid}/saves/{id}) ----------
// "Keep my saved games in my account too": on unless turned off (browser
// only); the browser saves are kept either way
API.keepSaves = () => store.get('ho5.cloud.saves') !== '0';
API.setKeepSaves = (on) => store.set('ho5.cloud.saves', on ? '1' : '0');

// a short fingerprint of a save, to skip uploading what is already there
function hash(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return (h >>> 0).toString(16).padStart(8, '0') + '.' + s.length.toString(36);
}
API.hash = hash;
const canGzip = () => typeof root.CompressionStream === 'function' && typeof root.DecompressionStream === 'function';
function gzip(text) {
  if (!canGzip()) return Promise.resolve({ enc: 'json', bytes: new TextEncoder().encode(text) });
  return new Response(new Blob([text]).stream().pipeThrough(new root.CompressionStream('gzip'))).arrayBuffer().then(b => ({ enc: 'gzip', bytes: new Uint8Array(b) }));
}
function gunzip(bytes, enc) {
  if (enc !== 'gzip') return Promise.resolve(new TextDecoder().decode(bytes));
  return new Response(new Blob([bytes]).stream().pipeThrough(new root.DecompressionStream('gzip'))).text();
}
// a document id for a game: its ruleset and its id (G.gameId, set by the skin)
API.saveId = (rules, gameId) => `${String(rules).replace(/[^A-Za-z0-9_-]/g, '')}-${String(gameId).replace(/[^A-Za-z0-9_-]/g, '')}`.slice(0, 64);

const U = { fn: null, timer: 0, last: 0, busy: null, warned: {} };
const sentKey = (uid) => 'ho5.cloud.sent.' + uid;
function sentMap(uid) { try { return JSON.parse(store.get(sentKey(uid)) || '{}') || {}; } catch (e) { return {}; } }
// upload one game: s = { id, rules, edition, year, player, galaxy, over, json, saved }
// resolves 'sent', 'same' (nothing changed), 'big' (over the limit) or 'off'
function upload(s, force) {
  const u = S.auth && S.auth.currentUser;
  if (!u || !API.keepSaves() || !s || !s.json) return Promise.resolve('off');
  const F = root.HOFB, h = hash(s.json), sent = sentMap(u.uid);
  if (!force && sent[s.id] === h) return Promise.resolve('same');
  return gzip(s.json).then(({ enc, bytes }) => {
    if (bytes.length > MAX_DATA) {
      if (!U.warned[s.id]) { U.warned[s.id] = 1; if (API.onSaveProblem) API.onSaveProblem(`This game is too big to keep in your account (${Math.round(bytes.length / 1024)} KB compressed; the limit is ${Math.round(MAX_DATA / 1024)} KB). It is still saved in this browser.`); }
      return 'big';
    }
    const data = { rules: String(s.rules).slice(0, 16), edition: String(s.edition || '').slice(0, 100), year: Math.round(+s.year || 0),
      player: String(s.player || '').slice(0, 60), galaxy: String(s.galaxy || '').slice(0, 60), over: !!s.over,
      updated: F.serverTimestamp(), saved: Math.round(+s.saved || Date.now()), size: bytes.length, raw: s.json.length,
      enc, hash: h, data: F.Bytes.fromUint8Array(bytes), client: CLIENT };
    return F.setDoc(F.doc(S.db, 'users', u.uid, 'saves', s.id), data).then(() => {
      const m = sentMap(u.uid); m[s.id] = h; store.set(sentKey(u.uid), JSON.stringify(m));
      return 'sent';
    });
  });
}
function flush() {
  clearTimeout(U.timer); U.timer = 0;
  const fn = U.fn; U.fn = null;
  if (!fn || !S.auth || !S.auth.currentUser || !API.keepSaves()) return Promise.resolve('off');
  let s = null; try { s = fn(); } catch (e) { return Promise.resolve('off'); }
  U.last = Date.now();
  const p = (U.busy || Promise.resolve()).then(() => upload(s)).catch((e) => { if (API.onSaveProblem && e && e.code === 'resource-exhausted') API.onSaveProblem(errorText(e)); return 'error'; });
  U.busy = p;
  return p;
}
// the skin's save(): fn() gives the game as it is now (called only when it
// is uploaded); urgent (End Turn): now, else within a minute of the last one
API.noteSave = (fn, urgent) => {
  if (!S.user || !API.keepSaves()) return;
  U.fn = fn;
  const wait = U.last + MIN_GAP - Date.now();
  if (urgent || wait <= 0) { flush(); return; }
  if (!U.timer) U.timer = setTimeout(flush, wait);
};
API.flushSave = flush;
API.uploadNow = (s) => withSdk(() => upload(s, true));
// leaving the page (or hiding it: a phone may never come back) sends what is waiting
if (supported && doc) {
  doc.addEventListener('visibilitychange', () => { if (doc.visibilityState === 'hidden' && U.fn) flush(); });
  root.addEventListener('pagehide', () => { if (U.fn) flush(); });
}

// the account's saves, newest first: [{ id, rules, edition, year, player, galaxy, over, saved, updated (ms), size }]
API.listSaves = () => withSdk((F) => {
  const u = needUser();
  return F.getDocs(F.query(F.collection(S.db, 'users', u.uid, 'saves'), F.orderBy('updated', 'desc'))).then(q => q.docs.map((d) => {
    const x = d.data();
    return { id: d.id, rules: x.rules, edition: x.edition, year: x.year, player: x.player, galaxy: x.galaxy, over: !!x.over, saved: x.saved, hash: x.hash,
      updated: x.updated && x.updated.toMillis ? x.updated.toMillis() : x.saved, size: x.size, _data: x.data, _enc: x.enc };
  }));
});
// one save's text (the same JSON the browser keeps), or null when it isn't there
API.getSave = (idOrEntry) => withSdk((F) => {
  if (idOrEntry && idOrEntry._data) return gunzip(idOrEntry._data.toUint8Array(), idOrEntry._enc);
  const u = needUser();
  return F.getDoc(F.doc(S.db, 'users', u.uid, 'saves', idOrEntry)).then(d => d.exists() ? gunzip(d.data().data.toUint8Array(), d.data().enc) : null);
});
// one save's details without its data's text: { year, saved, hash } or null
API.saveInfo = (id) => withSdk((F) => {
  const u = needUser();
  return F.getDoc(F.doc(S.db, 'users', u.uid, 'saves', id)).then(d => d.exists() ? { id, year: d.data().year, saved: d.data().saved, hash: d.data().hash, _data: d.data().data, _enc: d.data().enc } : null);
});
API.deleteSave = (id) => withSdk((F) => {
  const u = needUser();
  return F.deleteDoc(F.doc(S.db, 'users', u.uid, 'saves', id)).then(() => { const m = sentMap(u.uid); delete m[id]; store.set(sentKey(u.uid), JSON.stringify(m)); });
});

// ---------- preferences in the account (users/{uid}/prefs/main) ----------
// { lang, updated }: the interface's language the player chose (the title
// screen's Language) and the server's time of the choice, so that it follows
// the player to every device and the most recent choice wins (the skin's
// cloudPrefsSync). Read and written only while signed in, when the SDK is
// loaded anyway: never a reason to load it.
const PREF_LANGS = ['en', 'fr', 'de', 'tr', 'es']; // firestore.rules: the same list
const prefsRef = (uid) => root.HOFB.doc(S.db, 'users', uid, 'prefs', 'main');
const ms = (t) => (t && t.toMillis ? t.toMillis() : 0);
// the account's choice: { lang, updated (ms) }, or null when there is none
API.getPrefs = () => withSdk(F => F.getDoc(prefsRef(needUser().uid)).then((d) => {
  if (!d.exists()) return null;
  const x = d.data();
  return PREF_LANGS.includes(x.lang) ? { lang: x.lang, updated: ms(x.updated) } : null;
}));
// keep a choice in the account: resolves the server's time of it (ms)
API.setPrefs = (p) => withSdk((F) => {
  const ref = prefsRef(needUser().uid);
  if (!p || !PREF_LANGS.includes(p.lang)) return Promise.reject(fail('That isn’t one of the languages.'));
  return F.setDoc(ref, { lang: p.lang, updated: F.serverTimestamp() }).then(() => F.getDoc(ref)).then(d => (d.exists() ? ms(d.data().updated) : 0));
});

// ---------- the shared Hall of Fame (halls/{rules}/entries/{auto id}) ----------
// The fields an entry may carry (js/rules-405.js hallEntry, js/rules-301.js
// hallEntry301), each a whole number or a short word; anything else the
// ruleset puts in an entry (3.0.1's Play Again options) stays on this computer.
const HALL_FIELDS = ['humans', 'computers', 'shape', 'density', 'size', 'iq', 'year', 'allies', 'difficulty', 'yearsPerTurn', 'skill', 'armageddons', 'replays', 'time'];
function decency() {
  if (root.HODECENCY) return Promise.resolve(root.HODECENCY);
  if (!decencyP) decencyP = loadScript('js/decency-words.js').then(() => loadScript('js/decency.js')).then(() => root.HODECENCY, () => { decencyP = null; return null; });
  return decencyP;
}
API.decency = decency;
const FALLBACK_NAME = 'Anonymous Cowboy';
// post one entry: { rules, edition, kind: 'fame' | 'shame', entry, name };
// resolves { name, renamed } (renamed: the name didn't pass the decency
// filter and went up as "Anonymous Cowboy")
API.postHall = (o) => withSdk(F => decency().then((D) => {
  const u = needUser(), e = o.entry || {};
  const raw = String(o.name == null ? e.name : o.name);
  const name = D ? D.clean(raw, FALLBACK_NAME) : FALLBACK_NAME;
  const kind = o.kind === 'shame' ? 'shame' : 'fame';
  const data = { uid: u.uid, name, kind, rules: String(o.rules).slice(0, 16), edition: String(o.edition || '').slice(0, 100), client: CLIENT, createdAt: F.serverTimestamp() };
  for (const k of HALL_FIELDS) {
    const v = e[k];
    if (typeof v === 'number' && isFinite(v)) data[k] = k === 'difficulty' ? v : Math.round(v);
    else if (typeof v === 'string' && k !== 'time' && v.length <= 16) data[k] = v;
  }
  if (typeof data.difficulty !== 'number') data.difficulty = 0;
  if (typeof data.time !== 'number') data.time = Math.floor(Date.now() / 1000);
  // a field only this kind has, so each list is one query on one field
  // (no composite index to make): fameAt / fameDifficulty, shameAt / shameDifficulty
  data[kind + 'At'] = F.serverTimestamp();
  data[kind + 'Difficulty'] = data.difficulty;
  return F.addDoc(F.collection(S.db, 'halls', data.rules, 'entries'), data).then(d => ({ id: d.id, name, renamed: name !== raw.trim() }));
}));
// the 25 best (order 'top': highest difficulty) or newest entries of a
// ruleset's Hall of Fame or Shame, each name passed through the filter
// again (a client can be changed; the rules can't read names)
API.hallTop = (rules, kind, order) => withSdk(F => decency().then((D) => {
  kind = kind === 'shame' ? 'shame' : 'fame';
  const q = F.query(F.collection(S.db, 'halls', String(rules), 'entries'), F.orderBy(kind + (order === 'top' ? 'Difficulty' : 'At'), 'desc'), F.limit(25));
  return F.getDocs(q).then(r => r.docs.map((d) => {
    const x = Object.assign({ id: d.id }, d.data());
    x.name = D ? D.clean(x.name, FALLBACK_NAME) : FALLBACK_NAME;
    x.mine = !!(S.user && x.uid === S.user.uid);
    return x;
  }));
}));
// ---------- shared names (names/{pool}/{kind}/{id}) ----------
// What the originals carried from game to game in their preferences or names
// file, pooled for everyone who plays the same version: the names file (1.2
// to 4.0.5: the humans' names join the computers' lists, a ship type's name
// its class's list; the skin's "ho5.names.<rules>") and Name a Star (a
// winner's star, "ho5.stars.<rules>"). The skin names the pool (a version:
// '1.2', '2.0', '3.0', '4.0', '5'; the remake's own rules each their own, so
// the Claude rules' never mix with the originals') and the kind: 'stars',
// 'men', 'women', or 'ships-<class>' (each class its own list, as in the
// names file). A name's document id is its lower-case self, so the rules
// refuse a second copy of a name whatever its letter case (create only, no
// update): that is the dedup, server-side, with no query first.
const SHIP_CLASSES = ['scout', 'dread', 'fighter', 'tanker', 'colony', 'satellite', 'bio', 'decoy'];
const NAME_KINDS = ['stars', 'men', 'women'].concat(SHIP_CLASSES.map(c => 'ships-' + c));
API.NAME_KINDS = NAME_KINDS;
// how many of the newest of each kind a fetch takes (the reads cost: the free
// tier allows 50,000 a day; a pool is fetched at most once a day a browser)
const NAME_FETCH = { stars: 60, men: 120, women: 120 };
const NAME_FETCH_SHIP = 40;
const NAME_MAX = 31; // firestore.rules: a name is 1 to 31 characters
const NAME_DAY = 24 * 3600e3;
// "Use names other players have added" (Account…): on unless turned off;
// it only counts when signed in (a player who never signs in loads nothing)
API.useSharedNames = () => store.get('ho5.cloud.names') !== '0';
API.setUseSharedNames = (on) => store.set('ho5.cloud.names', on ? '1' : '0');
// a name's document id, or null when it can't be one (Firestore's: no "/",
// not "." or "..", not __name__)
const nameId = (n) => { const id = String(n).toLowerCase(); return !id || id.includes('/') || id === '.' || id === '..' || /^__.*__$/.test(id) ? null : id; };
const namesKey = (pool) => 'ho5.names.shared.' + pool;
// the pool as this browser last fetched it: { at (ms), kinds: { kind: [names, oldest first] } }, or null
function namesCache(pool) { try { const v = JSON.parse(store.get(namesKey(pool)) || 'null'); return v && v.kinds && typeof v.kinds === 'object' ? v : null; } catch (e) { return null; } }
API.cachedNames = (pool) => { const c = namesCache(pool); return c ? c.kinds : null; };
// fetch a pool's kinds (at most once a day unless force), each name through
// the decency filter again (a changed client could post anything); resolves
// the kinds ({ kind: [names, oldest first] }), the cached ones when the
// fetch fails, or null
API.sharedNames = (pool, kinds, force) => {
  const c = namesCache(pool), want = (kinds || []).filter(k => NAME_KINDS.includes(k));
  if (!force && c && Date.now() - c.at < NAME_DAY && want.every(k => Array.isArray(c.kinds[k]))) return Promise.resolve(c.kinds);
  return withSdk(F => decency().then((D) => {
    if (!S.user) return c ? c.kinds : null;
    return Promise.all(want.map(k => F.getDocs(F.query(F.collection(S.db, 'names', String(pool), k), F.orderBy('createdAt', 'desc'), F.limit(NAME_FETCH[k] || NAME_FETCH_SHIP)))
      .then(q => [k, q.docs.map(d => d.data().name).filter(n => typeof n === 'string' && n.length <= NAME_MAX && D && D.ok(n)).reverse()])))
      .then((L) => {
        const kinds = Object.assign({}, c ? c.kinds : {}, Object.fromEntries(L));
        store.set(namesKey(pool), JSON.stringify({ at: Date.now(), kinds }));
        return kinds;
      });
  })).catch(() => (c ? c.kinds : null));
};
// post one name the player's game just kept (signed in only): resolves 'sent',
// 'same' (already in the pool, any letter case), 'refused' (the decency
// filter, or not a name the pool takes) or 'off' (not signed in)
API.postName = (pool, kind, name) => {
  name = String(name == null ? '' : name).trim();
  if (!S.user || !NAME_KINDS.includes(kind) || !name || name.length > NAME_MAX || !nameId(name)) return Promise.resolve(S.user ? 'refused' : 'off');
  const c = namesCache(pool), lc = name.toLowerCase();
  if (c && (c.kinds[kind] || []).some(n => String(n).toLowerCase() === lc)) return Promise.resolve('same');
  return withSdk(F => decency().then((D) => {
    if (!D || !D.ok(name)) return 'refused';
    const u = needUser();
    return F.setDoc(F.doc(S.db, 'names', String(pool), kind, nameId(name)), { name, uid: u.uid, kind, createdAt: F.serverTimestamp() }).then(() => {
      // into this browser's copy too, so it isn't sent again
      const cc = namesCache(pool); if (cc) { (cc.kinds[kind] = cc.kinds[kind] || []).push(name); store.set(namesKey(pool), JSON.stringify(cc)); }
      return 'sent';
    }, (e) => (e && e.code === 'permission-denied' ? 'same' : 'error'));
  })).catch(() => 'error');
};

// an admin's removal (firestore.rules: /admins/{uid} documents only)
// Delete my account and data (the Account window; privacy.html): every save in
// the account, its preferences (users/{uid}/prefs), every Hall entry this account posted (the rulesets with a
// Hall), every name it added to a shared pool (namePools: the pools and their
// kinds, [[pool, [kind, …]], …], from the skin), its place in every online
// game (below, "online play"), then the account itself.
// Firebase asks for a recent sign-in before
// it deletes an account: that comes back as auth/requires-recent-login, and
// errorText says to sign in again and repeat.
API.deleteAccount = (hallRules, namePools) => withSdk((F) => {
  const u = needUser();
  const saves = F.getDocs(F.collection(S.db, 'users', u.uid, 'saves')).then(q => Promise.all(q.docs.map(d => F.deleteDoc(d.ref))));
  const prefs = F.getDocs(F.collection(S.db, 'users', u.uid, 'prefs')).then(q => Promise.all(q.docs.map(d => F.deleteDoc(d.ref))));
  const halls = Promise.all((hallRules || []).map(r => F.getDocs(F.query(F.collection(S.db, 'halls', String(r), 'entries'), F.where('uid', '==', u.uid)))
    .then(q => Promise.all(q.docs.map(d => F.deleteDoc(d.ref))))));
  const names = Promise.all((namePools || []).flatMap(([pool, kinds]) => (kinds || []).map(k => F.getDocs(F.query(F.collection(S.db, 'names', String(pool), k), F.where('uid', '==', u.uid)))
    .then(q => Promise.all(q.docs.map(d => F.deleteDoc(d.ref)))))));
  // the online games: left (resigned, when one is being played: the others play on, a
  // computer in this seat); a game still in its lobby that this account made is cancelled
  const games = F.getDocs(F.query(F.collection(S.db, 'games'), F.where('members', 'array-contains', u.uid))).then(q => Promise.all(q.docs.map((d) => {
    const g = d.data();
    if (g.status === 'lobby') return g.host === u.uid ? G0.cancel(d.id, g.code) : G0.leaveLobby(d.id);
    return G0.leave(d.id, g.status === 'playing');
  })));
  return Promise.all([saves, prefs, halls, names, games]).then(() => F.deleteUser(u)).then(() => {
    store.set(sentKey(u.uid), null); store.set('ho5.cloud.was', null); store.set('ho5.cloud.name', null); refresh();
  });
});
API.deleteHall = (rules, id) => withSdk(F => F.deleteDoc(F.doc(S.db, 'halls', String(rules), 'entries', id)));

// ---------- online play (games/{id}, codes/{code}) ----------
// A game several people play, each on their own computer, turn by turn
// (js/online.js plays the turns; the skin draws the windows). Firestore only:
// the free tier has no Cloud Functions, so the pages do everything and the
// rules keep each to their part. What is kept:
// - games/{id}: the game's card. code (the six letters to join by), host,
//   members (the uids who may read and write it: the host, then each player
//   as they join), names ({ uid: { name, female } }, as they joined), nSeats
//   (the people it is for), status ('lobby', 'playing', 'over'), rules,
//   edition, galaxy, opts (the New Game options, as JSON text), seats (the
//   members in seat order, fixed when the host starts it), turn (the state's
//   number), year, hash (the state's digest), resigned (uids handed to the
//   computer, still to be played as such), skip (uids whose turn the host
//   ended), createdAt, updated, client.
// - games/{id}/states/{turn}: the state at the start of that turn, the same
//   JSON a save is, gzipped (data, enc, size, raw), with its digest (hash),
//   who wrote it (by) and the resigned seats it played (resigned). Written
//   in the transaction that moves the card's turn on; the one before it is
//   kept (the pages check the new one against it), older ones deleted.
// - games/{id}/turns/{turn}/orders/{uid}: one player's orders for a turn
//   (js/online.js), gzipped (log), written once at End Turn.
// - games/{id}/joins/{uid}: a join request: the code the player typed (the
//   rules check it against the card's before the player is added).
// - codes/{code}: { game, host, createdAt }: which game a code opens. A
//   signed-in player may read one by its code (never list them); the host
//   deletes it when the game starts.
const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I
const newCode = () => { let c = ''; const r = new Uint32Array(6); (root.crypto || {}).getRandomValues ? root.crypto.getRandomValues(r) : r.forEach((x, i) => { r[i] = Math.random() * 2 ** 32; }); for (const x of r) c += CODE_LETTERS[x % CODE_LETTERS.length]; return c; };
API.cleanCode = (c) => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
const gameRef = (id) => root.HOFB.doc(S.db, 'games', id);
const card = (d) => Object.assign({ id: d.id }, d.data(), { updated: d.data().updated && d.data().updated.toMillis ? d.data().updated.toMillis() : 0 });
const who = (o) => ({ name: String(o.name || 'Player').slice(0, 40), female: !!o.female });
// pack JSON text for a document: { data (Bytes), enc, size, raw }; too big: an error in words
function pack(text, what) {
  return gzip(text).then(({ enc, bytes }) => {
    if (bytes.length > MAX_DATA) throw fail(`${what} is too big for the online game (${Math.round(bytes.length / 1024)} KB compressed; the limit is ${Math.round(MAX_DATA / 1024)} KB).`);
    return { data: root.HOFB.Bytes.fromUint8Array(bytes), enc, size: bytes.length, raw: text.length };
  });
}
const unpack = (x) => gunzip(x.data.toUint8Array(), x.enc);
const G0 = {
  // a new game in the lobby, for o = { rules, edition, galaxy, opts (object), nSeats, name, female }: resolves { id, code }
  create: (o) => withSdk((F) => {
    const u = needUser();
    const ref = F.doc(F.collection(S.db, 'games'));
    const tryCode = (n) => {
      const code = newCode(), b = F.writeBatch(S.db);
      b.set(ref, { code, host: u.uid, members: [u.uid], names: { [u.uid]: who(o) }, nSeats: Math.max(2, Math.min(8, o.nSeats | 0)), status: 'lobby',
        rules: String(o.rules).slice(0, 16), edition: String(o.edition || '').slice(0, 100), galaxy: String(o.galaxy || '').slice(0, 60), opts: JSON.stringify(o.opts || {}),
        turn: 0, year: 0, hash: '', seats: [], resigned: [], skip: [], createdAt: F.serverTimestamp(), updated: F.serverTimestamp(), client: CLIENT });
      b.set(F.doc(S.db, 'codes', code), { game: ref.id, host: u.uid, createdAt: F.serverTimestamp() });
      // a code already taken is refused by the rules (create only): another one
      return b.commit().then(() => ({ id: ref.id, code }), (e) => { if (n < 4 && e && e.code === 'permission-denied') return tryCode(n + 1); throw e; });
    };
    return tryCode(0);
  }),
  // the game a code opens, or null
  find: (code) => withSdk(F => (needUser(), F.getDoc(F.doc(S.db, 'codes', API.cleanCode(code))).then(d => (d.exists() ? d.data().game : null)))),
  // join a game in the lobby: the join request and the card's new member in one batch
  join: (id, code, o) => withSdk((F) => {
    const u = needUser(), b = F.writeBatch(S.db);
    b.set(F.doc(S.db, 'games', id, 'joins', u.uid), { uid: u.uid, code: API.cleanCode(code), name: who(o).name, createdAt: F.serverTimestamp() });
    b.update(gameRef(id), { members: F.arrayUnion(u.uid), ['names.' + u.uid]: who(o), updated: F.serverTimestamp() });
    return b.commit().catch((e) => { if (e && e.code === 'permission-denied') throw fail('That game can’t be joined: it may be full, already started, or the code is wrong.'); throw e; });
  }),
  // the card, live: fn(card) on every change (null: gone or out of reach); gives the unsubscribe
  watch: (id, fn, onErr) => { const F = root.HOFB; if (!F || !S.db) return () => {}; return F.onSnapshot(gameRef(id), d => fn(d.exists() ? card(d) : null), e => (onErr ? onErr(e) : fn(null))); },
  // a turn's orders as they come in: fn({ uid: true }) (the uids that have sent theirs)
  watchOrders: (id, turn, fn) => { const F = root.HOFB; if (!F || !S.db) return () => {}; return F.onSnapshot(F.collection(S.db, 'games', id, 'turns', String(turn), 'orders'), q => fn(Object.fromEntries(q.docs.map(d => [d.id, true]))), () => {}); },
  get: (id) => withSdk(F => F.getDoc(gameRef(id)).then(d => (d.exists() ? card(d) : null))),
  // the host changes the lobby's settings (o: { opts, nSeats, rules, edition, galaxy })
  settle: (id, o) => withSdk(F => F.updateDoc(gameRef(id), Object.assign({}, o.opts ? { opts: JSON.stringify(o.opts) } : {}, o.nSeats ? { nSeats: o.nSeats | 0 } : {},
    o.rules ? { rules: String(o.rules).slice(0, 16), edition: String(o.edition || '').slice(0, 100), galaxy: String(o.galaxy || '').slice(0, 60) } : {}, { updated: F.serverTimestamp() }))),
  // a player leaves the lobby (the host cancels instead)
  leaveLobby: (id) => withSdk((F) => {
    const u = needUser(), b = F.writeBatch(S.db);
    b.update(gameRef(id), { members: F.arrayRemove(u.uid), ['names.' + u.uid]: F.deleteField(), updated: F.serverTimestamp() });
    b.delete(F.doc(S.db, 'games', id, 'joins', u.uid));
    return b.commit();
  }),
  // the host cancels a game in the lobby: its code and card go
  cancel: (id, code) => withSdk((F) => { const b = F.writeBatch(S.db); if (code) b.delete(F.doc(S.db, 'codes', code)); b.delete(gameRef(id)); return b.commit(); }),
  // the host starts it: the first state (turn 0), the seats fixed, the code deleted
  start: (id, code, json, hash, year, seats, opts) => withSdk(F => pack(json, 'The game').then((pk) => {
    const u = needUser(), b = F.writeBatch(S.db);
    b.set(F.doc(S.db, 'games', id, 'states', '0'), Object.assign({ turn: 0, year: Math.round(year), hash, by: u.uid, resigned: [], createdAt: F.serverTimestamp(), client: CLIENT }, pk));
    b.update(gameRef(id), { status: 'playing', seats, turn: 0, year: Math.round(year), hash, opts: JSON.stringify(opts || {}), updated: F.serverTimestamp() });
    if (code) b.delete(F.doc(S.db, 'codes', code));
    return b.commit();
  })),
  // a state's text and its record, or null
  state: (id, turn) => withSdk(F => F.getDoc(F.doc(S.db, 'games', id, 'states', String(turn))).then(d => (d.exists() ? unpack(d.data()).then(json => ({ json, hash: d.data().hash, resigned: d.data().resigned || [], by: d.data().by })) : null))),
  // this player's orders for the turn (orders: js/online.js's log, as an object); resolves 'sent' or 'already' (sent before)
  submit: (id, turn, seat, log) => withSdk(F => pack(JSON.stringify(log), 'This turn’s orders').then((pk) => {
    const u = needUser(), ref = F.doc(S.db, 'games', id, 'turns', String(turn), 'orders', u.uid);
    return F.setDoc(ref, Object.assign({ uid: u.uid, seat: seat | 0, turn: turn | 0, createdAt: F.serverTimestamp() }, pk)).then(() => 'sent', (e) => {
      if (e && e.code === 'permission-denied') return F.getDoc(ref).then(d => { if (d.exists()) return 'already'; throw e; }, () => { throw e; });
      throw e;
    });
  })),
  // every order sent for a turn: { uid: log }
  orders: (id, turn) => withSdk(F => F.getDocs(F.collection(S.db, 'games', id, 'turns', String(turn), 'orders'))
    .then(q => Promise.all(q.docs.map(d => unpack(d.data()).then(t => [d.id, JSON.parse(t)]))).then(Object.fromEntries))),
  // The turn is played: the new state (turn + 1) and the card moved on, in a
  // transaction that reads the card first, so a turn already played by
  // another page is never written again (resolves 'late' then). Older states
  // and orders are tidied after.
  advance: (id, turn, json, hash, year, over, resigned) => withSdk(F => pack(json, 'The game').then((pk) => {
    const u = needUser(), ref = gameRef(id), next = turn + 1;
    return F.runTransaction(S.db, (tx) => tx.get(ref).then((d) => {
      if (!d.exists() || d.data().turn !== turn || d.data().status !== 'playing') return 'late';
      tx.set(F.doc(S.db, 'games', id, 'states', String(next)), Object.assign({ turn: next, year: Math.round(year), hash, by: u.uid, resigned: resigned || [], createdAt: F.serverTimestamp(), client: CLIENT }, pk));
      tx.update(ref, { turn: next, year: Math.round(year), hash, status: over ? 'over' : 'playing', skip: [], updated: F.serverTimestamp() });
      return 'played';
    })).then((r) => {
      if (r === 'played') {
        // the state two turns back and the orders before the last turn's: not needed again
        if (turn >= 1) F.deleteDoc(F.doc(S.db, 'games', id, 'states', String(turn - 1))).catch(() => null);
        if (turn >= 1) F.getDocs(F.collection(S.db, 'games', id, 'turns', String(turn - 1), 'orders')).then(q => q.docs.forEach(x => F.deleteDoc(x.ref).catch(() => null))).catch(() => null);
      }
      return r;
    });
  })),
  // a player hands their empire to the computer from the next turn (Resign)
  resign: (id) => withSdk(F => F.updateDoc(gameRef(id), { resigned: F.arrayUnion(needUser().uid), updated: F.serverTimestamp() })),
  // a player leaves a game for good (resigned too, if it is still being played): it leaves their list
  leave: (id, playing) => withSdk((F) => { const uid = needUser().uid; return F.updateDoc(gameRef(id), Object.assign({ members: F.arrayRemove(uid), updated: F.serverTimestamp() }, playing ? { resigned: F.arrayUnion(uid) } : {})); }),
  // the host ends the turn for players who haven't (uids): played as if they sent no orders
  skip: (id, uids) => withSdk(F => F.updateDoc(gameRef(id), { skip: F.arrayUnion(...uids), updated: F.serverTimestamp() })),
  // the games this account is in (no order in the query, so no index to make): newest first
  list: () => withSdk((F) => {
    const u = needUser();
    return F.getDocs(F.query(F.collection(S.db, 'games'), F.where('members', 'array-contains', u.uid))).then(q => q.docs.map(card).sort((a, b) => b.updated - a.updated));
  }),
};
API.games = G0;

// start-up: a browser that was signed in brings its account back once the
// page has loaded (and only then, so nothing slows the game's own start)
if (supported && (store.get('ho5.cloud.was') === '1' || store.sget('ho5.cloud.redirect'))) {
  const go = () => setTimeout(() => { ready(); }, 300);
  if (doc.readyState === 'complete') go(); else root.addEventListener('load', go);
}
root.HOCLOUD = API;
})(this);
