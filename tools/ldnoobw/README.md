# LDNOOBW word lists (vendored)

These files are the language lists of the *List of Dirty, Naughty, Obscene, and
Otherwise Bad Words* by Shutterstock and its contributors,
<https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words>,
commit 5faf2ba42d7b1c0977169ec3611df25a3c08eb13 (13 July 2020), copied unchanged.
They are licensed under the Creative Commons Attribution 4.0 International
License (CC BY 4.0), in `LICENSE` here.

Every language file is taken: players type anything, in any language. The remake
uses them in `js/decency.js` (the names other players will see: the shared Hall
of Fame now, shared star and ship names later). `node tools/build-decency.js`
turns them into `js/decency-words.js`; the matching rules, and the entries left
out because they are ordinary words in another language, are in `js/decency.js`.

Warning: the files contain material that many will find offensive. That is
their purpose.
