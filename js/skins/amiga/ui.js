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
// The Amiga game was German; its English is the remake's for a game played in
// English, and French, Turkish and Spanish are the remake's from the Amiga's
// own words (as js/ui-text.js, in the voices docs/translations.md gives), so
// a game in another language shows that language, or English, never German.
const WORDS = {
  profit: ['Profit:', 'Profit:', 'Revenu :', 'Kâr:', 'Beneficio:'], pop: ['Bev:', 'Pop:', 'Pop :', 'Nüfus:', 'Pob.:'], temp: ['Temp:', 'Temp:', 'Temp :', 'Isı:', 'Temp.:'], grav: ['Gravit:', 'Grav:', 'Gravité :', 'Yerçekimi:', 'Gravedad:'], metal: ['Metall:', 'Metal:', 'Métal :', 'Metâl:', 'Metal:'],
  owner: ['Besitzer:', 'Owner:', 'Proprio :', 'Sahip:', 'Dueño:'], nobody: ['Niemand', 'Nobody', 'Personne', 'Hiç kimse', 'Nadie'], empty: ['Unbewohnt', 'Uninhabited', 'Inhabitée', 'Issız', 'Deshabitado'], seen: ['Info Datum:', 'Info date:', 'Date info :', 'Bilgi tarihi:', 'Fecha info:'],
  orders: ['Aufträge:', 'Orders:', 'Commandes :', 'Siparişler:', 'Encargos:'], none: ['Keine.', 'None.', 'Aucune.', 'Yok.', 'Ninguno.'], unexplored: ['Unerforscht.', 'Unexplored.', 'Inexplorée.', 'Keşfedilmemiş.', 'Sin explorar.'], battleSeen: ['Ein Kampf wurde hier gesehen.', 'A battle was seen here.', 'Une bataille a été vue ici.', 'Burada bir savaş görüldü.', 'Aquí se vio una batalla.'],
  terra: ['Terra.', 'Terra.', 'Terra.', 'Terra.', 'Terra.'], met: ['Met.', 'Mine', 'Mine', 'Maden', 'Minas'], schf: ['Schf.', 'Ship', 'Prod', 'Gemi', 'Naves'],
  at: ['Stationiert auf: %1', 'Stationed at: %1', 'En orbite à : %1', 'Konum: %1', 'En órbita en: %1'], dest: ['Zielort: %1 (Entf. %2; Dauer %3)', 'Destination: %1 (dist. %2; %3 turns)', 'Départ pour : %1 (dist. %2 ; %3 tours)', 'Hedef: %1 (uzaklık %2; %3 sıra)', 'Destino: %1 (dist. %2; %3 turnos)'],
  via: ['Unterwegs nach %1 (E %2; D %3) via %4', 'Bound for %1 (d %2; t %3) via %4', 'Allant à %1 (D %2 ; T %3) via %4', '%1 yolunda (u %2; s %3), %4 üzerinden', 'Rumbo a %1 (d %2; t %3) por %4'], scrapFleet: ['Flotte zum Verschrotten.', 'Fleet to be scrapped.', 'En recyclage.', 'Hurdaya çıkacak filo.', 'Flota para desguazar.'],
  noFleets: ['Keine Flotten auf diesem Planeten', 'No fleets at this planet', 'Pas de vaisseau sur cette planète', 'Bu gezegende filo yok', 'No hay flotas en este planeta'], tank: ['Tank:', 'Fuel:', 'Fuel :', 'Yakıt:', 'Combustible:'], speed: ['Tempo:', 'Speed:', 'Vitesse :', 'Hız:', 'Velocidad:'],
  full: ['Voll', 'Full', 'Plein', 'Dolu', 'Lleno'], emptyShip: ['Leer', 'Empty', 'Vide', 'Boş', 'Vacío'], scrap: ['Schrott', 'Scrap', 'Recycl.', 'Hurda', 'Desguace'],
  metalLeft: ['Metall übrig', 'Metal left', 'Métal dispo', 'Kalan metâl', 'Metal libre'], moneyTotal: ['Geld total', 'Money total', 'Fonds total', 'Toplam para', 'Dinero total'], profitTotal: ['Profit total', 'Profit total', 'Revenu total', 'Toplam kâr', 'Benef. total'],
  tech: ['Technik Ausgaben', 'Technology', 'Technologie', 'Teknoloji', 'Tecnología'], levels: ['Akt. Stufen', 'Levels', 'Niveaux actuels', 'Seviyeler', 'Niveles'],
  range: ['Weite', 'Range', 'Distance', 'Menzil', 'Alcance'], vel: ['Tempo', 'Speed', 'Vitesse', 'Hız', 'Velocidad'], weapons: ['Waffen', 'Weapons', 'Armes', 'Silâhlar', 'Armas'], shields: ['Schilder', 'Shields', 'Boucliers', 'Kalkanlar', 'Escudos'], mini: ['Mini', 'Mini', 'Mini', 'Mini', 'Mini'], radical: ['Radikal', 'Radical', 'Radicaux', 'Radikal', 'Radical'],
  savings: ['Sparen', 'Savings', 'Epargne', 'Birikim', 'Ahorros'], techBar: ['Technik', 'Tech', 'Tech', 'Teknoloji', 'Tecnología'], linear: ['linear', 'linear', 'linéaire', 'doğrusal', 'lineal'], log: ['logar.', 'log', 'log', 'log', 'log'],
  news: ['Nachrichten', 'Messages', 'Messages', 'Mesajlar', 'Mensajes'], more: ['--mehr--', '--more--', '--suite--', '--devamı--', '--más--'],
  endTurn: ['Zug Ende', 'End turn', 'Fin Tour', 'Sıran Bitti', 'Fin del turno'],
  title: ['Spaceward Ho! - %1 in %2 im Jahre %3', 'Spaceward Ho! - %1 in %2 in %3', 'Spaceward Ho! - %1 dans %2 en %3', 'Spaceward Ho! - %1, %2, %3', 'Spaceward Ho! - %1 en %2 en %3'], screen: ['Spaceward Ho! Amiga Version 2.0', 'Spaceward Ho! Amiga Version 2.0', 'Spaceward Ho! Amiga Version 2.0', 'Spaceward Ho! Amiga Sürüm 2.0', 'Spaceward Ho! Amiga Versión 2.0'],
  ok: ['Ok', 'OK', 'OK', 'Tamam', 'Aceptar'], cancel: ['Abbruch', 'Cancel', 'Annuler', 'İptal', 'Cancelar'],
  build: ['Schiffsbau', 'Shipbuilding', 'Construction', 'Gemi yapımı', 'Astillero'], queueAt: ['Auftragsliste bei %1', 'Orders at %1', 'Commandes à %1', '%1 sipariş listesi', 'Encargos en %1'], types: ['Vorhandene Typen', 'Types', 'Types existants', 'Var olan tipler', 'Tipos existentes'], waiting: ['Auf Warteliste:', 'Waiting:', 'En attente :', 'Sırada:', 'En espera:'],
  done: ['%1% fertig', '%1% done', '%1 % fini', '%%1 bitti', '%1 % hecho'], newType: ['Neuer Typ…', 'New type…', 'Nouveau type…', 'Yeni tip…', 'Tipo nuevo…'], noShip: ['Keine Schiffsbaugelder: Schf. im Sternfenster.', 'No shipbuilding money: Ship bar in the star panel.', 'Pas d’argent pour la construction : barre Prod dans la fenêtre de l’étoile.', 'Gemi yapımına para yok: yıldız panelinde Gemi çubuğu.', 'No hay dinero para construir: barra Naves en el panel de la estrella.'],
  typeMgr: ['Spaceward Ho! Typen Manager', 'Spaceward Ho! Ship Types', 'Spaceward Ho! Gestion des types', 'Spaceward Ho! Gemi Tipleri', 'Spaceward Ho! Gestor de tipos'], name: ['Name:', 'Name:', 'Nom :', 'Ad:', 'Nombre:'], cls: ['Klasse:', 'Class:', 'Classe :', 'Sınıf:', 'Clase:'], devCost: ['Entw.kosten:', 'Design cost:', 'Coût dév. :', 'Tasarım bedeli:', 'Coste diseño:'],
  prodCost: ['Prod.kosten:', 'Unit cost:', 'Coût prod. :', 'Üretim bedeli:', 'Coste unidad:'], built: ['# Gebaut: %1', '# Built: %1', '# Construits : %1', '# Yapılan: %1', '# Construidas: %1'], exist: ['# Existent: %1', '# Existing: %1', '# Existants : %1', '# Var olan: %1', '# Existentes: %1'], scrapType: ['Typ verschrotten', 'Scrap type', 'Recycler le type', 'Tipi hurdaya çıkar', 'Desguazar el tipo'],
  nameBtn: ['Name', 'Name', 'Nom', 'Ad', 'Nombre'], rename: ['Neuer Name für %1:', 'New name for %1:', 'Nouveau nom pour %1 :', '%1 için yeni ad:', 'Nombre nuevo para %1:'], shields2: ['Schilde:', 'Shields:', 'Boucliers :', 'Kalkanlar:', 'Escudos:'], weite: ['Weite:', 'Range:', 'Distance :', 'Menzil:', 'Alcance:'], tempo: ['Tempo:', 'Speed:', 'Vitesse :', 'Hız:', 'Velocidad:'], waffen: ['Waffen:', 'Weapons:', 'Armes :', 'Silâhlar:', 'Armas:'], miniC: ['Mini:', 'Mini:', 'Mini :', 'Mini:', 'Mini:'],
  rnHelp1: ['Geben Sie einen neuen Namen ein', 'Type a new name', 'Tapez un nouveau nom', 'Yeni bir ad yaz', 'Escribe un nombre nuevo'], rnHelp2: ["oder wählen Sie 'Benennen' an", "or choose 'Name it'", 'ou choisissez « Nommer »', "ya da 'Adlandır'ı seç", 'o elige «Nombrar»'],
  autoName: ['Benennen', 'Name it', 'Nommer', 'Adlandır', 'Nombrar'], renameTitle: ['Schiff umbenennen', 'Rename ship', 'Renommer le vaisseau', 'Gemiyi yeniden adlandır', 'Renombrar la nave'],
  noCompare: ['Es gibt keinen Vergleich vor dem Jahre 2010!', 'There is no comparison before 2010!', 'Pas de comparaison avant 2010 !', '2010’dan önce karşılaştırma yok!', '¡No hay comparación antes de 2010!'],
  cWon: ['Sie haben das Spiel im Jahre %1 gewonnen!', 'You won the game in %1!', 'Vous avez gagné en %1 !', 'Oyunu %1 yılında kazandın!', '¡Ganaste la partida en %1!'], cLost: ['Sie haben das Spiel im Jahre %1 verloren!', 'You lost the game in %1!', 'Vous avez perdu en %1 !', 'Oyunu %1 yılında kaybettin!', '¡Perdiste la partida en %1!'],
  playerList: ['Liste aller Spieler und ihrer Eigenschaften', 'All the players and their settings', 'Liste de tous les joueurs et de leurs réglages', 'Bütün oyuncular ve özellikleri', 'Todos los jugadores y sus ajustes'], iqLine: ['Computerintelligenz: %1', 'Computer intelligence: %1', 'Intelligence des ordinateurs : %1', 'Bilgisayar zekâsı: %1', 'Inteligencia del ordenador: %1'],
  fleetList: ['Liste der Flotten', 'Fleets', 'Liste des flottes', 'Filoların listesi', 'Lista de flotas'], starList: ['Liste der erforschten Planeten', 'Explored planets', 'Liste des planètes explorées', 'Keşfedilen gezegenlerin listesi', 'Lista de planetas explorados'], goTo: ['Gehe zu ...', 'Go to ...', 'Aller à ...', 'Git ...', 'Ir a ...'],
  flAt: ['%1 stationiert auf %2.', '%1 at %2.', '%1 en orbite à %2.', '%1, %2 konumunda.', '%1 en órbita en %2.'], flFly: ['%1 fliegt von %2 nach %3. Ankunft: %4.', '%1 flying from %2 to %3. Arrival: %4.', '%1 quittant %2 pour %3. Prévision : %4.', '%1, %2’den %3’e uçuyor. Varış: %4.', '%1 vuela de %2 a %3. Llegada: %4.'],
  flSoll: ['%1 soll %2 %3 erreichen.', '%1 to reach %2 in %3.', '%1 arrivant à %2 en %3.', '%1, %2’e %3 yılında varacak.', '%1 llegará a %2 en %3.'], flStuck: ['%1 hängt auf %2 fest.', '%1 is stuck at %2.', '%1 en panne sèche à %2.', '%1, %2’de mahsur kaldı.', '%1 está varada en %2.'],
  flHyper: ['Diese Flotte ist zur Zeit im Hyperraum, Sie können sie derzeit nicht erreichen!', 'This fleet is in hyperspace: it cannot be reached now!', 'Cette flotte est dans l’hyperespace : impossible de la joindre pour l’instant !', 'Bu filo şu an hiperuzayda: ona şimdi ulaşılamaz!', '¡Esta flota está en el hiperespacio: ahora no se puede contactar con ella!'],
  stMine: ['meiner', 'mine', 'à moi', 'benim', 'mía'], stNobody: ['erforscht', 'explored', 'explorée', 'keşfedildi', 'explorada'], stEnemy: ['feindlich', 'enemy', 'ennemie', 'düşman', 'enemiga'],
  scrapAsk: ['%1 und alle %2 Schiffe dieses Typs verschrotten?', 'Scrap %1 and all %2 ships of that type?', 'Recycler %1 et les %2 vaisseaux de ce type ?', '%1 ve o tipteki %2 geminin hepsi hurdaya çıkarılsın mı?', '¿Desguazar %1 y las %2 naves de ese tipo?'],
  aslOpen: ['Name der zu öffnenden Galaxis:', 'Name of the galaxy to open:', 'Fichier galactique à ouvrir :', 'Açılacak galaksinin adı:', 'Nombre de la galaxia que abrir:'], open2: ['Öffnen...', 'Open...', 'Ouvrir...', 'Aç...', 'Abrir...'],
  aslMissing: ['Kann die Datei nicht lesen!', 'Can’t read the file!', 'Impossible de lire le fichier !', 'Dosya okunamıyor!', '¡No se puede leer el archivo!'], // (string 8)
  compare: ['Spielervergleich von noch %1 Spielern im Jahre %2', 'Comparing the %1 players left in %2', 'Comparaison des %1 joueurs restants en %2', '%2 yılında kalan %1 oyuncunun karşılaştırması', 'Comparación de los %1 jugadores que quedan en %2'], first: ['erster', 'first', 'premier', 'birinci', 'primero'], middle: ['mittlerer', 'middle', 'moyen', 'orta', 'medio'], last: ['letzter', 'last', 'dernier', 'sonuncu', 'último'],
  cProfit: ['Profit', 'Profit', 'Revenus', 'Kâr', 'Beneficio'], cMetal: ['Metall', 'Metal', 'Métal', 'Metâl', 'Metal'], cPlanets: ['Planeten', 'Planets', 'Planètes', 'Gezegenler', 'Planetas'], cShips: ['Schiffe', 'Ships', 'Flottes', 'Gemiler', 'Naves'], cShields: ['Schilde', 'Shields', 'Boucliers', 'Kalkanlar', 'Escudos'], info: ['Info', 'Info', 'Info', 'Bilgi', 'Info'],
  split: ['Aufteilen der Schiffe', 'Organize ships', 'Répartir vaisseaux', 'Gemileri düzenle', 'Repartir las naves'], splitHelp1: ['- Stellen Sie die Schiffe beliebig zusammen.', '- Put the ships together as you like.', '- Groupez les vaisseaux comme vous voulez.', '- Gemileri istediğin gibi bir araya getir.', '- Junta las naves como quieras.'],
  splitHelp2: ['- Klick mit UMSCHALTEN wählt eine ganze Flotte an.', '- A click with SHIFT picks a whole fleet.', '- Un clic avec MAJ choisit toute une flotte.', '- SHIFT ile tıklamak bütün bir filoyu seçer.', '- Un clic con MAYÚS elige una flota entera.'], group: ['Guppieren', 'Group', 'Grouper', 'Grupla', 'Agrupar'], single: ['Vereinzeln', 'Split up', 'Séparer', 'Ayır', 'Separar'],
  about: ['Spaceward Ho!', 'Spaceward Ho!', 'Spaceward Ho!', 'Spaceward Ho!', 'Spaceward Ho!'],
  ngTitle: ['Neue Galaxis erstellen', 'Create a new galaxy', 'Créer une nouvelle galaxie', 'Yeni bir galaksi yarat', 'Crear una galaxia nueva'], density: ['Sterndichte:', 'Star density:', 'Densité des étoiles :', 'Yıldız yoğunluğu:', 'Densidad de estrellas:'], shape: ['Art der Galaxis:', 'Kind of galaxy:', 'Type de galaxie :', 'Galaksi türü:', 'Tipo de galaxia:'], iq: ['Computerintelligenz:', 'Computer intelligence:', 'Intelligence des ordinateurs :', 'Bilgisayar zekâsı:', 'Inteligencia del ordenador:'],
  size: ['Größe der Galaxis:', 'Size of the galaxy:', 'Taille de la galaxie :', 'Galaksinin büyüklüğü:', 'Tamaño de la galaxia:'], computers: ['Anzahl der Computerspieler:', 'Number of computer players:', 'Nombre de joueurs ordinateurs :', 'Bilgisayar oyuncusu sayısı:', 'Número de jugadores del ordenador:'], bang: ['Urknall', 'Big Bang', 'Big Bang', 'Büyük Patlama', 'Big Bang'], moreSettings: ['Mehr…', 'More…', 'Plus…', 'Daha…', 'Más…'],
  reg: ['Spaceward Ho! Spieler Registration', 'Spaceward Ho! Player Registration', 'Spaceward Ho! Inscription du joueur', 'Spaceward Ho! Oyuncu Kaydı', 'Spaceward Ho! Registro del jugador'], skill: ['Spielstufe:', 'Skill:', 'Niveau :', 'Beceri:', 'Nivel:'], yourName: ['Ihr Name:', 'Your name:', 'Votre nom :', 'Adın:', 'Tu nombre:'], password: ['Paßwort:', 'Password:', 'Mot de passe :', 'Parola:', 'Contraseña:'],
  sex: ['Geschlecht:', 'Sex:', 'Sexe :', 'Cinsiyet:', 'Sexo:'], man: ['Mann', 'Man', 'Homme', 'Erkek', 'Hombre'], woman: ['Frau', 'Woman', 'Femme', 'Kadın', 'Mujer'],
  startup: ['Spaceward Ho! Startup', 'Spaceward Ho! Startup', 'Spaceward Ho! Démarrage', 'Spaceward Ho! Başlangıç', 'Spaceward Ho! Inicio'], open: ['Spiel öffnen', 'Open game', 'Ouvrir une partie', 'Oyun aç', 'Abrir partida'], newGame: ['Neues Spiel', 'New game', 'Nouvelle partie', 'Yeni oyun', 'Nueva partida'],
  pixels: ['Pixel', 'Pixels', 'Pixels', 'Pikseller', 'Píxeles'], tall: ['Amiga-Monitor (hohe Pixel)', 'Amiga monitor (tall pixels)', 'Moniteur Amiga (pixels hauts)', 'Amiga monitörü (uzun pikseller)', 'Monitor Amiga (píxeles altos)'], square: ['Quadratische Pixel', 'Square pixels', 'Pixels carrés', 'Kare pikseller', 'Píxeles cuadrados'],
  commands: ['Befehle', 'Orders', 'Ordres', 'Emirler', 'Órdenes'], noCommands: ['(keine)', '(none)', '(aucun)', '(yok)', '(ninguna)'],
  credit1: ['Spaceward Ho! Amiga Version 2.0 von Stefan Bebbo Franke.', 'Spaceward Ho! Amiga Version 2.0 by Stefan Bebbo Franke.', 'Spaceward Ho! Amiga Version 2.0 par Stefan Bebbo Franke.', 'Spaceward Ho! Amiga Sürüm 2.0, Stefan Bebbo Franke.', 'Spaceward Ho! Amiga Versión 2.0 de Stefan Bebbo Franke.'],
  credit2: ['Grafiken von Howard Vives.', 'Graphics by Howard Vives.', 'Graphismes de Howard Vives.', 'Grafikler: Howard Vives.', 'Gráficos de Howard Vives.'],
  // the menus (the Amiga's Datei, Optionen, Schiffe, Galaxis, Fenster, Info) and their own items
  mFile: ['Datei', 'File', 'Fichier', 'Dosya', 'Archivo'], mOptions: ['Optionen', 'Options', 'Options', 'Seçenekler', 'Opciones'], mShips: ['Schiffe', 'Ships', 'Vaisseaux', 'Gemiler', 'Naves'], mGalaxy: ['Galaxis', 'Galaxy', 'Galaxie', 'Galaksi', 'Galaxia'],
  mWindows: ['Fenster', 'Windows', 'Fenêtres', 'Pencereler', 'Ventanas'], mInfo: ['Info', 'Info', 'Info', 'Bilgi', 'Info'],
  startupWin: ['Startfenster…', 'Startup window…', 'Fenêtre de démarrage…', 'Başlangıç penceresi…', 'Ventana de inicio…'], techWin: ['Technikfenster', 'Technology window', 'Fenêtre Technologie', 'Teknoloji penceresi', 'Ventana de tecnología'],
  newsWin: ['Nachrichtenfenster', 'Messages window', 'Fenêtre des messages', 'Mesaj penceresi', 'Ventana de mensajes'], aboutAm: ['Über Spaceward Ho!', 'About Spaceward Ho! Amiga', 'À propos de Spaceward Ho! Amiga', 'Spaceward Ho! Amiga hakkında', 'Acerca de Spaceward Ho! Amiga'],
  pickFleet: ['Wählen Sie eine Flotte.', 'Select one of your fleets first.', 'Choisissez d’abord une de vos flottes.', 'Önce filolarından birini seç.', 'Elige primero una de tus flotas.'],
  stance: ['Haltung: ', 'Battle stance: ', 'Attitude : ', 'Savaş tutumu: ', 'Actitud: '], one: ['Ein', 'One', 'Un', 'Bir', 'Una'], metalWord: ['Metall', 'metal', 'métal', 'metâl', 'de metal'],
  licence: ['Lizenz:', 'Licence:', 'Licence :', 'Lisans:', 'Licencia:'], noPassword: ['Nicht benutzt: Dieses Remake speichert keine Passwörter.', 'Not used: this remake keeps no passwords.', 'Inutilisé : ce remake ne garde aucun mot de passe.', 'Kullanılmıyor: bu yeniden yapım parola saklamaz.', 'No se usa: este remake no guarda contraseñas.'],
};
// the Amiga's About window (its credits, German), in each language
const ABOUT = [
  ['Spaceward HO! © by NewWorld Computing in 1992-1994', 'Spaceward HO! © by NewWorld Computing in 1992-1994', 'Spaceward HO! © NewWorld Computing 1992-1994', 'Spaceward HO! © NewWorld Computing 1992-1994', 'Spaceward HO! © NewWorld Computing 1992-1994'],
  ['lizensiert durch SOFTGOLD Computerspiele GmbH', 'licensed by SOFTGOLD Computerspiele GmbH', 'sous licence de SOFTGOLD Computerspiele GmbH', 'SOFTGOLD Computerspiele GmbH lisansıyla', 'con licencia de SOFTGOLD Computerspiele GmbH'],
  ['', '', '', '', ''],
  ['AMIGA-Umsetzung von Stefan Bebbo Franke, BebboSoft', 'AMIGA version by Stefan Bebbo Franke, BebboSoft', 'Version AMIGA de Stefan Bebbo Franke, BebboSoft', 'AMIGA sürümü: Stefan Bebbo Franke, BebboSoft', 'Versión para AMIGA de Stefan Bebbo Franke, BebboSoft'],
  ['Vorlage von Joe Williams und Peter Commons', 'Original by Joe Williams and Peter Commons', 'Original de Joe Williams et Peter Commons', 'Özgün oyun: Joe Williams ve Peter Commons', 'Original de Joe Williams y Peter Commons'],
  ['Grafik von Howard Vives', 'Graphics by Howard Vives', 'Graphismes de Howard Vives', 'Grafikler: Howard Vives', 'Gráficos de Howard Vives'],
  ['', '', '', '', ''],
  ['Dank an: Frank, Ilja, Michael, Micky, Olaf und Thomas', 'Thanks to: Frank, Ilja, Michael, Micky, Olaf and Thomas', 'Merci à : Frank, Ilja, Michael, Micky, Olaf et Thomas', 'Teşekkürler: Frank, Ilja, Michael, Micky, Olaf ve Thomas', 'Gracias a: Frank, Ilja, Michael, Micky, Olaf y Thomas'],
];
// the language showing (js/ui-lang.js: the game's, or New Game's, or the
// player's choice on the title screen; none chosen: English, as in every skin)
const LIDX = { de: 0, en: 1, fr: 2, tr: 3, es: 4 };
// (its words in each language are its own: the interface's table leaves them as they are)
if (window.HOUI) for (const l in LIDX) if (l !== 'en') HOUI.own(l, [].concat(...Object.values(WORDS).map(e => [e[LIDX[l]]]), ...ABOUT.map(e => [e[LIDX[l]]])));
const lang = () => (window.HOUI ? HOUI.lang : (game() && game().opts && game().opts.lang) || 'en');
const de = () => lang() === 'de';
const pick = (e) => (e ? (e[LIDX[lang()]] != null ? e[LIDX[lang()]] : e[1]) : '');
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
const className = (t) => (de() ? CLASS_DE[t] : null) || (HO.TYPES[t] ? (window.HOUI ? HOUI.tr(HO.TYPES[t].name) : HO.TYPES[t].name) : t);
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
const celsius = (f) => ((f - 32) * 5 / 9).toFixed(1) + '°C';
const temp = (f) => (['de', 'fr', 'es'].includes(lang()) ? celsius(f) : api().degF(f)); // (°C where the officials and the glossary give it)

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
  const sec = el('section', { id, class: 'am-swin' }, bar, el('div', { class: 'am-sbody' }, body));
  if (gads.size) sizer(sec, gads.size);
  return sec;
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
      kv(w('grav'), (s.g / p.homeG).toFixed(2) + 'G'), kv(w('metal'), num(s.metal)));
    const bars = colonyBars(G, p, s);
    if (bars.some((b, i) => b >= 0 && (i < 2 || bars[0] >= 0 || bars[1] >= 0))) box.append(starChart(G, p, s));
    else box.append(ordersList(G, p, s));
    box.addEventListener('dblclick', () => a.openBuild(sid));
  } else if (k.explored) {
    const own = k.owner >= 0 && G.players[k.owner];
    rows.append(kv(w('owner'), own ? own.name : w('nobody')), kv(w('pop'), own ? (k.pop ? '~' + num(k.pop * 1000) : '?') : w('empty')),
      kv(w('temp'), temp(72 + (k.t - p.homeT))), kv(w('grav'), (k.g / p.homeG).toFixed(2) + 'G'), kv(w('metal'), num(k.metal)));
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
    list.append(el('div', { class: 'am-prow', role: 'button', tabindex: 0, onclick: () => a.openPlayers() }, img(P + icon, 'am-pic'), el('span', null, q.name)));
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
  const win = screenWin('am-tech', w('tech'), { close: () => setTechFront(false), depth: () => setTechFront(false) }, el('div', { class: 'am-techbody' }, levels, tb));
  win.hidden = !front;
  return win;
}

// the left column, laid out on the classic panel's own boxes (T.panel)
function panel(box, parts) {
  const a = api();
  planetBox = parts.planet; budgetEnts = parts.ents;
  const keep = el('div', { class: 'am-keep', 'aria-hidden': 'true' }, parts.info, parts.planet);
  keep.hidden = true;
  const bottom = el('div', { class: 'am-bottom' }, playersBox(), spendBox(parts.budget));
  box.replaceChildren(starPanel(), fleetPanel(), totals(), bottom, techWin(parts.tech), keep);
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
  return HO.say(G, m.text);
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
const btn = (label, fn, cls) => el('button', { type: 'button', class: 'am-btn' + (cls ? ' ' + cls : ''), onclick: fn }, label);
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
      (s.ship || 0) > 0 || !q.length ? null : el('p', { class: 'am-ynote' }, w('noShip')));
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
  const IQ = { dumb: ['Dumm', 'Dumb', 'Stupide', 'Aptal', 'Torpe'], average: ['Normal', 'Normal', 'Moyen', 'Ortalama', 'Normal'], smart: ['Klug', 'Smart', 'Brillant', 'Akıllı', 'Listo'] };
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
    return [s.name, temp(72 + (src.t - p.homeT)), (src.g / p.homeG).toFixed(2) + 'G', num(src.metal), w(['stNobody', 'stEnemy', 'stMine'][grp({ s, k })])];
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
  iq: { sel: 'd_iq', opts: [['dumb', 3030, 'Dumm', 'Dumb', 'Stupide', 'Aptal', 'Torpe'], ['average', 3031, 'Normal', 'Normal', 'Moyen', 'Ortalama', 'Normal'], ['smart', 3032, 'Klug', 'Smart', 'Brillant', 'Akıllı', 'Listo']] },
  size: { sel: 'd_size', opts: [['small', 3040, 'Klein', 'Small', 'Petite', 'Küçük', 'Pequeña'], ['medium', 3041, 'Mittel', 'Medium', 'Moyenne', 'Orta', 'Mediana'], ['large', 3042, 'Groß', 'Large', 'Grande', 'Büyük', 'Grande'], ['xl', 3043, 'Sehr Groß', 'Very large', 'Très grande', 'Çok büyük', 'Muy grande'], ['huge', 3044, 'Riesig', 'Huge', 'Gigantesque', 'Devasa', 'Descomunal']] },
};
// [value, the Amiga's German, English, French, Turkish, Spanish]
const SKILLS = [['novice', 'Neuling', 'Novice', 'Novice', 'Acemi', 'Novato'], ['beginner', 'Anfänger', 'Beginner', 'Débutant', 'Yeni başlayan', 'Principiante'], ['normal', 'Normal', 'Normal', 'Normal', 'Normal', 'Normal'], ['advanced', 'Profi', 'Advanced', 'Avancé', 'Gelişmiş', 'Avanzado'], ['expert', 'Experte', 'Expert', 'Expert', 'Uzman', 'Experto']];
function newGame(f, ctx) {
  const a = api(), win = f.closest('.win');
  if (!win) return;
  win.classList.add('am-win', 'am-wng');
  const titleSpan = win.querySelector('.wtitle span');
  const field = (n) => f.querySelector(`[name="${n}"]`);
  const fire = (n) => n.dispatchEvent(new Event('change', { bubbles: true }));
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
  // the End Turn picture: the German one in a German game
  Object.defineProperty(TH(), 'endTurnPic', { configurable: true, get: () => (de() ? P + 'd5000' : P + 'endturn') });
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
          btn(W('newGame'), () => doc.getElementById('tnew').click()),
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
  for (const ev of ['input', 'keyup', 'keydown', 'pointerup', 'select']) doc.addEventListener(ev, () => { if (inp) requestAnimationFrame(place); }, true);
  doc.addEventListener('selectionchange', () => { if (inp) place(); });
  window.addEventListener('resize', () => { if (inp) place(); });
  doc.addEventListener('scroll', () => { if (inp) place(); }, true);
}

// ---------- the ASL file requester ----------
// Spiel öffnen and Datei → Öffnen (FUN_00108904, FUN_0010840e) ask
// asl.library's file requester (the arp.library one when that is there) for
// the galaxy, its hail string 716 "Name der zu öffnenden Galaxis:" and its
// FileRequester's drawer. ASL draws the window itself: in 2.0 (asl.library
// 37, before locale.library) always in English: the list of the drawer's
// files with its scroller, the Drawer and File fields, and OK, Volumes,
// Parent and Cancel (asl.doc; AROS's filereqhooks.c lays out the same
// gadgets), on the program's screen, in its pens. The page's "files" are
// the game this browser keeps; Volumes stands for the disks (the browser's
// own file picker, to import a saved game).
function openAslLoad() {
  const a = api(), doc = document;
  const save = (() => { try { return localStorage.getItem('ho5.save'); } catch (e) { return null; } })();
  let name = null;
  if (save) { try { const g = HO.load(save); name = String((g.opts && g.opts.galaxy) || 'Galaxis').slice(0, 30); } catch (e) { name = null; } }
  const files = name ? [name] : [];
  const fileIn = el('input', { class: 'am-field am-aslfile', value: '', 'aria-label': 'File' });
  const list = el('div', { class: 'am-asllist', role: 'listbox' }, ...files.map(f => el('div', { class: 'am-aslrow', role: 'option', tabindex: 0,
    onclick: (e) => { for (const r of list.children) r.classList.toggle('sel', r === e.currentTarget); fileIn.value = f; },
    ondblclick: () => { fileIn.value = f; go(); } }, f)));
  const go = () => {
    const f = fileIn.value.trim();
    if (!f) { a.beep(); return; }
    a.closeModal();
    if (name && f === name) { const c = doc.getElementById('tcont'), ts = doc.getElementById('titlescreen'); if (ts && !ts.hidden && c && !c.hidden) c.click(); return; } // (a game being played is that one)
    a.toast(w('aslMissing'));
  };
  const body = el('div', { class: 'am-asl' },
    el('div', { class: 'am-asllistf' }, list, scroller(list, true)),
    el('label', { class: 'am-aslline' }, el('span', null, 'Drawer'), el('input', { class: 'am-field', value: '', 'aria-label': 'Drawer' })),
    el('label', { class: 'am-aslline' }, el('span', null, 'File'), fileIn),
    el('div', { class: 'am-aslbtns' }, btn('OK', go), btn('Volumes', () => { a.closeModal(); doc.getElementById('timport').click(); }), btn('Parent', () => a.beep()), btn('Cancel', () => a.closeModal())));
  const win = amWin(w('aslOpen'), body, 'am-wasl');
  win.querySelector('.wtitle').append(gadget('depth', 'Depth', () => a.closeModal()));
  fileIn.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  return true;
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
const AKEYS = []; // { key, labels (German, English), fn, feat }: the items with an Amiga-key
// the glyph and letter at the right of an item (Intuition's, for COMMSEQ items: FUN_00102d98 sets
// COMMSEQ and the letter for each '~' in the menu table and leaves 32 pixels for them)
function markKeys(root) {
  for (const b of root.querySelectorAll('.dropdown button[role=menuitem]')) {
    if (b.querySelector('.am-akey')) continue;
    const t = b.textContent.trim(), te = enOf(b), k = AKEYS.find(x => x.labels.includes(t) || x.labels.includes(te));
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
  e.preventDefault(); k.fn();
});
const menuWord = (label) => {
  if (typeof label !== 'string' || !de()) return label; // (in another language, the classic page's own words in it)
  const m = MENU_DE[label];
  return m ? m[0] : label.replace(/…/g, '...'); // (HoFont has no "…": the Amiga writes three dots) // (the Amiga-keys are the Amiga's; the remake's keys stay its own)
};
function menus(M, ho) {
  const a = () => api();
  const tr = (items) => items.map(it => (Array.isArray(it) && typeof it[0] === 'string' && it[0] !== '-' ? [() => menuWord(it[0]), ...it.slice(1)] : it));
  const take = (items, labels) => { const out = []; for (let i = items.length - 1; i >= 0; i--) if (labels.includes(items[i][0])) out.unshift(items.splice(i, 1)[0]); return out; };
  const zoom = take(M.View, ['Zoom in', 'Zoom out']);
  const fitG = take(M.View, ['Fit galaxy']);
  const split = [w('split') + '…', () => { const A2 = a(), G = A2.G; if (!G) return; const f = A2.curFleet() || G.fleets.find(x => x.owner === A2.ME && x.star === A2.UI.sel && x.to == null && !x.sat); if (f) openSplitter(f); else A2.toast(w('pickFleet')); }];
  // the Amiga-keys: Intuition draws them, the remake answers them (Alt or the Command key for the right Amiga key)
  AKEYS.length = 0;
  for (const it of [].concat(M.Game || [], M.Ships || [], M.Galaxy || [], M.View || [], zoom)) {
    const m = Array.isArray(it) && typeof it[0] === 'string' ? MENU_DE[it[0]] : null;
    if (m && m[1]) AKEYS.push({ key: m[1], labels: [m[0], it[0]], fn: it[1], feat: it[2] });
  }
  AKEYS.push({ key: 'O', labels: ['Öffnen...', 'Open...'], fn: () => openAslLoad() });
  // Schiffe's "~VVerschrotten" (strings 18, 19: "Verschrotten" / "Nicht verschrotten"), the
  // ruleset's Scrap Current Fleet
  AKEYS.push({ key: 'V', labels: ['Verschrotten', 'Nicht verschrotten', 'Scrap Current Fleet', 'Don\'t Scrap Current Fleet', 'Don’t Scrap Current Fleet'],
    fn: () => { const A2 = a(), f = A2.G && A2.curFleet(); if (f && !A2.G.over) A2.toggleScrapFleet(f); }, feat: () => !!(a().G && a().marksScrap()) });
  const Datei = tr(M.Game); Datei.splice(1, 0, [() => w('open2'), () => openAslLoad()], [() => w('startupWin'), () => { const A2 = a(); if (A2.G) A2.save(); A2.titleScreen(); }]);
  const Optionen = tr(M.View.filter(it => it[0] !== '-'));
  const Schiffe = tr(M.Ships).concat([['-'], split, [() => w('typeMgr').replace('Spaceward Ho! ', '') + '…', () => a().G && openTypes()]]);
  const Galaxis = tr(M.Galaxy).concat([['-'], ...tr(zoom)]);
  const Fenster = [[() => w('techWin'), () => setTechFront(!techFront()), () => !!game(), () => techFront()],
    [() => w('newsWin'), toggleNews, () => !!game(), () => newsOpen()], ['-'], ...fitG,
    [() => w('tall'), () => setPixels(pixMode() === 'tall' ? 'square' : 'tall'), null, () => pixMode() === 'tall']];
  const Info = [[() => w('aboutAm'), openAmigaAbout], ['-'], ...M.Help];
  for (const k of Object.keys(M)) delete M[k];
  // (the menus' names: the classic page builds the bar once, so each is a
  // word kept in step with the language: menuBar below)
  Object.assign(M, { mFile: Datei, mOptions: Optionen, mShips: Schiffe, mGalaxy: Galaxis, mWindows: Fenster, mInfo: Info, commands: CMDS });
  void ho;
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
  endTurnPic: P + 'd5000', // (a getter from page(): the English copy in an English game)
  endTurnKey: 'Amiga+Z',
  select: null, selectSmall: null, // the selection is drawStar's
  mapBg: '#000', bgStars: false,
  mapPixel: () => [PX.x, PX.y],
  mapFont: () => '16px HoFont11, sans-serif',
  planetPx: (s) => [9, 16, 16, 32][zoomIdx(s)],
  drawStar, markerAt, ownRings: true, zoomTo, beforeTurn, afterDraw: syncMapBars, fitView,
  techBars: 'vertical', barGrid: false,
  panel, afterMsg, window: skinWindow, newGame, menus, lookOptions, page, title,
  menuName: (k) => (WORDS[k] ? W(k) : k), // the menus' names (menus above), in the language
  // no You Lost window: the Amiga game's words (texte.pff) have none, only the
  // report "Sie werden aus dem Spiel gelöscht." (624) and Spielervergleich's
  // "Sie haben das Spiel im Jahre %ld verloren!" (741), which the skin has
  youLost: false,
};
if (!window.HOSKINS_INLINE) document.write('<script src="js/skins/dos/ui.js"><\/script>');
})();
