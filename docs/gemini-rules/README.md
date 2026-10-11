# Spaceward Ho! — Gemini 1.0 Gold Master

*An AI and ruleset for the Spaceward Ho! web remake, by Gemini.*

This package contains the fully realized "Gemini" ruleset and AI opponent, built to capture the ruthless, sprawling, and delightfully absurd spirit of the original Spaceward Ho! 5 manual. It is designed to scale gracefully from turn 1 border skirmishes to turn 400 galactic standoffs, ensuring the AI behaves like a genuine, hyper-aggressive superpower.

## The Design: How the Gemini AI Thinks

The Gemini AI isn't just a spreadsheet calculator; it understands galactic geopolitics and supply chains.

- **The Staging Leap-Frog:** Fighters don't just sit at home. When the front lines push out, the AI dynamically identifies the nearest enemy, finds a friendly colony on the border, and leap-frogs its armadas forward to stage for invasions.
- **Stranding Prevention & Medivacs:** Fleets actively calculate the fuel required for round-trips. If fighters conquer a dead rock, the AI aggressively shifts its economy to mass-produce Colony Ships to backfill the territory and get the fighters back online.
- **Economic Self-Preservation:** If the AI expands too fast and approaches its maximum debt limit, it will deliberately order the evacuation of its smallest, struggling frontier colony (under 20 pop) to shed upkeep costs and save the empire from bankruptcy.
- **The "Cold War" Space Race:** When a galaxy is reduced to two superpowers separated by a vast, uncrossable void, the AI detects the stalemate (triggered when 85% of its massive armada is sitting idle). It instantly pivots its economy, dumping 60% of its budget into Tech, with 70% of that research earmarked specifically for Range (plus 10% into Radical black-projects) to bridge the gap.

## The Rules: Hard Math and Harsh Realities

The `rules-gemini.js` file tightens the late-game math to ensure the economy hums and mistakes are punished.

- **The Repo Man:** The manual warns that "bad things happen" when you go bankrupt. If a player exceeds their borrow limit and defaults, the galactic bank steps in: 80% of stored metal is seized, 30% of the population riots, all current tech progress is wiped, and your debt is reset to 80% of your maximum borrow limit. Then 50% of the active military is unceremoniously repossessed and sold at half price, paying the debt down further.¹
- **Compounding Miniaturization:** To prevent late-game ships from costing absurd amounts of metal, Miniaturization applies a compounding 20% discount per tech level, keeping massive endgame armadas economically viable.
- **Heavy Gravity Realism:** A split-distribution curve for planet generation ensures a flat roll 30% of the time, guaranteeing that roughly one in eight planets will test the extreme outer limits of gravity (over 2.5 G), ensuring those truly miserable, inhospitable worlds exist to trap unwary colonizers.
- **Functional Defaults:** Human players start with Range 8 Scouts and Range 5 Colony Ships and Fighters, perfectly matching their starting Range tech of 5 so they can actually reach their neighbors on Turn 1.¹

## The Jokes: Flavor and Radical Science

It wouldn't be Spaceward Ho! without a little mad science and bureaucratic snark. The custom flavor text is woven directly into the engine's notifications and events.

- **Radical Tech Breakthroughs:** Pouring money into the Radical budget is a gamble. You might get a message that reads, "Breakthrough! Your scientists strapped a fusion reactor to a magnifying glass. Weapons Tech +2!" or "Eureka! By wrapping ships in polarized bubble wrap, Shield Tech jumped by 2!"
- **Radical Tech Duds:** Sometimes the money just vanishes: "Your scientists threw a massive party with the radical tech budget. No scientific discoveries, but the karaoke was legendary."
- **The Space Monster:** If the Radical tech rolls perfectly, you unlock the Biological ship design: "Your mad scientists bred a living Space Monster ship! It requires zero metal, but eats colonists for fuel." True to the code, this beast will devour 500,000 colonists, your own included, every time it tops off its hyperdrive; if that empties a planet, the planet is lost.¹
- **Evacuation Regrets:** Hitting the Evacuate button prompts the engine to ask, "Are you sure you want to abandon this rock? The colonists are finally getting used to the smell." Canceling it responds with: "Changed your mind? We'll unpack the bags."

¹ *Lightly corrected by the tester to match the final code. Gemini's wording said the debt stays pinned at 80% of the borrow limit (the final version also sells the repossessed ships toward the debt), that the Space Monster zeroes a planet "instantly" (it eats half a million colonists per refuel), and "starting Tech 5" (it's Range tech 5; the other techs start at 1).*

---

*The rest of this page is by Claude, who tested each round and packaged the result.*

## How it was made

Gemini couldn't run code. Each round, it sent files; Claude ran them through
a test kit and wrote up results only (what happened, measured causes, never
design advice); and Jake carried the results back. Some milestones:

| Round | State |
| --- | --- |
| Early | The rules file couldn't start a game; the AI was written for functions that don't exist. |
| A few rounds in | Games start, but nothing can move: the map was 800 × 600 units wide with ship range 4. |
| Mid | Scouts strand themselves after one hop; income is counted twice, so savings balloon. |
| Session 2 | The economy is fixed; the computers can't afford warships; then they can, and armies strand. |
| Late | Bankruptcy, cold-war detection, Biologicals; games end in real conquests. |
| Final | No broken numbers in 12 varied games; computers conquer galaxies on their own. |

Jake's prompts added two lines along the way that seemed to help: "Remember
the goal is not just to correct these individual problems, but to create a
real and enjoyable game," and "a playable game that is fun for the average
nerdy human."

## Testing

```
node tools/test.js gemini
node tools/human-play.js gemini
node docs/gemini-rules/tests/test-gemini.js [games] [turns]
```

The last one plays varied games (every size, shape, IQ and start, plus
30-year turns, hot seat and computer best buddies) and checks every turn for
broken numbers and stuck games.
