# The Turkish glossary: what each game thing is called, by default and with the patch

The working list for option C (Jake, October 2026; `docs/proofread-2026-10.md`, "Option C,
Turkish") and for the patch's corrections of the official Turkish. Language calls are
Claude's; Jake set the policy:

- **The default is preservation.** The iOS game's Turkish (tr.lproj, the only official
  Turkish) plays as released, and its word for a game thing carries into the remake's own
  Turkish wherever the remake names that thing, mistakes included. iOS often names one thing
  two ways, one on its labels (bars, menus, buttons, class lists, window titles) and another in
  its sentences (reports, hints, alerts). The remake follows the same split: a label takes the
  label word, a sentence takes the sentence word, as an iOS player would have seen in that kind
  of place. Ordinary words are not carried (the remake's own lines spell "gezegen", not
  iOS's "gezeğen").
- **The patch is the best Turkish**, everywhere, iOS's own lines included: one good word for
  each thing, whatever iOS said. It lives in `js/lang-remake.js` `tr.patch` / `tr.patchWords`
  (the game's lines) and in each interface row's seventh element `{ tr: … }` (`js/ui-text.js`,
  `js/ui-text-help.js`, `js/ui-text-notes-tr.js`). A word the official text gets right needs no
  patch.

Sources: Misc Strings (MS), Ship Class Names (SCN), sprintf Templates (ST), Report Window
Templates (R), Help Messages (H), Alert Strings (A), all `HOLANG.ios.tr`.

## Ship classes

| English | Default on a label | Default in a sentence | The patch | Why |
|---|---|---|---|---|
| Scout(s) | İzci, İzciler (SCN 0, 7) | öncü gemi (H 15, A 35) | Keşif Gemisi, Keşif Gemileri; keşif gemisi | "İzci" is a boy scout; "öncü" a vanguard |
| Dreadnought(s) | Aba, Abalar (SCN 1, 8) | aba (no sentence of iOS's) | Dretnot, Dretnotlar | "aba" is a felt cloak |
| Fighter(s) | Savaş, Savaşcılar (SCN 2, 9) | savaşcı (H 30) | Savaşçı, Savaşçılar | "savaş" is war; "savaşcı" is ç written c |
| Tanker(s) | Tanker, Tankerler | tanker (R 152) | – | |
| Colony Ship(s) | Koloni Gemisi, Koloni Gemileri | koloni gemisi (R 154) | – | (iOS's hints also say "yerleşme gemisi") |
| Satellite(s) | Uydu, Uydular | uydu | – | |
| Biological(s) | Biyolojik, Bioljik (SCN 6, 13) | biyolojik (R 27) | Biyolojik, Biyolojikler | the plural label's typo |
| Decoy(s) | Tuzak (MS 1), Tuzaklar | kandırıcı gemi (R 111) | Sahte Gemi, Sahte Gemiler; sahte gemi | "tuzak" is a trap |

## Technologies and spending

| English | Default on a label | Default in a sentence | The patch | Why |
|---|---|---|---|---|
| Range | Dizi (MS 3) | menzil (H 15, R 156) | Menzil | "dizi" is a series; iOS's reports also say "çeşitlilik", "uzaklık", "hedef" |
| Speed | Hız | hız | – | |
| Weapons | Silâhlar (MS 5) | silah / silâh | – | both spellings are correct |
| Shields | Kalkanları (MS 6, the accusative) | zırh (R 6, 145; H 15-17) | Kalkanlar; kalkan | "zırh" is armour |
| Mini, Miniaturization | Mini | minyatürleme (R 7, 146) | minyatürleştirme | the standard form |
| Radical | Radikal (MS 8) | Radikal (R 126); Radical Research and its researchers "köklü" (MS 107, R 8) | Radikal | one name |
| Savings | Birikim (MS 9) | tasarruf (H 27-28; R 122, 125, 127) | birikim | one name, the bar's |
| Ship Savings (4.0.5) | the remake's: Gemi Tasarrufu | gemi tasarrufu | – | no official word |
| Tech | Teknoloji | teknoloji | – | |

## Battle stances and the battle review

| English | Default on a label | Default in a sentence | The patch | Why |
|---|---|---|---|---|
| Attitude, battle stance | Yükseklik (MS 164) | yükseklik | Tutum; tutum | "yükseklik" is altitude |
| Friendly | Dostca (MS 124) | – | Dostça | ç written c |
| Aggressive | Saldırgan | – | – | |
| No Defense | Savunma yok | – | – | |
| Dig In | Buyur istediğini al (MS 127) | – | Siper al | "help yourself, take what you want" |
| Defensive | Sovunucu (MS 169) | – | Savunucu | a typo |
| Normal | !Normal (MS 170) | – | Normal | the "!" as released |
| Battles (the review) | Muhabereler (MS 197) | muhabere (MS 55-58; A 16, 17, 28) | Muharebe(ler) | "muhabere" is correspondence; a battle is "muharebe" |
| Battle review speed | Muhabere hızını gözden geçir (MS 97) | muhabere hızı | Muharebe / Savaş hızı | as above |
| Review Battles | Muhabereleri terar gözden geçir (MS 87) | – | Muharebeleri Gözden Geçir | "terar" for "tekrar" |
| Review | Gözden geçir incele (MS 190) | – | Gözden geçir | two verbs |
| A battle (in a report) | – | savaş (R 36, 37, 71, 72, 99) | – | |

## Screens, menus and features

| English | Default on a label | Default in a sentence | The patch | Why |
|---|---|---|---|---|
| New Game | Yeni Oyn (MS 70) | Yeni Oyn (naming the window) | Yeni Oyun | a typo |
| Saved Games | Oyunlar Kaydet (MS 142) | Oyunlar Kaydet (naming the screen); a saved game: kayıtlı oyun | Kayıtlı Oyunlar | "save games" |
| Organize Fleets | Filoarı Hazırla (MS 112) | Organize gemileri (H 34, 35) | Filoları Düzenle | a typo; "hazırla" is prepare |
| Organize Ships (1.2 to 3.0.1) | the remake's: Gemileri Hazırla | – | Gemileri Düzenle | as Organize Fleets |
| List All Fleets | Filoarın Listesini Yap (MS 113) | – | Tüm Filoları Listele | |
| Evacuate (Planet) | Gezegeni Tahliye Et (MS 19); the menu Uyduyu Boşalt (MS 111) | boşaltmak (ST 17, 35; R 9, 29) | Tahliye Et; the menu Gezegeni Tahliye Et | the menu says "empty the satellite" |
| Scrap | Çöp (MS 165); Scrap Ship Types: Çöpe Atılacak Gemiler (MS 114) | hurdaya çıkarmak (R 132, 138) | Hurdaya Çıkar | |
| Select the ship types to scrap | Çürük gemileri seç (MS 106) | – | the remake's sentence | "the rotten ships" |
| Dismantle (fleet) | Filoyu Parçala (MS 15) | parçalamak | – | |
| Dip Into Savings | Birikimden Harca (MS 78); the menu Tasarruftan Harca (MS 116) | – | Birikimden Harca | one name |
| Armageddon | the menu Armageddon (en büyük savaş) (MS 102, 117) | the device: mahşer günü aleti (R 133-137) | Armageddon | the menu's gloss |
| Auto Play | Otomatik Oyna (MS 118) | Otomatik Oyna | – | |
| Computer Play For Me | Computer Benim İçin Oyna (MS 133) | – | Bilgisayar Benim İçin Oynasın | "Computer" left in English |
| Just End My Turns | Beni Sıramı Bitir (MS 134) | – | Sadece Sıramı Bitir | "me" for "just" |
| Play One Turn | Bir Kere Oyna (MS 119) | – | Bir Sıra Oyna | (chunk 2) |
| End Turn | Sıran Bitti (MS 137) | – | Sırayı Bitir | a statement on a button (chunk 2) |
| Main Menu | Esas Program (MS 120) | – | Ana Menü | (chunk 2) |
| Master Points | Usta derece (ST 24) | usta derece | usta puanı | "derece" is a rank |
| Rank | Derece (ST 23) | derece | – | |
| Density (galaxy) | Öz ağırlık (MS 152) | öz ağırlık | Yoğunluk | specific gravity |
| Home System | Asıl Sistem (MS 145) | asıl sistem | Ana Sistem | |
| Hints (the preference) | Oyuna yardımci kısa bilgiler ver (MS 89) | – | Yardımcı ipuçları ver | ı written i |
| Female | Bayan (MS 194) | – | Kadın | "Ms." |
| All (messages) | Müttefik (MS 189) | – | Hepsi | "All" read as "Ally" |
| Tell You About Stars Best Buddies Explore | En iyi ortakların inceledikleri yıldızları söyle (MS 91) | – | En İyi Arkadaşlarının Keşfettiği Yıldızları Söyle | |

## Alliances

| English | Default on a label | Default in a sentence | The patch | Why |
|---|---|---|---|---|
| Ally, allies, alliance | Müttefik, Müttefikler (MS 180-183) | ortak, ortaklık (R 77, 87-98; H 39) | müttefik, ittifak | "ortak" is a partner |
| Best buddy | En İyi Arkadaşlar (MS 149) | en iyi oyun arkadaşı (R 93-98) | en iyi arkadaş | |

## Added by chunk 3 (labels the tables above didn't list)

| English | Default (iOS) | The patch | Why |
|---|---|---|---|
| Metal | Metâl (MS 13, 23, 61, 64, 75; the remake's labels carry it) | Metal; in sentences metal, metali | not a Turkish spelling (the l is palatal: "metali", not iOS's "metalı") |
| Temp | Isı (MS 14) | Sıcaklık | "ısı" is heat; iOS's own reports say "Sıcaklık" |
| Gravity | Yerçekimi (MS 12, 46) | Yer çekimi | the spelling rules' form; iOS's reports write it so |
| Group | Gurup (MS 166) | Grup | a misspelling |
| Allow Debt | Borçlan (MS 158) | Borca İzin Ver | "go into debt" |
| Off / On | Kapat / Aç (MS 104, 105) | Kapalı / Açık | commands ("close", "open") for a switch's state |
| Continue | Devam Etmek (MS 71) | Devam Et | the infinitive on a button |
| Send Feedback | İzlenimini Gönder (MS 121) | Geri bildirim gönder | "send your impression" |
| Round (battle) | Round (ST 13), Sefer (ST 29) | Tur | English left in |
| Radical Research | Köklü Araştır(ma) (MS 107) | Radikal Araştırma | one name, Radikal |
| Scrap Ship Types | Çöpe Atılacak Gemiler (MS 114) | Gemi Tiplerini Hurdaya Çıkar | "ships to throw in the bin" |
| Scrapped | çöpe atılmış (MS 201) | hurdaya çıkarıldı | as above |
| Selected Ship: Delayed Arrival | Gemi Seç: Geliş Geçikti (MS 163) | Seçili Gemi: Gecikmeli Varış | "select ship"; a typo |
| Turn Off When Something Interesting Happens | İlginç Bir Şey Olursa, Kapat (MS 136) | İlginç Bir Şey Olursa Durdur | "close" |
| Spending bars | şeritler (H 2, 41) | çubuklar | "ribbons, lanes" |
| Planet (in hints) | uydu (H 20-24; R 117, 118), planet (R 50, 83, 128) | gezegen | "uydu" is a satellite |
| Explore | incele (R 33, 34; MS 91) | keşfet | "examine"; iOS's label says "Keşfedilmemiş" |
| Wormhole | sıcak delik (R 21) | solucan deliği | "hot hole" |
| Whew! | Vay anasını! (A 4, R 137) | Oh be! | "Wow!" for a sigh of relief |
| per turn | her seferinde (A 5, H 19) | her sırada | "each time" |

## The tech names (the patch's, `tr.patchLists`)

iOS's names are kept where they are good Turkish; the patch rewrites the ones that are wrong:
"Zırh Odası" (Armored Hull: an armoured *room*) → Zırhlı Gövde; "Göz Önünde Quark Işık Demeti"
(Focused: "in view") → Odaklanmış Kuark Işını; "Fuzyonu Durdurma Devresi" (a drive is a motor,
not a circuit: every "Devre" of the Speed list) → Füzyon Boşaltma Motoru; "Singulariti" →
Tekillik; "Kuramsal Zerre" (Quark: "theoretical particle") → Kuark, and Quark spelled "Kuark"
throughout; "Ortaölçek" (Nanoscopic) → Nanoskopik; "Sarı Noktalı Bikini" → Sarı Puantiyeli
Bikini (the song's Turkish title); Hawking Trans-Hyper Drive, which iOS gives the same name as
Hawking Propulsion System, its own. The full list is `js/lang-remake.js` `tr.patchLists`.

## Case endings (the patch only)

iOS glues one fixed ending to a name ("%sye", "%sde", "%syi"), right for few names: the
default keeps it, as released. The patch's lines write the ending as a token after the filling,
`%s’{e}` (dative), `{de}`, `{den}`, `{deki}`, `{i}`, `{in}`, `{le}`, and `js/engine.js`
`trSuffixes` fits it to the word by vowel and consonant harmony ("Argot’a", "Leo’ya",
"Sirius’tan", "Kansas’ta"; a number as it is read, "3’ü", "10’a"; an English name's final
-y as "i", "Nancy’den"). `{^}` capitalises the letter after it (a line that opens with "bir …").

## Where things stand

- Chunk 1 (Concordance): option C, iOS's words in the remake's own Turkish.
- Chunk 3 (Cedilla): the patch for iOS's Turkish itself, every list: 290 lines (`tr.patch`), the
  name lists (`tr.patchLists`), 80 interface rows' patch elements; the record has the details.
- Chunk 4 (Breve): Turkish for Mac 1.2, DOS 2.0 and Mac 2.0.1, in this glossary's default words (iOS's
  lines where iOS has 2.0's English, else adapted, else the remake's own, endings glued as iOS glues
  them), each new line with its patch entry (`tr.patch`, "Mac 1.2's, DOS 2.0's and Mac 2.0.1's lines").
  New words: "gemi yapımı" (shipbuilding, iOS H 27), "hiperuzay" (hyperspace), "bir meteor yağmuru",
  "hücum" (attack, iOS R 38; the patch's "saldırı"), Abandon in Fix Spending "terk etmek" (the patch's
  "tahliye etmek", Evacuate's word).
