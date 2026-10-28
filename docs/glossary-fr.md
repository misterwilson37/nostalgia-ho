# The French glossary: each game thing's official name, by source and version

The working list for option C in French (`docs/proofread-2026-10.md`, "Option C, French")
and for the patch's corrections of the official French (chunk 4). The Turkish one,
`docs/glossary-tr.md`, explains the policy. French differs in one way: there are three official
French translations, so **which official word a version uses is rule 4's**:

| Version | Its French, first to last |
|---|---|
| 1.2 | 1.2F |
| 2.0 (DOS, Mac 2.0.1) | 1.2F for what 1.2 had; 3.0.1F for what is new in 2.0 and in 3.0.1 |
| 3.0.1 | 3.0.1F |
| 4.0.5 (Windows, Mac) | 3.0.1F for what it shares with 3.0.1; iOS for what is new |
| 5.0.5, the Palm | iOS (iOS is 5.0.5's game ported: Jake, October 2026), 3.0.1F as backup |
| iOS, Android | iOS |

The interface is one table for every version, so a version's own words reach it in two ways:
whole labels, by 3.0.1F's window words laid over the rows in a 3.0.1 or 4.0.5 game, and on the title screen
of a 3.0.1 or 4.0.5 skin (`rs.lang.fr.officialWindows`, `HO.windowWords`; the skin chosen at
startup decides the title screen's words: Jake); and words inside the remake's sentences, by the
row's default (the word most of the row's versions have) or, for the version and patch notes,
each note's own version. iOS's skin has its own rows for its labels.

Sources: 1.2F `HOLANG.mac12Fr` (STR#), 3.0.1F `HOLANG.mac301Fr` (STR#, MENU, DITL), iOS
`HOLANG.ios.fr` (MS Misc Strings, SCN Ship Class Names, H Help Messages, R Report Window Templates).

## Ship classes

| English | 1.2F | 3.0.1F | iOS | Notes |
|---|---|---|---|---|
| Scout | Eclaireur | Eclaireur (1006, MENU 6015) | Eclaireur(s) | |
| Fighter | Croiseur | Croiseur | Croiseur, plural "Chasseurs" (SCN 9); hints "vaisseaux de combat" (H 30) | |
| Colony Ship | Transport | Transport | Transport, plural "Vaisseaux de Colonisation"; hints "Transports" (H 14) | |
| Satellite | Satellite | Satellite | Satellite(s) | |
| Dreadnought | – | – | Epouvante (SCN 1) | new in 4.0.5: iOS's, as iOS writes it (no accent) |
| Tanker | – | – | Tanker; sentences "vaisseaux-citernes" (A 36, R 152) | |
| Biological | – | – | Biologique(s) | |
| Decoy | – | – | Leurre (MS 1); "vaisseau leurre" (R 111) | |

## Technologies and money

| English | 1.2F | 3.0.1F | iOS | Notes |
|---|---|---|---|---|
| Range, Speed, Weapons, Shields, Mini | Distance, Vitesse, Armes, Boucliers, Mini | the same | the same | |
| Radical | – | Radicaux (1001); researchers "Découvreurs Radicaux" | Radicaux; "Recherche Radicale" | |
| Savings (the bar) | Epargne (1005) | Epargne (1005) | Epargne; "Économies:" (MS 24) | |
| Ship Savings, Ship Money | – | Placements (1005, 1011) | its hints call savings "Placements" (H 27, 28) | the remake says "Placements" in sentences |
| Tech Spending | Technologie | Technologie; "Fenêtre Technologie" | | |

## Menus, windows and features

| English | 1.2F | 3.0.1F | iOS |
|---|---|---|---|
| New Game | – | Nouveau… (MENU 129) | Nouveau Jeu (MS 70) |
| End Turn | Fin Tour | Fin du tour (MENU 129) | Fin Tour |
| Force End Turn | – | Forcer la fin du tour… | – |
| Auto Play | – | Jeu automatique… (MENU 131) | Auto Play (left in English) |
| Organize Ships / Fleets | Répartir vaisseaux… (1010) | Répartir <type>… (MENU 132), Répartir vaisseaux… | Organiser Flottes |
| List All Fleets | – | Statut des flottes… | Lister toutes les flottes |
| Scrap Current Fleet | Recycler flotte sélectionnée | Recycler flotte courante (menu), …actuelle (button) | Recycler la flotte actuelle |
| Review Battle | Revoir bataille à %s… | Revoir bataille à %s… | Revoir batailles |
| Fix Spending | – | Corriger dépenses | – |
| Dip Into Savings | – | Puiser dans épargne… | Puiser dans l'épargne |
| Abandon Planet / Evacuate | – | Abandonner planète | Évacuer la planète |
| Hall of Fame / Shame | – | Les meilleurs scores / Les pires scores (windows); "Pour les meilleurs…" / "Et pour les pires…" (menu) | – (Game Center) |
| Compare Players | – | Comparer joueurs… | – |
| Explored Stars | – | Planètes explorées… | – |
| Send Message | – | Envoyer message… | – |
| Auto Play styles: Friendly, Aggressive, Dig In, No Defense | – | Amical, Agressif, Plutôt fortifié, Plutôt sans défense | Amical, Agressif, Puiser (a slip: "dig into"), Sans Défenses |
| Master Points | – | – | Master Points (left in English) |

## The remake's own words, where no official one applies

- The remake's online Hall of Fame (accounts, the shared list) is the remake's feature: "Panthéon",
  "Mur de la honte". 3.0.1F's own Hall of Fame windows and their notes say "Les meilleurs scores",
  "Les pires scores".
- New Game: iOS's "Nouveau Jeu" by default (the rows), 3.0.1F's "Nouveau" over it in a 3.0.1
  or 4.0.5 game or skin; the patch says "Nouvelle partie" (Jake: the skin chosen at startup decides).

## The patch's words (chunk 5)

The patch is the best French it can be (Jake, October 2026), so it takes one good word for each
thing, where the default keeps each version's official one. `js/engine.js` `frPatchText` puts them
in every French line the patch shows, and in the interface.

| English | Default (official) | Patch | Why |
|---|---|---|---|
| Fighter | Croiseur; iOS plural "Chasseurs" | Chasseur | a croiseur is a cruiser, a middle-sized warship; the fighter is a chasseur |
| Dreadnought | Epouvante (iOS) | Cuirassé | the French for a dreadnought-class battleship, the biggest warship |
| Tanker | Tanker (iOS, left in English); "vaisseaux-citernes" in sentences | Ravitailleur | a refuelling ship |
| Colony Ship | Transport; iOS plural "Vaisseaux de Colonisation" | Transport | one word, singular and plural |
| Auto Play | Auto Play (iOS), Jeu automatique (3.0.1F) | Jeu automatique | 3.0.1F's |
| Evacuate | abandonner (iOS's reports), évacuer (its windows) | évacuer | the command's word |
| profitable (a colony) | profitable | rentable | the economic word |
| meteor shower | pluie de météores, averse de météorites, pluie d'étoiles filantes | pluie de météores | |
| wormhole | trou noir (black hole) | trou de ver | |
| Male, Female (3.0.1F) | Mâle, Femelle (animals) | Homme, Femme | |
| Savings (hints) | Placements (investments) | Épargne | the bar's word |
| capitals | Eclaireur, Epargne, Etes-vous, A cause | Éclaireur, Épargne, Êtes-vous, À cause | modern French accents capitals |

Kept from the official texts: Éclaireur, Transport, Satellite, Leurre, Biologique; Distance, Vitesse,
Armes, Boucliers, Mini(aturisation), Radicaux; Organiser Flottes (iOS), Répartir (3.0.1F's menu); "Master
Points" (iOS's name for them); "les belles petites planètes" (iOS's idiom).

## For the patch (chunk 4, now decided: above)

Candidates the patch will weigh, not yet decided: iOS's "Puiser" for Dig In, "Chasseurs" as
Fighter's plural, "Auto Play" and "Master Points" left in English, 3.0.1F's slips in its lines
("Tous le monde", "découvrir une découverte", "Armaggeddon"), and whether capitals take their
accents (the official texts write "Eclaireur", "Epargne", "Epouvante").
