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
//   words: whole fillings (a tech's name ...), as say.words
// Each English line is a template: %s and %d are filled in order, %2$s by place.
(function (root) {
'use strict';
const HOLANG_REMAKE = {
// =====================================================================
// French: from iOS's French (fr.lproj), itself 1.2F's for the old lines
// =====================================================================
fr: {
  over: {
    // iOS 37 left "You" in English and lost the counts' places
    'You %slost a battle at %s. You %slost %d of your ships. %s lost %d.': 'Vous%1$s avez perdu une bataille à %2$s. Vous%3$s avez perdu %4$d de vos vaisseaux. %5$s en a perdu %6$d.',
  },
  own: {
    // ---- 5.0.5 (and the Palm): its own lines that iOS rewrote or left out ----
    // the first messages (hints 1-3, the mouse's words where iOS has the finger's)
    'Click here to make this message go away. Click on the clock to end your turn.': 'Cliquez ici pour faire disparaître ce message. Cliquez sur l\'horloge pour conclure le tour.',
    'Fleets appear as dots next to your planets. Click one and drag it to send it to another star.': 'Les flottes figurent sous forme de points près de vos planètes. Cliquez sur l\'une d\'elles et tirez-la vers une autre étoile pour l\'y envoyer.',
    'Play with the spending bars. Conquer the galaxy. Gain ranks to unlock more game options. Enjoy.': 'Modifiez les barres de dépenses. Partez à la conquête de la galaxie. Gagnez des grades pour débloquer d\'autres options de jeu. Amusez-vous.',
    // the hints iOS dropped or rewrote for touch
    'Click and hold for a second to cancel a fleet\'s movement.': 'Cliquez et maintenez le bouton une seconde pour annuler le déplacement d\'une flotte.',
    'There\'s a contextual menu in the map window for convenience.': 'Pour plus de commodité, la fenêtre de la carte a un menu contextuel.',
    'Hold down the option key and click planets to specify your fleet\'s path more exactly.': 'Maintenez la touche option enfoncée et cliquez sur des planètes pour préciser le trajet de votre flotte.',
    'Option-drag in Organize Fleets to split up ship piles.': 'Dans "Organiser Flottes", tirez avec la touche option pour séparer les groupes de vaisseaux.',
    'Use the graph to see how well you\'re doing technology-wise vs. the other players.': 'Utilisez le graphique pour voir où en est votre technologie par rapport à celle des autres joueurs.',
    // the alert for a drag out of reach (iOS has its red line)
    'Sorry, but that fleet doesn\'t have enough fuel to reach the selected destination. You can tell this because there are no arrows on either end of the dragged line.':
      'Désolé, mais cette flotte ne dispose pas d\'assez de carburant pour atteindre la destination choisie. Vous pouvez le savoir grâce à l\'absence de flèches aux extrémités de la ligne tirée.',
    // the Evacuate questions (5.0.5's, the Palm's "Ship")
    'Do you really want to evacuate %s? It\'s a profitable colony!': 'Voulez-vous vraiment abandonner %s ? C\'est une colonie profitable !',
    'Do you really want to evacuate %s?': 'Voulez-vous vraiment abandonner %s ?',
    'Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!': 'Abandonner le navire ? Abandonnez le navire ! Tout le monde quitte le navire ! Les femmes et les enfants d\'abord !',
    // the remake's own line for a turn with no news (js/skins/classic/ui.js)
    'Year %d. Nothing much happened.': 'Année %d. Rien de spécial ne s\'est passé.',
    // ---- the Palm (5.0's code): its own hints, first messages and decoy ----
    'Icons by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left.': 'Des icônes près d\'une planète signifient que vous y avez des vaisseaux en orbite. Les flottes sont à droite, les satellites à gauche.',
    'To cancel a fleet’s movement, make sure that fleet is selected in the Ship Info window and click the origin planet. You can also use the ‘Cancel Fleet Trip’ menu item in the ‘Ships’ menu.':
      'Pour annuler le déplacement d\'une flotte, sélectionnez-la dans la fenêtre Ship Info et cliquez sur sa planète d\'origine. Vous pouvez aussi utiliser la commande "Cancel Fleet Trip" du menu "Ships".',
    'There are menus and menu shortcuts in the Galaxy screen for your convenience.': 'Pour plus de commodité, l\'écran Galaxie a des menus et des raccourcis de menu.',
    'The computer will help choose the best path possible for your fleets.': 'L\'ordinateur vous aide à choisir le meilleur trajet possible pour vos flottes.',
    'Change the battle attitude of ships in your fleets in the Organize Fleets screen.': 'Changez l\'attitude au combat des vaisseaux de vos flottes dans l\'écran "Organiser Flottes".',
    'The Enemy and Allies screen can show who your friends and enemies are. It also so shows who is doing the best.': 'L\'écran Ennemis et Alliés vous montre qui sont vos amis et vos ennemis. Il montre aussi qui s\'en sort le mieux.',
    'The first person in the Enemies and Allies list is winning.': 'Le joueur en tête de la liste Ennemis et Alliés est en train de gagner.',
    'Click the G button to see the Galaxy, click the $ button to see the Spendingscreen and click the H button to see these messages.': 'Cliquez sur le bouton G pour voir la Galaxie, sur le bouton $ pour voir l\'écran des Dépenses et sur le bouton H pour voir ces messages.',
    'Fleets appear as icons next to your planets. To send a fleet to another planet, select it and then drag it to the new planet.': 'Les flottes figurent sous forme d\'icônes près de vos planètes. Pour envoyer une flotte vers une autre planète, sélectionnez-la puis tirez-la vers la nouvelle planète.',
    'Palm OS version by Christopher Cotton and Steve Orens of Mobilefreon (tm)': 'Version Palm OS par Christopher Cotton et Steve Orens de Mobilefreon (tm)',
    // (4.0.5's decoy too)
    'Your ship technicians have designed a decoy ship. It\'s really weak, but it looks menacing and can help keep your allies in line!': 'Vos techniciens viennent de concevoir un vaisseau leurre. Il est vraiment faible, mais il a l\'air menaçant et peut aider à garder vos alliés dans le droit chemin !',
    // ---- 4.0.5 (Windows and Mac) and 3.0.1 ----
    '%s destroyed your colony at %s.  You lost %s of your ships. %s lost %s.  You lost %s people.': '%s vous a vaincu à %s. Vous avez perdu %d de vos vaisseaux. %s en a perdu %d. Vous avez perdu %s habitant(s).',
    '%s survived an enemy attack from %s.  You lost %s of your ships.  %s lost %s.  You lost %s people.': '%s a résisté à une attaque de %s. Vous avez perdu %d de vos vaisseaux. %s en a perdu %d. Vous avez perdu %s habitant(s).',
    // (iOS's French 4 says just this, for its own longer English)
    'A dot by a planet means you have ships in orbit there.': 'Un point près d\'une planète signifie que vous y avez des vaisseaux en orbite.',
    // (iOS's French 2 says just this, without the ranks)
    'Play with the spending bars. Conquer the galaxy. Enjoy.': 'Modifiez les barres de dépenses. Partez à la conquête de la galaxie. Amusez-vous.',
    'Click here to make this message go away.': 'Cliquez ici pour faire disparaître ce message.',
    'Click and Drag from one star to another to move fleets.': 'Cliquez et tirez d\'une étoile à une autre pour déplacer vos flottes.',
    'Good planets are close to 72 degrees.': 'Les belles petites planètes sont proches de 72 degrés.',
    'Ship savings puts money away for shipbuilding.': 'L\'épargne des vaisseaux met de l\'argent de côté pour leur construction.',
    'Spaceward Ho! Version 4.0.5 by Peter Commons.': 'Spaceward Ho! Version 4.0.5 par Peter Commons.',
    // the remake's own messages (js/engine.js)
    'Your fleet of %s is waiting to refuel before it can continue on to %s.': 'Votre flotte de %s attend de faire le plein avant de pouvoir repartir pour %s.',
    'Wow! You won! You have conquered the galaxy. Congratulations!': 'Wow ! Vous avez gagné ! Vous avez conquis la galaxie. Félicitations !',
    'Wow! You won! You and your allies have conquered the galaxy. Congratulations!': 'Wow ! Vous avez gagné ! Vous et vos alliés avez conquis la galaxie. Félicitations !',
    '%s have just won the game.': '%s viennent juste de gagner.',
    'Spaceward Ho! Version 4.0.3 by Peter Commons.': 'Spaceward Ho! Version 4.0.3 par Peter Commons.',
    'Spaceward Ho! Version 3.0.1 by Peter Commons.': 'Spaceward Ho! Version 3.0.1 par Peter Commons.',
    // 3.0.1's Name a Star rule (2.0's said 4 to 7)
    'Star names must be 2 to 7 characters long.': 'Le nom doit comprendre entre 2 et 7 lettres.',
    'Congratulations!  You won the game.  Game difficulty rating was %s.': 'Félicitations ! Vous avez gagné la partie. La difficulté du jeu était de %s.',
    'Congratulations! You won the game.': 'Félicitations ! Vous avez gagné la partie.',
    'Sorry, but you have that fleet marked for the scrap heap.  it’s not going anywhere.': 'Désolé, mais cette flotte est marquée pour la ferraille. Elle ne va nulle part.',
    'Uh-oh!  Having to borrow more ship money to pay all your interest!': 'Oh-oh ! Devoir emprunter davantage sur l\'argent des vaisseaux pour payer vos intérêts...',
    'Warning!  Ship money is being used to support %s.': 'Attention ! L\'argent destiné à vos vaisseaux est utilisé pour soutenir %s.',
    'You have conquered the galaxy!': 'Vous avez conquis la galaxie !',
    'You just received %s metal from someone scrapping a fleet over %s.': 'Vous venez de recevoir %s unités de métal de quelqu\'un qui recyclait une flotte au-dessus de %s.',
    // Windows' own curse ("#!$*@%$&!", "!$@*$&@!") in iOS's 49 and 65
    '%s says , "#!$*@%$&!"': '%s dit: “#!$*@%$&!”',
    'You said "!$@*$&@!" to %s.': 'Je crois bien que vous avez dit “!$@*$&@!” à %s...',
    // Armageddon's two questions (4.0.5, strings 299-309)
    'Do you really want to launch the armageddon device?  It\'ll blow up half of the galaxy!': 'Voulez-vous vraiment déclencher Armageddon, l\'arme ultime ? Elle va faire sauter la moitié de la galaxie !',
    'Do you really want to launch the armageddon device?  Isn\'t life too short as it is?': 'Voulez-vous vraiment déclencher Armageddon, l\'arme ultime ? La vie n\'est-elle pas déjà assez courte ?',
    'Do you really want to launch the armageddon device?  I mean, you\'d probably win anyway; why take the chance?': 'Voulez-vous vraiment déclencher Armageddon, l\'arme ultime ? Vous gagneriez sans doute de toute façon ; pourquoi prendre le risque ?',
    'Do you really want to launch the armageddon device?  Doing so decreases the difficulty score by half!': 'Voulez-vous vraiment déclencher Armageddon, l\'arme ultime ? Cela divise par deux la difficulté de la partie !',
    'Do you really want to launch the armageddon device?  Odds are you\'ll blow yourself up!': 'Voulez-vous vraiment déclencher Armageddon, l\'arme ultime ? Il y a de fortes chances que vous sautiez avec !',
    'Are you just doing this because you think you\'ll win but it\'s really late and so you want to go to bed?': 'Vous faites ça juste parce que vous pensez gagner, mais qu\'il est vraiment tard et que vous voulez aller vous coucher ?',
    'Aren\'t you sure you really don\'t want to have nothing to do with not launching the armageddon device?': 'N\'êtes-vous pas sûr de ne vraiment pas vouloir n\'avoir rien à voir avec le non-déclenchement d\'Armageddon ?',
    'You\'re just doing this \'cause you enjoy the ultimate feeling of power, aren\'t you???': 'Vous faites ça juste pour le plaisir de vous sentir tout-puissant, hein ???',
    'If you do this, everyone will hate you!  It\'s such a sissy way to try to win, anyway.': 'Si vous faites ça, tout le monde va vous détester ! C\'est une façon tellement mauviette d\'essayer de gagner, de toute façon.',
    'Now look, this is NO laughing matter.  You just might get yourself killed!': 'Écoutez, ce n\'est PAS une plaisanterie. Vous pourriez bien y laisser votre peau !',
    'I get it.  You\'re losing big time and this is the only way you could possibly win!  That\'s it isn\'t it?': 'J\'ai compris. Vous êtes en train de perdre lamentablement et c\'est le seul moyen pour vous de gagner ! C\'est ça, hein ?',
  },
  words: {
    // iOS's "et vos alliés" (Misc Strings 39) with the space its reports need ("Vous%s avez perdu")
    'and your allies ': ' et vos alliés',
    // 3.0.1's and 4.0.5's Send Message groups (iOS's "allié", "meilleur ami")
    Everyone: 'Tout le monde', 'Your Allies': 'Vos alliés', 'Your Buddies': 'Vos meilleurs amis',
  },
},
// =====================================================================
// Turkish: from iOS's Turkish (tr.lproj): "sen", the suffixes put straight
// after a name as the official lines do ("%sye", "%sde", "%syi")
// =====================================================================
tr: {
  over: {
    // the credits iOS left in English (marked "!")
    'Spaceward Ho! by Peter Commons.': 'Spaceward Ho!, yazan: Peter Commons.',
    'Spaceward Ho! DEMO by Peter Commons.': 'Spaceward Ho! DEMO, yazan: Peter Commons.',
    'Artwork by Howard Vives and Bob Van de walle.': 'Grafikler: Howard Vives ve Bob Van de walle.',
    'Designed by Joe Williams.': 'Tasarım: Joe Williams.',
    // iOS 11 left "lost" in English (the iOS patch's fix 'trLostWord', 38's words)
    '%s destroyed your colony at %s. You %slost %d of your ships. %s lost %d. You lost %s people.': '%1$s senin koloniyi %2$s de mahvetti. Sen %3$sgemilerinin %4$d tanesini kaybettin. Sen %7$s insan kaybettin.',
    // iOS 14 says the colony now does not belong to the rebels' new master
    'You are not supporting %s enough. The people have revolted and now belong to %s': 'Sen %s yi yeterince desteklemiyorsun. Halk isyan etti ve şimdi %s e ait.',
    // iOS 35 is the exploring report's words ("inceledin")
    'You have colonized %s.': 'Sen %syi kolonileştirdin.',
    // iOS 38 runs the star and the attacker together ("%s%sden") and leaves out the attacker's losses
    '%s survived an attack from %s. You %slost %d of your ships; %s lost %d. You lost %s people.': '%1$s, %2$sden gelen bir hücumdan sağlam çıktı. Sen %3$sgemilerinin %4$d tanesini kaybettin; %5$s %6$d tanesini kaybetti. Sen %7$s tane insan kaybettin.',
    // iOS 62 lost the star
    'You told %s, "Let\'s attack %.*s."': 'Sen %sye "haydi %sye hücum edelim" dedin.',
    // iOS 124 is a second copy of 123 (the iOS patch's fix 'trSpiesReport')
    'Your spies have stolen some technological secrets from %s!': 'Senin casusların %s den bazı teknolojik sırlar çaldı!',
    // iOS 156 says "can no longer reach us"
    'Your %s can no longer reach %s because some of the ships in the fleet don\'t have enough range.': 'Senin %s artık %sye ulaşamıyor çünkü filodaki gemilerin bazılarının menzili yetersiz.',
  },
  own: {
    // ---- 5.0.5 (and the Palm) ----
    'Click here to make this message go away. Click on the clock to end your turn.': 'Bu mesajın kaybolması için buraya tıkla. Sıranı bitirmek için saate tıkla.',
    'Fleets appear as dots next to your planets. Click one and drag it to send it to another star.': 'Filolar senin gezeğenlerinin yakınında nokta olarak gözükür. Başka bir yıldıza göndermek için birine tıkla ve sürükle.',
    'Play with the spending bars. Conquer the galaxy. Gain ranks to unlock more game options. Enjoy.': 'Harcama şeritleri ile oyna. Galaksiyi fethet. Yeni oyun seçeneklerini açmak için derecelere ulaş. Keyiflen.',
    'Click and hold for a second to cancel a fleet\'s movement.': 'Filonun hareketini iptal etmek için ona tıkla ve bir saniye basılı tut.',
    'There\'s a contextual menu in the map window for convenience.': 'Kolaylık olsun diye harita penceresinde bir bağlam menüsü var.',
    'Hold down the option key and click planets to specify your fleet\'s path more exactly.': 'Filonun yolunu daha tam belirlemek için option tuşunu basılı tut ve gezeğenlere tıkla.',
    'Option-drag in Organize Fleets to split up ship piles.': 'Gemi çokluklarını ayırmak için Organize gemilerinde option tuşu ile sürükle.',
    'Use the graph to see how well you\'re doing technology-wise vs. the other players.': 'Teknolojide öteki oyunculara göre ne durumda olduğunu görmek için grafiği kullan.',
    'Sorry, but that fleet doesn\'t have enough fuel to reach the selected destination. You can tell this because there are no arrows on either end of the dragged line.':
      'Üzgünüm, filonun hedefe kadar gidecek yakıtı yok. Bunu anlıyorsunuz çünkü çekilen çizginin iki ucunda da ok yok.',
    'Do you really want to evacuate %s? It\'s a profitable colony!': 'Gerçekten %syi boşaltmak istiyor musun? O kazançlı bir koloni!',
    'Do you really want to evacuate %s?': 'Gerçekten %syi boşaltmak istiyor musun?',
    'Abandon Ship? Abandon Ship! All hands abandon ship! Women and children first!': 'Gemiyi terk et? Gemiyi terk edin! Herkes gemiyi terk etsin! Önce kadınlar ve çocuklar!',
    'Year %d. Nothing much happened.': 'Yıl %d. Pek bir şey olmadı.',
    // ---- the Palm (5.0's code) ----
    'Icons by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left.': 'Gezeğenlerinin yakınındaki simgeler, senin gemilerin gezeğen çevresindeki yörüngelerini gösterir. Filolar sağda, uydular da soldadır.',
    'To cancel a fleet’s movement, make sure that fleet is selected in the Ship Info window and click the origin planet. You can also use the ‘Cancel Fleet Trip’ menu item in the ‘Ships’ menu.':
      'Bir filonun hareketini iptal etmek için, o filonun Ship Info penceresinde seçili olduğuna emin ol ve çıkış gezeğenine tıkla. \'Ships\' menüsündeki \'Cancel Fleet Trip\' komutunu da kullanabilirsin.',
    'There are menus and menu shortcuts in the Galaxy screen for your convenience.': 'Kolaylık olsun diye Galaksi ekranında menüler ve menü kısayolları var.',
    'The computer will help choose the best path possible for your fleets.': 'Bilgisayar, filoların için mümkün olan en iyi yolu seçmene yardım eder.',
    'Change the battle attitude of ships in your fleets in the Organize Fleets screen.': 'Filolarındaki gemilerin savaş tutumunu Organize gemileri ekranında değiştir.',
    'The Enemy and Allies screen can show who your friends and enemies are. It also so shows who is doing the best.': 'Düşmanlar ve Ortaklar ekranı dostlarının ve düşmanlarının kim olduğunu gösterir. En iyi gidenin kim olduğunu da gösterir.',
    'The first person in the Enemies and Allies list is winning.': 'Düşmanlar ve Ortaklar listesindeki ilk kişi oyunu kazanıyor.',
    'Click the G button to see the Galaxy, click the $ button to see the Spendingscreen and click the H button to see these messages.': 'Galaksiyi görmek için G düğmesine, Harcama ekranı için $ düğmesine, bu mesajları görmek için de H düğmesine tıkla.',
    'Fleets appear as icons next to your planets. To send a fleet to another planet, select it and then drag it to the new planet.': 'Filolar senin gezeğenlerinin yakınında simge olarak gözükür. Bir filoyu başka bir gezeğene göndermek için onu seç ve yeni gezeğene sürükle.',
    'Palm OS version by Christopher Cotton and Steve Orens of Mobilefreon (tm)': 'Palm OS sürümü: Christopher Cotton ve Steve Orens, Mobilefreon (tm)',
    'Your ship technicians have designed a decoy ship. It\'s really weak, but it looks menacing and can help keep your allies in line!': 'Senin gemi teknisyenlerin kandırıcı bir gemi tasarladılar. Gerçekten zayıf, fakat tehditkâr görünüyor ve ortaklarını hizada tutmana yardım edebilir!',
    // ---- 4.0.5 (Windows and Mac) and 3.0.1 ----
    '%s destroyed your colony at %s.  You lost %s of your ships. %s lost %s.  You lost %s people.': '%s senin koloniyi %s de mahvetti. Sen gemilerinin %d tanesini kaybettin; %s %d tanesini kaybetti. Sen %s insan kaybettin.',
    '%s survived an enemy attack from %s.  You lost %s of your ships.  %s lost %s.  You lost %s people.': '%s, %sden gelen bir hücumdan sağlam çıktı. Sen gemilerinin %d tanesini kaybettin; %s %d tanesini kaybetti. Sen %s tane insan kaybettin.',
    'A dot by a planet means you have ships in orbit there.': 'Gezeğeninin yanındaki bir nokta, orada yörüngede gemilerin olduğunu gösterir.',
    'Play with the spending bars. Conquer the galaxy. Enjoy.': 'Harcama şeritleri ile oyna. Galaksiyi fethet. Keyiflen.',
    'Click here to make this message go away.': 'Bu mesajın kaybolması için buraya tıkla.',
    'Click and Drag from one star to another to move fleets.': 'Filoları hareket ettirmek için bir yıldızdan ötekine tıkla ve sürükle.',
    'Good planets are close to 72 degrees.': 'İyi uydular 72 dereceye yakındır.',
    'Ship savings puts money away for shipbuilding.': 'Gemi tasarrufu, gemi yapımı için para ayırır.',
    'Spaceward Ho! Version 4.0.5 by Peter Commons.': 'Spaceward Ho! Sürüm 4.0.5, yazan: Peter Commons.',
    // the remake's own messages (js/engine.js)
    'Your fleet of %s is waiting to refuel before it can continue on to %s.': 'Senin %s filon, %sye devam etmeden önce yakıt almak için bekliyor.',
    'Wow! You won! You have conquered the galaxy. Congratulations!': 'Vay anasını! Kazandın! Galaksiyi fethettin. Tebrikler!',
    'Wow! You won! You and your allies have conquered the galaxy. Congratulations!': 'Vay anasını! Kazandın! Sen ve ortakların galaksiyi fethettiniz. Tebrikler!',
    '%s have just won the game.': 'Şu anda %s oyunu kazandı.',
    'Spaceward Ho! Version 4.0.3 by Peter Commons.': 'Spaceward Ho! Sürüm 4.0.3, yazan: Peter Commons.',
    'Spaceward Ho! Version 3.0.1 by Peter Commons.': 'Spaceward Ho! Sürüm 3.0.1, yazan: Peter Commons.',
    'Star names must be 2 to 7 characters long.': 'Yıldız isimleri 2 ile 7 harf arasında olmalı.',
    'New Star Name:': 'Yeni Yıldız İsmi:',
    '(If you’d rather not name a star, click “OK” with the name blank.)': '(Bir yıldıza isim vermek istemiyorsan, ismi boş bırakıp “OK” düğmesine tıkla.)',
    'Sorry, there’s already a star named  “%s.” Please pick another name.': 'Üzgünüm, %s isimli bir yıldız zaten var. Lütfen başka bir isim seç.',
    // Fix Spending (3.0.1, Mac 2.0.1's lines)
    'You have no spending problems.': 'Harcama problemin yok.',
    'You were overspending at %s. The problem has been fixed.': '%sde fazla harcıyordun. Problem çözüldü.',
    'You were underspending at %s. The problem has been fixed.': '%sde az harcıyordun. Problem çözüldü.',
    'You’re abandoning %s.': '%syi terk ediyorsun.',
    'Congratulations!  You won the game.  Game difficulty rating was %s.': 'Tebrikler! Oyunu kazandın. Oyunun zorluk derecesi %s idi.',
    'Congratulations! You won the game.': 'Tebrikler! Oyunu kazandın.',
    'Sorry, but you have that fleet marked for the scrap heap.  it’s not going anywhere.': 'Üzgünüm, o filoyu hurdaya ayırdın. Hiçbir yere gitmiyor.',
    'Uh-oh!  Having to borrow more ship money to pay all your interest!': 'O, O! Faizlerini ödeyebilmek için gemi parasından tekrar borç almak zorundasın.',
    'Warning!  Ship money is being used to support %s.': 'Dikkat! %syi desteklemek için gemi paran kullanılıyor.',
    'You have conquered the galaxy!': 'Galaksiyi fethettin!',
    'You won the game, so you get to name a star.': 'Oyunu kazandın, bu yüzden bir yıldıza isim verebilirsin.',
    'You won a battle at %s. You lost %d of your ships. %s lost %d.': 'Sen %sde savaş kazandın. Sen gemilerinin %d tanesini kaybettin. %s %dyi kaybetti.',
    'You lost a battle at %s. You lost %d of your ships. %s lost %d.': 'Sen %sde savaş kaybettin. Sen gemilerinin %d tanesini kaybettin. %s %dyi kaybetti.',
    'Your %s can no longer reach %s.': 'Senin %s artık %sye ulaşamıyor.',
    'Sorry, there’s already a star named “%s.”  Please pick another name.': 'Üzgünüm, %s isimli bir yıldız zaten var. Lütfen başka bir isim seç.',
    'You just received %s metal from someone scrapping a fleet over %s.': 'Sana %s metal geldi; %s üzerinde filosunu hurdaya çıkaran birinden.',
    '%s says , "#!$*@%$&!"': '%s,"#!$*@%$&!" diyor.',
    'You said "!$@*$&@!" to %s.': 'Sen "!$@*$&@!" dedin %sye.',
    'Do you really want to launch the armageddon device?  It\'ll blow up half of the galaxy!': 'Gerçekten mahşer günü aletini başlatmak istiyor musun? Galaksinin yarısını havaya uçuracak!',
    'Do you really want to launch the armageddon device?  Isn\'t life too short as it is?': 'Gerçekten mahşer günü aletini başlatmak istiyor musun? Hayat zaten yeterince kısa değil mi?',
    'Do you really want to launch the armageddon device?  I mean, you\'d probably win anyway; why take the chance?': 'Gerçekten mahşer günü aletini başlatmak istiyor musun? Yani, herhalde nasılsa kazanırsın; ne diye riske giriyorsun?',
    'Do you really want to launch the armageddon device?  Doing so decreases the difficulty score by half!': 'Gerçekten mahşer günü aletini başlatmak istiyor musun? Bunu yaparsan oyunun zorluk puanı yarıya iner!',
    'Do you really want to launch the armageddon device?  Odds are you\'ll blow yourself up!': 'Gerçekten mahşer günü aletini başlatmak istiyor musun? Büyük ihtimalle kendini de havaya uçurursun!',
    'Are you just doing this because you think you\'ll win but it\'s really late and so you want to go to bed?': 'Bunu sadece kazanacağını düşündüğün, ama saat çok geç olduğu ve yatmak istediğin için mi yapıyorsun?',
    'Aren\'t you sure you really don\'t want to have nothing to do with not launching the armageddon device?': 'Mahşer günü aletini başlatmamakla hiçbir ilgin olmasını gerçekten istemediğinden emin değil misin?',
    'You\'re just doing this \'cause you enjoy the ultimate feeling of power, aren\'t you???': 'Bunu sadece mutlak gücün tadını çıkardığın için yapıyorsun, değil mi???',
    'If you do this, everyone will hate you!  It\'s such a sissy way to try to win, anyway.': 'Bunu yaparsan herkes senden nefret edecek! Zaten kazanmanın ne kadar korkakça bir yolu.',
    'Now look, this is NO laughing matter.  You just might get yourself killed!': 'Bak, bu gülünecek bir şey DEĞİL. Kendini öldürtebilirsin!',
    'I get it.  You\'re losing big time and this is the only way you could possibly win!  That\'s it isn\'t it?': 'Anladım. Fena halde kaybediyorsun ve kazanmanın tek yolu bu! Öyle değil mi?',
  },
  words: {
    // 3.0.1's and 4.0.5's Send Message groups (iOS's "ortak", "en iyi oyun arkadaşı")
    Everyone: 'Herkes', 'Your Allies': 'Ortakların', 'Your Buddies': 'En iyi oyun arkadaşların',
  },
},
};
if (typeof module !== 'undefined') module.exports = HOLANG_REMAKE; else root.HOLANG_REMAKE = HOLANG_REMAKE;
})(this);
