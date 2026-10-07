# For the main Claudling: integrating the Claude rules rebuild

Jake asked a separate Claude ("Marshal Mesquite") to rebuild the **Claude**
ruleset from the 5.0.5 manual alone. It touched no shared files. This page
lists everything that needs a shared-file edit, so you can do the GitHub work
in one pass. Start with Step 1; the rest is optional.

## Step 1: drop in the files (required)

The zip mirrors the repo. Replace or add:

| File | What |
| --- | --- |
| `js/rules-claude.js` | **Replace.** The rebuilt ruleset (same id `claude`, same hooks). |
| `js/ai-claude.js` | **Replace.** The rebuilt computer players (same id `claude`). |
| `docs/claude-rules/*.md` | **Add.** README, HANDOFF, SPOILERS and this page. |
| `docs/claude-rules/tests/*.js` | **Add.** `features.js` and `audit.js`, standalone; they change no other test. |

No other file needs to change for the rules to work. `index.html`,
`engine.js`, `help.js` and the test lists already load the `claude` ruleset by
that id. Check with:

```
node tools/test.js claude
node tools/human-play.js claude
```

At handoff both passed, and the test for every other ruleset still ran clean.

**The `claude` ruleset is the engine's fallback.** `rules()` falls back to
`RULESETS.claude`, `aiOf()` to `AIS.claude`, and `load()` gives a save with no
`rules` field the `claude` rules. A syntax error in these two files would
break every ruleset, so syntax-check before you push.

**Old Claude saves still load, but play by the new rules.** A computer's old
`p.ai` object is filled in with the new fields on its first turn.

## Step 2: the New Game window (recommended)

Each ruleset has its own New Game box in `js/skins/classic/ui.js`. The Claude
box lacks three things the manual's "Custom Galaxies" chapter describes. The
rules already read all of them from `opts`, so only the skin needs to change.
Three search/replace edits, all in `newGameDialog()`:

**2a. Add Years Per Turn and Computer Best Buddies to `claudeBox`.**

Find:
```js
    sel('density', 'Galaxy density', [['dense', 'Dense'], ['normal', 'Normal'], ['sparse', 'Sparse']], 'normal'));
```
Replace with:
```js
    sel('density', 'Galaxy density', [['dense', 'Dense'], ['normal', 'Normal'], ['sparse', 'Sparse']], 'normal'),
    sel('c_years', 'Years per turn', [['10', '10'], ['20', '20'], ['30', '30'], ['50', '50']], '10'),
    el('label', { class: 'chk' }, el('input', { type: 'checkbox', name: 'c_buddies' }), el('span', null, 'Computers are best buddies')));
```

**2b. Show the Options box (Alliances, Luck in battles, Novas) for the Claude rules.**

Find:
```js
    f.querySelector('fieldset.opts').hidden = (!orig && !w95 && !mac3) || palm;
```
Replace with:
```js
    const claudeR = d.rules === 'claude';
    f.querySelector('fieldset.opts').hidden = (!orig && !w95 && !mac3 && !claudeR) || palm;
```

**2c. Pass the two new choices on.**

Find:
```js
    } else G = HO.newGame(Object.assign(common, { iq: d.iq, cstart: d.cstart, shape: d.shape, size: d.size, density: d.density }));
```
Replace with:
```js
    } else G = HO.newGame(Object.assign(common, { iq: d.iq, cstart: d.cstart, shape: d.shape, size: d.size, density: d.density,
      ...(d.rules === 'claude' ? { yearsPerTurn: +d.c_years || 10, buddies: !!d.c_buddies } : {}) }));
```

Until this is done, Claude games always play with alliances on, battle luck
off (the hidden checkbox is unchecked), novas on, 10 years a turn, and no
computer best-buddy pact. Nothing breaks.

These were checked headless with `yearsPerTurn: 30, buddies: true, luck:
true`: one End Turn runs three 10-year steps, and the computers stay best
buddies and never ally with a human.

## Step 3: the "About this version" notes (recommended)

In `js/version-notes.js`, replace the whole `claude: { ... },` entry with:

```js
  claude: {
    intro: 'Not an original version: the remake’s own Spaceward Ho!, rebuilt from the Spaceward Ho! 5 manual alone, without reading the original program or the other rulesets. Where the manual gives a number it is used; everything else (and the computer players, and the jokes) is a guess, tuned by self-play.',
    previous: null,
    quirks: [],
    differs: [
      'Every number the manual doesn’t give is invented: growth, research costs, ship prices, battle damage, Radical odds.',
      'Biologicals graze on starlight anywhere (a third of their range a turn) instead of refueling at colonies.',
      'Battle stances apply to a whole fleet, not to each ship type in it.',
      'Computer players only know what they’ve seen: planets as they were when last visited, enemy tech from ships they’ve fought.',
      RANDOM, HOTSEAT,
    ],
    missing: [
      'Master points and skill levels (the ranks profile is shared with the Original rules, so the Claude rules leave it alone).',
      'The Graph History’s ten items (the skin’s history graph shows population, income and tech).',
      'The Auto Play attack and defend sliders.',
    ],
    changes: [],
  },
```

(`RANDOM` and `HOTSEAT` are the constants at the top of `version-notes.js`.)
If you do Step 2, nothing else changes here. If you don't, add this to
`missing`: `'The New Game window’s Years Per Turn, Computer Best Buddies and Options choices (the rules support them; the window doesn’t show them).'`

## Step 4: optional, only if Jake wants them

- **Difficulty rating.** The New Game window prints "Not rated with Claude
  rules". The rules have no `difficulty()`, so leave it.
- **Master points.** Turning these on means adding `rs.masterPoints` and
  `rs.difficulty`. That would write Claude wins into the shared `ho5.profile`
  alongside the Original rules', so it's a decision for Jake, not a fix.
- **README.md.** In the Layout list, the line for `js/rules-claude.js` /
  `js/ai-claude.js` could read: "the 'Claude' rules and computer players
  (rebuilt from the 5.0.5 manual alone; see `docs/claude-rules/`)".

## What the rules use from the shared code (so you know what not to break)

- **Engine hooks:** `processSurrenders` also enforces the pact rules and
  scraps marked fleets, so the `surrender` feature must stay on.
  `afterMovement` delivers gifts before the engine's `deliverGifts`, which
  then finds none. The rules also use `processHandovers`, `pactNews`,
  `shareMaps`, `checkElimination`, `battleText`, `observe`, `shipsAdded`,
  `organized`, `canColonize`, `scrapInSpace` and `flagScrap` /
  `flagScrapDesign` / `scrapWords`.
- **`rs.welcome` is a getter.** It returns the welcome messages plus the
  easter-egg lines of the game `afterSetup` just made. `newGame` reads it
  right after `afterSetup`. If that order ever changes, the egg messages
  vanish, but nothing breaks.
- **Feature flags:** `alliances, gifts, surrender, chat, stances,
  lateArrival, waypoints, luck, supernova, yearsPerTurn` are on.
  `armageddon` is off, and `dip` is not set: neither is in the 5 manual.
- **Skin art:** message icons `m9000`–`m9051`, `p3000`/`p3030`/`p3040`,
  `hot`, `icecap` and `decoy` as the message `icon`. The nova look comes from
  the skin's `novaLook` (`s.nova` 10–209 reddening, then the year it blew).
- **Classic sounds:** 2000, 2001, 3000–3003, 5001, 5003, 7003, 7004, 7007,
  7013, 7019, 7020, 7021, 7027, 8000 and 11111.
