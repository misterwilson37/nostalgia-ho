'use strict';
// A fake Firebase (Auth and Firestore, in memory) for testing the online parts through a page when the real emulators cannot run (they are downloaded from Google's
// servers on first use, and a sandbox may not reach them). Not a replacement for tools/online-test.js and the emulators (docs/online.md, "Testing"): it does NOT
// apply firestore.rules, and it keeps one process's memory as "the server" that every browser window of a test shares.
//   const fake = require('./online-fake.js'); const server = fake.create();   // one shared store
//   await fake.install(context, server);                                      // for each Playwright browser context (each player)
// install() serves, in place of js/vendor/firebase.js, a script that defines window.HOFB with exactly what js/cloud.js uses, and answers that script's calls
// (POSTs to http://fakefb.invalid/rpc) from the store. Sign-in by Google makes a fixed fake Google account; an email account is kept in the store; a guest is
// a new anonymous user; the signed-in user is kept in the page's localStorage, as the real SDK keeps it, so a reload keeps the account.
const CLIENT = String.raw`(function () {
  const RPC = (body) => fetch('http://fakefb.invalid/rpc', { method: 'POST', body: JSON.stringify(body) }).then(r => r.json()).then((r) => { if (r.error) { const e = new Error(r.error.message); e.code = r.error.code; throw e; } return r.result; });
  class TS { constructor(ms) { this.ms = ms; } toMillis() { return this.ms; } toDate() { return new Date(this.ms); } get seconds() { return Math.floor(this.ms / 1000); } get nanoseconds() { return (this.ms % 1000) * 1e6; } }
  class Bytes { constructor(b) { this.b = b; } static fromUint8Array(u) { let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return new Bytes(btoa(s)); } toUint8Array() { const s = atob(this.b), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; } toBase64() { return this.b; } }
  const enc = (v) => { if (v instanceof Bytes) return { $b64: v.b }; if (v instanceof TS) return { $t: v.ms }; if (v && v.__fv) return v.__fv; if (Array.isArray(v)) return v.map(enc); if (v && typeof v === 'object') { const o = {}; for (const k in v) if (v[k] !== undefined) o[k] = enc(v[k]); return o; } return v; };
  const dec = (v) => { if (Array.isArray(v)) return v.map(dec); if (v && typeof v === 'object') { if ('$b64' in v) return new Bytes(v.$b64); if ('$t' in v) return new TS(v.$t); const o = {}; for (const k in v) o[k] = dec(v[k]); return o; } return v; };
  const rid = () => Math.random().toString(36).slice(2, 12);
  const mkdoc = (path) => { const p = path.split('/'); return { path, id: p[p.length - 1], __doc: true, parent: { path: p.slice(0, -1).join('/') } }; };
  const snapDoc = (path, data) => ({ id: path.split('/').pop(), ref: mkdoc(path), exists: () => data != null, data: () => (data != null ? dec(data) : undefined) });
  const qsnap = (rows) => { const docs = rows.map(r => snapDoc(r.path, r.data)); return { docs, size: docs.length, empty: !docs.length, forEach: f => docs.forEach(f) }; };
  const colOf = (q) => (q.__q ? q.col.path : q.path);
  const consOf = (q) => (q.__q ? q.cons : []);
  const F = {
    initializeApp: () => ({}), initializeFirestore: () => ({ __db: true }), connectFirestoreEmulator() {}, connectAuthEmulator() {},
    indexedDBLocalPersistence: {}, browserLocalPersistence: {}, browserPopupRedirectResolver: {},
    TS, Bytes,
    doc: (x, ...s) => (x && x.__col ? (s.length ? mkdoc(x.path + '/' + s.join('/')) : mkdoc(x.path + '/' + rid())) : mkdoc(s.join('/'))),
    collection: (x, ...s) => ({ path: (x && x.__col ? x.path + '/' : '') + s.join('/'), __col: true }),
    serverTimestamp: () => ({ __fv: { $ts: 1 } }), arrayUnion: (...a) => ({ __fv: { $au: a.map(enc) } }), arrayRemove: (...a) => ({ __fv: { $ar: a.map(enc) } }), deleteField: () => ({ __fv: { $del: 1 } }),
    query: (col, ...cons) => ({ __q: true, col, cons }), where: (f, op, v) => ({ t: 'where', f, op, v: enc(v) }), orderBy: (f, d) => ({ t: 'order', f, d: d || 'asc' }), limit: (n) => ({ t: 'limit', n }),
    getDoc: (ref) => RPC({ op: 'get', path: ref.path }).then(d => snapDoc(ref.path, d)),
    getDocs: (q) => RPC({ op: 'list', path: colOf(q), cons: consOf(q) }).then(qsnap),
    setDoc: (ref, data, o) => RPC({ op: 'set', path: ref.path, data: enc(data), merge: !!(o && o.merge) }).then(() => undefined),
    updateDoc: (ref, data) => RPC({ op: 'update', path: ref.path, data: enc(data) }).then(() => undefined),
    deleteDoc: (ref) => RPC({ op: 'delete', path: ref.path }).then(() => undefined),
    addDoc: (col, data) => { const ref = mkdoc(col.path + '/' + rid()); return RPC({ op: 'set', path: ref.path, data: enc(data) }).then(() => ref); },
    writeBatch: () => { const ops = []; const b = { set: (ref, data, o) => { ops.push({ op: 'set', path: ref.path, data: enc(data), merge: !!(o && o.merge) }); return b; }, update: (ref, data) => { ops.push({ op: 'update', path: ref.path, data: enc(data) }); return b; }, delete: (ref) => { ops.push({ op: 'delete', path: ref.path }); return b; }, commit: () => RPC({ op: 'batch', ops }).then(() => undefined) }; return b; },
    runTransaction: (db, fn) => { const ops = []; const tx = { get: (ref) => F.getDoc(ref), set: (ref, data, o) => { ops.push({ op: 'set', path: ref.path, data: enc(data), merge: !!(o && o.merge) }); return tx; }, update: (ref, data) => { ops.push({ op: 'update', path: ref.path, data: enc(data) }); return tx; }, delete: (ref) => { ops.push({ op: 'delete', path: ref.path }); return tx; } }; return Promise.resolve(fn(tx)).then(r => RPC({ op: 'batch', ops }).then(() => r)); },
    onSnapshot: (target, cb, err) => { let last = null, dead = false; const tick = async () => { if (dead) return; try { if (target.__doc) { const d = await RPC({ op: 'get', path: target.path }), k = JSON.stringify(d); if (k !== last) { last = k; cb(snapDoc(target.path, d)); } } else { const rows = await RPC({ op: 'list', path: colOf(target), cons: consOf(target) }), k = JSON.stringify(rows); if (k !== last) { last = k; cb(qsnap(rows)); } } } catch (e) { if (err) err(e); } if (!dead) setTimeout(tick, 350); }; tick(); return () => { dead = true; }; },
  };
  // ---- auth ----
  const KEY = 'fakefb.user', listeners = [], auth = { currentUser: null };
  const setUser = (u) => { auth.currentUser = u; try { localStorage.setItem(KEY, u ? JSON.stringify(u) : ''); } catch (e) {} listeners.slice().forEach(f => setTimeout(() => f(u), 0)); return { user: u }; };
  const needUser = () => { if (!auth.currentUser) { const e = new Error('no user'); e.code = 'auth/no-current-user'; throw e; } return auth.currentUser; };
  Object.assign(F, {
    initializeAuth: () => { try { auth.currentUser = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { auth.currentUser = null; } return auth; },
    onAuthStateChanged: (a, cb) => { listeners.push(cb); setTimeout(() => cb(auth.currentUser), 0); return () => { const i = listeners.indexOf(cb); if (i >= 0) listeners.splice(i, 1); }; },
    signInAnonymously: () => Promise.resolve(setUser({ uid: 'anon' + rid(), isAnonymous: true, email: null, displayName: null, providerData: [] })),
    createUserWithEmailAndPassword: (a, email, pw) => RPC({ op: 'authCreate', email, pw }).then(r => setUser({ uid: r.uid, isAnonymous: false, email: r.email, displayName: null, providerData: [{ providerId: 'password', email: r.email }] })),
    signInWithEmailAndPassword: (a, email, pw) => RPC({ op: 'authSignIn', email, pw }).then(r => setUser({ uid: r.uid, isAnonymous: false, email: r.email, displayName: null, providerData: [{ providerId: 'password', email: r.email }] })),
    sendPasswordResetEmail: (a, email) => RPC({ op: 'authReset', email }).then(() => undefined),
    signOut: () => { setUser(null); return Promise.resolve(); },
    deleteUser: (u) => RPC({ op: 'authDelete', uid: u.uid }).then(() => { setUser(null); }),
    getRedirectResult: () => Promise.resolve(null),
    GoogleAuthProvider: class { constructor() { this.providerId = 'google.com'; } },
    EmailAuthProvider: { credential: (email, pw) => ({ providerId: 'password', email, pw }) },
    signInWithPopup: () => Promise.resolve(setUser({ uid: 'google1', isAnonymous: false, email: 'google.player@example.com', displayName: 'Google Player', providerData: [{ providerId: 'google.com', email: 'google.player@example.com' }] })),
    linkWithPopup: () => { const u = needUser(); return Promise.resolve(setUser(Object.assign({}, u, { isAnonymous: false, email: 'google.player@example.com', displayName: 'Google Player', providerData: [{ providerId: 'google.com', email: 'google.player@example.com' }] }))); },
    linkWithCredential: (u0, cred) => RPC({ op: 'authCreate', email: cred.email, pw: cred.pw, uid: u0.uid }).then(r => setUser(Object.assign({}, needUser(), { isAnonymous: false, email: r.email, providerData: [{ providerId: 'password', email: r.email }] }))),
  });
  window.HOFB = F;
})();`;

// ---- the store ("the server") ----
function create() {
  const docs = new Map(), users = new Map(); // path -> object; email -> { uid, pw }
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const get = (o, path) => path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), o);
  const val = (v) => (v && typeof v === 'object' && '$t' in v ? v.$t : v);
  const setPath = (o, path, v) => { const ks = path.split('.'); let a = o; for (let i = 0; i < ks.length - 1; i++) { if (a[ks[i]] == null || typeof a[ks[i]] !== 'object') a[ks[i]] = {}; a = a[ks[i]]; } a[ks[ks.length - 1]] = v; };
  const delPath = (o, path) => { const ks = path.split('.'); let a = o; for (let i = 0; i < ks.length - 1; i++) { if (a == null) return; a = a[ks[i]]; } if (a) delete a[ks[ks.length - 1]]; };
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const field = (cur, v) => { // a write's value: a field value is resolved against what is there
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if ('$ts' in v) return { $t: Date.now() };
      if ('$au' in v) { const a = Array.isArray(cur) ? cur.slice() : []; for (const x of v.$au) if (!a.some(y => same(x, y))) a.push(x); return a; }
      if ('$ar' in v) return (Array.isArray(cur) ? cur : []).filter(y => !v.$ar.some(x => same(x, y)));
      if ('$del' in v) return undefined;
      const o = {}; for (const k in v) { const r = field(undefined, v[k]); if (r !== undefined) o[k] = r; } return o;
    }
    if (Array.isArray(v)) return v.map(x => field(undefined, x));
    return v;
  };
  const write = (op) => {
    if (op.op === 'delete') { docs.delete(op.path); return; }
    if (op.op === 'set') { const cur = op.merge ? (docs.get(op.path) || {}) : {}; const out = op.merge ? cur : {}; for (const k in op.data) { const r = field(out[k], op.data[k]); if (r !== undefined) out[k] = r; else delete out[k]; } docs.set(op.path, out); return; }
    if (op.op === 'update') { const cur = docs.get(op.path); if (!cur) { const e = new Error('No document to update: ' + op.path); e.code = 'not-found'; throw e; } for (const k in op.data) { const r = field(get(cur, k), op.data[k]); if (r === undefined) delPath(cur, k); else setPath(cur, k, r); } return; }
  };
  const list = (path, cons) => {
    const depth = path.split('/').length + 1; let rows = [];
    for (const [p, d] of docs) if (p.startsWith(path + '/') && p.split('/').length === depth) rows.push({ path: p, data: clone(d) });
    for (const c of cons) if (c.t === 'where') rows = rows.filter(r => { const x = val(get(r.data, c.f)), y = val(c.v), a = Array.isArray(get(r.data, c.f)) ? get(r.data, c.f) : null;
      switch (c.op) { case '==': return same(x, y); case '!=': return !same(x, y); case '<': return x < y; case '<=': return x <= y; case '>': return x > y; case '>=': return x >= y; case 'array-contains': return !!a && a.some(z => same(z, c.v)); case 'in': return (c.v || []).some(z => same(z, x)); case 'array-contains-any': return !!a && a.some(z => (c.v || []).some(w => same(z, w))); default: return true; } });
    for (const c of cons) if (c.t === 'order') rows.sort((p, q) => { const x = val(get(p.data, c.f)), y = val(get(q.data, c.f)); return (x < y ? -1 : x > y ? 1 : 0) * (c.d === 'desc' ? -1 : 1); });
    for (const c of cons) if (c.t === 'limit') rows = rows.slice(0, c.n);
    return rows;
  };
  const err = (code, message) => { const e = new Error(message); e.code = code; return e; };
  const handle = (b) => {
    switch (b.op) {
      case 'get': return docs.has(b.path) ? clone(docs.get(b.path)) : null;
      case 'list': return list(b.path, b.cons || []);
      case 'set': case 'update': case 'delete': write(b); return true;
      case 'batch': for (const o of b.ops) write(o); return true;
      case 'authCreate': {
        const email = String(b.email || '').trim().toLowerCase();
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw err('auth/invalid-email', 'invalid email');
        if (String(b.pw || '').length < 6) throw err('auth/weak-password', 'weak password');
        if (users.has(email)) throw err('auth/email-already-in-use', 'in use');
        const uid = b.uid || 'u' + Math.random().toString(36).slice(2, 10); users.set(email, { uid, pw: b.pw }); return { uid, email };
      }
      case 'authSignIn': { const email = String(b.email || '').trim().toLowerCase(), u = users.get(email); if (!u || u.pw !== b.pw) throw err('auth/invalid-credential', 'bad credentials'); return { uid: u.uid, email }; }
      case 'authReset': return true;
      case 'authDelete': for (const [e, u] of users) if (u.uid === b.uid) users.delete(e); return true;
      default: throw err('unimplemented', 'unknown op ' + b.op);
    }
  };
  return { docs, users, handle };
}

// ---- a Playwright browser context served by the store ----
async function install(context, server) {
  await context.route('**/js/vendor/firebase.js*', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: CLIENT }));
  await context.route('http://fakefb.invalid/rpc', async (route) => {
    const hdr = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' };
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: hdr, body: '' });
    let out;
    try { out = { result: server.handle(JSON.parse(route.request().postData() || '{}')) }; } catch (e) { out = { error: { code: e.code || 'unknown', message: e.message } }; }
    return route.fulfill({ status: 200, contentType: 'application/json', headers: hdr, body: JSON.stringify(out) });
  });
}
module.exports = { create, install, CLIENT };
