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
  },
  words: {
    // iOS's "et vos alliés" (Misc Strings 39) with the space its reports need ("Vous%s avez perdu")
    'and your allies ': ' et vos alliés',
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
  },
  words: {},
},
};
if (typeof module !== 'undefined') module.exports = HOLANG_REMAKE; else root.HOLANG_REMAKE = HOLANG_REMAKE;
})(this);
