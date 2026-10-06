// Spaceward Ho! web remake — notes on each version, for players.
//
// The Ho menu's "About this version" window shows these for the rules being
// played, keyed by ruleset id (the version's label, number, platform and year
// come from the ruleset itself). Each version plays as it was released, bugs
// and quirks included; these lists say what that means.
//
// - intro: a sentence or two on what the version is;
// - quirks: its known bugs and quirks, which the remake plays as released
//   (docs/open-questions.md, "Settled, worth confirming");
// - differs: where the remake differs from it (docs/open-questions.md,
//   "Remake's choices");
// - missing: its windows and commands the remake hasn't got yet
//   (docs/open-questions.md, "Interface not done");
// - previous / changes: what changed from the version before it
//   (docs/evolution.md);
// - checking: the lists still being checked (the version's sections in the
//   docs aren't written yet), e.g. { quirks: true, changes: true }.
//
// A line may be { text, show: (rs) => bool } to show only while a ruleset
// flag says it applies (rs is the ruleset, HO.rules(G)).
// A quirk may be { text, fix: id }: the version's unofficial patch fixes it
// (rs.fixes, docs/fixes.md), and the window says so beside it.
(function (root) {
'use strict';
const RANDOM = 'The random numbers are the remake’s own, so a game can’t be replayed move for move.';
const HOTSEAT = 'Several people play on one computer and take turns. The original let each player join a shared game file, with a password.';
root.HOVERSIONS = {
  '12': {
    intro: 'The French edition of the Mac game, a cut-down pre-release of 2.0. Every routine of its program has been read, and every rule comes from its own code.',
    quirks: [
      { text: 'A colony wiped out by a meteor shower gets a blank report.', fix: 'meteorReport' },
      'Organize Fleets refuels and reloads: rearranging one design’s ships at a star gives every fleet of that design there the best fuel among them, and each new Colony Ship fleet it makes comes loaded with colonists.',
      'The game has the text for messages between players, but no way to send one.',
      'There is no command to give up a colony, so there is no Evacuate button: a colony goes only when it is left unfunded until its people are gone.',
      'The power of the ships and planet at every star is worked out each turn and never used.',
      'Players who are out still play their turn: their money still earns interest and their research goes on.',
      { text: 'The computer’s colony bars go wrong when it gives a colony more than $2,147,483 for one part (the sum overflows). It takes a very rich computer to see it.', fix: 'colonyBars32' },
    ],
    differs: [
      RANDOM,
      'If every player is out at once, the game ends with no winner. 1.2 just went on with no one able to win.',
      HOTSEAT + ' (1.2 allowed up to 19 humans.)',
      'Dragging a budget bar works out the others once, from where the drag began; 1.2 did it at every step of the drag, so a long drag can end slightly differently.',
      'Battle replays are kept for the last 60 battles; 1.2 kept them for 500 years.',
    ],
    missing: [
      'Fix Spending, which raises each colony that can’t pay its loss to its least share.',
      'Naming a star after a win (1.2 kept the winners’ star names for later galaxies).',
      'The preferences for battle speed, showing messages and watching battles, and the Explored Planets window.',
    ],
    previous: null,
    changes: [],
  },
  dos: {
    intro: 'The game 1.2 was a pre-release of: the Windows 3.1 edition came first, and the DOS edition is a port of it with the same art, sounds and rules. Every routine of the Windows program has been read.',
    previous: '1.2',
    quirks: [
      { text: 'Organize Ships gives every fleet of the design at the star the average fuel used, but counts at most 11 fleets, so with 12 or more fleets the average comes out too high.', fix: 'orgFuelCount' },
      'Organize Ships clears the orders of every fleet of that design at the star, even one you left alone.',
      'A new fleet made in Organize Ships is loaded with colonists, so splitting an empty colony fleet away from your colonies refills part of it.',
      'Players who are out still play their turn: their money still earns interest and their research goes on.',
      { text: 'A slip in how the computers scrap old fighters has no effect on play.', fix: 'scrapRange' },
      { text: 'A colony wiped out by a meteor shower is reported as “… destroyed your colony”, naming whoever a report ten messages earlier happened to leave behind: often you or another player, sometimes no one. (Where 2.0 would have read past its own data and crashed, the remake names no one.)', fix: 'meteorReport' },
      { text: 'The computers work out their designs’ attack rating in 16 bits, so from about Weapons 4 it wraps round and they misjudge their warships.', fix: 'attack16' },
      { text: 'The computers’ colony bars go wrong when one gives a colony more than $2,147,483 for one part (the sum overflows).', fix: 'colonyBars32' },
      'There is no command to give up a colony, so there is no Evacuate button: a colony goes only when it is left unfunded until its people are gone (the “Let ’em die” warning).',
    ],
    differs: [
      RANDOM,
      'When every human is out, the game ends (with no winner if nobody is left). 2.0 went on as long as the computers played.',
      HOTSEAT + ' (2.0 could also play across machines.)',
      'Dragging a budget bar works out the others once, from where the drag began; 2.0 did it at every step of the drag, so a long drag can end slightly differently.',
      'Battle replays are kept for the last 60 battles; 2.0 kept them for 500 years.',
    ],
    missing: [
      'Send Message: 2.0’s messages are made of “I like”, “I don’t like” or “I own” and a planet or a player, and a true “I own” marks the star on the other player’s map. The remake’s messages are free text with no effect.',
      'Fix Spending, in the budget window.',
      'Naming a star after a win, and the names file kept for later galaxies.',
      'The Explored Planets list and the poll and battle speed settings.',
    ],
    changes: [
      'A Create Galaxy window: five sizes, five shapes, Dense or Sparse, 0 to 19 computers and their IQ (Dumb, Average or Smart). Each human picks a skill, Novice to Expert. (1.2 made every galaxy a small dense circle with one average computer.)',
      'Women: women’s faces and names, and each computer is a woman half the time.',
      'No novas (1.2 had the code, never switched on).',
      'The Send Message window: ten messages a turn.',
      'Organize Fleets gives the fleets the average fuel used instead of the least, and clears their orders.',
      'The computers’ attack rating wraps around from about Weapons 4 (a 16-bit sum).',
      'A colony wiped out by meteors gets a report naming a stray player (1.2’s was blank).',
      'Temperatures in °F instead of °C, and English names; 190 star names.',
      'Auto Play, Compare Players (rankings from 2010) and Name a Star for the winner.',
      'The turn itself is 1.2’s, routine by routine.',
    ],
  },
  '301': {
    intro: 'The first colour Mac version: 2.0’s game with the money model, alliances, Radical tech and novas of the later versions. Every routine of its program has been read, and every rule comes from its own code.',
    previous: '2.0',
    quirks: [
      { text: 'In 2010, on Spiral and Cluster maps, the computers skip their first turn.', fix: 'skip2010' },
      { text: 'A slip in how the computers scrap old ships has no effect on play.', fix: 'scrapRange' },
      { text: 'Stranded fighter fleets always ask for a colony, even with one in reach.', fix: 'refuelCheck' },
      'Turning Abandon off doesn’t give the colony its share back.',
      'An abandoned colony with a colony ship there is colonized again in the same turn.',
      'Organize Ships gives every fleet of the design at the star the most fuel used among them.',
      { text: 'The computer’s colony bars go wrong when it gives a colony more than $2,147,483 for one part.', fix: 'colonyBars32' },
      'The power of the ships at every star is worked out each turn and never used.',
    ],
    differs: [
      RANDOM,
      'When every human is out, the game ends. 3.0.1 went on as long as the computers played.',
      HOTSEAT + ' (3.0.1 could also play across a network.)',
      'The computers all plan before anyone’s money is worked out; 3.0.1 planned for each in its own turn. It comes out the same but for rare cases.',
      'Scrapping marks a fleet or a ship type, and it is scrapped at End Turn, as in 3.0.1. The fleet’s row has the Scrap Current Fleet button as well as the Ships menu, and a marked type’s row is dimmed (3.0.1 changed only its button’s title).',
      'Dragging a budget bar works out the others once, from where the drag began; 3.0.1 did it at every step of the drag.',
      'Spiral and Cluster maps are laid out at the start; 3.0.1 laid them out in 2010.',
      'Dip Into Savings takes a percentage of the most you may dip; 3.0.1 took an amount.',
      'Evacuate is 3.0.1’s Abandon: the colony is given up at End Turn, and pressing it again takes it back. The planet doesn’t show it as marked.',
    ],
    missing: [
      'Fix Spending.',
      'The Hall of Fame and Hall of Shame (the difficulty rating is worked out).',
      'Naming a star after a win.',
      'The auto play settings window.',
      'The canned-message window: the remake’s messages are free text, and the computers read “I like …” in them.',
      'The preference to scrap old designs automatically past 15.',
      'The colour-monitor joke.',
    ],
    changes: [
      'In colour.',
      'Ship Savings: a share of each turn’s money is saved, earns interest, buys ships at once (no queues) and can go into debt down to a borrowing limit. (2.0 had one pool and no borrowing.)',
      'Two bars a colony, Terraform and Mine; a colony with both done gives its share to the others.',
      'Research is steady (× 8/10) instead of a random 60–140 %, with a head start into each level, and Radical tech with six outcomes.',
      'Battles have luck, always on, and the planet fights with its owner’s Shields.',
      'Novas and Armageddon.',
      'Alliances, gifts, surrender and canned messages; an alliance wins if it holds for a turn.',
      'Abandon a colony, and Dip Into Savings.',
      'A player with no colonies and no colony ships is out at once, and its fleets are scrapped.',
      'The galaxy generator of the later versions: six styles, with Cluster new.',
      'A fourth computer level, Diabolical; computers with feelings, alliances and designs that come and go.',
    ],
  },
  '405': {
    intro: 'The Windows 95 edition, which plays across platforms with the Mac 4.0.5: 3.0.1’s game with Dreadnoughts, Tankers, Biologicals and decoys, Radical tech as a hand of cards, and best buddies. Every routine of its program has been read, and every rule comes from its own code.',
    previous: '3.0.1',
    quirks: [
      'Whether stars ever turn red depends on a setting the New Game code never sets; the remake lets them.',
      'A colony can build no more ships a turn than it has people (in thousands).',
      'A Radical discovery before the first hand is dealt (2010), or with an empty hand, may go wrong in the original; the remake makes it from a random card or loses it.',
      'A computer looking for the poorest player counts players who are out.',
      'With 30 designs, a computer goes on building last turn’s designs for the classes it hadn’t reached.',
      'Computers never keep Tankers: they scrap them at home and send them home from elsewhere.',
      'A colony at the first star of the list can always have its budget bar dragged, and is left out of the population milestones.',
      'Best buddies share what they explored this year, but never their battle news.',
      'After an Armageddon device fizzles, everyone hears each device was turned off, and next turn on again.',
      'The Valdez leak threatens a lawsuit, but nothing is taken.',
      'The power of the ships at every star is worked out each turn and never used.',
      'Marking a ship type for scrapping in the build window gives back only one of the ships of it you ordered there; the rest are built, then scrapped with the type.',
      'Past 1,000,000 master points the Master Point List shows “%s: %s” as your rank.',
      'The Hall of Fame writes the year as the years since 1900: 1996 is 96, 2026 is 126. The Hall of Shame’s summary calls you “Loser”, without a colon.',
      'From 50,000 to 499,999 master points the Master Point List has no picture: the game hasn’t got it.',
    ],
    differs: [
      RANDOM,
      HOTSEAT + ' (4.0.5 could also play across a network.)',
      'The computers all plan, and every fleet moves, for all players at once; 4.0.5 did both in each player’s own turn. It comes out the same but for rare cases.',
      'The Hall of Fame, Hall of Shame and Master Point List are kept in this browser, and their menu items are in the Game menu (4.0.5: Options).',
      'Dragging a budget bar works out the others once, from where the drag began; 4.0.5 did it at every step of the drag.',
      'Dip Into Savings takes a percentage of the most you may dip; 4.0.5 took an amount.',
      'Evacuate is 4.0.5’s Abandon: the colony is given up at End Turn, and pressing it again takes it back.',
    ],
    missing: [
      'The radical projects window, where you could throw out one of your four projects.',
      'Naming a star after a win, and the “You have conquered the galaxy!” window.',
      'The canned-message window (“Look at …” and “I own …” also marked the map); the computers read “I like …” in free text.',
      'The auto play settings, the turn time limit and network play.',
    ],
    changes: [
      'Dreadnoughts (25 shots a round) and Tankers (refuel every fleet at their star); 30 designs instead of 20.',
      'Radical tech is a hand of four out of 17 discoveries, dealt from 2010: bonuses, decoys, Biologicals that eat people to refuel, stolen tech, free designs.',
      'Best buddies: allies who route through each other’s colonies and share their maps.',
      'A colony builds no more ships a turn than it has people.',
      'Ship Savings to start with, by skill.',
      'Satellites fire twice, the planet once per 200,000 people, and luck is an option.',
      'Terraforming, mining and income as the later versions; ranks and master points for a win.',
    ],
  },
  original: {
    intro: 'The last Mac version, for Mac OS 9 and X. Every routine of its program has been read, and every rule comes from its own code.',
    previous: '4.0.5',
    quirks: [
      'Interest you can’t pay comes out of Ship Savings, however deep in debt: the global warming the game has a message for never happens.',
      'Budget bars are used as they stand, even when they add up to more than 100% (bars that can’t move keep their shares when you drag another), so more than your money can be spent.',
      'Dipping into savings counts as income, so it raises how far you may borrow.',
      'A ship you order but can’t pay for still uses up one of the colony’s building places for the turn.',
      'After an Armageddon device fizzles, the devices stay on and it tries again, and fizzles again, every turn.',
      'You hear of only one population milestone of each kind a turn; a jump past two reports the second later.',
      'On a Spiral map the computers know where every home is before 2100.',
      'The “never profitable” and “not spending on research” warnings, and the red-star warning, come every turn.',
      'A computer evacuating a colony doesn’t ask, and its budget doesn’t change until the turn is worked out.',
      'A tanker’s route goes only through stars recorded this year.',
      'With an Abundant start your second colony comes before your home in the budget list.',
    ],
    differs: [
      RANDOM,
      HOTSEAT,
      'The computers all plan, and every fleet moves, for all players at once; 5.0.5 did both in each player’s own turn. It comes out the same but for rare cases.',
      'Dragging a budget bar works out the others once, from where the drag began; 5.0.5 did it at every step of the drag.',
      'An order for ships stops at the first one you can’t pay for, so the ones after it don’t use up building places.',
      'When you give a gift, you are told at once; 5.0.5 told you at the end of the turn.',
      'Every game starts from the default budget and research shares (research 18% each and Radical 10%); 5.0.5 started a new game with your first turn’s shares from the last one.',
    ],
    missing: [
      'The Radical Research window, where a full hand of radical programs lets you cancel one.',
      'The auto play settings (how aggressive the computer is and how many colonies it defends when it plays for you).',
      'The canned-message window (“Look at …” and “I own …” also marked the map); the computers read “I like …” in free text.',
      'Options locked by rank (“Need more MPs”): every option is open.',
      'The questions before buying more than 9 Scouts or Tankers.',
      'The turn time limit and network play.',
    ],
    changes: [
      'You pick a home system instead of a skill level, the computers’ IQ is a number from 50 to 200, and there are Hex galaxies.',
      'Ships cost less at high tech (4.0.5’s cost is a product of all four stats); at most 24 designs.',
      'Everyone at a star fights at once instead of in duels, with stances and “arrive late” (a second battle).',
      'The research facility, the prime rate and cheaper credit.',
      'Novas give more warning, with a miracle rescue, and Armageddon shrinks distances.',
      'Dip Into Savings takes up to 30% of your savings every turn until you stop it.',
      'Colonies are listed by income, and the poorest are paid first.',
      'Master points and 25 ranks, with a limit on how far one win takes you.',
    ],
  },
  palm: {
    intro: 'A port of the Mac 5.0 to Palm handhelds: the 5.0 game recompiled, the same rules with the same quirks. Every routine of its program has been read, and every rule comes from its own code.',
    previous: '5.0.5 (Mac)',
    quirks: [
      'Interest you can’t pay comes out of Ship Savings, however deep in debt: the global warming the game has a message for never happens.',
      'Budget bars are used as they stand, even when they add up to more than 100% (bars that can’t move keep their shares when you drag another), so more than your money can be spent.',
      'Dipping into savings counts as income, so it raises how far you may borrow.',
      'A ship you order but can’t pay for still uses up one of the colony’s building places for the turn.',
      'After an Armageddon device fizzles, the devices stay on and it tries again, and fizzles again, every turn.',
      'You hear of only one population milestone of each kind a turn; a jump past two reports the second later.',
      'On a Spiral map the computers know where every home is before 2100.',
      'The “never profitable” and “not spending on research” warnings, and the red-star warning, come every turn.',
      'When every side in a battle is beaten, its debris is lost.',
      'Evacuating a star called Kansas always gets the Dorothy line, Hope always asks, and a star called Ship asks you to abandon ship. (From the message list the old one-in-three jokes apply.)',
      'With an Abundant start your second colony comes before your home in the budget list.',
    ],
    differs: [
      RANDOM.replace('own', 'own (the Palm game reads a fixed table of 5,000 numbers)'),
      HOTSEAT.replace('The original let each player join a shared game file, with a password.', 'The Palm game passed the handheld round the same way, with its own Players window.'),
      'The computers all plan, and every fleet moves, for all players at once; the Palm game did both in each player’s own turn. It comes out the same but for rare cases.',
      'Dragging a budget bar works out the others once, from where the drag began.',
      'An order for ships stops at the first one you can’t pay for, so the ones after it don’t use up building places.',
      'When you give a gift, you are told at once; the Palm game told you at the end of the turn.',
      'Every game starts from the default budget and research shares; the Palm game started a new game with your first turn’s shares from the last one.',
      'Sounds are the skin’s, not the handheld’s few beeps.',
    ],
    missing: [
      'The Radical Research window, where a full hand of radical programs lets you cancel one.',
      'The auto play settings (Friendly and Dig In sliders; only end my turns; stop when something interesting happens).',
      'Build Ships’ Allow Debt box, and the questions before building more than 9 Scouts or Tankers.',
      'Dragging the research bars the way the budget bars are dragged.',
      'Naming a star when you reach a new rank, for later games.',
      'The canned-message window, the Evacuate button in the message list, and options locked by rank.',
      'A few reports reworded in the Palm version (the decoy ship, the miracle).',
    ],
    changes: [
      'At most 90 stars (5.0.5: 220), so big galaxies come out smaller.',
      'No Alliances or Luck in Battles check boxes: both are always on, and so are novas.',
      'No “Any (1-8)” choice for the number of computers.',
      'New Evacuate jokes: Kansas and Hope every time, and a star called Ship.',
      'Courasant replaces Antares among the star names.',
      'Its own hints, one every turn.',
      'Palm windows and a demo version.',
    ],
  },
  claude: {
    intro: 'The remake’s own rules, rebuilt from the 5.0.5 manual before the original program was read. Not an original version: its numbers are not the original formulas.',
    previous: null,
    quirks: [], differs: [], missing: [], changes: [],
  },
};
})(this);
