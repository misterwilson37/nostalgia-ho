// Spaceward Ho! web remake — the remake's own translations.
//
// Where a version had no official translation, the remake makes its own
// (js/languages.js, docs/translations.md): official text wherever an official
// translation says the same English, and these lines for the rest, each in
// the voice of the nearest official translation (iOS's French and Turkish,
// the German DOS 2.0's German): its words for the game's things, its forms of
// address, its jokes. They are only words: no line here changes play.
//
// By language:
//   own:  the version's English -> the remake's translation, for a line no
//         official translation has (any version's English; js/languages.js
//         looks it up with quotes, spaces, "$" and the last stop set aside)
//   over: the same, for a line an official translation has but got wrong (a
//         filling lost, a word left in English, another report's text): the
//         remake's line is used instead in the remake's languages (the
//         official one stays as it is in the version that shipped it)
//   patch: an official line's (or the remake's line that keeps its wording) slips put
//         right, English -> the corrected translation: shown when the game has the
//         unofficial patch on (js/languages.js, the fix 'translations'; engine.js
//         inLanguage), never by default. patchWords: the same for a whole filling.
//   adapted: the version's English -> [the translation, the official line's
//         English]: an official line's translation for a slightly different
//         English, edited as little as the difference needs
//   words: whole fillings (a tech's name ...), as say.words
//   techs: (German, Spanish) the tech names, as the reports fill them in
//   classes, fill, win: (Spanish) the ship classes, the other fillings and
//         the windows' words, which the official languages take from their
//         own text
// Each English line is a template: %s and %d are filled in order, %2$s by place.
(function (root) {
'use strict';
const HOLANG_REMAKE = {
// =====================================================================
// French: from iOS's French (fr.lproj), itself 1.2F's for the old lines
// =====================================================================
fr: {
  // the patch's corrections (G.opts.patch): an official line's slips, kept in the default as
  // the official translation has them (Jake's rule: accuracy first), put right here.
  // English -> the corrected translation (docs/proofread-2026-10.md, "The patch table").
  // Read by js/languages.js (the fix 'translations': engine.js inLanguage, rs.lang[code].fix, as
  // iOS's trLostWord is), wherever the version shows the line.
  over: {},
  patch: {
    // (chunk 5, Guillemet: the official French's slips, iOS's, 1.2F's and 3.0.1F's; every
    // line the patch shows also gets frPatchText's typography and words, js/engine.js)
    // iOS R 2: "and" left in English
    "Artwork by Howard Vives and Bob Van de walle.": "Graphismes de Howard Vives et Bob Van de walle.",
    // iOS R 9: evacuated, not abandoned (the command is Évacuer)
    "You have evacuated %s.": "Vous avez évacué %s.",
    // iOS R 29: the same
    "%s has run out of metal. You should probably evacuate it.": "%s a épuisé son métal. Vous devriez sans doute l'évacuer.",
    // iOS R 11: "vous a vaincu" (beat you) for a colony destroyed
    "%s destroyed your colony at %s. You %slost %d of your ships. %s lost %d. You lost %s people.": "%s a détruit votre colonie à %s. Vous%s avez perdu %d de vos vaisseaux. %s en a perdu %d. Vous avez perdu %s habitants.",
    // 3.0.1F 1000.10: the same
    "%s destroyed your colony at %s. You lost %d of your ships. %s lost %d. You lost %s people.": "%s a détruit votre colonie à %s. Vous avez perdu %d de vos vaisseaux. %s en a perdu %d. Vous avez perdu %s habitants.",
    // iOS R 20: "flotte de Type" for a ship type, the metal lost
    "Your \"%s\" ship type has been dismantled. %d of this type scrapped for %s metal.": "Votre type de vaisseau « %s » a été recyclé. %d vaisseaux de ce type ont été mis à la ferraille pour %s unités de métal.",
    // 1.2F 1000.16: the metal left out (iOS R 18's wording)
    "Your fleet of %s at %s has been dismantled for %s metal.": "Votre flotte de %s à %s a été recyclée pour %s unités de métal.",
    // iOS R 22: "est en attente pour"
    "Your %s is waiting to refuel before it can continue on to %s.": "Votre %s attend de faire le plein avant de pouvoir continuer vers %s.",
    // the remake's 2.0 line in iOS R 22's words
    "Your fleet of %s is waiting to refuel before it can continue on to %s.": "Votre flotte de %s attend de faire le plein avant de pouvoir continuer vers %s.",
    // iOS R 26: "a mangé les gens %s"
    "Your fleet of %s has eaten %s people while refueling at %s.": "Votre flotte de %s a mangé %s habitants pendant son ravitaillement à %s.",
    // iOS R 27: "%s de la flotte biologique" (the owner as a number)
    "%s's fleet of biologicals has eaten %s people while refueling at %s.": "La flotte biologique de %s a mangé %s habitants pendant son ravitaillement à %s.",
    // 1.2F 1000.28, 3.0.1F 1000.26, iOS R 30: "devenir profitable", the colony left out
    "%s has just become a profitable colony.": "%s vient de devenir une colonie rentable.",
    // iOS R 34: the decimal point, "Temp" (iOS R 33 writes them out)
    "%s has explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s.": "%s a exploré %s. Gravité : %d,%2.2dG. Température : %s. Métal : %s.",
    // iOS R 36: the allies left out
    "You %swon a battle at %s. You %slost %d of your ships. %s lost %d.": "Vous%s avez gagné une bataille à %s. Vous%s avez perdu %d de vos vaisseaux. %s en a perdu %d.",
    // iOS R 37 left "You" in English and lost the counts' places
    "You %slost a battle at %s. You %slost %d of your ships. %s lost %d.": "Vous%1$s avez perdu une bataille à %2$s. Vous%3$s avez perdu %4$d de vos vaisseaux. %5$s en a perdu %6$d.",
    // iOS R 38: "a résisté à %s" (resisted the attacker)
    "%s survived an attack from %s. You %slost %d of your ships; %s lost %d. You lost %s people.": "%s a résisté à une attaque de %s. Vous%s avez perdu %d de vos vaisseaux ; %s en a perdu %d. Vous avez perdu %s habitants.",
    // 3.0.1F 1000.33: the same
    "%s survived an enemy attack from %s. You lost %d of your ships. %s lost %d. You lost %s people.": "%s a résisté à une attaque ennemie de %s. Vous avez perdu %d de vos vaisseaux. %s en a perdu %d. Vous avez perdu %s habitants.",
    // iOS R 39, 3.0.1F 1000.34: "affection" for "I want"
    "%s says, \"I want %s.\"": "%s dit : « Je veux %s. »",
    // iOS R 77: "le match"
    "Your ally %s has just won the game.": "Votre allié %s vient de remporter la partie.",
    // iOS R 78: "un jeu", "gagné" twice
    "Congratulations! You won a %d difficulty game and have earned %s master points.": "Félicitations ! Vous avez gagné une partie de difficulté %d et obtenu %s Master Points.",
    // 1.2F 1000.58, 3.0.1F 1000.69, iOS R 79: "pas assez" for "not any"
    "You are not spending any money on technology research.": "Vous n'investissez rien dans la recherche technologique.",
    // 3.0.1F 1000.70, iOS R 80: "averse de météorites" (the others: "pluie de météores")
    "The meteor shower destroyed your colony at %s.": "La pluie de météores a détruit votre colonie à %s.",
    // iOS R 96: "avec par" (the English's "with with")
    "You no longer want to be best buddies with with %s. You just want to be allies.": "Vous ne voulez plus être les meilleurs copains de %s. Vous voulez juste être des alliés.",
    // iOS R 8, 3.0.1F 1000.7: "découvrir une découverte", the wild discovery lost
    "Your Radical researchers have just made another wild discovery!": "Vos chercheurs Radicaux viennent de faire une nouvelle découverte insensée !",
    // iOS R 113: "faire modifier votre moniteur"
    "Your scientists have discovered how to turn your monitor from black and white to color!": "Vos scientifiques viennent de trouver comment faire passer votre moniteur du noir et blanc à la couleur !",
    // iOS R 115: "courir dans tous les sens" for a shrug
    "Your scientists realize you already are running in color, shrug, and go back off to work.": "Vos scientifiques se rendent compte que vous êtes déjà en couleur, haussent les épaules et retournent au travail.",
    // iOS R 117, 3.0.1F 1000.99: "en toute simplicité" for safely, the maximum lost
    "Your sociologists have discovered how to safely increase the maximum population of your planets!": "Vos sociologues ont découvert comment augmenter sans danger la population maximale de vos planètes !",
    // iOS R 122: "atteint le plafond de la prime" for the prime lending rate
    "You've raised the prime lending rate and can now earn 50%% higher interest on savings.": "Vous avez relevé le taux directeur et pouvez maintenant gagner 50 %% d'intérêts de plus sur votre épargne.",
    // iOS R 125: "et ont augmenté de"
    "You have found a wealth of precious metals and have increased your savings by %s": "Vous avez trouvé une mine de métaux précieux et avez augmenté votre épargne de %s",
    // iOS R 131: "prends place"; 3.0.1F 1000.107 dropped the global warming
    "You don't have enough money! You're neglecting your planets! Global warming is taking place!": "Vous n'avez pas assez d'argent ! Vous négligez vos planètes ! Le réchauffement climatique est en marche !",
    // iOS R 136, 3.0.1F 1000.112: "a juste été" (English "just")
    "%s's armageddon device has just been turned on!": "L'arme ultime Armageddon vient d'être actionnée par %s !",
    // iOS R 138: the battle left out
    "You just received %s metal from someone scrapping a fleet or from a battle over %s.": "Vous venez de recevoir %s unités de métal, du recyclage d'une flotte ou d'une bataille au-dessus de %s.",
    // iOS R 141: "battre" (beat) for taking over
    "%s has just taken over for the computer player %s.": "%s vient de prendre la place du joueur ordinateur %s.",
    // iOS R 142-146: the five in one order
    "You now have %s Range Technology (%d).": "Vous avez maintenant %s en technologie Distance (%d).",
    "You now have %s Speed Technology (%d).": "Vous avez maintenant %s en technologie Vitesse (%d).",
    "You now have %s Weapons Technology (%d).": "Vous avez maintenant %s en technologie Armes (%d).",
    "You now have %s Shield Technology (%d).": "Vous avez maintenant %s en technologie Boucliers (%d).",
    "You now have %s Miniaturization Technology (%d).": "Vous avez maintenant %s en technologie Miniaturisation (%d).",
    // iOS R 148: "%s Métal"
    "%s surrenders to you, giving you %s metal.": "%s se rend à vous et vous donne %s unités de métal.",
    // iOS R 150: "revenu" for net worth
    "Oh no! The Valdez has sprung a leak! The ecology on %s is in shambles! The citizens are suing you for negligence for twice your net worth!": "Oh non ! Le Valdez a une fuite ! L'écologie de %s est en ruine ! Les citoyens vous poursuivent pour négligence et réclament le double de votre fortune !",
    // iOS R 154: "ont réussis", "étoiles filantes", "le vaisseau en orbite colonie"
    "%s people managed to escape the meteor shower at %s by fleeing to the orbiting colony ship(s).": "%s personnes ont réussi à échapper à la pluie de météores sur %s en se réfugiant dans les Transports en orbite.",
    // iOS R 157: "éviter %s de devenir"
    "It's a miracle! Your scientists have figured out to prevent %s from going supernova.": "C'est un miracle ! Vos scientifiques ont trouvé comment empêcher %s de se transformer en supernova.",
    // 1.2F 1000.8: "Tous ses habitants aussi" (became a nova too)
    "%s has gone nova. All inhabitants were killed.": "%s s'est transformée en nova. Tous ses habitants ont péri.",
    // iOS A 0: "jeu en réseau courant"
    "Are you sure you want to leave your current network game?": "Êtes-vous sûr de vouloir quitter votre partie en réseau en cours ?",
    // iOS A 10
    "Sorry, but spacewardho.net already has a game with that name running. Please try a different name.": "Désolé, mais une partie portant ce nom est déjà en cours sur spacewardho.net. Merci d'essayer un autre nom.",
    // iOS A 14: "Il peut être en panne ou que votre connexion peut"
    "We haven't heard from the server in a while. It may be down or your connection may be severed. You may want to quit and then try to reconnect.": "Le serveur ne donne plus de nouvelles depuis un moment. Il est peut-être en panne, ou votre connexion a peut-être été coupée. Vous pouvez quitter puis essayer de vous reconnecter.",
    // iOS A 21: "est déjà été pris"
    "Sorry, but the screen name you have requested has already been taken. Please try a different username.": "Désolé, mais le pseudo que vous avez choisi est déjà pris. Merci d'en essayer un autre.",
    // iOS A 23: "Ne" after the title, "vous assurez"
    "Sorry, but Spaceward Ho! cannot connect to the registration server. Please make sure you are connected to the Internet.": "Désolé, mais Spaceward Ho! ne parvient pas à se connecter au serveur d'enregistrement. Merci de vous assurer que vous êtes bien connecté à Internet.",
    // iOS A 27: "inactif … déconnectés"
    "You were idle for 15 minutes and have been disconnected for spacewardho.net.": "Vous étiez inactif depuis 15 minutes et avez été déconnecté de spacewardho.net.",
    // iOS A 31: "Il reviendra" (la copie)
    "Are you sure you want to de-register this copy of Spaceward Ho!? It will revert to demo mode.": "Êtes-vous sûr de vouloir annuler l'enregistrement de cette copie de Spaceward Ho! ? Elle reviendra en mode démo.",
    // iOS sprintf 18: "vraiment à évacuer"
    "Do you really want to evacuate %s? It's a profitable colony!": "Voulez-vous vraiment évacuer %s ? C'est une colonie rentable !",
    // iOS sprintf 36
    "Do you really want to evacuate %s?": "Voulez-vous vraiment évacuer %s ?",
    // iOS H 2: the ranks left out
    "Play with the spending bars. Conquer the galaxy. Gain ranks to brag to your friends. Enjoy.": "Modifiez les barres de dépenses. Partez à la conquête de la galaxie. Gagnez des grades pour épater vos amis. Amusez-vous.",
    // iOS H 4: the second sentence left out
    "Dots by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left.": "Un point près d'une planète signifie que vous y avez des vaisseaux en orbite. Les flottes sont à droite, les satellites à gauche.",
    // iOS H 12: "tirez" (pull) for drag
    "Touch and drag a fleet back to its current star to cancel a fleet's movement.": "Touchez une flotte et faites-la glisser vers l'étoile où elle se trouve pour annuler son déplacement.",
    // iOS H 21: the Celsius left out
    "Good planets are close to 72ºF (20ºC).": "Les belles petites planètes sont proches de 72 °F (20 °C).",
    // iOS H 23: "profitable"
    "If a planet is over 2.5 G or below 0.4 G, it will never make a profit.": "Si une planète dépasse 2,5 G ou est inférieure à 0,4 G, elle ne deviendra jamais rentable.",
    // iOS H 27: savings into "Placements" (investments), the shipbuilding lost
    "Savings puts money away for shipbuilding.": "L'Épargne met de l'argent de côté pour construire des vaisseaux.",
    // iOS H 28
    "Savings generates extra income.": "L'Épargne rapporte des intérêts.",
    // iOS H 30: "marquer … pour arriver"
    "If you have a fleet with fighters and a colony ship, mark the colony ship to arrive late. It'll probably survive longer.": "Si vous avez une flotte avec des Chasseurs et un Transport, faites arriver le Transport en retard : il survivra sans doute plus longtemps.",
    // iOS H 34
    "Put multiple ships in the same fleet with Organize Fleets.": "Regroupez plusieurs vaisseaux dans une même flotte avec « Organiser Flottes ».",
    // iOS H 35: "Organiser Flotte"
    "Use the Organize Fleets dialog to split up ship piles.": "Utilisez « Organiser Flottes » pour séparer les groupes de vaisseaux.",
    // iOS H 38: "auto-play" left in English
    "If you've just started, you might want to try turning on auto-play and watching.": "Si vous venez de commencer, essayez d'activer le jeu automatique et de regarder.",
    // iOS spells the screen "Organiser Flotte"; "tirez" (pull) for drag
    "Option-drag in Organize Fleets to split up ship piles.": "Faites glisser avec la touche Option dans « Organiser Flottes » pour séparer les groupes de vaisseaux.",
    // iOS MS 74: "un nom d'étoile pour les futurs jeux"
    "You may name a star for use in future games:": "Vous pouvez donner un nom à une étoile pour les prochaines parties :",
    // iOS MS 123, 3.0.1F DITL 3020: "Voulez vous"; 3.0.1F's thou kept
    "Dost thou truly wish to abandon Hope? All is not yet lost!": "Veux-tu vraiment abandonner Hope ? Tout n'est pas encore perdu !",
    // 3.0.1F DITL 3030: "Tous le monde"
    "Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!": "Abandonner le vaisseau ? Abandonnez le vaisseau ! Tout le monde abandonne le vaisseau ! Les femmes et les enfants d'abord !",
    // 3.0.1F DITL 3255: "perdre du temps" (wasting time) for losing big
    "I get it. You’re losing big time and this is the only way you could possibly win! That’s it isn’t it?": "J'ai compris. Vous êtes en train de perdre à plate couture, et c'est votre seule chance de gagner ! C'est ça, n'est-ce pas ?",
    // 3.0.1F DITL 4050: "lettres" (any character will do)
    "Star names must be 2 to 7 characters long.": "Le nom doit comprendre entre 2 et 7 caractères.",
    // 3.0.1F DITL 4050: "une planète" for a star
    // 1.2F's Name a Star (DITL 4050, 3340), for 1.2 and 2.0: "lettres", the full stop inside the quotes
    "Star names must be 4 to 7 characters long.": "Le nom doit comprendre entre 4 et 7 caractères.",
    "(If you’d rather not name a star, click “OK” with the name blank.)": "(Si vous ne voulez pas donner de nom à une étoile, cliquez sur OK sans rien écrire.)",
    "Sorry, there’s already a star named  “%s.” Please pick another name.": "Désolé, il y a déjà une étoile nommée « %s ». Soyons créatifs !",
    "Sorry, there’s already a star named ‘%s’.  Please pick another name.": "Désolé, il y a déjà une étoile nommée « %s ». Soyons créatifs !",
    "You won the game, so you get to name a star.": "Vous avez gagné la partie : vous pouvez donc donner un nom à une étoile.",
  },

  // adapted from official: a line whose English differs a little from one an
  // official translation has (a word, a clause, a number, a name): that
  // translation, edited as little as the difference needs. [the translation,
  // the official line's English] (tools/lang-test.js --adapted)
  adapted: {
    // ---- 5.0.5's lines that iOS words for its touch, and the Palm's ----
    'Click here to make this message go away. Click on the clock to end your turn.': ['Cliquez ici pour faire disparaître ce message. Cliquez sur l\'horloge pour conclure le tour.', 'Tap here to make this message go away. Tap on the End Turn button to complete the turn.'],
    'Fleets appear as dots next to your planets. Click one and drag it to send it to another star.': ['Les flottes figurent sous forme de points près de vos planètes. Cliquez sur l\'une d\'elles et tirez-la vers une autre étoile pour l\'y envoyer.', 'Fleets appear as dots next to your planets. To move a fleet, select a star. Drag the ship to send it to another star.'],
    'Play with the spending bars. Conquer the galaxy. Gain ranks to unlock more game options. Enjoy.': ['Modifiez les barres de dépenses. Partez à la conquête de la galaxie. Gagnez des grades pour débloquer d\'autres options de jeu. Amusez-vous.', 'Play with the spending bars. Conquer the galaxy. Gain ranks to brag to your friends. Enjoy.'],
    'Option-drag in Organize Fleets to split up ship piles.': ['Tirez avec la touche option dans "Organiser Flotte" pour séparer les groupes de vaisseaux.', 'Use the Organize Fleets dialog to split up ship piles.'],
    'Sorry, but that fleet doesn\'t have enough fuel to reach the selected destination. You can tell this because there are no arrows on either end of the dragged line.': ['Désolé, mais cette flotte ne dispose pas d\'assez de carburant pour atteindre la destination choisie. Vous pouvez le savoir grâce à l\'absence de flèches aux extrémités de la ligne tirée.', 'Sorry, but that fleet doesn\'t have enough fuel to reach the selected destination. You can tell this because of the red fleet line.'],
    'Icons by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left.': ['Des icônes près d\'une planète signifient que vous y avez des vaisseaux en orbite. Les flottes sont à droite, les satellites à gauche.', 'Dots by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left.'],
    'The first person in the Enemies and Allies list is winning.': ['Le joueur le plus fort se trouve en tête de la liste Ennemis et Alliés.', 'The first person in the player list is winning.'],
    // ---- 4.0.5 (Windows and Mac) and 3.0.1 ----
    'Play with the spending bars. Conquer the galaxy. Enjoy.': ['Modifiez les barres de dépenses. Partez à la conquête de la galaxie. Amusez-vous.', 'Play with the spending bars. Conquer the galaxy. Gain ranks to brag to your friends. Enjoy.'],
    'Click here to make this message go away.': ['Cliquez ici pour faire disparaître ce message.', 'Tap here to make this message go away. Tap on the End Turn button to complete the turn.'],
    'Good planets are close to 72 degrees.': ['Les belles petites planètes sont proches de 72 degrés.', 'Good planets are close to 72°F (20°C).'],
    'Spaceward Ho! Version 4.0.5 by Peter Commons.': ['Spaceward Ho! Version 4.0.5 par Peter Commons.', 'Spaceward Ho! Version 1.2 by Peter Commons.'],
    'Spaceward Ho! Version 4.0.3 by Peter Commons.': ['Spaceward Ho! Version 4.0.3 par Peter Commons.', 'Spaceward Ho! Version 1.2 by Peter Commons.'],
    'Your fleet of %s is waiting to refuel before it can continue on to %s.': ['Votre flotte de %s est en attente pour faire le plein avant de pouvoir continuer à %s.', 'Your %s is waiting to refuel before it can continue on to %s.'],
    'Wow! You won! You have conquered the galaxy. Congratulations!': ['Wow ! Vous avez gagné ! Vous avez conquis la galaxie. Félicitations !', 'Congratulations! You have conquered the galaxy!'],
    'Wow! You won! You and your allies have conquered the galaxy. Congratulations!': ['Wow ! Vous avez gagné ! Vous et vos alliés avez conquis la galaxie. Félicitations !', 'Congratulations! You have conquered the galaxy!'],
    '%s have just won the game.': ['%s viennent juste de gagner. Hi hi.', '%s has just won the game.'],
    'Congratulations!  You won the game.  Game difficulty rating was %s.': ['Bravo! Vous avez gagné. La difficulté du jeu était de %s.', 'Congratulations! You have just won the game.'],
    '%s says , "#!$*@%$&!"': ['%s dit: “#!$*@%$&!”', '%s says, “#!$@*$&@•™!”'],
    'You said "!$@*$&@!" to %s.': ['Je crois bien que vous avez dit “!$@*$&@!” à %s...', 'You said “#!$@*$&@•™!” to %s.'],
  },
  own: {
    // ---- 5.0.5 (and the Palm): its own lines that iOS rewrote or left out ----
    // the first messages (hints 1-3, the mouse's words where iOS has the finger's)
    // the hints iOS dropped or rewrote for touch
    'Click and hold for a second to cancel a fleet\'s movement.': 'Cliquez et maintenez le bouton une seconde pour annuler le déplacement d\'une flotte.',
    'There\'s a contextual menu in the map window for convenience.': 'Pour plus de commodité, la fenêtre de la carte a un menu contextuel.',
    'Hold down the option key and click planets to specify your fleet\'s path more exactly.': 'Maintenez la touche option enfoncée et cliquez sur des planètes pour préciser le trajet de votre flotte.',
    'Use the graph to see how well you\'re doing technology-wise vs. the other players.': 'Utilisez le graphique pour voir où en est votre technologie par rapport à celle des autres joueurs.',
    // the remake's own line for a turn with no news (js/skins/classic/ui.js)
    'Year %d. Nothing much happened.': 'Année %d. Rien de spécial ne s\'est passé.',
    // ---- the Palm (5.0's code): its own hints, first messages and decoy ----
    'To cancel a fleet’s movement, make sure that fleet is selected in the Ship Info window and click the origin planet. You can also use the ‘Cancel Fleet Trip’ menu item in the ‘Ships’ menu.':
      'Pour annuler le déplacement d\'une flotte, sélectionnez-la dans la fenêtre Ship Info et cliquez sur sa planète d\'origine. Vous pouvez aussi utiliser la commande "Cancel Fleet Trip" du menu "Ships".',
    'There are menus and menu shortcuts in the Galaxy screen for your convenience.': 'Pour plus de commodité, l\'écran Galaxie a des menus et des raccourcis de menu.',
    'The computer will help choose the best path possible for your fleets.': 'L\'ordinateur vous aide à choisir le meilleur trajet possible pour vos flottes.',
    'Change the battle attitude of ships in your fleets in the Organize Fleets screen.': 'Changez l\'attitude au combat des vaisseaux de vos flottes dans l\'écran "Organiser Flottes".',
    'The Enemy and Allies screen can show who your friends and enemies are. It also so shows who is doing the best.': 'L\'écran Ennemis et Alliés vous montre qui sont vos amis et vos ennemis. Il montre aussi qui s\'en sort le mieux.',
    'Click the G button to see the Galaxy, click the $ button to see the Spendingscreen and click the H button to see these messages.': 'Cliquez sur le bouton G pour voir la Galaxie, sur le bouton $ pour voir l\'écran des Dépenses et sur le bouton H pour voir ces messages.',
    'Fleets appear as icons next to your planets. To send a fleet to another planet, select it and then drag it to the new planet.': 'Les flottes figurent sous forme d\'icônes près de vos planètes. Pour envoyer une flotte vers une autre planète, sélectionnez-la puis tirez-la vers la nouvelle planète.',
    'Palm OS version by Christopher Cotton and Steve Orens of Mobilefreon (tm)': 'Version Palm OS par Christopher Cotton et Steve Orens de Mobilefreon (tm)',
    // (4.0.5's decoy too)
    'Your ship technicians have designed a decoy ship. It\'s really weak, but it looks menacing and can help keep your allies in line!': 'Vos techniciens viennent de concevoir un vaisseau leurre. Il est vraiment faible, mais il a l\'air menaçant et peut aider à garder vos alliés dans le droit chemin !',
    // ---- 4.0.5 (Windows and Mac) and 3.0.1 ----
    // (iOS's French 4's words, which say just this for its own longer English;
    // the two Englishes too unlike to count it as adapted)
    'A dot by a planet means you have ships in orbit there.': 'Un point près d\'une planète signifie que vous y avez des vaisseaux en orbite.',
    'Click and Drag from one star to another to move fleets.': 'Cliquez et tirez d\'une étoile à une autre pour déplacer vos flottes.',
    'Ship savings puts money away for shipbuilding.': 'L\'épargne des vaisseaux met de l\'argent de côté pour leur construction.',
  },
  words: {
    // iOS's "et vos alliés" (Misc Strings 39) with the space its reports need ("Vous%s avez perdu")
    'and your allies ': ' et vos alliés',
    // 3.0.1's and 4.0.5's Send Message groups (iOS's "allié", "meilleur ami")
    Everyone: 'Tout le monde', 'Your Allies': 'Vos alliés', 'Your Buddies': 'Vos meilleurs amis',
  },
  // the patch's words for a report's fillings, over iOS's and the remake's (iOS's lists' Radical
  // discoveries: Radical Tech Strings 4, 10, 12, 14-19)
  patchWords: {
    "and your allies ": " et vos alliés",
    // iOS's report 85 filled with the English tech kind ("Votre niveau en Speed")
    "Range": "Distance", "Speed": "Vitesse", "Weapons": "Armes", "Shields": "Boucliers", "Miniaturization": "Miniaturisation",
    "Improve population maximums": "Augmenter la population maximale",
    "Decrease borrowing interest rate": "Diminuer le taux d'intérêt des emprunts",
    "Build a biological space monster": "Construire un monstre biologique de l'espace",
    "Build a set of ships without development cost": "Construire une série de vaisseaux sans frais de développement",
    "Improve range tech dramatically": "Améliorer considérablement la technologie Distance",
    "Improve speed tech dramatically": "Améliorer considérablement la technologie Vitesse",
    "Improve weapons tech dramatically": "Améliorer considérablement la technologie Armes",
    "Improve shields tech dramatically": "Améliorer considérablement la technologie Boucliers",
    "Improve mini tech dramatically": "Améliorer considérablement la technologie Mini",
  },
  // the patch's window words, over 3.0.1F's (HO.windowWords) in a 3.0.1 or 4.0.5 game (js/ui-lang.js)
  patchWindows: {
    "Male": "Homme",
    "Female": "Femme",
    "Force End": "Forcer la fin",
    "Skip": "Passer",
    "Revert": "Revenir",
    "They Like Me": "Ils m'aiment",
    "They Don’t Like Me": "Ils me détestent",
    "Star names must be 2 to 7 characters long.": "Le nom doit comprendre entre 2 et 7 caractères.",
    "You won the game, so you get to name a star.": "Vous avez gagné la partie : vous pouvez donc donner un nom à une étoile.",
    "New Star Name:": "Nouveau nom d'étoile :",
    "(If you’d rather not name a star, click “OK” with the name blank.)": "(Si vous ne voulez pas donner de nom à une étoile, cliquez sur OK sans rien écrire.)",
    "I get it. You’re losing big time and this is the only way you could possibly win! That’s it isn’t it?": "J'ai compris. Vous êtes en train de perdre à plate couture, et c'est votre seule chance de gagner ! C'est ça, n'est-ce pas ?",
    "Dost thou truly wish to abandon Hope? All is not yet lost!": "Veux-tu vraiment abandonner Hope ? Tout n'est pas encore perdu !",
    "• Click and drag fleets into desired number of piles": "• Cliquez sur les vaisseaux et faites-les glisser dans le nombre de groupes voulu.",
  },
},
// =====================================================================
// Turkish: from iOS's Turkish (tr.lproj): "sen", the suffixes put straight
// after a name as the official lines do ("%sye", "%sde", "%syi")
// =====================================================================
tr: {
  // the patch's corrections (G.opts.patch): an official line's slips, kept in the default as
  // the official translation has them (Jake's rule: accuracy first), put right here.
  // English -> the corrected translation (docs/proofread-2026-10.md, "The patch table").
  // Read by js/languages.js (the fix 'translations': engine.js inLanguage, rs.lang[code].fix, as
  // iOS's trLostWord is), wherever the version shows the line.
  over: {},
  patch: {
    // ---- iOS's own lines (tr.lproj), every one the patch rewrites: the iOS list and index, what iOS has wrong ----
    // (Cedilla, chunk 3; docs/glossary-tr.md, docs/proofread-2026-10.md "The patch for iOS's Turkish (chunk 3)".
    // {e} {de} {den} {i} {in} {le} {deki}: a case ending fitted to the word before it, js/engine.js trSuffixes)
    // iOS R 0: iOS's credits, in English with a stray "!"
    'Spaceward Ho! by Peter Commons.': 'Spaceward Ho!, yazan: Peter Commons.',
    // iOS R 1: iOS's credits
    'Spaceward Ho! DEMO by Peter Commons.': 'Spaceward Ho! DEMO, yazan: Peter Commons.',
    // iOS R 2: iOS's credits
    'Artwork by Howard Vives and Bob Van de walle.': 'Grafikler: Howard Vives ve Bob Van de walle.',
    // iOS R 3: iOS "çeşitlilik" (variety) for Range; "Senin" dropped
    'Your Range Technology has reached level %d.': 'Menzil teknolojin %d. seviyeye ulaştı.',
    // iOS R 4: iOS "Senin hız  teknoloji seviyen %d" (no verb)
    'Your Speed Technology has reached level %d.': 'Hız teknolojin %d. seviyeye ulaştı.',
    // iOS R 5: as above
    'Your Weapons Technology has reached level %d.': 'Silah teknolojin %d. seviyeye ulaştı.',
    // iOS R 6: iOS "zırh" (armour) for Shield
    'Your Shield Technology has reached level %d.': 'Kalkan teknolojin %d. seviyeye ulaştı.',
    // iOS R 7: iOS "minyatürleme"
    'Your Miniaturization Technology has reached level %d.': 'Minyatürleştirme teknolojin %d. seviyeye ulaştı.',
    // iOS R 8: iOS "köklü"; one name, Radikal
    'Your Radical researchers have just made another wild discovery!': 'Radikal araştırmacıların yine akıl almaz bir keşif yaptı!',
    // iOS R 9: iOS "Sen %s 'i boşalttın" (the suffix spaced off); Evacuate is "tahliye"
    'You have evacuated %s.': '%s’{i} tahliye ettin.',
    // iOS R 10: iOS "novaya gitti" ("went to nova")
    '%s has gone nova.': '%s nova oldu.',
    // iOS R 11: iOS left "lost" in English and the enemy's losses out; "senin koloniyi"
    '%s destroyed your colony at %s. You %slost %d of your ships. %s lost %d. You lost %s people.': '%1$s, %2$s’{deki} koloniyi yok etti. Gemilerinin %4$d tanesini%3$s kaybettin; %5$s %6$d gemi kaybetti. %7$s insan kaybettin.',
    // iOS R 12: the double space
    'Year %d:': 'Yıl %d:',
    // iOS R 13: "Senin %s deki koloni" (the suffix spaced off)
    'Your colony at %s is not receiving sufficient funds to support itself.': '%s’{deki} kolonin kendini geçindirecek kadar para alamıyor.',
    // iOS R 14: iOS "artık %s e ait değil" (says the opposite: "no longer belongs")
    'You are not supporting %s enough. The people have revolted and now belong to %s': '%s’{i} yeterince desteklemiyorsun. Halk ayaklandı ve artık %s’{e} ait.',
    // iOS R 15: iOS "Uyarma", "o uyduhiç" (a satellite, the words run together)
    'Warning: you are terraforming %s, a planet that will never become profitable.': 'Uyarı: %s’{i} yaşanabilir hâle getiriyorsun, ama bu gezegen hiçbir zaman kâr getirmeyecek.',
    // iOS R 16: the suffix spaced off
    'You have completely terraformed %s.': '%s’{i} tamamen yaşanabilir hâle getirdin.',
    // iOS R 17: iOS "artırıp %s!a yaptı" (the "!" inside the sentence)
    'A volcanic eruption at %s has drastically warmed the temperature to %s!': '%s’{deki} bir yanardağ patlaması ortalığı fena ısıttı: sıcaklık artık %s!',
    // iOS R 18: iOS "%s metal ihtiyacı için" ("for the need of")
    'Your fleet of %s at %s has been dismantled for %s metal.': '{^}%s filon %s’{de} %s metal karşılığında parçalandı.',
    // iOS R 19: iOS "%s deki filon" ("your fleet at %s")
    'Your fleet of %s was dismantled while in hyperspace.': '{^}%s filon hiperuzaydayken parçalandı.',
    // iOS R 20: iOS "%d miktarı", "parçlandı"
    'Your "%s" ship type has been dismantled. %d of this type scrapped for %s metal.': '“%s” gemi tipin hurdaya çıkarıldı. Bu tipten %d gemi %s metal karşılığında parçalandı.',
    // iOS R 21: iOS "sıcak delik" ("hot hole") for wormhole
    'Your fleet of %s disappeared through a wormhole in space and is lost.': '{^}%s filon uzaydaki bir solucan deliğinden geçip kayboldu.',
    // iOS R 22: glued suffix, the double space
    'Your %s is waiting to refuel before it can continue on to %s.': 'Senin %s, %s’{e} devam etmeden önce yakıt almayı bekliyor.',
    // iOS R 23: "Senin" dropped; the suffix
    'Your fleet of %s has arrived at %s.': '{^}%s filon %s’{e} ulaştı.',
    // iOS R 24: iOS says it stopped and then went on ("durduktan sonra … devam etti")
    'Your fleet of %s has stopped at %s on the way to %s.': '{^}%1$s filon, %3$s’{e} giderken %2$s’{de} durdu.',
    // iOS R 25: iOS "Filo %sya dahil %sler %sye vardı" (garbled)
    '%s\'s fleet of %s has arrived at %s.': '%s’{in} %s filosu %s’{e} vardı.',
    // iOS R 26: iOS lower-case "senin", "%slerden oluşan"
    'Your fleet of %s has eaten %s people while refueling at %s.': '{^}%1$s filon %3$s’{de} yakıt alırken %2$s insanı yedi.',
    // iOS R 27: spacing
    '%s\'s fleet of biologicals has eaten %s people while refueling at %s.': '%1$s’{in} biyolojik filosu %3$s’{de} yakıt alırken %2$s insanı yedi.',
    // iOS R 28: iOS "metalı btti"
    '%s has run out of metal.': '%s’{in} metali bitti.',
    // iOS R 29: iOS "metalı btti"; Evacuate "tahliye"
    '%s has run out of metal. You should probably evacuate it.': '%s’{in} metali bitti. Orayı tahliye etsen iyi olur.',
    // iOS R 30: iOS "coloni"
    '%s has just become a profitable colony.': '%s artık kâr getiren bir koloni oldu.',
    // iOS R 31: iOS "Bebeler kıyamet gibi!", "nufusu"
    'It\'s a baby boom! The population at %s has started growing quickly.': 'Bebek patlaması! %s’{in} nüfusu hızla artmaya başladı.',
    // iOS R 32: iOS "nüfus artımı"
    '%s\'s population growth rate has slowed.': '%s’{in} nüfus artış hızı yavaşladı.',
    // iOS R 33: iOS "inceledin" (examined) for explored; the double spaces
    'You have explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s.': '%s’{i} keşfettin. Yer çekimi: %d.%2.2dG. Sıcaklık: %s. Metal: %s.',
    // iOS R 34: as above
    '%s has explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s.': '%s, %s’{i} keşfetti. Yer çekimi: %d.%2.2dG. Sıcaklık: %s. Metal: %s.',
    // iOS R 35: iOS "Sen %syi inceledin" (the explored report's text; the filling lost its meaning)
    'You have colonized %s.': '%s’{i} kolonileştirdin.',
    // iOS R 36: iOS "%dyi kaybetti" (a suffix on the number)
    'You %swon a battle at %s. You %slost %d of your ships. %s lost %d.': '%2$s’{de}%1$s bir savaş kazandın. Gemilerinin %4$d tanesini%3$s kaybettin. %5$s %6$d gemi kaybetti.',
    // iOS R 37: as above
    'You %slost a battle at %s. You %slost %d of your ships. %s lost %d.': '%2$s’{de}%1$s bir savaş kaybettin. Gemilerinin %4$d tanesini%3$s kaybettin. %5$s %6$d gemi kaybetti.',
    // iOS R 38: iOS runs the names together and leaves the enemy's losses out
    '%s survived an attack from %s. You %slost %d of your ships; %s lost %d. You lost %s people.': '%1$s, %2$s’{den} gelen bir saldırıdan sağ çıktı. Gemilerinin %4$d tanesini%3$s kaybettin; %5$s %6$d gemi kaybetti. %7$s insan kaybettin.',
    // iOS R 39: iOS "ben %s isterim" (no accusative; "ben")
    '%s says, "I want %s."': '%s, “%s’{i} istiyorum” diyor.',
    // iOS R 40: glued suffix
    '%s says, "You take %s."': '%s, “%s’{i} sen al” diyor.',
    // iOS R 41: iOS "ben %syi severim"
    '%s says, "I like %s."': '%s, “%s’{i} beğeniyorum” diyor.',
    // iOS R 42: iOS "ben … nefret ederim"
    '%s says, "I hate %s."': '%s, “%s’{den} nefret ediyorum” diyor.',
    // iOS R 43: iOS "ben %sye sahibim" (the dative)
    '%s says, "I own %s."': '%s, “%s benim” diyor.',
    // iOS R 44: iOS "para ihtiyacım var"
    '%s says, "I need money."': '%s, “Paraya ihtiyacım var” diyor.',
    // iOS R 45: as above
    '%s says, "I need metal."': '%s, “Metale ihtiyacım var” diyor.',
    // iOS R 46: iOS lost the star ("haydi hücum yapalım")
    '%s says, "Let\'s attack %s."': '%s, “Haydi %s’{e} saldıralım” diyor.',
    // iOS R 47: the comma
    '%s says, "Thank You!"': '%s, “Teşekkür ederim!” diyor.',
    // iOS R 48: iOS lost the opening quotation mark
    '%s says, "Sorry!"': '%s, “Özür dilerim!” diyor.',
    // iOS R 49: the Mac's characters (iOS "¥ª"); the space
    '%s says, "#!$@*$&@¥ª!"': '%s, “#!$@*$&@•™!” diyor.',
    // iOS R 50: iOS "planet" for gezegen, "ben"
    '%s says, "I like planets that are %d.%2.2dG and %s."': '%s, “%d.%2.2dG ve %s olan gezegenleri severim” diyor.',
    // iOS R 51: "ben" dropped
    '%s says, "I saw %s at %s!"': '%s, “%s’{i} %s’{de} gördüm” diyor.',
    // iOS R 52: iOS "bakın" (siz; the game says sen)
    '%s says, "Look at %s."': '%s, “%s’{e} bak” diyor.',
    // iOS R 55: iOS "Sen %sye dedin ki, %syi istiyorsun"
    'You told %s that you want %s.': '%s’{e} %s’{i} istediğini söyledin.',
    // iOS R 56: as above
    'You told %s that you don\'t want %s.': '%s’{e} %s’{i} istemediğini söyledin.',
    // iOS R 57: as above
    'You told %s that you like %s.': '%s’{e} %s’{i} beğendiğini söyledin.',
    // iOS R 58: as above
    'You told %s that you hate %s.': '%s’{e} %s’{den} nefret ettiğini söyledin.',
    // iOS R 59: iOS "%s senin malındır"
    'You told %s that you own %s.': '%s’{e} %s’{in} senin olduğunu söyledin.',
    // iOS R 60: as above
    'You told %s that you need money.': '%s’{e} paraya ihtiyacın olduğunu söyledin.',
    // iOS R 61: as above
    'You told %s that you need metal.': '%s’{e} metale ihtiyacın olduğunu söyledin.',
    // iOS R 62: iOS lost the star ("haydi  ye hücum edelim")
    'You told %s, "Let\'s attack %.*s."': '%s’{e} “Haydi %s’{e} saldıralım” dedin.',
    // iOS R 63: "Sen" dropped
    'You told %s, "Thank You!"': '%s’{e} “Teşekkür ederim!” dedin.',
    // iOS R 64: "Sen" dropped
    'You told %s, "Sorry!"': '%s’{e} “Özür dilerim!” dedin.',
    // iOS R 65: iOS "Sen "…" dedin %sye" (the words out of order)
    'You said "#!$@*$&@¥ª!" to %s.': '%s’{e} “#!$@*$&@•™!” dedin.',
    // iOS R 66: "Sen" dropped
    'You told %s what gravity and temperature you prefer.': '%s’{e} hangi yer çekimini ve sıcaklığı tercih ettiğini söyledin.',
    // iOS R 67: "Sen" dropped
    'You told %s you saw %s at %.*s.': '%s’{e} %s’{i} %s’{de} gördüğünü söyledin.',
    // iOS R 68: iOS "%syi anlattın" ("all about" lost)
    'You told %s all about %s.': '%s’{e} %s hakkında her şeyi anlattın.',
    // iOS R 69: iOS "gercekten"
    'Wow! You seem to be doing really well! Congratulations!': 'Vay canına! Gerçekten çok iyi gidiyorsun! Tebrikler!',
    // iOS R 70: "Senin" dropped
    'Your message to %s: %s': '%s’{e} mesajın: %s',
    // iOS R 71: iOS "metalı", "kazandın"
    'You recovered %s metal from the battle at %s.': '%2$s’{deki} savaştan %1$s metal kurtardın.',
    // iOS R 72: iOS says the opposite: you lost the metal to %s
    '%s metal has fallen onto %s from your recent battle.': 'Son savaşından %2$s üzerine %1$s metal düştü.',
    // iOS R 73: iOS "%s kadar insan"
    'Oh no! %s people were killed when a heavy meteor shower hit %s.': 'Eyvah! %2$s üzerine düşen ağır bir meteor yağmurunda %1$s insan öldü.',
    // iOS R 74: iOS "şu anda" ("at the moment") for "just"
    '%s has just been eliminated from the game.': '%s oyundan elendi.',
    // iOS R 75: as above
    'You have just been eliminated from the game.': 'Oyundan elendin.',
    // iOS R 76: as above
    '%s has just won the game.': '%s oyunu kazandı.',
    // iOS R 77: iOS lost the name ("Senin ortağın …"); ally is "müttefik"
    'Your ally %s has just won the game.': 'Müttefikin %s oyunu kazandı.',
    // iOS R 78: iOS "%d gibi zor bir oyunu" ("a game as hard as %d")
    'Congratulations! You won a %d difficulty game and have earned %s master points.': 'Tebrikler! %d zorluk derecesindeki bir oyunu kazandın ve %s usta puanı topladın.',
    // iOS R 79: "Sen," dropped
    'You are not spending any money on technology research.': 'Teknoloji araştırmasına hiç para harcamıyorsun.',
    // iOS R 80: glued suffix
    'The meteor shower destroyed your colony at %s.': 'Meteor yağmuru %s’{deki} kolonini yok etti.',
    // iOS R 81: iOS "yapma be!" ("don't, man!"), "metallar"
    'Oh, no! All the metal on %s has suddenly disappeared.': 'Eyvah! %s’{deki} bütün metal birden yok oldu.',
    // iOS R 82: iOS "vay be!"
    'Uh-oh! %s has started growing and is turning bright red in hue!': 'Eyvah! %s büyümeye başladı ve parlak kırmızıya dönüyor!',
    // iOS R 83: iOS "Planet tamamen eriyip"
    '%s has just gone supernova. The planet has been obliterated.': '%s süpernova oldu. Gezegen tamamen yok oldu.',
    // iOS R 84: iOS lost the star; "yüksek dalga" (high wave)
    'The shock wave from the supernova threw %s metal at %s, killing %s people.': 'Süpernovanın şok dalgası %2$s üzerine %1$s metal fırlattı ve %3$s insanı öldürdü.',
    // iOS R 85: iOS "%dye yükseldi" (a suffix on the number)
    'Your %s technology just jumped to %d.': '%s teknolojin birden %d. seviyeye çıktı.',
    // iOS R 86: iOS "Cırt!", "virüs" (the joke is a bug)
    'Eeek! A nasty computer bug has broken into your game and started wreaking havoc!': 'Iyy! Pis bir bilgisayar böceği oyununa sızdı ve ortalığı birbirine katıyor!',
    // iOS R 87: iOS "ortak" (partner) for ally
    '%s has offered to ally with you.': '%s seninle müttefik olmayı teklif etti.',
    // iOS R 88: as above
    '%s no longer wants to ally with you.': '%s artık seninle müttefik olmak istemiyor.',
    // iOS R 89: iOS "ortaklık"
    'You have offered to ally with %s.': '%s’{e} ittifak teklif ettin.',
    // iOS R 90: iOS "ortak"
    'You no longer want to ally with %s.': 'Artık %s ile müttefik olmak istemiyorsun.',
    // iOS R 91: iOS "ortaklık"
    'You have formed an alliance with %s.': '%s ile ittifak kurdun.',
    // iOS R 92: iOS "ortaklığın"
    'Your alliance with %s is gone.': '%s ile ittifakın sona erdi.',
    // iOS R 93: iOS "en iyi oyun arkadaşı"; one name, en iyi arkadaş
    '%s has offered to be your best buddy.': '%s sana en iyi arkadaşın olmayı teklif etti.',
    // iOS R 94: as above; "ortak"
    '%s no longer wants to be your best buddy. He just wants to be allies.': '%s artık en iyi arkadaşın olmak istemiyor. Sadece müttefik olmak istiyor.',
    // iOS R 95: iOS "olma teklif ettin"
    'You have offered to be best buddies with %s.': '%s’{e} en iyi arkadaş olmayı teklif ettin.',
    // iOS R 96: as above
    'You no longer want to be best buddies with with %s. You just want to be allies.': 'Artık %s ile en iyi arkadaş olmak istemiyorsun. Sadece müttefik olmak istiyorsun.',
    // iOS R 97: iOS "en iyi oyun arkadaşı oldun"
    'You are now best buddies with %s.': 'Artık %s ile en iyi arkadaşsınız.',
    // iOS R 98: iOS "ortaksınız"
    'Your best buddy relationship with %s is gone. You\'re only allies now.': '%s ile en iyi arkadaşlığın sona erdi. Artık yalnızca müttefiksiniz.',
    // iOS R 100: iOS "%s yi" (the suffix spaced off), "şimdi"
    '%s has just given you %s.': '%s az önce sana %s’{i} verdi.',
    // iOS R 101: iOS "%s  kadar metal"
    '%s has just given you %s metal.': '%s az önce sana %s metal verdi.',
    // iOS R 102: no accusative
    'You just gave %s %s.': '%s’{e} %s’{i} verdin.',
    // iOS R 103: "Sen" dropped
    'You just gave %s %s metal.': '%s’{e} %s metal verdin.',
    // iOS R 104: iOS "şimdi"
    '%s has just surrendered.': '%s az önce teslim oldu.',
    // iOS R 105: iOS "%s,şu anda"
    '%s has just surrendered to %s.': '%s az önce %s’{e} teslim oldu.',
    // iOS R 106: iOS "şu anda"
    'You have just surrendered.': 'Teslim oldun.',
    // iOS R 107: as above
    'You have just surrendered to %s.': '%s’{e} teslim oldun.',
    // iOS R 108: iOS "ortakların" (partners), "planetlerinden"; "additional" and "every planet" lost
    'Your mining consortium has just been able to extract an additional %s metal from every planet you have.': 'Madencilik şirketin, sahip olduğun her gezegenden %s metal daha çıkarmayı başardı.',
    // iOS R 109: iOS "Alışılmamıs"
    'Weird weather patterns have allowed astronomers to explore certain far away stars.': 'Garip hava koşulları sayesinde gökbilimciler bazı uzak yıldızları keşfedebildi.',
    // iOS R 110: iOS "yaratma ve geliştirme masrafları"
    'Your ship technicians have designed a set of new ships with no development cost.': 'Gemi teknisyenlerin, geliştirme maliyeti olmayan bir dizi yeni gemi tasarladı.',
    // iOS R 111: iOS "kandırıcı bir gemi", "düşmalarını"; Decoy is "sahte gemi"
    'Your scientists have invented a decoy ship. It can\'t fight, but it\'s cheap. Amaze your friends and confuse your enemies.': 'Bilim insanların sahte bir gemi icat etti. Savaşamaz ama ucuzdur. Dostlarını hayrete düşür, düşmanlarını şaşırt.',
    // iOS R 112: iOS "acayip bir gemi" (the monster lost)
    'Your mad scientists have created a space monster ship! It\'s not too powerful, but it doesn\'t cost any metal!': 'Çılgın bilim insanların bir uzay canavarı gemisi yarattı! Çok güçlü değil, ama hiç metal gerektirmiyor!',
    // iOS R 113: "Senin" dropped
    'Your scientists have discovered how to turn your monitor from black and white to color!': 'Bilim insanların monitörünü siyah beyazdan renkliye çevirmenin yolunu buldu!',
    // iOS R 114: iOS "onların donanım problemi var" (the joke's quotation marks lost)
    'Your scientists apologize, but they seem to be having "hardware problems."': 'Bilim insanların özür diliyor, ama galiba “donanım sorunları” yaşıyorlar.',
    // iOS R 115: iOS "senin renkli çalıştığını farkettiler"
    'Your scientists realize you already are running in color, shrug, and go back off to work.': 'Bilim insanların zaten renkli çalıştığını fark edince omuz silkip işlerinin başına döndü.',
    // iOS R 116: iOS "eski medeniyetlerden" ("lost" lost)
    'Your archaeologists have found ancient scientific documents from a lost civilization. You can now mine more efficiently.': 'Arkeologların kayıp bir uygarlıktan kalma eski bilimsel belgeler buldu. Artık daha verimli maden çıkarabilirsin.',
    // iOS R 117: iOS "uydularındaki" (satellites)
    'Your sociologists have discovered how to safely increase the maximum population of your planets!': 'Sosyologların gezegenlerinin azami nüfusunu güvenle artırmanın yolunu buldu!',
    // iOS R 118: iOS "uyduları" (satellites)
    'Your climatologists have discovered how to terraform planets more efficiently.': 'İklim bilimcilerin gezegenleri daha verimli yaşanabilir hâle getirmenin yolunu buldu.',
    // iOS R 119: iOS "proğramların aşama yaptı", "generalları"
    'Your military training program has improved. Your generals are now smarter.': 'Askerî eğitim programın gelişti. Generallerin artık daha akıllı.',
    // iOS R 120: iOS "tekrar kullanma", "atılmış gemilerden"
    'You have improved your recycling program. You can now get more metal from scrapped ships.': 'Geri dönüşüm programını geliştirdin. Artık hurdaya çıkarılan gemilerden daha çok metal elde ediyorsun.',
    // iOS R 121: iOS "10%%" (Turkish writes the sign first), "ünitesi"
    'You have built a new research facility; tech spending is now 10%% more effective.': 'Yeni bir araştırma tesisi kurdun; teknoloji harcamaların artık %%10 daha etkili.',
    // iOS R 122: iOS "faiz hattını", "simdi", "50%%"
    'You\'ve raised the prime lending rate and can now earn 50%% higher interest on savings.': 'Temel kredi faizini yükselttin; artık birikiminden %%50 daha yüksek faiz kazanıyorsun.',
    // iOS R 123: iOS "kıredi", "50%%"
    'You have renegotiated your line of credit and can now borrow at a 50%% better interest rate.': 'Kredi limitini yeniden müzakere ettin; artık %%50 daha iyi bir faizle borç alabilirsin.',
    // iOS R 124: iOS shows the line-of-credit report's text here
    'Your spies have stolen some technological secrets from %s!': 'Casusların %s’{den} bazı teknolojik sırlar çaldı!',
    // iOS R 125: iOS "zengin kıymetli metallar", "tasarruf"
    'You have found a wealth of precious metals and have increased your savings by %s': 'Bol miktarda değerli metal buldun; birikimin %s arttı.',
    // iOS R 126: iOS "calışıyorlar"
    'Your Radical researchers are hard at work on another discovery!': 'Radikal araştırmacıların yeni bir keşif için var güçleriyle çalışıyor!',
    // iOS R 127: iOS "tasarrufların"; one name, birikim
    'Warning! Savings is being used to support %s.': 'Dikkat! %s’{i} desteklemek için birikimin kullanılıyor.',
    // iOS R 128: iOS "Planetleri"
    'Warning! After supporting your planets and paying your interest, you have no money to spend!': 'Dikkat! Gezegenlerini destekleyip faizini ödedikten sonra harcayacak paran kalmadı!',
    // iOS R 129: iOS "bir sonrki oyunu" (the next game)
    'Your alliance will win the game next turn if it holds!': 'Bu durum sürerse ittifakın bir sonraki sırada oyunu kazanacak!',
    // iOS R 130: iOS "O, O!", "Faizleini"
    'Uh-oh! Having to borrow more to pay all your interest!': 'Eyvah! Bütün faizini ödeyebilmek için yine borç almak zorundasın!',
    // iOS R 131: iOS "Planetlerini", "küresel" lower-case
    'You don\'t have enough money! You\'re neglecting your planets! Global warming is taking place!': 'Yeterince paran yok! Gezegenlerini ihmal ediyorsun! Küresel ısınma başladı!',
    // iOS R 132: iOS "bakımi", "O hurdaya çıkıyor"
    'Due to a lack of funds, one of your fleets can\'t be maintained. It is being scrapped.': 'Para yetersizliği yüzünden filolarından birinin bakımı yapılamıyor. Filo hurdaya çıkarılıyor.',
    // iOS R 134: iOS "workE ye varılamaıyor" (an English word left in)
    'Hmm! The armadeddon device was activated, but there wasn\'t enough mass in the galaxy to get it to work.': 'Hımm! Mahşer günü aleti çalıştırıldı, ama galakside onu işletmeye yetecek kadar kütle yoktu.',
    // iOS R 135: iOS "yarısını süper nova olmasına yol açtı" (ungrammatical)
    'The armageddon device has caused half of the stars to supernova!': 'Mahşer günü aleti yıldızların yarısını süpernovaya çevirdi!',
    // iOS R 136: iOS "mahşer aleti"; one name
    '%s\'s armageddon device has just been turned on!': '%s’{in} mahşer günü aleti az önce çalıştırıldı!',
    // iOS R 137: iOS "Vay anasını!" for "Whew!"
    'Whew! %s\'s armageddon device was just turned off.': 'Oh be! %s’{in} mahşer günü aleti az önce kapatıldı.',
    // iOS R 138: iOS "%s için olan bir savaştan" ("a battle for %s")
    'You just received %s metal from someone scrapping a fleet or from a battle over %s.': 'Sana %s metal geldi: ya biri %s üzerinde bir filoyu hurdaya çıkardı ya da orada bir savaş oldu.',
    // iOS R 139: iOS "Tebikler", "%syi geçti" (a suffix on a number)
    'Congratulations, %s! Your population now exceeds %s!': 'Tebrikler, %s! Nüfusun artık %s kişiyi aşıyor!',
    // iOS R 140: iOS "demo çıkışı", "tech ücretin" ("tech fee")
    'Your %s tech would have just gone up if you hadn\'t been playing the demo version!': 'Demo sürümünü oynamıyor olsaydın %s teknolojin şimdi yükselmiş olacaktı!',
    // iOS R 141: iOS "gasbetti" (usurped)
    '%s has just taken over for the computer player %s.': '%s az önce bilgisayar oyuncusu %s’{in} yerini aldı.',
    // iOS R 142: iOS "Uzaklık" for Range
    'You now have %s Range Technology (%d).': 'Menzil teknolojin artık %s (%d).',
    // iOS R 143: iOS "Senin    şu anda"
    'You now have %s Speed Technology (%d).': 'Hız teknolojin artık %s (%d).',
    // iOS R 144: "Senin" dropped
    'You now have %s Weapons Technology (%d).': 'Silah teknolojin artık %s (%d).',
    // iOS R 145: iOS "Zırh" for Shield
    'You now have %s Shield Technology (%d).': 'Kalkan teknolojin artık %s (%d).',
    // iOS R 146: iOS "Minyatürleme"
    'You now have %s Miniaturization Technology (%d).': 'Minyatürleştirme teknolojin artık %s (%d).',
    // iOS R 147: glued suffix
    '%s surrenders to you, giving you %s.': '%s sana teslim oluyor ve sana %s’{i} veriyor.',
    // iOS R 148: iOS "teslim olup, sana"
    '%s surrenders to you, giving you %s metal.': '%s sana teslim oluyor ve sana %s metal veriyor.',
    // iOS R 149: iOS "planetini"
    '%s surrenders to you, giving you the planet %s.': '%s sana teslim oluyor ve sana %s gezegenini veriyor.',
    // iOS R 150: iOS "Valdez bir delik yarattı" ("created a hole"), "dökülüyor"
    'Oh no! The Valdez has sprung a leak! The ecology on %s is in shambles! The citizens are suing you for negligence for twice your net worth!': 'Eyvah! Valdez sızdırmaya başladı! %s’{deki} ekoloji darmadağın! Vatandaşlar ihmalden ötürü sana servetinin iki katı tazminat davası açıyor!',
    // iOS R 151: iOS "savaştığı muhabereyi" ("the correspondence they fought")
    'You just watched some of your allies fight a battle at %s.': 'Müttefiklerinden bazılarının %s’{de} savaşmasını izledin.',
    // iOS R 152: iOS "Senin %s filonu" (accusative), "tankerlerin yoktu"
    'There were not enough tankers to fully refuel your fleet of %s at %s.': '{^}%s filonun yakıtını %s’{de} tamamen dolduracak kadar tanker yoktu.',
    // iOS R 153: iOS "tam yakıtlandı"
    'Your fleet of %s is fully refueled and is ready to depart %s for %s.': '{^}%s filonun yakıtı tamamen doldu; %s’{den} %s’{e} kalkmaya hazır.',
    // iOS R 154: iOS "%s halkı" ("the people of %s": the number read as a place), "orbitteki"
    '%s people managed to escape the meteor shower at %s by fleeing to the orbiting colony ship(s).': '{^}%s insan, yörüngedeki koloni gemilerine sığınarak %s’{deki} meteor yağmurundan kaçmayı başardı.',
    // iOS R 155: iOS's credits
    'Designed by Joe Williams.': 'Tasarım: Joe Williams.',
    // iOS R 156: iOS "bize ulaşamıyor" ("can no longer reach us"; the star lost)
    'Your %s can no longer reach %s because some of the ships in the fleet don\'t have enough range.': 'Senin %s artık %s’{e} ulaşamıyor, çünkü filodaki bazı gemilerin menzili yetmiyor.',
    // iOS R 157: iOS "önlemenin hesaplamasını yaptılar"
    'It\'s a miracle! Your scientists have figured out to prevent %s from going supernova.': 'Bir mucize! Bilim insanların %s’{in} süpernova olmasını önlemenin yolunu buldu.',
    // iOS R 158: iOS "dweğil", "teklikesinde"
    'Wow, that\'s weird! %s is no longer red and appears not to be in danger of going nova.': 'Vay, bu çok tuhaf! %s artık kırmızı değil ve nova olma tehlikesi kalmamış görünüyor.',
    // iOS A 0: iOS "networkden"
    'Are you sure you want to leave your current network game?': 'Bu ağ oyunundan çıkmak istediğine emin misin?',
    // iOS A 4: iOS "Vay anasını!" for "Whew!"
    'Whew! It\'s good to see that that clearer heads have prevailed!': 'Oh be! Sağduyunun galip geldiğini görmek ne güzel!',
    // iOS A 5: iOS "her seferinde" (each time) for "per turn"
    'Sorry, but you may only give 3 gifts per turn.': 'Üzgünüm, her sırada yalnızca 3 hediye verebilirsin.',
    // iOS A 6: iOS "gönderilece"
    'Sorry, but there is no one else alive to give or send something to.': 'Üzgünüm, bir şey verebileceğin ya da gönderebileceğin hayatta kimse kalmadı.',
    // iOS A 7: iOS "çürüğe çıkarmak" (to discard as rotten); Scrap is "hurdaya çıkarmak"
    'Do you really want to scrap all existing ships of this type?': 'Bu tipteki bütün gemileri gerçekten hurdaya çıkarmak istiyor musun?',
    // iOS A 8: iOS "Üzgünüm ama, artık … bulmak mümkün değil"
    'Sorry, but the battle record for this battle is no longer available.': 'Üzgünüm, ama bu savaşın kaydı artık yok.',
    // iOS A 9: the double spaces
    'Sorry, but there is already a star with that name. How about a different name?': 'Üzgünüm, bu isimde bir yıldız zaten var. Başka bir isim dener misin?',
    // iOS A 10: iOS "bir bir oyun"
    'Sorry, but spacewardho.net already has a game with that name running. Please try a different name.': 'Üzgünüm, spacewardho.net’te bu isimde bir oyun zaten oynanıyor. Lütfen başka bir isim dene.',
    // iOS A 11: iOS "istediğin galaksinin ismini yaz"
    'Please name your galaxy.': 'Lütfen galaksine bir isim ver.',
    // iOS A 12: iOS "dağıtıcısına bağlanadım" ("distributor"; a typo)
    'Unable to connect to game server at spacewardho.net.': 'spacewardho.net oyun sunucusuna bağlanılamadı.',
    // iOS A 13: iOS "bağlantınız", "İsterseniz" (siz)
    'You have become disconnected from spacewardho.net. Try to reconnect if you want.': 'spacewardho.net ile bağlantın koptu. İstersen yeniden bağlanmayı dene.',
    // iOS A 14: iOS "dağıtıcı", "sonar" for sonra
    'We haven\'t heard from the server in a while. It may be down or your connection may be severed. You may want to quit and then try to reconnect.': 'Bir süredir sunucudan haber alamadık. Sunucu çökmüş ya da bağlantın kopmuş olabilir. Çıkıp yeniden bağlanmayı deneyebilirsin.',
    // iOS A 15: iOS "vasıta" (vehicle), "üretim tezgahların"
    'Sorry, but your assembly lines are full. You must scrap a ship type first before you can design any more ship types.': 'Üzgünüm, ama üretim hatların dolu. Yeni gemi tipleri tasarlayabilmek için önce bir gemi tipini hurdaya çıkarmalısın.',
    // iOS A 16: iOS "muhabere" (correspondence) for muharebe; "ortağının"
    'Sorry, you don\'t have the details about this battle that your ally fought.': 'Üzgünüm, müttefikinin girdiği bu muharebenin ayrıntılarını bilmiyorsun.',
    // iOS A 17: iOS "muhabere"
    'Sorry, but you have no additional information about this battle; all you know is that is was pretty big.': 'Üzgünüm, bu muharebe hakkında başka bilgin yok; tek bildiğin, oldukça büyük olduğu.',
    // iOS A 18: iOS "bilgilerin girilmesi gerek"
    'You must fill in all fields with the proper data before you can register.': 'Kaydolabilmek için bütün alanları doğru bilgilerle doldurmalısın.',
    // iOS A 19: iOS "doğusunu" for doğrusunu
    'The serial number you entered is not valid. Please check that you entered it in correctly.': 'Girdiğin seri numarası geçerli değil. Lütfen doğru girdiğinden emin ol.',
    // iOS A 20: iOS "seri Numara", "ilk önce yazdığın aynı ismi"
    'The serial number you have entered has already been registered under a different login/screen name. Please enter the same name you did the first time.': 'Girdiğin seri numarası başka bir kullanıcı adıyla kaydedilmiş. Lütfen ilk seferde girdiğin ismi gir.',
    // iOS A 21: the double spaces
    'Sorry, but the screen name you have requested has already been taken. Please try a different username.': 'Üzgünüm, istediğin ekran ismini başkası almış. Lütfen başka bir kullanıcı adı dene.',
    // iOS A 22: the double spaces
    'Sorry, but the screen name you have requested is invalid. Please try again.': 'Üzgünüm, istediğin ekran ismi geçersiz. Lütfen yeniden dene.',
    // iOS A 23: iOS "kanıtlayın" ("prove it")
    'Sorry, but Spaceward Ho! cannot connect to the registration server. Please make sure you are connected to the Internet.': 'Üzgünüm, Spaceward Ho! kayıt sunucusuna bağlanamıyor. Lütfen İnternet’e bağlı olduğundan emin ol.',
    // iOS A 24: iOS "telefon edin" (siz)
    'Sorry, but this serial number has been overused in some way and has been locked out. Please call tech support for assistance.': 'Üzgünüm, bu seri numarası bir şekilde aşırı kullanıldığı için kilitlendi. Yardım için lütfen teknik desteği ara.',
    // iOS A 25: iOS "network-ağda", "‘nun"
    'Sorry, but this version of Spaceward Ho! only permits network play.': 'Üzgünüm, Spaceward Ho!’nun bu sürümü yalnızca ağ üzerinden oynanabilir.',
    // iOS A 26: iOS "hata diye cevap veriyor", "‘nun"
    'Sorry, but the Registration server is returning an error. You may be trying to connect with an old version of Spaceward Ho! that is no longer compatible.': 'Üzgünüm, ama kayıt sunucusu hata veriyor. Spaceward Ho!’nun artık uyumlu olmayan eski bir sürümüyle bağlanmaya çalışıyor olabilirsin.',
    // iOS A 27: iOS "eylemsiz kaldınız" (siz), "spacewardho.net."
    'You were idle for 15 minutes and have been disconnected for spacewardho.net.': '15 dakika boyunca hiçbir şey yapmadığın için spacewardho.net ile bağlantın kesildi.',
    // iOS A 28: iOS "muhabere", "bilginiz" (siz), "onu büyük oluşu"
    'Sorry, but you have no detailed information about the battle. All you know was that it was big.': 'Üzgünüm, bu muharebe hakkında ayrıntılı bilgin yok. Tek bildiğin, büyük olduğu.',
    // iOS A 29: iOS "anlıyorsunuz" (siz), "fleet-filo"
    'Sorry, but that fleet doesn\'t have enough fuel to reach the selected destination. You can tell this because of the red fleet line.': 'Üzgünüm, ama bu filonun seçilen hedefe ulaşacak kadar yakıtı yok. Bunu filo çizgisinin kırmızı olmasından anlayabilirsin.',
    // iOS A 30: iOS "seri numara"
    'The serial number you entered is invalid. Please check it and try again.': 'Girdiğin seri numarası geçersiz. Lütfen kontrol edip yeniden dene.',
    // iOS A 31: iOS "‘nin", "tanıtım versiyonuna"
    'Are you sure you want to de-register this copy of Spaceward Ho!? It will revert to demo mode.': 'Spaceward Ho!’nun bu kopyasının kaydını silmek istediğine emin misin? Demo moduna geri dönecek.',
    // iOS A 32: iOS "kapat-quit"
    'This copy has been de-registered. You must quit Spaceward Ho! for this operation to be complete.': 'Bu kopyanın kaydı silindi. İşlemin tamamlanması için Spaceward Ho!’dan çıkmalısın.',
    // iOS A 33: iOS "Ekranı … olmayan bir ekran ile"
    'You are playing with a monitor depth less than millions of colors. Please change to millions if possible, as graphic glitches may otherwise result.': 'Ekranın milyonlarca rengin altında bir renk derinliğinde. Mümkünse milyonlarca renge geç; yoksa grafik bozuklukları olabilir.',
    // iOS A 34: iOS "oyunlari", "ile ile açmazsın"
    'Sorry, but you cannot open saved games in demo mode.': 'Üzgünüm, demo modunda kayıtlı oyunları açamazsın.',
    // iOS A 35: iOS "öncü taşıt-ship"
    'Are you sure you want to build that many scout ships?': 'Bu kadar çok keşif gemisi yapmak istediğine emin misin?',
    // iOS A 36: iOS "öncü yakıt gemisi" (scout fuel ships)
    'Are you sure you want to build that many tankers?': 'Bu kadar çok tanker yapmak istediğine emin misin?',
    // iOS A 37: iOS "Kansas'da"; the "!!" lost
    'Dorothy, I guess that means we\'re not in Kansas anymore!!': 'Dorothy, galiba artık Kansas’ta değiliz!!',
    // iOS A 38: iOS "dağıtıcısının", "yenileme-upgrade"
    'This version of the client is not compatible with the current version of the spacewardho.net server. You will need to upgrade first before you can register.': 'İstemcinin bu sürümü, spacewardho.net sunucusunun şu anki sürümüyle uyumlu değil. Kaydolabilmek için önce güncellemen gerekiyor.',
    // iOS ST 17: iOS "boşaltmak", "gelir getiren" lower-case
    'Do you really want to evacuate %s? It\'s a profitable colony!': '%s’{i} gerçekten tahliye etmek istiyor musun? Kâr getiren bir koloni!',
    // iOS ST 35: iOS "boşaltmak"; Evacuate is "tahliye"
    'Do you really want to evacuate %s?': '%s’{i} gerçekten tahliye etmek istiyor musun?',
    // iOS MS 54: iOS "Maalesef, Bu"
    'Unfortunately, you lost the battle.': 'Maalesef bu savaşı kaybettin.',
    // iOS MS 55: iOS "muhabere ile hiç bilgin yok"
    'You have no information about the battle; your fleet was destroyed too quickly.': 'Muharebe hakkında hiç bilgin yok; filon çok çabuk yok edildi.',
    // iOS MS 56: iOS "muhabere"
    'Cool! Your best buddy won this battle.': 'Güzel! En iyi arkadaşın bu muharebeyi kazandı.',
    // iOS MS 57: iOS "Vay be." for "Darn."; "muhabere"
    'Darn. Your best buddy lost this battle.': 'Tüh. En iyi arkadaşın bu muharebeyi kaybetti.',
    // iOS MS 58: iOS "Muhaber"
    'Your buddy was destroyed too fast and has no information about this battle.': 'Arkadaşın çok çabuk yok edildi ve bu muharebe hakkında hiç bilgisi yok.',
    // iOS MS 74: iOS "İlerdeki oyunlada"
    'You may name a star for use in future games: ': 'İleriki oyunlarda kullanılmak üzere bir yıldıza isim verebilirsin:',
    // iOS MS 103: iOS lost "Here is your armageddon device"
    'Here is your armageddon device. If all living human players turn their devices on, a cataclysm of unprecented proportions will lay waste to half the galaxy...': 'İşte mahşer günü aletin. Hayatta olan bütün insan oyuncular aletlerini açarsa, görülmemiş büyüklükte bir felaket galaksinin yarısını yerle bir edecek...',
    // iOS MS 109: the "!"
    'Congratulations! You have conquered the galaxy!': 'Tebrikler! Galaksiyi fethettin!',
    // iOS MS 110: "sen", the "..."
    'Unfortunately, you have been eliminated from the game...': 'Ne yazık ki oyundan elendin...',
    // iOS MS 123: iOS lost the joke (Hope is the star): "tüm ümidini terketmek"
    'Dost thou truly wish to abandon Hope? All is not yet lost...': 'Demek Hope’u, yani bütün umudunu terk etmek istiyorsun? Henüz her şey kaybolmadı...',
    // iOS H 0: iOS "Uyarı yazıları kaybolmasi", "Son Hak işaretine" for the End Turn button
    'Tap here to make this message go away. Tap on the End Turn button to complete the turn.': 'Bu mesajı kapatmak için buraya dokun. Sırayı tamamlamak için Sırayı Bitir düğmesine dokun.',
    // iOS H 1
    'Fleets appear as dots next to your planets. To move a fleet, select a star. Drag the ship to send it to another star.': 'Filolar, gezegenlerinin yanında nokta olarak görünür. Bir filoyu taşımak için bir yıldız seç. Sonra gemiyi sürükleyip başka bir yıldıza gönder.',
    // iOS H 2: iOS "şeritleri" (ribbons) for bars, "Keyiflen"
    'Play with the spending bars. Conquer the galaxy. Gain ranks to brag to your friends. Enjoy.': 'Harcama çubuklarıyla oyna. Galaksiyi fethet. Arkadaşlarına hava atmak için derece kazan. İyi eğlenceler.',
    // iOS H 3: iOS "Önce hızlı gemiler ateş eder.." (the tech lost)
    'Ships with higher Speed Tech shoot first.': 'Hız teknolojisi yüksek olan gemiler önce ateş eder.',
    // iOS H 4: iOS "gezeğen"
    'Dots by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left.': 'Gezegeninin yanındaki noktalar, onun yörüngesinde gemilerin olduğunu gösterir. Filolar sağda, uydular soldadır.',
    // iOS H 5: iOS "Araştırip", "gezeğenler"
    'Good planets look "prettier" than bad planets when you explore them.': 'İyi gezegenler, keşfettiğinde kötülerden daha “güzel” görünür.',
    // iOS H 6: iOS "Hedef" (target) for Range
    'Range is how far your ships can reach.': 'Menzil, gemilerinin ne kadar uzağa gidebileceğidir.',
    // iOS H 7: iOS "hareket edemez ama,"
    'Satellites can\'t move, but they shoot just as well as any other ship.': 'Uydular hareket edemez, ama her gemi kadar iyi ateş ederler.',
    // iOS H 9: iOS "Gemileri küçültmek … hiç olmazsa az malzeme"
    'Miniaturization makes ships cost more money, but less metal.': 'Minyatürleştirme, gemilerin para maliyetini artırır ama metal maliyetini düşürür.',
    // iOS H 10: iOS "Radical Teck"
    'Radical Tech can have a variety of effects.': 'Radikal teknolojinin çok çeşitli etkileri olabilir.',
    // iOS H 11: iOS "Metallarını"
    'Be careful with your metal--it can easily run out.': 'Metalini dikkatli kullan; kolayca tükenebilir.',
    // iOS H 12: iOS "Filoyu hareketlerini", "hazır olan yıldıza"
    'Touch and drag a fleet back to its current star to cancel a fleet\'s movement.': 'Bir filonun hareketini iptal etmek için ona dokun ve bulunduğu yıldıza geri sürükle.',
    // iOS H 13: iOS "gezeğenleri"
    'Build Satellites to protect vulnerable planets.': 'Savunmasız gezegenleri korumak için uydu yap.',
    // iOS H 14: iOS "yerleşme gemileri ile işgal et" (occupy)
    'Colonize good planets with Colony ships.': 'İyi gezegenleri koloni gemileriyle kolonileştir.',
    // iOS H 15: iOS "Öncü gemilerin", "zırhları"
    'Scout ships have higher Range, but lower Weapons and Shields.': 'Keşif gemilerinin menzili daha yüksektir, ama silahları ve kalkanları daha zayıftır.',
    // iOS H 16: iOS "Senin silahlar", "zırhlarından"
    'If your Weapons are higher than the opponent\'s Shields, you\'ll do lots of damage.': 'Silahların rakibinin kalkanlarından güçlüyse çok hasar verirsin.',
    // iOS H 17: iOS "Senin zırhlar", "sana zarar az olur"
    'If your Shields are higher than the opponents Weapons, he\'ll barely hurt you.': 'Kalkanların rakibinin silahlarından güçlüyse sana pek zarar veremez.',
    // iOS H 18: iOS "teknoloji eskiliğine çözümdür"
    'Lots of ships can make up for having low Technology.': 'Çok sayıda gemi, düşük teknolojiyi telafi edebilir.',
    // iOS H 19: iOS "Her seferinde" (each time) for "every turn"
    'You get money every turn.': 'Her sırada para kazanırsın.',
    // iOS H 20: iOS "İyi uydular" (satellites) for good planets
    'Good planets are close to 1.0 G.': 'İyi gezegenler 1.0 G’ye yakındır.',
    // iOS H 21: iOS "uydular", "72iF (20iC) ye"
    'Good planets are close to 72ºF (20ºC).': 'İyi gezegenler 72°F (20°C) civarındadır.',
    // iOS H 22: iOS "Uydunun iyi oluşu"
    'Each player has a different idea of what a good planet is.': 'Her oyuncunun iyi gezegen anlayışı farklıdır.',
    // iOS H 23: iOS "uydular", "yada", "kar"
    'If a planet is over 2.5 G or below 0.4 G, it will never make a profit.': 'Bir gezegen 2.5 G’nin üstünde ya da 0.4 G’nin altındaysa hiçbir zaman kâr getirmez.',
    // iOS H 24: iOS "uyduları" (and "bad" lost)
    'Abandon bad planets after you strip-mine them.': 'Kötü gezegenlerin metalini sonuna kadar çıkardıktan sonra onları tahliye et.',
    // iOS H 25: iOS "Uyduda dünyay benzer değişiklik"
    'Terraforming improves a planet\'s temperature.': 'Yaşanabilir hâle getirmek, bir gezegenin sıcaklığını iyileştirir.',
    // iOS H 26: iOS "Madende  çıkan metal senin yedek stoklarındır"
    'Mining takes metal from a planet and puts it into your reserve.': 'Madencilik, bir gezegenden metal çıkarıp stoğuna ekler.',
    // iOS H 27: iOS "Tasarruf … yapılır"; Savings is "Birikim", the bar's word
    'Savings puts money away for shipbuilding.': 'Birikim, gemi yapımı için para ayırır.',
    // iOS H 28: iOS "Tasarruf"
    'Savings generates extra income.': 'Birikim ek gelir sağlar.',
    // iOS H 29: iOS "kullnılır"
    'If you go into debt, part of your income goes to pay interest.': 'Borca girersen gelirinin bir kısmı faiz ödemeye gider.',
    // iOS H 30: iOS says something else ("İşleme süreleri uzayabilir")
    'If you have a fleet with fighters and a colony ship, mark the colony ship to arrive late. It\'ll probably survive longer.': 'Savaşçıları ve bir koloni gemisi olan bir filon varsa, koloni gemisini geç varacak şekilde işaretle. Muhtemelen daha uzun hayatta kalır.',
    // iOS H 31: iOS "muhabereden etkisiz kalbilirler"
    'Ships in a fleet that arrive late may miss the worst initial battle.': 'Bir filoda geç varan gemiler ilk ve en kötü çatışmayı kaçırabilir.',
    // iOS H 32: iOS "Hücum gemileri"
    'Offensive ships attack better but defend worse.': 'Saldırgan gemiler daha iyi saldırır ama daha kötü savunur.',
    // iOS H 33: iOS "Savunma gemileri"
    'Defensive ships defend better but attack worse.': 'Savunucu gemiler daha iyi savunur ama daha kötü saldırır.',
    // iOS H 34: iOS "Organize gemilerinin filosuna" ("Organize" left in English)
    'Put multiple ships in the same fleet with Organize Fleets. ': 'Filoları Düzenle ile birden çok gemiyi aynı filoya koy.',
    // iOS H 35: iOS "Organize gemileri"
    'Use the Organize Fleets dialog to split up ship piles.': 'Gemi yığınlarını ayırmak için Filoları Düzenle penceresini kullan.',
    // iOS H 36: iOS "diyoloğun"
    'Touch outside of a dialog to cancel that dialog without making any changes.': 'Bir pencereyi hiçbir değişiklik yapmadan kapatmak için pencerenin dışına dokun.',
    // iOS H 37: iOS "ilk kiş     oyunu kazanır"
    'The first person in the player list is winning.': 'Oyuncu listesindeki ilk kişi önde gidiyor.',
    // iOS H 38: iOS "oto-play"
    'If you\'ve just started, you might want to try turning on auto-play and watching.': 'Yeni başladıysan, otomatik oynamayı açıp izlemeyi deneyebilirsin.',
    // iOS H 39: iOS "ortakların aynı zamanda yıldıza, aynı sırada"
    'If you and your allies arrive at  a star in the same turn, they\'ll fight side-by-side in battle.': 'Sen ve müttefiklerin aynı sırada bir yıldıza varırsanız, savaşta yan yana çarpışırsınız.',
    // iOS H 40: iOS "glaksiyi"
    'Armageddons make the galaxy smaller.': 'Armageddonlar galaksiyi küçültür.',
    // iOS H 41: iOS "şeritleri", "dokunmakla"
    'Technology bars can be adjusted with a touch of your finger.': 'Teknoloji çubukları parmağınla dokunarak ayarlanabilir.',
    // iOS Radical 0
    'Search for more metal on your planets': 'Gezegenlerinde daha fazla metal ara',
    // iOS Radical 1
    'Explore distant stars': 'Uzak yıldızları keşfet',
    // iOS Radical 2
    'Get lots of money immediately': 'Hemen bol para bul',
    // iOS Radical 3
    'Improve mining efficiency': 'Madencilik verimini artır',
    // iOS Radical 4
    'Improve population maximums': 'Azami nüfusu artır',
    // iOS Radical 5
    'Improve terraforming efficiency': 'Yaşanabilir hâle getirme verimini artır',
    // iOS Radical 6
    'Educate battle generals better': 'Muharebe generallerini daha iyi eğit',
    // iOS Radical 7
    'Improve recycling program': 'Geri dönüşüm programını geliştir',
    // iOS Radical 8
    'Improve technology output': 'Teknoloji verimini artır',
    // iOS Radical 9
    'Increase savings interest rate': 'Birikim faizini artır',
    // iOS Radical 10
    'Decrease borrowing interest rate': 'Borç faizini düşür',
    // iOS Radical 11
    'Build a decoy ship': 'Sahte bir gemi yap',
    // iOS Radical 13
    'Steal technology from another player': 'Başka bir oyuncudan teknoloji çal',
    // iOS Radical 14
    'Build a set of ships without development cost': 'Geliştirme maliyeti olmayan bir dizi gemi yap',
    // iOS Radical 15
    'Improve range tech dramatically': 'Menzil teknolojisini büyük ölçüde geliştir',
    // iOS Radical 16
    'Improve speed tech dramatically': 'Hız teknolojisini büyük ölçüde geliştir',
    // iOS Radical 17
    'Improve weapons tech dramatically': 'Silah teknolojisini büyük ölçüde geliştir',
    // iOS Radical 18
    'Improve shields tech dramatically': 'Kalkan teknolojisini büyük ölçüde geliştir',
    // iOS Radical 19
    'Improve mini tech dramatically': 'Minyatürleştirme teknolojisini büyük ölçüde geliştir',
    // ---- the versions' own lines that keep iOS's wording (js/lang-remake.js adapted, own) ----
    // the remake's hint in iOS's words ("yükseklik", "Organize gemileri")
    'Change the battle attitude of ships in your fleets in the Organize Fleets screen.': 'Filolarındaki gemilerin savaş tutumunu Filoları Düzenle ekranında değiştir.',
    // iOS "Uyarı yazıları kaybolmasi" ("warning texts", no genitive, ı written i)
    'Click here to make this message go away. Click on the clock to end your turn.': 'Bu mesajı kapatmak için buraya tıkla. Sıranı bitirmek için saate tıkla.',
    // as above
    'Click here to make this message go away.': 'Bu mesajı kapatmak için buraya tıkla.',
    // iOS "anlıyorsunuz" (siz)
    'Sorry, but that fleet doesn\'t have enough fuel to reach the selected destination. You can tell this because there are no arrows on either end of the dragged line.': 'Üzgünüm, ama bu filonun seçilen hedefe ulaşacak kadar yakıtı yok. Bunu sürüklediğin çizginin iki ucunda da ok olmamasından anlayabilirsin.',
    // iOS "gezeğen"
    'Icons by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left.': 'Gezegeninin yanındaki simgeler, onun yörüngesinde gemilerin olduğunu gösterir. Filolar sağda, uydular soldadır.',
    // iOS "ilk kiş     oyunu kazanır"; ally is "müttefik"
    'The first person in the Enemies and Allies list is winning.': 'Düşmanlar ve Müttefikler listesindeki ilk kişi önde gidiyor.',
    // iOS's "ortak" for ally
    'The Enemy and Allies screen can show who your friends and enemies are. It also so shows who is doing the best.': 'Düşmanlar ve Müttefikler ekranı dostlarının ve düşmanlarının kim olduğunu gösterir. En iyi gidenin kim olduğunu da gösterir.',
    // iOS 11: "lost" left in English, the enemy's losses left out
    '%s destroyed your colony at %s.  You lost %s of your ships. %s lost %s.  You lost %s people.': '%s, %s’{deki} koloniyi yok etti. Gemilerinin %s tanesini kaybettin; %s %s gemi kaybetti. %s insan kaybettin.',
    // iOS 38: the names run together, the enemy's losses left out
    '%s survived an enemy attack from %s.  You lost %s of your ships.  %s lost %s.  You lost %s people.': '%s, %s’{den} gelen bir düşman saldırısından sağ çıktı. Gemilerinin %s tanesini kaybettin; %s %s gemi kaybetti. %s insan kaybettin.',
    // iOS "kandırıcı bir gemi", "ortak"
    'Your ship technicians have designed a decoy ship. It\'s really weak, but it looks menacing and can help keep your allies in line!': 'Gemi teknisyenlerin sahte bir gemi tasarladı. Gerçekten zayıf, ama tehditkâr görünüyor ve müttefiklerini hizada tutmana yardım edebilir!',
    // iOS "senin gezegenlerin yakınında … gözükür"
    'Fleets appear as dots next to your planets. Click one and drag it to send it to another star.': 'Filolar, gezegenlerinin yanında nokta olarak görünür. Birine tıklayıp başka bir yıldıza sürükleyerek gönder.',
    // iOS "şeritleri", "Keyiflen"
    'Play with the spending bars. Conquer the galaxy. Gain ranks to unlock more game options. Enjoy.': 'Harcama çubuklarıyla oyna. Galaksiyi fethet. Daha fazla oyun seçeneğinin kilidini açmak için derece kazan. İyi eğlenceler.',
    // as above
    'Play with the spending bars. Conquer the galaxy. Enjoy.': 'Harcama çubuklarıyla oyna. Galaksiyi fethet. İyi eğlenceler.',
    // iOS "Organize gemilerinde", "çokluklarını"
    'Option-drag in Organize Fleets to split up ship piles.': 'Gemi yığınlarını ayırmak için Filoları Düzenle’de option tuşuyla sürükle.',
    // iOS "İyi uydular" (satellites)
    'Good planets are close to 72 degrees.': 'İyi gezegenler 72 derece civarındadır.',
    // glued suffix, "Senin"
    'Your fleet of %s is waiting to refuel before it can continue on to %s.': '{^}%s filon, %s’{e} devam etmeden önce yakıt almayı bekliyor.',
    'Wow! You won! You have conquered the galaxy. Congratulations!': 'Vay canına! Kazandın! Galaksiyi fethettin. Tebrikler!',
    // iOS "ortak"
    'Wow! You won! You and your allies have conquered the galaxy. Congratulations!': 'Vay canına! Kazandın! Müttefiklerinle birlikte galaksiyi fethettin. Tebrikler!',
    // iOS "Şu anda"
    '%s have just won the game.': '%s oyunu kazandı.',
    // iOS "O, O!"
    'Uh-oh!  Having to borrow more ship money to pay all your interest!': 'Eyvah! Bütün faizini ödeyebilmek için gemi parasından yine borç almak zorundasın!',
    // glued suffix
    'Warning!  Ship money is being used to support %s.': 'Dikkat! %s’{i} desteklemek için gemi paran kullanılıyor.',
    // iOS "%dyi kaybetti"
    'You won a battle at %s. You lost %d of your ships. %s lost %d.': '%s’{de} bir savaş kazandın. Gemilerinin %d tanesini kaybettin. %s %d gemi kaybetti.',
    // as above
    'You lost a battle at %s. You lost %d of your ships. %s lost %d.': '%s’{de} bir savaş kaybettin. Gemilerinin %d tanesini kaybettin. %s %d gemi kaybetti.',
    // glued suffix
    'Your %s can no longer reach %s.': 'Senin %s artık %s’{e} ulaşamıyor.',
    'You just received %s metal from someone scrapping a fleet over %s.': 'Sana %s metal geldi: biri %s üzerinde bir filoyu hurdaya çıkardı.',
    // the space
    '%s says , "#!$*@%$&!"': '%s, “#!$*@%$&!” diyor.',
    // iOS's word order ("dedin %sye")
    'You said "!$@*$&@!" to %s.': '%s’{e} “!$@*$&@!” dedin.',
    // ---- Mac 1.2's, DOS 2.0's and Mac 2.0.1's lines (Breve, chunk 4; js/languages.js turkish20) ----
    // adapted from iOS 10 ("novaya gitti": "went to the nova")
    '%s has gone nova. All inhabitants were killed.': '%s nova oldu. Bütün sakinleri öldü.',
    // adapted from iOS 80 ("senin %sdeki", "mahvetti"), as its patch
    '%s destroyed your colony at %s.': '%s, %s’{deki} kolonini yok etti.',
    'A meteor shower destroyed your colony at %s.': 'Bir meteor yağmuru %s’{deki} kolonini yok etti.',
    // adapted from iOS 33 ("inceledin": examined)
    'You have explored %s. Gravity: %s. Temp: %s. Metal: %s.': '%s’{i} keşfettin. Yer çekimi: %s. Sıcaklık: %s. Metal: %s.',
    // adapted from iOS 71 ("metalı", "won" the metal), as its patch
    'You have recovered %s metal from the battle at %s.': '%2$s’{deki} savaştan %1$s metal kurtardın.',
    // adapted from iOS 57 and 59 ("dedin ki", "severim"; 59's "senin malındır" says the star is the other's), as their patch
    'You sent a message to %s saying you like %s.': '%s’{e} bir mesaj gönderip %s’{i} beğendiğini söyledin.',
    'You sent a message to %s saying you don’t like %s.': '%s’{e} bir mesaj gönderip %s’{i} beğenmediğini söyledin.',
    'You sent a message to %s saying you own %s.': '%s’{e} bir mesaj gönderip %s’{in} senin olduğunu söyledin.',
    // the remake's own lines with glued suffixes ("%sde", "%syi"), and iOS 41's "sev-" for the patch's "beğen-"
    '%s sends a message saying he likes %s.': '%s, %s’{i} beğendiğini bildiren bir mesaj gönderdi.',
    '%s sends a message saying he doesn’t like %s.': '%s, %s’{i} beğenmediğini bildiren bir mesaj gönderdi.',
    '%s sends a message saying he owns %s.': '%s, %s’{in} kendisinin olduğunu bildiren bir mesaj gönderdi.',
    '%s sends a message saying she likes %s.': '%s, %s’{i} beğendiğini bildiren bir mesaj gönderdi.',
    '%s sends a message saying she doesn’t like %s.': '%s, %s’{i} beğenmediğini bildiren bir mesaj gönderdi.',
    '%s sends a message saying she owns %s.': '%s, %s’{in} kendisinin olduğunu bildiren bir mesaj gönderdi.',
    'You have ships queued at %s but have no money allocated for shipbuilding.': '%s’{de} sırada bekleyen gemilerin var, ama gemi yapımına hiç para ayırmadın.',
    'Built %s at %s.': '%2$s’{de} %1$s yapıldı.',
    'You are spending money on shipbuilding at %s but have no ships queued.': '%s’{de} gemi yapımına para harcıyorsun, ama sırada hiç gemi yok.',
    'You are spending money on shipbuilding at %s but have no metal available.': '%s’{de} gemi yapımına para harcıyorsun, ama kullanabileceğin hiç metal yok.',
    // ("hücum", iOS's, as the patch's "saldırı" in iOS 38)
    '%s successfully defended itself against an enemy attack from %s.': '%s, %s’{den} gelen bir düşman saldırısına karşı kendini başarıyla savundu.',
    // Fix Spending (Mac 2.0.1's lines, 3.0.1's too): glued suffixes; Abandon is the patch's "tahliye" (Evacuate)
    'You were overspending at %s. The problem has been fixed.': '%s’{de} fazla harcıyordun. Sorun giderildi.',
    'You were underspending at %s. The problem has been fixed.': '%s’{de} az harcıyordun. Sorun giderildi.',
    'You’re abandoning %s.': '%s’{i} tahliye ediyorsun.',
    'You are abandoning %s.': '%s’{i} tahliye ediyorsun.',
  },
  // the patch's words for iOS's lists, by list and index (js/languages.js LP): the class names (after a
  // number the singular, as Turkish has it), the tech names, the decoy and the reports' fillings, the battle
  // window's templates; laid over iOS's lists when the game has the patch on
  patchLists: {
    'Ship Class Names': { 0: 'Keşif Gemisi', 1: 'Dretnot', 2: 'Savaşçı', 3: 'Tanker', 4: 'Koloni Gemisi', 5: 'Uydu', 6: 'Biyolojik', 7: 'Keşif Gemileri', 8: 'Dretnotlar', 9: 'Savaşçılar', 10: 'Tankerler', 11: 'Koloni Gemileri', 12: 'Uydular', 13: 'Biyolojikler' },
    'Misc Strings': { 1: 'Sahte Gemi', 38: 'Düşmanların', 39: ' müttefiklerinle birlikte' },
    'sprintf Templates': { 9: '%s öldü', 11: '%d ölü %s', 12: '%s’{deki} muharebeyi gözden geçir (%d)', 14: '%d/%d %s' },
    'Range Tech Strings': { 6: 'Depoları Ağzına Kadar Doldurmak', 7: 'Füzyon Yığını', 8: 'Manyetohidrodinamik Güç', 9: 'Allotropik Demir', 11: 'Kuantum Enerji Deposu', 12: 'Tekillik', 14: 'Müon Merdiveni', 15: 'Gidiş ve Dönüş', 16: 'Kuark Öğütücü', 17: 'Pulsar Işıması', 19: 'Yıldız Koşumu' },
    'Speed Tech Strings': { 3: 'Kütleçekim Sapanı', 4: 'Füzyon Boşaltma Motoru', 5: 'Görelilik Motoru', 6: 'Işık Ötesi', 8: 'Yarık Motoru', 9: 'Hawking İtki Sistemi', 10: 'Hiper Yarık Motoru', 11: 'PowerPC™', 12: 'Yarık Ötesi Hiper Motor', 13: 'Hawking Hiper Ötesi Motoru', 14: 'Zaman Bükülmesi', 15: 'Kuantum Sürekliliği', 16: 'Zaten Orada', 17: 'Speedy Gonzalez™', 18: 'Işınlanma', 19: 'Dün Motoru' },
    'Weapons Tech Strings': { 5: 'Maser', 8: 'Enerji Topu', 9: 'Nükleer Manyetik Rezonans', 10: 'Faz Bozucu', 11: 'Odaklanmış Kuark Işını', 12: 'Sert Piksel', 13: 'Takyon Topu', 14: '+5 Paslanmaz Vorpal', 15: 'Hiperuzay Atımı', 16: 'Delta Parçacık Akımı', 17: 'Nötron Sıkıştırması', 19: 'Galaktik Bozulma', 20: 'Gelişmiş Uzay-Zaman Yok Edimi' },
    'Shield Tech Strings': { 2: 'Zırhlı Gövde', 3: 'Kütle İtici', 6: 'Enerji Bağlı Zırh', 7: 'Anti-Enerji', 8: 'Kuark Kabuğu', 10: 'Enerji Yutucu', 12: 'Holografik Aldatmaca', 13: 'Durağanlık Titremesi', 18: '+5 Kutsanmış Plaka Zırh' },
    'Mini Tech Strings': { 1: 'Entegre Çip', 3: 'VLSI', 6: 'Nanoskopik', 7: 'Gelişmiş Nanoskopik', 8: 'Gerçekten İnanılmaz Küçük', 9: 'Sarı Puantiyeli Bikini', 12: 'Kuark', 13: 'Alt-Kuark', 14: 'Mikro-Kuark', 15: 'Nano-Kuark', 16: 'Gelişmiş Nano-Kuark', 18: 'Kuantum Süpersicim', 19: 'Alt-Kuantum Süpersicim' },
  },
  patchWords: {
    // the remake's Send Message groups in iOS's words ("ortak", "en iyi oyun arkadaşı")
    'Your Allies': 'Müttefiklerin',
    'Your Buddies': 'En iyi arkadaşların',
    // iOS's report 85 filled with the English tech kind ("Senin Speed teknolojin"): the patch's tech names
    Range: 'Menzil', Speed: 'Hız', Weapons: 'Silah', Shields: 'Kalkan', Miniaturization: 'Minyatürleştirme',
  },
  // adapted from official: a line whose English differs a little from one an
  // official translation has (a word, a clause, a number, a name): that
  // translation, edited as little as the difference needs. [the translation,
  // the official line's English] (tools/lang-test.js --adapted)
  adapted: {
    // ---- 5.0.5's lines that iOS words for its touch, and the Palm's ----
    'Click here to make this message go away. Click on the clock to end your turn.': ['Uyarı yazıları kaybolmasi için buraya tıkla. Saate tıklarsan sıranı bitirebilirsin.', 'Tap here to make this message go away. Tap on the End Turn button to complete the turn.'],
    'Fleets appear as dots next to your planets. Click one and drag it to send it to another star.': ['Filolar senin gezegenlerin yakınında nokta olarak gözükür. Başka bir yıldıza göndermek için birine tıkla ve sürükle.', 'Fleets appear as dots next to your planets. To move a fleet, select a star. Drag the ship to send it to another star.'],
    'Play with the spending bars. Conquer the galaxy. Gain ranks to unlock more game options. Enjoy.': ['Harcama şeritleri ile oyna. Galaksiyi fethet. Yeni oyun seçeneklerini açacağın derecelere ulaş. Keyiflen.', 'Play with the spending bars. Conquer the galaxy. Gain ranks to brag to your friends. Enjoy.'],
    'Option-drag in Organize Fleets to split up ship piles.': ['Gemi çokluklarını ayırmak için Organize gemilerinde option tuşu ile sürükle.', 'Use the Organize Fleets dialog to split up ship piles.'],
    'Sorry, but that fleet doesn\'t have enough fuel to reach the selected destination. You can tell this because there are no arrows on either end of the dragged line.': ['Üzgünüm, filonun hedefe kadar gidecek yakıtı yok. Bunu anlıyorsunuz çünkü çekilen çizginin iki ucunda da ok yok.', 'Sorry, but that fleet doesn\'t have enough fuel to reach the selected destination. You can tell this because of the red fleet line.'],
    'Icons by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left.': ['Gezeğenlerinin yakınındaki simgeler, senin gemilerin gezeğen çevresindeki yörüngelerini gösterir. Filolar sağda, uydular da soldadır.', 'Dots by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left.'],
    'The first person in the Enemies and Allies list is winning.': ['Düşmanlar ve Ortaklar listesindeki ilk kiş     oyunu kazanır.', 'The first person in the player list is winning.'],
    // ---- 4.0.5 (Windows and Mac) and 3.0.1 ----
    '%s destroyed your colony at %s.  You lost %s of your ships. %s lost %s.  You lost %s people.': ['%1$s senin koloniyi %2$s de mahvetti. Sen gemilerinin  lost%3$s miktarını kaybettin. Sen %6$s insan kaybettin.', '%s destroyed your colony at %s. You %slost %d of your ships. %s lost %d. You lost %s people.'],
    '%s survived an enemy attack from %s.  You lost %s of your ships.  %s lost %s.  You lost %s people.': ['%1$s%2$sden gelen bir hücumdan sağlam çıktı. Sen gemilerinin %3$s tanesini kaybettin. Sen %6$s tane insan kaybettin.', '%s survived an attack from %s. You %slost %d of your ships; %s lost %d. You lost %s people.'],
    'Play with the spending bars. Conquer the galaxy. Enjoy.': ['Harcama şeritleri ile oyna. Galaksiyi fethet. Keyiflen.', 'Play with the spending bars. Conquer the galaxy. Gain ranks to brag to your friends. Enjoy.'],
    'Click here to make this message go away.': ['Uyarı yazıları kaybolmasi için buraya tıkla.', 'Tap here to make this message go away. Tap on the End Turn button to complete the turn.'],
    'Good planets are close to 72 degrees.': ['İyi uydular 72 dereceye yakındır.', 'Good planets are close to 72°F (20°C).'],
    'Your fleet of %s is waiting to refuel before it can continue on to %s.': ['Senin %s filon, %sye devam etmeden önce yakıt almak için bekliyor.', 'Your %s is waiting to refuel before it can continue on to %s.'],
    'Wow! You won! You have conquered the galaxy. Congratulations!': ['Vay anasını! Kazandın! Galaksiyi fethettin. Tebrikler!', 'Congratulations! You have conquered the galaxy!'],
    'Wow! You won! You and your allies have conquered the galaxy. Congratulations!': ['Vay anasını! Kazandın! Sen ve ortakların galaksiyi fethettiniz. Tebrikler!', 'Congratulations! You have conquered the galaxy!'],
    '%s have just won the game.': ['Şu anda %s oyunu kazandı.', '%s has just won the game.'],
    'Uh-oh!  Having to borrow more ship money to pay all your interest!': ['O, O! Faizlerini ödeyebilmek için gemi parasından tekrar borç almak zorundasın.', 'Uh-oh! Having to borrow more to pay all your interest!'],
    'Warning!  Ship money is being used to support %s.': ['Dikkat! %syi desteklemek için gemi paran kullanılıyor.', 'Warning! Savings is being used to support %s.'],
    'You won a battle at %s. You lost %d of your ships. %s lost %d.': ['Sen %sde savaş kazandın. Sen gemilerinin %d tanesini kaybettin. %s %dyi kaybetti.', 'You %swon a battle at %s. You %slost %d of your ships. %s lost %d.'],
    'You lost a battle at %s. You lost %d of your ships. %s lost %d.': ['Sen %sde savaş kaybettin. Sen gemilerinin %d tanesini kaybettin. %s %dyi kaybetti.', 'You %slost a battle at %s. You %slost %d of your ships. %s lost %d.'],
    'Your %s can no longer reach %s.': ['Senin %s artık %sye ulaşamıyor.', 'Your %s can no longer reach %s because some of the ships in the fleet don\'t have enough range.'],
    'You just received %s metal from someone scrapping a fleet over %s.': ['Sana %s metal geldi; %s üzerinde filosunu hurdaya çıkaran birinden.', 'You just received %s metal from someone scrapping a fleet or from a battle over %s.'],
    '%s says , "#!$*@%$&!"': ['%s,"#!$*@%$&!" diyor.', '%s says, “#!$@*$&@•™!”'],
    'You said "!$@*$&@!" to %s.': ['Sen "!$@*$&@!" dedin %sye.', 'You said “#!$@*$&@•™!” to %s.'],
    // ---- Mac 1.2, DOS 2.0 and Mac 2.0.1 (js/languages.js turkish20) ----
    '%s has gone nova. All inhabitants were killed.': ['%s novaya gitti. Bütün sakinleri öldü.', '%s has gone nova.'],
    '%s destroyed your colony at %s.': ['%s, senin %sdeki kolonini mahvetti.', 'The meteor shower destroyed your colony at %s.'],
    'A meteor shower destroyed your colony at %s.': ['Bir meteor yağmuru, senin %sdeki kolonini mahvetti.', 'The meteor shower destroyed your colony at %s.'],
    'You have explored %s. Gravity: %s. Temp: %s. Metal: %s.': ['Sen %syi inceledin.  Yer çekimi: %s.  Sıcaklık: %s. Metal: %s.', 'You have explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s.'],
    'You have recovered %s metal from the battle at %s.': ['Sen %s kadar metalı, %sdeki savaşta kazandın.', 'You recovered %s metal from the battle at %s.'],
    'You sent a message to %s saying you like %s.': ['Sen %sye mesaj gönderip dedin ki, %syi seviyorsun.', 'You told %s that you like %s.'],
    'You sent a message to %s saying you don’t like %s.': ['Sen %sye mesaj gönderip dedin ki, %syi sevmiyorsun.', 'You told %s that you like %s.'],
    'You sent a message to %s saying you own %s.': ['Sen %sye mesaj gönderip dedin ki,  %s senin malındır.', 'You told %s that you own %s.'],
  },
  own: {
    // ---- 5.0.5 (and the Palm) ----
    'Click and hold for a second to cancel a fleet\'s movement.': 'Filonun hareketini iptal etmek için ona tıkla ve bir saniye basılı tut.',
    'There\'s a contextual menu in the map window for convenience.': 'Kolaylık olsun diye harita penceresinde bir bağlam menüsü var.',
    'Hold down the option key and click planets to specify your fleet\'s path more exactly.': 'Filonun yolunu daha kesin belirlemek için option tuşunu basılı tut ve gezegenlere tıkla.',
    'Use the graph to see how well you\'re doing technology-wise vs. the other players.': 'Teknolojide öteki oyunculara göre ne durumda olduğunu görmek için grafiği kullan.',
    'Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!': 'Ship’i terk etmek mi? Gemiyi terk edin! Herkes gemiyi terk etsin! Önce kadınlar ve çocuklar!',
    'Year %d. Nothing much happened.': 'Yıl %d. Pek bir şey olmadı.',
    // ---- the Palm (5.0's code) ----
    'To cancel a fleet’s movement, make sure that fleet is selected in the Ship Info window and click the origin planet. You can also use the ‘Cancel Fleet Trip’ menu item in the ‘Ships’ menu.':
      'Bir filonun hareketini iptal etmek için, o filonun Ship Info penceresinde seçili olduğuna emin ol ve çıkış gezegenine tıkla. \'Ships\' menüsündeki \'Cancel Fleet Trip\' komutunu da kullanabilirsin.',
    'There are menus and menu shortcuts in the Galaxy screen for your convenience.': 'Kolaylık olsun diye Galaksi ekranında menüler ve menü kısayolları var.',
    'The computer will help choose the best path possible for your fleets.': 'Bilgisayar, filoların için mümkün olan en iyi yolu seçmene yardım eder.',
    'Change the battle attitude of ships in your fleets in the Organize Fleets screen.': 'Filolarındaki gemilerin savaş yüksekliğini Organize gemileri ekranında değiştir.',
    'The Enemy and Allies screen can show who your friends and enemies are. It also so shows who is doing the best.': 'Düşmanlar ve Ortaklar ekranı dostlarının ve düşmanlarının kim olduğunu gösterir. En iyi gidenin kim olduğunu da gösterir.',
    'Click the G button to see the Galaxy, click the $ button to see the Spendingscreen and click the H button to see these messages.': 'Galaksiyi görmek için G düğmesine, Harcama ekranı için $ düğmesine, bu mesajları görmek için de H düğmesine tıkla.',
    'Fleets appear as icons next to your planets. To send a fleet to another planet, select it and then drag it to the new planet.': 'Filolar senin gezegenlerinin yakınında simge olarak gözükür. Bir filoyu başka bir gezegene göndermek için onu seç ve yeni gezegene sürükle.',
    'Palm OS version by Christopher Cotton and Steve Orens of Mobilefreon (tm)': 'Palm OS sürümü: Christopher Cotton ve Steve Orens, Mobilefreon (tm)',
    'Your ship technicians have designed a decoy ship. It\'s really weak, but it looks menacing and can help keep your allies in line!': 'Senin gemi teknisyenlerin kandırıcı bir gemi tasarladı. Gerçekten zayıf, fakat tehditkâr görünüyor ve ortaklarını hizada tutmana yardım edebilir!',
    // ---- 4.0.5 (Windows and Mac) and 3.0.1 ----
    'A dot by a planet means you have ships in orbit there.': 'Bir gezegenin yanındaki nokta, orada yörüngede gemilerin olduğunu gösterir.',
    'Click and Drag from one star to another to move fleets.': 'Filoları hareket ettirmek için bir yıldızdan ötekine tıkla ve sürükle.',
    'Ship savings puts money away for shipbuilding.': 'Gemi tasarrufu, gemi yapımı için para ayırır.',
    // (the credits: iOS's Turkish has them in English)
    'Spaceward Ho! Version 4.0.5 by Peter Commons.': 'Spaceward Ho! Sürüm 4.0.5, yazan: Peter Commons.',
    'Spaceward Ho! Version 4.0.3 by Peter Commons.': 'Spaceward Ho! Sürüm 4.0.3, yazan: Peter Commons.',
    'Spaceward Ho! Version 3.0.1 by Peter Commons.': 'Spaceward Ho! Sürüm 3.0.1, yazan: Peter Commons.',
    'Star names must be 2 to 7 characters long.': 'Yıldız isimleri 2 ile 7 harf arasında olmalı.',
    'New Star Name:': 'Yeni Yıldız İsmi:',
    '(If you’d rather not name a star, click “OK” with the name blank.)': '(Bir yıldıza isim vermek istemiyorsan, ismi boş bırakıp “OK” düğmesine tıkla.)',
    'Sorry, there’s already a star named  “%s.” Please pick another name.': 'Üzgünüm, “%s” isimli bir yıldız zaten var. Lütfen başka bir isim seç.',
    // Fix Spending (3.0.1, Mac 2.0.1's lines)
    'You have no spending problems.': 'Harcama sorunun yok.',
    'You were overspending at %s. The problem has been fixed.': '%sde fazla harcıyordun. Sorun giderildi.',
    'You were underspending at %s. The problem has been fixed.': '%sde az harcıyordun. Sorun giderildi.',
    'You’re abandoning %s.': '%syi terk ediyorsun.',
    'Congratulations!  You won the game.  Game difficulty rating was %s.': 'Tebrikler! Oyunu kazandın. Oyunun zorluk derecesi %s idi.',
    'Congratulations! You won the game.': 'Tebrikler! Oyunu kazandın.',
    'Sorry, but you have that fleet marked for the scrap heap.  it’s not going anywhere.': 'Üzgünüm, o filoyu hurdaya ayırdın. Hiçbir yere gitmiyor.',
    'You won the game, so you get to name a star.': 'Oyunu kazandın, bu yüzden bir yıldıza isim verebilirsin.',
    'Sorry, there’s already a star named “%s.”  Please pick another name.': 'Üzgünüm, “%s” isimli bir yıldız zaten var. Lütfen başka bir isim seç.',
    'Do you really want to launch the armageddon device?  It\'ll blow up half of the galaxy!': 'Gerçekten mahşer günü aletini başlatmak istiyor musun? Galaksinin yarısını havaya uçuracak!',
    'Do you really want to launch the armageddon device?  Isn\'t life too short as it is?': 'Gerçekten mahşer günü aletini başlatmak istiyor musun? Hayat zaten yeterince kısa değil mi?',
    // 3.0.1's Armageddon buttons (DITL 3250-3255), the remake's words
    'Party Pooper': 'Oyunbozan',
    'Abort': 'Vazgeç',
    'Not Unsure?': 'Kararsız Değil?',
    'Unsure?': 'Kararsız?',
    'Power': 'Güç',
    'Yeah': 'Evet',
    'Go For It!': 'Haydi Bakalım!',
    'Maybe Not': 'Belki Değil',
    'That’s It!': 'İşte Bu!',
    'Never mind': 'Boş Ver',
    'Do you really want to launch the armageddon device?  I mean, you\'d probably win anyway; why take the chance?': 'Gerçekten mahşer günü aletini başlatmak istiyor musun? Yani, herhalde nasılsa kazanırsın; ne diye riske giriyorsun?',
    'Do you really want to launch the armageddon device?  Doing so decreases the difficulty score by half!': 'Gerçekten mahşer günü aletini başlatmak istiyor musun? Bunu yaparsan oyunun zorluk puanı yarıya iner!',
    'Do you really want to launch the armageddon device?  Odds are you\'ll blow yourself up!': 'Gerçekten mahşer günü aletini başlatmak istiyor musun? Büyük ihtimalle kendini de havaya uçurursun!',
    'Are you just doing this because you think you\'ll win but it\'s really late and so you want to go to bed?': 'Bunu sadece kazanacağını düşündüğün, ama saat çok geç olduğu ve yatmak istediğin için mi yapıyorsun?',
    'Aren\'t you sure you really don\'t want to have nothing to do with not launching the armageddon device?': 'Mahşer günü aletini başlatmamakla hiçbir ilgin olmasını gerçekten istemediğinden emin değil misin?',
    'You\'re just doing this \'cause you enjoy the ultimate feeling of power, aren\'t you???': 'Bunu sadece mutlak gücün tadını çıkardığın için yapıyorsun, değil mi???',
    'If you do this, everyone will hate you!  It\'s such a sissy way to try to win, anyway.': 'Bunu yaparsan herkes senden nefret edecek! Zaten bu, kazanmanın çok korkakça bir yolu.',
    'Now look, this is NO laughing matter.  You just might get yourself killed!': 'Bak, bu gülünecek bir şey DEĞİL. Kendini öldürtebilirsin!',
    'I get it.  You\'re losing big time and this is the only way you could possibly win!  That\'s it isn\'t it?': 'Anladım. Fena halde kaybediyorsun ve kazanmanın tek yolu bu! Öyle değil mi?',
    // ---- Mac 1.2, DOS 2.0 and Mac 2.0.1 (js/languages.js turkish20; iOS's words: "gemi yapımı" H 27, "hücum" R 38, the glued suffixes) ----
    'Spaceward Ho! Version 2.0.1 by Peter Commons.': 'Spaceward Ho! Sürüm 2.0.1, yazan: Peter Commons.',
    'Spaceward Ho! Version 1.2 by Peter Commons.': 'Spaceward Ho! Sürüm 1.2, yazan: Peter Commons.',
    // (iOS's Turkish has its credit line in English, with a stray "!"; the patch's words)
    'Artwork by Howard Vives.': 'Grafikler: Howard Vives.',
    'The game has been updated to the year %d.': 'Oyun %d yılına güncellendi.',
    'You have ships queued at %s but have no money allocated for shipbuilding.': '%sde sırada bekleyen gemilerin var, ama gemi yapımına hiç para ayırmadın.',
    'Built %s at %s.': '%2$sde %1$s yapıldı.',
    'You are spending money on shipbuilding at %s but have no ships queued.': '%sde gemi yapımına para harcıyorsun, ama sırada hiç gemi yok.',
    'You are spending money on shipbuilding at %s but have no metal available.': '%sde gemi yapımına para harcıyorsun, ama kullanabileceğin hiç metal yok.',
    '%s successfully defended itself against an enemy attack from %s.': '%s, %sden gelen bir düşman hücumuna karşı kendini başarıyla savundu.',
    'Congratulations! You have just won the game.': 'Tebrikler! Oyunu kazandın.',
    // the messages received (Turkish has no "he" and "she": one line for both)
    '%s sends a message saying he likes %s.': '%s, %syi sevdiğini bildiren bir mesaj gönderdi.',
    '%s sends a message saying he doesn’t like %s.': '%s, %syi sevmediğini bildiren bir mesaj gönderdi.',
    '%s sends a message saying he owns %s.': '%s, %sye sahip olduğunu bildiren bir mesaj gönderdi.',
    '%s sends a message saying she likes %s.': '%s, %syi sevdiğini bildiren bir mesaj gönderdi.',
    '%s sends a message saying she doesn’t like %s.': '%s, %syi sevmediğini bildiren bir mesaj gönderdi.',
    '%s sends a message saying she owns %s.': '%s, %sye sahip olduğunu bildiren bir mesaj gönderdi.',
    // Name a Star (Mac 1.2's and 2.0.1's rule, DOS 2.0's "taken") and DOS 2.0's Fix Spending
    'Star names must be 4 to 7 characters long.': 'Yıldız isimleri 4 ile 7 harf arasında olmalı.',
    'Sorry, there’s already a star named ‘%s’.  Please pick another name.': 'Üzgünüm, “%s” isimli bir yıldız zaten var. Lütfen başka bir isim seç.',
    'You are abandoning %s.': '%syi terk ediyorsun.',
  },
  words: {
    // 3.0.1's and 4.0.5's Send Message groups (iOS's "ortak", "en iyi oyun arkadaşı")
    Everyone: 'Herkes', 'Your Allies': 'Ortakların', 'Your Buddies': 'En iyi oyun arkadaşların',
  },
  // Mac 1.2's, DOS 2.0's and Mac 2.0.1's own (js/languages.js turkish20): two fillings (the patch's
  // meteor report, fix 'meteorReport'; a fleet scrapped "at hyperspace", fix 'scrapLimbo'), the battle
  // window's two lines for a fleet seen to nothing (iOS's Misc Strings 55 "hiç bilgin yok",
  // "mahvedildi") and Mac 2.0.1's Force End Turn question (iOS's "sıra")
  win20: {
    words: { 'A meteor shower': 'Bir meteor yağmuru', hyperspace: 'hiperuzay' },
    battleLines: { noInfo: 'Hiç bilgin yok.', destroyed: 'Hemen mahvedildin.' },
    forceEndTurn: '%s, oyunculardan %s tanesi (toplam %s) henüz sırasını bitirmedi.\n\nSırayı gerçekten zorla bitirmek mi istiyorsun, yoksa bitirmelerini mi bekleyeceksin?',
  },
},
// =====================================================================
// German: forward from the German DOS 2.0 (HO.PRS): "Sie", the reports in
// the present tense ("Ihre Flotte von %s erreicht %s."), its words for the
// game's things (Reichweitentech, Kolonieschiff, Funkspruch, verschrotten,
// Meteoritenschauer), and its "Glückwunsch!"
// =====================================================================
de: {
  over: {},
  // adapted from official: a line whose English differs a little from one an
  // official translation has (a word, a clause, a number, a name): that
  // translation, edited as little as the difference needs. [the translation,
  // the official line's English] (tools/lang-test.js --adapted)
  adapted: {
    // ---- 5.0.5's reports (the Palm's, iOS's) that say a little more or less than a 2.0 line ----
    'Spaceward Ho! by Peter Commons.': ['Spaceward Ho! von Peter Commons.', 'Spaceward Ho! Version 2.0.1 by Peter Commons.'],
    'Spaceward Ho! DEMO by Peter Commons.': ['Spaceward Ho! DEMO von Peter Commons.', 'Spaceward Ho! Version 2.0.1 by Peter Commons.'],
    'Artwork by Howard Vives and Bob Van de walle.': ['Grafiken von Howard Vives und Bob Van de walle.', 'Artwork by Howard Vives.'],
    'You have evacuated %s.': ['Sie räumen %s.', 'You have abandoned %s.'],
    '%s has gone nova.': ['%s wird zur Nova.', '%s has gone nova. All inhabitants were killed.'],
    '%s’s fleet of %s has arrived at %s.': ['Die Flotte von %s (%s) erreicht %s.', 'Your fleet of %s has arrived at %s.'],
    '%s has run out of metal. You should probably evacuate it.': ['Auf %s gibt es kein Metall mehr. Sie sollten den Ort räumen.', '%s has run out of metal. You should probably abandon it.'],
    'You %swon a battle at %s. You %slost %d of your ships. %s lost %d.': ['Sie%s gewinnen einen Kampf bei %s. Sie%s verlieren %d Schiffe. %s verliert %d.', 'You won a battle at %s. You lost %d of your ships. %s lost %d.'],
    'You %slost a battle at %s. You %slost %d of your ships. %s lost %d.': ['Sie%s verlieren einen Kampf bei %s. Sie%s verlieren %d Schiffe. %s verliert %d.', 'You lost a battle at %s. You lost %d of your ships. %s lost %d.'],
    'You told %s that you don’t want %s.': ['Sie senden einen Funkspruch an %s: Sie wollen %s nicht.', 'You sent a message to %s saying you don’t like %s.'],
    'You told %s that you like %s.': ['Sie senden einen Funkspruch an %s: Sie mögen %s.', 'You sent a message to %s saying you like %s.'],
    'You told %s that you own %s.': ['Sie senden einen Funkspruch an %s: Sie besitzen %s.', 'You sent a message to %s saying you own %s.'],
    'You recovered %s metal from the battle at %s.': ['Sie gewinnen %s Metall aus dem Kampf bei %s.', 'You have recovered %s metal from the battle at %s.'],
    'Your ally %s has just won the game.': ['Ihr Verbündeter %s gewinnt das Spiel.', '%s has just won the game.'],
    'The meteor shower destroyed your colony at %s.': ['Der Meteoritenschauer besiegt Ihre Kolonie auf %s.', '%s destroyed your colony at %s.'],
    // ---- 4.0.5 (Windows and Mac) and 3.0.1 ----
    'Congratulations!  You won the game.  Game difficulty rating was %s.': ['Glückwunsch! Sie haben das Spiel gewonnen. Die Schwierigkeit des Spiels war %s.', 'Congratulations! You have just won the game.'],
    'Congratulations! You won the game.': ['Glückwunsch! Sie haben das Spiel gewonnen.', 'Congratulations! You have just won the game.'],
    'Spaceward Ho! Version 4.0.5 by Peter Commons.': ['Spaceward Ho! Version 4.0.5 von Peter Commons.', 'Spaceward Ho! Version 2.0.1 by Peter Commons.'],
    'Spaceward Ho! Version 4.0.3 by Peter Commons.': ['Spaceward Ho! Version 4.0.3 von Peter Commons.', 'Spaceward Ho! Version 2.0.1 by Peter Commons.'],
    'Spaceward Ho! Version 3.0.1 by Peter Commons.': ['Spaceward Ho! Version 3.0.1 von Peter Commons.', 'Spaceward Ho! Version 2.0.1 by Peter Commons.'],
    '%s have just won the game.': ['%s gewinnen das Spiel.', '%s has just won the game.'],
    'Your message to %s: %s': ['Sie senden einen Funkspruch an %s: %s', 'You sent a message to %s saying you like %s.'],
  },
  own: {
    // ---- 5.0.5's reports (Report Window Templates; the Palm's and iOS's too) ----
    'Designed by Joe Williams.': 'Spieldesign von Joe Williams.',
    'Spaceward Ho! by Peter Commons. Designed by Joe Williams.': 'Spaceward Ho! von Peter Commons. Spieldesign von Joe Williams.',
    'Your Radical researchers have just made another wild discovery!': 'Ihre Radikalforscher haben schon wieder eine verrückte Entdeckung gemacht!',
    '%s destroyed your colony at %s. You %slost %d of your ships. %s lost %d. You lost %s people.': '%s besiegt Ihre Kolonie auf %s. Sie%s verlieren %d Schiffe. %s verliert %d. Sie verlieren %s Leute.',
    'Year %d:': 'Jahr %d:',
    'A volcanic eruption at %s has drastically warmed the temperature to %s!': 'Ein Vulkanausbruch hat auf %s die Temperatur drastisch auf %s angehoben!',
    'Your fleet of %s was dismantled while in hyperspace.': 'Ihre Flotte von %s wurde im Hyperraum abgewrackt.',
    'Your %s is waiting to refuel before it can continue on to %s.': 'Ihre Flotte von %s wartet auf Treibstoff, bevor sie nach %s weiterfliegt.',
    'Your fleet of %s has eaten %s people while refueling at %s.': 'Ihre Flotte von %s hat beim Auftanken auf %s %s Leute gefressen.',
    '%s’s fleet of biologicals has eaten %s people while refueling at %s.': 'Die Bioschiff-Flotte von %s hat beim Auftanken auf %3$s %2$s Leute gefressen.',
    'You have explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s.': 'Sie haben %s erforscht. Schwerkraft: %d,%2.2dG. Temp: %s. Metall: %s.',
    '%s has explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s.': '%s hat %s erforscht. Schwerkraft: %d,%2.2dG. Temp: %s. Metall: %s.',
    '%s survived an attack from %s. You %slost %d of your ships; %s lost %d. You lost %s people.': '%s übersteht einen Angriff von %s. Sie%s verlieren %d Schiffe; %s verliert %d. Sie verlieren %s Leute.',
    '%s says, “I want %s.”': '%s sendet einen Funkspruch: „Ich will %s.“',
    '%s says, “You take %s.”': '%s sendet einen Funkspruch: „Nehmen Sie %s.“',
    '%s says, “I like %s.”': '%s sendet einen Funkspruch: „Ich mag %s.“',
    '%s says, “I hate %s.”': '%s sendet einen Funkspruch: „Ich hasse %s.“',
    '%s says, “I own %s.”': '%s sendet einen Funkspruch: „Ich besitze %s.“',
    '%s says, “I need money.”': '%s sendet einen Funkspruch: „Ich brauche Geld.“',
    '%s says, “I need metal.”': '%s sendet einen Funkspruch: „Ich brauche Metall.“',
    '%s says, “Let’s attack %s.”': '%s sendet einen Funkspruch: „Greifen wir %s an.“',
    '%s says, “Thank You!”': '%s sendet einen Funkspruch: „Danke!“',
    '%s says, “Sorry!”': '%s sendet einen Funkspruch: „Tut mir leid!“',
    '%s says, “#!$@*$&@•™!”': '%s sendet einen Funkspruch: „#!$@*$&@•™!“',
    '%s says, “I like planets that are %d.%2.2dG and %s.”': '%s sendet einen Funkspruch: „Ich mag Planeten mit %d,%2.2dG und %s.“',
    '%s says, “I saw %s at %s!”': '%s sendet einen Funkspruch: „Ich habe %s bei %s gesehen!“',
    '%s says, “Look at %s.”': '%s sendet einen Funkspruch: „Sehen Sie sich %s an.“',
    '%s is cheating.': '%s mogelt.',
    'You told %s that you want %s.': 'Sie senden einen Funkspruch an %s: Sie wollen %s.',
    'You told %s that you hate %s.': 'Sie senden einen Funkspruch an %s: Sie hassen %s.',
    'You told %s that you need money.': 'Sie senden einen Funkspruch an %s: Sie brauchen Geld.',
    'You told %s that you need metal.': 'Sie senden einen Funkspruch an %s: Sie brauchen Metall.',
    'You told %s, “Let’s attack %.*s.”': 'Sie senden einen Funkspruch an %s: „Greifen wir %s an.“',
    'You told %s, “Thank You!”': 'Sie senden einen Funkspruch an %s: „Danke!“',
    'You told %s, “Sorry!”': 'Sie senden einen Funkspruch an %s: „Tut mir leid!“',
    'You said “#!$@*$&@•™!” to %s.': 'Sie senden einen Funkspruch an %s: „#!$@*$&@•™!“',
    'You told %s what gravity and temperature you prefer.': 'Sie senden einen Funkspruch an %s: welche Schwerkraft und Temperatur Sie mögen.',
    'You told %s you saw %s at %.*s.': 'Sie senden einen Funkspruch an %s: Sie haben %s bei %s gesehen.',
    'You told %s all about %s.': 'Sie senden einen Funkspruch an %s: alles über %s.',
    'Wow! You seem to be doing really well! Congratulations!': 'Wow! Sie scheinen wirklich gut voranzukommen! Glückwunsch!',
    'Congratulations! You won a %d difficulty game and have earned %s master points.': 'Glückwunsch! Sie haben ein Spiel mit Schwierigkeit %d gewonnen und %s Meisterpunkte verdient.',
    'Oh, no! All the metal on %s has suddenly disappeared.': 'Oh nein! Das ganze Metall auf %s ist plötzlich verschwunden.',
    'Uh-oh! %s has started growing and is turning bright red in hue!': 'Oh je! %s beginnt zu wachsen und färbt sich leuchtend rot!',
    '%s has just gone supernova. The planet has been obliterated.': '%s wird zur Supernova. Der Planet wurde ausgelöscht.',
    'The shock wave from the supernova threw %s metal at %s, killing %s people.': 'Die Druckwelle der Supernova schleudert %s Metall auf %s und tötet %s Leute.',
    'Your %s technology just jumped to %d.': 'Ihre %stech springt auf Stufe %d.',
    'Eeek! A nasty computer bug has broken into your game and started wreaking havoc!': 'Iiiih! Ein fieser Computerwurm ist in Ihr Spiel eingedrungen und richtet Chaos an!',
    '%s has offered to ally with you.': '%s bietet Ihnen ein Bündnis an.',
    '%s no longer wants to ally with you.': '%s will kein Bündnis mehr mit Ihnen.',
    'You have offered to ally with %s.': 'Sie bieten %s ein Bündnis an.',
    'You no longer want to ally with %s.': 'Sie wollen kein Bündnis mehr mit %s.',
    'You have formed an alliance with %s.': 'Sie haben ein Bündnis mit %s geschlossen.',
    'Your alliance with %s is gone.': 'Ihr Bündnis mit %s ist zerbrochen.',
    '%s has offered to be your best buddy.': '%s will Ihr bester Kumpel sein.',
    '%s no longer wants to be your best buddy. He just wants to be allies.': '%s will nicht mehr Ihr bester Kumpel sein. Nur noch verbündet.',
    'You have offered to be best buddies with %s.': 'Sie bieten %s an, beste Kumpel zu sein.',
    'You no longer want to be best buddies with with %s. You just want to be allies.': 'Sie wollen mit %s nicht mehr beste Kumpel sein. Nur noch verbündet.',
    'You are now best buddies with %s.': 'Sie und %s sind jetzt beste Kumpel.',
    'Your best buddy relationship with %s is gone. You\'re only allies now.': 'Sie und %s sind keine besten Kumpel mehr. Sie sind nur noch verbündet.',
    'The amount of energy emanating from %s suggests a big battle just took place.': 'Die Energie, die von %s ausgeht, deutet auf eine große Schlacht hin.',
    '%s has just given you $%s.': '%s schenkt Ihnen $%s.',
    '%s has just given you %s metal.': '%s schenkt Ihnen %s Metall.',
    'You just gave %s $%s.': 'Sie schenken %s $%s.',
    'You just gave %s %s metal.': 'Sie schenken %s %s Metall.',
    '%s has just surrendered.': '%s kapituliert.',
    '%s has just surrendered to %s.': '%s kapituliert vor %s.',
    'You have just surrendered.': 'Sie kapitulieren.',
    'You have just surrendered to %s.': 'Sie kapitulieren vor %s.',
    'Your mining consortium has just been able to extract an additional %s metal from every planet you have.': 'Ihr Bergbaukonsortium holt aus jedem Ihrer Planeten zusätzlich %s Metall.',
    'Weird weather patterns have allowed astronomers to explore certain far away stars.': 'Seltsame Wetterlagen lassen die Astronomen einige ferne Sterne erforschen.',
    'Your ship technicians have designed a set of new ships with no development cost.': 'Ihre Schiffstechniker haben eine Reihe neuer Schiffe ohne Entwicklungskosten entworfen.',
    'Your scientists have invented a decoy ship. It can\'t fight, but it\'s cheap. Amaze your friends and confuse your enemies.': 'Ihre Wissenschaftler haben ein Täuschschiff erfunden. Es kann nicht kämpfen, aber es ist billig. Verblüffen Sie Ihre Freunde und verwirren Sie Ihre Gegner.',
    'Your mad scientists have created a space monster ship! It\'s not too powerful, but it doesn\'t cost any metal!': 'Ihre verrückten Wissenschaftler haben ein Weltraummonster-Schiff gezüchtet! Es ist nicht sehr stark, aber es kostet kein Metall!',
    'Your scientists have discovered how to turn your monitor from black and white to color!': 'Ihre Wissenschaftler haben entdeckt, wie man Ihren Schwarzweißmonitor auf Farbe umstellt!',
    'Your scientists apologize, but they seem to be having “hardware problems.”': 'Ihre Wissenschaftler bitten um Entschuldigung, aber sie haben anscheinend „Hardwareprobleme“.',
    'Your scientists realize you already are running in color, shrug, and go back off to work.': 'Ihre Wissenschaftler merken, dass Sie schon in Farbe spielen, zucken mit den Schultern und gehen wieder an die Arbeit.',
    'Your archaeologists have found ancient scientific documents from a lost civilization. You can now mine more efficiently.': 'Ihre Archäologen haben uralte wissenschaftliche Schriften einer untergegangenen Zivilisation gefunden. Sie können jetzt besser Bergbau betreiben.',
    'Your sociologists have discovered how to safely increase the maximum population of your planets!': 'Ihre Soziologen haben entdeckt, wie man die Höchstbevölkerung Ihrer Planeten gefahrlos erhöht!',
    'Your climatologists have discovered how to terraform planets more efficiently.': 'Ihre Klimaforscher haben entdeckt, wie man Planeten besser terraformt.',
    'Your military training program has improved. Your generals are now smarter.': 'Ihre militärische Ausbildung ist besser geworden. Ihre Generäle sind jetzt klüger.',
    'You have improved your recycling program. You can now get more metal from scrapped ships.': 'Sie haben Ihr Recycling verbessert. Verschrottete Schiffe bringen jetzt mehr Metall ein.',
    'You have built a new research facility; tech spending is now 10% more effective.': 'Sie haben ein neues Forschungszentrum gebaut; Ausgaben für Technologie sind jetzt 10% wirksamer.',
    'You\'ve raised the prime lending rate and can now earn 50%% higher interest on savings.': 'Sie haben den Leitzins angehoben und bekommen jetzt 50%% mehr Zinsen auf Ihre Ersparnisse.',
    'You have renegotiated your line of credit and can now borrow at a 50%% better interest rate.': 'Sie haben Ihren Kreditrahmen neu verhandelt und leihen jetzt zu einem um 50%% besseren Zins.',
    'Your spies have stolen some technological secrets from %s!': 'Ihre Spione haben %s technische Geheimnisse gestohlen!',
    'You have found a wealth of precious metals and have increased your savings by $%s': 'Sie haben reiche Edelmetallvorkommen gefunden und Ihre Ersparnisse um $%s vermehrt.',
    'Your Radical researchers are hard at work on another discovery!': 'Ihre Radikalforscher arbeiten hart an der nächsten Entdeckung!',
    'Warning! Savings is being used to support %s.': 'Achtung! Ihre Ersparnisse werden für den Unterhalt von %s verbraucht.',
    'Warning! After supporting your planets and paying your interest, you have no money to spend!': 'Achtung! Nach dem Unterhalt Ihrer Planeten und den Zinsen bleibt Ihnen kein Geld zum Ausgeben!',
    'Your alliance will win the game next turn if it holds!': 'Ihr Bündnis gewinnt im nächsten Zug das Spiel, wenn es hält!',
    'Uh-oh! Having to borrow more to pay all your interest!': 'Oh je! Sie müssen mehr leihen, um alle Zinsen zu zahlen!',
    'You don’t have enough money! You’re neglecting your planets! Global warming is taking place!': 'Sie haben nicht genug Geld! Sie vernachlässigen Ihre Planeten! Die globale Erwärmung schreitet voran!',
    'Due to a lack of funds, one of your fleets can’t be maintained. It is being scrapped.': 'Mangels Geld kann eine Ihrer Flotten nicht unterhalten werden. Sie wird verschrottet.',
    'Oh No! It’s armageddon!': 'Oh nein! Armageddon!',
    'Hmm! The armadeddon device was activated, but there wasn\'t enough mass in the galaxy to get it to work…': 'Hmm! Die Armageddon-Maschine wurde gestartet, aber in der Galaxis war nicht genug Masse, damit sie funktioniert…',
    'The armageddon device has caused half of the stars to supernova!': 'Die Armageddon-Maschine hat die Hälfte der Sterne zur Supernova gemacht!',
    '%s’s armageddon device has just been turned on!': 'Die Armageddon-Maschine von %s ist eingeschaltet!',
    'Whew! %s’s armageddon device was just turned off.': 'Puh! Die Armageddon-Maschine von %s ist wieder abgeschaltet.',
    'You just received %s metal from someone scrapping a fleet or from a battle over %s.': 'Sie erhalten %s Metall von einer Flotte, die über %s verschrottet wurde oder im Kampf fiel.',
    'Congratulations, %s! Your population now exceeds %s!': 'Glückwunsch, %s! Ihre Bevölkerung übersteigt jetzt %s!',
    'Your %s tech would have just gone up if you hadn’t been playing the demo version!': 'Ihre %stech wäre gerade gestiegen, wenn Sie nicht die Demoversion spielen würden!',
    '%s has just taken over for the computer player %s.': '%s übernimmt für den Computerspieler %s.',
    'You now have %s Range Technology (%d).': 'Sie haben jetzt die Reichweitentech %s (%d).',
    'You now have %s Speed Technology (%d).': 'Sie haben jetzt die Tempotech %s (%d).',
    'You now have %s Weapons Technology (%d).': 'Sie haben jetzt die Waffentech %s (%d).',
    'You now have %s Shield Technology (%d).': 'Sie haben jetzt die Schildtech %s (%d).',
    'You now have %s Miniaturization Technology (%d).': 'Sie haben jetzt die Minitech %s (%d).',
    '%s surrenders to you, giving you $%s.': '%s kapituliert vor Ihnen und übergibt Ihnen $%s.',
    '%s surrenders to you, giving you %s metal.': '%s kapituliert vor Ihnen und übergibt Ihnen %s Metall.',
    '%s surrenders to you, giving you the planet %s.': '%s kapituliert vor Ihnen und übergibt Ihnen den Planeten %s.',
    'Oh no! The Valdez has sprung a leak! The ecology on %s is in shambles! The citizens are suing you for negligence for twice your net worth!': 'Oh nein! Die Valdez ist leckgeschlagen! Die Umwelt auf %s ist ruiniert! Die Bürger verklagen Sie wegen Fahrlässigkeit auf das Doppelte Ihres Vermögens!',
    'You just watched some of your allies fight a battle at %s.': 'Sie haben gerade zugesehen, wie einige Ihrer Verbündeten bei %s gekämpft haben.',
    'There were not enough tankers to fully refuel your fleet of %s at %s.': 'Es gab nicht genug Tanker, um Ihre Flotte von %s auf %s ganz aufzutanken.',
    'Your fleet of %s is fully refueled and is ready to depart %s for %s.': 'Ihre Flotte von %s ist vollgetankt und bereit, von %s nach %s aufzubrechen.',
    '%s people managed to escape the meteor shower at %s by fleeing to the orbiting colony ship(s).': '%s Leute konnten sich vor dem Meteoritenschauer auf %s in die Kolonieschiffe im Orbit retten.',
    'Your %s can no longer reach %s because some of the ships in the fleet don\'t have enough range.': 'Ihre Flotte von %s kann %s nicht mehr erreichen, weil einige Schiffe darin nicht genug Reichweite haben.',
    'It\'s a miracle! Your scientists have figured out to prevent %s from going supernova.': 'Ein Wunder! Ihre Wissenschaftler wissen jetzt, wie man verhindert, dass %s zur Supernova wird.',
    'Wow, that\'s weird! %s is no longer red and appears not to be in danger of going nova.': 'Wow, das ist seltsam! %s ist nicht mehr rot und wird wohl doch nicht zur Nova.',
    // ---- 5.0.5's alerts (the ones the page shows) ----
    'Do you really want to surrender?': 'Wollen Sie wirklich kapitulieren?',
    'You are no longer surrendering to anyone.': 'Sie kapitulieren vor niemandem mehr.',
    'Are you sure you want to destroy half the galaxy? Millions of innocent lives will be lost…': 'Wollen Sie wirklich die halbe Galaxis zerstören? Millionen unschuldiger Leben gehen verloren…',
    'Whew! It\'s good to see that that clearer heads have prevailed!': 'Puh! Schön, dass die klareren Köpfe gesiegt haben!',
    'Sorry, but you may only give 3 gifts per turn.': 'Leider sind nur 3 Geschenke pro Zug möglich.',
    'Sorry, but there is no one else alive to give or send something to.': 'Leider lebt niemand mehr, dem Sie etwas schenken oder senden könnten.',
    'Do you really want to scrap all existing ships of this type?': 'Wollen Sie wirklich alle Schiffe dieses Typs verschrotten?',
    // (string 3310's words)
    'Sorry, but the battle record for this battle is no longer available.': 'Die Informationen über diesen Kampf sind leider nicht mehr vorhanden.',
    'Sorry, but there is already a star with that name. How about a different name?': 'Es gibt schon einen Stern mit diesem Namen. Wie wäre es mit einem anderen?',
    // (string 3280's words)
    'Sorry, but your assembly lines are full. You must scrap a ship type first before you can design any more ship types.': 'Leider sind Ihre Werften voll. Sie müssen erst einen Schiffstyp verschrotten, bevor Sie einen neuen entwerfen können.',
    'Sorry, you don\'t have the details about this battle that your ally fought.': 'Leider haben Sie keine Einzelheiten über diesen Kampf Ihres Verbündeten.',
    'Sorry, but you have no additional information about this battle; all you know is that is was pretty big.': 'Leider wissen Sie nichts weiter über diesen Kampf; nur, dass er ziemlich groß war.',
    'Sorry, but you have no detailed information about the battle. All you know was that it was big.': 'Leider haben Sie keine genauen Informationen über den Kampf. Sie wissen nur, dass er groß war.',
    // (string 3330, the same alert in 2.0)
    'Sorry, but that fleet doesn\'t have enough fuel to reach the selected destination. You can tell this because there are no arrows on either end of the dragged line.':
      'Diese Flotte hat nicht genug Treibstoff, um das gewünschte Ziel zu erreichen. Das kann man daran erkennen, daß sich an den Enden der gezogenen Linie keine Pfeilspitzen befinden.',
    'Are you sure you want to build that many scout ships?': 'Wollen Sie wirklich so viele Späher bauen?',
    'Are you sure you want to build that many tankers?': 'Wollen Sie wirklich so viele Tanker bauen?',
    'Dorothy, I guess that means we\'re not in Kansas anymore…': 'Dorothy, ich glaube, wir sind nicht mehr in Kansas…',
    'Dost thou truly wish to abandon Hope? All is not yet lost...': 'Willst du wahrhaftig alle Hope fahren lassen? Noch ist nicht alles verloren...',
    'Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!': 'Ship verlassen? Alle Mann von Bord! Rette sich, wer kann! Frauen und Kinder zuerst!',
    'Do you really want to evacuate %s? It\'s a profitable colony!': 'Wollen Sie %s wirklich räumen? Die Kolonie wirft Profit ab!',
    'Do you really want to evacuate %s?': 'Wollen Sie %s wirklich räumen?',
    'Year %d. Nothing much happened.': 'Jahr %d. Es ist nicht viel passiert.',
    // ---- 5.0.5's hints (STR# 6021) and first messages ----
    'Click here to make this message go away. Click on the clock to end your turn.': 'Klicken Sie hier, damit diese Meldung verschwindet. Klicken Sie auf die Uhr, um Ihren Zug zu beenden.',
    'Fleets appear as dots next to your planets. Click one and drag it to send it to another star.': 'Flotten erscheinen als Punkte neben Ihren Planeten. Klicken Sie eine an und ziehen Sie sie zu einem anderen Stern, um sie dorthin zu schicken.',
    'Play with the spending bars. Conquer the galaxy. Gain ranks to unlock more game options. Enjoy.': 'Spielen Sie mit den Ausgabebalken. Erobern Sie die Galaxis. Steigen Sie im Rang auf, um mehr Spieloptionen freizuschalten. Viel Spaß.',
    'Ships with higher Speed Tech shoot first.': 'Schiffe mit höherer Tempotech schießen zuerst.',
    'Dots by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left.': 'Punkte neben Ihrem Planeten bedeuten, dass Schiffe ihn umkreisen. Flotten stehen rechts, Satelliten links.',
    'Good planets look “prettier” than bad planets when you explore them.': 'Gute Planeten sehen beim Erforschen „hübscher“ aus als schlechte.',
    'Range is how far your ships can reach.': 'Die Reichweite gibt an, wie weit Ihre Schiffe kommen.',
    'Satellites can\'t move, but they shoot just as well as any other ship.': 'Satelliten können sich nicht bewegen, aber sie schießen so gut wie jedes andere Schiff.',
    'There\'s a limited amount of metal in the game.': 'Es gibt nur begrenzt viel Metall im Spiel.',
    'Miniaturization makes ships cost more money, but less metal.': 'Miniaturisierung macht Schiffe teurer, aber sie brauchen weniger Metall.',
    'Radical Tech can have a variety of effects.': 'Radikaltech kann die verschiedensten Folgen haben.',
    'Be careful with your metal--it can easily run out.': 'Gehen Sie sparsam mit Ihrem Metall um, es kann leicht ausgehen.',
    'Click and hold for a second to cancel a fleet\'s movement.': 'Halten Sie die Maustaste eine Sekunde gedrückt, um den Flug einer Flotte abzubrechen.',
    'Build Satellites to protect vulnerable planets.': 'Bauen Sie Satelliten, um gefährdete Planeten zu schützen.',
    'Colonize good planets with Colony ships.': 'Kolonisieren Sie gute Planeten mit Kolonieschiffen.',
    'Scout ships have higher Range, but lower Weapons and Shields.': 'Späher haben mehr Reichweite, aber schwächere Waffen und Schilde.',
    'If your Weapons are higher than the opponent\'s Shields, you\'ll do lots of damage.': 'Sind Ihre Waffen stärker als die Schilde des Gegners, richten Sie viel Schaden an.',
    'If your Shields are higher than the opponents Weapons, he\'ll barely hurt you.': 'Sind Ihre Schilde stärker als die Waffen des Gegners, kann er Ihnen kaum etwas anhaben.',
    'Lots of ships can make up for having low Technology.': 'Viele Schiffe können schwache Technologie wettmachen.',
    'You get money every turn.': 'Sie bekommen jeden Zug Geld.',
    'Good planets are close to 1.0 G.': 'Gute Planeten liegen nahe bei 1,0 G.',
    'Good planets are close to 72°F (20°C).': 'Gute Planeten liegen nahe bei 72°F (20°C).',
    'Each player has a different idea of what a good planet is.': 'Jeder Spieler hat seine eigene Vorstellung von einem guten Planeten.',
    'If a planet is over 2.5 G or below 0.4 G, it will never make a profit.': 'Ein Planet mit über 2,5 G oder unter 0,4 G wirft niemals Profit ab.',
    'Abandon bad planets after you strip-mine them.': 'Verlassen Sie schlechte Planeten, wenn Sie sie ausgebeutet haben.',
    'Terraforming improves a planet\'s temperature.': 'Terraforming verbessert die Temperatur eines Planeten.',
    'Mining takes metal from a planet and puts it into your reserve.': 'Bergbau holt Metall aus einem Planeten und legt es in Ihren Vorrat.',
    'Savings puts money away for shipbuilding.': 'Sparen legt Geld für den Schiffsbau zurück.',
    'Savings generates extra income.': 'Sparen bringt zusätzliches Einkommen.',
    'If you go into debt, part of your income goes to pay interest.': 'Wenn Sie Schulden machen, geht ein Teil Ihres Einkommens für Zinsen drauf.',
    'If you have a fleet with fighters and a colony ship, mark the colony ship to arrive late. It\'ll probably survive longer.': 'Haben Sie eine Flotte mit Kampfschiffen und einem Kolonieschiff, lassen Sie das Kolonieschiff später ankommen. Es überlebt dann wahrscheinlich länger.',
    'Ships in a fleet that arrive late may miss the worst initial battle.': 'Schiffe einer Flotte, die später ankommen, verpassen vielleicht den schlimmsten Teil des Kampfes.',
    'Offensive ships attack better but defend worse.': 'Offensive Schiffe greifen besser an, verteidigen aber schlechter.',
    'Defensive ships defend better but attack worse.': 'Defensive Schiffe verteidigen besser, greifen aber schlechter an.',
    'There\'s a contextual menu in the map window for convenience.': 'Das Kartenfenster hat der Bequemlichkeit halber ein Kontextmenü.',
    'Hold down the option key and click planets to specify your fleet\'s path more exactly.': 'Halten Sie die Wahltaste gedrückt und klicken Sie Planeten an, um den Weg Ihrer Flotte genauer festzulegen.',
    'Put multiple ships in the same fleet with Organize Fleets.': 'Mit „Flotten ordnen“ können Sie mehrere Schiffe in eine Flotte stecken.',
    'Option-drag in Organize Fleets to split up ship piles.': 'Ziehen Sie in „Flotten ordnen“ mit der Wahltaste, um Schiffsstapel aufzuteilen.',
    'Use the graph to see how well you\'re doing technology-wise vs. the other players.': 'In der Grafik sehen Sie, wie Ihre Technologie im Vergleich zu den anderen Spielern dasteht.',
    'The first person in the player list is winning.': 'Wer in der Spielerliste oben steht, liegt vorn.',
    'If you\'ve just started, you might want to try turning on auto-play and watching.': 'Wenn Sie gerade erst anfangen, schalten Sie doch einmal das Autospiel ein und sehen Sie zu.',
    'If you and your allies arrive at  a star in the same turn, they\'ll fight side-by-side in battle.': 'Kommen Sie und Ihre Verbündeten im selben Zug bei einem Stern an, kämpfen Sie Seite an Seite.',
    'Armageddons make the galaxy smaller.': 'Armageddons machen die Galaxis kleiner.',
    // ---- the Radical Research window's projects (4.0.5's, 5.0.5's) ----
    'Search for more metal on your planets.': 'Auf Ihren Planeten nach mehr Metall suchen.',
    'Explore distant stars.': 'Ferne Sterne erforschen.',
    'Get lots of money immediately.': 'Sofort viel Geld bekommen.',
    'Improve mining efficiency.': 'Den Bergbau verbessern.',
    'Improve population maximums.': 'Die Höchstbevölkerung erhöhen.',
    'Improve terraforming efficiency.': 'Das Terraforming verbessern.',
    'Educate battle generals better.': 'Die Generäle besser ausbilden.',
    'Improve recycling program.': 'Das Recycling verbessern.',
    'Build a new research facility.': 'Ein neues Forschungszentrum bauen.',
    'Raise the prime lending rate.': 'Den Leitzins anheben.',
    'Renegotiate your line of credit.': 'Den Kreditrahmen neu verhandeln.',
    'Build a decoy ship.': 'Ein Täuschschiff bauen.',
    'Build a biological space monster.': 'Ein biologisches Weltraummonster bauen.',
    'Steal technology from another player.': 'Einem anderen Spieler Technologie stehlen.',
    'Build a set of ships with no development cost.': 'Eine Reihe Schiffe ohne Entwicklungskosten bauen.',
    'Improve range tech dramatically.': 'Die Reichweitentech dramatisch verbessern.',
    'Improve speed tech dramatically.': 'Die Tempotech dramatisch verbessern.',
    'Improve weapons tech dramatically.': 'Die Waffentech dramatisch verbessern.',
    'Improve shields tech dramatically.': 'Die Schildtech dramatisch verbessern.',
    'Improve mini tech dramatically.': 'Die Minitech dramatisch verbessern.',
    // 5.0.5's own names (STR# 6260 "Radical Tech Strings", PPob 153; the Palm's and iOS's the same)
    'Search for more metal on your planets': 'Auf Ihren Planeten nach mehr Metall suchen',
    'Explore distant stars': 'Ferne Sterne erforschen',
    'Get lots of money immediately': 'Sofort viel Geld bekommen',
    'Improve mining efficiency': 'Den Bergbau verbessern',
    'Improve population maximums': 'Die Höchstbevölkerung erhöhen',
    'Improve terraforming efficiency': 'Das Terraforming verbessern',
    'Educate battle generals better': 'Die Generäle besser ausbilden',
    'Improve recycling program': 'Das Recycling verbessern',
    'Improve technology output': 'Die Forschungsleistung verbessern',
    'Increase savings interest rate': 'Den Sparzins erhöhen',
    'Decrease borrowing interest rate': 'Den Kreditzins senken',
    'Build a decoy ship': 'Ein Täuschschiff bauen',
    'Build a biological space monster': 'Ein biologisches Weltraummonster bauen',
    'Steal technology from another player': 'Einem anderen Spieler Technologie stehlen',
    'Build a set of ships without development cost': 'Eine Reihe Schiffe ohne Entwicklungskosten bauen',
    'Improve range tech dramatically': 'Die Reichweitentech dramatisch verbessern',
    'Improve speed tech dramatically': 'Die Tempotech dramatisch verbessern',
    'Improve weapons tech dramatically': 'Die Waffentech dramatisch verbessern',
    'Improve shields tech dramatically': 'Die Schildtech dramatisch verbessern',
    'Improve mini tech dramatically': 'Die Minitech dramatisch verbessern',
    // ---- Name a Star at a new rank (5.0.5, the Palm) ----
    'You may name a star for use in future games:': 'Sie dürfen einen Stern für spätere Spiele benennen:',
    // ---- iOS and Android: their own lines (the touch) ----
    'Congratulations! You may name a star for use in future games:': 'Glückwunsch! Sie dürfen einen Stern für spätere Spiele benennen:',
    'Sorry, but that fleet doesn\'t have enough fuel to reach the selected destination. You can tell this because of the red fleet line.': 'Diese Flotte hat nicht genug Treibstoff, um das gewünschte Ziel zu erreichen. Das kann man an der roten Flottenlinie erkennen.',
    'Touch and drag a fleet back to its current star to cancel a fleet\'s movement.': 'Ziehen Sie eine Flotte zu ihrem Stern zurück, um ihren Flug abzubrechen.',
    'Use the Organize Fleets dialog to split up ship piles.': 'Mit „Flotten ordnen“ können Sie Schiffsstapel aufteilen.',
    'Touch outside of a dialog to cancel that dialog without making any changes.': 'Tippen Sie neben ein Fenster, um es ohne Änderungen zu schließen.',
    'Technology bars can be adjusted with a touch of your finger.': 'Die Technologiebalken lassen sich mit dem Finger einstellen.',
    // ---- the Palm's own ----
    'Your ship technicians have designed a decoy ship. It\'s really weak, but it looks menacing and can help keep your allies in line!': 'Ihre Schiffstechniker haben ein Täuschschiff entworfen. Es ist wirklich schwach, aber es sieht bedrohlich aus und kann Ihre Verbündeten bei der Stange halten!',
    'Icons by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left.': 'Symbole neben Ihrem Planeten bedeuten, dass Schiffe ihn umkreisen. Flotten stehen rechts, Satelliten links.',
    'To cancel a fleet’s movement, make sure that fleet is selected in the Ship Info window and click the origin planet. You can also use the ‘Cancel Fleet Trip’ menu item in the ‘Ships’ menu.':
      'Um den Flug einer Flotte abzubrechen, wählen Sie die Flotte im Fenster „Ship Info“ aus und klicken Sie auf ihren Ausgangsplaneten. Sie können auch den Befehl „Cancel Fleet Trip“ im Menü „Ships“ benutzen.',
    'There are menus and menu shortcuts in the Galaxy screen for your convenience.': 'Der Galaxis-Bildschirm hat der Bequemlichkeit halber Menüs und Tastenkürzel.',
    'The computer will help choose the best path possible for your fleets.': 'Der Computer hilft, für Ihre Flotten den besten Weg zu finden.',
    'Change the battle attitude of ships in your fleets in the Organize Fleets screen.': 'Die Kampfhaltung der Schiffe Ihrer Flotten ändern Sie im Bildschirm „Flotten ordnen“.',
    'The Enemy and Allies screen can show who your friends and enemies are. It also so shows who is doing the best.': 'Der Bildschirm „Gegner und Verbündete“ zeigt Ihre Freunde und Gegner. Er zeigt auch, wer am besten dasteht.',
    'The first person in the Enemies and Allies list is winning.': 'Wer in der Liste „Gegner und Verbündete“ oben steht, liegt vorn.',
    'Click the G button to see the Galaxy, click the $ button to see the Spendingscreen and click the H button to see these messages.': 'Klicken Sie auf G für die Galaxis, auf $ für den Ausgabenbildschirm und auf H für diese Meldungen.',
    'Fleets appear as icons next to your planets. To send a fleet to another planet, select it and then drag it to the new planet.': 'Flotten erscheinen als Symbole neben Ihren Planeten. Um eine Flotte zu einem anderen Planeten zu schicken, wählen Sie sie aus und ziehen sie zum neuen Planeten.',
    'Palm OS version by Christopher Cotton and Steve Orens of Mobilefreon (tm)': 'Palm-OS-Version von Christopher Cotton und Steve Orens von Mobilefreon (tm)',
    'It\'s a miracle! Your scientist have figured out how to prevent %s from going supernova.': 'Ein Wunder! Ihre Wissenschaftler wissen jetzt, wie man verhindert, dass %s zur Supernova wird.',
    'Wow, that\'s wierd! %s is no longer red and appears not to be in danger of going nova.': 'Wow, das ist seltsam! %s ist nicht mehr rot und wird wohl doch nicht zur Nova.',
    // ---- 4.0.5 (Windows and Mac) and 3.0.1 ----
    '%s says , "#!$*@%$&!"': '%s sendet einen Funkspruch: „#!$*@%$&!“',
    'You said "!$@*$&@!" to %s.': 'Sie senden einen Funkspruch an %s: „!$@*$&@!“',
    '%s destroyed your colony at %s.  You lost %s of your ships. %s lost %s.  You lost %s people.': '%s besiegt Ihre Kolonie auf %s. Sie verlieren %d Schiffe. %s verliert %d. Sie verlieren %s Leute.',
    // (707's "verteidigt sich … gegen einen Angriff von")
    '%s survived an enemy attack from %s.  You lost %s of your ships.  %s lost %s.  You lost %s people.': '%s verteidigt sich gegen einen Angriff von %s. Sie verlieren %d Schiffe. %s verliert %d. Sie verlieren %s Leute.',
    'Click and Drag from one star to another to move fleets.': 'Klicken und ziehen Sie von einem Stern zum anderen, um Flotten zu bewegen.',
    'Click here to make this message go away.': 'Klicken Sie hier, damit diese Meldung verschwindet.',
    'Play with the spending bars. Conquer the galaxy. Enjoy.': 'Spielen Sie mit den Ausgabebalken. Erobern Sie die Galaxis. Viel Spaß.',
    'Sorry, but you have that fleet marked for the scrap heap.  it’s not going anywhere.': 'Diese Flotte ist leider zum Verschrotten markiert. Sie fliegt nirgendwohin.',
    'Uh-oh!  Having to borrow more ship money to pay all your interest!': 'Oh je! Sie müssen mehr Schiffsgeld leihen, um alle Zinsen zu zahlen!',
    'Warning!  Ship money is being used to support %s.': 'Achtung! Ihr Schiffsgeld wird für den Unterhalt von %s verbraucht.',
    // (string 5040's "Sie haben die Galaxis erobert!")
    'Congratulations! You have conquered the galaxy!': 'Glückwunsch! Sie haben die Galaxis erobert!',
    'A dot by a planet means you have ships in orbit there.': 'Ein Punkt neben einem Planeten bedeutet, dass dort Schiffe im Orbit sind.',
    'Good planets are close to 72 degrees.': 'Gute Planeten liegen nahe bei 72 Grad.',
    'Ship savings puts money away for shipbuilding.': 'Schiffssparen legt Geld für den Schiffsbau zurück.',
    'You just received %s metal from someone scrapping a fleet over %s.': 'Sie erhalten %s Metall von einer Flotte, die über %s verschrottet wurde.',
    'Star names must be 2 to 7 characters long.': 'Sternnamen müssen 2 bis 7 Buchstaben lang sein.',
    'New Star Name:': 'Neuer Name:',
    '(If you’d rather not name a star, click “OK” with the name blank.)': '(Wenn Sie keinen Stern benennen möchten, klicken Sie einfach mit leerem Namen auf „OK“.)',
    // the remake's own messages (js/engine.js; 2.0's German had the first)
    'Your fleet of %s is waiting to refuel before it can continue on to %s.': 'Ihre Flotte von %s wartet auf Treibstoff, bevor sie nach %s weiterfliegt.',
    'Wow! You won! You have conquered the galaxy. Congratulations!': 'Wow! Sie haben gewonnen! Sie haben die Galaxis erobert. Glückwunsch!',
    'Wow! You won! You and your allies have conquered the galaxy. Congratulations!': 'Wow! Sie haben gewonnen! Sie und Ihre Verbündeten haben die Galaxis erobert. Glückwunsch!',
    // (2.0's German had them: the free-text messages)
    '%s says: %s': '%s sendet einen Funkspruch: %s',
    // Armageddon's two questions (4.0.5, strings 299-309)
    'Do you really want to launch the armageddon device?  It\'ll blow up half of the galaxy!': 'Wollen Sie die Armageddon-Maschine wirklich starten? Sie sprengt die halbe Galaxis!',
    'Do you really want to launch the armageddon device?  Isn\'t life too short as it is?': 'Wollen Sie die Armageddon-Maschine wirklich starten? Ist das Leben nicht schon kurz genug?',
    // 3.0.1's Armageddon buttons (DITL 3250-3255), the remake's words
    'Party Pooper': 'Spielverderber',
    'Abort': 'Abbruch',
    'Not Unsure?': 'Nicht unsicher?',
    'Unsure?': 'Unsicher?',
    'Power': 'Macht',
    'Yeah': 'Jawohl',
    'Go For It!': 'Los geht’s!',
    'Maybe Not': 'Lieber nicht',
    'That’s It!': 'Genau!',
    'Never mind': 'Vergiss es',
    'Do you really want to launch the armageddon device?  I mean, you\'d probably win anyway; why take the chance?': 'Wollen Sie die Armageddon-Maschine wirklich starten? Ich meine, Sie gewinnen doch wahrscheinlich sowieso; wozu das Risiko?',
    'Do you really want to launch the armageddon device?  Doing so decreases the difficulty score by half!': 'Wollen Sie die Armageddon-Maschine wirklich starten? Das halbiert die Schwierigkeitswertung!',
    'Do you really want to launch the armageddon device?  Odds are you\'ll blow yourself up!': 'Wollen Sie die Armageddon-Maschine wirklich starten? Wahrscheinlich sprengen Sie sich selbst mit in die Luft!',
    'Are you just doing this because you think you\'ll win but it\'s really late and so you want to go to bed?': 'Machen Sie das nur, weil Sie glauben, dass Sie sowieso gewinnen, aber es schon spät ist und Sie ins Bett wollen?',
    'Aren\'t you sure you really don\'t want to have nothing to do with not launching the armageddon device?': 'Sind Sie nicht sicher, dass Sie wirklich nichts damit zu tun haben wollen, die Armageddon-Maschine nicht zu starten?',
    'You\'re just doing this \'cause you enjoy the ultimate feeling of power, aren\'t you???': 'Sie machen das doch nur, weil Sie das ultimative Machtgefühl genießen, oder???',
    'If you do this, everyone will hate you!  It\'s such a sissy way to try to win, anyway.': 'Wenn Sie das tun, werden alle Sie hassen! Das ist sowieso eine feige Art zu gewinnen.',
    'Now look, this is NO laughing matter.  You just might get yourself killed!': 'Hören Sie, das ist KEIN Spaß. Sie könnten dabei draufgehen!',
    'I get it.  You\'re losing big time and this is the only way you could possibly win!  That\'s it isn\'t it?': 'Ich hab\'s. Sie verlieren haushoch, und das ist die einzige Art, wie Sie noch gewinnen können! Stimmt\'s?',
  },
  // the tech names (5.0.5's lists, 4.0.5's): the remake's German
  techs: {
    'Topping off the Tanks': 'Volltanken', 'Fusion Pile': 'Fusionsmeiler', 'Magneto-Hydrodynamic Power': 'Magnetohydrodynamische Kraft', 'Allotropic Iron': 'Allotropes Eisen',
    'Gravitic Battery': 'Gravitationsbatterie', 'Quantum Energy Storage': 'Quantenenergiespeicher', Singularity: 'Singularität', 'Plasma Siphon': 'Plasmasiphon',
    'Muon Ladder': 'Myonenleiter', 'There and Back': 'Hin und zurück', 'Quark Grinder': 'Quarkmühle', 'Pulsar Radiant': 'Pulsarstrahler', 'Anti-Matter': 'Antimaterie',
    'Star Harness': 'Sternengeschirr',
    'Solar Sail': 'Sonnensegel', 'Ion Rocket': 'Ionenrakete', 'Gravitic Slingshot': 'Gravitationsschleuder', 'Fusion Dump Drive': 'Fusionsablassantrieb', 'Relativity Drive': 'Relativitätsantrieb',
    'Trans-Light': 'Überlicht', Hyperspace: 'Hyperraum', 'Rift Drive': 'Risstriebwerk', 'Hawking Propulsion System': 'Hawking-Antriebssystem', 'Hyper-Rift Drive': 'Hyperrisstriebwerk',
    'PowerPC™': 'PowerPC™', PowerPC: 'PowerPC', 'Trans-Rift Hyper Drive': 'Transriss-Hyperantrieb', 'Hawking Trans-Hyper Drive': 'Hawking-Transhyperantrieb', 'Time Distortion': 'Zeitverzerrung',
    'Quantum Continuum': 'Quantenkontinuum', 'Already There': 'Schon da', 'Speedy Gonzalez™': 'Speedy Gonzalez™', 'Speedy Gonzalez': 'Speedy Gonzalez', Teleportation: 'Teleportation',
    'Yesterday Drive': 'Gestern-Antrieb',
    'Mass Driver Cannon': 'Massebeschleunigerkanone', 'Laser 20': 'Laser 20', Turbolaser: 'Turbolaser', Maser: 'Maser', 'Gamma-Ray Laser': 'Gammastrahlenlaser',
    'Spectrum Cannon': 'Spektralkanone', 'Energy Ball': 'Energiekugel', 'Nuclear Magnetic Resonance': 'Kernspinresonanz', 'Phase Disruption': 'Phasenzerrüttung',
    'Focused Quark Beam': 'Gebündelter Quarkstrahl', 'Hard Pixel': 'Harter Pixel', 'Tachyon Cannon': 'Tachyonenkanone', '+5 Rustproof Vorpal': '+5 rostfreies Vorpalschwert',
    'Hyperspace Pulse': 'Hyperraumpuls', 'Delta Particle Stream': 'Deltateilchenstrom', 'Neutron Compression': 'Neutronenkompression', 'Nova Cannon': 'Novakanone',
    'Galactic Disruption': 'Galaktische Zerrüttung', 'Advanced Space-Time Annihilation': 'Fortgeschrittene Raum-Zeit-Vernichtung',
    'Armored Hull': 'Panzerrumpf', 'Mass Repulser': 'Masseabstoßer', 'Energy Dispersion': 'Energiezerstreuung', Deflector: 'Deflektor', 'Energy Bonded Armor': 'Energiegebundene Panzerung',
    'Anti-Energy': 'Antienergie', 'Quark Shell': 'Quarkhülle', 'Delta Wave': 'Deltawelle', 'Energy Injestor': 'Energieschlucker', 'Refractor Field': 'Brechungsfeld',
    'Holographic Decoy': 'Holografische Attrappe', 'Stasis Flicker': 'Stasisflackern', 'Conversion Field': 'Umwandlungsfeld', 'Tao Wave': 'Tao-Welle', 'Gluon Armor': 'Gluonenpanzer',
    'Hide behind a big rock': 'Hinter einem großen Felsen verstecken', '+5 Blessed Plate Mail': '+5 gesegneter Plattenpanzer', 'Displacer Field': 'Verschiebungsfeld',
    'Integrated Circuit': 'Integrierter Schaltkreis', 'Integrated Chip': 'Integrierter Chip', 'Large Scale Integration': 'Großintegration', VLSI: 'VLSI', Wonkavision: 'Wonkavision',
    'Ultra-microscopic': 'Ultramikroskopisch', Nanoscopic: 'Nanoskopisch', 'Advanced Nanoscopic': 'Fortgeschritten nanoskopisch', 'Really Amazingly Small': 'Wirklich erstaunlich klein',
    'Yellow Polka Dot Bikini': 'Gelb getupfter Bikini', 'Sub-Atomic': 'Subatomar', 'Partial Lepton': 'Teil-Lepton', Quark: 'Quark', 'Sub-Quark': 'Subquark', 'Micro-Quark': 'Mikroquark',
    'Nano-Quark': 'Nanoquark', 'Advanced Nano-Quark': 'Fortgeschrittener Nanoquark', 'Bikini Again (Thought it was funny)': 'Schon wieder Bikini (Fanden wir witzig)',
    'Quantum Superstring': 'Quanten-Superstring', 'Sub-Quantum Superstring': 'Subquanten-Superstring',
    // (4.0.5's Mini 20, which is the credit line)
    'Spaceward Ho! Version 4.0.5 by Peter Commons.': 'Spaceward Ho! Version 4.0.5 von Peter Commons.',
  },
  words: {
    // 3.0.1's and 4.0.5's Send Message groups
    Everyone: 'Alle', 'Your Allies': 'Ihre Verbündeten', 'Your Buddies': 'Ihre besten Kumpel',
  },
},
// =====================================================================
// Spanish: the remake's, for every version (there was never an official
// Spanish Spaceward Ho!). Written in the spirit of the official
// translations (docs/translations.md, "Spanish glossary"): their words for
// the game's things, their tone, their jokes; "tú", as the Turkish "sen",
// for the originals' informal Western humour; the reports in the perfect
// ("Has explorado %s."); numbers "1.234"; temperatures in °C, as the French
// and German (js/languages.js converts the English's "72°"). Every line is
// the remake's own (no official line to adapt).
// =====================================================================
es: {
  own: {
    // ---- 2.0's reports (and 1.2's, the same line for line) ----
    'Spaceward Ho! Version 1.2 by Peter Commons.': 'Spaceward Ho! Versión 1.2, de Peter Commons.',
    'Spaceward Ho! Version 2.0.1 by Peter Commons.': 'Spaceward Ho! Versión 2.0.1, de Peter Commons.',
    'Artwork by Howard Vives.': 'Gráficos de Howard Vives.',
    'Your Range Technology has reached level %d.': 'Tu tecnología de Alcance ha llegado al nivel %d.',
    'Your Speed Technology has reached level %d.': 'Tu tecnología de Velocidad ha llegado al nivel %d.',
    'Your Weapons Technology has reached level %d.': 'Tu tecnología de Armas ha llegado al nivel %d.',
    'Your Shield Technology has reached level %d.': 'Tu tecnología de Escudos ha llegado al nivel %d.',
    'Your Miniaturization Technology has reached level %d.': 'Tu tecnología de Miniaturización ha llegado al nivel %d.',
    'You have abandoned %s.': 'Has abandonado %s.',
    '%s has gone nova. All inhabitants were killed.': '%s se ha convertido en nova. Han muerto todos sus habitantes.',
    '%s destroyed your colony at %s.': '%s ha destruido tu colonia en %s.',
    'The game has been updated to the year %d.': 'La partida ha avanzado hasta el año %d.',
    'Your colony at %s is not receiving sufficient funds to support itself.': 'Tu colonia en %s no recibe fondos suficientes para mantenerse.',
    'You are not supporting %s enough. The people have revolted and now belong to %s.': 'No mantienes lo bastante a %s. Su gente se ha sublevado y ahora pertenece a %s.',
    'Warning: you are terraforming %s, a planet that will never become profitable.': 'Atención: estás terraformando %s, un planeta que nunca será rentable.',
    'You have completely terraformed %s.': 'Has terminado de terraformar %s.',
    'Your fleet of %s at %s has been dismantled for %s metal.': 'Tu flota de %s en %s ha sido desmantelada a cambio de %s unidades de metal.',
    'Your fleet of %s at %s has been scrapped for %s metal.': 'Tu flota de %s en %s ha sido desguazada a cambio de %s unidades de metal.',
    'Your “%s” ship type has been dismantled. %d of this type scrapped for %s metal.': 'Tu tipo de nave “%s” ha sido desmantelado. %d naves de este tipo desguazadas a cambio de %s unidades de metal.',
    'Your `%s\' ship type has been scrapped. %d of this type scrapped for %s metal.': 'Tu tipo de nave “%s” ha sido desguazado. %d naves de este tipo desguazadas a cambio de %s unidades de metal.',
    'You have ships queued at %s but have no money allocated for shipbuilding.': 'Tienes naves encargadas en %s, pero no has asignado dinero a la construcción de naves.',
    'Built %s at %s.': 'Construcción terminada en %2$s: %1$s.',
    'Your fleet of %s disappeared through a wormhole in space and is lost.': 'Tu flota de %s ha desaparecido por un agujero de gusano y se ha perdido.',
    'You are spending money on shipbuilding at %s but have no ships queued.': 'Gastas dinero en construir naves en %s, pero no tienes ninguna encargada.',
    'You are spending money on shipbuilding at %s but have no metal available.': 'Gastas dinero en construir naves en %s, pero no tienes metal disponible.',
    'Your %s can no longer reach %s.': 'Tu flota de %s ya no puede llegar a %s.',
    'Your fleet of %s has arrived at %s.': 'Tu flota de %s ha llegado a %s.',
    'Your fleet of %s has stopped at %s on the way to %s.': 'Tu flota de %s se ha detenido en %s camino de %s.',
    '%s has run out of metal.': '%s se ha quedado sin metal.',
    '%s has run out of metal. You should probably abandon it.': '%s se ha quedado sin metal. Quizá deberías abandonarlo.',
    '%s has just become a profitable colony.': '%s acaba de convertirse en una colonia rentable.',
    'It’s a baby boom! The population at %s has started growing quickly.': '¡Explosión de natalidad! La población de %s ha empezado a crecer deprisa.',
    '%s’s population growth rate has slowed.': 'El crecimiento de la población de %s se ha frenado.',
    'You have explored %s. Gravity: %s. Temp: %s. Metal: %s.': 'Has explorado %s. Gravedad: %s. Temp.: %s. Metal: %s.',
    'You have colonized %s.': 'Has colonizado %s.',
    'You won a battle at %s. You lost %d of your ships. %s lost %d.': 'Has ganado una batalla en %s. Has perdido %d de tus naves. Pérdidas de %s: %d.',
    'You lost a battle at %s. You lost %d of your ships. %s lost %d.': 'Has perdido una batalla en %s. Has perdido %d de tus naves. Pérdidas de %s: %d.',
    '%s successfully defended itself against an enemy attack from %s.': '%s se ha defendido con éxito de un ataque enemigo de %s.',
    'You have recovered %s metal from the battle at %s.': 'Has recuperado %s unidades de metal de la batalla de %s.',
    '%s metal has fallen onto %s from your recent battle.': 'Han caído sobre %2$s %1$s unidades de metal de tu última batalla.',
    'Oh no! %s people were killed when a heavy meteor shower hit %s.': '¡Oh, no! Han muerto %s personas al caer una fuerte lluvia de meteoritos sobre %s.',
    '%s has just been eliminated from the game.': '%s acaba de quedar eliminado de la partida.',
    'You have just been eliminated from the game.': 'Acabas de quedar eliminado de la partida.',
    '%s has just won the game.': '%s acaba de ganar la partida.',
    'Congratulations! You have just won the game.': '¡Felicidades! Acabas de ganar la partida.',
    'You are not spending any money on technology research.': 'No estás gastando nada en investigación tecnológica.',
    // 2.0's messages
    '%s sends a message saying he likes %s.': '%s manda un mensaje: le gusta %s.',
    '%s sends a message saying he doesn’t like %s.': '%s manda un mensaje: no le gusta %s.',
    '%s sends a message saying he owns %s.': '%s manda un mensaje: %s es suyo.',
    '%s sends a message saying she likes %s.': '%s manda un mensaje: le gusta %s.',
    '%s sends a message saying she doesn’t like %s.': '%s manda un mensaje: no le gusta %s.',
    '%s sends a message saying she owns %s.': '%s manda un mensaje: %s es suyo.',
    'You sent a message to %s saying you like %s.': 'Has mandado un mensaje a %s: te gusta %s.',
    'You sent a message to %s saying you don’t like %s.': 'Has mandado un mensaje a %s: no te gusta %s.',
    'You sent a message to %s saying you own %s.': 'Has mandado un mensaje a %s: %s es tuyo.',
    // the remake's own messages (js/engine.js, the patch)
    'A meteor shower destroyed your colony at %s.': 'Una lluvia de meteoritos ha destruido tu colonia en %s.',
    'Your fleet of %s is waiting to refuel before it can continue on to %s.': 'Tu flota de %s espera a repostar antes de seguir hacia %s.',
    '%s says: %s': '%s dice: %s',
    'Your message to %s: %s': 'Tu mensaje a %s: %s',
    'Year %d. Nothing much happened.': 'Año %d. No ha pasado gran cosa.',
    'Year %d:': 'Año %d:',
    'Wow! You won! You have conquered the galaxy. Congratulations!': '¡Uau! ¡Has ganado! Has conquistado la galaxia. ¡Felicidades!',
    'Wow! You won! You and your allies have conquered the galaxy. Congratulations!': '¡Uau! ¡Has ganado! Tus aliados y tú habéis conquistado la galaxia. ¡Felicidades!',
    '%s have just won the game.': '%s acaban de ganar la partida.',
    // ---- the windows' lines: Name a Star, Fix Spending, the won window ----
    'You won the game, so you get to name a star.': 'Has ganado la partida, así que puedes ponerle nombre a una estrella.',
    'Sorry, there’s already a star named  “%s.” Please pick another name.': 'Lo siento, ya hay una estrella llamada “%s”. Elige otro nombre, por favor.',
    'Sorry, there’s already a star named ‘%s’.  Please pick another name.': 'Lo siento, ya hay una estrella llamada “%s”. Elige otro nombre, por favor.',
    'Star names must be 4 to 7 characters long.': 'Los nombres de estrella deben tener de 4 a 7 letras.',
    'Star names must be 2 to 7 characters long.': 'Los nombres de estrella deben tener de 2 a 7 letras.',
    'New Star Name:': 'Nuevo nombre de estrella:',
    '(If you’d rather not name a star, click “OK” with the name blank.)': '(Si prefieres no ponerle nombre a ninguna estrella, haz clic en “OK” con el nombre en blanco.)',
    'You may name a star for use in future games:': 'Puedes ponerle nombre a una estrella para tus próximas partidas:',
    'Congratulations! You may name a star for use in future games:': '¡Felicidades! Puedes ponerle nombre a una estrella para tus próximas partidas:',
    'Sorry, but there is already a star with that name. How about a different name?': 'Lo siento, pero ya hay una estrella con ese nombre. ¿Qué tal otro?',
    'You have no spending problems.': 'No tienes problemas de gastos.',
    'You were overspending at %s. The problem has been fixed.': 'Gastabas demasiado en %s. El problema está arreglado.',
    'You were underspending at %s. The problem has been fixed.': 'Gastabas demasiado poco en %s. El problema está arreglado.',
    'You’re abandoning %s.': 'Estás abandonando %s.',
    'You are abandoning %s.': 'Estás abandonando %s.',
    'Congratulations! You have conquered the galaxy!': '¡Enhorabuena! ¡Has conquistado la galaxia!',
    'Congratulations! You won the game.': '¡Felicidades! Has ganado la partida.',
    'Congratulations!  You won the game.  Game difficulty rating was %s.': '¡Felicidades! Has ganado la partida. La dificultad de la partida era %s.',
    // ---- 3.0.1's, 4.0.5's and 5.0.5's reports ----
    'Spaceward Ho! Version 3.0.1 by Peter Commons.': 'Spaceward Ho! Versión 3.0.1, de Peter Commons.',
    'Spaceward Ho! Version 4.0.5 by Peter Commons.': 'Spaceward Ho! Versión 4.0.5, de Peter Commons.',
    'Spaceward Ho! Version 4.0.3 by Peter Commons.': 'Spaceward Ho! Versión 4.0.3, de Peter Commons.',
    'Spaceward Ho! by Peter Commons.': 'Spaceward Ho!, de Peter Commons.',
    'Spaceward Ho! DEMO by Peter Commons.': 'Spaceward Ho! DEMO, de Peter Commons.',
    'Spaceward Ho! by Peter Commons. Designed by Joe Williams.': 'Spaceward Ho!, de Peter Commons. Diseño de Joe Williams.',
    'Artwork by Howard Vives and Bob Van de walle.': 'Gráficos de Howard Vives y Bob Van de walle.',
    'Designed by Joe Williams.': 'Diseño de Joe Williams.',
    'Palm OS version by Christopher Cotton and Steve Orens of Mobilefreon (tm)': 'Versión para Palm OS de Christopher Cotton y Steve Orens, de Mobilefreon (tm)',
    '%s destroyed your colony at %s. You lost %s of your ships. %s lost %s. You lost %s people.': '%s ha destruido tu colonia en %s. Has perdido %s de tus naves. Pérdidas de %s: %s. Has perdido %s personas.',
    '%s destroyed your colony at %s. You %slost %d of your ships. %s lost %d. You lost %s people.': '%s ha destruido tu colonia en %s. Has perdido%s %d de tus naves. Pérdidas de %s: %d. Has perdido %s personas.',
    '%s survived an enemy attack from %s. You lost %s of your ships. %s lost %s. You lost %s people.': '%s ha resistido un ataque enemigo de %s. Has perdido %s de tus naves. Pérdidas de %s: %s. Has perdido %s personas.',
    '%s survived an attack from %s. You %slost %d of your ships; %s lost %d. You lost %s people.': '%s ha resistido un ataque de %s. Has perdido%s %d de tus naves; pérdidas de %s: %d. Has perdido %s personas.',
    'You %swon a battle at %s. You %slost %d of your ships. %s lost %d.': 'Has ganado%s una batalla en %s. Has perdido%s %d de tus naves. Pérdidas de %s: %d.',
    'You %slost a battle at %s. You %slost %d of your ships. %s lost %d.': 'Has perdido%s una batalla en %s. Has perdido%s %d de tus naves. Pérdidas de %s: %d.',
    '%s has gone nova.': '%s se ha convertido en nova.',
    '%s has just gone supernova. The planet has been obliterated.': '%s acaba de estallar en supernova. El planeta ha quedado pulverizado.',
    '%s has just surrendered to %s.': '%s acaba de rendirse ante %s.',
    '%s has just surrendered.': '%s acaba de rendirse.',
    'You have just surrendered to %s.': 'Acabas de rendirte ante %s.',
    'You have just surrendered.': 'Acabas de rendirte.',
    'You are no longer surrendering to anyone.': 'Ya no te rindes ante nadie.',
    '%s surrenders to you, giving you $%s.': '%s se rinde ante ti y te entrega $%s.',
    '%s surrenders to you, giving you %s metal.': '%s se rinde ante ti y te entrega %s unidades de metal.',
    '%s surrenders to you, giving you the planet %s.': '%s se rinde ante ti y te entrega el planeta %s.',
    '%s’s armageddon device has just been turned on!': '¡%s acaba de encender su máquina del Armagedón!',
    'Whew! %s’s armageddon device was just turned off.': '¡Uf! %s acaba de apagar su máquina del Armagedón.',
    'Oh No! It’s armageddon!': '¡Oh, no! ¡Es el Armagedón!',
    'The armageddon device has caused half of the stars to supernova!': '¡La máquina del Armagedón ha hecho estallar en supernova a la mitad de las estrellas!',
    'Hmm! The armadeddon device was activated, but there wasn’t enough mass in the galaxy to get it to work…': '¡Hum! La máquina del Armagedón se ha activado, pero no había masa suficiente en la galaxia para que funcionara…',
    'Due to a lack of funds, one of your fleets can’t be maintained. It is being scrapped.': 'Por falta de fondos, no se puede mantener una de tus flotas. Va camino del desguace.',
    'The amount of energy emanating from %s suggests a big battle just took place.': 'La cantidad de energía que sale de %s hace pensar que acaba de librarse una gran batalla.',
    'The meteor shower destroyed your colony at %s.': 'La lluvia de meteoritos ha destruido tu colonia en %s.',
    'The shock wave from the supernova threw %s metal at %s, killing %s people.': 'La onda expansiva de la supernova ha lanzado %s unidades de metal sobre %s y ha matado a %s personas.',
    'Uh-oh! %s has started growing and is turning bright red in hue!': '¡Ay, ay, ay! ¡%s ha empezado a crecer y se está poniendo de un rojo intenso!',
    'Uh-oh! Having to borrow more ship money to pay all your interest!': '¡Ay, ay, ay! ¡Hay que pedir prestado más dinero para naves y así pagar todos tus intereses!',
    'Uh-oh! Having to borrow more to pay all your interest!': '¡Ay, ay, ay! ¡Hay que pedir más prestado para pagar todos tus intereses!',
    'Warning! After supporting your planets and paying your interest, you have no money to spend!': '¡Atención! Después de mantener tus planetas y pagar tus intereses, ¡no te queda dinero que gastar!',
    'Warning! Ship money is being used to support %s.': '¡Atención! Se está usando el dinero para naves para mantener %s.',
    'Warning! Savings is being used to support %s.': '¡Atención! Se están usando los ahorros para mantener %s.',
    'Weird weather patterns have allowed astronomers to explore certain far away stars.': 'Unos fenómenos meteorológicos muy raros han permitido a los astrónomos explorar algunas estrellas lejanas.',
    'You don’t have enough money! You’re neglecting your planets! Global warming is taking place!': '¡No tienes dinero suficiente! ¡Estás descuidando tus planetas! ¡Se está produciendo un calentamiento global!',
    'You just received %s metal from someone scrapping a fleet over %s.': 'Acabas de recibir %s unidades de metal de alguien que ha desguazado una flota sobre %s.',
    'You just received %s metal from someone scrapping a fleet or from a battle over %s.': 'Acabas de recibir %s unidades de metal de alguien que ha desguazado una flota, o de una batalla, sobre %s.',
    'You recovered %s metal from the battle at %s.': 'Has recuperado %s unidades de metal de la batalla de %s.',
    'Your %s technology just jumped to %s.': 'Tu tecnología de %s acaba de saltar a %s.',
    'Your Radical researchers have just made another wild discovery!': '¡Tus investigadores radicales acaban de hacer otro descubrimiento descabellado!',
    'Your radical researchers are hard at work on another discovery!': '¡Tus investigadores radicales trabajan sin descanso en otro descubrimiento!',
    'Your alliance will win the game next turn if it holds!': '¡Tu alianza ganará la partida el turno que viene si aguanta!',
    'Your archaeologists have found ancient scientific documents from a lost civilization. You can now mine more efficiently.': 'Tus arqueólogos han encontrado antiguos documentos científicos de una civilización perdida. Ahora puedes explotar las minas con más eficacia.',
    'Your climatologists have discovered how to terraform planets more efficiently.': 'Tus climatólogos han descubierto cómo terraformar planetas con más eficacia.',
    'Your military training program has improved. Your generals are now smarter.': 'Tu programa de instrucción militar ha mejorado. Tus generales son ahora más listos.',
    'Your mining consortium has just been able to extract an additional %s metal from every planet you have.': 'Tu consorcio minero acaba de sacar %s unidades de metal más de cada uno de tus planetas.',
    'Your scientists have discovered how to turn your monitor from black and white to color!': '¡Tus científicos han descubierto cómo pasar tu monitor de blanco y negro a color!',
    'Your scientists apologize, but they seem to be having “hardware problems.”': 'Tus científicos lo sienten, pero parece que tienen “problemas de hardware”.',
    'Your scientists realize you already are running in color, shrug, and go back off to work.': 'Tus científicos se dan cuenta de que ya funcionas en color, se encogen de hombros y vuelven al trabajo.',
    'Your ship technicians have designed a set of new ships with no development cost.': 'Tus técnicos navales han diseñado una serie de naves nuevas sin coste de desarrollo.',
    'Your ship technicians have designed a set of new ship types with no development cost.': 'Tus técnicos navales han diseñado una serie de tipos de nave nuevos sin coste de desarrollo.',
    'Your ship technicians have designed a decoy ship.  It\'s really weak, but it looks menacing and can help keep your allies in line!': 'Tus técnicos navales han diseñado un señuelo. Es muy débil, pero tiene pinta amenazadora y puede ayudarte a mantener a raya a tus aliados.',
    'Your scientists have invented a decoy ship. It can\'t fight, but it\'s cheap. Amaze your friends and confuse your enemies.': 'Tus científicos han inventado un señuelo. No puede luchar, pero es barato. Asombra a tus amigos y confunde a tus enemigos.',
    'Your mad scientists have created a space monster ship!  It\'s not too powerful, but it doesn\'t cost any metal!': '¡Tus científicos locos han creado una nave monstruo espacial! No es muy poderosa, ¡pero no cuesta nada de metal!',
    'Your sociologists have discovered how to safely increase the maximum population of your planets!': '¡Tus sociólogos han descubierto cómo aumentar sin riesgo la población máxima de tus planetas!',
    'Your spies have stolen some technological secrets from %s!': '¡Tus espías le han robado algunos secretos tecnológicos a %s!',
    'Your “%s” ship type has been scrapped. %s of this type scrapped for %s metal.': 'Tu tipo de nave “%s” ha sido desguazado. %s naves de este tipo desguazadas a cambio de %s unidades de metal.',
    'You have explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s.': 'Has explorado %s. Gravedad: %d,%2.2dG. Temp.: %s. Metal: %s.',
    '%s has explored %s. Gravity: %d.%2.2dG. Temp: %s. Metal: %s.': '%s ha explorado %s. Gravedad: %d,%2.2dG. Temp.: %s. Metal: %s.',
    'You have evacuated %s.': 'Has evacuado %s.',
    '%s has run out of metal. You should probably evacuate it.': '%s se ha quedado sin metal. Quizá deberías evacuarlo.',
    '%s’s fleet of %s has arrived at %s.': 'La flota de %s formada por %s ha llegado a %s.',
    'Your ally %s has just won the game.': 'Tu aliado %s acaba de ganar la partida.',
    '%s has offered to ally with you.': '%s te ofrece una alianza.',
    '%s no longer wants to ally with you.': '%s ya no quiere ser tu aliado.',
    'You have offered to ally with %s.': 'Has ofrecido una alianza a %s.',
    'You no longer want to ally with %s.': 'Ya no quieres ser aliado de %s.',
    'You have formed an alliance with %s.': 'Has formado una alianza con %s.',
    'Your alliance with %s is gone.': 'Tu alianza con %s se ha roto.',
    '%s has offered to be your best buddy.': '%s se ofrece a ser tu mejor amigo.',
    '%s no longer wants to be your best buddy. He just wants to be allies.': '%s ya no quiere ser tu mejor amigo. Solo quiere que seáis aliados.',
    'You have offered to be best buddies with %s.': 'Te has ofrecido a ser el mejor amigo de %s.',
    'You no longer want to be best buddies with with %s. You just want to be allies.': 'Ya no quieres ser el mejor amigo de %s. Solo quieres que seáis aliados.',
    'You are now best buddies with %s.': 'Ahora %s y tú sois mejores amigos.',
    'Your best buddy relationship with %s is gone. You\'re only allies now.': 'Tu amistad del alma con %s se ha acabado. Ahora solo sois aliados.',
    '%s has just given you $%s.': '%s acaba de regalarte $%s.',
    '%s has just given you %s metal.': '%s acaba de regalarte %s unidades de metal.',
    'You just gave %s $%s.': 'Acabas de regalar a %s $%s.',
    'You just gave %s %s metal.': 'Acabas de regalar a %s %s unidades de metal.',
    // the canned messages (5.0.5's Send Message)
    '%s says, “I want %s.”': '%s dice: “Quiero %s.”',
    '%s says, “You take %s.”': '%s dice: “Quédate tú con %s.”',
    '%s says, “I like %s.”': '%s dice: “Me gusta %s.”',
    '%s says, “I hate %s.”': '%s dice: “Odio %s.”',
    '%s says, “I own %s.”': '%s dice: “%s es mío.”',
    '%s says, “I need money.”': '%s dice: “Necesito dinero.”',
    '%s says, “I need metal.”': '%s dice: “Necesito metal.”',
    '%s says, “Let’s attack %s.”': '%s dice: “Ataquemos %s.”',
    '%s says, “Thank You!”': '%s dice: “¡Gracias!”',
    '%s says, “Sorry!”': '%s dice: “¡Perdón!”',
    '%s says, “#!$@*$&@•™!”': '%s dice: “¡#!$@*$&@•™!”',
    '%s says , "#!$*@%$&!"': '%s dice: “¡#!$*@%$&!”',
    '%s says, “I like planets that are %d.%2.2dG and %s.”': '%s dice: “Me gustan los planetas de %d,%2.2dG y %s.”',
    '%s says, “I saw %s at %s!”': '%s dice: “¡He visto %s en %s!”',
    '%s says, “Look at %s.”': '%s dice: “Mira %s.”',
    '%s is cheating.': '%s está haciendo trampa.',
    'You told %s that you want %s.': 'Le has dicho a %s que quieres %s.',
    'You told %s that you don’t want %s.': 'Le has dicho a %s que no quieres %s.',
    'You told %s that you like %s.': 'Le has dicho a %s que te gusta %s.',
    'You told %s that you hate %s.': 'Le has dicho a %s que odias %s.',
    'You told %s that you own %s.': 'Le has dicho a %s que %s es tuyo.',
    'You told %s that you need money.': 'Le has dicho a %s que necesitas dinero.',
    'You told %s that you need metal.': 'Le has dicho a %s que necesitas metal.',
    'You told %s, “Let’s attack %.*s.”': 'Le has dicho a %s: “Ataquemos %s.”',
    'You told %s, “Thank You!”': 'Le has dicho a %s: “¡Gracias!”',
    'You told %s, “Sorry!”': 'Le has dicho a %s: “¡Perdón!”',
    'You said “#!$@*$&@•™!” to %s.': 'Le has dicho “¡#!$@*$&@•™!” a %s.',
    'You said "!$@*$&@!" to %s.': 'Le has dicho “¡!$@*$&@!” a %s.',
    'You told %s what gravity and temperature you prefer.': 'Le has dicho a %s qué gravedad y qué temperatura prefieres.',
    'You told %s you saw %s at %.*s.': 'Le has dicho a %s que has visto %s en %s.',
    'You told %s all about %s.': 'Le has contado a %s todo sobre %s.',
    // ---- 4.0.5's and 5.0.5's own reports ----
    '%s\'s fleet of biologicals has eaten %s people while refueling at %s.': 'La flota de bionaves de %s se ha comido a %s personas mientras repostaba en %s.',
    'Your fleet of %s has eaten %s people while refueling at %s.': 'Tu flota de %s se ha comido a %s personas mientras repostaba en %s.',
    'Congratulations, %s!   Your population now exceeds %s!': '¡Felicidades, %s! ¡Tu población ya supera los %s!',
    'Oh no!  The Valdez has sprung a leak!  The ecology on %s is in shambles!  The citizens are suing you for negligence for twice your net worth!': '¡Oh, no! ¡El Valdez tiene una vía de agua! ¡La ecología de %s está hecha un desastre! ¡Los ciudadanos te demandan por negligencia por el doble de lo que vales!',
    'You have found a wealth of precious metals and have increased your savings by %s.': 'Has encontrado un tesoro de metales preciosos y tus ahorros han aumentado en %s.',
    'You have improved your recycling program.  You can now get more metal from scrapped ships.': 'Has mejorado tu programa de reciclaje. Ahora sacas más metal de las naves desguazadas.',
    'Sorry, but you have that fleet marked for the scrap heap.  it’s not going anywhere.': 'Lo siento, pero esa flota está marcada para el desguace. No va a ir a ninguna parte.',
    'You now have %s Range Technology (%d).': 'Ahora tienes %s en tecnología de Alcance (%d).',
    'You now have %s Speed Technology (%d).': 'Ahora tienes %s en tecnología de Velocidad (%d).',
    'You now have %s Weapons Technology (%d).': 'Ahora tienes %s en tecnología de Armas (%d).',
    'You now have %s Shield Technology (%d).': 'Ahora tienes %s en tecnología de Escudos (%d).',
    'You now have %s Miniaturization Technology (%d).': 'Ahora tienes %s en tecnología de Miniaturización (%d).',
    'A volcanic eruption at %s has drastically warmed the temperature to %s!': '¡Una erupción volcánica en %s ha disparado la temperatura hasta %s!',
    'Your fleet of %s was dismantled while in hyperspace.': 'Tu flota de %s ha sido desmantelada en el hiperespacio.',
    'Your %s is waiting to refuel before it can continue on to %s.': 'Tu flota de %s espera a repostar antes de seguir hacia %s.',
    'Wow! You seem to be doing really well! Congratulations!': '¡Uau! ¡Parece que te va de maravilla! ¡Felicidades!',
    'Congratulations! You won a %d difficulty game and have earned %s master points.': '¡Felicidades! Has ganado una partida de dificultad %d y te has ganado %s puntos de maestría.',
    'Oh, no! All the metal on %s has suddenly disappeared.': '¡Oh, no! Todo el metal de %s ha desaparecido de repente.',
    'Eeek! A nasty computer bug has broken into your game and started wreaking havoc!': '¡Aaah! ¡Un bicho informático asqueroso se ha colado en tu partida y lo está destrozando todo!',
    'You have built a new research facility; tech spending is now 10% more effective.': 'Has construido un nuevo centro de investigación; ahora el gasto en tecnología rinde un 10% más.',
    'You\'ve raised the prime lending rate and can now earn 50%% higher interest on savings.': 'Has subido el tipo de interés oficial y ahora tus ahorros rinden un 50%% más de intereses.',
    'You have renegotiated your line of credit and can now borrow at a 50%% better interest rate.': 'Has renegociado tu línea de crédito y ahora puedes pedir prestado a un interés un 50%% mejor.',
    'Your %s tech would have just gone up if you hadn’t been playing the demo version!': '¡Tu tecnología de %s habría subido si no estuvieras jugando con la versión de demostración!',
    '%s has just taken over for the computer player %s.': '%s acaba de tomar el relevo del jugador del ordenador %s.',
    'You just watched some of your allies fight a battle at %s.': 'Acabas de ver a algunos de tus aliados librar una batalla en %s.',
    'There were not enough tankers to fully refuel your fleet of %s at %s.': 'No había cisternas suficientes para llenar del todo los depósitos de tu flota de %s en %s.',
    'Your fleet of %s is fully refueled and is ready to depart %s for %s.': 'Tu flota de %s tiene los depósitos llenos y está lista para salir de %s hacia %s.',
    '%s people managed to escape the meteor shower at %s by fleeing to the orbiting colony ship(s).': '%s personas han logrado escapar de la lluvia de meteoritos de %s huyendo a las naves colonia en órbita.',
    'Your %s can no longer reach %s because some of the ships in the fleet don\'t have enough range.': 'Tu flota de %s ya no puede llegar a %s porque algunas naves de la flota no tienen alcance suficiente.',
    'It\'s a miracle! Your scientists have figured out to prevent %s from going supernova.': '¡Es un milagro! Tus científicos han averiguado cómo impedir que %s estalle en supernova.',
    'Wow, that\'s weird! %s is no longer red and appears not to be in danger of going nova.': '¡Uau, qué raro! %s ya no está roja y parece que no corre peligro de convertirse en nova.',
    // ---- the alerts the page shows ----
    'Do you really want to surrender?': '¿De verdad quieres rendirte?',
    'Are you sure you want to destroy half the galaxy? Millions of innocent lives will be lost…': '¿Seguro que quieres destruir media galaxia? Se perderán millones de vidas inocentes…',
    'Whew! It\'s good to see that that clearer heads have prevailed!': '¡Uf! ¡Qué alivio ver que se ha impuesto la sensatez!',
    'Sorry, but you may only give 3 gifts per turn.': 'Lo siento, pero solo puedes hacer 3 regalos por turno.',
    'Sorry, but there is no one else alive to give or send something to.': 'Lo siento, pero no queda nadie vivo a quien regalar o mandar nada.',
    'Do you really want to scrap all existing ships of this type?': '¿De verdad quieres desguazar todas las naves de este tipo?',
    'Sorry, but the battle record for this battle is no longer available.': 'Lo siento, pero el registro de esta batalla ya no está disponible.',
    'Sorry, but your assembly lines are full. You must scrap a ship type first before you can design any more ship types.': 'Lo siento, pero tus cadenas de montaje están llenas. Tienes que desguazar un tipo de nave antes de poder diseñar otro.',
    'Sorry, you don\'t have the details about this battle that your ally fought.': 'Lo siento, no tienes los detalles de esta batalla que libró tu aliado.',
    'Sorry, but you have no additional information about this battle; all you know is that is was pretty big.': 'Lo siento, pero no tienes más información sobre esta batalla; solo sabes que fue bastante gorda.',
    'Sorry, but you have no detailed information about the battle. All you know was that it was big.': 'Lo siento, pero no tienes información detallada de la batalla. Solo sabes que fue gorda.',
    'Sorry, but that fleet doesn\'t have enough fuel to reach the selected destination. You can tell this because there are no arrows on either end of the dragged line.': 'Lo siento, pero esa flota no tiene combustible suficiente para llegar al destino elegido. Lo sabes porque la línea que has arrastrado no tiene flechas en ninguno de sus extremos.',
    'Sorry, but that fleet doesn\'t have enough fuel to reach the selected destination. You can tell this because of the red fleet line.': 'Lo siento, pero esa flota no tiene combustible suficiente para llegar al destino elegido. Lo sabes porque la línea de la flota es roja.',
    'Are you sure you want to build that many scout ships?': '¿Seguro que quieres construir tantos exploradores?',
    'Are you sure you want to build that many tankers?': '¿Seguro que quieres construir tantas cisternas?',
    // the Evacuate questions and their jokes (the stars keep their English names)
    'Do you really want to evacuate %s?': '¿De verdad quieres evacuar %s?',
    'Do you really want to evacuate %s? It\'s a profitable colony!': '¿De verdad quieres evacuar %s? ¡Es una colonia rentable!',
    'Dorothy, I guess that means we\'re not in Kansas anymore…': 'Dorothy, me parece que ya no estamos en Kansas…',
    'Dost thou truly wish to abandon Hope? All is not yet lost!': '¿En verdad deseas abandonar toda Hope? ¡Aún no está todo perdido!',
    'Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!': '¿Abandonar Ship? ¡Abandonen el barco! ¡Todo el mundo a los botes! ¡Las mujeres y los niños primero!',
    // ---- the Radical Research window's projects ----
    'Search for more metal on your planets.': 'Buscar más metal en tus planetas.',
    'Explore distant stars.': 'Explorar estrellas lejanas.',
    'Get lots of money immediately.': 'Conseguir mucho dinero de inmediato.',
    'Improve mining efficiency.': 'Mejorar la eficacia de las minas.',
    'Improve population maximums.': 'Aumentar la población máxima.',
    'Improve terraforming efficiency.': 'Mejorar la eficacia de la terraformación.',
    'Educate battle generals better.': 'Formar mejor a los generales.',
    'Improve recycling program.': 'Mejorar el programa de reciclaje.',
    'Build a new research facility.': 'Construir un nuevo centro de investigación.',
    'Raise the prime lending rate.': 'Subir el tipo de interés oficial.',
    'Renegotiate your line of credit.': 'Renegociar tu línea de crédito.',
    'Build a decoy ship.': 'Construir un señuelo.',
    'Build a biological space monster.': 'Construir un monstruo espacial biológico.',
    'Steal technology from another player.': 'Robar tecnología a otro jugador.',
    'Build a set of ships with no development cost.': 'Construir una serie de naves sin coste de desarrollo.',
    'Improve range tech dramatically.': 'Mejorar muchísimo la tecnología de Alcance.',
    'Improve speed tech dramatically.': 'Mejorar muchísimo la tecnología de Velocidad.',
    'Improve weapons tech dramatically.': 'Mejorar muchísimo la tecnología de Armas.',
    'Improve shields tech dramatically.': 'Mejorar muchísimo la tecnología de Escudos.',
    'Improve mini tech dramatically.': 'Mejorar muchísimo la tecnología de Miniaturización.',
    // 5.0.5's own names (STR# 6260 "Radical Tech Strings", PPob 153; the Palm's and iOS's the same)
    'Search for more metal on your planets': 'Buscar más metal en tus planetas',
    'Explore distant stars': 'Explorar estrellas lejanas',
    'Get lots of money immediately': 'Conseguir mucho dinero de inmediato',
    'Improve mining efficiency': 'Mejorar la eficacia de las minas',
    'Improve population maximums': 'Aumentar la población máxima',
    'Improve terraforming efficiency': 'Mejorar la eficacia de la terraformación',
    'Educate battle generals better': 'Formar mejor a los generales',
    'Improve recycling program': 'Mejorar el programa de reciclaje',
    'Improve technology output': 'Mejorar el rendimiento de la investigación',
    'Increase savings interest rate': 'Subir el interés de los ahorros',
    'Decrease borrowing interest rate': 'Bajar el interés de los préstamos',
    'Build a decoy ship': 'Construir un señuelo',
    'Build a biological space monster': 'Construir un monstruo espacial biológico',
    'Steal technology from another player': 'Robar tecnología a otro jugador',
    'Build a set of ships without development cost': 'Construir una serie de naves sin coste de desarrollo',
    'Improve range tech dramatically': 'Mejorar muchísimo la tecnología de Alcance',
    'Improve speed tech dramatically': 'Mejorar muchísimo la tecnología de Velocidad',
    'Improve weapons tech dramatically': 'Mejorar muchísimo la tecnología de Armas',
    'Improve shields tech dramatically': 'Mejorar muchísimo la tecnología de Escudos',
    'Improve mini tech dramatically': 'Mejorar muchísimo la tecnología de Miniaturización',
    // ---- Armageddon's two questions (4.0.5, strings 299-309; Full Hoedown) ----
    'Do you really want to launch the armageddon device?  It\'ll blow up half of the galaxy!': '¿De verdad quieres lanzar la máquina del Armagedón? ¡Hará saltar por los aires media galaxia!',
    'Do you really want to launch the armageddon device?  Isn\'t life too short as it is?': '¿De verdad quieres lanzar la máquina del Armagedón? ¿No es ya la vida bastante corta?',
    // 3.0.1's Armageddon buttons (DITL 3250-3255), the remake's words
    'Party Pooper': 'Aguafiestas',
    'Abort': 'Abortar',
    'Not Unsure?': '¿Seguro?',
    'Unsure?': '¿Inseguro?',
    'Power': 'Poder',
    'Yeah': 'Sí',
    'Go For It!': '¡Adelante!',
    'Maybe Not': 'Mejor no',
    'That’s It!': '¡Eso es!',
    'Never mind': 'Olvídalo',
    'Do you really want to launch the armageddon device?  I mean, you\'d probably win anyway; why take the chance?': '¿De verdad quieres lanzar la máquina del Armagedón? O sea, seguramente ganarías de todos modos; ¿para qué arriesgarse?',
    'Do you really want to launch the armageddon device?  Doing so decreases the difficulty score by half!': '¿De verdad quieres lanzar la máquina del Armagedón? ¡Eso reduce a la mitad la puntuación de dificultad!',
    'Do you really want to launch the armageddon device?  Odds are you\'ll blow yourself up!': '¿De verdad quieres lanzar la máquina del Armagedón? ¡Lo más probable es que saltes tú también por los aires!',
    'Are you just doing this because you think you\'ll win but it\'s really late and so you want to go to bed?': '¿Haces esto solo porque crees que vas a ganar, pero es tardísimo y te quieres ir a la cama?',
    'Aren\'t you sure you really don\'t want to have nothing to do with not launching the armageddon device?': '¿No estás seguro de que de verdad no quieres no tener nada que ver con no lanzar la máquina del Armagedón?',
    'You\'re just doing this \'cause you enjoy the ultimate feeling of power, aren\'t you???': 'Haces esto solo porque te encanta sentirte todopoderoso, ¿¿¿a que sí???',
    'If you do this, everyone will hate you!  It\'s such a sissy way to try to win, anyway.': '¡Si haces esto, todo el mundo te odiará! Además, intentar ganar así es de gallinas.',
    'Now look, this is NO laughing matter.  You just might get yourself killed!': 'A ver, esto NO es cosa de risa. ¡Podrías acabar muerto!',
    'I get it.  You\'re losing big time and this is the only way you could possibly win!  That\'s it isn\'t it?': 'Ya lo entiendo. Vas perdiendo por goleada y esta es la única forma de que puedas ganar. Es eso, ¿verdad?',
    // ---- the first messages and hints ----
    'Click here to make this message go away. Click on the clock to end your turn.': 'Haz clic aquí para que desaparezca este mensaje. Haz clic en el reloj para terminar tu turno.',
    'Tap here to make this message go away. Tap on the End Turn button to complete the turn.': 'Toca aquí para que desaparezca este mensaje. Toca el botón Fin de turno para terminar el turno.',
    'Click here to make this message go away.': 'Haz clic aquí para que desaparezca este mensaje.',
    'Fleets appear as dots next to your planets. Click one and drag it to send it to another star.': 'Las flotas aparecen como puntos junto a tus planetas. Haz clic en una y arrástrala para mandarla a otra estrella.',
    'Fleets appear as dots next to your planets. To move a fleet, select a star. Drag the ship to send it to another star.': 'Las flotas aparecen como puntos junto a tus planetas. Para mover una flota, elige una estrella. Arrastra la nave para mandarla a otra estrella.',
    'Play with the spending bars. Conquer the galaxy. Gain ranks to unlock more game options. Enjoy.': 'Juega con las barras de gastos. Conquista la galaxia. Sube de rango para desbloquear más opciones de juego. Disfruta.',
    'Play with the spending bars. Conquer the galaxy. Gain ranks to brag to your friends. Enjoy.': 'Juega con las barras de gastos. Conquista la galaxia. Sube de rango para presumir ante tus amigos. Disfruta.',
    'Play with the spending bars. Conquer the galaxy. Enjoy.': 'Juega con las barras de gastos. Conquista la galaxia. Disfruta.',
    'Click and Drag from one star to another to move fleets.': 'Haz clic y arrastra de una estrella a otra para mover flotas.',
    'A dot by a planet means you have ships in orbit there.': 'Un punto junto a un planeta quiere decir que tienes naves en órbita allí.',
    'Dots by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left.': 'Los puntos junto a tu planeta indican que tienes naves en órbita a su alrededor. Las flotas, a la derecha; los satélites, a la izquierda.',
    'Icons by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left.': 'Los iconos junto a tu planeta indican que tienes naves en órbita a su alrededor. Las flotas, a la derecha; los satélites, a la izquierda.',
    'Good planets look "prettier" than bad planets when you explore them.': 'Al explorarlos, los planetas buenos se ven “más bonitos” que los malos.',
    'Range is how far your ships can reach.': 'El Alcance es hasta dónde pueden llegar tus naves.',
    'Satellites can\'t move,, but they shoot just as well as any other ship.': 'Los Satélites no se mueven, pero disparan igual de bien que cualquier otra nave.',
    'There\'s a limited amount of metal in the game.': 'La cantidad de metal de la partida es limitada.',
    'Miniaturization makes ships cost more money, but less metal.': 'La Miniaturización hace que las naves cuesten más dinero, pero menos metal.',
    'Radical Tech can have a variety of effects.': 'La tecnología Radical puede tener efectos muy variados.',
    'Be careful with your metal--it can easily run out.': 'Cuidado con el metal: se acaba enseguida.',
    'Click and hold for a second to cancel a fleet\'s movement.': 'Haz clic y mantén pulsado un segundo para cancelar el movimiento de una flota.',
    'Touch and drag a fleet back to its current star to cancel a fleet\'s movement.': 'Toca una flota y arrástrala de vuelta a su estrella para cancelar su movimiento.',
    'Build Satellites to protect vulnerable planets.': 'Construye Satélites para proteger los planetas vulnerables.',
    'Colonize good planets with Colony ships.': 'Coloniza los planetas buenos con Naves colonia.',
    'Scout ships have higher Range, but lower Weapons and Shields.': 'Los Exploradores tienen más Alcance, pero menos Armas y Escudos.',
    'If your Weapons are higher than the opponent\'s Shields, you\'ll do lots of damage': 'Si tus Armas superan los Escudos del rival, harás mucho daño',
    'If your Shields are higher than the opponents Weapons, he\'ll barely hurt you.': 'Si tus Escudos superan las Armas del rival, apenas te hará daño.',
    'Lots of ships can make up for having low Technology': 'Muchas naves pueden compensar una Tecnología baja',
    'You get money every turn.': 'Recibes dinero cada turno.',
    'Good planets are close to 1.0 G.': 'Los planetas buenos rondan 1,0 G.',
    'Good planets are close to 72 degrees.': 'Los planetas buenos rondan los 72 grados (Fahrenheit).',
    'Good planets are close to 72°F (20°C).': 'Los planetas buenos rondan los 72°F (20°C).',
    'Each player has a different idea of what a good planet is.': 'Cada jugador tiene su propia idea de lo que es un buen planeta.',
    'If a planet is over 2.5 G or below 0.4 G, it will never make a profit.': 'Un planeta de más de 2,5 G o de menos de 0,4 G nunca será rentable.',
    'Abandon bad planets after you strip-mine them.': 'Abandona los planetas malos después de exprimir sus minas.',
    'Terraforming improves a planet\'s temperature.': 'La terraformación mejora la temperatura de un planeta.',
    'Mining takes metal from a planet and puts it into your reserve.': 'La minería saca el metal de un planeta y lo guarda en tu reserva.',
    'Ship savings puts money away for shipbuilding.': 'El ahorro para naves aparta dinero para construir naves.',
    'Savings puts money away for shipbuilding.': 'Los ahorros apartan dinero para construir naves.',
    'Savings generates extra income.': 'Los ahorros generan ingresos extra.',
    'If you go into debt, part of your income goes to pay interest .': 'Si te endeudas, parte de tus ingresos se va en pagar intereses.',
    'Ships with higher Speed Tech shoot first.': 'Las naves con más tecnología de Velocidad disparan primero.',
    'If you have a fleet with fighters and a colony ship, mark the colony ship to arrive late. It\'ll probably survive longer.': 'Si tienes una flota con cazas y una nave colonia, marca la nave colonia para que llegue tarde. Seguramente sobrevivirá más tiempo.',
    'Ships in a fleet that arrive late may miss the worst initial battle.': 'Las naves de una flota que llegan tarde pueden librarse de lo peor de la primera batalla.',
    'Offensive ships attack better but defend worse.': 'Las naves ofensivas atacan mejor, pero se defienden peor.',
    'Defensive ships defend better but attack worse.': 'Las naves defensivas se defienden mejor, pero atacan peor.',
    'There\'s a contextual menu in the map window for convenience.': 'Para tu comodidad, la ventana del mapa tiene un menú contextual.',
    'Hold down the option key and click planets to specify your fleet\'s path more exactly.': 'Mantén pulsada la tecla Opción y haz clic en los planetas para marcar con más precisión la ruta de tu flota.',
    'Put multiple ships in the same fleet with Organize Fleets. ': 'Junta varias naves en una misma flota con Organizar flotas.',
    'Option-drag in Organize Fleets to split up ship piles.': 'En Organizar flotas, arrastra con la tecla Opción para separar los montones de naves.',
    'Use the Organize Fleets dialog to split up ship piles.': 'Usa el cuadro Organizar flotas para separar los montones de naves.',
    'Use the graph to see how well you\'re doing technology-wise vs. the other players.': 'Usa el gráfico para ver cómo vas en tecnología frente a los demás jugadores.',
    'The first person in the player list is winning.': 'El primero de la lista de jugadores va ganando.',
    'If you\'ve just started, you might want to try turning on auto-play and watching.': 'Si acabas de empezar, prueba a activar el juego automático y mirar.',
    'If you and your allies arrive at  a star in the same turn, they\'ll fight side-by-side in battle.': 'Si tus aliados y tú llegáis a una estrella en el mismo turno, lucharéis codo con codo en la batalla.',
    'Armageddons make the galaxy smaller.': 'Los Armagedones hacen la galaxia más pequeña.',
    'Touch outside of a dialog to cancel that dialog without making any changes.': 'Toca fuera de un cuadro de diálogo para cerrarlo sin cambiar nada.',
    'Technology bars can be adjusted with a touch of your finger.': 'Las barras de tecnología se ajustan con un toque del dedo.',
    // ---- the Palm's own hints and first messages ----
    'To cancel a fleet’s movement, make sure that fleet is selected in the Ship Info window and click the origin planet. You can also use the ‘Cancel Fleet Trip’ menu item in the ‘Ships’ menu.': 'Para cancelar el movimiento de una flota, asegúrate de que esa flota esté seleccionada en la ventana Ship Info y haz clic en el planeta de origen. También puedes usar la opción “Cancel Fleet Trip” del menú “Ships”.',
    'There are menus and menu shortcuts in the Galaxy screen for your convenience.': 'Para tu comodidad, la pantalla Galaxia tiene menús y atajos de menú.',
    'The computer will help choose the best path possible for your fleets.': 'El ordenador te ayudará a elegir la mejor ruta posible para tus flotas.',
    'Change the battle attitude of ships in your fleets in the Organize Fleets screen.': 'Cambia la actitud en combate de las naves de tus flotas en la pantalla Organizar flotas.',
    'The Enemy and Allies screen can show who your friends and enemies are. It also so shows who is doing the best.': 'La pantalla Enemigos y aliados te muestra quiénes son tus amigos y tus enemigos. También muestra a quién le va mejor.',
    'The first person in the Enemies and Allies list is winning.': 'El primero de la lista de Enemigos y aliados va ganando.',
    'Click the G button to see the Galaxy, click the $ button to see the Spendingscreen and click the H button to see these messages.': 'Haz clic en el botón G para ver la Galaxia, en el botón $ para ver la pantalla de Gastos y en el botón H para ver estos mensajes.',
    'Fleets appear as icons next to your planets. To send a fleet to another planet, select it and then drag it to the new planet.': 'Las flotas aparecen como iconos junto a tus planetas. Para mandar una flota a otro planeta, selecciónala y arrástrala hasta el nuevo planeta.',
  },
  // the tech names (5.0.5's lists, 4.0.5's), as the reports fill them in:
  // the jokes kept, in Spanish (the song's "bikini amarillo", Speedy
  // González, the Hobbit's "ida y vuelta")
  techs: {
    'Topping off the Tanks': 'Llenar el depósito',
    'Fusion Pile': 'Pila de fusión',
    'Magneto-Hydrodynamic Power': 'Energía magnetohidrodinámica',
    'Allotropic Iron': 'Hierro alotrópico',
    'Gravitic Battery': 'Batería gravítica',
    'Quantum Energy Storage': 'Almacén de energía cuántica',
    Singularity: 'Singularidad',
    'Plasma Siphon': 'Sifón de plasma',
    'Muon Ladder': 'Escalera de muones',
    'There and Back': 'Ida y vuelta',
    'Quark Grinder': 'Molinillo de quarks',
    'Pulsar Radiant': 'Radiador púlsar',
    'Anti-Matter': 'Antimateria',
    'Star Harness': 'Arnés estelar',
    'Solar Sail': 'Vela solar',
    'Ion Rocket': 'Cohete iónico',
    'Gravitic Slingshot': 'Honda gravitatoria',
    'Fusion Dump Drive': 'Motor de descarga de fusión',
    'Relativity Drive': 'Motor relativista',
    'Trans-Light': 'Translumínico',
    Hyperspace: 'Hiperespacio',
    'Rift Drive': 'Motor de grieta',
    'Hawking Propulsion System': 'Sistema de propulsión Hawking',
    'Hyper-Rift Drive': 'Motor de hipergrieta',
    'PowerPC™': 'PowerPC™',
    PowerPC: 'PowerPC',
    'Trans-Rift Hyper Drive': 'Hipermotor transgrieta',
    'Hawking Trans-Hyper Drive': 'Motor transhiper Hawking',
    'Time Distortion': 'Distorsión temporal',
    'Quantum Continuum': 'Continuo cuántico',
    'Already There': 'Ya has llegado',
    'Speedy Gonzalez™': 'Speedy González™',
    'Speedy Gonzalez': 'Speedy González',
    Teleportation: 'Teletransporte',
    'Yesterday Drive': 'Motor de ayer',
    'Mass Driver Cannon': 'Cañón acelerador de masas',
    'Laser 20': 'Láser 20',
    Turbolaser: 'Turboláser',
    Maser: 'Máser',
    'Gamma-Ray Laser': 'Láser de rayos gamma',
    'Spectrum Cannon': 'Cañón espectral',
    'Energy Ball': 'Bola de energía',
    'Nuclear Magnetic Resonance': 'Resonancia magnética nuclear',
    'Phase Disruption': 'Disrupción de fase',
    'Focused Quark Beam': 'Haz de quarks concentrado',
    'Hard Pixel': 'Píxel duro',
    'Tachyon Cannon': 'Cañón de taquiones',
    '+5 Rustproof Vorpal': 'Espada vorpal inoxidable +5',
    'Hyperspace Pulse': 'Pulso hiperespacial',
    'Delta Particle Stream': 'Chorro de partículas delta',
    'Neutron Compression': 'Compresión de neutrones',
    'Nova Cannon': 'Cañón nova',
    'Galactic Disruption': 'Disrupción galáctica',
    'Advanced Space-Time Annihilation': 'Aniquilación espaciotemporal avanzada',
    'Armored Hull': 'Casco blindado',
    'Mass Repulser': 'Repulsor de masas',
    'Energy Dispersion': 'Dispersión de energía',
    Deflector: 'Deflector',
    'Energy Bonded Armor': 'Blindaje de enlace energético',
    'Anti-Energy': 'Antienergía',
    'Quark Shell': 'Coraza de quarks',
    'Delta Wave': 'Onda delta',
    'Energy Injestor': 'Tragaenergía',
    'Refractor Field': 'Campo refractor',
    'Holographic Decoy': 'Señuelo holográfico',
    'Stasis Flicker': 'Parpadeo de estasis',
    'Conversion Field': 'Campo de conversión',
    'Tao Wave': 'Onda tao',
    'Gluon Armor': 'Blindaje de gluones',
    'Hide behind a big rock': 'Esconderse detrás de una roca grande',
    '+5 Blessed Plate Mail': 'Armadura de placas bendita +5',
    'Displacer Field': 'Campo desplazador',
    'Integrated Circuit': 'Circuito integrado',
    'Integrated Chip': 'Chip integrado',
    'Large Scale Integration': 'Integración a gran escala',
    VLSI: 'VLSI',
    Wonkavision: 'Wonkavisión',
    'Ultra-microscopic': 'Ultramicroscópico',
    Nanoscopic: 'Nanoscópico',
    'Advanced Nanoscopic': 'Nanoscópico avanzado',
    'Really Amazingly Small': 'Pero que asombrosamente pequeño',
    'Yellow Polka Dot Bikini': 'Bikini amarillo de lunares',
    'Sub-Atomic': 'Subatómico',
    'Partial Lepton': 'Leptón parcial',
    Quark: 'Quark',
    'Sub-Quark': 'Subquark',
    'Micro-Quark': 'Microquark',
    'Nano-Quark': 'Nanoquark',
    'Advanced Nano-Quark': 'Nanoquark avanzado',
    'Bikini Again (Thought it was funny)': 'Otra vez el bikini (nos hizo gracia)',
    'Quantum Superstring': 'Supercuerda cuántica',
    'Sub-Quantum Superstring': 'Supercuerda subcuántica',
    // (4.0.5's Mini 20, which is the credit line)
    'Spaceward Ho! Version 4.0.5 by Peter Commons.': 'Spaceward Ho! Versión 4.0.5, de Peter Commons.',
  },
  words: {
    // 3.0.1's and 4.0.5's Send Message groups
    Everyone: 'Todos', 'Your Allies': 'Tus aliados', 'Your Buddies': 'Tus mejores amigos',
  },
  // the game's things: the classes (singular, plural, and "one": un / una),
  // the techs' own names, the fillings
  classes: {
    scout: ['Explorador', 'Exploradores', 'un'], dread: ['Acorazado', 'Acorazados', 'un'], fighter: ['Caza', 'Cazas', 'un'],
    tanker: ['Cisterna', 'Cisternas', 'una'], colony: ['Nave colonia', 'Naves colonia', 'una'], satellite: ['Satélite', 'Satélites', 'un'],
    bio: ['Bionave', 'Bionaves', 'una'], decoy: ['Señuelo', 'Señuelos', 'un'],
  },
  fill: {
    You: 'Tú', 'Your enemies': 'tus enemigos', 'and your allies ': ' junto a tus aliados', 'A meteor shower': 'Una lluvia de meteoritos', hyperspace: 'hiperespacio',
    Range: 'Alcance', Speed: 'Velocidad', Weapons: 'Armas', Shields: 'Escudos', Miniaturization: 'Miniaturización',
  },
  // the windows the rules carry (1.2's and 2.0's battle window, Name a Star's
  // buttons, the Options menu, the Explored Planets list, Force End Turn)
  win: {
    battle: { head: ['Resumen de la batalla', 'en %s, año %d:'], won: ['¡Felicidades!', '¡Has ganado la batalla!'], lost: ['Por desgracia,', 'has perdido la batalla'],
      dead: 'Bajas: %d %s', deadPeople: '%s muertos', people: '%s habitantes', killed: '%s habitantes muertos', survived: '%s de %s habitantes han sobrevivido',
      review: 'Batalla en %s, año %d' },
    battleLines: { noInfo: 'No tienes ninguna información.', destroyed: 'Te han destruido al instante.' },
    options: { battleSpeed: { menu: 'Velocidad de las batallas…', title: 'Velocidad de las batallas:', fast: 'Rápida', slow: 'Lenta', full: 'Batallas totalmente animadas' },
      poll: { menu: 'Frecuencia de consulta…', title: 'Frecuencia de consulta:', fast: 'Rápida', slow: 'Lenta', unit: 'Segundos',
        note: 'Una consulta frecuente te avisa antes de las actualizaciones del turno, pero puede ralentizar el ordenador.' },
      showMessages: 'Mostrar los mensajes de sucesos', reviewBattles: 'Revisar las batallas anunciadas', reports: 'Ventana de informes' },
    exploredList: { title: 'Lista de todas las estrellas exploradas:', go: 'Ir a la estrella', noClimate: 'Sin datos de clima.', own: 'Propia', free: 'Explorada', enemy: 'Enemiga' },
    forceEndTurn: '%s, %s de los %s jugadores aún no han terminado su turno.\n\n¿De verdad quieres forzar el fin del turno, o prefieres esperar a que terminen?',
    nameAStarPalm: { title: '¡Felicidades!', ok: '¡Genial!', cancel: 'Mejor no' },
  },
},
};
if (typeof module !== 'undefined') module.exports = HOLANG_REMAKE; else root.HOLANG_REMAKE = HOLANG_REMAKE;
})(this);
