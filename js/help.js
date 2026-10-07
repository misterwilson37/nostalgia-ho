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
// 5.0.5 text): dos = the DOS 2.0 manual, 405 = the 4.0.5 Windows help,
// 301 = the Mac 3.0.1 program's own Quick Help (DITL 3010; it has no manual),
// 12 = the Mac 1.2F program's dialog boxes, translated from the French (it has
// no Quick Help and no manual).
root.HOHELP_RULES = root.HOHELP_RULES || { dos: {}, 405: {}, 301: {}, 12: {} };
root.HOHELP_RULES['301'] = root.HOHELP_RULES['301'] || {};
root.HOHELP_RULES['12'] = root.HOHELP_RULES['12'] || {};
// DOS 2.0 manual (assets/manuals/dos-2.0.pdf): no debt, no Radical tech,
// ships are queued and paid for out of each planet's shipbuilding money.
Object.assign(root.HOHELP_RULES.dos, {
  savings: ['Savings is money that will be saved until next turn. Money will be saved automatically if you don’t spend it, too. You get interest on your savings, just like at your local bank.', 'The Bar Charts'],
  income: ['The money you took in last turn. You get money every turn from profitable planets.', 'Glossary'],
  interest: ['You get interest on your savings, just like at your local bank. When you set spending above the bar for a planet, the extra money is automatically saved for next turn, with interest.', 'The Bar Charts, Common Problems'],
  metal: ['Metal represents things you find: metals, oil, uranium, that sort of thing. Anything you can run out of is Metal, and the only thing you use metal for is building ships. Towards the end of the game, Metal can get awfully scarce, and therefore extremely valuable.', 'The Economy'],
  budget: ['The Budget Information bar chart is what you use to divvy up your money between each of your colonies. You can also use some of it for technology research, and save some for later use. Clicking and dragging in the bar chart will lengthen or shorten the bar to where you clicked, adding or subtracting from other bars proportionally.', 'The Bar Charts'],
  tech: ['Researching new technologies is easy. You just spend money on Tech, and away you go. You can weight your research into certain areas by balancing your Technology budget in the Tech Spending Window.', 'Advancing Technology'],
  savingsBar: ['Savings is money that will be saved until next turn. In general, it’s not a bad idea to have money saved for a rainy day. You spend money that is saved simply by not saving it any more.', 'The Bar Charts'],
  colonyBar: ['If a planet needs money just to stay alive, you’ll see a black line in the bar. This line shows the minimum the planet needs. Only the amount over this line actually goes toward the planet’s development, so it’s a good idea to keep spending well over the minimum.', 'The Bar Charts'],
  range: ['Range is how far a fleet can move before refueling. If a ship has a range of 6, it can go 3 spaces and come back to refuel, or it can go 6 spaces and be stranded when it gets there (unless you own the star it’s going to). A fleet will automatically refuel any time it goes to a planet you own.', 'Range, Moving Ships'],
  speed: ['How fast a ship goes. A Speed 3 ship will take 2 turns to go to a star that is 5 units away. Perhaps most importantly, in battle, the ships with the highest speed shoot first.', 'Glossary, Speed'],
  weapons: ['Something a ship shoots. The amount of damage you do is based upon the difference between your Weapon Tech and the defender’s Shield Tech: a Weapon Tech 8 ship will rip apart Shield Tech 4 ships.', 'Glossary, Weapons and Shields'],
  shields: ['Something that protects a ship. A Shield Tech 8 ship will prove almost invincible to a Weapon Tech 4 ship. To fight an even battle against an enemy with high weapon and shield techs, you need twice as many ships for each level you are behind.', 'Glossary, Weapons and Shields'],
  mini: ['Mini (miniaturization) allows you to build ships for less metal but more money. Since metal can be a lot scarcer than money, building ships with high Mini Techs may be a good idea. Colonists can’t be miniaturized, so Mini has little effect on Colony Ships.', 'Mini'],
  gravity: ['Everything that can’t be changed about a star system. Any planet between 0.4 G and 2.5 G can be made profitable, if enough people are on it and it is fully terraformed. An ideal planet is 1.0 G.', 'Glossary'],
  temp: ['Everything that can be changed about a star system. The ideal temperature is 72°. When you spend money on Terraforming a new planet, its temperature will get closer to 72°.', 'Glossary, Exploring Planets'],
  planetMetal: ['Spending money on Mining will mine some of the planet’s metal resources, making the metal available for shipbuilding. When the planet runs out of metal, you won’t be able to spend any more money on mining it.', 'Planet Information'],
  population: ['For decades, you’ll be pumping money in, terraforming the planet and watching the population grow from the tiny handful you start with into a booming, profitable economy. The more money you spend on Terraforming a planet, the faster it will grow. Mining and shipbuilding don’t have any effect on how quickly the population grows.', 'How to Colonize Planets'],
  maxPop: ['Even when the temperature is a perfect 72°, you probably still won’t have enough people there to really support the whole planet. Be patient, the population will grow.', 'How to Colonize Planets'],
  planetIncome: ['How much extra money a planet puts into your total budget. If it’s a planet you’ve just colonized, this will be negative, meaning that you have to pump money into it just to keep it alive. A planet with potential won’t actually start making a profit until it has a large population.', 'Planet Information'],
  terraMine: ['How the money you spend on this planet is split up between mining, terraforming, and shipbuilding. Don’t get too concerned about exactly what percent you’re spending on each item; just try to get the proportions right. When you’ve finished terraforming or mining a planet, the appropriate bar will automatically go to zero.', 'Planet Information'],
  evacuate: ['To strip-mine a planet, spend no money on Terraforming and little or no money on Shipbuilding; spend it all on Mining. When you’ve taken as much metal as you want to from the planet, just stop spending money on it. Any Satellites you’ve built there will stay, but your colonists will be evacuated.', 'How to Strip-Mine a Planet'],
  build: ['Click on the type of ship you want to build and it’ll pop onto the list of queued ships; click a queued ship to remove it. Once you’ve queued ships at a planet, don’t forget to spend some of the planet’s money on shipbuilding. If you don’t, no ships will be built.', 'Building Ships'],
  route: ['If the fleet can’t reach the star you’ve dragged to, the path will be shown by a dotted gray line. If the fleet has enough fuel to go to the star you’ve selected and come back, the path will be a double-pointed arrow. A fleet will automatically refuel any time it goes to a planet you own.', 'Moving Ships'],
  endTurn: ['When you’ve read all the messages, an “End Turn” button will appear in the top left corner of the map.', 'Messages & The Report Window'],
});
// Spaceward Ho! 4.0.5 Windows help (assets/manuals/4.0.5/).
Object.assign(root.HOHELP_RULES['405'], {
  savings: ['Money you’ve accumulated to build ships with. You get interest on this money. If you’ve spent more than you’ve saved, you pay interest.', 'Glossary'],
  income: ['The money you took in last turn. You get money every turn from profitable planets.', 'Glossary'],
  interest: ['You get interest on your savings, just like at your local bank. You can borrow up to five times the total income from all your planets, but 15% of your debt will be automatically deducted from your income each turn. To pay off your debt, just put money into Ship Savings.', 'The Bar Charts, Debt'],
  metal: ['Metal represents things you find: metals, oil, uranium, that sort of thing. The only thing you use metal for is building ships. Near the end of the game, metal can get scarce, and therefore extremely valuable.', 'The Economy'],
  budget: ['The Budget bar chart is what you use to divvy up your money between each of your colonies. You also can use some of it for technology research, and save some for shipbuilding. Click and drag the mouse in the bar chart to lengthen or shorten the bar to where you clicked, adding to or subtracting from other bars proportionally.', 'The Bar Charts'],
  tech: ['Researching new technologies is easy. You just spend money on Tech, and away you go. You can weigh your research into certain areas by balancing your Technology budget in the Tech Spending Window.', 'Advancing Technology'],
  savingsBar: ['Savings is money that will be saved up for later use and shipbuilding. In general, it’s a good idea to have money saved for a rainy day. You get interest on your savings, just like at your local bank.', 'The Bar Charts'],
  colonyBar: ['In your Budget Window a new slot appears with the name of each new colony. This is where you allocate money to Terraforming and Mining for this planet. A planet you’ve just colonized needs money pumped into it just to keep it alive.', 'How to Colonize Planets, Planet Information'],
  range: ['Range is how far a fleet can move before refueling. If a ship has a range of 8, it can go 4 spaces and come back to refuel, or it can go 8 spaces and be stranded when it gets there. A fleet will automatically refuel any time it goes to a planet you or your allies own.', 'Range, Moving Ships'],
  speed: ['Speed is how fast a ship goes. If a ship has speed 1, it will take it five turns to move five spaces; at speed 3 it will make the same trip in only two turns. Perhaps most importantly, in battle, the ships with the highest speed shoot first.', 'Speed'],
  weapons: ['Something a ship shoots. The amount of damage you do is based upon the difference between your Weapon Tech and the defender’s Shield Tech: a Weapon Tech 8 ship will rip apart Shield Tech 4 ships.', 'Glossary, Weapons and Shields'],
  shields: ['Something that protects a ship. A Shield Tech 8 ship will prove almost invincible to a Weapon Tech 4 ship. To fight an even battle against an enemy with high weapon and shield techs, you need twice as many ships for each level you are behind.', 'Glossary, Weapons and Shields'],
  mini: ['Mini (miniaturization) allows you to build ships for less metal but more money. Since metal can be a lot scarcer than money, building ships with high Mini Techs may be a good idea. Colonists can’t be miniaturized, so Mini has little effect on Colony Ships.', 'Mini'],
  radical: ['When you put money into Radical Tech, every once in a while your scientists may make an amazing discovery: higher tech levels, biological weapons, weather control, or new mining techniques. You never know when the next Radical Tech leap will happen. The advantage is only temporary, so use it well.', 'Radical'],
  gravity: ['Everything that can’t be changed about a star system. Any planet between 0.4 G and 2.5 G can be made profitable, if enough people are on it and it is fully terraformed. An ideal planet is 1.0 G.', 'Glossary'],
  temp: ['Everything that can be changed about a star system. Your home planet is 72°. When you spend money on Terraforming a new planet, its temperature will get closer to 72°.', 'Glossary, Exploring Planets'],
  planetMetal: ['Spend money on mining to free the planet’s resources, making the metal available for shipbuilding. When the planet runs out of metal, you can’t spend any more money mining it.', 'Planet Information'],
  population: ['You’ll watch the population grow from a tiny handful into a booming, profitable economy. The more money you spend on Terraforming a planet, the faster it will grow. Mining and shipbuilding don’t have any effect on how quickly the population grows.', 'How to Colonize Planets'],
  maxPop: ['Even when the temperature is a perfect 72°, you probably still won’t have enough people there to support the whole planet. Be patient, the population will grow.', 'How to Colonize Planets'],
  planetIncome: ['How much extra money a planet puts into your total budget. If it’s a planet you’ve just colonized, this will be negative, meaning that you have to pump money into it just to keep it alive. The more a planet is like your home planet (72° and 1.00 G), the more money-making potential it has.', 'Planet Information'],
  terraMine: ['You set your mining/terraforming ratio with a slider bar. Terraforming modifies a planet’s temperature toward 72°; mining frees its resources for shipbuilding. Don’t get too concerned about exactly what percent you’re spending on each item; just try to get the proportions right.', 'Planet Information, Additions from 3.0 to 4.0'],
  evacuate: ['To strip-mine a planet, spend no money on Terraforming; spend it all on mining. When you’ve taken as much metal as you want to from the planet, “Abandon” it. Any Satellites you’ve built there will stay, but your colonists will be evacuated.', 'How to Strip-Mine a Planet'],
  build: ['You can build ships at any of your colonies: double-click on the planet. You can choose the quantity of ships before you choose the type, then adjust their Tech levels until their metal and money cost is where you’d like it to be.', 'Building Ships'],
  route: ['If the fleet can’t reach the star you’ve dragged to, the path will be shown by a dotted gray line. If the fleet has enough fuel to go to the star you’ve selected and come back, the path will be a double-pointed arrow. A fleet refuels at planets you or your allies own, or from a tanker.', 'Moving Ships'],
  endTurn: ['You click on the turn clock to end your turn. If you are playing with a time limit, the moving hand shows how much time you have left for this turn; when you are out of time you go into “Bonus Time”.', 'The Star Map'],
});
// Spaceward Ho! 3.0.1 (Mac): the Quick Help box, DITL 3010 in the program.
Object.assign(root.HOHELP_RULES['301'], {
  route: ['To move a fleet, first click on the fleet you want to move in the list on the left. Then click and drag on the map from the star the fleet is at to where you want it to go.', 'Quick Help For Spaceward Ho! 3.0'],
});
// Spaceward Ho! 1.2F (Mac, French): the few dialog boxes that explain
// something, in English (worded as DOS 2.0's boxes of the same number where
// the French says the same thing).
Object.assign(root.HOHELP_RULES['12'], {
  route: ['If a fleet doesn’t have enough fuel to reach the star you dragged to, there are no arrows on either end of the dragged line. A fleet in hyperspace can’t be contacted until it arrives at its destination.', 'the “Fleet Can’t Reach” and “Fleet in Hyperspace” boxes (DITL 3330, 3290)'],
  evacuate: ['A colony ship that has just landed its colonists has none aboard. If you send it off anyway, the colonists who landed are picked up and you abandon the planet. Or wait a turn and it will be refilled.', 'the “Colony Ship Warning” box (DITL 3300)'],
  colonyBar: ['When you aren’t spending enough on your colonies to support them, the game asks before the turn ends: “Warning! You are not spending enough money to support your colonies. Do you really want to abandon them?” (“Let them die!” or Cancel).', 'the “Spending Warnings” box (DITL 5060)'],
  build: ['Spaceward Ho! allows you only 20 ship types at one time. To create another, first scrap an old type by checking its “Scrap” box in the List Ship Types box. It is scrapped when the turn is updated, and you can create the new type next turn.', 'the “Too Many Ship Types” box (DITL 3280)'],
});
// each ruleset's own manual, opened from the Help menu
root.HOMANUALS = {
  original: ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual'],
  claude: ['assets/manuals/5.0.5/index.html', 'Spaceward Ho! 5 manual'],
  dos: ['assets/manuals/dos-2.0.pdf', 'Spaceward Ho! 2.0 manual (DOS)'],
  405: ['assets/manuals/4.0.5/index.html', 'Spaceward Ho! 4.0.5 help'],
  // 3.0.1 shipped without an online manual; the 4.0.5 help is the closest
  // (it has a page on what changed from 3.0 to 4.0)
  301: ['assets/manuals/4.0.5/index.html', 'Spaceward Ho! 4.0.5 help (closest to 3.0.1)'],
  // no 1.2F manual is in the archive; its rules are DOS 2.0's, so the DOS
  // 2.0 manual is the closest
  12: ['assets/manuals/dos-2.0.pdf', 'Spaceward Ho! 2.0 manual (DOS; closest to Mac 1.2)'],
  // the Mac editions (js/rules-mac20.js, js/rules-mac405.js): their manuals
  // aren't in the archive; the same version's other edition's is the closest
  mac20: ['assets/manuals/dos-2.0.pdf', 'Spaceward Ho! 2.0 manual (DOS; the same version as Mac 2.0.1)'],
  mac405: ['assets/manuals/4.0.5/index.html', 'Spaceward Ho! 4.0.5 help (Windows; the same version as Mac 4.0.5)'],
};
// the Mac editions' hover help: the same version's other edition's texts
root.HOHELP_RULES.mac20 = root.HOHELP_RULES.mac20 || root.HOHELP_RULES.dos;
root.HOHELP_RULES.mac405 = root.HOHELP_RULES.mac405 || root.HOHELP_RULES['405'];
})(this);
