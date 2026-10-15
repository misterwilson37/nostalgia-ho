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
import { initializeFirestore, connectFirestoreEmulator, doc, collection, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, serverTimestamp, Bytes, query, orderBy, limit, setLogLevel } from 'firebase/firestore';
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

// ---------- everything else ----------
await deny('a document anywhere else', setDoc(doc(A.db, 'misc', 'x'), { a: 1 }));
await deny('reading anywhere else', getDoc(doc(N.db, 'users', a.uid)));
await deny('a player document above the saves', setDoc(doc(A.db, 'users', a.uid), { a: 1 }));

await signOut(A.auth); await signOut(B.auth);
for (const c of [A, B, N]) await deleteApp(c.app);
if (fails.length) { console.log(fails.join('\n')); console.log(`${fails.length} of ${n} failed`); process.exit(1); }
console.log(`rules ok: ${n} cases`);
process.exit(0);
