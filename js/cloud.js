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
// the account, every Hall entry this account posted (the rulesets with a
// Hall), every name it added to a shared pool (namePools: the pools and their
// kinds, [[pool, [kind, …]], …], from the skin), then the account itself.
// Firebase asks for a recent sign-in before
// it deletes an account: that comes back as auth/requires-recent-login, and
// errorText says to sign in again and repeat.
API.deleteAccount = (hallRules, namePools) => withSdk((F) => {
  const u = needUser();
  const saves = F.getDocs(F.collection(S.db, 'users', u.uid, 'saves')).then(q => Promise.all(q.docs.map(d => F.deleteDoc(d.ref))));
  const halls = Promise.all((hallRules || []).map(r => F.getDocs(F.query(F.collection(S.db, 'halls', String(r), 'entries'), F.where('uid', '==', u.uid)))
    .then(q => Promise.all(q.docs.map(d => F.deleteDoc(d.ref))))));
  const names = Promise.all((namePools || []).flatMap(([pool, kinds]) => (kinds || []).map(k => F.getDocs(F.query(F.collection(S.db, 'names', String(pool), k), F.where('uid', '==', u.uid)))
    .then(q => Promise.all(q.docs.map(d => F.deleteDoc(d.ref)))))));
  return Promise.all([saves, halls, names]).then(() => F.deleteUser(u)).then(() => {
    store.set(sentKey(u.uid), null); store.set('ho5.cloud.was', null); store.set('ho5.cloud.name', null); refresh();
  });
});
API.deleteHall = (rules, id) => withSdk(F => F.deleteDoc(F.doc(S.db, 'halls', String(rules), 'entries', id)));

// start-up: a browser that was signed in brings its account back once the
// page has loaded (and only then, so nothing slows the game's own start)
if (supported && (store.get('ho5.cloud.was') === '1' || store.sget('ho5.cloud.redirect'))) {
  const go = () => setTimeout(() => { ready(); }, 300);
  if (doc.readyState === 'complete') go(); else root.addEventListener('load', go);
}
root.HOCLOUD = API;
})(this);
