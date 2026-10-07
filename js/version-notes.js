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
//   docs aren't written yet), e.g. { quirks: true, changes: true };
// - deltaTao: what Delta Tao themselves said changed in this version, quoted
//   word for word from the Spaceward Ho! 5 manual's "Changes From Previous
//   Versions" ({ from, source, url, text: [paragraphs] }; a short line in
//   text is one of the manual's headings). Checked claim by claim against the
//   code in docs/evolution.md, "What Delta Tao said vs what the code shows";
// - requirements: what Delta Tao gave as the version's system requirements
//   (5.0 only), for the OS-look list.
//
// A line may be { text, show: (rs) => bool } to show only while a ruleset
// flag says it applies (rs is the ruleset, HO.rules(G)).
// A quirk may be { text, fix: id }: the version's unofficial patch fixes it
// (rs.fixes, docs/fixes.md), and the window says so beside it.
(function (root) {
'use strict';
const RANDOM = 'The random numbers are the remake’s own, so a game can’t be replayed move for move.';
// Delta Tao's own account of each version's changes, from the Spaceward Ho!
// 5 manual (quoted verbatim; their spelling and punctuation are kept).
const DT_SOURCE = "From Delta Tao's Spaceward Ho! 5 manual, 'Changes From Previous Versions'";
const DT_URL = 'https://www.deltatao.com/ho/ho/changes.html';
const DT = (from, text) => ({ from, source: DT_SOURCE, url: DT_URL, text });
const DT_2 = DT('Version 1 to 2', [
  'We incorporated the planet, budget, and fleet windows into the map window and moved them to the left to save screen space. We added message passing and communication. We went to full color for the ships and planets. The computer strategies were rewritten from the ground up. The "slow game" option was removed; games are now between the old slow and fast speeds. We went to a log scale spending window to allow for better resolution at the lower spending levels.',
  'We made the computer players name their ships and fleets (and themselves) the same way people do. We added a "master player" (Game Administrator) who can force an update to the next turn in a multi-player game. We got rid of the timed turn features, since we couldn\'t adjust for people with different clock settings. We changed the cost of the Technologies to balance out the game, and we made Speed affect combat. We made printing work.',
]);
const DT_3 = DT('Version 2 to 3', [
  'We made spending based on income, rather than total money supply. We made ships get built the turn you ask for them, instead of the old shipbuilding queue. We allocate money to your planets automatically, so you can\'t accidentally underspend on them. We added the Graph History chart, so you can see your long-term trends. We added several gratuitous graphics and sounds. We added some new galaxy types.',
  'We also added a bunch of new messages, made the computer players deal with friends and enemies, and made the computers send semi-intelligent messages to everyone. You can now give money and metal to your friends (or enemies), or surrender to them.',
]);
const DT_4 = DT('Version 3 to 4', [
  'We added many new ship types, including Tankers, Dreadnoughts, Biologicals, and Decoys. We made Satellites twice as strong (and expensive).',
  'We made the game PowerPC native, and added speed improving features such as "only show important messages" and automatic spending fixing.',
  'We made the multi-player game much better. The turn clock made games progress at the right rate, Best-buddies alliances were added, battle luck was made optional, we added a Chat Window and Text Messages. Turns are updated locally now, instead of on the master machine, so network updates are much faster. We allowed players to join games after they\'ve begun.',
  'We improved usability: Several dialogs (especially Build ships) were fixed, help messages were added, and we made the terraforming a slider instead of the old pie chart. And, of course, the graphics and sounds were greatly improved.',
  'We changed the difficulty ratings, and added Master Points and many more statistics.',
]);
const DT_5 = DT('Version 4 to 5', [
  'Seven years is a long time to go between revisions, so you might say that under the hood, Spaceward Ho! was getting a bit long in the tooth. Not for general use, as you can still play version 1.0 in the latest version of MacOS X (what other apps can do that?), but when we decided we wanted to add a bunch more features, it, well, needed a rewrite.',
  'So for those of you who like acronym-compliant applications, version 5.0 is now PowerPC, Carbon, multi-threaded, TCP/IP, and OS X-friendly.',
  'Feature-wise (on top of the hood), there\'s an awful lot of new stuff in version 5.0 of the Ho! Even so, if you\'re familiar with 4.0, you\'ll be able to play with the new one and figure everything out. However, we\'re providing this handy list of new features so you\'ll know what you\'re getting.',
  'Requirements',
  'Spaceward Ho! 5.0 is bigger than ever, and requires some 20 megabytes of hard disk space, 10 megabytes of RAM, and OS 8.6 or later.',
  'Internet Play',
  'Join spacewardho.net to play games with people from around the world.',
  'Smarter Computers',
  'The computers can now use biological and tanker ships, can make multi-planet attacks, and are better at preserving their metal in the endgame.',
  'Multiway Battles',
  'If several players arrive at a star at the same time, there\'s now a single large battle, with allies joining each other in combat. (Sometimes two people allied with you will shoot at each other, too.)',
  'Grouped Fleets',
  'You can group several ship types into a single fleet, for ease of movement and so that fleets of different speeds will stay together.',
  'Battle Options',
  'You can give different battle options to each ship type in a fleet, so that some go all-out offensive (giving a weapons bonus and shields penalty) or defensive. And you can have some ships - usually your colony ship - follow behind the main fleet, not coming in until the main battle is over.',
  'Fleet Paths',
  'You can now option-click a long route for a fleet, so it will visit a sequence of stars as fuel allows.',
  'New Radical Techs',
  'These include improving research, improving savings interest, decreasing the borrowing interest, and lots more.',
  'Faster and Easier',
  'We\'re proud that, contrary to the universal tendency for software to bloat, Spaceward Ho! has gotten easier to play and faster with each version. Version 5 is the fastest yet.',
  'New User Interface',
  'Each fleet has its own dot on the star map, and you can just drag a fleet to its destination to move it. Contextual menus are also available.',
  'OS X Native',
  'Spaceward Ho! 5 is Carbonized for optimal use on OS X or OS 8 or 9.',
  'Cooperative Play',
  'Multiplayer games can automatically pit all humans against the computers, for fun and friendly games.',
  'New Easter Eggs',
  'But we can\'t tell you about them here. You\'ll find them, or hear about them on the net.',
  'Updates',
  'You\'ll be able to find software updates to Spaceward Ho! (as we release them) at our web site at http://www.deltatao.com',
  'Thanks to everyone who sent in suggestions, whether in person, on their warranty registration, on comp.sys.mac.games, or on the phone. We considered everything everyone suggested, and, although we couldn\'t incorporate every new idea, we think you\'ll find a lot we did.',
]);
// 5.0's stated requirements (the Requirements paragraph of DT_5), for the
// OS-look list
const REQ_5 = {
  os: 'OS 8.6 or later', disk: '20 MB', ram: '10 MB',
  quote: 'Spaceward Ho! 5.0 is bigger than ever, and requires some 20 megabytes of hard disk space, 10 megabytes of RAM, and OS 8.6 or later.',
  source: DT_SOURCE, url: DT_URL,
};
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
    deltaTao: DT_2,
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
    intro: 'A colour and black-and-white Mac version (colour came with 2.0): 2.0’s game with the money model, alliances, Radical tech and novas of the later versions. Every routine of its program has been read, and every rule comes from its own code.',
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
    deltaTao: DT_3,
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
      { text: 'A computer looking for the poorest player counts players who are out.', fix: 'poorestOut' },
      { text: 'With 30 designs, a computer goes on building last turn’s designs for the classes it hadn’t reached, kept by their places in its list, which may since have moved.', fix: 'designs30' },
      { text: 'Stranded fighter and Dreadnought fleets always ask for a colony, even with one in reach.', fix: 'refuelCheck' },
      { text: 'A slip in how the computers send old ships home to be scrapped (a list place passed as the Range).', fix: 'scrapRange' },
      'Computers never keep Tankers: they scrap them at home and send them home from elsewhere.',
      { text: 'A colony at the first star of the list can always have its budget bar dragged, and is left out of the population milestones.', fix: 'star0' },
      'Best buddies share battle news by handing over their whole record of the star; the one who didn’t fight can’t review the battle (on Windows, the buddy’s own record says so too until the game is saved).',
      'After an Armageddon device fizzles, everyone hears each device was turned off, and next turn on again.',
      'The Valdez leak threatens a lawsuit, but nothing is taken.',
      'The power of the ships at every star is worked out each turn and never used.',
      { text: 'Marking a ship type for scrapping in the build window gives back only one of the ships of it you ordered there; the rest are built, then scrapped with the type.', fix: 'scrapTypeRefund' },
      { text: 'Past 1,000,000 master points the Master Point List shows “%s: %s” as your rank.', fix: 'rankName' },
      { text: 'The Hall of Fame writes the year as the years since 1900: 1996 is 96, 2026 is 126.', fix: 'hallYear' },
      { text: 'The Hall of Shame’s summary calls you “Loser”, without a colon.', fix: 'loserColon' },
      'From 50,000 to 499,999 master points the Master Point List has no picture: the game hasn’t got it.',
      { text: 'A new technology level is reported by the next level’s name: Range 7 is “Fusion Pile” instead of “Topping off the Tanks”, and Miniaturization 20 is the program’s credits line.', fix: 'techNames' },
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
    deltaTao: DT_4,
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
  mac20: {
    intro: 'Delta Tao’s own Mac build of 2.0.1, the version the DOS and Windows 3.1 edition ports: the same rules, routine for routine, with a few differences in its code. Every rule routine of the Mac program has been read with its own names.',
    previous: '1.2',
    quirks: [
      'Organize Ships gives every fleet of the design at the star the least fuel used among them, and leaves their orders alone (as 1.2).',
      'A new fleet made in Organize Ships is loaded with colonists, so splitting an empty colony fleet away from your colonies refills part of it.',
      'Players who are out still play their turn: their money still earns interest and their research goes on.',
      { text: 'A slip in how the computers scrap old fighters has no effect on play.', fix: 'scrapRange' },
      { text: 'A colony wiped out by a meteor shower is reported as “… destroyed your colony”, naming whoever a report ten messages earlier happened to leave behind: often you or another player. Where that report left something other than a player’s number, the Mac printed whatever bytes lay past the game’s own data; the remake names no one.', fix: 'meteorReport' },
      { text: 'The computers’ colony bars go wrong when one gives a colony more than $2,147,483 for one part (the sum overflows).', fix: 'colonyBars32' },
      'There is no command to give up a colony, so there is no Evacuate button: a colony goes only when it is left unfunded until its people are gone (the “Let ’em die” warning).',
    ],
    differs: [
      RANDOM,
      'When every human is out, the game ends (with no winner if nobody is left). 2.0.1 went on as long as the computers played.',
      HOTSEAT + ' (2.0.1 could also play across a network.)',
      'Dragging a budget bar works out the others once, from where the drag began; 2.0.1 did it at every step of the drag, so a long drag can end slightly differently.',
      'Battle replays are kept for the last 60 battles; 2.0.1 kept them for 500 years.',
      'An event with no sound of its own plays the skin’s; the Mac beeped (the system beep).',
    ],
    missing: [
      'Send Message: 2.0.1’s messages are made of “I like”, “I don’t like” or “I own” and a planet or a player, and a true “I own” marks the star on the other player’s map. The remake’s messages are free text with no effect.',
      'Fix Spending, in the budget window.',
      'Force End Turn, which marks every player done.',
      'Naming a star after a win, and the names file kept for later galaxies.',
    ],
    deltaTao: DT_2,
    changes: [
      'The same game as the DOS and Windows 3.1 edition, except: Organize Fleets keeps 1.2’s least fuel used and leaves the orders alone (Windows: the average, and the orders cleared), and the computers’ attack rating is worked out in 32 bits, as 1.2’s, so it never wraps round (Windows: 16 bits).',
      'A Create Galaxy window: five sizes, five shapes, Dense or Sparse, 0 to 19 computers and their IQ (Dumb, Average or Smart). Each human picks a skill, Novice to Expert. (1.2 made every galaxy a small dense circle with one average computer.)',
      'Women: women’s faces and names, and each computer is a woman half the time.',
      'The Send Message window: ten messages a turn.',
      'A colony wiped out by meteors gets a report naming a stray player (1.2’s was blank).',
      'Temperatures in °F instead of °C, and English names; 190 star names.',
      'Auto Play, Compare Players (rankings from 2010), Force End Turn and Name a Star for the winner.',
      'The turn itself is 1.2’s, routine by routine.',
    ],
  },
  mac405: {
    intro: 'The Mac edition of 4.0.5, a fat application for 68k and PowerPC Macs, which plays across platforms with the Windows 95 edition: the same program compiled for the Mac, routine for routine, with a few differences in its code. Every rule routine has been read with its own names.',
    previous: '3.0.1',
    quirks: [
      'Whether stars ever turn red depends on a setting the New Game code never sets; the remake lets them.',
      'A colony can build no more ships a turn than it has people (in thousands).',
      'A Radical discovery before the first hand is dealt (2010), or with an empty hand, may go wrong in the original; the remake makes it from a random card or loses it.',
      { text: 'A computer looking for the poorest player counts players who are out.', fix: 'poorestOut' },
      { text: 'With 30 designs, a computer goes on building last turn’s designs for the classes it hadn’t reached, kept by their places in its list, which may since have moved.', fix: 'designs30' },
      { text: 'Stranded fighter and Dreadnought fleets always ask for a colony, even with one in reach.', fix: 'refuelCheck' },
      { text: 'A slip in how the computers send old ships home to be scrapped (a list place passed as the Range).', fix: 'scrapRange' },
      'Computers never keep Tankers: they scrap them at home and send them home from elsewhere.',
      { text: 'A colony at the first star of the list can always have its budget bar dragged, and is left out of the population milestones.', fix: 'star0' },
      'Best buddies share battle news by handing over a copy of their record of the star; the one who didn’t fight can’t review the battle.',
      'After an Armageddon device fizzles, everyone hears each device was turned off, and next turn on again.',
      'The Valdez leak threatens a lawsuit, but nothing is taken.',
      'The power of the ships at every star is worked out each turn and never used.',
      { text: 'The first message still says “Version 4.0.3”.', fix: 'welcomeVersion' },
    ],
    differs: [
      RANDOM,
      HOTSEAT + ' (4.0.5 could also play across a network.)',
      'The computers all plan, and every fleet moves, for all players at once; 4.0.5 did both in each player’s own turn. It comes out the same but for rare cases.',
      'The Hall of Fame, Hall of Shame and Master Point List are kept in this browser, and their menu items are in the Game menu (4.0.5: Options).',
      'The computers’ names come from the game’s 20 names a sex; the Mac also added the name of every human who had played on that Mac.',
      'Ship design names come from the game’s 15 a class; the Mac also added the names you typed into the design window.',
      'Dragging a budget bar works out the others once, from where the drag began; 4.0.5 did it at every step of the drag.',
      'Dip Into Savings takes a percentage of the most you may dip; 4.0.5 took an amount.',
      'Evacuate is 4.0.5’s Abandon: the colony is given up at End Turn, and pressing it again takes it back.',
    ],
    missing: [
      'The radical projects window, where you could throw out one of your four projects.',
      'Naming a star after a win, and the “You have conquered the galaxy!” window.',
      'The canned-message window (“Look at …” and “I own …” also marked the map); the computers read “I like …” in free text.',
      'The auto play settings, the turn time limit, “Automatically end turn for unconnected players” and network play.',
      'The colour-monitor joke.',
    ],
    deltaTao: DT_4,
    changes: [
      'The same game as the Windows 95 edition, except: a Tanker is shot at after Colony Ships and before Satellites; a new technology level is reported by its own name; 15 ship names a class, more than Windows has for most; the computers’ sexes and names don’t use the game’s random numbers; the auto play settings put the new “colonies defended” into metal for defence; marking a ship type in the build window gives back every ship of it ordered there; eleven ranks, with Ho! Champion from 1,000,000 master points; whole years in the Hall of Fame.',
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
      { text: 'Interest you can’t pay comes out of Ship Savings, however deep in debt: the global warming the game has a message for never happens.', fix: 'globalWarming' },
      { text: 'A slip in how the computers send obsolete ships and Tankers home to be scrapped (a list place passed as the Range).', fix: 'scrapRange' },
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
    deltaTao: DT_5,
    requirements: REQ_5,
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
      { text: 'Interest you can’t pay comes out of Ship Savings, however deep in debt: the global warming the game has a message for never happens.', fix: 'globalWarming' },
      { text: 'A slip in how the computers send obsolete ships and Tankers home to be scrapped (a list place passed as the Range).', fix: 'scrapRange' },
      'Budget bars are used as they stand, even when they add up to more than 100% (bars that can’t move keep their shares when you drag another), so more than your money can be spent.',
      'Dipping into savings counts as income, so it raises how far you may borrow.',
      'A ship you order but can’t pay for still uses up one of the colony’s building places for the turn.',
      'After an Armageddon device fizzles, the devices stay on and it tries again, and fizzles again, every turn.',
      'You hear of only one population milestone of each kind a turn; a jump past two reports the second later.',
      'On a Spiral map the computers know where every home is before 2100.',
      'The “never profitable” and “not spending on research” warnings, and the red-star warning, come every turn.',
      'When every side in a battle is beaten, its debris is lost.',
      { text: 'The fastest engines and strongest noses have no picture, so those ships are drawn with a part missing.', fix: 'palmPictures' },
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
    deltaTao: DT_5, // the Palm game is a port of 5.0: Delta Tao's 4-to-5 list
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
};
})(this);
