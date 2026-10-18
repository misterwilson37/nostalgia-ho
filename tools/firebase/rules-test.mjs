// Tests firestore.rules against the Firebase emulators (docs/online.md, "Testing"):
//   cd tools/firebase && npm install
//   (cd ../.. && tools/firebase/node_modules/.bin/firebase emulators:start --only auth,firestore --project nostalgia-ho)
//   node tools/firebase/rules-test.mjs        (in another terminal; prints "rules ok")
// Ports from firebase.json (auth 8811, Firestore 8810), or FIREBASE_AUTH_PORT
// and FIRESTORE_PORT. Each case says what must be allowed or denied; one
// player can never read or write another's saves, nobody may change a Hall
// entry, and only an admin (an /admins/{uid} document) may delete one.
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInAnonymously, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator, doc, collection, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, Bytes, query, where, orderBy, limit, setLogLevel, writeBatch, runTransaction, arrayUnion, arrayRemove, deleteField } from 'firebase/firestore';
setLogLevel('silent'); // the denied writes are expected; the cases below report

const AUTH = +(process.env.FIREBASE_AUTH_PORT || 8811), FS = +(process.env.FIRESTORE_PORT || 8810), PROJECT = 'nostalgia-ho';
const base = `http://127.0.0.1:${FS}`;
// a fresh start: the emulator's data cleared
await fetch(`${base}/emulator/v1/projects/${PROJECT}/databases/(default)/documents`, { method: 'DELETE' });
await fetch(`http://127.0.0.1:${AUTH}/emulator/v1/projects/${PROJECT}/accounts`, { method: 'DELETE' });

let n = 0;
const fails = [];
function client(name) {
  const app = initializeApp({ apiKey: 'fake-api-key', projectId: PROJECT, authDomain: 'localhost' }, name);
  const auth = getAuth(app); connectAuthEmulator(auth, `http://127.0.0.1:${AUTH}`, { disableWarnings: true });
  const db = initializeFirestore(app, {}); connectFirestoreEmulator(db, '127.0.0.1', FS);
  return { app, auth, db };
}
async function expect(ok, what, p) {
  n++;
  try { await (typeof p === 'function' ? p() : p); if (!ok) fails.push(`allowed, should be denied: ${what}`); } catch (e) {
    if (ok) fails.push(`denied, should be allowed: ${what} (${e.code || e.message})`);
    else if (e.code !== 'permission-denied') fails.push(`denied for the wrong reason: ${what} (${e.code || e.message})`);
  }
}
const allow = (what, p) => expect(true, what, p), deny = (what, p) => expect(false, what, p);

const A = client('a'), B = client('b'), N = client('nobody');
const a = (await signInAnonymously(A.auth)).user;
const b = (await createUserWithEmailAndPassword(B.auth, 'b@example.com', 'secret123')).user;

// ---------- saves ----------
const bytes = (k) => Bytes.fromUint8Array(new Uint8Array(k).fill(7));
const save = (o) => Object.assign({ rules: '405', edition: 'Windows 95 4.0.5', year: 2120, player: 'Ann', galaxy: 'Milky Way', over: false,
  updated: serverTimestamp(), saved: Date.now(), size: 10, raw: 100, enc: 'gzip', hash: 'abc.1', data: bytes(10), client: 'web 5.1 Alpha' }, o);
const aSave = doc(A.db, 'users', a.uid, 'saves', '405-1');
await allow('a player writes their own save', setDoc(aSave, save()));
await allow('a player overwrites their own save', setDoc(aSave, save({ year: 2130 })));
await allow('a player reads their own save', getDoc(aSave));
await allow('a player lists their own saves', getDocs(query(collection(A.db, 'users', a.uid, 'saves'), orderBy('updated', 'desc'))));
await deny('another player reads it', getDoc(doc(B.db, 'users', a.uid, 'saves', '405-1')));
await deny('another player lists them', getDocs(collection(B.db, 'users', a.uid, 'saves')));
await deny('another player overwrites it', setDoc(doc(B.db, 'users', a.uid, 'saves', '405-1'), save()));
await deny('another player deletes it', deleteDoc(doc(B.db, 'users', a.uid, 'saves', '405-1')));
await deny('nobody signed in reads it', getDoc(doc(N.db, 'users', a.uid, 'saves', '405-1')));
await deny('a save with an extra field', setDoc(aSave, save({ extra: 1 })));
await deny('a save with a client time for updated', setDoc(aSave, save({ updated: new Date() })));
await deny('a save whose size is not its data’s', setDoc(aSave, save({ size: 11 })));
await deny('a save with text for data', setDoc(aSave, save({ data: 'x' })));
await deny('a save with a long player name', setDoc(aSave, save({ player: 'x'.repeat(61) })));
await deny('a save with an unknown encoding', setDoc(aSave, save({ enc: 'zip' })));
await deny('a save over 1,000,000 bytes', setDoc(aSave, save({ data: bytes(1000001), size: 1000001 })));
await allow('a save of 1,000,000 bytes', setDoc(doc(A.db, 'users', a.uid, 'saves', 'big'), save({ data: bytes(1000000), size: 1000000 })));
await allow('a player deletes their own save', deleteDoc(doc(A.db, 'users', a.uid, 'saves', 'big')));

// ---------- the Hall ----------
const entry = (o, kind) => {
  kind = kind || 'fame';
  const e = Object.assign({ uid: a.uid, name: 'Ann', kind, rules: '405', edition: 'Windows 95 4.0.5', client: 'web 5.1 Alpha', createdAt: serverTimestamp(),
    humans: 1, computers: 4, shape: 2, density: 1, size: 3, iq: 2, year: 2210, allies: 0, difficulty: 37, yearsPerTurn: 10, skill: 2, armageddons: 0,
    time: Math.floor(Date.now() / 1000) }, o);
  if (!(o && o.noKind)) { e[kind + 'At'] = serverTimestamp(); e[kind + 'Difficulty'] = e.difficulty; }
  delete e.noKind;
  return e;
};
const hall = (c, r) => collection(c.db, 'halls', r || '405', 'entries');
let posted = null;
await allow('a guest posts a Hall of Fame entry', addDoc(hall(A), entry()).then(d => { posted = d; }));
await allow('a player posts a Hall of Shame entry', addDoc(hall(B), entry({ uid: b.uid, name: 'Bob' }, 'shame')));
await allow('a 3.0.1 entry (words for the galaxy)', addDoc(hall(A, '301'), entry({ rules: '301', shape: 'spiral', size: 'medium', density: 'dense', iq: 'smart', replays: 1 })));
await allow('anyone reads the Hall, signed in or not', getDocs(query(hall(N), orderBy('fameAt', 'desc'), limit(25))));
await allow('the best 25', getDocs(query(hall(N), orderBy('fameDifficulty', 'desc'), limit(25))));
await deny('nobody signed in posts', addDoc(hall(N), entry()));
await deny('an entry as someone else', addDoc(hall(A), entry({ uid: b.uid })));
await deny('an entry for another ruleset’s Hall', addDoc(hall(A, '301'), entry({ rules: '405' })));
await deny('a name over 40 characters', addDoc(hall(A), entry({ name: 'x'.repeat(41) })));
await deny('an empty name', addDoc(hall(A), entry({ name: '' })));
await deny('a client time for createdAt', addDoc(hall(A), entry({ createdAt: new Date() })));
await deny('a fame entry without fameAt', addDoc(hall(A), entry({ noKind: true })));
await deny('a fame entry claiming another difficulty', addDoc(hall(A), Object.assign(entry(), { fameDifficulty: 99 })));
await deny('a fame entry with shame fields', addDoc(hall(A), Object.assign(entry(), { shameAt: serverTimestamp(), shameDifficulty: 37 })));
await deny('an unknown kind', addDoc(hall(A), entry({ kind: 'glory', noKind: true })));
await deny('a difficulty out of range', addDoc(hall(A), entry({ difficulty: 1e9 })));
await deny('a number field as text', addDoc(hall(A), entry({ humans: 'one' })));
await deny('an extra field', addDoc(hall(A), entry({ opts: { seed: 1 } })));
await deny('a game time a week away', addDoc(hall(A), entry({ time: Math.floor(Date.now() / 1000) - 7 * 86400 })));
await deny('a long word for the shape', addDoc(hall(A), entry({ shape: 'x'.repeat(17) })));
await deny('its poster changes it', updateDoc(posted, { name: 'Bob' }));
// its poster may delete their own (Delete my account and data), on a second entry
const mine = await addDoc(hall(A), entry({}));
await allow('its poster deletes their own (Delete my account)', deleteDoc(mine));
await deny('another player deletes it', deleteDoc(doc(B.db, 'halls', '405', 'entries', posted.id)));

// ---------- shared names ----------
const nm = (o) => Object.assign({ name: 'Zebulon', uid: a.uid, kind: 'stars', createdAt: serverTimestamp() }, o);
const nref = (c, kind, id, pool) => doc(c.db, 'names', pool || '5', kind, id);
await allow('a guest adds a star name', setDoc(nref(A, 'stars', 'zebulon'), nm()));
await allow('a player adds a ship type name', setDoc(nref(B, 'ships-scout', 'pathfinder', '2.0'), nm({ name: 'Pathfinder', uid: b.uid, kind: 'ships-scout' })));
await allow('anyone reads the names, signed in or not', getDocs(query(collection(N.db, 'names', '5', 'stars'), orderBy('createdAt', 'desc'), limit(60))));
await deny('the same name again, in other letters', setDoc(nref(B, 'stars', 'zebulon'), nm({ name: 'ZEBULON', uid: b.uid })));
await deny('a name whose id isn’t its lower case', setDoc(nref(A, 'stars', 'other'), nm({ name: 'Ganymede' })));
await deny('nobody signed in adds a name', setDoc(nref(N, 'stars', 'quark'), nm({ name: 'Quark', uid: 'x' })));
await deny('a name as someone else', setDoc(nref(A, 'stars', 'quark'), nm({ name: 'Quark', uid: b.uid })));
await deny('a name over 31 characters', setDoc(nref(A, 'men', 'x'.repeat(32)), nm({ name: 'x'.repeat(32), kind: 'men' })));
await deny('an unknown kind', setDoc(nref(A, 'planets', 'quark'), nm({ name: 'Quark', kind: 'planets' })));
await deny('a kind that isn’t its collection', setDoc(nref(A, 'men', 'quark'), nm({ name: 'Quark', kind: 'women' })));
await deny('a client time for createdAt', setDoc(nref(A, 'stars', 'quark'), nm({ name: 'Quark', createdAt: new Date() })));
await deny('an extra field', setDoc(nref(A, 'stars', 'quark'), nm({ name: 'Quark', extra: 1 })));
await deny('its poster changes it', updateDoc(nref(A, 'stars', 'zebulon'), { name: 'zebulon' }));
await deny('another player deletes it', deleteDoc(nref(B, 'stars', 'zebulon')));
await allow('its poster deletes it (Delete my account)', deleteDoc(nref(B, 'ships-scout', 'pathfinder', '2.0')));
await allow('a player lists their own names (Delete my account)', getDocs(query(collection(A.db, 'names', '5', 'stars'), where('uid', '==', a.uid))));

// ---------- admins ----------
await deny('a player reads the admin list', getDoc(doc(A.db, 'admins', a.uid)));
await deny('a player lists the admins', getDocs(collection(A.db, 'admins')));
await deny('a player makes themselves an admin', setDoc(doc(A.db, 'admins', a.uid), { x: 1 }));
// made by hand, as in the console: the emulator's owner token skips the rules
const admin = await fetch(`${base}/v1/projects/${PROJECT}/databases/(default)/documents/admins?documentId=${b.uid}`,
  { method: 'POST', headers: { Authorization: 'Bearer owner', 'Content-Type': 'application/json' }, body: JSON.stringify({ fields: {} }) });
if (!admin.ok) fails.push('could not make the admin document: ' + admin.status);
await deny('an admin still can’t read the admin list', getDoc(doc(B.db, 'admins', b.uid)));
await deny('an admin can’t change an entry', updateDoc(doc(B.db, 'halls', '405', 'entries', posted.id), { name: 'X' }));
await allow('an admin deletes an entry', deleteDoc(doc(B.db, 'halls', '405', 'entries', posted.id)));
await allow('an admin deletes a shared name', deleteDoc(nref(B, 'stars', 'zebulon')));

// ---------- online play ----------
const C = client('c');
const c = (await createUserWithEmailAndPassword(C.auth, 'c@example.com', 'secret123')).user;
const card = (o) => Object.assign({ code: 'ABC234', host: a.uid, members: [a.uid], names: { [a.uid]: { name: 'Ann', female: true } }, nSeats: 2, status: 'lobby',
  rules: '405', edition: 'Windows 95 4.0.5', galaxy: 'Milky Way', opts: '{}', turn: 0, year: 0, hash: '', seats: [], resigned: [], skip: [],
  createdAt: serverTimestamp(), updated: serverTimestamp(), client: 'web 5.1 Alpha' }, o);
const gref = (x, id) => doc(x.db, 'games', id || 'g1');
const newGameBatch = (x, id, code, o) => { const bt = writeBatch(x.db); bt.set(gref(x, id), card(Object.assign({ code }, o))); bt.set(doc(x.db, 'codes', code), { game: id, host: (o && o.host) || a.uid, createdAt: serverTimestamp() }); return bt.commit(); };
await allow('a guest makes an online game and its code', newGameBatch(A, 'g1', 'ABC234'));
await deny('a code for someone else’s game', setDoc(doc(B.db, 'codes', 'ZZZ234'), { game: 'g1', host: b.uid, createdAt: serverTimestamp() }));
await deny('a game made for someone else', setDoc(gref(B, 'g2'), card({ host: a.uid })));
await deny('a game that starts with others in it', setDoc(gref(B, 'g2'), card({ host: b.uid, members: [b.uid, a.uid], names: { [b.uid]: { name: 'Bob', female: false } } })));
await allow('a signed-in player reads a code', getDoc(doc(B.db, 'codes', 'ABC234')));
await deny('nobody signed in reads a code', getDoc(doc(N.db, 'codes', 'ABC234')));
await deny('a player lists the codes', getDocs(collection(B.db, 'codes')));
await deny('a player not in the game reads it', getDoc(gref(B)));
const joinBatch = (x, u, code, name, id) => { const bt = writeBatch(x.db); bt.set(doc(x.db, 'games', id || 'g1', 'joins', u.uid), { uid: u.uid, code, name, createdAt: serverTimestamp() });
  bt.update(gref(x, id), { members: arrayUnion(u.uid), ['names.' + u.uid]: { name, female: false }, updated: serverTimestamp() }); return bt.commit(); };
await deny('a join with the wrong code', joinBatch(B, b, 'ZZZ999', 'Bob'));
await deny('a join without a join request', updateDoc(gref(B), { members: arrayUnion(b.uid), ['names.' + b.uid]: { name: 'Bob', female: false }, updated: serverTimestamp() }));
await allow('a join with the code', joinBatch(B, b, 'ABC234', 'Bob'));
await deny('a join when every seat is taken', joinBatch(C, c, 'ABC234', 'Cal'));
await allow('a member reads the game', getDoc(gref(B)));
await allow('a member lists their games', getDocs(query(collection(B.db, 'games'), where('members', 'array-contains', b.uid))));
await deny('a player lists games they aren’t in', getDocs(query(collection(C.db, 'games'), where('members', 'array-contains', a.uid))));
await deny('a player not in it reads the game', getDoc(gref(C)));
await deny('a member who isn’t the host changes the settings', updateDoc(gref(B), { opts: '{"x":1}', updated: serverTimestamp() }));
await allow('the host changes the settings', updateDoc(gref(A), { opts: '{"seed":5}', updated: serverTimestamp() }));
await deny('the host makes fewer seats than players', updateDoc(gref(A), { nSeats: 1, updated: serverTimestamp() }));
await deny('a member adds someone else', updateDoc(gref(B), { members: arrayUnion(c.uid), updated: serverTimestamp() }));
{ const bt = writeBatch(B.db); bt.update(gref(B), { members: arrayRemove(b.uid), ['names.' + b.uid]: deleteField(), updated: serverTimestamp() }); bt.delete(doc(B.db, 'games', 'g1', 'joins', b.uid));
  await allow('a player leaves the lobby', bt.commit()); }
await allow('and joins again', joinBatch(B, b, 'ABC234', 'Bob'));
const st = (turn, x, o) => Object.assign({ turn, year: 2000 + turn * 10, hash: 'h' + turn, by: x, resigned: [], createdAt: serverTimestamp(), client: 'web 5.1 Alpha', data: bytes(20), enc: 'gzip', size: 20, raw: 200 }, o);
const startBatch = (x, u, withState) => { const bt = writeBatch(x.db); if (withState) bt.set(doc(x.db, 'games', 'g1', 'states', '0'), st(0, u.uid));
  bt.update(gref(x), { status: 'playing', seats: [a.uid, b.uid], turn: 0, year: 2000, hash: 'h0', opts: '{}', updated: serverTimestamp() }); bt.delete(doc(x.db, 'codes', 'ABC234')); return bt.commit(); };
await deny('a member who isn’t the host starts it', startBatch(B, b, true));
await deny('the host starts it without its first state', startBatch(A, a, false));
await deny('a state written while the game is in its lobby', setDoc(doc(A.db, 'games', 'g1', 'states', '0'), st(0, a.uid)));
await allow('the host starts it, with its first state', startBatch(A, a, true));
await deny('a state written again', setDoc(doc(A.db, 'games', 'g1', 'states', '0'), st(0, a.uid)));
await deny('a join once it has started', joinBatch(C, c, 'ABC234', 'Cal'));
const ord = (u, turn, o) => Object.assign({ uid: u.uid, seat: u === a ? 0 : 1, turn, createdAt: serverTimestamp(), data: bytes(30), enc: 'gzip', size: 30, raw: 300 }, o);
const oref = (x, turn, u) => doc(x.db, 'games', 'g1', 'turns', String(turn), 'orders', u.uid);
await allow('a player sends their orders', setDoc(oref(B, 0, b), ord(b, 0)));
await deny('a player sends them again', setDoc(oref(B, 0, b), ord(b, 0)));
await deny('a player sends another’s orders', setDoc(oref(B, 0, a), ord(a, 0)));
await deny('orders for a turn the game isn’t on', setDoc(oref(A, 1, a), ord(a, 1)));
await deny('a player not in the game reads the orders', getDocs(collection(C.db, 'games', 'g1', 'turns', '0', 'orders')));
await allow('a member reads the orders', getDocs(collection(A.db, 'games', 'g1', 'turns', '0', 'orders')));
await allow('a member reads the state', getDoc(doc(A.db, 'games', 'g1', 'states', '0')));
await deny('a player not in the game reads the state', getDoc(doc(C.db, 'games', 'g1', 'states', '0')));
const adv = (x, u, from, to, withState) => runTransaction(x.db, (tx) => tx.get(gref(x)).then(() => {
  if (withState) tx.set(doc(x.db, 'games', 'g1', 'states', String(to)), st(to, u.uid));
  tx.update(gref(x), { turn: to, year: 2000 + to * 10, hash: 'h' + to, status: 'playing', skip: [], updated: serverTimestamp() });
}));
await deny('a turn played two turns on', adv(B, b, 0, 2, true));
await deny('a turn played without its state', adv(B, b, 0, 1, false));
await deny('a player not in the game plays the turn', adv(C, c, 0, 1, true));
await allow('a member plays the turn, its state with it', adv(B, b, 0, 1, true));
await deny('the same turn played again', runTransaction(B.db, (tx) => tx.get(gref(B)).then(() => { tx.set(doc(B.db, 'games', 'g1', 'states', '1'), st(1, b.uid)); })));
await deny('the turn number put back', updateDoc(gref(A), { turn: 0, updated: serverTimestamp() }));
await deny('a member who isn’t the host ends someone’s turn', updateDoc(gref(B), { skip: [a.uid], updated: serverTimestamp() }));
await allow('the host ends a player’s turn for them', updateDoc(gref(A), { skip: [b.uid], updated: serverTimestamp() }));
await deny('the host ends the turn for someone not in the game', updateDoc(gref(A), { skip: [c.uid], updated: serverTimestamp() }));
await deny('a player resigns someone else', updateDoc(gref(B), { resigned: [a.uid], updated: serverTimestamp() }));
await allow('a player resigns', updateDoc(gref(B), { resigned: arrayUnion(b.uid), updated: serverTimestamp() }));
await deny('and resigns again', updateDoc(gref(B), { resigned: [b.uid, b.uid], updated: serverTimestamp() }));
await deny('a member tidies the state the game is on', deleteDoc(doc(A.db, 'games', 'g1', 'states', '1')));
await allow('a member tidies a played turn’s orders', deleteDoc(oref(A, 0, b)));
await allow('a player leaves the game', updateDoc(gref(B), { members: arrayRemove(b.uid), updated: serverTimestamp() }));
await deny('and can’t read it any more', getDoc(gref(B)));
await deny('a player not in it deletes the game', deleteDoc(gref(C)));
await allow('the host deletes the game', deleteDoc(gref(A)));

// ---------- everything else ----------
await deny('a document anywhere else', setDoc(doc(A.db, 'misc', 'x'), { a: 1 }));
await deny('reading anywhere else', getDoc(doc(N.db, 'users', a.uid)));
await deny('a player document above the saves', setDoc(doc(A.db, 'users', a.uid), { a: 1 }));

await signOut(A.auth); await signOut(B.auth); await signOut(C.auth);
for (const x of [A, B, C, N]) await deleteApp(x.app);
if (fails.length) { console.log(fails.join('\n')); console.log(`${fails.length} of ${n} failed`); process.exit(1); }
console.log(`rules ok: ${n} cases`);
process.exit(0);
