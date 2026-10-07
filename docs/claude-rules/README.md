# The Claude rules: Spaceward Ho! rebuilt from the manual

`js/rules-claude.js` and `js/ai-claude.js` are a playable Spaceward Ho! built
from the **Spaceward Ho! 5 manual alone** (`assets/manuals/5.0.5/`, also at
deltatao.com/ho/ho/). Nothing came from the original program, the other
rulesets or the `*-findings.md` docs. The earlier Claudling's version of
these two files was replaced, not extended.

Where the manual gives a number, it's used. Everything else is a guess tuned
by self-play. The jokes are written in the manual's voice; they are not the
originals' easter eggs, which nobody looked up. They're listed, with
spoilers, in `SPOILERS.md`.

## From the manual, by chapter

| Manual | In the rules |
| --- | --- |
| Economy | Money and Metal only. A colony costs $7,500 a turn; a full home makes $37,500, so about $30,000 net. Savings earn interest (2% a turn, on up to three turns of income). Debt costs 15% a turn, up to 5x income, and only shipbuilding can borrow. Money a planet can't use goes to savings. Research, terraforming and mining get less for each dollar the more you spend at once; shipbuilding doesn't. If income can't cover the interest, "bad things happen". |
| Exploring | Each player's home is 1.00 G and 72° to them. Gravity classes are good (0.5–2.0 G), semi-habitable (0.4–0.5, 2.0–2.5) and inhospitable (beyond); inhospitable never profits. Terraforming moves temperature toward 72°, and terraforming money speeds growth. Strip-mining and Evacuate work, and satellites stay behind when you evacuate. |
| Ships | All eight classes. Scouts: Range +3, Weapons and Shields −1. Dreadnoughts: 25x the toughness and shots. Satellites: Range 0, smaller, shoot twice. Biologicals: no metal, tech 2 behind, graze on starlight. Tankers refuel the owner's fleets over time. Decoys can't shoot or block a colony. A new type's prototype costs extra, more with high Mini. Mini trades metal for money (and barely affects Colony Ships). Scrapping returns 75% of the metal, or drops it on the planet if you don't own it. Scrapping happens at End Turn, and can be undone before then. |
| Technology | Range is fuel; Speed is distance per turn and who shoots first. Damage doubles per level of Weapons over Shields, so with the square law you need about 2x the ships per level behind. Radical gives about 20 outcomes, including temporary jumps that leave the baseline alone (the manual's 5→7 Shields example works as written), Biologicals, cloaking, mind control, weather control, mining, research, savings and borrowing, plus garbage. |
| Battles | Everyone at a star fights at once, allies don't shoot each other, and two of your allies may shoot each other. Colony Ships and Tankers get shot first. Offensive stance: Weapons +1, Shields −1; Defensive: the reverse. Arrive Late misses two rounds. The planet resists, enough to stop scouts but not an invasion. Optional battle luck. Wiped out in round one? Almost no report. |
| Alliances | Enemy, ally (no fighting, shared refueling) and best buddies (shared maps). Both sides must agree. You can't go from best buddies to enemies in one turn, and breaking an alliance earns a permanent grudge. Gifts and surrender work too. |
| Computer Players | Personalities, IQ, learning from losses, more tech when behind, tankers and Biologicals, several attacks at once, Mini when metal is short, chatty messages, and occasional surrender. See below. |
| Custom Galaxies | All seven home systems. Abundant gets a second home system and some ships. Computer IQ and home systems, shape, size and density. Years Per Turn and Computer Best Buddies work as soon as the New Game box offers them. |
| Options / Auto Play | On Auto Play the computer never touches your tech bars, leaves fleets with orders alone, never evacuates, and leaves alliances and chat to you. |

## The computer players

Each gets a style:

- **turtle:** stays home, builds Satellites, researches.
- **expander:** grabs land fast.
- **techie:** gets high Weapons and Shields, then comes out.
- **warmonger:** looks for a fight.
- **balanced:** a bit of everything.
- **prospector:** hunts metal.
- **gambler:** bets on Radical research.

Each also gets an IQ (dumb, average, smart, diabolical) that sets how much
they research, how fast they expand, how many attacks they run at once,
whether they learn and use tankers, and how big an edge they want before
attacking.

They know only what they've seen. They keep a war chest out of income and
gather fleets at a staging colony. They send a Colony Ship in late behind an
attack. They choose Mini by what metal is worth to them, and re-scout old
maps before sending settlers near enemies.

## Testing

```
node tools/test.js claude                 # three headless 400-turn games
node tools/human-play.js claude           # a human through the page (Playwright)
node docs/claude-rules/tests/features.js  # 40 checks, one or more per mechanic in the manual
node docs/claude-rules/tests/audit.js     # 24 varied games, checking for broken numbers every turn
```

**At handoff:**
- **Feature checks:** 40 of 40 pass.
- **`human-play.js`:** passes for every ruleset, and again with the proposed New Game box edits applied.
- **The audit:** 24 games covering every size, shape, IQ, start, 30-year turns, hot seat, computer best buddies and the easter-egg galaxy names. No broken numbers. 18 of the 24 ended within 500 turns, by conquest or the human's elimination. The ones still going were mostly Large and Humongous galaxies ("Games in humongous galaxies will take forever").
- **Auto Play:** the Auto Play side won some of those games and lost others.
- **In the page:** 160 turns of Auto Play in the classic skin, opening the Players, battle replay, Build Ships, Give and Send a Message windows, with no page errors.

## Recreating the build

1. Read the manual, every chapter, especially Economy, Ships, Exploring,
   Technology, Battles, Alliances, Custom Galaxies and Computer Players.
2. Read only the plumbing: `README.md`, `js/engine.js`, `js/skins.js`, and
   the parts of `js/skins/classic/ui.js` that read `HO.rules(G)` or
   `HO.feature()`, plus the battle replay's record format and the New Game
   window. Don't read the other rulesets.
3. Write `rules-claude.js` against the hooks `engine.js` calls. Every `rs.*`
   it uses is listed at the end of `FOR-THE-MAIN-CLAUDLING.md`.
4. Write `ai-claude.js` with `make`, `turn` and `noteBattle`.
5. Run `tools/test.js claude` until games end, and `human-play.js` until the
   skin agrees with the rules.
