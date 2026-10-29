// Spaceward Ho! web remake — the Amiga 2.0 skin (see js/skins.js)
//
// Spaceward Ho! 2.0 for the Amiga (New World Computing / SOFTGOLD, 1994;
// the Amiga version by Stefan "Bebbo" Franke), in German. The game is the
// DOS 2.0 game: the same pictures in the same order and the same sounds,
// in the 16 colours of the original chip set (tools/extract/amiga.py
// writes them under the DOS skin's names), so this skin is the DOS skin
// (js/skins/dos/ui.js: where each picture and sound goes) on the classic
// skin's logic (js/skins/classic/ui.js), with the Amiga's own screen:
//
// - one hires PAL screen, 640 x 256 pixels, with a blue title bar ("Spaceward
//   Ho! – player in MARS im Jahre 2000": the player, the galaxy, the year),
//   whose menus show while the pointer is on it (or after a right click or
//   a tap there);
// - on the left, stacked panels: the star (its figures and the Terra./Met./
//   Schf. bars, or its owner and when it was seen), the fleets there
//   (Stationiert auf, Tank, Tempo, Voll/Leer or Schrott, the ships), the
//   totals with this turn's changes, and below them either the Technik
//   Ausgaben window (levels and upright research bars) or the players and
//   the spending window (0% linear 100, Sparen, Technik and a bar a planet);
// - on the right, the black map with Amiga scroll bars: open circles at the
//   far zoom, the planet pictures with their names close up, the green ring
//   on the selected star, "Zug Ende / Amiga+Z" at the top left;
// - the reports as white cards at the map's lower left ("--mehr--" while
//   more follow), and the Nachrichten window with the turn's reports;
// - its own windows: Neue Galaxis erstellen, Spieler Registration,
//   Schiffsbau, Typen Manager, Spielervergleich, Aufteilen der Schiffe, the
//   About window and the Startup window, as the screenshots show them
//   (docs/amiga-skin.md); every other window is the classic one in the
//   Workbench look.
//
// The Amiga program (ho!, a self-unpacking (Imploder-style) 68000 executable, unpacked and
// decompiled: docs/amiga-skin.md) builds its windows from tables in its data
// (each item's kind, text, place and size) and draws its panels and map in
// code; this skin follows those, and the screenshots where the program draws
// with the system's own gadgets. Its type is the game's own fonts, HoFont 13,
// 11 and 9, HoBold 11 and HoCond 9 (assets/fonts/Ho*, tools/amiga-font.py).
//
// The Amiga's pixels are twice as tall as they are wide (PAL hires on a 4:3
// monitor): "Amiga monitor (tall pixels)", the default, draws them so;
// "Square pixels" draws the raw 640 x 256 screen. A look option (with the
// Skin and OS look pickers, never in the rules), kept in localStorage
// "ho5.amiga.pixels". Everything on the screen is measured in Amiga pixels
// (CSS --u and --v, the CSS pixels one Amiga pixel takes across and down),
// the map too (T.mapPixel), so the map's clicks, drags and touches land
// where they should in both.
(function () {
'use strict';
const P = 'dos:'; // the DOS skin's name for its (here the Amiga's) pictures
const LS = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* not kept */ } },
};
const TH = () => window.HOTHEME;
const api = () => TH() && TH().api;
const game = () => { const a = api(); return a && a.G; };

// ---------- words: the Amiga's German, its English, and the other languages ----------
// Each entry: [German (the Amiga's own), English, French, Turkish, Spanish].
// The English is the Amiga's own too: the English of Spaceward Ho! 2.1ge1.05
// (6 June 1995, texte.pff, assets/skins/amiga/strings-en.json, numbered as the
// German strings; docs/amiga-21.md), word for word, its flaws included
// ("Typs available", "Please indentify:", "Ok, ok", "other" for Mann), with the
// file's %s / %ld as %1, %2, ... and its backslash line breaks as new lines. A
// word the Amiga English hasn't got (the German's leftovers, the one empty
// string, the remake's own windows) keeps the remake's English. French, Turkish
// and Spanish are the remake's from the Amiga's own words (as js/ui-text.js, in
// the voices docs/translations.md gives), so a game in another language shows
// that language, or English, never German.
const WORDS = {
  profit: ['Profit:', 'Income:', 'Revenu :', 'Kâr:', 'Beneficio:'], pop: ['Bev:', 'Pop:', 'Pop :', 'Nüfus:', 'Pob.:'], temp: ['Temp:', 'Temp:', 'Temp :', 'Isı:', 'Temp.:'], grav: ['Gravit:', 'Gravit:', 'Gravité :', 'Yerçekimi:', 'Gravedad:'], metal: ['Metall:', 'Metal:', 'Métal :', 'Metâl:', 'Metal:'],
  owner: ['Besitzer:', 'Owner:', 'Proprio :', 'Sahip:', 'Dueño:'], nobody: ['Niemand', 'Nobody', 'Personne', 'Hiç kimse', 'Nadie'], empty: ['Unbewohnt', 'Uninhabited', 'Inhabitée', 'Issız', 'Deshabitado'], seen: ['Info Datum:', 'Info date:', 'Date info :', 'Bilgi tarihi:', 'Fecha info:'],
  orders: ['Aufträge:', 'Shipbuilding Queue:', 'Commandes :', 'Siparişler:', 'Encargos:'], none: ['Keine.', 'Nothing.', 'Aucune.', 'Yok.', 'Ninguno.'], unexplored: ['Unerforscht.', 'Unexplored.', 'Inexplorée.', 'Keşfedilmemiş.', 'Sin explorar.'], battleSeen: ['Ein Kampf wurde hier gesehen.', 'A battle was seen here.', 'Une bataille a été vue ici.', 'Burada bir savaş görüldü.', 'Aquí se vio una batalla.'],
  terra: ['Terra.', 'Terra.', 'Terra.', 'Terra.', 'Terra.'], met: ['Met.', 'Met.', 'Mine', 'Maden', 'Minas'], schf: ['Schf.', 'Constr.', 'Prod', 'Gemi', 'Naves'],
  at: ['Stationiert auf: %1', 'Stationed at: %1', 'En orbite à : %1', 'Konum: %1', 'En órbita en: %1'], dest: ['Zielort: %1 (Entf. %2; Dauer %3)', 'Departing to: %1 (Dist. %2; Time %3)', 'Départ pour : %1 (dist. %2 ; %3 tours)', 'Hedef: %1 (uzaklık %2; %3 sıra)', 'Destino: %1 (dist. %2; %3 turnos)'],
  via: ['Unterwegs nach %1 (E %2; D %3) via %4', 'Travelling to %1 (E %2; D %3) via %4', 'Allant à %1 (D %2 ; T %3) via %4', '%1 yolunda (u %2; s %3), %4 üzerinden', 'Rumbo a %1 (d %2; t %3) por %4'], scrapFleet: ['Flotte zum Verschrotten.', 'Fleet to Scrap', 'En recyclage.', 'Hurdaya çıkacak filo.', 'Flota para desguazar.'],
  noFleets: ['Keine Flotten auf diesem Planeten', 'No Fleet Here', 'Pas de vaisseau sur cette planète', 'Bu gezegende filo yok', 'No hay flotas en este planeta'], tank: ['Tank:', 'Fuel:', 'Fuel :', 'Yakıt:', 'Combustible:'], speed: ['Tempo:', 'Speed:', 'Vitesse :', 'Hız:', 'Velocidad:'],
  full: ['Voll', 'Full', 'Plein', 'Dolu', 'Lleno'], emptyShip: ['Leer', 'Empty', 'Vide', 'Boş', 'Vacío'], scrap: ['Schrott', 'Scrap', 'Recycl.', 'Hurda', 'Desguace'],
  metalLeft: ['Metall übrig', 'Metal Reserve', 'Métal dispo', 'Kalan metâl', 'Metal libre'], moneyTotal: ['Geld total', 'Total money', 'Fonds total', 'Toplam para', 'Dinero total'], profitTotal: ['Profit total', 'Total Income', 'Revenu total', 'Toplam kâr', 'Benef. total'],
  tech: ['Technik Ausgaben', 'Tech Spending', 'Technologie', 'Teknoloji', 'Tecnología'], levels: ['Akt. Stufen', 'Curr. Levels', 'Niveaux actuels', 'Seviyeler', 'Niveles'],
  range: ['Weite', 'Range', 'Distance', 'Menzil', 'Alcance'], vel: ['Tempo', 'Speed', 'Vitesse', 'Hız', 'Velocidad'], weapons: ['Waffen', 'Weapon', 'Armes', 'Silâhlar', 'Armas'], shields: ['Schilder', 'Shield', 'Boucliers', 'Kalkanlar', 'Escudos'], mini: ['Mini', 'Mini', 'Mini', 'Mini', 'Mini'], radical: ['Radikal', 'Radical', 'Radicaux', 'Radikal', 'Radical'],
  savings: ['Sparen', 'Savings', 'Epargne', 'Birikim', 'Ahorros'], techBar: ['Technik', 'Tech.', 'Tech', 'Teknoloji', 'Tecnología'], linear: ['linear', 'linear', 'linéaire', 'doğrusal', 'lineal'], log: ['logar.', 'log', 'log', 'log', 'log'],
  news: ['Nachrichten', 'Reports', 'Messages', 'Mesajlar', 'Mensajes'], more: ['--mehr--', '--more--', '--suite--', '--devamı--', '--más--'],
  endTurn: ['Zug Ende', 'Do Turn', 'Fin Tour', 'Sıran Bitti', 'Fin del turno'],
  title: ['Spaceward Ho! - %1 in %2 im Jahre %3', 'Spaceward Ho! V2.1 - %1 in %2 at %3', 'Spaceward Ho! - %1 dans %2 en %3', 'Spaceward Ho! - %1, %2, %3', 'Spaceward Ho! - %1 en %2 en %3'], screen: ['Spaceward Ho! Amiga Version 2.0', 'Spaceward Ho! Amiga Version 2.1', 'Spaceward Ho! Amiga Version 2.0', 'Spaceward Ho! Amiga Sürüm 2.0', 'Spaceward Ho! Amiga Versión 2.0'],
  ok: ['Ok', 'Ok, ok', 'OK', 'Tamam', 'Aceptar'], cancel: ['Abbruch', 'Cancel', 'Annuler', 'İptal', 'Cancelar'],
  build: ['Schiffsbau', 'Ship Building', 'Construction', 'Gemi yapımı', 'Astillero'], queueAt: ['Auftragsliste bei %1', 'Ship Building Queue at %1', 'Commandes à %1', '%1 sipariş listesi', 'Encargos en %1'], types: ['Vorhandene Typen', 'Typs available', 'Types existants', 'Var olan tipler', 'Tipos existentes'], waiting: ['Auf Warteliste:', 'Ship Building Queue:', 'En attente :', 'Sırada:', 'En espera:'],
  done: ['%1% fertig', '%1% ready', '%1 % fini', '%%1 bitti', '%1 % hecho'], newType: ['Neuer Typ…', 'New type…', 'Nouveau type…', 'Yeni tip…', 'Tipo nuevo…'], noShip: ['Keine Schiffsbaugelder: Schf. im Sternfenster.', 'No shipbuilding money: Ship bar in the star panel.', 'Pas d’argent pour la construction : barre Prod dans la fenêtre de l’étoile.', 'Gemi yapımına para yok: yıldız panelinde Gemi çubuğu.', 'No hay dinero para construir: barra Naves en el panel de la estrella.'],
  typeMgr: ['Spaceward Ho! Typen Manager', 'Spaceward Ho! Type Manager', 'Spaceward Ho! Gestion des types', 'Spaceward Ho! Gemi Tipleri', 'Spaceward Ho! Gestor de tipos'], name: ['Name:', 'Name:', 'Nom :', 'Ad:', 'Nombre:'], cls: ['Klasse:', 'Class:', 'Classe :', 'Sınıf:', 'Clase:'], devCost: ['Entw.kosten:', 'Res.cost:', 'Coût dév. :', 'Tasarım bedeli:', 'Coste diseño:'],
  prodCost: ['Prod.kosten:', 'Prod.cost:', 'Coût prod. :', 'Üretim bedeli:', 'Coste unidad:'], built: ['# Gebaut: %1', '# Built: %1', '# Construits : %1', '# Yapılan: %1', '# Construidas: %1'], exist: ['# Existent: %1', '# Exist: %1', '# Existants : %1', '# Var olan: %1', '# Existentes: %1'], scrapType: ['Typ verschrotten', 'Scrap Type', 'Recycler le type', 'Tipi hurdaya çıkar', 'Desguazar el tipo'],
  nameBtn: ['Name', 'Name', 'Nom', 'Ad', 'Nombre'], rename: ['Neuer Name für %1:', 'New name for %1:', 'Nouveau nom pour %1 :', '%1 için yeni ad:', 'Nombre nuevo para %1:'], shields2: ['Schilde:', 'Shield:', 'Boucliers :', 'Kalkanlar:', 'Escudos:'], weite: ['Weite:', 'Range:', 'Distance :', 'Menzil:', 'Alcance:'], tempo: ['Tempo:', 'Speed:', 'Vitesse :', 'Hız:', 'Velocidad:'], waffen: ['Waffen:', 'Weapons:', 'Armes :', 'Silâhlar:', 'Armas:'], miniC: ['Mini:', 'Mini:', 'Mini :', 'Mini:', 'Mini:'],
  rnHelp1: ['Geben Sie einen neuen Namen ein', 'Type new name', 'Tapez un nouveau nom', 'Yeni bir ad yaz', 'Escribe un nombre nuevo'], rnHelp2: ["oder wählen Sie 'Benennen' an", 'or choose `Rename`', 'ou choisissez « Nommer »', "ya da 'Adlandır'ı seç", 'o elige «Nombrar»'],
  autoName: ['Benennen', 'Name', 'Nommer', 'Adlandır', 'Nombrar'], renameTitle: ['Schiff umbenennen', 'Rename Ship', 'Renommer le vaisseau', 'Gemiyi yeniden adlandır', 'Renombrar la nave'],
  noCompare: ['Es gibt keinen Vergleich vor dem Jahre 2010!', 'There is no comparison before 2010!', 'Pas de comparaison avant 2010 !', '2010’dan önce karşılaştırma yok!', '¡No hay comparación antes de 2010!'],
  cWon: ['Sie haben das Spiel im Jahre %1 gewonnen!', 'You won the game in year %1!', 'Vous avez gagné en %1 !', 'Oyunu %1 yılında kazandın!', '¡Ganaste la partida en %1!'], cLost: ['Sie haben das Spiel im Jahre %1 verloren!', 'You lost the game in year %1!', 'Vous avez perdu en %1 !', 'Oyunu %1 yılında kaybettin!', '¡Perdiste la partida en %1!'],
  playerList: ['Liste aller Spieler und ihrer Eigenschaften', 'List of Players and Player characteristics', 'Liste de tous les joueurs et de leurs réglages', 'Bütün oyuncular ve özellikleri', 'Todos los jugadores y sus ajustes'], iqLine: ['Computerintelligenz: %1', 'Computer Intelligence: %1', 'Intelligence des ordinateurs : %1', 'Bilgisayar zekâsı: %1', 'Inteligencia del ordenador: %1'],
  fleetList: ['Liste der Flotten', 'Fleet Roster', 'Liste des flottes', 'Filoların listesi', 'Lista de flotas'], starList: ['Liste der erforschten Planeten', 'List of explored Stars', 'Liste des planètes explorées', 'Keşfedilen gezegenlerin listesi', 'Lista de planetas explorados'], goTo: ['Gehe zu ...', 'Go to ...', 'Aller à ...', 'Git ...', 'Ir a ...'],
  flAt: ['%1 stationiert auf %2.', '%1 stationed at %2.', '%1 en orbite à %2.', '%1, %2 konumunda.', '%1 en órbita en %2.'], flFly: ['%1 fliegt von %2 nach %3. Ankunft: %4.', '%1 travels from %2 to %3. Arrival: %4.', '%1 quittant %2 pour %3. Prévision : %4.', '%1, %2’den %3’e uçuyor. Varış: %4.', '%1 vuela de %2 a %3. Llegada: %4.'],
  flSoll: ['%1 soll %2 %3 erreichen.', '%1 is going to arrive %2 in %3.', '%1 arrivant à %2 en %3.', '%1, %2’e %3 yılında varacak.', '%1 llegará a %2 en %3.'], flStuck: ['%1 hängt auf %2 fest.', '%1 is stuck at %2.', '%1 en panne sèche à %2.', '%1, %2’de mahsur kaldı.', '%1 está varada en %2.'],
  flHyper: ['Diese Flotte ist zur Zeit im Hyperraum, Sie können sie derzeit nicht erreichen!', 'Your fleet is in hyperspace.\nNo way to make contact!', 'Cette flotte est dans l’hyperespace : impossible de la joindre pour l’instant !', 'Bu filo şu an hiperuzayda: ona şimdi ulaşılamaz!', '¡Esta flota está en el hiperespacio: ahora no se puede contactar con ella!'],
  stMine: ['meiner', 'own', 'à moi', 'benim', 'mía'], stNobody: ['erforscht', 'explored', 'explorée', 'keşfedildi', 'explorada'], stEnemy: ['feindlich', 'enemy', 'ennemie', 'düşman', 'enemiga'],
  scrapAsk: ['%1 und alle %2 Schiffe dieses Typs verschrotten?', 'Scrap %1 and all %2 ships of that type?', 'Recycler %1 et les %2 vaisseaux de ce type ?', '%1 ve o tipteki %2 geminin hepsi hurdaya çıkarılsın mı?', '¿Desguazar %1 y las %2 naves de ese tipo?'],
  aslOpen: ['Name der zu öffnenden Galaxis:', 'Name of the galaxy you want to open:', 'Fichier galactique à ouvrir :', 'Açılacak galaksinin adı:', 'Nombre de la galaxia que abrir:'], open2: ['Öffnen...', 'Open...', 'Ouvrir...', 'Aç...', 'Abrir...'],
  aslMissing: ['Kann die Datei nicht lesen!', 'Can`t read file!', 'Impossible de lire le fichier !', 'Dosya okunamıyor!', '¡No se puede leer el archivo!'], // (string 8)
  compare: ['Spielervergleich von noch %1 Spielern im Jahre %2', 'Player comparison of %1 remaining players in year %2', 'Comparaison des %1 joueurs restants en %2', '%2 yılında kalan %1 oyuncunun karşılaştırması', 'Comparación de los %1 jugadores que quedan en %2'], first: ['erster', 'best', 'premier', 'birinci', 'primero'], middle: ['mittlerer', 'average', 'moyen', 'orta', 'medio'], last: ['letzter', 'worst', 'dernier', 'sonuncu', 'último'],
  cProfit: ['Profit', 'Income', 'Revenus', 'Kâr', 'Beneficio'], cMetal: ['Metall', 'Metal', 'Métal', 'Metâl', 'Metal'], cPlanets: ['Planeten', 'Stars', 'Planètes', 'Gezegenler', 'Planetas'], cShips: ['Schiffe', 'Ships', 'Flottes', 'Gemiler', 'Naves'], cShields: ['Schilde', 'Shield', 'Boucliers', 'Kalkanlar', 'Escudos'], info: ['Info', 'Info', 'Info', 'Bilgi', 'Info'],
  split: ['Aufteilen der Schiffe', 'Group Ships', 'Répartir vaisseaux', 'Gemileri düzenle', 'Repartir las naves'], splitHelp1: ['- Stellen Sie die Schiffe beliebig zusammen.', '- Group ships as you want to.', '- Groupez les vaisseaux comme vous voulez.', '- Gemileri istediğin gibi bir araya getir.', '- Junta las naves como quieras.'],
  splitHelp2: ['- Klick mit UMSCHALTEN wählt eine ganze Flotte an.', '- Left mouse button/shift selects whole fleet', '- Un clic avec MAJ choisit toute une flotte.', '- SHIFT ile tıklamak bütün bir filoyu seçer.', '- Un clic con MAYÚS elige una flota entera.'], group: ['Guppieren', 'Group', 'Grouper', 'Grupla', 'Agrupar'], single: ['Vereinzeln', 'Single', 'Séparer', 'Ayır', 'Separar'],
  about: ['Spaceward Ho!', 'Spaceward Ho!', 'Spaceward Ho!', 'Spaceward Ho!', 'Spaceward Ho!'],
  ngTitle: ['Neue Galaxis erstellen', 'Create new galaxy', 'Créer une nouvelle galaxie', 'Yeni bir galaksi yarat', 'Crear una galaxia nueva'], density: ['Sterndichte:', 'Star Density:', 'Densité des étoiles :', 'Yıldız yoğunluğu:', 'Densidad de estrellas:'], shape: ['Art der Galaxis:', 'Kind of Galaxy:', 'Type de galaxie :', 'Galaksi türü:', 'Tipo de galaxia:'], iq: ['Computerintelligenz:', 'Computer Intelligence:', 'Intelligence des ordinateurs :', 'Bilgisayar zekâsı:', 'Inteligencia del ordenador:'],
  size: ['Größe der Galaxis:', 'Galaxy Size:', 'Taille de la galaxie :', 'Galaksinin büyüklüğü:', 'Tamaño de la galaxia:'], computers: ['Anzahl der Computerspieler:', 'Number of Players', 'Nombre de joueurs ordinateurs :', 'Bilgisayar oyuncusu sayısı:', 'Número de jugadores del ordenador:'], bang: ['Urknall', 'Big Bang', 'Big Bang', 'Büyük Patlama', 'Big Bang'], moreSettings: ['Mehr…', 'More…', 'Plus…', 'Daha…', 'Más…'],
  reg: ['Spaceward Ho! Spieler Registration', 'Spaceward Ho! Player Registration', 'Spaceward Ho! Inscription du joueur', 'Spaceward Ho! Oyuncu Kaydı', 'Spaceward Ho! Registro del jugador'], skill: ['Spielstufe:', 'Game Level:', 'Niveau :', 'Beceri:', 'Nivel:'], yourName: ['Ihr Name:', 'Your Name:', 'Votre nom :', 'Adın:', 'Tu nombre:'], password: ['Paßwort:', 'Password:', 'Mot de passe :', 'Parola:', 'Contraseña:'],
  sex: ['Geschlecht:', 'Sex:', 'Sexe :', 'Cinsiyet:', 'Sexo:'], man: ['Mann', 'other', 'Homme', 'Erkek', 'Hombre'], woman: ['Frau', 'female', 'Femme', 'Kadın', 'Mujer'],
  startup: ['Spaceward Ho! Startup', 'Spaceward Ho! Startup', 'Spaceward Ho! Démarrage', 'Spaceward Ho! Başlangıç', 'Spaceward Ho! Inicio'], open: ['Spiel öffnen', 'Open game', 'Ouvrir une partie', 'Oyun aç', 'Abrir partida'], newGame: ['Neues Spiel', 'New game', 'Nouvelle partie', 'Yeni oyun', 'Nueva partida'],
  pixels: ['Pixel', 'Pixels', 'Pixels', 'Pikseller', 'Píxeles'], tall: ['Amiga-Monitor (hohe Pixel)', 'Amiga monitor (tall pixels)', 'Moniteur Amiga (pixels hauts)', 'Amiga monitörü (uzun pikseller)', 'Monitor Amiga (píxeles altos)'], square: ['Quadratische Pixel', 'Square pixels', 'Pixels carrés', 'Kare pikseller', 'Píxeles cuadrados'],
  commands: ['Befehle', 'Orders', 'Ordres', 'Emirler', 'Órdenes'], noCommands: ['(keine)', '(none)', '(aucun)', '(yok)', '(ninguna)'],
  credit1: ['Spaceward Ho! Amiga Version 2.0 von Stefan Bebbo Franke.', 'Spaceward Ho! Amiga version 2.1 by Stefan Bebbo Franke.', 'Spaceward Ho! Amiga Version 2.0 par Stefan Bebbo Franke.', 'Spaceward Ho! Amiga Sürüm 2.0, Stefan Bebbo Franke.', 'Spaceward Ho! Amiga Versión 2.0 de Stefan Bebbo Franke.'],
  credit2: ['Grafiken von Howard Vives.', 'Graphics by Howard Vives.', 'Graphismes de Howard Vives.', 'Grafikler: Howard Vives.', 'Gráficos de Howard Vives.'],
  // the menus (the Amiga's Datei, Optionen, Schiffe, Galaxis, Fenster, Info) and their own items
  mFile: ['Datei', 'Project', 'Fichier', 'Dosya', 'Archivo'], mOptions: ['Optionen', 'Options', 'Options', 'Seçenekler', 'Opciones'], mShips: ['Schiffe', 'Ships', 'Vaisseaux', 'Gemiler', 'Naves'], mGalaxy: ['Galaxis', 'Galaxy', 'Galaxie', 'Galaksi', 'Galaxia'],
  mWindows: ['Fenster', 'Windows', 'Fenêtres', 'Pencereler', 'Ventanas'], mInfo: ['Info', 'Info', 'Info', 'Bilgi', 'Info'],
  startupWin: ['Startfenster…', 'Startup window…', 'Fenêtre de démarrage…', 'Başlangıç penceresi…', 'Ventana de inicio…'], techWin: ['Technikfenster', 'Tech Window', 'Fenêtre Technologie', 'Teknoloji penceresi', 'Ventana de tecnología'],
  newsWin: ['Nachrichtenfenster', 'Report Window', 'Fenêtre des messages', 'Mesaj penceresi', 'Ventana de mensajes'], aboutAm: ['Über Spaceward Ho!', 'About Spaceward Ho!', 'À propos de Spaceward Ho! Amiga', 'Spaceward Ho! Amiga hakkında', 'Acerca de Spaceward Ho! Amiga'],
  // the menus' items (Jake's captures: the real Amiga's Datei, Optionen, Schiffe, Galaxis, Fenster and Info)
  mNew: ['Neu', 'New', 'Nouveau', 'Yeni', 'Nuevo'], mOpen: ['Öffnen', 'Open', 'Ouvrir', 'Aç', 'Abrir'], mSave: ['Speichern', 'Save', 'Enregistrer', 'Kaydet', 'Guardar'],
  mRevert: ['Zurücksetzen', 'Revert', 'Rétablir', 'Geri al', 'Revertir'], mClose: ['Schließen', 'Close', 'Fermer', 'Kapat', 'Cerrar'],
  mSplit: ['Aufteilen', 'Split', 'Diviser', 'Böl', 'Dividir'], mMerge: ['Vereinen', 'Join', 'Fusionner', 'Birleştir', 'Unir'],
  mEndSwitch: ['Zug Ende & Spielerwechsel', 'Do Turn & Change Player', 'Fin du tour & changement de joueur', 'Sırayı bitir & oyuncu değiştir', 'Fin del turno y cambio de jugador'],
  mPrint: ['Drucken', 'Print', 'Imprimer', 'Yazdır', 'Imprimir'], mQuit: ['Beenden', 'Quit', 'Quitter', 'Çık', 'Salir'],
  mForce: ['Zugende erzwingen', 'Force Turn', 'Forcer la fin du tour', 'Turu zorla bitir', 'Forzar el fin del turno'], mAuto: ['Autospiel', 'Autoplay', 'Jeu auto', 'Otomatik oyun', 'Juego automático'],
  mHandle: ['Ich bearbeite die Züge', "I'll Update the Turns", 'Je joue mes tours', 'Hamleleri ben yaparım', 'Yo hago los movimientos'],
  mHandleNote: ['Die Züge bearbeiten Sie selbst. Autospiel überlässt sie dem Computer.', 'You make the moves yourself. Auto play leaves them to the computer.', 'Vous jouez vos tours vous-même. Jeu auto les laisse à l’ordinateur.', 'Hamleleri kendin yaparsın. Otomatik oyun onları bilgisayara bırakır.', 'Haces los movimientos tú mismo. El juego automático se los deja al ordenador.'],
  mPoll: ['Kontrollzeit', 'Control Time', 'Temps de contrôle', 'Kontrol süresi', 'Tiempo de control'], mBattleSpeed: ['Kampftempo', 'Battle Speed', 'Vitesse des combats', 'Savaş hızı', 'Velocidad de combate'],
  mShowMsgs: ['Nachrichten zeigen', 'Show Reports', 'Afficher les messages', 'Mesajları göster', 'Mostrar mensajes'], mShowBattles: ['Kämpfe zeigen', 'Show Battles', 'Afficher les combats', 'Savaşları göster', 'Mostrar combates'],
  mWarnings: ['Warnungen ausgeben', 'Show Warnings', 'Donner des avertissements', 'Uyarıları ver', 'Dar avisos'], mSound: ['Sound', 'Sound', 'Son', 'Ses', 'Sonido'],
  mScreen: ['Bildschirm', 'ScreenMode', 'Écran', 'Ekran', 'Pantalla'],
  mShipTypes: ['Schiffstypen', 'Ship Types', 'Types de vaisseaux', 'Gemi tipleri', 'Tipos de nave'], mNewType: ['Neuer Schiffstyp', 'New Ship Type', 'Nouveau type de vaisseau', 'Yeni gemi tipi', 'Tipo de nave nuevo'],
  mFleets: ['Liste der Flotten', 'Fleet Roster', 'Liste des flottes', 'Filo listesi', 'Lista de flotas'], mSplitFleets: ['Flottenaufteilung', 'Organize Ships', 'Répartition des flottes', 'Filo bölme', 'División de flotas'],
  mBuildAt: ['Schiffbau auf %1', 'Build Ships at %1', 'Construction à %1', '%1 üzerinde gemi yapımı', 'Construir en %1'], mScrap: ['Verschrotten', 'Scrap Current Fleet', 'Recycler', 'Hurdaya çıkar', 'Desguazar'],
  mScrap2: ['Nicht verschrotten', 'Don`t Scrap Fleet', 'Ne pas recycler', 'Hurdaya çıkarma', 'No desguazar'], mBattle: ['Kampf ansehen', 'Review Battle on %1', 'Revoir le combat', 'Savaşı gözden geçir', 'Revisar el combate'], mNoBattle: ['Kein Kampf hier', 'No Battle here', 'Pas de combat ici', 'Burada savaş yok', 'Aquí no hay combate'],
  mCompare: ['Spielervergleich', 'Compare Players', 'Comparaison des joueurs', 'Oyuncu karşılaştırması', 'Comparar jugadores'], mStarList: ['Liste der Sterne', 'Star List', 'Liste des étoiles', 'Yıldız listesi', 'Lista de estrellas'],
  mMessage: ['Funkspruch', 'Send Message', 'Message radio', 'Telsiz mesajı', 'Mensaje de radio'], mZoomIn: ['Vergrößern', 'Zoom In', 'Agrandir', 'Yakınlaştır', 'Acercar'], mZoomOut: ['Verkleinern', 'Zoom Out', 'Réduire', 'Uzaklaştır', 'Alejar'],
  mFix: ['Ausgaben anpassen', 'Fix Spendings', 'Ajuster les dépenses', 'Harcamaları ayarla', 'Ajustar los gastos'], mTidy: ['Fenster aufräumen', 'Cleanup Windows', 'Ranger les fenêtres', 'Pencereleri topla', 'Ordenar las ventanas'],
  colonyWarn: ['Achtung! Sie geben für einige Kolonien nicht genug Geld aus, um sie am Leben zu erhalten. Wollen Sie sie wirklich verlassen?', 'Warning! Some colonies are running out of money\nDo you really want to abandon them?', 'Attention ! Vous ne dépensez pas assez d’argent pour certaines colonies afin de les maintenir en vie. Voulez-vous vraiment les abandonner ?', 'Dikkat! Bazı koloniler için onları hayatta tutacak kadar para harcamıyorsun. Onları gerçekten terk etmek istiyor musun?', '¡Atención! No estás gastando suficiente dinero en algunas colonias para mantenerlas con vida. ¿Realmente quieres abandonarlas?'],
  savingTitle: ['Neuer Spielstand wird gespeichert', 'Writing new game-file', 'Enregistrement d’une nouvelle sauvegarde', 'Yeni oyun kaydı kaydediliyor', 'Guardando una partida nueva'], savingLine: ['Speichern der Galaxis', 'Saving galaxy', 'Enregistrement de la galaxie', 'Galaksi kaydediliyor', 'Guardando la galaxia'],
  revertAsk: ['Wollen Sie wirklich zum zuletzt gespeicherten Spielstand zurückkehren?\n\nAlle Änderungen gehen verloren!', 'Do you really want to return to your last saved game?\n\nAll changes will be lost!', 'Remettre la partie dans l’état de la dernière sauvegarde ?', 'Oyun en son kaydedilen duruma döndürülsün mü?', '¿Devolver la partida al último estado guardado?'],
  aslNew: ['Name der neuen Galaxis:', 'File name of new galaxy:', 'Nom de la nouvelle galaxie :', 'Yeni galaksinin adı:', 'Nombre de la galaxia nueva:'],
  entryTitle: ['Spaceward Ho! Spieleintrag', 'Spaceward Ho! Enter game', 'Spaceward Ho! Entrée dans la partie', 'Spaceward Ho! Oyuna giriş', 'Spaceward Ho! Entrada en la partida'], identify: ['Identifizieren Sie sich:', 'Please indentify:', 'Identifiez-vous :', 'Kendini tanıt:', 'Identifícate:'],
  infoDots: ['Info..', 'Info..', 'Info..', 'Bilgi..', 'Info..'],
  pickColony: ['Wählen Sie eine Ihrer Kolonien.', 'Select one of your colonies first.', 'Choisissez d’abord une de vos colonies.', 'Önce kolonilerinden birini seç.', 'Elige primero una de tus colonias.'],
  pickFleet: ['Wählen Sie eine Flotte.', 'Select one of your fleets first.', 'Choisissez d’abord une de vos flottes.', 'Önce filolarından birini seç.', 'Elige primero una de tus flotas.'],
  stance: ['Haltung: ', 'Battle stance: ', 'Attitude : ', 'Savaş tutumu: ', 'Actitud: '], one: ['Ein', 'One', 'Un', 'Bir', 'Una'], metalWord: ['Metall', 'metal', 'métal', 'metâl', 'de metal'],
  licence: ['Lizenz:', 'License:', 'Licence :', 'Lisans:', 'Licencia:'], noPassword: ['Nicht benutzt: Dieses Remake speichert keine Passwörter.', 'Not used: this remake keeps no passwords.', 'Inutilisé : ce remake ne garde aucun mot de passe.', 'Kullanılmıyor: bu yeniden yapım parola saklamaz.', 'No se usa: este remake no guarda contraseñas.'],
};
// the Amiga's About window (its credits, German), in each language
const ABOUT = [
  ['Spaceward HO! © by NewWorld Computing in 1992-1994', 'Spaceward HO! © by NewWorld Computing in 1992-1994', 'Spaceward HO! © NewWorld Computing 1992-1994', 'Spaceward HO! © NewWorld Computing 1992-1994', 'Spaceward HO! © NewWorld Computing 1992-1994'],
  ['lizensiert durch SOFTGOLD Computerspiele GmbH', 'licensed by SOFTGOLD Computerspiele GmbH', 'sous licence de SOFTGOLD Computerspiele GmbH', 'SOFTGOLD Computerspiele GmbH lisansıyla', 'con licencia de SOFTGOLD Computerspiele GmbH'],
  ['', '', '', '', ''],
  ['AMIGA-Umsetzung von Stefan Bebbo Franke, BebboSoft', 'AMIGA-conversion by Stefan Bebbo Franke, BebboSoft', 'Version AMIGA de Stefan Bebbo Franke, BebboSoft', 'AMIGA sürümü: Stefan Bebbo Franke, BebboSoft', 'Versión para AMIGA de Stefan Bebbo Franke, BebboSoft'],
  ['Vorlage von Joe Williams und Peter Commons', 'Original by Joe Williams und Peter Commons', 'Original de Joe Williams et Peter Commons', 'Özgün oyun: Joe Williams ve Peter Commons', 'Original de Joe Williams y Peter Commons'],
  ['Grafik von Howard Vives', 'Graphics by Howard Vives', 'Graphismes de Howard Vives', 'Grafikler: Howard Vives', 'Gráficos de Howard Vives'],
  ['', '', '', '', ''],
  ['Dank an: Frank, Ilja, Michael, Micky, Olaf und Thomas', 'Thanks to: Frank, Ilja, Michael, Micky, Olaf und Thomas', 'Merci à : Frank, Ilja, Michael, Micky, Olaf et Thomas', 'Teşekkürler: Frank, Ilja, Michael, Micky, Olaf ve Thomas', 'Gracias a: Frank, Ilja, Michael, Micky, Olaf y Thomas'],
];
// the language showing (js/ui-lang.js: the game's, or New Game's, or the
// player's choice on the title screen; none chosen: English, as in every skin)
const LIDX = { de: 0, en: 1, fr: 2, tr: 3, es: 4 };
// (its words in each language are its own: the interface's table leaves them as they are)
if (window.HOUI) for (const l in LIDX) if (l !== 'en') HOUI.own(l, [].concat(...Object.values(WORDS).map(e => [e[LIDX[l]]]), ...ABOUT.map(e => [e[LIDX[l]]])));
const lang = () => (window.HOUI ? HOUI.lang : (game() && game().opts && game().opts.lang) || 'en');
const de = () => lang() === 'de';
// (with the patch on in German, the spelling, quotation marks and slips of the Amiga's own German put right: HO.dePatchText)
const pick = (e) => {
  const x = e ? (e[LIDX[lang()]] != null ? e[LIDX[lang()]] : e[1]) : '';
  return de() && window.HOUI && HOUI.patch && window.HO && HO.dePatchText ? HO.dePatchText(x) : x;
};
const w = (k, ...v) => { const e = WORDS[k]; let s = e ? pick(e) : k; v.forEach((x, i) => { s = s.split('%' + (i + 1)).join(x); }); return s; };
// a word of WORDS in a part of the page built once (the Startup window, the
// title bar): kept in step with the language (relabel)
const W = (k) => el('span', { 'data-amw': k }, w(k));
const relabel = () => { for (const n of document.querySelectorAll('[data-amw]')) n.textContent = w(n.dataset.amw); };
// the classic page's own buttons, in the Amiga's German where a game is German
// (by their English, js/ui-lang.js HOUI.en; in other languages they are the
// classic page's own, already in the language)
const CMD_DE = {
  'Build ships…': 'Schiffsbau…', 'Queue ships…': 'Schiffsbau…', Evacuate: 'Evakuieren', 'Stay here': 'Hierbleiben', 'Split…': 'Aufteilen der Schiffe…',
  'Plan route…': 'Route planen…', Scrap: 'Verschrotten', 'Arrive late': 'Später ankommen', 'Merge fleets of the same type': 'Flotten gleichen Typs vereinen',
  'Merge all fleets here': 'Alle Flotten hier vereinen', 'Group fleets…': 'Flotten gruppieren…', 'Organize fleets…': 'Flotten ordnen…',
  'Dismantle in hyperspace': 'Im Hyperraum verschrotten', Normal: 'Normal', Offensive: 'Angriff', Defensive: 'Verteidigung',
};
const enOf = (n) => (window.HOUI ? HOUI.en(n) : n.textContent).trim();
const cmdWord = (t, shown) => (de() && CMD_DE[t]) || (de() && /^Review (battle|duel)/.test(t) ? t.replace(/^Review battle/, 'Kampf ansehen').replace(/^Review duel/, 'Duell ansehen') : shown != null ? shown : t);
const CLASS_DE = { scout: 'Späher', fighter: 'Kampfschiff', colony: 'Kolonieschiff', satellite: 'Satellit', tanker: 'Tanker', dread: 'Schlachtschiff', bio: 'Biowaffe', decoy: 'Attrappe' };
const CLASS_EN = { scout: 'Scout', fighter: 'Fighter', colony: 'Colonyship', satellite: 'Satellite' }; // (strings 81-84: the Amiga English has no others)
const className = (t) => (de() ? CLASS_DE[t] : lang() === 'en' ? CLASS_EN[t] : null) || (HO.TYPES[t] ? (window.HOUI ? HOUI.tr(HO.TYPES[t].name) : HO.TYPES[t].name) : t);
// numbers the Amiga's way (ho!, FUN_0010eb24): 51.000, 1.234.567, and from
// ten million on in thousands, 12.345K; the totals' changes in money
// (FUN_0010ec04) in whole thousands or millions, 22K, 3M
const num = (n) => {
  const a = Math.abs(Math.trunc(n)), sg = n < 0 ? '-' : '', sep = lang() === 'en' ? ',' : lang() === 'fr' ? ' ' : '.';
  const m = Math.trunc(a / 1e6), k = Math.trunc((a % 1e6) / 1000), u = a % 1000, p3 = (v) => String(v).padStart(3, '0');
  if (m >= 10) return sg + m + sep + p3(k) + 'K';
  if (m) return sg + m + sep + p3(k) + sep + p3(u);
  if (k) return sg + k + sep + p3(u);
  return sg + u;
};
const cash = (n) => (lang() !== 'en' ? '$ ' + num(n) : api().money(n));
// "(+ $ 22K)", "(- 889)": strings 90-93
const signed = (n, money) => {
  const a = Math.abs(Math.trunc(n)), s = n < 0 ? '-' : '+';
  if (!money) return `(${s} ${num(a)})`;
  const m = Math.trunc(a / 1e6), k = Math.trunc((a % 1e6) / 1000);
  return `(${s} $ ${m ? m + 'M' : k ? k + 'K' : a})`;
};
// a bar's colour goes with its height (FUN_001110fc): of 50 pixels, the
// colour table at data+0x21bc, pens 4, 11, 7 and 8 for a quarter each
const BAR_PENS = ['#003399', '#3333ff', '#993399', '#cc33ff'];
const barPen = (h) => BAR_PENS[Math.max(0, Math.min(3, Math.floor(Math.max(0, h) * 4 / 51)))];
// The temperatures, as the Amiga program writes them (Ghidra, German 2.1: the star panel FUN_00105278, a row of
// the explored-stars list @12393a, the exploring report 600 in FUN_0010ddf6 type 31; the English 2.1 has the same
// arithmetic in all three): from the temperature in tenths of a degree Fahrenheit, F = trunc(tenths / 10) - 32
// whole degrees, C = trunc(F x 5 / 9) (divs.w, toward zero), written "%d.%1.1d%cC" with the arguments C, |C| mod 10
// and 0xb0: so the "tenths" digit is the whole degrees' last digit again (22 reads "22.2°C", 37 "37.7°C", -3 "-3.3°C").
// The patch (fix 'amigaTenths') writes the real tenths, truncated as the program truncates.
const amigaC = (f, fixed) => {
  const tenths = Math.round(f * 10);
  if (fixed) {
    const c = Math.trunc((tenths - 320) * 5 / 9), a = Math.abs(c);
    return (c < 0 ? '-' : '') + Math.trunc(a / 10) + '.' + (a % 10) + '°C';
  }
  const c = Math.trunc((Math.trunc(tenths / 10) - 32) * 5 / 9);
  return c + '.' + (Math.abs(c) % 10) + '°C';
};
// °C in English, German, French and Spanish: the Amiga's own text says °C in both its languages, and the French
// (1.2F, 3.0.1F, iOS) and the Spanish (no official one: the Amiga's) follow; Turkish follows iOS's Turkish, which
// fills in the English's degrees Fahrenheit (docs/amiga-skin.md, "Temperatures")
// With the player's choice (HO.tempPref, the Ho menu's Temperatures…): °C is the Amiga's own arithmetic in every language
// (the Turkish too, whose default is iOS's °F); °F is the program's whole degrees, trunc(tenths / 10), with the unit.
const pref = () => (HO.tempPref && HO.tempPref()) || null;
const temp = (f) => {
  const u = pref();
  if (u === 'F') return Math.trunc(Math.round(f * 10) / 10) + '°F';
  return u === 'C' || ['en', 'de', 'fr', 'es'].includes(lang()) ? amigaC(f, HO.fixed(game(), 'amigaTenths')) : api().degF(f);
};

// ---------- the screen's pixels ----------
const PIXKEY = 'ho5.amiga.pixels';
const pixMode = () => (LS.get(PIXKEY) === 'square' ? 'square' : 'tall');
const PX = { x: 2, y: 4, r: 2, phone: false };
// --x/--y: the main screen's pixel (CSS px), --dx/--dy a window's, --tx/--ty
// the title screen's; each part of the page uses them as --u and --v
function layout() {
  const root = document.documentElement, vw = window.innerWidth || 640, vh = window.innerHeight || 512;
  const r = pixMode() === 'tall' ? 2 : 1, phone = vw < 600;
  const x = phone ? vw / 241 : Math.min(vw / 640, vh / (256 * r));
  Object.assign(PX, { x, y: x * r, r, phone });
  const dx = Math.min(x, (vw - 4) / 640);
  const tc = document.querySelector('#titlescreen .tcard');
  const below = tc ? tc.offsetHeight + 8 : 0;
  const tx = Math.max(0.4, Math.min(vw / 640, (vh - below) / (256 * r)));
  const S = root.style;
  S.setProperty('--x', x + 'px'); S.setProperty('--y', x * r + 'px');
  S.setProperty('--dx', dx + 'px'); S.setProperty('--dy', dx * r + 'px');
  S.setProperty('--tx', tx + 'px'); S.setProperty('--ty', tx * r + 'px');
  root.classList.toggle('am-tall', r === 2); root.classList.toggle('am-square', r === 1);
  root.classList.toggle('am-phone', phone); root.classList.toggle('am-desk', !phone);
  const a = api();
  if (a && a.map().ready) { a.resize(); }
}
function setPixels(m) {
  LS.set(PIXKEY, m === 'square' ? 'square' : 'tall');
  layout();
  for (const s of document.querySelectorAll('select.am-pixsel')) s.value = pixMode();
  const a = api(); if (a && a.G) { a.renderPanel(); a.draw(); }
}
document.documentElement.classList.add('amiga');
layout();
window.addEventListener('resize', () => layout());

// ---------- little helpers ----------
// (the classic page's el, without a class when none is given)
const el = (tag, attrs, ...kids) => {
  if (attrs && attrs.class == null && 'class' in attrs) { attrs = Object.assign({}, attrs); delete attrs.class; }
  return api().el(tag, attrs, ...kids);
};
const img = (name, cls) => { const a = api(), src = a.A.img[name]; return src ? el('img', { src, alt: '', class: cls || null, draggable: 'false' }) : el('span', { class: (cls || '') + ' am-noimg' }); };
const gadget = (kind, label, onclick) => el('button', { type: 'button', class: 'am-gad am-' + kind, 'aria-label': label, title: label, onclick });
// an Amiga window inside the screen (Technik Ausgaben, Nachrichten): a grey
// title bar (the active window's is cyan), its gadgets and a body
function screenWin(id, title, gads, body) {
  const bar = el('div', { class: 'am-wbar' });
  if (gads.close) bar.append(gadget('close', 'Close', gads.close));
  bar.append(el('span', { class: 'am-wname' }, title));
  if (gads.zoom) bar.append(gadget('zoom', 'Zoom', gads.zoom));
  if (gads.depth) bar.append(gadget('depth', 'Depth', gads.depth));
  const sec = el('section', { id, class: 'am-swin' + (id === activeWin ? ' am-active' : '') }, bar, el('div', { class: 'am-sbody' }, body));
  if (gads.size) sizer(sec, gads.size);
  if (gads.drag) dragWin(sec, bar, gads.drag);
  return sec;
}
// The active window (Jake's captures: Nachrichten once clicked): its title bar cyan, the inactive ones grey
let activeWin = null;
document.addEventListener('pointerdown', (e) => {
  const sw = e.target.closest && e.target.closest('.am-swin'), id = sw ? sw.id : null;
  if (id === activeWin) return;
  activeWin = id;
  for (const n of document.querySelectorAll('.am-swin')) n.classList.toggle('am-active', n.id === activeWin);
}, true);
// a window moved by its title bar: set(x, y) in Amiga pixels on the screen
function dragWin(sec, bar, set) {
  bar.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || e.target.closest('.am-gad')) return;
    e.preventDefault();
    const app = document.getElementById('app').getBoundingClientRect(), r = sec.getBoundingClientRect();
    const gx = e.clientX - r.left, gy = e.clientY - r.top;
    try { bar.setPointerCapture(e.pointerId); } catch (x) { /* (an old browser) */ }
    const move = (ev) => set(Math.round((ev.clientX - gx - app.left) / PX.x), Math.round((ev.clientY - gy - app.top) / PX.y));
    const up = () => { bar.removeEventListener('pointermove', move); bar.removeEventListener('pointerup', up); bar.removeEventListener('pointercancel', up); };
    bar.addEventListener('pointermove', move); bar.addEventListener('pointerup', up); bar.addEventListener('pointercancel', up);
  });
}
// The sizing gadget (Intuition's: the Nachrichten window is opened with
// WFLG_SIZEGADGET, NewWindow data+0x2ec, so it gets one in its bottom right
// corner, and with it the zoom gadget the capture shows). No capture shows
// it: it is drawn as AROS's sysiclass draws SIZEIMAGE (18 x 10 at hires; a
// triangle on the border's pen, the inactive window's without its white),
// docs/amiga-skin.md. A drag sizes the window, not under 240 x 120 (the
// NewWindow's MinWidth and MinHeight). size: { get, set } in Amiga pixels.
function sizer(sec, size) {
  const g = el('div', { class: 'am-sizeg', role: 'button', 'aria-label': 'Size', title: 'Size' });
  const apply = (wh) => { if (!wh) return; sec.style.width = `calc(${wh[0]} * var(--u))`; sec.style.height = `calc(${wh[1]} * var(--v))`; };
  apply(size.get());
  g.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    try { g.setPointerCapture(e.pointerId); } catch (x) { /* (an old browser) */ }
    const r = sec.getBoundingClientRect(), x0 = e.clientX, y0 = e.clientY, w0 = r.width / PX.x, h0 = r.height / PX.y;
    const box = sec.parentElement ? sec.parentElement.getBoundingClientRect() : null;
    const maxW = box ? (box.right - r.left) / PX.x : 640, maxH = box ? (box.bottom - r.top) / PX.y : 256;
    const move = (ev) => {
      const wh = [Math.round(Math.max(240, Math.min(maxW, w0 + (ev.clientX - x0) / PX.x))), Math.round(Math.max(120, Math.min(maxH, h0 + (ev.clientY - y0) / PX.y)))];
      apply(wh); size.set(wh);
    };
    const up = () => { g.removeEventListener('pointermove', move); g.removeEventListener('pointerup', up); g.removeEventListener('pointercancel', up); };
    g.addEventListener('pointermove', move); g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up);
  });
  sec.append(g);
}
// an Amiga scroll bar (a prop gadget with its two arrows) for a scrolling box
function scroller(box, vertical) {
  const knob = el('div', { class: 'am-knob' }), track = el('div', { class: 'am-track' }, knob);
  const step = (d) => { if (vertical) box.scrollTop += d * Math.max(10, box.clientHeight / 2); else box.scrollLeft += d * Math.max(10, box.clientWidth / 2); };
  const bar = el('div', { class: 'am-prop ' + (vertical ? 'am-pv' : 'am-ph') },
    el('button', { type: 'button', class: 'am-arrow am-up', 'aria-label': vertical ? 'Scroll up' : 'Scroll left', tabindex: -1, onclick: () => step(-1) }),
    track,
    el('button', { type: 'button', class: 'am-arrow am-down', 'aria-label': vertical ? 'Scroll down' : 'Scroll right', tabindex: -1, onclick: () => step(1) }));
  const sync = () => {
    const tot = vertical ? box.scrollHeight : box.scrollWidth, vis = vertical ? box.clientHeight : box.clientWidth, at = vertical ? box.scrollTop : box.scrollLeft;
    const f = tot > 0 ? Math.min(1, vis / tot) : 1, o = tot > vis ? at / tot : 0;
    knob.style[vertical ? 'top' : 'left'] = o * 100 + '%'; knob.style[vertical ? 'height' : 'width'] = f * 100 + '%';
  };
  box.addEventListener('scroll', sync);
  let drag = null;
  knob.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); knob.setPointerCapture(e.pointerId); drag = { p: vertical ? e.clientY : e.clientX, s: vertical ? box.scrollTop : box.scrollLeft }; });
  knob.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const r = track.getBoundingClientRect(), len = vertical ? r.height : r.width, tot = vertical ? box.scrollHeight : box.scrollWidth;
    const d = ((vertical ? e.clientY : e.clientX) - drag.p) / Math.max(1, len) * tot;
    if (vertical) box.scrollTop = drag.s + d; else box.scrollLeft = drag.s + d;
  });
  knob.addEventListener('pointerup', () => { drag = null; });
  track.addEventListener('pointerdown', (e) => { if (e.target === track) { const r = knob.getBoundingClientRect(); step((vertical ? e.clientY < r.top : e.clientX < r.left) ? -1 : 1); } });
  requestAnimationFrame(sync);
  bar._sync = sync;
  return bar;
}
// a small Amiga pop-up menu at the pointer (the commands of a star or fleet)
function popup(items, x, y) {
  closePopup();
  if (!items.length) return;
  const m = el('div', { class: 'am-popup dropdown open', role: 'menu' });
  for (const it of items) {
    if (it === '-') { m.append(el('hr')); continue; }
    m.append(el('button', { role: 'menuitem', class: it.checked != null ? 'check' + (it.checked ? ' on' : '') : null, onclick: () => { closePopup(); it.fn(); } }, it.label));
  }
  document.body.append(m);
  const r = m.getBoundingClientRect();
  m.style.left = Math.max(2, Math.min(x, window.innerWidth - r.width - 2)) + 'px';
  m.style.top = Math.max(2, Math.min(y, window.innerHeight - r.height - 2)) + 'px';
  setTimeout(() => document.addEventListener('pointerdown', popOut), 0);
}
function popOut(e) { if (!e.target.closest('.am-popup')) closePopup(); }
function closePopup() { document.querySelectorAll('.am-popup').forEach(n => n.remove()); document.removeEventListener('pointerdown', popOut); }

// ---------- the commands the classic page has for a star and its fleets ----------
// The left column shows the Amiga's panels; the classic planet box (with
// every control the ruleset gives a star and its fleets: Build ships,
// Evacuate, Stay here, Split, Plan route, the stance, Arrive late, Scrap,
// Merge, Review battle) is kept out of sight, and its controls are offered
// as the "Befehle" menu, the star panel's and the fleet list's right-click
// (or long-press) menu. They are the same buttons, so they come and go with
// the ruleset as the classic page's do.
let planetBox = null;
const CMDS = []; // the title bar's Befehle menu (refilled in place)
function commands() {
  const out = [];
  if (!planetBox) return out;
  for (const n of planetBox.querySelectorAll('button, select, input[type=checkbox]')) {
    if (n.closest('.frow') && !n.closest('.frow.sel')) continue; // only the selected fleet's
    if (n.tagName === 'BUTTON') { if (!n.disabled) out.push({ label: cmdWord(enOf(n), n.textContent.trim()), fn: () => n.click() }); }
    else if (n.tagName === 'SELECT') {
      const lab = n.getAttribute('aria-label') || '', labEn = n.hoA && n.hoA['aria-label'] ? n.hoA['aria-label'][0] : lab;
      for (const o of n.options) out.push({ label: (labEn === 'Battle stance' ? w('stance') : lab ? lab + ': ' : '') + cmdWord(enOf(o), o.textContent), checked: n.value === o.value, fn: () => { n.value = o.value; n.dispatchEvent(new Event('change', { bubbles: true })); api().renderPanel(); } });
    } else {
      const lab = n.closest('label'), t = lab ? lab.textContent.trim() : '';
      out.push({ label: cmdWord(lab ? enOf(lab) : '', t), checked: n.checked, fn: () => { n.checked = !n.checked; n.dispatchEvent(new Event('change', { bubbles: true })); api().renderPanel(); } });
    }
  }
  return out;
}
function fillCommandMenu() {
  CMDS.length = 0;
  const c = commands();
  if (!c.length) CMDS.push([w('noCommands'), () => {}]);
  for (const it of c) CMDS.push([it.label, it.fn, null, it.checked != null ? () => it.checked : undefined]);
}

// ---------- the star panel ----------
// The bars (per mille): Terraform, Mine and, where the colony pays for ships
// in turn (the DOS 2.0 rules' build queue), Ship; -1 a finished part. 2.0
// keeps them as the ruleset's own (rs.bars20); otherwise they are the
// classic panel's two sliders, s.terra (the split between terraforming and
// mining) and s.ship (the shipbuilding share), which is what a drag here
// sets, just as those sliders would.
function colonyBars(G, p, s) {
  const rs = HO.rules(G);
  if (rs.bars20) return rs.bars20(s).slice();
  const terraOK = Math.abs(HO.seenT(p, s) - 72) > 0.5, metalOK = s.metal > 0;
  const ship = HO.feature(G, 'buildQueue') ? Math.round((s.ship || 0) * 1000) : null;
  const rest = 1000 - (ship || 0), tf = s.terra == null ? 0.5 : s.terra;
  const T = terraOK ? Math.round(rest * (metalOK ? tf : 1)) : -1, X = metalOK ? rest - Math.max(0, T) : -1;
  return ship == null ? [T, X] : [T, X, ship];
}
// the dragged bar takes v; the others (not finished) share the rest as they were
function dragColonyBar(G, s, bars, i, v) {
  const out = bars.slice(); out[i] = v;
  const others = bars.map((b, j) => j).filter(j => j !== i && bars[j] >= 0);
  const tot = others.reduce((a, j) => a + bars[j], 0), rest = 1000 - v;
  others.forEach((j, k) => { out[j] = tot > 0 ? Math.round(bars[j] / tot * rest) : Math.round(rest / others.length); });
  if (others.length) { const sum = out.reduce((a, b, j) => a + (b >= 0 ? b : 0), 0); out[others[others.length - 1]] += 1000 - sum; }
  else out[i] = 1000;
  // the classic sliders' values (bars20 reads them back)
  if (out.length > 2) s.ship = out[2] / 1000;
  const t = Math.max(0, out[0]), x = Math.max(0, out[1]);
  if (t + x > 0) s.terra = t / (t + x);
  return out;
}
function starChart(G, p, s) {
  const bars = colonyBars(G, p, s);
  const names = [w('terra'), w('met'), w('schf')].slice(0, bars.length);
  const cols = bars.map((v, i) => {
    const fill = el('div', { class: 'am-cfill' });
    fill.style.height = Math.max(0, v) / 10 + '%'; fill.style.background = barPen(Math.floor(Math.max(0, v) * 50 / 1000));
    return el('div', { class: 'am-ccol' + (v < 0 ? ' done' : ''), role: 'slider', tabindex: 0, 'aria-label': names[i], 'aria-valuenow': Math.max(0, Math.round(v / 10)), 'data-i': i }, fill);
  });
  const area = el('div', { class: 'am-carea' }, el('i', { class: 'am-axis' }), ...cols);
  const labs = el('div', { class: 'am-clabs' }, ...names.map(n => el('span', null, n)));
  let cur = null;
  const set = (e, col) => {
    const i = +col.dataset.i, r = area.getBoundingClientRect();
    const v = Math.max(0, Math.min(1000, Math.round((r.bottom - e.clientY) / r.height * 1000)));
    const now = cur || bars;
    cur = dragColonyBar(G, s, now, i, v);
    cols.forEach((c, j) => { c.firstChild.style.height = Math.max(0, cur[j]) / 10 + '%'; c.firstChild.style.background = barPen(Math.floor(Math.max(0, cur[j]) * 50 / 1000)); });
  };
  cols.forEach((col, i) => {
    col.addEventListener('pointerdown', (e) => {
      if (G.over || bars[i] < 0) { api().beep(); return; }
      col.setPointerCapture(e.pointerId); col._drag = true; set(e, col);
    });
    col.addEventListener('pointermove', (e) => { if (col._drag) set(e, col); });
    const end = () => { if (!col._drag) return; col._drag = false; cur = null; api().save(); api().renderPanel(); };
    col.addEventListener('pointerup', end); col.addEventListener('pointercancel', end);
    col.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowUp' || e.key === 'ArrowRight' ? 50 : e.key === 'ArrowDown' || e.key === 'ArrowLeft' ? -50 : 0;
      if (!d) return; e.preventDefault();
      if (G.over || bars[i] < 0) { api().beep(); return; }
      dragColonyBar(G, s, bars, i, Math.max(0, Math.min(1000, bars[i] + d))); api().save(); api().renderPanel();
    });
  });
  return el('div', { class: 'am-chart', 'data-help': 'terraMine' }, area, labs);
}
function kv(k, v) { return el('div', { class: 'am-kv' }, el('span', { class: 'am-k' }, k), el('span', { class: 'am-v' }, v)); }
function starPanel() {
  const a = api(), G = a.G, ME = a.ME, p = a.me(), sid = a.UI.sel;
  const box = el('section', { class: 'am-star' });
  if (sid == null) return box;
  const s = G.stars[sid], k = HO.know(G, p, sid);
  box.append(el('div', { class: 'am-sname' }, s.name));
  const rows = el('div', { class: 'am-rows' });
  box.append(rows);
  if (s.owner === ME) {
    const inc = HO.planetIncome(G, p, s);
    rows.append(kv(w('profit'), cash(inc)), kv(w('pop'), num(s.pop * 1000)), kv(w('temp'), temp(72 + (s.t - p.homeT))),
      kv(w('grav'), HO.gravText(G, s.g, p.homeG, false)), kv(w('metal'), num(s.metal)));
    const bars = colonyBars(G, p, s);
    if (bars.some((b, i) => b >= 0 && (i < 2 || bars[0] >= 0 || bars[1] >= 0))) box.append(starChart(G, p, s));
    else box.append(ordersList(G, p, s));
    box.addEventListener('dblclick', () => a.openBuild(sid));
  } else if (k.explored) {
    const own = k.owner >= 0 && G.players[k.owner];
    rows.append(kv(w('owner'), own ? own.name : w('nobody')), kv(w('pop'), own ? (k.pop ? '~' + num(k.pop * 1000) : '?') : w('empty')),
      kv(w('temp'), temp(72 + (k.t - p.homeT))), kv(w('grav'), HO.gravText(G, k.g, p.homeG, false)), kv(w('metal'), num(k.metal)));
    if (k.seen >= 0) box.append(el('div', { class: 'am-seen' }, `${w('seen')} ${2000 + k.seen * 10}`));
  } else rows.append(el('div', { class: 'am-note' }, k.battleOnly ? w('battleSeen') : w('unexplored')));
  box.addEventListener('contextmenu', (e) => { e.preventDefault(); popup(commands(), e.clientX, e.clientY); });
  return box;
}
function ordersList(G, p, s) {
  const q = s.queue || [];
  const lines = q.map(it => { const d = HO.getDesign(G, p.id, it.did); return d ? `${countWord(it.n)} ${d.name}` : ''; }).filter(Boolean);
  return el('div', { class: 'am-orders' }, el('div', null, w('orders')), ...(lines.length ? lines : [w('none')]).map(t => el('div', { class: 'am-oline' }, t)));
}
const countWord = (n) => (n === 1 ? w('one') : String(n));

// ---------- the fleet panel ----------
function fleetLine(G, f) {
  const parts = Object.keys(f.ships).map(k => {
    const d = HO.getDesign(G, f.owner, +k), n = f.ships[k];
    return d ? `${countWord(n)} ${d.name} (${d.W}/${d.S}) ${className(d.type)}` : '';
  }).filter(Boolean);
  return parts.join(', ');
}
function scrapValue(G, f) {
  const p = G.players[f.owner], rate = HO.rules(G).scrapReturn ? HO.rules(G).scrapReturn(G, p) : 0.75;
  let m = 0; for (const k in f.ships) { const d = HO.getDesign(G, f.owner, +k); if (d) m += HO.designCost(G, d).metal * f.ships[k]; }
  return Math.floor(m * rate + 1e-9);
}
function fleetPanel() {
  const a = api(), G = a.G, ME = a.ME, UI = a.UI, sid = UI.sel;
  const box = el('section', { class: 'am-fleet' });
  const here = sid == null ? [] : G.fleets.filter(f => f.star === sid && f.to == null && (f.owner === ME || visibleAt(G, ME, sid)));
  const inbound = sid == null ? [] : G.fleets.filter(f => f.owner === ME && f.to === sid);
  const list = [...a.fleetOrder(here.filter(f => f.owner === ME)), ...here.filter(f => f.owner !== ME), ...a.fleetOrder(inbound)];
  let f = list.find(x => x.id === UI.selFleet);
  if (!f && UI.selFleet != null) { const g = G.fleets.find(x => x.id === UI.selFleet && x.owner === ME); if (g) f = g; }
  const head = el('div', { class: 'am-fhead' });
  if (f && f.owner === ME) {
    const where = fleetWhere(G, f);
    const colony = HO.fleetDesigns(G, f).some(d => d.type === 'colony');
    const third = f.sat ? '' : colony ? (f.colonists > 0 ? w('full') : w('emptyShip')) : `${w('scrap')} ${num(scrapValue(G, f))}`;
    head.append(el('div', null, where),
      el('div', { class: 'am-f3' }, el('span', null, f.sat ? '' : `${w('tank')} ${Math.floor(f.fuel + 1e-9)}/${HO.fleetMaxRange(G, f)}`),
        el('span', null, f.sat ? '' : `${w('speed')} ${HO.fleetSpeed(G, f)}`), el('span', null, third)));
  } else if (sid != null && list.length) head.append(el('div', null, w('at', G.stars[sid].name)), el('div', null, ' '));
  else if (sid != null) head.append(el('div', null, w('noFleets'))); // string 543 (FUN_00106294)
  const rows = el('div', { class: 'am-flist fleets' });
  for (const x of list) {
    const mine = x.owner === ME, inb = x.to != null;
    const t = (mine ? '' : G.players[x.owner].name + ': ') + (inb ? '» ' : '') + fleetLine(G, x) + (mine && x.scrap301 ? ' ✕' : '');
    // a fleet with orders in HoBold 11; a row too long for the panel in HoFont 9 (FUN_00105d5a)
    const moving = mine && (x.to != null || x.dest != null);
    const fit = fits(t, moving ? 'HoBold11' : 'HoFont11', 216) ? '' : ' f9';
    const r = el('div', { class: 'frow am-frow' + (x.id === UI.selFleet ? ' sel' : '') + (mine ? '' : ' enemy') + (moving ? ' moving' : '') + fit, 'data-fleet': x.id, 'data-inbound': inb ? '1' : null,
      onclick: () => { UI.selFleet = x.id; a.renderPanel(); a.draw(); } }, t);
    r.addEventListener('dblclick', () => { if (mine && !inb && !x.sat && !G.over) a.openSplit(x); });
    r.addEventListener('contextmenu', (e) => { e.preventDefault(); UI.selFleet = x.id; a.renderPanel(); a.draw(); popup(commands(), e.clientX, e.clientY); });
    rows.append(r);
  }
  const wrap = el('div', { class: 'am-fwrap' }, rows, scroller(rows, true));
  box.append(head, wrap);
  // keep the selected row in view
  requestAnimationFrame(() => { const s = rows.querySelector('.sel'); if (s) { const o = s.offsetTop - rows.offsetTop; if (o < rows.scrollTop || o + s.offsetHeight > rows.scrollTop + rows.clientHeight) rows.scrollTop = o; } });
  return box;
}
// where the selected fleet is (FUN_00105e9a, strings 544-547): marked for
// scrapping; at a star; bound for its next stop ("Zielort", with the
// distance and the turns there); or with stops after that ("Unterwegs
// nach" the last, "via" the next)
function fleetWhere(G, f) {
  if (f.scrap301) return w('scrapFleet');
  if (f.to == null && f.dest == null) return w('at', G.stars[f.star].name);
  const next = f.to != null ? f.to : f.dest, last = f.path && f.path.length ? f.path[f.path.length - 1] : next;
  const d = f.to != null ? Math.max(0, f.dist - f.prog) : HO.starDist(G, f.star, next);
  const t = Math.max(1, Math.ceil(d / Math.max(1, HO.fleetSpeed(G, f)) - 1e-9));
  return last === next ? w('dest', G.stars[next].name, Math.round(d), t) : w('via', G.stars[last].name, Math.round(d), t, G.stars[next].name);
}
// whether a text fits a width in Amiga pixels in one of the fonts (as TextLength)
let MEASURE = null;
function fits(t, fam, width) {
  MEASURE = MEASURE || document.createElement('canvas').getContext('2d');
  MEASURE.font = `16px ${fam}, sans-serif`;
  return MEASURE.measureText(t).width <= width;
}
// a ship's caption: HoFont 11, else 9, else HoCond 9, whichever fits (FUN_001214e2)
const capFont = (t, width) => (fits(t, 'HoFont11', width) ? 'f11' : fits(t, 'HoFont9', width) ? 'f9' : 'fc9');
function visibleAt(G, ME, sid) { return G.stars[sid].owner === ME || G.fleets.some(f => f.owner === ME && f.star === sid && f.to == null); }

// ---------- the totals ----------
// "(+ $ 22K)": what the last turn's processing changed (ho!, the end of turn,
// FUN_00119f18 and its caller: before a player's turn is worked out the
// metal, money and profit are kept, and afterwards the difference is the
// change shown all through the next turn). The skin keeps those figures in
// localStorage for each game and player as the turn is played (T.beforeTurn).
function totalsNow(G, p) { return { m: p.metal, s: p.savings, p: HO.projected(G, p).income }; }
const totalsKey = (G, p) => 'ho5.amiga.totals.' + (G.opts.seed || 0) + '.' + p.id;
function beforeTurn(G) {
  for (const p of G.players) if (p.human) LS.set(totalsKey(G, p), JSON.stringify({ snapAt: G.turn, snap: totalsNow(G, p) }));
}
function totalsDelta(G, p) {
  let rec = null; try { rec = JSON.parse(LS.get(totalsKey(G, p)) || 'null'); } catch (e) { rec = null; }
  if (!rec) return { m: 0, s: 0, p: 0 };
  if (rec.turn !== G.turn) {
    const now = totalsNow(G, p);
    rec = { turn: G.turn, d: rec.snap && rec.snapAt === G.turn - 1 ? { m: now.m - rec.snap.m, s: now.s - rec.snap.s, p: now.p - rec.snap.p } : { m: 0, s: 0, p: 0 } };
    LS.set(totalsKey(G, p), JSON.stringify(rec));
  }
  return rec.d || { m: 0, s: 0, p: 0 };
}
function totals() {
  const a = api(), G = a.G, p = a.me(), now = totalsNow(G, p), d = totalsDelta(G, p);
  const line = (k, v, dv, money) => el('div', { class: 'am-trow' }, el('b', { class: 'am-tk' }, k), el('b', { class: 'am-tv' }, v), el('span', { class: 'am-td' }, signed(dv, money)));
  return el('section', { class: 'am-totals', 'data-help': 'savings' },
    line(w('metalLeft'), num(now.m), d.m, false), line(w('moneyTotal'), cash(now.s), d.s, true), line(w('profitTotal'), cash(now.p), d.p, true));
}

// ---------- players and spending; Technik Ausgaben ----------
const TECHFRONT = 'ho5.amiga.tech';
const techFront = () => LS.get(TECHFRONT) !== '0';
function setTechFront(on) { LS.set(TECHFRONT, on ? '1' : '0'); const a = api(); if (a && a.G) a.renderPanel(); }
function playersBox() {
  const a = api(), G = a.G;
  const list = el('div', { class: 'am-plist' });
  for (const q of G.players.filter(x => x.alive && !x.surrendered)) {
    const icon = q.human ? 's' + (q.female ? 1500 : 1000) : 's' + ((q.female ? 2500 : 2000) + (q.face % 20));
    // a "√" before the hat of a player who has ended the turn (Jake's captures: the turn waits to run)
    const ended = !!(G.done && G.done.includes(q.id));
    list.append(el('div', { class: 'am-prow', role: 'button', tabindex: 0, onclick: () => a.openPlayers() }, el('span', { class: 'am-tick' + (ended ? ' on' : ''), 'aria-hidden': 'true' }), img(P + icon, 'am-pic'), el('span', null, q.name)));
  }
  return el('section', { class: 'am-players' }, list, scroller(list, true));
}
let budgetEnts = null;
function spendBox(bb) {
  const a = api(), G = a.G;
  let pick = null; try { pick = localStorage.getItem('ho5.barScale.' + G.rules); } catch (e) { pick = null; }
  const sc = HO.barScale(G, 'budget', pick);
  const h = bb.querySelector('h3');
  if (h) h.replaceChildren(el('span', null, '0%'), el('span', null, sc.id === 'log' ? w('log') : w('linear')), el('span', null, '100'));
  const ruler = el('div', { class: 'am-ruler' }, ...Array.from({ length: 11 }, (_, i) => el('i', { style: `left:${i * 10}%` })));
  if (h) h.after(ruler);
  for (const r of bb.querySelectorAll('.barrow')) {
    const l = r.querySelector('.blabel');
    if (r.dataset.help === 'tech') l.textContent = w('techBar');
    else if (r.dataset.help === 'savingsBar') l.textContent = w('savings');
  }
  // (the rows stay in the classic page's order, which its bars are kept by; CSS orders them)
  const p = a.me(), order = p.slots20 || null;
  if (order) {
    const rows = [...bb.querySelectorAll('.barrow')], ents = budgetEnts || [];
    rows.forEach((r, i) => { const e = ents[i]; if (!e) return; const k = e.key === 'savings' ? 'sav' : e.key; const at = order.indexOf(k); r.style.order = String(at < 0 ? 99 : at + 1); });
  }
  bb.classList.add('am-budget');
  const body = el('div', { class: 'am-spend' }, bb);
  return el('section', { class: 'am-spendwin' }, body, scroller(body, true));
}
function techWin(tb) {
  const a = api(), p = a.me();
  const KEYS = { range: 'range', speed: 'vel', weapons: 'weapons', shields: 'shields', mini: 'mini', radical: 'radical' };
  const levels = el('div', { class: 'am-levels' }, el('div', null, w('levels')),
    ...['range', 'speed', 'weapons', 'shields', 'mini'].map(k => el('div', { class: 'am-lrow' }, el('span', null, w(KEYS[k])), el('span', null, String(p.tech[k])))));
  const h = tb.querySelector('h3'); if (h) h.remove();
  for (const r of tb.querySelectorAll('.barrow')) {
    const key = r.dataset.help, l = r.querySelector('.blabel');
    if (KEYS[key]) l.textContent = w(KEYS[key]);
  }
  // each bar coloured by its height, again as it is dragged
  const pens = () => { for (const f of tb.querySelectorAll('.fill')) f.style.setProperty('background', barPen(Math.round((parseFloat(f.style.height) || 0) / 100 * 50)), 'important'); };
  pens(); for (const ev of ['pointermove', 'pointerup', 'keyup']) tb.addEventListener(ev, pens);
  tb.classList.add('am-techbars');
  const front = techFront();
  const win = screenWin('am-tech', w('tech'), { close: () => setTechFront(false), depth: () => setTechFront(false), drag: (x, y) => moveTech(x, y) }, el('div', { class: 'am-techbody' }, levels, tb));
  win.hidden = !front;
  return win;
}
// Technik Ausgaben can be dragged over the map (Jake's captures): where it was put (Amiga pixels on the
// screen) is kept until Fenster aufräumen; the window then lives on the screen, not in the left column
let techPos = null;
function placeTech(t) {
  const app = document.getElementById('app');
  if (!t || !techPos || !app) return;
  if (t.parentElement !== app) app.append(t);
  t.classList.add('am-float');
  t.style.left = `calc(${techPos.x} * var(--u))`; t.style.top = `calc(${techPos.y} * var(--v))`;
}
function moveTech(x, y) {
  techPos = { x: Math.max(0, Math.min(640 - 60, x)), y: Math.max(0, Math.min(256 - 30, y)) };
  placeTech(document.getElementById('am-tech'));
}

// the left column, laid out on the classic panel's own boxes (T.panel)
function panel(box, parts) {
  const a = api();
  planetBox = parts.planet; budgetEnts = parts.ents;
  const keep = el('div', { class: 'am-keep', 'aria-hidden': 'true' }, parts.info, parts.planet);
  keep.hidden = true;
  const bottom = el('div', { class: 'am-bottom' }, playersBox(), spendBox(parts.budget));
  for (const n of document.querySelectorAll('#app > #am-tech')) n.remove();
  box.replaceChildren(starPanel(), fleetPanel(), totals(), bottom, techWin(parts.tech), keep);
  placeTech(document.getElementById('am-tech'));
  setTitle();
  fillCommandMenu();
  if (!a.UI._amWheel) { a.UI._amWheel = true; }
}
function setTitle() {
  const G = game(), t = document.getElementById('title');
  if (!t) return;
  if (!G) { t.textContent = w('screen'); return; }
  const p = G.players[api().ME];
  t.textContent = w('title', p.name, G.opts.galaxy || 'Milky Way', G.year);
}

// ---------- the map ----------
// The Amiga's map (ho!, FUN_00104ade, one star; FUN_001048de, the stars in
// view) has four zooms: 6, 9, 12 and 17 pixels to the light year (the menu's
// Vergrößern and Verkleinern step through them, FUN_00123138 and
// FUN_001231e4); a new player's preferences start at 17 (FUN_00100c60 sets
// the view's +0x26 to 0x11, as THE_HO!.PRF on the disk has it). What a star
// shows depends on the zoom alone, explored or not:
// - 6: an open circle in pen 0 (the grey, #bbbbbb), DrawEllipse 4 x 3 (9 x 7
//   pixels); the selected star first gets one in pen 10 (green), 6 x 5. No
//   names, no fleets, no satellites.
// - 9 and 12: the star's 16 x 16 picture (the player's view of it: the same
//   pictures as DOS, 86 records after the 32 x 32 ones), the selected star's
//   green ring (picture 242, DOS 501) 5 pixels up and left of it; your fleets'
//   marker (picture 531, DOS 3114) 12 right of it and 6 up; satellites a
//   white circle (pen 14) of radius 8 round its middle; the name in white,
//   HoFont 9, centred under it.
// - 17: the same with the 32 x 32 picture, the spiked ring (239, DOS 500) 12
//   left and 9 up of it, the marker 28 right, the circle of radius 16 and the
//   name in HoFont 11.
// The remake's map has 2 light years to its unit (LY_PER_UNIT in the rulesets).
const LY = 2, ZOOMS = [6, 9, 12, 17].map(z => z * LY);
const zoomIdx = (s) => { let b = 0; ZOOMS.forEach((z, i) => { if (Math.abs(Math.log(z / s)) < Math.abs(Math.log(ZOOMS[b] / s))) b = i; }); return b; };
// a wheel turn or a menu steps a zoom; a pinch goes to the zoom nearest its factor
function zoomTo(s, f) {
  const cur = zoomIdx(s);
  let i = zoomIdx(s * f);
  if (i === cur && Math.abs(Math.log(f)) >= 0.13) i = cur + (f > 1 ? 1 : -1);
  return ZOOMS[Math.max(0, Math.min(ZOOMS.length - 1, i))];
}
const zoomOf = (view) => ZOOMS[zoomIdx(view.s)] / LY; // 6, 9, 12 or 17
// DrawEllipse's pixels (graphics.library's midpoint ellipse), as sprites
function ellipse(a, b, colour) {
  const c = document.createElement('canvas'); c.width = 2 * a + 1; c.height = 2 * b + 1;
  const x = c.getContext('2d'); x.fillStyle = colour;
  const put = (i, j) => { for (const [p, q] of [[i, j], [-i, j], [i, -j], [-i, -j]]) x.fillRect(a + p, b + q, 1, 1); };
  // the outline: for each column the rows it crosses, and for each row the columns
  for (let i = 0; i <= a; i++) { const j = Math.round(b * Math.sqrt(Math.max(0, 1 - (i * i) / (a * a)))); put(i, j); }
  for (let j = 0; j <= b; j++) { const i = Math.round(a * Math.sqrt(Math.max(0, 1 - (j * j) / (b * b)))); put(i, j); }
  return c;
}
function sprite(rows, colour) {
  const c = document.createElement('canvas'); c.width = rows[0].length; c.height = rows.length;
  const x = c.getContext('2d'); x.fillStyle = colour;
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') x.fillRect(i, j, 1, 1); });
  return c;
}
// (the 4 x 3 and 6 x 5 ellipses as the screenshots show them)
const CIRCLE = ['..#####..', '.#.....#.', '#.......#', '#.......#', '#.......#', '.#.....#.', '..#####..'];
const RING = ['....#####....', '..##.....##..', '.#.........#.', '.#.........#.', '#...........#', '#...........#', '#...........#', '.#.........#.', '.#.........#.', '..##.....##..', '....#####....'];
let SPR = null;
const sprites = () => SPR || (SPR = { circle: sprite(CIRCLE, '#bbbbbb'), ring: sprite(RING, '#33ff33'), sat16: ellipse(16, 16, '#ffffff'), sat8: ellipse(8, 8, '#ffffff') });
const smallPic = (name) => name && name.replace(/^dos:i(\d+)$/, 'dos:s$1');
function drawStar(cx, o) {
  const { s, x, y, look, sel, IMG, view, G, ME } = o;
  const X = Math.round(x), Y = Math.round(y), z = zoomOf(view), S = sprites();
  cx.imageSmoothingEnabled = false;
  if (z <= 6) {
    if (sel) cx.drawImage(S.ring, X - 6, Y - 5);
    cx.drawImage(S.circle, X - 4, Y - 3);
    return true;
  }
  const big = z === 17, n = big ? 32 : 16, L = X - n / 2, T0 = Y - n / 2;
  const ring = sel && IMG[P + (big ? 'd500' : 'd501')];
  if (ring) cx.drawImage(ring, L - (big ? 12 : 5), T0 - (big ? 9 : 5));
  const im = look.pic || IMG[big ? look.base : smallPic(look.base)] || IMG[look.base];
  if (im) cx.drawImage(im, L, T0, n, n);
  // satellites (yours, or anyone's you can see there): the white circle
  if (G.fleets.some(f => f.star === s.id && f.sat && f.to == null && (f.owner === ME || visibleAt(G, ME, s.id)))) cx.drawImage(big ? S.sat16 : S.sat8, X - n / 2, Y - n / 2);
  cx.font = big ? '16px HoFont11, sans-serif' : '16px HoFont9, sans-serif';
  cx.textAlign = 'left'; cx.textBaseline = 'alphabetic'; cx.fillStyle = '#ffffff';
  const len = Math.round(cx.measureText(s.name).width);
  cx.fillText(s.name, X - (len >> 1), T0 + n + (big ? 9 : 7));
  return true;
}
// an ally's halo (the 2.0 skins' stand-in, 3.0.1's p506 / p507, the size of
// the selection ring): where the Amiga puts its selection ring, d500 / d501
// (drawStar above); none at the far zoom, where stars are circles
function allyAt({ x, y, view }) {
  const z = zoomOf(view), X = Math.round(x), Y = Math.round(y);
  if (z <= 6) return null;
  const big = z === 17, n = big ? 32 : 16, L = X - n / 2, T0 = Y - n / 2;
  return big ? { x: L - 12, y: T0 - 9, w: 56, h: 51, small: false } : { x: L - 5, y: T0 - 5, w: 26, h: 26, small: true };
}
// your fleets at a star: the one marker, where the Amiga puts it (T.markerAt);
// at the far zoom none is drawn, but a drag can still pick the fleets up there
function markerAt(f, { x, y, view }) {
  const z = zoomOf(view), X = Math.round(x), Y = Math.round(y);
  if (z <= 6) return { x: X - 4, y: Y - 3, w: 9, hidden: true };
  const big = z === 17, n = big ? 32 : 16;
  return { x: X - n / 2 + (big ? 28 : 12), y: Y - n / 2 - 6, w: 16 };
}
// the scroll bars follow the view (T.afterDraw)
function syncMapBars() {
  const a = api(); if (!a) return;
  const G = a.G, v = a.UI.view, m = a.map();
  const vb = document.querySelector('#mapwrap > .am-pv .am-knob'), hb = document.querySelector('#mapwrap > .am-ph .am-knob');
  if (!vb || !hb) return;
  if (!G || !m.w) { vb.style.top = hb.style.left = '0'; vb.style.height = hb.style.width = '100%'; return; }
  const ext = (lo, hi, a0, a1) => { const t0 = Math.min(lo, a0), t1 = Math.max(hi, a1); return [(a0 - t0) / (t1 - t0), (a1 - a0) / (t1 - t0)]; };
  const vx0 = -v.ox / v.s, vx1 = (m.w - v.ox) / v.s, vy0 = -v.oy / v.s, vy1 = (m.h - v.oy) / v.s;
  const [hx, hw] = ext(-1, G.W + 1, vx0, vx1), [vy, vh] = ext(-1, G.H + 1, vy0, vy1);
  hb.style.left = hx * 100 + '%'; hb.style.width = hw * 100 + '%';
  vb.style.top = vy * 100 + '%'; vb.style.height = vh * 100 + '%';
}
function mapBars(wrap) {
  const mk = (vertical) => {
    const knob = el('div', { class: 'am-knob' }), track = el('div', { class: 'am-track' }, knob);
    const pan = (d) => { const a = api(); if (!a.G) return; const v = a.UI.view; if (vertical) v.oy -= d; else v.ox -= d; a.draw(); };
    const step = (dir) => { const m = api().map(); pan(dir * (vertical ? m.h : m.w) / 4); };
    const bar = el('div', { class: 'am-prop ' + (vertical ? 'am-pv' : 'am-ph') },
      el('button', { type: 'button', class: 'am-arrow am-up', 'aria-label': vertical ? 'Scroll the map up' : 'Scroll the map left', tabindex: -1, onclick: () => step(-1) }),
      track,
      el('button', { type: 'button', class: 'am-arrow am-down', 'aria-label': vertical ? 'Scroll the map down' : 'Scroll the map right', tabindex: -1, onclick: () => step(1) }));
    let drag = null;
    knob.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); knob.setPointerCapture(e.pointerId); drag = vertical ? e.clientY : e.clientX; });
    knob.addEventListener('pointermove', (e) => {
      if (drag == null) return;
      const a = api(), G = a.G; if (!G) return;
      const r = track.getBoundingClientRect(), now = vertical ? e.clientY : e.clientX, len = vertical ? r.height : r.width;
      const m = a.map(), v = a.UI.view, span = vertical ? Math.max(G.H + 2, m.h / v.s) : Math.max(G.W + 2, m.w / v.s);
      const d = (now - drag) / Math.max(1, len) * span * v.s; drag = now;
      pan(d);
    });
    knob.addEventListener('pointerup', () => { drag = null; });
    track.addEventListener('pointerdown', (e) => { if (e.target !== track) return; const r = knob.getBoundingClientRect(); step((vertical ? e.clientY < r.top : e.clientX < r.left) ? -1 : 1); });
    return bar;
  };
  wrap.append(mk(true), mk(false), el('div', { class: 'am-corner', 'aria-hidden': 'true' }));
}
// the first view: the Amiga's starting zoom, 17 pixels to the light year,
// on your home star (or the selected one)
function fitView(v, { G, ME, mapW, mapH, sel }) {
  const st = G.stars[sel != null ? sel : G.players[ME].homeStar];
  v.s = ZOOMS[3];
  if (st) { v.ox = mapW / 2 - st.x * v.s; v.oy = mapH / 2 - st.y * v.s; }
}

// ---------- the reports: the card, and the Nachrichten window ----------
const NEWSKEY = 'ho5.amiga.news';
let newsSize = null; // (the size the window was dragged to, for this page)
// (open unless closed; on a phone, where it would hide the small map, closed unless opened)
const newsOpen = () => { const v = LS.get(NEWSKEY); return v == null ? !PX.phone : v !== '0'; };
// The first two reports credit the version: the Amiga's own (texte.pff,
// strings 569 and 570, as the Amiga game writes them for a new player), in
// place of the ruleset's (DOS 2.0: "Spaceward Ho! Version 2.0.1 von Peter
// Commons."), as each skin's title credit follows the skin.
function amigaSay(G, m) {
  const t = m && m.text;
  if (typeof t === 'string' && /^Spaceward Ho!.* by Peter Commons\.$/.test(t)) return w('credit1');
  if (t === 'Artwork by Howard Vives.') return w('credit2');
  if (typeof t === 'string') {
    // the exploring report (600): the temperature as the program writes it (amigaC)
    const x = /^You have explored (.+)\. Gravity: (\d+\.\d\d)G\. Temp: (-?\d+\.\d)°F\. Metal: ([\d,]+)\.$/.exec(t);
    if (x) {
      const F = HO.tokenTenths(x[3]) / 10; // (T, the message's tenths of a degree Fahrenheit, as the program has it)
      if (lang() === 'en') return `You have explored ${x[1]}. Gravity: ${x[2]}G. Temp: ${temp(F)}. Metal: ${x[4]}.`;
      const out = HO.say(G, t);
      if (lang() === 'de') { const d = /^Sie haben (.+) erforscht\. .*Metall: (.+)\.$/.exec(out); if (d) return `Sie haben ${d[1]} erforscht. Schwerkraft: ${x[2]}G. Temp: ${temp(F)}. Metall: ${d[2]}.`; }
      if (lang() === 'fr' || lang() === 'es') return out.replace(/-?[\d.,]+°[CF]/, temp(F));
      // (Turkish says iOS's "72°", the Amiga's own °C when °C is chosen; HO.say has already made the unit the choice)
      if (pref()) return out.replace(/-?[\d.,]+°[CF]?/, temp(F));
      return out;
    }
    if (lang() === 'en') { const r = amigaEnReport(G, t); if (r != null) return r; }
    if (lang() === 'de') { const r = amigaDeReport(HO.say(G, t)); if (r != null) return r; }
  }
  return HO.say(G, m.text);
}
// German: the reports the Amiga's German words differently from the German DOS 2.0 the ruleset has (texte.pff
// 582, 592, 594, 624 against HO.PRS 685, 695, 697, 727; 569 is the credit, 600 the exploring report, above; the
// revolt 581, the volcano 584 and the nova 577 never come up in 2.0), as the Amiga has them
const AM_DE_REPORTS = [
  [/^Achtung: Sie terraformen (.+), ein Planet, der niemals Profit abwerfen wird\.$/, (m) => `Achtung: Sie terraformen ${m[1]}, einen Planeten, der niemals Profit abwerfen wird.`], // 582
  [/^Ihre Flotte von (.+) kann (.+) nicht mehr erreichen\.$/, (m) => `Ihr ${m[1]} kann ${m[2]} nicht mehr erreichen.`], // 592
  [/^Die Flotte von (.+) macht halt auf (.+) auf dem Weg nach (.+)\.$/, (m) => `Die Flotte von ${m[1]} wurde bei ${m[2]} auf dem Weg nach ${m[3]} aufgehalten.`], // 594
  [/^Sie wurden aus dem Spiel gelöscht\.$/, () => 'Sie werden aus dem Spiel gelöscht.'], // 624
];
function amigaDeReport(t) {
  for (const [re, f] of AM_DE_REPORTS) { const m = re.exec(t); if (m) return f(m); }
  return null;
}
// In English, the reports the Amiga 2.1 words differently from the DOS English the ruleset writes (texte.pff
// 571-627, docs/amiga-21.md "The Amiga English in the remake"), as the Amiga has them, flaws and all: "RangeTech",
// "Level", "metall", the backticks, the full stops it leaves out, and the five "You send a message saying you like
// %s" lines (615-619), whose one %s the program fills with the RECIPIENT's name (FUN_0010ecd8, types 46-50: its
// first argument is the player the message went to, the second, which the German format takes, the subject; the
// patch's fix 'amigaChatNames' shows 2.0's sentence with both). A text no line matches stays the ruleset's. The
// exploring report with its °C is in amigaSay.
const AM_TECH = { Range: 'Range', Speed: 'Speed', Weapons: 'Weapon', Shield: 'Shield', Miniaturization: 'Mini' };
const AM_EN_REPORTS = [
  [/^Your (Range|Speed|Weapons|Shield|Miniaturization) Technology has reached level (\d+)\.$/, (G, m) => `Your ${AM_TECH[m[1]]}Tech has reached Level ${m[2]}.`], // 571-575
  [/^You have abandoned (.+)\.$/, (G, m) => `You abandon ${m[1]}.`], // 576
  [/^(.+) has gone nova\.(?: All inhabitants were killed\.)?$/, (G, m) => `${m[1]} has become Nova. All colonists were vaporized.`], // 577
  [/^(?!A meteor shower )(.+) destroyed your colony at (.+)\.$/, (G, m) => `${m[1]} has destroyed your colony at ${m[2]}.`], // 578
  [/^It\u2019s a baby boom! The population at (.+) has started growing quickly\.$/, (G, m) => `It\`s a baby boom! the population at ${m[1]} has started growing quickly.`], // 598
  [/^(.+)\u2019s population growth rate has slowed\.$/, (G, m) => `${m[1]}\`s population growth rate has slowed.`], // 599
  // 605-614: "he" and "she", the planet's (605-606, 610-611) and the player's (607-608, 612-613), "owns" (609, 614);
  // the Amiga's full stop is missing from 608 and all of the she lines
  [/^(.+) sends a message saying (he|she) (likes|doesn\u2019t like|owns) (.+)\.$/, (G, m) => {
    const star = G && G.stars.some(x => x.name === m[4]);
    return `${m[1]} sends a message saying ${m[2]} ${m[3].replace('\u2019', '`')} ${m[4]}${m[2] === 'he' && (m[3] !== 'doesn\u2019t like' || star) ? '.' : ''}`;
  }],
  [/^(.+) metal has fallen onto (.+) from your recent battle\.$/, (G, m) => `${m[1]} metall has fallen onto ${m[2]} from your recent battle.`], // 621
  [/^Oh no! (.+) people were killed when a heavy meteor shower hit (.+)\.$/, (G, m) => `Oh no! ${m[1]} people were crunched when a heavy meteor shower hits ${m[2]}.`], // 622
  [/^You are not spending any money on technology research\.$/, () => 'You are not spending any money on technology research!'], // 627
  // 615-619: the recipient where the subject belongs (see above); the patch leaves the ruleset's sentence
  [/^You sent a message to (.+?) saying you (like|don\u2019t like|own) (.+)\.$/, (G, m) => (HO.fixed(G, 'amigaChatNames') ? null : `You send a message saying you ${m[2].replace('\u2019', '`')} ${m[1]}`)],
];
function amigaEnReport(G, t) {
  for (const [re, f] of AM_EN_REPORTS) { const m = re.exec(t); if (m) return f(G, m); }
  return null;
}
function afterMsg(box, ctx) {
  const card = box.querySelector('.card'), clock = box.querySelector('.clock');
  const m = ctx.inbox && ctx.inbox[ctx.idx];
  if (card && m) { const p = card.querySelector('.mtext p'), t = amigaSay(ctx.G, m); if (p && t !== HO.say(ctx.G, m.text)) p.textContent = t; }
  box.classList.toggle('am-cardbox', !!card && !clock);
  box.classList.toggle('am-clockbox', !!clock);
  if (card && !card.classList.contains('end') && !card.classList.contains('waiting') && ctx.idx < ctx.inbox.length - 1) {
    const t = card.querySelector('.mtext'); if (t) t.append(el('div', { class: 'am-more' }, w('more')));
  }
  if (clock) {
    const im = clock.querySelector('img');
    const want = TH().endTurnPic;
    if (im && api().A.img[want]) im.src = api().A.img[want];
    clock.setAttribute('aria-label', w('endTurn'));
  }
  renderNews(clock ? ctx.inbox : null);
}
function newsIcon(m) {
  const a = api(), G = a.G;
  let icon = m.icon;
  const T = TH();
  if (T.messageLook) { const t = T.messageLook(m, { icon, sound: m.sound }, { G, ME: a.ME, starLook: a.starLook }); if (t) icon = t.icon; }
  return icon && a.A.img[icon] ? icon : P + 'i' + (a.me().female ? 1500 : 1000);
}
function renderNews(inbox) {
  const wrap = document.getElementById('mapwrap'); if (!wrap) return;
  let win = document.getElementById('am-news');
  const show = !!(inbox && inbox.length && newsOpen() && game());
  if (!show) { if (win) win.remove(); return; }
  const a = api(), G = a.G;
  const list = el('div', { class: 'am-nlist' });
  for (const m of inbox) {
    list.append(el('div', { class: 'am-nrow', role: 'button', tabindex: 0, onclick: () => {
      if (m.battle) { a.openBattle(m.battle); return; }
      if (m.star != null) { a.UI.sel = m.star; a.centerOn(m.star); a.renderPanel(); a.draw(); }
    } }, img(newsIcon(m), 'am-nicon'), el('p', null, amigaSay(G, m))));
  }
  const body = el('div', { class: 'am-nwrap' }, list, scroller(list, true));
  const nw = screenWin('am-news', w('news'), {
    size: { get: () => newsSize, set: (wh) => { newsSize = wh; } },
    close: () => { LS.set(NEWSKEY, '0'); renderNews(null); },
    zoom: () => { const n = document.getElementById('am-news'); if (n) n.classList.toggle('zoomed'); },
    depth: () => { LS.set(NEWSKEY, '0'); renderNews(null); },
  }, body);
  if (win && win.classList.contains('zoomed')) nw.classList.add('zoomed');
  if (win) win.replaceWith(nw); else wrap.append(nw);
}
function toggleNews() {
  LS.set(NEWSKEY, newsOpen() ? '0' : '1');
  const a = api(); if (a && a.G) a.renderMsg();
}

// ---------- windows ----------
// an Amiga window: the classic modal (scrim, .win, .wtitle, .wbody) with
// the Amiga's own body; cls names its layout in style.css
function amWin(title, body, cls, opts) {
  const a = api();
  const win = a.modal(title, body, Object.assign({ cls: 'am-win ' + cls }, opts || {}));
  return win;
}
// (a label of nine letters or more, the patch's German "Abbrechen" for the Amiga's "Abbruch", gets the wider button its window gives it: am-long)
const btn = (label, fn, cls) => el('button', { type: 'button', class: 'am-btn' + (String(label).length > 8 ? ' am-long' : '') + (cls ? ' ' + cls : ''), onclick: fn }, label);
const frame = (cls, ...kids) => el('div', { class: 'am-frame ' + (cls || '') }, ...kids);
function shipCanvas(d, owner) {
  const a = api(), c = a.shipPic(d, owner);
  if (!c) return el('span', { class: 'am-noimg' });
  const im = el('img', { class: 'am-ship', alt: '', src: c.toDataURL ? c.toDataURL() : c.src, draggable: 'false' });
  return im;
}

// Schiffsbau (13.png; ho! FUN_00120e12, table data+0x2afa, the one for a
// screen 256 to 399 lines high): the colony's orders. The big picture is the
// ship being built (the first order's type), its cost ("[P]" with the
// prototype) and how much of it is paid; "Auf Warteliste" shows the orders,
// a slot each (type and count), two on this screen. A click on a type
// (FUN_00121612) adds one ship to the first slot of that type, or fills the
// first empty slot, or beeps; a click on a slot (FUN_001216f4) takes one
// ship off it, and its last ship takes the order away (the first order's
// part-payment with it); the big picture takes no clicks. Ok keeps the
// orders, Abbruch takes back this window's. The classic window (the
// designer) opens from "Neuer Typ…".
function openShipyard(sid) {
  const a = api(), G = a.G, ME = a.ME, p = a.me(), s = G.stars[sid];
  if (!HO.feature(G, 'buildQueue') || G.over) return false;
  const before = JSON.stringify(s.queue || []), yard0 = s.yard, yardDid0 = s.yardDid;
  const slots = Math.min(2, HO.rules(G).queueSlots || 3); // the Amiga's two slots on a 256-line screen
  const types = ['scout', 'fighter', 'colony', 'satellite', 'tanker', 'dread', 'bio', 'decoy'].filter(t => HO.canBuildType(G, p, t));
  let sel = null;
  const body = el('div', { class: 'am-yard' });
  const render = () => {
    const q = s.queue || [];
    const first = q[0] && HO.getDesign(G, ME, q[0].did);
    const pr = first ? HO.rules(G).yardProgress(G, p, s) : null;
    const cost = first ? HO.shipCostNow(G, p, first) : null;
    const left = el('div', { class: 'am-yleft' },
      el('div', { class: 'am-ytitle' }, w('queueAt', s.name)),
      el('div', { class: 'am-ybig', title: first ? first.name : '' }, first ? shipCanvas(first) : ''),
      el('div', { class: 'am-ycost' }, el('span', null, cost ? `${cash(cost.money)}${cost.proto ? ' [P]' : ''}` : ''), el('span', null, pr ? w('done', pr.pct) : '')),
      el('div', { class: 'am-ywait' }, el('span', { class: 'am-ywl' }, w('waiting')),
        el('div', { class: 'am-yslots' }, ...Array.from({ length: slots }, (_, i) => {
          // slot i is order i
          const it = q[i], d = it && HO.getDesign(G, ME, it.did), cap = d ? `${countWord(it.n)} ${d.name} (${d.W}/${d.S}) ${className(d.type)}` : '';
          return el('div', { class: 'am-yslot', role: 'button', tabindex: 0, onclick: () => { if (it) { HO.unqueueShip(G, ME, sid, i); render(); a.renderPanel(); } else a.beep(); } },
            d ? shipCanvas(d) : '', d ? el('div', { class: 'am-ycap ' + capFont(cap, 120) }, cap) : '');
        }))),
      // (the remake's own hint, not the Amiga's: only with Modern conveniences)
      (s.ship || 0) > 0 || !q.length || !G.opts.modern ? null : el('p', { class: 'am-ynote' }, w('noShip')));
    const listBox = el('div', { class: 'am-ytypes' });
    for (const d of p.designs.filter(x => !x.scrapped && types.includes(x.type))) {
      const cap = `${d.name} (${d.W}/${d.S}) ${className(d.type)}`;
      listBox.append(el('div', { class: 'am-ytype' + (sel === d.id ? ' sel' : '') + (d.scrap301 ? ' scrap' : ''), role: 'button', tabindex: 0,
        onclick: () => {
          sel = d.id;
          const q = s.queue || [], open = q.slice(0, slots).some(x => x.did === d.id) || q.length < slots;
          // (FUN_00121612 doesn't look at the scrap mark: rs.queueMarked)
          if ((!d.scrap301 || HO.rules(G).queueMarked) && open && HO.queueShips(G, ME, sid, d.id, 1)) a.Sound.play(7006); else a.beep();
          render(); a.renderPanel(); a.draw();
        } }, shipCanvas(d), el('div', { class: 'am-ycap ' + capFont(cap, 120) }, cap)));
    }
    const right = el('div', { class: 'am-yright' }, el('div', { class: 'am-ytitle' }, w('types')),
      el('div', { class: 'am-ylist' }, listBox, scroller(listBox, true)));
    const btns = el('div', { class: 'am-ybtns' },
      btn(w('newType'), () => { a.closeModal(); a.classic('build', a.openBuild, sid); }, 'am-small'),
      btn(w('ok'), () => { a.closeModal(); }),
      btn(w('cancel'), () => { s.queue = JSON.parse(before); s.yard = yard0; s.yardDid = yardDid0; a.closeModal(); a.renderPanel(); a.draw(); }));
    const keepTop = listBox.scrollTop;
    body.replaceChildren(left, right, btns);
    listBox.scrollTop = keepTop;
  };
  render();
  amWin(w('build'), body, 'am-wyard', { onClose: () => { a.save(); a.renderPanel(); } });
  return true;
}

// Typen Manager (21.png): the player's types; the chosen one's picture,
// figures, how many were built and how many there are; "Typ verschrotten"
// scraps it (or marks it, where the ruleset marks: rs.flagScrapDesign);
// "Name" renames it.
function openTypes() {
  const a = api(), G = a.G, ME = a.ME, p = a.me();
  const live = () => p.designs.filter(d => !d.scrapped);
  if (!live().length) return false;
  let cur = live()[0].id;
  const count = () => { const c = {}; for (const f of G.fleets) if (f.owner === ME) for (const k in f.ships) c[k] = (c[k] || 0) + f.ships[k]; return c; };
  const body = el('div', { class: 'am-types' });
  const render = () => {
    const ds = live(); if (!ds.some(d => d.id === cur)) cur = ds.length ? ds[0].id : null;
    const d = ds.find(x => x.id === cur), n = count();
    const listBox = el('div', { class: 'am-tlist' }, ...ds.map(x => el('div', { class: 'am-ytype' + (x.id === cur ? ' sel' : '') + (x.scrap301 ? ' scrap' : ''), role: 'button', tabindex: 0,
      onclick: () => { cur = x.id; render(); } }, shipCanvas(x), el('div', { class: 'am-ycap ' + capFont(`${x.name} (${x.W}/${x.S}) ${className(x.type)}`, 120) }, `${x.name} (${x.W}/${x.S}) ${className(x.type)}`))));
    const c = d ? HO.designCost(G, d) : null;
    const fig = (k, v) => [el('span', null, k), el('span', null, v)];
    const marks = !!HO.rules(G).flagScrapDesign;
    body.replaceChildren(
      el('div', { class: 'am-tleft' }, frame('am-tlistf', listBox, scroller(listBox, true)),
        frame('am-tcount', el('div', null, w('built', d ? (d.built || 0) : 0)), el('div', null, w('exist', d ? (n[d.id] || 0) : 0)))),
      el('div', { class: 'am-tright' },
        el('div', { class: 'am-tbig' }, d ? shipCanvas(d) : ''),
        frame('am-tfigs', ...(d ? [...fig(w('name'), d.name), ...fig(w('weite'), d.type === 'satellite' ? '0' : String(d.R)),
          ...fig(w('cls'), className(d.type)), ...fig(w('tempo'), String(d.V)),
          ...fig(w('devCost'), cash(c.proto || 0)), ...fig(w('waffen'), String(d.W)),
          ...fig(w('prodCost'), cash(c.money)), ...fig(w('shields2'), String(d.S)),
          ...fig(w('metal'), num(c.metal)), ...fig(w('miniC'), String(d.M))] : []))),
      el('label', { class: 'am-radio am-tscrap' }, el('input', { type: 'checkbox', checked: d && d.scrap301 ? 'checked' : false, disabled: !d || G.over, onchange: (e) => {
        if (!d) return;
        // the Amiga's is a toggle that marks the type for the end of the turn
        // (FUN_00122412 sets the design's +0x26), as DOS 2.0's; a ruleset that
        // scraps a type when ordered asks first, as that can't be taken back
        if (marks) { HO.rules(G).flagScrapDesign(G, p, d, 'command'); a.save(); render(); a.renderPanel(); return; }
        e.target.checked = false;
        a.confirmBox(w('scrapAsk', d.name, n[d.id] || 0), () => {
          const m = HO.scrapDesign(G, ME, d.id); a.Sound.play(7003); a.toast(`${d.name}: ${num(m)} ${w('metalWord')}`);
          if (a.UI.selFleet != null && !G.fleets.some(f => f.id === a.UI.selFleet)) a.UI.selFleet = null;
          a.renderPanel(); a.draw(); a.save(); openTypes();
        });
      } }), el('span', null, w('scrapType'))),
      el('div', { class: 'am-tbtns' }, btn(w('ok'), () => a.closeModal()), btn(w('nameBtn'), () => d && renameType(d, render), 'am-default')));
  };
  render();
  amWin(w('typeMgr'), body, 'am-wtypes', { onClose: () => a.save() });
  return true;
}
// "Name" (FUN_00122474): the "Schiff umbenennen" window (table data+0x2fd4,
// 250 x 162): a new name typed in, or "Benennen" for one the game makes up
// (FUN_00123126, the type's next name, here the ruleset's designName); Ok
// keeps it, Abbruch doesn't.
function renameType(d) {
  const a = api(), G = a.G, p = a.me();
  const inp = el('input', { class: 'am-field am-rnfield', value: d.name, maxlength: 14, 'aria-label': w('name') });
  const back = () => { a.closeModal(); openTypes(); };
  const box = el('div', { class: 'am-rename' }, el('p', { class: 'am-rn1' }, w('rnHelp1')), el('p', { class: 'am-rn2' }, w('rnHelp2')), inp,
    el('div', { class: 'am-rnbtns' },
      btn(w('ok'), () => { const v = inp.value.trim(); if (v) d.name = v; a.save(); back(); a.renderPanel(); }),
      btn(w('autoName'), () => { inp.value = HO.designName(G, p, d.type); inp.focus(); }),
      btn(w('cancel'), back)));
  amWin(w('renameTitle'), box, 'am-wrename');
  inp.focus(); inp.select();
}

// Spielervergleich (18.png; ho! FUN_00123c0e, table data+0x35c2): for each
// of nine figures (the turn's record: Profit total, Metall übrig, planets,
// ships, the five tech levels) a score of 10 for each other player ahead of
// you and 5 for each level with you; your picture goes down from "erster"
// by score / (10 x (players - 1)) of the way to "letzter" (a tie with
// everyone is the middle). None in 2000 ("Es gibt keinen Vergleich vor dem
// Jahre 2010!"), nor for a player out of the game ("Sie haben das Spiel im
// Jahre ... gewonnen/verloren!"). Info (gadget 2) opens the players' list.
function openCompare() {
  const a = api(), G = a.G, ME = a.ME, me = a.me();
  const alive = G.players.filter(q => q.alive && !q.surrendered);
  const ships = (q) => G.fleets.filter(f => f.owner === q.id).reduce((n, f) => n + HO.fleetCount(f), 0);
  const cats = [['cProfit', q => HO.projected(G, q).income], ['cMetal', q => q.metal], ['cPlanets', q => HO.colonies(G, q.id).length], ['cShips', ships],
    ['range', q => q.tech.range], ['vel', q => q.tech.speed], ['weapons', q => q.tech.weapons], ['cShields', q => q.tech.shields], ['mini', q => q.tech.mini]];
  const others = alive.filter(q => q.id !== ME);
  const place = (fn) => {
    if (!others.length) return 0;
    const v = fn(me); let sc = 0;
    for (const q of others) { const u = fn(q); if (v < u) sc += 10; else if (v === u) sc += 5; }
    return sc / (10 * others.length);
  };
  const icon = P + 'i' + (me.female ? 1500 : 1000);
  const over = G.over || !me.alive || me.surrendered;
  const title = G.year <= 2000 ? w('noCompare') : over ? w(me.alive && !me.surrendered ? 'cWon' : 'cLost', G.year) : w('compare', alive.length, G.year);
  const plot = G.year <= 2000 || over ? el('div', { class: 'am-cplot am-cnone' }) : el('div', { class: 'am-cplot' },
    ...[w('first'), w('middle'), w('last')].map((t, i) => el('span', { class: 'am-crank r' + i }, t)),
    ...cats.map(([k, fn], i) => el('div', { class: 'am-ccat', style: `--i:${i}` }, el('span', { class: 'am-cpic', style: `--y:${place(fn)}` }, img(icon)), el('span', { class: 'am-cname' }, w(k)))));
  const body = el('div', { class: 'am-compare' }, frame('am-cframe', plot),
    el('div', { class: 'am-cbtns' }, btn(w('ok'), () => a.closeModal()), btn(w('info'), () => { a.closeModal(); openPlayerList(); }, 'am-default')));
  amWin(title, body, 'am-wcompare');
  return true;
}
// "Liste aller Spieler und ihrer Eigenschaften" (FUN_00123a8c, table
// data+0x34ea, 360 x 182): each player with the skill level (Neuling to
// Profi, strings 76-79), and under the list "Computerintelligenz: ..."
function openPlayerList() {
  const a = api(), G = a.G;
  const SK = { novice: 0, beginner: 1, normal: 2, advanced: 3, expert: 4 };
  const IQ = { dumb: ['Dumm', 'Bundy', 'Stupide', 'Aptal', 'Torpe'], average: ['Normal', 'Normal', 'Moyen', 'Ortalama', 'Normal'], smart: ['Klug', 'Smart', 'Brillant', 'Akıllı', 'Listo'] };
  const rows = el('div', { class: 'am-plrows' }, ...G.players.map(q => {
    const k = SKILLS[SK[q.skill] != null ? SK[q.skill] : 2];
    return el('div', { class: 'am-plrow' }, el('span', null, q.name), el('span', null, pick(k.slice(1))));
  }));
  const iq = IQ[G.opts.iq] || IQ.average;
  const body = el('div', { class: 'am-plist2' }, frame('am-plframe', rows, scroller(rows, true)),
    el('p', { class: 'am-pliq' }, w('iqLine', pick(iq))),
    el('div', { class: 'am-plbtns' }, btn(w('ok'), () => { a.closeModal(); openCompare(); }, 'am-default')));
  amWin(w('playerList'), body, 'am-wplist');
}

// Aufteilen der Schiffe (16.png; ho! FUN_001229ea, table data+0x326e): the
// ships of ONE type at this star, the selected fleet's, in a grid of 4 x 2
// cells (145 x 41 pixels, filled down then across), a cell a fleet: its
// count and the ship's picture; an eighth fleet and more go into the last
// cell. A drag from one cell to another moves one ship, with Shift the whole
// cell (FUN_001227fe, FUN_00122748; a finger: a long press first takes the
// whole cell, the remake's stand-in for Shift). Guppieren puts every ship in
// the first cell (FUN_00122950), Vereinzeln one in each of the first seven
// and the rest in the last (FUN_0012298a). Ok makes the cells the fleets
// (the Amiga's: the lowest fuel and no orders, as merging fleets gives
// here: the engine's mergeFleets and splitFleet with the ruleset's rules);
// Abbruch changes nothing.
function openSplitter(f0) {
  const a = api(), G = a.G, ME = a.ME, sid = f0.star;
  if (sid == null || G.over || f0.to != null) return false;
  const did0 = +Object.keys(f0.ships)[0];
  const only = (f) => Object.keys(f.ships).length === 1 && +Object.keys(f.ships)[0] === did0;
  if (!only(f0)) return a.classic('split', a.openSplit, f0); // a fleet of several types: the classic window
  const fleets = a.fleetOrder(G.fleets.filter(f => f.owner === ME && f.star === sid && f.to == null && !f.sat && only(f)));
  const d = HO.getDesign(G, ME, did0);
  const N = 8, cells = new Array(N).fill(0);
  fleets.forEach((f, i) => { cells[Math.min(i, N - 1)] += HO.fleetCount(f); });
  const start = cells.slice();
  const body = el('div', { class: 'am-split' });
  const grid = el('div', { class: 'am-sgrid' });
  const paint = () => {
    grid.replaceChildren(...cells.map((n, i) => el('div', { class: 'am-scell', 'data-i': i, style: `--c:${Math.floor(i / 2)};--r:${i % 2}` },
      n ? el('span', { class: 'am-sn' }, num(n)) : null, n ? shipCanvas(d) : null)));
  };
  // a drag: one ship, or the whole cell with Shift (or after a long press)
  let drag = null;
  const cellAt = (x, y) => { const e = document.elementFromPoint(x, y); const c = e && e.closest('.am-scell'); return c && grid.contains(c) ? +c.dataset.i : -1; };
  grid.addEventListener('pointerdown', (e) => {
    const i = cellAt(e.clientX, e.clientY);
    if (i < 0 || !cells[i]) return;
    e.preventDefault(); grid.setPointerCapture(e.pointerId);
    drag = { i, all: e.shiftKey, t: setTimeout(() => { if (drag) { drag.all = true; grid.classList.add('am-sall'); } }, 500) };
    grid.children[i].classList.add('am-sfrom');
  });
  grid.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const j = cellAt(e.clientX, e.clientY);
    for (const c of grid.children) c.classList.toggle('am-sto', +c.dataset.i === j && j !== drag.i);
  });
  const end = (e, ok) => {
    if (!drag) return;
    clearTimeout(drag.t); grid.classList.remove('am-sall');
    const j = ok ? cellAt(e.clientX, e.clientY) : -1, i = drag.i, all = drag.all || e.shiftKey;
    drag = null;
    if (j >= 0 && j !== i && cells[i]) { const k = all ? cells[i] : 1; cells[j] += k; cells[i] -= k; }
    paint();
  };
  grid.addEventListener('pointerup', (e) => end(e, true));
  grid.addEventListener('pointercancel', (e) => end(e, false));
  const group = () => { const t = cells.reduce((x, y) => x + y, 0); cells.fill(0); cells[0] = t; paint(); };
  const single = () => { let t = cells.reduce((x, y) => x + y, 0); for (let i = 0; i < N; i++) { const k = i < N - 1 ? Math.min(1, t) : t; cells[i] = k; t -= k; } paint(); };
  const ok = () => {
    const want = cells.filter(n => n > 0);
    if (JSON.stringify(cells) !== JSON.stringify(start) && fleets.length && G.fleets.includes(fleets[0])) {
      // one fleet of them all, then a fleet split off for each cell after the first
      const into = fleets[0];
      for (const f of fleets.slice(1)) if (G.fleets.includes(f)) HO.mergeFleets(G, into, f);
      for (const n of want.slice(1)) if (HO.fleetCount(into) > n) HO.splitFleet(G, into, { [did0]: n });
      a.UI.selFleet = into.id;
    }
    a.closeModal(); a.save(); a.renderPanel(); a.draw();
  };
  paint();
  body.append(el('p', null, w('splitHelp1')), el('p', null, w('splitHelp2')), frame('am-sframe', grid),
    el('div', { class: 'am-spbtns' }, btn(w('ok'), ok), btn(w('group'), group), btn(w('single'), single), btn(w('cancel'), () => a.closeModal(), 'am-default')));
  amWin(w('split'), body, 'am-wsplit', { onClose: () => { a.renderPanel(); a.draw(); } });
  return true;
}

// ---------- the windows the screenshots don't show, from the program's tables ----------
// An item's place in a window table is in pixels inside the window's borders
// (ho! FUN_0010c1e0); the window is that plus its borders and title bar.
const at = (x, y, w2, h) => `left:calc(${x} * var(--u));top:calc(${y} * var(--v));` + (w2 ? `width:calc(${w2} * var(--u));` : '') + (h ? `height:calc(${h} * var(--v));` : '');
// a list window: a frame of rows 20 pixels apart with a scroll bar, and buttons
function listWin({ title, size: [W, H], frame: [fx, fy, fw, fh], rows: [rx, ry, rw], scroll: [sx, sy, sh], items, buttons, pick }) {
  const a = api();
  let sel = -1;
  const list = el('div', { class: 'am-lrows', style: at(rx - fx, ry - fy, rw, sh) });
  const paint = () => list.replaceChildren(...items.map((t, i) => el('div', { class: 'am-lrw' + (i === sel ? ' sel' : ''), role: 'option', tabindex: 0,
    onclick: () => { sel = i; paint(); }, ondblclick: () => { sel = i; if (pick) pick(i); } }, ...(Array.isArray(t) ? t.map(c => el('span', null, c)) : [t]))));
  paint();
  const bar = scroller(list, true); bar.setAttribute('style', at(sx - fx, sy - fy, 16, sh));
  const body = el('div', { class: 'am-listwin' }, el('div', { class: 'am-frame', style: at(fx, fy, fw, fh) }, list, bar),
    ...buttons.map(([label, x, y, bw, fn]) => { const b = btn(label, () => fn(sel)); b.setAttribute('style', at(x, y, bw, 20)); return b; }));
  const win = amWin(title, body, 'am-wlist');
  win.style.width = `calc(${W + 8} * var(--u))`; win.style.height = `calc(${H + 18} * var(--v))`;
  return win;
}
// "Liste der Flotten" (FUN_00122f78, table data+0x3322, 560 x 182): your
// fleets but satellites, a line each (FUN_00122d64, strings 712-715); "Gehe
// zu ..." selects the fleet and its star, unless it is in hyperspace (727)
function openFleetListAm() {
  const a = api(), G = a.G, ME = a.ME;
  const fl = a.fleetOrder(G.fleets.filter(f => f.owner === ME && !f.sat));
  const year = (t) => G.year + 10 * t;
  const line = (f) => {
    const n = fleetLine(G, f);
    if (f.to != null) return w('flFly', n, G.stars[f.from].name, G.stars[f.to].name, year(Math.ceil(Math.max(0, f.dist - f.prog) / Math.max(1, HO.fleetSpeed(G, f)) - 1e-9)));
    if (f.dest != null) return w('flSoll', n, G.stars[f.dest].name, year(Math.ceil(HO.starDist(G, f.star, f.dest) / Math.max(1, HO.fleetSpeed(G, f)) - 1e-9)));
    const stuck = G.stars[f.star].owner !== ME && !G.stars.some(s => s.id !== f.star && HO.starDist(G, f.star, s.id) <= f.fuel + 1e-9);
    return w(stuck ? 'flStuck' : 'flAt', n, G.stars[f.star].name);
  };
  const go = (i) => {
    const f = fl[i]; if (!f) return;
    if (f.to != null) { a.toast(w('flHyper')); return; }
    a.closeModal(); a.UI.sel = f.star; a.UI.selFleet = f.id; a.centerOn(f.star); a.renderPanel(); a.draw();
  };
  listWin({ title: w('fleetList'), size: [560, 182], frame: [16, 8, 528, 144], rows: [20, 10, 500], scroll: [522, 10, 139], items: fl.map(line), pick: go,
    buttons: [[w('ok'), 160, 155, 100, () => a.closeModal()], [w('goTo'), 300, 155, 100, go]] });
  return true;
}
// "Liste der erforschten Planeten" (FUN_001239ac, table data+0x33fc, 456 x
// 182; the order, FUN_00123294: nobody's, then other players', then yours):
// name, temperature, gravity, metal and whose (strings 735-737)
function openStarListAm() {
  const a = api(), G = a.G, ME = a.ME, p = a.me();
  const ks = G.stars.map(s => ({ s, k: HO.know(G, p, s.id) })).filter(o => o.s.owner === ME || o.k.explored);
  const grp = (o) => (o.s.owner === ME ? 2 : o.k.owner >= 0 ? 1 : 0);
  ks.sort((x, y) => grp(x) - grp(y) || x.s.name.localeCompare(y.s.name));
  const row = ({ s, k }) => {
    const src = s.owner === ME ? s : k;
    return [s.name, temp(72 + (src.t - p.homeT)), HO.gravText(G, src.g, p.homeG, false), num(src.metal), w(['stNobody', 'stEnemy', 'stMine'][grp({ s, k })])];
  };
  const go = (i) => { const o = ks[i]; if (!o) return; a.closeModal(); a.UI.sel = o.s.id; a.UI.selFleet = null; a.centerOn(o.s.id); a.renderPanel(); a.draw(); };
  listWin({ title: w('starList'), size: [456, 182], frame: [16, 8, 424, 142], rows: [20, 10, 398], scroll: [420, 10, 139], items: ks.map(row), pick: go,
    buttons: [[w('ok'), 100, 155, 100, () => a.closeModal()], [w('goTo'), 256, 155, 100, go]] });
  return true;
}

// the About window (20.png): the Amiga version's credits
function openAmigaAbout() {
  const a = api();
  const lines = ABOUT.map(pick);
  const body = el('div', { class: 'am-about' }, el('div', { class: 'am-apic' }, img(P + 'd3520')),
    frame('am-atext', ...lines.map(t => el('p', null, t || ' '))), el('div', { class: 'am-abtns' }, btn(w('ok'), () => a.closeModal(), 'am-dotted')));
  const win = amWin(w('about'), body, 'am-wabout');
  win.querySelector('.wtitle').append(gadget('depth', 'Depth', () => a.closeModal()));
}

// T.window: the Amiga's own windows in place of the classic ones
function skinWindow(name, ...args) {
  if (!game()) return false;
  if (name === 'build') return openShipyard(args[0]);
  if (name === 'types') return openTypes();
  if (name === 'players') return openCompare();
  if (name === 'split') return openSplitter(args[0]);
  if (name === 'fleets') return openFleetListAm();
  if (name === 'stars') return openStarListAm();
  return false;
}

// ---------- Neue Galaxis erstellen and Spieler Registration (9.png, 11.png) ----------
// The classic New Game form stays as it is (every setting the rules have);
// for the DOS 2.0 rules its galaxy settings are the Amiga's picture buttons
// and slider, and its player's the Registration window; anything else it
// has is under "Mehr…". Another ruleset shows the whole form.
const PICS = {
  density: { sel: 'd_density', opts: [['dense', 3050, 'Dicht', 'Dense', 'Dense', 'Yoğun', 'Densa'], ['sparse', 3051, 'Licht', 'Sparse', 'Clairsemée', 'Seyrek', 'Dispersa']] },
  shape: { sel: 'd_shape', opts: [['circle', 3020, 'Kreis', 'Circle', 'Cercle', 'Daire', 'Círculo'], ['random', 3021, 'Zufall', 'Random', 'Aléatoire', 'Rastgele', 'Aleatoria'], ['ring', 3022, 'Ring', 'Ring', 'Anneau', 'Halka', 'Anillo'], ['spiral', 3023, 'Spiral', 'Spiral', 'Spirale', 'Sarmal', 'Espiral'], ['grid', 3024, 'Gitter', 'Grid', 'Grille', 'Izgara', 'Cuadrícula']] },
  iq: { sel: 'd_iq', opts: [['dumb', 3030, 'Dumm', 'Bundy', 'Stupide', 'Aptal', 'Torpe'], ['average', 3031, 'Normal', 'Normal', 'Moyen', 'Ortalama', 'Normal'], ['smart', 3032, 'Klug', 'Smart', 'Brillant', 'Akıllı', 'Listo']] },
  size: { sel: 'd_size', opts: [['small', 3040, 'Klein', 'Small', 'Petite', 'Küçük', 'Pequeña'], ['medium', 3041, 'Mittel', 'Big', 'Moyenne', 'Orta', 'Mediana'], ['large', 3042, 'Groß', 'Huge', 'Grande', 'Büyük', 'Grande'], ['xl', 3043, 'Sehr Groß', 'Giant', 'Très grande', 'Çok büyük', 'Muy grande'], ['huge', 3044, 'Riesig', 'Extra Large', 'Gigantesque', 'Devasa', 'Descomunal']] },
};
// [value, the Amiga's German, English, French, Turkish, Spanish]
const SKILLS = [['novice', 'Neuling', 'Novice', 'Novice', 'Acemi', 'Novato'], ['beginner', 'Anfänger', 'Beginner', 'Débutant', 'Yeni başlayan', 'Principiante'], ['normal', 'Normal', 'Normal', 'Normal', 'Normal', 'Normal'], ['advanced', 'Profi', 'Profi', 'Avancé', 'Gelişmiş', 'Avanzado'], ['expert', 'Experte', 'Expert', 'Expert', 'Uzman', 'Experto']];
function newGame(f, ctx) {
  const a = api(), win = f.closest('.win');
  if (!win) return;
  win.classList.add('am-win', 'am-wng');
  const titleSpan = win.querySelector('.wtitle span');
  const field = (n) => f.querySelector(`[name="${n}"]`);
  const fire = (n) => n.dispatchEvent(new Event('change', { bubbles: true }));
  if (pendingGalaxy && field('galaxy')) { field('galaxy').value = pendingGalaxy; pendingGalaxy = null; } // (the name Neues Spiel's file requester took)
  const more = el('div', { class: 'am-more' }, ...[...f.childNodes]);
  f.append(more);
  const dosOn = () => { const g = field('d_skill'); const box = g && g.closest('.group'); return !!box && !box.hidden; };
  // the galaxy
  const group = (key, label) => {
    const P2 = PICS[key], sel = field(P2.sel);
    const row = el('div', { class: 'am-ngrow am-ng-' + key, role: 'radiogroup', 'aria-label': label });
    for (const [v, n, ...words5] of P2.opts) {
      row.append(el('button', { type: 'button', class: 'am-picbtn' + (sel && sel.value === v ? ' on' : ''), role: 'radio', 'aria-checked': sel && sel.value === v ? 'true' : 'false',
        onclick: () => { if (!sel) return; sel.value = v; fire(sel); paint(); } }, img(P + 'i' + n), el('span', null, pick(words5))));
    }
    return el('div', { class: 'am-nggroup am-g-' + key }, el('div', { class: 'am-nglabel' }, label), row);
  };
  const comp = field('computers');
  const cmax = () => [...comp.options].filter(o => /^\d+$/.test(o.value) && !o.hidden && !o.disabled).reduce((m, o) => Math.max(m, +o.value), 1);
  const cmin = () => [...comp.options].filter(o => /^\d+$/.test(o.value) && !o.hidden && !o.disabled).reduce((m, o) => Math.min(m, +o.value), 99);
  const cnum = el('span', { class: 'am-cnum' });
  const slider = el('input', { type: 'range', class: 'am-slider', min: 1, max: 8, step: 1, 'aria-label': w('computers'),
    oninput: (e) => { comp.value = String(e.target.value); fire(comp); cnum.textContent = comp.value; } });
  const galaxy = el('div', { class: 'am-ngpane am-galaxy' },
    group('density', w('density')), group('shape', w('shape')), group('iq', w('iq')), group('size', w('size')),
    el('div', { class: 'am-nggroup am-g-comp' }, el('div', { class: 'am-nglabel' }, w('computers')), el('div', { class: 'am-comprow' }, cnum,
      el('button', { type: 'button', class: 'am-arrow am-sl', 'aria-label': '−', tabindex: -1, onclick: () => { slider.value = String(Math.max(+slider.min, +slider.value - 1)); slider.dispatchEvent(new Event('input')); } }),
      slider,
      el('button', { type: 'button', class: 'am-arrow am-sr', 'aria-label': '+', tabindex: -1, onclick: () => { slider.value = String(Math.min(+slider.max, +slider.value + 1)); slider.dispatchEvent(new Event('input')); } }))),
    el('div', { class: 'am-ngbtns' },
      btn(w('moreSettings'), () => { win.classList.toggle('am-showmore'); }, 'am-small am-morebtn'),
      btn(w('bang'), () => { if (dosOn()) showReg(); else f.requestSubmit(); }),
      btn(w('cancel'), () => a.closeModal(), 'am-default')));
  // the player
  const skillSel = field('d_skill'), nameIn = field('name'), femSel = field('female');
  const radio = (name, v, label, on, set) => el('label', { class: 'am-radio' }, el('input', { type: 'radio', name: 'am-' + name, value: v, checked: on ? 'checked' : false, onchange: () => set(v) }), el('span', null, label));
  const reg = el('div', { class: 'am-ngpane am-reg', hidden: true });
  const showReg = () => {
    const fem = femSel && femSel.value === '1';
    const nameBox = el('input', { class: 'am-field', value: nameIn ? nameIn.value : '', maxlength: 20, 'aria-label': w('yourName'), oninput: (e) => { if (nameIn) nameIn.value = e.target.value; } });
    reg.replaceChildren(
      frame('am-rskill', el('div', null, w('skill')), ...SKILLS.map(([v, ...k5]) => radio('skill', v, pick(k5), skillSel && skillSel.value === v, (x) => { skillSel.value = x; fire(skillSel); }))),
      frame('am-rname', el('div', null, w('yourName')), nameBox, el('div', null, w('password')), el('input', { class: 'am-field', type: 'password', disabled: 'disabled', 'aria-label': w('password'), title: w('noPassword') })),
      frame('am-rsex', el('div', null, w('sex')), el('div', { class: 'am-rsexrow' }, radio('sex', '0', w('man'), !fem, (x) => { if (femSel) { femSel.value = x; fire(femSel); } }), radio('sex', '1', w('woman'), fem, (x) => { if (femSel) { femSel.value = x; fire(femSel); } }))),
      el('div', { class: 'am-rpic' }, img(P + 'd3520')),
      el('div', { class: 'am-rbtns' }, btn(w('ok'), () => f.requestSubmit()), btn(w('cancel'), () => { reg.hidden = true; galaxy.hidden = false; win.classList.remove('am-regstep'); titleSpan.textContent = w('ngTitle'); })));
    galaxy.hidden = true; reg.hidden = false; win.classList.add('am-regstep'); titleSpan.textContent = w('reg');
    nameBox.focus();
  };
  const paint = () => {
    const on = dosOn();
    win.classList.toggle('am-plain', !on);
    galaxy.querySelectorAll('.am-nggroup').forEach(g => { g.hidden = !on; });
    for (const key of Object.keys(PICS)) {
      const sel = field(PICS[key].sel);
      galaxy.querySelectorAll('.am-ng-' + key + ' .am-picbtn').forEach((b, i) => { const v = PICS[key].opts[i][0]; b.classList.toggle('on', !!sel && sel.value === v); b.setAttribute('aria-checked', sel && sel.value === v ? 'true' : 'false'); });
    }
    slider.min = String(cmin()); slider.max = String(cmax());
    const cv = /^\d+$/.test(comp.value) ? +comp.value : 4;
    slider.value = String(cv); cnum.textContent = String(cv);
  };
  f.prepend(galaxy, reg);
  titleSpan.textContent = w('ngTitle');
  f.addEventListener('change', paint);
  paint();
  ctx.refresh();
}

// ---------- the title screen: the Startup window (10.png) ----------
function page(doc) {
  const a = api();
  doc.body.classList.add('amiga');
  // the End Turn picture: the Amiga's own is the German one (d5000, "Zug Ende / Amiga+Z"), which the English
  // edition (2.1, 1995) also shows, its pictures being the German disk's; the patch (fix 'amigaEndTurnEn') draws an
  // English one, "Do Turn / Amiga+Z", the English menu's word. French, Turkish and Spanish never had an Amiga
  // release: the remake's own buttons, drawn into it in its lettering (tools/skins/amiga_endturn.py)
  Object.defineProperty(TH(), 'endTurnPic', { configurable: true, get: () => P + ({ de: 'd5000', en: HO.fixed(game(), 'amigaEndTurnEn') ? 'endturn' : 'd5000', fr: 'endturn-fr', tr: 'endturn-tr', es: 'endturn-es' }[lang()] || 'd5000') });
  // the screen's title bar and its depth gadget
  const bar = doc.getElementById('menubar');
  bar.append(el('span', { class: 'am-sdepth', 'aria-hidden': 'true' }));
  bar.addEventListener('contextmenu', (e) => { e.preventDefault(); bar.classList.toggle('am-menus'); });
  // a tap (or click) on the bar itself, not on a menu, shows or hides the menus
  bar.addEventListener('click', (e) => { if (e.target === bar || e.target.id === 'title' || e.target.classList.contains('am-sdepth')) bar.classList.toggle('am-menus'); });
  doc.addEventListener('click', (e) => { if (!e.target.closest('#menubar')) bar.classList.remove('am-menus'); });
  const logo = doc.querySelector('#menubar .logo'); if (logo) logo.textContent = 'Ho!';
  // the map in its window: the canvas, its scroll bars
  const wrap = doc.getElementById('mapwrap'), cv = doc.getElementById('map');
  const view = el('div', { id: 'mapview' }); cv.replaceWith(view); view.append(cv);
  mapBars(wrap);
  // the title screen
  const ts = doc.getElementById('titlescreen'), card = ts.querySelector('.tcard');
  const frameC = doc.getElementById('tframe');
  const info = frame('am-sinfo', el('p', { class: 'am-s1' }, 'Spaceward Ho! Amiga Version 2.0'), el('p', null, 'Copyright 1992-94 New World Computing Inc.'),
    el('p', { class: 'am-slic' }, W('licence'), el('span', null, 'Marc & Christoph')), el('p', { class: 'am-slic2' }, 'Airospace'));
  const startup = el('div', { class: 'win am-win am-wstartup', role: 'dialog', 'aria-label': w('startup') },
    el('div', { class: 'wtitle' }, W('startup')),
    el('div', { class: 'wbody' },
      el('div', { class: 'am-sleft' }, info,
        el('div', { class: 'am-sbtns' },
          btn(W('open'), () => openAslLoad()),
          btn(W('newGame'), () => openAsl('new')),
          btn(W('cancel'), () => { a.hideTitle(); setTitle(); a.draw(); }, 'am-default am-orange')),
        el('div', { class: 'am-nwc' })),
      el('div', { class: 'am-spic' }, frameC)));
  const scr = el('div', { class: 'am-tscreen' },
    el('div', { class: 'am-tbar' }, W('screen'), el('span', { class: 'am-sdepth', 'aria-hidden': 'true' })),
    el('div', { class: 'am-tback', 'aria-hidden': 'true' }), startup);
  ts.prepend(scr);
  card.classList.add('am-tcard');
  const credit = card.querySelector('.credit');
  if (credit) credit.textContent = 'With the art and sounds of Spaceward Ho! 2.0 for the Amiga (New World Computing / SOFTGOLD, 1994). Amiga version by Stefan "Bebbo" Franke; pictures by Howard Vives. Type: the Amiga game\'s own fonts.';
  const l = doc.querySelector('#menubar .logo'); if (l) l.textContent = 'Ho!';
  setTitle();
  // a change of language (js/ui-lang.js): the parts built once follow it
  if (window.HOUI) HOUI.onChange(() => { relabel(); setTitle(); for (const s of doc.querySelectorAll('select.am-pixsel')) s.replaceWith(lookOptions(s.name === 'pixels' ? 'title' : 'newgame').querySelector('select')); });
  // the panels measure their texts in the Amiga's fonts: again once they are loaded
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(() => { const A = api(); if (A && A.G) { A.renderPanel(); A.draw(); } });
  // the title screen's height changes with its credits: fit the screen again
  new ResizeObserver(() => layout()).observe(card);
  // the menus' Amiga-key glyphs, as each menu is opened
  const mbar = doc.getElementById('menubar');
  if (mbar) new MutationObserver(() => markKeys(mbar)).observe(mbar, { childList: true, subtree: true });
  // Optionen > Kämpfe zeigen starts checked, as on the Amiga (the classic page's "review battles as they happen")
  if (optGet('battles', null) == null) { optSet('battles', true); a.Prefs.review = true; a.savePrefs(); }
  // a fleet's arrival plays "Ya!" (sound 4001, "hyahh2"), as the later versions' do
  const base = TH().messageLook;
  if (base) TH().messageLook = (m, cur, x) => { const r = base.call(TH(), m, cur, x); if (r && /has arrived at|ist angekommen|a atteint/.test(String(m.text || ''))) r.sound = 4001; return r; };
  stringCursor();
  void a;
}
function title(frameC, IMG, Sound) {
  const t = IMG[P + 'd1002'];
  if (!t || !t.width) return false;
  frameC.width = t.width; frameC.height = t.height;
  frameC.getContext('2d').drawImage(t, 0, 0);
  const nwc = document.querySelector('.am-nwc');
  if (nwc && !nwc.firstChild) nwc.append(img(P + 'a538'));
  Sound.play(2000);
  setTitle();
  layout();
  return true;
}

// ---------- Intuition's string gadget ----------
// The program's text fields are string gadgets with no StringExtend
// (FUN_001022ba: GadgetType 4, a StringInfo and nothing more), so Intuition
// draws their text itself: TEXTPEN (1) on BACKGROUNDPEN (0), active or not,
// and while one is being edited the character under the cursor on FILLPEN
// (9), a whole cell past the last character (as AROS's strgadgets.c, which
// follows the V37 rendering). A browser's caret is a line, so the skin hides
// it and draws that cell over the field.
function stringCursor() {
  const doc = document, ctx = doc.createElement('canvas').getContext('2d');
  let inp = null, box = null;
  const ok = (n) => n && n.tagName === 'INPUT' && (n.type === 'text' || n.type === 'search') && doc.documentElement.classList.contains('amiga') && !n.disabled && !n.readOnly;
  const place = () => {
    if (!inp || !box) return;
    if (!inp.isConnected) { drop(); return; }
    const cs = getComputedStyle(inp), r = inp.getBoundingClientRect();
    ctx.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const pos = inp.selectionDirection === 'backward' ? inp.selectionStart : inp.selectionEnd, v = inp.value;
    const at = pos == null ? v.length : pos, ch = v[at] || ' ';
    const left = r.left + parseFloat(cs.borderLeftWidth || 0) + parseFloat(cs.paddingLeft || 0) + ctx.measureText(v.slice(0, at)).width - inp.scrollLeft;
    // (the cell over the field's own line box, so its character sits where the field's does)
    const top = r.top + parseFloat(cs.borderTopWidth || 0) + parseFloat(cs.paddingTop || 0);
    const h = r.bottom - parseFloat(cs.borderBottomWidth || 0) - parseFloat(cs.paddingBottom || 0) - top;
    Object.assign(box.style, { left: left + 'px', top: top + 'px', width: Math.max(1, ctx.measureText(ch).width) + 'px', height: Math.max(1, h) + 'px', font: ctx.font, lineHeight: cs.lineHeight });
    box.textContent = ch;
    box.hidden = left < r.left || left > r.right;
  };
  const drop = () => { if (box) box.remove(); if (inp) inp.classList.remove('am-editing'); box = null; inp = null; };
  doc.addEventListener('focusin', (e) => {
    drop();
    if (!ok(e.target)) return;
    inp = e.target; inp.classList.add('am-editing');
    box = el('span', { class: 'am-cursor', 'aria-hidden': 'true' }); doc.body.append(box);
    place();
  });
  doc.addEventListener('focusout', () => drop());
  if (doc.fonts && doc.fonts.addEventListener) doc.fonts.addEventListener('loadingdone', () => { if (inp) place(); }); // (a font that loads after the cell was measured)
  for (const ev of ['input', 'keyup', 'keydown', 'pointerup', 'select']) doc.addEventListener(ev, () => { if (inp) requestAnimationFrame(place); }, true);
  doc.addEventListener('selectionchange', () => { if (inp) place(); });
  window.addEventListener('resize', () => { if (inp) place(); });
  doc.addEventListener('scroll', () => { if (inp) place(); }, true);
}

// ---------- the ASL file requester ----------
// Spiel öffnen, Datei > Öffnen and Neues Spiel (FUN_00108904, FUN_0010840e, FUN_001084f2) ask asl.library's file
// requester for the galaxy, its hail string 716 "Name der zu öffnenden Galaxis:" ("Name der neuen Galaxis:" for a
// new one). Jake's captures 28: ASL draws the window itself, in English whatever the game's language (asl.library
// 37, before locale.library) and in the system font, Topaz: the title with the close, zoom and depth gadgets, the
// file list with its drawers marked "(Drw)" on an orange-gold cell and its scroller, the Pattern ("#?.HO!"), Drawer
// and File fields with their labels in white, the buttons OK, Disks, Parent and Cancel, and a sizing gadget in the
// cyan frame's bottom right. The page's "files" are the game this browser keeps; Disks stands for the disks (the
// browser's own file picker, to import a saved game).
let pendingGalaxy = null; // the name Neues Spiel's requester took, for Neue Galaxis erstellen
const ASL_DRAWERS = ['c', 's', 'libs', 'devs', 'fonts']; // (stand-ins: the system disk's drawers the capture lists)
function openAsl(mode) {
  const a = api(), doc = document, isNew = mode === 'new';
  const save = (() => { try { return localStorage.getItem('ho5.save'); } catch (e) { return null; } })();
  let name = null;
  if (save) { try { const g = HO.load(save); name = String((g.opts && g.opts.galaxy) || 'Galaxis').slice(0, 30); } catch (e) { name = null; } }
  const fileName = name ? name + '.Ho!' : null;
  let drawer = '';
  const fileIn = el('input', { class: 'am-field am-aslfile', value: isNew ? 'Mars.Ho!' : '', 'aria-label': 'File', spellcheck: 'false' });
  const drawIn = el('input', { class: 'am-field', value: '', 'aria-label': 'Drawer', spellcheck: 'false' });
  const patIn = el('input', { class: 'am-field', value: '#?.HO!', 'aria-label': 'Pattern', spellcheck: 'false' });
  const list = el('div', { class: 'am-asllist', role: 'listbox' });
  const fill = () => {
    list.replaceChildren();
    if (drawer) return; // (an empty drawer: the page keeps no files but the game)
    for (const d of ASL_DRAWERS) list.append(el('div', { class: 'am-aslrow am-asldrw', role: 'option', tabindex: 0, onclick: () => { drawer = d; drawIn.value = d; fill(); } }, raw(el('span', { class: 'am-asltag' }), '(Drw)'), raw(el('span'), d)));
    if (fileName) list.append(el('div', { class: 'am-aslrow', role: 'option', tabindex: 0,
      onclick: (e) => { for (const r of list.children) r.classList.toggle('sel', r === e.currentTarget); fileIn.value = fileName; },
      ondblclick: () => { fileIn.value = fileName; go(); } }, el('span', null, fileName)));
  };
  const go = () => {
    const f = fileIn.value.trim();
    if (!f) { a.beep(); return; }
    a.closeModal();
    if (isNew) { pendingGalaxy = f.replace(/\.ho!$/i, ''); doc.getElementById('tnew').click(); return; }
    if (fileName && f === fileName) { const c = doc.getElementById('tcont'), ts = doc.getElementById('titlescreen'); if (ts && !ts.hidden && c && !c.hidden) c.click(); return; } // (a game being played is that one)
    a.toast(w('aslMissing'));
  };
  // (asl.library's own English: set as text after the page's translating el, which would put 'File' into Datei)
  const raw = (n, t) => { n.textContent = t; return n; };
  const lab = (t) => raw(el('span', { class: 'am-asllab' }), t);
  const scr = scroller(list, true);
  const body = el('div', { class: 'am-asl', translate: 'no', lang: 'en' }, // (asl.library draws in English whatever the language)
    el('div', { class: 'am-asllistf' }, list, scr),
    lab('Pattern'), patIn, lab('Drawer'), drawIn, lab('File'), fileIn,
    el('div', { class: 'am-aslbtns' }, raw(btn('x', go), 'OK'), raw(btn('x', () => { a.closeModal(); doc.getElementById('timport').click(); }), 'Disks'), raw(btn('x', () => { if (drawer) { drawer = ''; drawIn.value = ''; fill(); } else a.beep(); }), 'Parent'), raw(btn('x', () => a.closeModal()), 'Cancel')));
  fill();
  const win = amWin(isNew ? w('aslNew') : w('aslOpen'), body, 'am-wasl');
  const bar = win.querySelector('.wtitle');
  const close = bar.querySelector('.close'); if (close) bar.prepend(close);
  bar.append(gadget('zoom', 'Zoom', () => {}), gadget('depth', 'Depth', () => a.closeModal()));
  win.append(el('div', { class: 'am-sizeg', 'aria-hidden': 'true' }));
  fileIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  if (isNew) { fileIn.focus(); fileIn.setSelectionRange(0, 0); }
  requestAnimationFrame(() => { if (scr._sync) scr._sync(); });
  return true;
}
const openAslLoad = () => openAsl('open');

// Spaceward Ho! Spieleintrag (capture 33; FUN_0010ce20, data+0x41a4): the program asks who is playing at the start of
// a game: "Identifizieren Sie sich:", Name, Paßwort, and Ok and Info... (ghosted until a name is typed) and Abbruch.
// The remake keeps no passwords, so the field is there and used for nothing; Ok goes on to the first turn, Info...
// shows the players, and Abbruch goes on too (there is no program to leave).
function spieleintrag(done) {
  const a = api();
  if (!game()) return false;
  const name = el('input', { class: 'am-field am-enname', maxlength: 20, 'aria-label': w('name'), spellcheck: 'false', autocomplete: 'off' });
  const pass = el('input', { class: 'am-field am-enpass', type: 'password', maxlength: 8, 'aria-label': w('password'), autocomplete: 'off' });
  let ok = null, info = null;
  const next = () => { a.closeModal(); done(); };
  ok = btn(w('ok'), () => { if (name.value.trim()) next(); });
  info = btn(w('infoDots'), () => { if (name.value.trim()) openPlayerList(); });
  const sync = () => { const none = !name.value.trim(); ok.disabled = none; info.disabled = none; };
  name.addEventListener('input', sync);
  name.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); if (name.value.trim()) next(); } });
  const body = el('div', { class: 'am-entry' },
    frame('am-enframe', el('p', { class: 'am-en1' }, w('identify')), el('p', { class: 'am-en2' }, w('name')), name, el('p', { class: 'am-en3' }, w('password')), pass),
    el('div', { class: 'am-enbtns' }, ok, info, btn(w('cancel'), next)));
  sync();
  const win = amWin(w('entryTitle'), body, 'am-wentry', { sticky: true });
  win.querySelector('.wtitle').append(gadget('depth', 'Depth', () => {}));
  name.focus();
  return true;
}

// ---------- what Jake's captures settle: the alert, the saving panel, the busy pointer, the dragged route ----------
// The alert (Jake's captures 27 and 45: Intuition's AutoRequest-style window on the screen): the title bar
// "Spaceward Ho!" with the depth gadget, the dithered frame, the standing cowboy (picture d3520) on white,
// the text on a grey panel, and the buttons at the bottom; the default one has the dark-red dotted frame.
function amigaAlert(kind, text, yes) {
  if (kind !== 'underfunded' || !game()) return false;
  const a = api();
  // Optionen > Warnungen ausgeben, off: the program doesn't warn, the turn just goes on
  if (!warningsOn()) { yes(); return true; }
  alertWindow(w('colonyWarn'), [[w('ok'), () => { a.closeModal(); yes(); }], [w('cancel'), () => a.closeModal(), true]]);
  void text;
  return true;
}
function alertWindow(text, buttons) {
  const a = api();
  const body = el('div', { class: 'am-alert' }, el('div', { class: 'am-apic' }, img(P + 'd3520')), el('div', { class: 'am-atext' }, el('p', null, text)),
    el('div', { class: 'am-abtn2' }, ...buttons.map(([label, fn, dflt]) => btn(label, fn, dflt ? 'am-default am-dotted' : ''))));
  const win = amWin(w('about'), body, 'am-walert');
  win.querySelector('.wtitle').append(gadget('depth', 'Depth', () => a.closeModal()));
  // (Return takes the default button: Abbruch, as the capture has it)
  win.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); const d = buttons.find(b => b[2]); if (d) d[1](); } });
  const d = win.querySelector('.am-default'); if (d) d.focus();
  return win;
}
// "Neuer Spielstand wird gespeichert" over the star panel, with "Speichern der Galaxis" and a red bar with its
// percentage (capture 31): shown briefly when the game saves (End Turn's copy, Datei > Speichern)
let savingTimer = null;
function savingPanel() {
  const app = document.getElementById('app');
  if (!app || !game()) return;
  clearInterval(savingTimer);
  for (const n of document.querySelectorAll('.am-saving')) n.remove();
  const bar = el('div', { class: 'am-sbar' }), pct = el('span', { class: 'am-spct' }, '0%');
  const box = el('div', { class: 'am-saving', role: 'status' }, el('div', { class: 'am-sttl' }, w('savingTitle')),
    el('div', { class: 'am-sfr' }, el('p', null, w('savingLine')), el('div', { class: 'am-sprog' }, bar, pct)));
  app.append(box);
  let n = 0;
  savingTimer = setInterval(() => { n += 10; bar.style.width = n + '%'; pct.textContent = n + '%'; pct.style.left = `calc(${n}% + 4px)`; if (n >= 100) { clearInterval(savingTimer); setTimeout(() => box.remove(), 160); } }, 45);
}
// Datei > Speichern keeps this state for Datei > Zurücksetzen (the game file the Amiga wrote)
const SAVEDKEY = 'ho5.amiga.saved';
function savedSnapshot() { try { const o = JSON.parse(LS.get(SAVEDKEY) || 'null'); const G = game(); return o && G && o.id === G.gameId ? o.text : null; } catch (e) { return null; } }
function saveGame() {
  const a = api(), G = a.G; if (!G) return;
  a.save(); LS.set(SAVEDKEY, JSON.stringify({ id: G.gameId, text: HO.save(G) }));
  savingPanel();
}
function revertGame() {
  const a = api(), t = savedSnapshot(); if (!a.G || !t) return;
  a.confirmBox(w('revertAsk'), () => a.openGameText(t));
}
// Optionen > Bildschirm: the pixels (the screen mode the Amiga asked for here)
let lastPointer = { x: 200, y: 40 };
document.addEventListener('pointermove', (e) => { lastPointer = { x: e.clientX, y: e.clientY }; }, true);
function screenMenu() {
  popup([{ label: w('tall'), checked: pixMode() === 'tall', fn: () => setPixels('tall') }, { label: w('square'), checked: pixMode() === 'square', fn: () => setPixels('square') }], lastPointer.x, lastPointer.y);
}
// Fenster > Fenster aufräumen: the windows back where the program put them
function tidyWindows() {
  const a = api();
  techPos = null; newsSize = null;
  for (const n of document.querySelectorAll('#app > #am-tech')) n.remove();
  LS.set(TECHFRONT, '1'); LS.set(NEWSKEY, '1');
  if (a && a.G) { a.renderPanel(); a.renderMsg(); }
}
// The game's busy pointer (capture 25): the letters W, A, I, T running diagonally, in yellow and red, while a
// turn runs (T.busy from the classic page's turn); kept at least half a second, as the turn itself is quick here
let busyAt = 0, busyTimer = null;
function busyCursor() {
  const G5 = { W: ['X...X', 'X...X', 'X.X.X', 'XX.XX', 'X...X'], A: ['.XXX.', 'X...X', 'XXXXX', 'X...X', 'X...X'], I: ['XXX', '.X.', '.X.', '.X.', 'XXX'], T: ['XXXXX', '..X..', '..X..', '..X..', '..X..'] };
  const col = { W: '#dddd99', A: '#ff3333', I: '#ff3333', T: '#ff3333' };
  let r = '';
  'WAIT'.split('').forEach((ch, i) => G5[ch].forEach((row, y) => row.split('').forEach((c, x) => { if (c === 'X') r += `<rect x='${i * 7 + x}' y='${i * 4 + y}' width='1' height='1' fill='${col[ch].replace('#', '%23')}'/>`; })));
  const wd = 26, ht = 17, k = Math.max(1, Math.round(PX.x)), kv = Math.max(1, Math.round(PX.y));
  return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${wd} ${ht}' width='${wd * k}' height='${ht * kv}' shape-rendering='crispEdges' preserveAspectRatio='none'%3E${r.replace(/</g, '%3C').replace(/>/g, '%3E')}%3C/svg%3E") 0 0, wait`;
}
function busy(on) {
  const root = document.documentElement;
  if (on) { busyAt = Date.now(); clearTimeout(busyTimer); root.style.setProperty('--am-busy', busyCursor()); root.classList.add('am-busy'); return; }
  clearTimeout(busyTimer);
  busyTimer = setTimeout(() => root.classList.remove('am-busy'), Math.max(0, 500 - (Date.now() - busyAt)));
}
// A route while it is dragged (captures 40 and the corrections): a double white line from the fleet to the pointer,
// the trip's length in turns beside the end, and, when the star is in reach, open chevrons (two short strokes) at both
// ends of the line, none when it isn't. (The classic page draws no other route in this skin: T.routes false.)
function dragRoute(cx, d) {
  const dx = d.x2 - d.x1, dy = d.y2 - d.y1, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len, nx = -uy, ny = ux;
  cx.save();
  cx.strokeStyle = '#ffffff'; cx.lineWidth = 1; cx.lineCap = 'butt';
  for (const k of [-1, 1]) { cx.beginPath(); cx.moveTo(d.x1 + nx * k * 1.2, d.y1 + ny * k * 1.2); cx.lineTo(d.x2 + nx * k * 1.2, d.y2 + ny * k * 1.2); cx.stroke(); }
  // each stroke long and doubled like the line itself (Jake: the original's were "pretty beefy")
  const chevron = (x, y, vx, vy) => {
    const L = 22, a = 0.7;
    for (const s of [-1, 1]) {
      const c = Math.cos(a * s), sn = Math.sin(a * s), ex = -(vx * c - vy * sn), ey = -(vx * sn + vy * c);
      for (const k of [-1, 1]) { const ox = -ey * k * 1.2, oy = ex * k * 1.2; cx.beginPath(); cx.moveTo(x + ox, y + oy); cx.lineTo(x + L * ex + ox, y + L * ey + oy); cx.stroke(); }
    }
  };
  if (d.ok) { chevron(d.x2, d.y2, ux, uy); chevron(d.x1, d.y1, -ux, -uy); }
  if (d.turns != null) { cx.font = TH().mapFont ? TH().mapFont() : '16px HoFont11, sans-serif'; cx.textAlign = 'left'; cx.textBaseline = 'alphabetic'; cx.fillStyle = '#ffffff'; cx.fillText(String(d.turns), (d.x1 + d.x2) / 2 + 3, (d.y1 + d.y2) / 2 - 4); } // (beside the line's middle, as captures 47 and 48)
  cx.restore();
}

// ---------- menus: the Amiga's German names, its windows, the pixels ----------
// The Amiga's menus (ho!, the menu table at data+0x430, built with
// FUN_00102d98 in the screen's font, HoFont 13): Datei, Optionen, Schiffe,
// Galaxis, Fenster, Info. The remake's commands go into them, under the
// Amiga's own words where the Amiga has the command (MENU_DE also notes its
// Amiga-key), and the rest under their own.
const MENU_DE = {
  'New game…': ['Neu', null], 'Quit to title': ['Schließen', 'W'], 'End turn and switch players': ['Zug Ende & Spielerwechsel', 'Y'],
  'Auto play…': ['Autospiel', null], 'Force end turn…': ['Zugende erzwingen', null], 'Zoom in': ['Vergrößern', '+'], 'Zoom out': ['Verkleinern', '-'],
  'List all fleets…': ['Liste der Flotten', 'L'], 'List explored stars…': ['Liste der Sterne', 'T'], 'Send a message…': ['Funkspruch', 'F'],
  'Fix spending': ['Ausgaben anpassen', null], 'Scrap ship types…': ['Schiffstypen', null], 'Players and alliances…': ['Spielervergleich', 'C'],
  'Build ships at selected colony…': ['Schiffbau', 'B'],
};
const AKEYS = []; // { key, labels (German, English), fn, feat, match }: the items with an Amiga-key
// the glyph and letter at the right of an item (Intuition's, for COMMSEQ items: FUN_00102d98 sets
// COMMSEQ and the letter for each '~' in the menu table and leaves 32 pixels for them)
function markKeys(root) {
  for (const b of root.querySelectorAll('.dropdown button[role=menuitem]')) {
    if (b.querySelector('.am-akey')) continue;
    const t = b.textContent.trim(), te = enOf(b), k = AKEYS.find(x => x.labels.includes(t) || x.labels.includes(te) || (x.match && (x.match(t) || x.match(te))));
    if (k) b.append(el('span', { class: 'am-akey', 'aria-hidden': 'true' }, k.key));
  }
}
const KEYCODES = { '+': ['Equal', 'NumpadAdd', 'BracketRight'], '-': ['Minus', 'NumpadSubtract', 'Slash'] };
document.addEventListener('keydown', (e) => {
  if (!document.documentElement.classList.contains('amiga') || !(e.altKey || e.metaKey) || e.ctrlKey) return;
  const t = e.target; if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
  const k = AKEYS.find(x => (KEYCODES[x.key] || ['Key' + x.key, 'Digit' + x.key]).includes(e.code));
  if (!k) return;
  const G = game();
  if (k.feat && !(typeof k.feat === 'function' ? k.feat() : G && HO.feature(G, k.feat))) return;
  if (k.ghost && k.ghost()) return;
  e.preventDefault(); k.fn();
});
const menuWord = (label) => {
  if (typeof label !== 'string' || !de()) return label; // (in another language, the classic page's own words in it)
  const m = MENU_DE[label];
  if (m) return m[0];
  // the remake's own items (Preferences…, Export this game…): its German (js/ui-text.js), looked up as the page
  // writes it, with "…" ("..." too, as an earlier version wrote it), then written with three dots
  // (HoFont has no "…": the Amiga writes three dots); the Amiga-keys are the Amiga's, the remake's keys stay its own
  const g = window.HOUI ? HOUI.tr(label, 'de') : label;
  return (g !== label ? g : window.HOUI ? HOUI.tr(label.replace(/\.\.\.$/, '…'), 'de') : label).replace(/…/g, '...');
};
// The skin's own preferences (the Optionen menu's toggles, kept in this browser)
const OPTKEY = 'ho5.amiga.opts';
const optGet = (k, d) => { try { const o = JSON.parse(LS.get(OPTKEY) || '{}'); return o[k] != null ? o[k] : d; } catch (e) { return d; } };
const optSet = (k, v) => { try { const o = JSON.parse(LS.get(OPTKEY) || '{}'); o[k] = v; LS.set(OPTKEY, JSON.stringify(o)); } catch (e) { /* (no storage) */ } };
// Warnungen ausgeben: the warnings the program gives at End Turn (js/skins/amiga/ui.js amigaWarn)
const warningsOn = () => optGet('warn', true) !== false;
function menus(M, ho) {
  const a = () => api();
  const G0 = () => a().G, me0 = () => G0() && a().me();
  // the menus as the real Amiga showed them (Jake's captures 35-42; docs/amiga-skin.md "Real-Amiga captures"):
  // each item [label, action, feature, checked, ghosted], and its Amiga-key
  const cmdBy = (re) => commands().find(c => re.test(c.en || ''));
  const C = { Game: M.Game, Ships: M.Ships, Galaxy: M.Galaxy, View: M.View, Help: M.Help }; // (the classic page's lists, kept: M is emptied below)
  const classicItem = (menu, en) => (C[menu] || []).find(it => it[0] === en || (typeof it[0] === 'function' && it[0]() === en));
  const classicFn = (menu, en) => { const it = classicItem(menu, en); return it ? it[1] : null; };
  const splitNow = () => { const A2 = a(), G = A2.G; if (!G) return; const f = A2.curFleet() || G.fleets.find(x => x.owner === A2.ME && x.star === A2.UI.sel && x.to == null && !x.sat); if (f) openSplitter(f); else A2.toast(w('pickFleet')); };
  const hasCmd = (re) => !!(planetBox && [...planetBox.querySelectorAll('button')].some(n => !n.disabled && re.test(enOf(n))));
  const clickCmd = (re) => { const n = planetBox && [...planetBox.querySelectorAll('button')].find(x => !x.disabled && re.test(enOf(x))); if (n) n.click(); };
  const ownStar = () => { const A2 = a(), G = A2.G; return G && A2.UI.sel != null && G.stars[A2.UI.sel].owner === A2.ME ? G.stars[A2.UI.sel] : null; };
  const zoomIdxNow = () => { const v = a().UI.view; return v ? zoomIdx(v.s) : 3; };
  const alive = () => { const G = G0(); return !!G && !G.over; };
  const fe = (en) => classicFn('Galaxy', en) || classicFn('Game', en) || classicFn('Ships', en);
  const ITEMS = {
    mFile: [
      [() => w('mNew'), () => openAsl('new')],
      [() => w('mOpen'), () => openAslLoad(), null, null, null, 'O'],
      [() => w('mSave'), () => saveGame(), null, null, () => !G0(), 'S'],
      [() => w('mRevert'), () => revertGame(), null, null, () => !G0() || !savedSnapshot()],
      [() => w('mClose'), () => classicFn('Game', 'Quit to title')(), null, null, () => !G0(), 'W'],
      [() => w('mSplit'), () => clickCmd(/^Split/), null, null, () => !hasCmd(/^Split/)],
      [() => w('mMerge'), () => clickCmd(/^Merge/), null, null, () => !hasCmd(/^Merge/)],
      [() => w('endTurn'), () => a().doEndTurn(), null, null, () => !alive(), 'Z'],
      [() => w('mEndSwitch'), () => a().switchPlayers(), null, null, () => !(G0() && HO.rules(G0()).switchPlayers && a().hotSeat()), 'Y'],
      [() => w('mPrint'), () => window.print()],
      [() => w('mQuit'), () => { const A2 = a(); if (A2.G) A2.save(); A2.titleScreen(); }, null, null, null, 'Q'],
    ],
    mOptions: [
      [() => w('mForce'), () => fe('Force end turn…')(), null, null, () => !(G0() && HO.rules(G0()).forceEndTurn && a().hotSeat())],
      [() => w('mAuto'), () => classicFn('Game', 'Auto play…')(), null, null, () => !G0()],
      [() => w('mHandle'), () => { const A2 = a(); A2.toast(w('mHandleNote')); }, null, () => true],
      [() => w('mPoll'), () => a().openPrefs(), null, null, () => !G0()],
      [() => w('mBattleSpeed'), () => a().openPrefs(), null, null, () => !G0()],
      [() => w('mShowMsgs'), () => { const P = a().Prefs; P.showMsgs = P.showMsgs === false; a().savePrefs(); }, null, () => a().Prefs.showMsgs !== false],
      [() => w('mShowBattles'), () => { const P = a().Prefs; P.review = !P.review; optSet('battles', P.review); a().savePrefs(); }, null, () => !!a().Prefs.review],
      [() => w('mWarnings'), () => optSet('warn', !warningsOn()), null, () => warningsOn()],
      [() => w('mSound'), () => { a().Sound.on = !a().Sound.on; a().savePrefs(); }, null, () => !!a().Sound.on],
      [() => w('mScreen'), (e) => screenMenu()],
    ],
    mShips: [
      [() => w('mShipTypes'), () => a().G && openTypes(), null, null, () => !G0()],
      [() => w('mNewType'), () => { const st = ownStar(); if (st) a().classic('build', a().openBuild, st.id); else a().toast(w('pickColony')); }, null, null, () => !alive(), 'N'],
      [() => w('mFleets'), () => G0() && openFleetListAm(), null, null, () => !G0(), 'L'],
      [() => w('mSplitFleets'), () => splitNow(), null, null, () => !alive(), 'G'],
      [() => { const st = ownStar(); return w('mBuildAt', st ? st.name : (G0() && a().UI.sel != null ? G0().stars[a().UI.sel].name : '')); }, () => { const st = ownStar(); if (st) { if (!openShipyard(st.id)) a().classic('build', a().openBuild, st.id); } else a().toast(w('pickColony')); }, null, null, () => !alive() || !ownStar(), 'B'],
      [() => { const A2 = a(), f = A2.G && A2.curFleet(); return f && f.scrap301 ? w('mScrap2') : w('mScrap'); }, () => { const A2 = a(), f = A2.G && A2.curFleet(); if (f && !A2.G.over) A2.toggleScrapFleet(f); }, () => !!(a().G && a().marksScrap()), null, () => !(a().G && a().curFleet()), 'V'],
      [() => { const A2 = a(), G = A2.G; return G && A2.UI.sel != null && A2.lastBattles(A2.UI.sel).length ? w('mBattle', G.stars[A2.UI.sel].name) : w('mNoBattle'); }, () => { const A2 = a(), G = A2.G, bs = G ? A2.lastBattles(A2.UI.sel) : []; if (bs.length) A2.openBattle(bs[0].id); }, null, null, () => { const A2 = a(); return !(A2.G && A2.UI.sel != null && A2.lastBattles(A2.UI.sel).length); }],
    ],
    mGalaxy: [
      [() => w('mCompare'), () => G0() && openCompare(), null, null, () => !G0(), 'C'],
      [() => w('mStarList'), () => G0() && openStarListAm(), null, null, () => !G0(), 'T'],
      [() => w('mMessage'), () => classicFn('Galaxy', 'Send a message…')(), () => !!(G0() && (HO.feature(G0(), 'chat') || HO.rules(G0()).chatCommand !== false) && classicItem('Galaxy', 'Send a message…')), null, () => !alive(), 'F'],
      [() => w('mZoomIn'), () => classicFn('View', 'Zoom in') ? classicZoom(1) : null, null, null, () => zoomIdxNow() >= 3, '+'],
      [() => w('mZoomOut'), () => classicZoom(-1), null, null, () => zoomIdxNow() <= 0, '-'],
      [() => w('mFix'), () => classicFn('Galaxy', 'Fix spending')(), () => !!(G0() && HO.rules(G0()).fixSpending && classicItem('Galaxy', 'Fix spending')), null, () => !alive()],
    ],
    mWindows: [
      [() => w('techWin'), () => setTechFront(!techFront()), () => !!game(), () => techFront(), null, '1'],
      [() => w('newsWin'), toggleNews, () => !!game(), () => newsOpen(), null, '2'],
      [() => w('mTidy'), () => tidyWindows(), null, null, () => !G0(), 'A'],
    ],
    mInfo: [[() => w('aboutAm'), openAmigaAbout]],
  };
  const classicZoom = (d) => { const A2 = a(), v = A2.UI.view; if (!v) return; const cx = (A2.map().w) / 2, cy = (A2.map().h) / 2; A2.zoomAt(cx, cy, d > 0 ? 1.3 : 1 / 1.3); };
  // the Amiga-keys: Intuition draws them, the remake answers them (Alt or the Command key for the right Amiga key)
  AKEYS.length = 0;
  for (const k of Object.keys(ITEMS)) for (const it of ITEMS[k]) {
    const key = it[5]; if (!key) continue;
    const word = typeof it[0] === 'function' ? it[0] : null;
    AKEYS.push({ key, labels: [], match: (t) => { try { return t === word(); } catch (e) { return false; } }, fn: () => it[1](), ghost: it[4], feat: it[2] });
  }
  // what the Amiga has no command for stays reachable, in the remake's own Ho! menu at the right of the strip
  // (after a line), under their own words: the Amiga's six menus have exactly the items Jake's captures show
  const used = new Set(['New game…', 'Quit to title', 'End turn and switch players', 'Auto play…', 'Force end turn…', 'Zoom in', 'Zoom out', 'Turn sound off', 'Turn sound on',
    'List all fleets…', 'List explored stars…', 'Send a message…', 'Fix spending', 'Scrap ship types…', 'Players and alliances…', 'Build ships at selected colony…', 'Next fleet', 'Review battle…', 'Turn theme music off', 'Turn theme music on']);
  const left = (items) => items.filter(it => it[0] !== '-' && !(typeof it[0] === 'string' && used.has(it[0])));
  const tr = (items) => items.map(it => (Array.isArray(it) && typeof it[0] === 'string' && it[0] !== '-' ? [() => menuWord(it[0]), ...it.slice(1)] : it));
  const others = [].concat(left(M.Game || []), left(M.Ships || []), left(M.Galaxy || []), left((M.View || []).filter(it => !(typeof it[0] === 'function' && /sound|music/i.test(String(it[0]())))), ), M.Help || []);
  const mine = { mFile: ITEMS.mFile, mOptions: ITEMS.mOptions, mShips: ITEMS.mShips, mGalaxy: ITEMS.mGalaxy, mWindows: ITEMS.mWindows, mInfo: ITEMS.mInfo };
  if (others.length) ho.push(['-'], ...tr(others));
  for (const k of Object.keys(M)) delete M[k];
  // (the menus' names: the classic page builds the bar once, so each is a
  // word kept in step with the language: menuBar below)
  Object.assign(M, mine, { commands: CMDS });
}
// the pixels, with the Skin and OS look pickers
function lookOptions(where) {
  const s = el('select', { class: 'am-pixsel', name: where === 'newgame' ? null : 'pixels', 'aria-label': w('pixels') },
    el('option', { value: 'tall' }, w('tall')), el('option', { value: 'square' }, w('square')));
  s.value = pixMode();
  s.addEventListener('change', (e) => { e.stopPropagation(); setPixels(s.value); });
  return el('label', { class: 'tskin am-look' }, el('span', null, w('pixels')), s);
}

window.HOTHEME_OVER = {
  dir: 'assets/skins/amiga/',
  // (the Amiga game was German; the skin starts in English like every other,
  // Jake's choice: German, the Amiga's words, is the title screen's Language
  // or New Game's for DOS 2.0 and Mac 2.0.1, js/languages.js)
  endTurnPic: P + 'd5000', // (a getter from page(): the picture of the game's language)
  endTurnKey: 'Amiga+Z',
  select: null, selectSmall: null, // the selection is drawStar's
  mapBg: '#000', bgStars: false,
  mapPixel: () => [PX.x, PX.y],
  mapFont: () => '16px HoFont11, sans-serif',
  planetPx: (s) => [9, 16, 16, 32][zoomIdx(s)],
  drawStar, markerAt, allyAt, ownRings: true, zoomTo, beforeTurn, afterDraw: syncMapBars, fitView,
  techBars: 'vertical', barGrid: false,
  panel, afterMsg, window: skinWindow, newGame, menus, lookOptions, page, title,
  menuName: (k) => (WORDS[k] ? W(k) : k), // the menus' names (menus above), in the language
  // no You Lost window: the Amiga game's words (texte.pff) have none, only the
  // report "Sie werden aus dem Spiel gelöscht." (624) and Spielervergleich's
  // "Sie haben das Spiel im Jahre %ld verloren!" (741), which the skin has
  youLost: false,
  // the skin's own alert, saving panel, busy pointer and dragged route (Jake's captures), and no other route lines
  alert: amigaAlert, beforeFirstTurn: spieleintrag, onSave: savingPanel, busy, dragRoute, routes: false, showMsgsPref: true,
  // nor a You Won window: 626 "Glückwunsch! Sie haben das Spiel gewonnen." is the
  // report; 633-634 ("Glückwunsch!", "Sie haben gewonnen!") are the battle's, and
  // 740 the Spielervergleich's
  youWon: false,
};
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/dos/ui.js' + (window.HO_BUILD || '') + '"><\/script>');
})();
