// Spaceward Ho! web remake — hover help.
//
// Each entry is text from the Spaceward Ho! 5 help book (the HTML manual
// inside the Mac application, "Spaceward Ho Help Book"), trimmed and lightly
// adapted to fit a tooltip and this remake's panels, with the page it comes
// from. Skins show these when the pointer
// rests on something (or on a long press); the game itself doesn't use them.
// The numbers in them are the 5.0.5 rules'; other rulesets differ a little.
(function (root) {
'use strict';
root.HOHELP = {
  savings: ['Money you’ve accumulated. You get interest on this money. If you’ve spent more than you’ve saved, you pay interest.', 'Glossary'],
  income: ['The money you took in last turn. You get money every turn from profitable planets.', 'Glossary'],
  interest: ['You get interest on your savings, just like at your local bank. If you go into debt, 15% of your debt is deducted from your income each turn. To pay off your debt, just put money into Savings.', 'The Economy'],
  metal: ['The sum of all nonrenewable resources: metals, oil, uranium, that sort of thing. The only thing you use metal for is building ships. Near the end of the game, Metal can get scarce, and therefore extremely valuable.', 'The Economy'],
  budget: ['The Budget bar chart is what you use to divvy up your money between each of your colonies. You also can use some of it for technology research, and save some for savings and shipbuilding. Drag a bar to lengthen or shorten it; the others change to make room.', 'Starting a New Game'],
  tech: ['Researching new technologies is easy: you just spend money on Tech, and away you go. The bars under Technology weight your research toward certain areas.', 'Technology'],
  savingsBar: ['Savings is money that will be saved up for later use and shipbuilding. In general, it’s a good idea to have money saved for a rainy day. You get interest on your savings.', 'Starting a New Game'],
  colonyBar: ['This is where you allocate money to Terraforming and Mining for this planet. A new colony needs money pumped in just to keep it alive.', 'Exploring'],
  range: ['How far a ship can reach without refueling. A Range 8 ship can go out 4 and back 4, or can go out 5 and be stuck. Fleets refuel at your own (and your allies’) colonies.', 'Glossary'],
  speed: ['How fast a ship goes. A Speed 3 ship will take 2 turns to go to a star that is 5 units away. Speed also determines who shoots first in a battle.', 'Glossary'],
  weapons: ['Something a ship shoots. The damage you do depends on your Weapon Tech against the defender’s Shield Tech: a Weapon Tech 8 ship will rip apart Shield Tech 4 ships.', 'Glossary, Technology'],
  shields: ['Something that protects a ship. A Shield Tech 8 ship will prove almost invincible to a Weapon Tech 4 ship. To fight an even battle against a better-equipped enemy you need about twice as many ships for each level you are behind.', 'Glossary, Technology'],
  mini: ['Miniaturization lets you build ships for less metal but more money. Since metal can be a lot scarcer than money, high Mini may be a good idea, especially late in the game. Colonists can’t be miniaturized.', 'Technology'],
  radical: ['High-risk, high-gain research. Every once in a while your scientists may make an amazing discovery; sometimes you get something really great, sometimes you get garbage, and sometimes nothing for eons.', 'Glossary, Technology'],
  gravity: ['Everything that can’t be changed about a star system. An ideal planet is 1.0 G (your home’s). Any planet between 0.4 G and 2.5 G can be made profitable, if enough people are on it and it is fully terraformed.', 'Glossary'],
  temp: ['Everything that can be changed about a star system. The ideal temperature is 72°, your home’s. Terraforming moves a planet’s temperature toward 72°.', 'Glossary'],
  planetMetal: ['The metal still on this planet. Mining it puts it into your reserve, for building ships. When a planet runs out of metal, you can’t spend any more money mining it.', 'Starting a New Game'],
  population: ['It takes a while for a planet to become profitable, even a great one. You’ll watch the population grow from a tiny handful into a booming, profitable economy. The more money you spend on Terraforming, the faster it will grow; mining and shipbuilding don’t help it grow.', 'Exploring'],
  maxPop: ['Even when the temperature is a perfect 72°, you probably still won’t have enough people there to support the whole planet. Be patient, the population will grow.', 'Exploring'],
  planetIncome: ['How much extra money this planet puts into your total budget. A planet you’ve just colonized is negative: you have to pump money into it just to keep it alive. The more a planet is like your home, the more money it can make.', 'Starting a New Game'],
  terraMine: ['How the money you spend on this planet is divided between terraforming and mining. Terraforming moves its temperature toward 72°, which helps its people grow and pay; mining frees its metal for shipbuilding. Don’t get too concerned about exact percentages; just try to get the proportions right.', 'Starting a New Game'],
  evacuate: ['How to strip-mine a planet: colonize a planet that won’t ever make a profit, spend all its money on Mining, and when you’ve taken as much metal as you want, Evacuate it. Satellites you’ve built there will stay, but your colonists will leave.', 'Exploring'],
  build: ['Build ships here. Ships cost money and metal; the more advanced ships take more of both. You can build ships at any of your colonies: money and metal show up wherever you need them.', 'The Economy'],
  route: ['Specify your fleet’s path more exactly, star by star. Remember Range: how far a ship can reach without refueling, and fleets refuel at your own (and your allies’) colonies.', 'Hints, Glossary'],
  endTurn: ['When you’ve read all the messages, the End Turn clock appears. Click it when you’re done giving orders for this turn.', 'Starting a New Game'],
};
// The same tips in the words of other versions' manuals, for games played
// with those rules (keys as above; anything missing falls back to the
// 5.0.5 text): dos = the DOS 2.0 manual, 405 = the 4.0.5 Windows help.
root.HOHELP_RULES = root.HOHELP_RULES || { dos: {}, 405: {} };
// each ruleset's own manual, opened from the Help menu
root.HOMANUALS = {
  original: ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual'],
  claude: ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual'],
  dos: ['assets/manuals/dos-2.0.pdf', 'Spaceward Ho! 2.0 manual (DOS)'],
  405: ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual (the 4.0.5 help is not converted yet)'],
};
})(this);
