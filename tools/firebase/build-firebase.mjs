// Builds js/vendor/firebase.js: the parts of the Firebase web SDK the remake
// uses, as one minified IIFE that sets window.HOFB. The site has no build
// step and loads nothing from a CDN (everything is hosted here, fonts
// included), so the SDK is vendored; js/cloud.js loads this file only when a
// player opens Account or signed in before, so a page that never goes online
// never downloads it.
//
// The version is pinned in package.json (exact, no ^). To update it:
//   cd tools/firebase && npm install firebase@<version> --save-exact && npm run build
// then test (docs/online.md, "Rebuilding the SDK") and commit both.
//
// Only what is named below goes in: esbuild drops the rest (Analytics is
// never imported; Jake wants none). Full Firestore, not Lite: online play
// will want realtime listeners later (onSnapshot is in for that).
import { build } from 'esbuild';
import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const out = path.join(root, 'js', 'vendor', 'firebase.js');
const version = JSON.parse(readFileSync(path.join(here, 'node_modules', 'firebase', 'package.json'), 'utf8')).version;

const APP = ['initializeApp'];
const AUTH = ['initializeAuth', 'indexedDBLocalPersistence', 'browserLocalPersistence', 'browserPopupRedirectResolver',
  'onAuthStateChanged', 'connectAuthEmulator', 'signOut', 'updateProfile',
  'GoogleAuthProvider', 'EmailAuthProvider', 'signInWithPopup', 'signInWithRedirect', 'getRedirectResult',
  'signInWithEmailAndPassword', 'createUserWithEmailAndPassword', 'sendPasswordResetEmail', 'signInAnonymously',
  'linkWithPopup', 'linkWithRedirect', 'linkWithCredential'];
const STORE = ['initializeFirestore', 'connectFirestoreEmulator', 'doc', 'collection', 'getDoc', 'getDocs', 'setDoc', 'addDoc',
  'deleteDoc', 'query', 'where', 'orderBy', 'limit', 'serverTimestamp', 'Bytes', 'onSnapshot'];

const entry = [
  `import { ${APP.join(', ')} } from 'firebase/app';`,
  `import { ${AUTH.join(', ')} } from 'firebase/auth';`,
  `import { ${STORE.join(', ')} } from 'firebase/firestore';`,
  `window.HOFB = { version: ${JSON.stringify(version)}, ${[...APP, ...AUTH, ...STORE].join(', ')} };`,
].join('\n');

const banner = `/*! Firebase JavaScript SDK ${version} (firebase/app, firebase/auth, firebase/firestore), bundled for Spaceward Ho! by tools/firebase/build-firebase.mjs.
 * Copyright Google LLC. Licensed under the Apache License, Version 2.0: js/vendor/firebase.LICENSE.txt, http://www.apache.org/licenses/LICENSE-2.0 */`;

// re2js (144 KiB minified, a third of the bundle) is a regular-expression
// engine Firestore uses only to evaluate the regex functions of its new
// pipeline queries on the client (regexContains, regexMatch). The remake
// never builds a pipeline, but esbuild can't prove that, so it is swapped for
// a stub that throws; Firestore catches that and reports the expression as an
// error, which is what it would be here anyway.
const stubRe2js = {
  name: 'stub-re2js',
  setup(b) {
    b.onResolve({ filter: /^re2js$/ }, () => ({ path: 're2js', namespace: 'stub' }));
    b.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents:
      'export const RE2JS = { compile() { throw new Error("re2js is left out of this build (tools/firebase/build-firebase.mjs)"); } };' }));
  },
};

await build({
  stdin: { contents: entry, resolveDir: here, sourcefile: 'hofb-entry.js' },
  bundle: true, minify: true, format: 'iife', target: ['es2020'], platform: 'browser',
  legalComments: 'none', plugins: [stubRe2js], banner: { js: banner }, outfile: out, logLevel: 'warning',
});
const bytes = statSync(out).size, gz = gzipSync(readFileSync(out)).length;
console.log(`js/vendor/firebase.js: Firebase ${version}, ${(bytes / 1024).toFixed(1)} KiB, ${(gz / 1024).toFixed(1)} KiB gzipped`);
