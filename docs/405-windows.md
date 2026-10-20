# Spaceward Ho! 4.0.5: windows, strings and menus

The window layouts and words of Spaceward Ho! 4.0.5: the Mac's resource fork (`Spaceward Ho!
4.0.5.fork`: Toolbox `DLOG`/`DITL`/`ALRT`, `CNTL` with the scroll bars' ranges, `STR#`,
`MENU`), written by `tools/extract/ppob.py`, and, at the end, the Windows 95 `SPACEHO.EXE`'s
dialogs, menu and the MFC dialog data (`RT_DLGINIT`, the combo boxes' items), written by
`tools/extract/windlg.py`. Windows dialog frames are in dialog units. Windows' scroll bar
ranges are set by its code (`SetScrollRange`), not its dialogs. What was read from these
before, and what is new, is in `docs/source-inventory.md`.

Written by `tools/extract/ppob.py`. Frames are (left, top, width x height) in the parent pane; each pane's sub-panes are listed top to bottom, then left to right (the stream's own order is in the JSON); "Txtr n" is a text style (the table at the end).

Resource types: ALRT 39, BNDL 1, CDEF 3, CNTL 22, CODE 27, CURS 8, DATA 1, DITL 90, DLOG 50, FREF 6, ICN# 158, LDEF 3, MBAR 1, MENU 12, MaTh 3, PICT 169, RGN  1, Reqd 1, SH4∆ 1, SIZE 3, STR# 42, Stup 1, TMPL 2, WDEF 3, acur 1, cfrg 1, dctb 3, icl8 5, ics# 92, snd  37, vers 2.

## Toolbox dialogs (DLOG, ALRT, DITL)

- DLOG 500 "Computer Params": title "", 616 x 439, DITL 500
- DLOG 501 "Terraform Test": title "", 294 x 225, DITL 501
- DLOG 502 "Battle Simulation": title "", 498 x 358, DITL 502
- DLOG 1100 "About Box Dialog": title "", 304 x 310, DITL 1100
- DLOG 1101 "BW About Box Dialog": title "", 304 x 310, DITL 1101
- DLOG 1150 "About Box Dialog": title "", 483 x 197, DITL 1150
- DLOG 1151 "BW About Box Dialog": title "", 484 x 219, DITL 1151
- DLOG 1200 "Startup Dialog": title "", 304 x 288, DITL 1200
- DLOG 1201 "Startup Dialog": title "", 304 x 285, DITL 1201
- DLOG 4000 "Player Password Entry": title "", 201 x 197, DITL 4000
- DLOG 4010 "New Player Dialog": title "", 360 x 223, DITL 4010
- DLOG 4020 "Auto Play Dialog": title "", 409 x 231, DITL 4020
- DLOG 4021 "Config Auto Play Dialog": title "", 345 x 162, DITL 4021
- DLOG 4030 "Licensee": title "", 384 x 212, DITL 4030
- DLOG 4040 "Print Options": title "", 317 x 220, DITL 4040
- DLOG 4050 "Name A Star": title "", 281 x 217, DITL 4050
- DLOG 4060 "Join Fleets": title "", 334 x 239, DITL 4060
- DLOG 4070 "Dip Into Savings": title "", 226 x 178, DITL 4070
- DLOG 4080 "Hall Of Fame": title "", 344 x 247, DITL 4080
- DLOG 4090 "Hall of Shame": title "", 344 x 247, DITL 4090
- DLOG 4100 "Details (Fame)": title "", 410 x 272, DITL 4100
- DLOG 4110 "Details (Shame)": title "", 420 x 265, DITL 4110
- DLOG 4130 "Terraform Planet Dialog": title "", 396 x 204, DITL 4130
- DLOG 5040 "You Won": title "", 226 x 262, DITL 5040
- DLOG 5041 "You Won": title "", 226 x 262, DITL 5041
- DLOG 5050 "You Lose Color": title "", 226 x 262, DITL 5050
- DLOG 5051 "You Lose": title "", 226 x 262, DITL 5051
- DLOG 6000 "Build/List Ship Types": title "", 500 x 318, DITL 6000
- DLOG 6030 "List Fleets": title "", 486 x 296, DITL 6030
- DLOG 6040 "List Explored Stars": title "", 424 x 303, DITL 6040
- DLOG 6050 "Compare Players": title "", 478 x 292, DITL 6050
- DLOG 6055 "Graph": title "", 531 x 303, DITL 6055
- DLOG 6056 "Graph": title "", 514 x 306, DITL 6056
- DLOG 6060 "Organize Fleets": title "", 487 x 284, DITL 6060
- DLOG 6070 "Send Message": title "", 408 x 315, DITL 6070
- DLOG 6080 "Create New Galaxy": title "", 437 x 305, DITL 6080
- DLOG 6100 "List Player Skills": title "", 377 x 294, DITL 6100
- DLOG 6110 "Alliances": title "", 472 x 302, DITL 6110
- DLOG 6120 "Send Money/Metal": title "", 463 x 214, DITL 6120
- DLOG 6130 "Surrender": title "", 357 x 211, DITL 6130
- DLOG 6140 "Std Alert BW": title "", 240 x 200, DITL 6140
- DLOG 6141 "Std Alert Color ID": title "", 240 x 200, DITL 6141
- DLOG 6150 "Preferences": title "", 482 x 297, DITL 6150
- DLOG 6160 "Statistics": title "", 359 x 236, DITL 6160
- DLOG 6170 "Radical Choice": title "", 439 x 232, DITL 6170
- DLOG 6180 "Master Points": title "", 451 x 220, DITL 6180
- DLOG 7000 "Status Dialog": title "", 237 x 67, DITL 7000
- DLOG 7005 "Waiting For Next Turn": title "", 323 x 91, DITL 7005
- DLOG 7010 "Battle Dialog": title "", 445 x 310, DITL 7010
- DLOG 7011 "Battle Dialog: Color": title "", 445 x 300, DITL 7011
- ALRT 128 "System Requirements": DITL 128
- ALRT 2000 "Disabled Copy": DITL 2000
- ALRT 2010 "No Color QD no color": DITL 2010
- ALRT 3000 "File Error": DITL 3000
- ALRT 3020 "Hope": DITL 3020
- ALRT 3030 "Ship": DITL 3030
- ALRT 3080 "Takeover?": DITL 3080
- ALRT 3090 "Rebellion": DITL 3090
- ALRT 3100 "Money for Metal": DITL 3100
- ALRT 3110 "Additional Metal": DITL 3110
- ALRT 3120 "Fleet Disappeard": DITL 3120
- ALRT 3130 "Nova": DITL 3130
- ALRT 3140 "Terraforming Tech": DITL 3140
- ALRT 3150 "Forfeit": DITL 3150
- ALRT 3160 "Destoyed Star System": DITL 3170
- ALRT 3170 "Stolen Technology": DITL 3160
- ALRT 3180 "Play a Game": DITL 3180
- ALRT 3240 "Armageddon": DITL 3240
- ALRT 3241 "Armageddon": DITL 3241
- ALRT 3242 "Armageddon": DITL 3242
- ALRT 3243 "Armageddon": DITL 3243
- ALRT 3244 "Armageddon": DITL 3244
- ALRT 3250 "Armageddon": DITL 3250
- ALRT 3251 "Armageddon": DITL 3251
- ALRT 3252 "Armageddon": DITL 3252
- ALRT 3253 "Armageddon": DITL 3253
- ALRT 3254 "Armageddon": DITL 3254
- ALRT 3255 "Armageddon": DITL 3255
- ALRT 3260 "Not All in next year": DITL 3260
- ALRT 3280 "Too Many Ship Types": DITL 3280
- ALRT 3330 "Fleet Can’t Reach": DITL 3330
- ALRT 3380 "Really Surrender to nobody": DITL 3380
- ALRT 3390 "Really Surrender": DITL 3390
- ALRT 3410 "Abandon Profitable": DITL 3410
- ALRT 3420 "Abandon Almost Profitable": DITL 3420
- ALRT 3430 "No alive computers": DITL 3430
- ALRT 5000 "Save Before Closing": DITL 5000
- ALRT 5010 "Neutral (basic) Alert": DITL 5010
- ALRT 5030 "Debug Alert": DITL 5030

DITL 128 "":
  - button (312, 123, 90 x 20) "OK"
  - static text (84, 13, 322 x 32) "Sorry ^0 requires the follow things to be able to run:"
  - static text (110, 58, 270 x 16) "• ^1 CPU or better"
  - static text (110, 74, 270 x 16) "• System Software ^2 or later"
  - static text (110, 90, 270 x 16) "• ^3"

DITL 500 "":
  - button (531, 307, 58 x 20) "OK"
  - edit text (312, 35, 75 x 16) "Edit Text"
  - edit text (312, 87, 75 x 16) "Edit Text"
  - edit text (312, 113, 75 x 16) "Edit Text"
  - edit text (312, 139, 75 x 16) "Edit Text"
  - edit text (312, 178, 75 x 16) "Edit Text"
  - edit text (260, 230, 28 x 16) "999"
  - edit text (299, 230, 28 x 16) "999"
  - edit text (338, 230, 28 x 16) "999"
  - edit text (377, 230, 28 x 16) "999"
  - edit text (416, 230, 28 x 16) "999"
  - edit text (312, 204, 75 x 16) "Edit Text"
  - edit text (312, 256, 75 x 16) "Edit Text"
  - edit text (312, 282, 75 x 16) "Edit Text"
  - edit text (312, 308, 75 x 16) "Edit Text"
  - edit text (312, 334, 75 x 16) "Edit Text"
  - edit text (102, 361, 61 x 16) "Edit Text"
  - edit text (330, 359, 64 x 16) "Edit Text"
  - edit text (401, 359, 59 x 16) "Edit Text"
  - edit text (468, 359, 62 x 16) "Edit Text"
  - edit text (538, 359, 63 x 16) "Edit Text"
  - edit text (124, 386, 75 x 16) "Edit Text"
  - edit text (218, 386, 75 x 16) "Edit Text"
  - edit text (304, 386, 75 x 16) "Edit Text"
  - edit text (393, 386, 75 x 16) "Edit Text"
  - edit text (123, 413, 75 x 16) "Edit Text"
  - edit text (217, 413, 75 x 16) "Edit Text"
  - edit text (304, 412, 75 x 16) "Edit Text"
  - edit text (393, 413, 75 x 16) "Edit Text"
  - edit text (449, 34, 75 x 16) "Edit Text"
  - static text (13, 13, 260 x 16) "Set Computer/Auto-Play Attributes:"
  - static text (13, 35, 204 x 17) "Up Front Tech Percent (0-100)"
  - static text (13, 87, 197 x 17) "Income Per Colony"
  - static text (13, 113, 214 x 16) "Defending Domination Percent"
  - static text (13, 139, 268 x 17) "% cols defended"
  - static text (13, 204, 200 x 16) "(attacking) Domination Percentage"
  - static text (13, 230, 238 x 18) "Tech Spending (should add to 1000)"
  - static text (13, 256, 199 x 18) "Aggressiveness (0 to 10)"
  - static text (13, 282, 270 x 16) "Attack Style (1 reg., 2. sat., 3 pounce)"
  - static text (13, 308, 285 x 17) "Desire for Metal (0 to 100) - may change"
  - static text (13, 334, 273 x 17) "Savings (# * totalMoney = desired s.)"
  - static text (12, 168, 287 x 32) "% of Metal for Def (will change for all but def. player)"
  - static text (13, 360, 84 x 16) "Friendliness"
  - static text (170, 361, 130 x 16) "Friends( pl 1-4):"
  - static text (17, 386, 90 x 16) "Scrap Obs."
  - static text (17, 413, 99 x 16) "New Type Obs."
  - static text (412, 12, 155 x 17) "Min Attack Fleet Size:"

DITL 501 "":
  - button (216, 176, 58 x 20) "OK"
  - edit text (200, 24, 75 x 16) "Edit Text"
  - edit text (200, 48, 75 x 16) "Edit Text"
  - edit text (200, 72, 75 x 16) "Edit Text"
  - static text (200, 96, 75 x 16) "Static Text"
  - static text (200, 120, 75 x 16) "Static Text"
  - static text (200, 144, 75 x 16) "Static Text"
  - static text (16, 24, 118 x 17) "Gravity * 100:"
  - static text (16, 48, 126 x 16) "Temperature * 10:"
  - static text (16, 72, 108 x 17) "$ Per Turn"
  - static text (16, 96, 162 x 17) "# Turns To Break Even:"
  - static text (16, 120, 166 x 16) "Done Terraforming Turn:"
  - static text (16, 144, 168 x 18) "Positive Income Turn:"

DITL 502 "":
  - button (332, 316, 58 x 20) "Done"
  - button (264, 316, 58 x 20) "Review"
  - edit text (120, 52, 75 x 16) "1"
  - edit text (120, 76, 75 x 16) "6"
  - edit text (120, 100, 75 x 16) "2"
  - edit text (120, 124, 75 x 16) "1"
  - edit text (120, 148, 75 x 16) "1"
  - edit text (120, 176, 75 x 16) "1"
  - edit text (280, 52, 75 x 16) "1"
  - edit text (280, 76, 75 x 16) "6"
  - edit text (280, 100, 75 x 16) "2"
  - edit text (280, 124, 75 x 16) "1"
  - edit text (280, 148, 75 x 16) "1"
  - edit text (280, 176, 75 x 16) "1"
  - edit text (240, 216, 75 x 16) "0"
  - edit text (240, 240, 75 x 16) "2"
  - edit text (240, 264, 75 x 16) "2"
  - edit text (116, 288, 75 x 16) "3"
  - edit text (240, 288, 75 x 16) "3"
  - static text (12, 52, 75 x 16) "Number"
  - static text (12, 76, 75 x 16) "Range"
  - static text (12, 100, 75 x 16) "Speed"
  - static text (12, 124, 75 x 16) "Weapons"
  - static text (12, 148, 75 x 16) "Shields"
  - static text (116, 28, 75 x 16) "Player 1"
  - static text (276, 28, 75 x 16) "Player 2"
  - static text (12, 212, 75 x 16) "Population"
  - static text (12, 236, 75 x 16) "Pop Wpns"
  - static text (12, 260, 75 x 16) "Pop Shds"
  - static text (12, 288, 75 x 16) "Die Roll"
  - static text (12, 176, 83 x 16) "Type (0-5)"

DITL 1100 "":
  - picture (0, 0, 304 x 200) id 1002
  - picture (0, 264, 384 x 46) id 4010
  - picture (0, 200, 261 x 64) id 1001
  - picture (236, 208, 69 x 42) id 7080

DITL 1101 "":
  - picture (0, 0, 304 x 200) id 1003
  - picture (0, 264, 384 x 46) id 4010
  - picture (0, 200, 261 x 64) id 1001
  - picture (236, 208, 69 x 42) id 7081

DITL 1150 "":
  - static text (8, 8, 471 x 34) "Peter & Joe would like to take the opportunity to thank everyone who has helped make Spaceward Ho! the really cool game it is today…"
  - picture (396, 48, 74 x 74) id 3520
  - static text (8, 48, 83 x 82) "Ed Logg\rJack Robson\rEd Rotberg\rEric Snider\rKon & Bal"
  - static text (104, 48, 191 x 67) "The Amazing Timmer\rDennis, Tim, & the DTS Gang\rMike, Ben, Dan, Rob & Clint"
  - static text (8, 140, 409 x 17) "And thanks to everyone on comp.sys.mac.games and AOL,"
  - static text (8, 156, 333 x 16) "Everyone who called us up or sent us a letter,"
  - static text (8, 172, 404 x 16) "And everyone else who made comments and suggestions."

DITL 1151 "":
  - static text (8, 8, 471 x 34) "Peter & Joe would like to take the opportunity to thank everyone who has helped make Spaceward Ho! the really cool game it is today…"
  - picture (396, 48, 74 x 74) id 3020
  - static text (8, 48, 83 x 82) "Ed Logg\rJack Robson\rEd Rotberg\rEric Snider\rKon & Bal"
  - static text (104, 48, 191 x 67) "The Amazing Timmer\rDennis, Tim, & the DTS Gang\rMike, Ben, Dan, Rob & Clint"
  - static text (8, 140, 409 x 17) "And thanks to everyone on comp.sys.mac.games and AOL,"
  - static text (8, 156, 333 x 16) "Everyone who called us up or sent us a letter,"
  - static text (8, 172, 404 x 16) "And everyone else who made comments and suggestions."

DITL 1200 "":
  - button (11, 254, 75 x 20) "Open Game"
  - button (115, 254, 75 x 20) "New Game"
  - button (210, 254, 75 x 20) "Quit"
  - user item (7, 250, 83 x 28)
  - picture (0, 0, 304 x 200) id 1002
  - picture (0, 200, 384 x 46) id 4010

DITL 1201 "":
  - button (10, 254, 75 x 20) "Open Game"
  - button (114, 254, 75 x 20) "New Game"
  - button (211, 254, 75 x 20) "Quit"
  - user item (6, 250, 83 x 28)
  - picture (0, 0, 304 x 200) id 1003
  - picture (-1, 200, 384 x 46) id 4010

DITL 1500 "":
  - static text (13, 12, 274 x 46) "Save “^0” before quitting?"
  - button (26, 78, 58 x 20) "Cancel"
  - button (117, 78, 58 x 20) "No"
  - button (208, 78, 58 x 20) "Yes"

DITL 2000 "":
  - button (91, 143, 129 x 20) "Return To Finder"
  - static text (12, 8, 208 x 102) "Sorry, but this is a development version of Spaceward Ho! 4.0 that’s past its prime. To get a newer copy, call Delta Tao Software, Inc. at (408) 730-9336."

DITL 2010 "":
  - button (156, 169, 97 x 20) "Play in B/W"
  - picture (26, 117, 74 x 74) id 3010
  - static text (13, 13, 266 x 35) "Sorry, but Spaceward Ho! 2.0 requires 32-bit Color Quickdraw to run in color."
  - static text (13, 52, 265 x 54) "You can obtain Color Quickdraw from any Apple dealer for a nominal charge."

DITL 3000 "":
  - button (308, 176, 58 x 20) "OK"
  - static text (64, 32, 302 x 32) "^0"
  - static text (64, 80, 304 x 18) "File Name: ^1"
  - static text (64, 104, 302 x 31) "Error Type: ^2"
  - static text (64, 140, 238 x 16) "Secret Error Code: ^3"
  - static text (64, 12, 215 x 16) "An Error Has Occurred:"
  - icon (16, 12, 32 x 32) id 1

DITL 3020 "":
  - button (168, 108, 58 x 20) "OK"
  - button (92, 108, 58 x 20) "Cancel"
  - static text (8, 16, 214 x 39) "Dost thou truly wish to abandon Hope? All is not yet lost!"
  - picture (8, 60, 74 x 74) id 3020

DITL 3030 "":
  - button (180, 132, 76 x 20) "Jump Ship"
  - button (92, 132, 76 x 20) "Don’t Jump"
  - static text (8, 16, 225 x 50) "Abandon Ship? Abandon Ship!\rAll hands abandon ship!\rWomen and children first!"
  - picture (8, 80, 74 x 74) id 3020

DITL 3080 "":
  - button (116, 60, 79 x 20) "No, thanks."
  - button (216, 60, 58 x 20) "OK"
  - static text (12, 8, 280 x 38) "The game has already started. Would you like to take over for a computer player?"

DITL 3090 "":
  - static text (14, 10, 209 x 64) "^0’s Star System “^1” has had a revolution, and is now under your control."
  - button (157, 100, 58 x 20) "OK"

DITL 3100 "":
  - static text (14, 10, 209 x 64) "^0 has offerred ^1 units of metal for ^2 dollars."
  - button (157, 100, 58 x 20) "OK"

DITL 3110 "":
  - static text (14, 10, 209 x 64) "You have found an additional ^0 units of metal on ^0."
  - button (157, 100, 58 x 20) "OK"

DITL 3120 "":
  - static text (14, 10, 209 x 64) "Your fleet of ^0 ^1 unexpectedly disappeared in hyperspace on their way to ^2."
  - button (157, 100, 58 x 20) "OK"

DITL 3130 "":
  - static text (14, 10, 209 x 64) "^0 has gone nova.  Everything there has been destroyed."
  - button (157, 100, 58 x 20) "OK"

DITL 3140 "":
  - static text (14, 10, 209 x 64) "Your Terraforming Technology has reached level ^0."
  - button (157, 100, 58 x 20) "OK"

DITL 3150 "":
  - static text (14, 10, 209 x 64) "^0 has turned all his planets over to your control.  "
  - button (157, 100, 58 x 20) "OK"

DITL 3160 "":
  - static text (14, 10, 209 x 64) "You have stolen ^0 Technology from ^1.  Your Tech level is now ^2."
  - button (157, 100, 58 x 20) "OK"

DITL 3170 "":
  - static text (14, 10, 209 x 64) "You have destroyed the Star System ^0, previously owned by ^1."
  - button (157, 100, 58 x 20) "OK"

DITL 3180 "":
  - button (172, 96, 58 x 20) "Yes"
  - static text (8, 16, 222 x 71) ">Greetings, Professor Falkein.\r\r>Would you like to play a game\r of Galaxial Thermonuclear War?"

DITL 3240 "":
  - button (212, 160, 58 x 20) "OK"
  - button (140, 160, 58 x 20) "Cancel"
  - static text (12, 16, 261 x 56) "Do you really want to launch the armageddon device? It’ll blow up half of the galaxy!"
  - picture (16, 112, 74 x 74) id 3020

DITL 3241 "":
  - button (212, 160, 58 x 20) "OK"
  - button (140, 160, 58 x 20) "Cancel"
  - static text (12, 16, 261 x 56) "Do you really want to launch the armageddon device? Isn’t life too short as it is?"
  - picture (16, 112, 74 x 74) id 3020

DITL 3242 "":
  - button (212, 160, 58 x 20) "OK"
  - button (140, 160, 58 x 20) "Cancel"
  - static text (12, 16, 263 x 71) "Do you really want to launch the armageddon device? I mean, you’d probably win anyway; why take the chance?"
  - picture (16, 112, 74 x 74) id 3020

DITL 3243 "":
  - button (212, 160, 58 x 20) "OK"
  - button (140, 160, 58 x 20) "Cancel"
  - static text (12, 16, 261 x 56) "Do you really want to launch the armageddon device? Doing so decreases the difficulty score by half!"
  - picture (16, 112, 74 x 74) id 3020

DITL 3244 "":
  - button (212, 160, 58 x 20) "OK"
  - button (140, 160, 58 x 20) "Cancel"
  - static text (12, 16, 261 x 56) "Do you really want to launch the armageddon device? Odds are you’ll blow yourself up!"
  - picture (16, 112, 74 x 74) id 3020

DITL 3250 "":
  - button (188, 160, 94 x 20) "Party Pooper"
  - button (100, 160, 76 x 20) "Abort"
  - static text (12, 16, 261 x 56) "Are you just doing this because you think you’ll win but it’s really late and so you want to go to bed?"
  - picture (16, 112, 74 x 74) id 3020

DITL 3251 "":
  - button (180, 160, 95 x 20) "Not Unsure?"
  - button (100, 160, 64 x 20) "Unsure?"
  - static text (10, 10, 261 x 56) "Aren’t you sure you really don’t want to have nothing to do with not launching the armageddon device?"
  - picture (16, 112, 74 x 74) id 3020

DITL 3252 "":
  - button (212, 160, 58 x 20) "Power"
  - button (140, 160, 58 x 20) "Cancel"
  - static text (12, 16, 261 x 56) "You’re just doing this ’cause you enjoy the ultimate feeling of power, aren’t you???"
  - picture (16, 112, 74 x 74) id 3020

DITL 3253 "":
  - button (212, 160, 58 x 20) "Yeah"
  - button (140, 160, 58 x 20) "Abort"
  - static text (12, 16, 261 x 56) "If you do this, everyone will hate you! It’s such a sissy way to try to win, anyway."
  - picture (16, 112, 74 x 74) id 3020

DITL 3254 "":
  - button (212, 160, 70 x 20) "Go For It!"
  - button (120, 160, 80 x 20) "Maybe Not"
  - static text (12, 16, 261 x 56) "Now look, this is NO laughing matter. You just might get yourself killed!"
  - picture (16, 112, 74 x 74) id 3020

DITL 3255 "":
  - button (212, 160, 70 x 20) "That’s It!"
  - button (116, 160, 83 x 20) "Never mind"
  - static text (12, 16, 261 x 56) "I get it. You’re losing big time and this is the only way you could possibly win! That’s it isn’t it?"
  - picture (16, 112, 74 x 74) id 3020

DITL 3260 "":
  - button (220, 110, 58 x 20) "OK"
  - icon (10, 10, 32 x 32) id 2
  - static text (50, 10, 229 x 83) "Sorry, but not all of the players have updated to the current turn. Until they have done so, you can’t end your turn. Try again in a few seconds."

DITL 3280 "":
  - button (182, 208, 58 x 20) "OK"
  - picture (26, 182, 74 x 74) id 3020
  - static text (26, 13, 294 x 36) "Sorry, but Spaceward Ho! allows you to have only 20 ship types at one time. "
  - static text (26, 52, 294 x 67) "If you would like to create another ship type, scrap an old type by checking the “Scrap” box for it in the “List Ship Types…” Dialog."
  - static text (26, 130, 299 x 48) "The ship will be scrapped during the turn update and you can create a new type next turn…"

DITL 3330 "":
  - button (156, 171, 58 x 20) "OK"
  - picture (13, 119, 74 x 74) id 3020
  - static text (13, 13, 221 x 48) "Sorry, but that fleet doesn’t have enough fuel to reach the selected destination. "
  - static text (13, 67, 221 x 50) "You can tell this because there are no arrows on either end of the dragged line."

DITL 3380 "":
  - button (210, 120, 58 x 20) "Really"
  - button (120, 120, 58 x 20) "Cancel"
  - static text (20, 10, 212 x 39) "Do you really, really, REALLY want to surrender?"
  - picture (20, 70, 74 x 74) id 3020

DITL 3390 "":
  - button (210, 120, 58 x 20) "Really"
  - button (120, 120, 58 x 20) "Cancel"
  - static text (20, 10, 212 x 39) "Do you really, really, REALLY want to surrender to ^0?"
  - picture (20, 70, 74 x 74) id 3020

DITL 3410 "":
  - button (164, 104, 58 x 20) "OK"
  - button (92, 104, 58 x 20) "Cancel"
  - picture (10, 11, 74 x 74) id 3020
  - static text (92, 11, 131 x 60) "Do you really want to abandon a profitable planet?"

DITL 3420 "":
  - button (164, 104, 58 x 20) "OK"
  - button (92, 104, 58 x 20) "Cancel"
  - picture (10, 11, 74 x 74) id 3020
  - static text (92, 11, 136 x 81) "Do you really want to abandon a planet that will be profitable very soon?"

DITL 3430 "":
  - button (210, 70, 58 x 20) "OK"
  - static text (70, 10, 200 x 53) "Sorry, but all of the computer players are already dead so you can’t join."
  - icon (20, 10, 32 x 32) id 2

DITL 4000 "":
  - button (117, 160, 58 x 20) "OK"
  - button (39, 160, 58 x 20) "Cancel"
  - edit text (13, 65, 147 x 16) ""
  - edit text (13, 117, 147 x 16) ""
  - user item (113, 156, 66 x 28)
  - static text (26, 221, 15 x 15) ""
  - static text (13, 13, 180 x 16) "Please Identify Yourself:"
  - static text (13, 39, 96 x 16) "Player Name:"
  - static text (13, 91, 120 x 17) "Player Password:"

DITL 4010 "":
  - button (284, 180, 58 x 20) "Join"
  - button (208, 180, 58 x 20) "Cancel"
  - static text (116, 4, 199 x 18) "WWWWWWWWWWWWWWW"
  - static text (116, 24, 148 x 17) "<password>"
  - radio button (130, 72, 106 x 18) "Novice"
  - radio button (130, 91, 106 x 18) "Beginner"
  - radio button (130, 110, 106 x 18) "Normal"
  - radio button (130, 129, 106 x 18) "Advanced"
  - radio button (130, 148, 106 x 18) "Expert"
  - user item (280, 176, 66 x 28)
  - radio button (273, 80, 55 x 18) "Male"
  - radio button (273, 106, 72 x 18) "Female"
  - user item (13, 80, 74 x 74)
  - static text (8, 4, 96 x 15) "Your Name:"
  - static text (8, 24, 75 x 16) "Password:"
  - static text (117, 54, 85 x 16) "Skill Level:"
  - static text (260, 54, 75 x 16) "Sex:"

DITL 4020 "":
  - button (332, 192, 58 x 20) "OK"
  - user item (328, 188, 66 x 28)
  - radio button (12, 35, 224 x 18) "Have computer play for me."
  - radio button (12, 61, 263 x 18) "Just mark me done every turn."
  - radio button (12, 116, 288 x 18) "I’ll play my own turns, thank you."
  - radio button (12, 88, 365 x 18) "Mark me done until something interesting happens."
  - control (103, 172, 130 x 16) id 4020
  - static text (12, 172, 21 x 16) "15"
  - button (292, 34, 65 x 20) "Config…"
  - static text (12, 152, 346 x 16) "Under auto play, event messages disappear after:"
  - static text (38, 172, 56 x 16) "Seconds"
  - static text (12, 8, 128 x 16) "Auto Play Options:"

DITL 4021 "":
  - button (260, 114, 58 x 20) "OK"
  - button (190, 114, 58 x 20) "Cancel"
  - user item (256, 110, 66 x 28)
  - control (100, 40, 130 x 16) id 4021
  - control (100, 70, 130 x 16) id 4022
  - static text (10, 10, 259 x 17) "Configure Computer’s Auto Play Style:"
  - static text (10, 40, 63 x 18) "Friendly"
  - static text (250, 40, 83 x 16) "Aggressive"
  - static text (250, 70, 75 x 16) "Dig In"
  - static text (10, 70, 75 x 16) "No Defense"

DITL 4030 "":
  - button (271, 179, 90 x 20) "OK"
  - button (23, 179, 90 x 20) "Cancel"
  - user item (267, 175, 98 x 28)
  - static text (23, 13, 352 x 16) "Please Personalize Your Copy of Spaceward Ho! 4.0:"
  - static text (23, 42, 110 x 20) "Name:"
  - edit text (136, 42, 225 x 20) ""
  - static text (23, 75, 110 x 20) "Company:"
  - edit text (136, 75, 225 x 20) ""
  - static text (23, 115, 217 x 38) "Have you told your friends about Spaceward Ho!?"
  - radio button (253, 108, 108 x 18) "Yes"
  - radio button (253, 126, 108 x 18) "No"
  - radio button (253, 144, 108 x 18) "No, but I will"

DITL 4040 "":
  - button (240, 180, 58 x 20) "OK"
  - user item (236, 176, 66 x 28)
  - button (168, 180, 58 x 20) "Cancel"
  - check box (8, 32, 106 x 18) "Star Map"
  - check box (8, 56, 124 x 18) "Explored Stars"
  - check box (8, 80, 106 x 18) "Fleets"
  - check box (152, 32, 106 x 18) "Alliances"
  - check box (152, 56, 106 x 18) "Messages"
  - radio button (8, 144, 62 x 18) "Color"
  - radio button (88, 144, 117 x 18) "Black & White"
  - static text (8, 8, 219 x 16) "What Would You Like To Print?"
  - static text (8, 120, 265 x 17) "How Would You Like It Printed?"

DITL 4050 "":
  - button (196, 179, 58 x 20) "OK"
  - user item (192, 175, 66 x 28)
  - edit text (97, 144, 90 x 16) "WWWWWWW"
  - user item (10, 118, 74 x 74)
  - static text (9, 6, 265 x 35) "You won the game, so you get to name a star."
  - static text (9, 45, 263 x 34) "Star names must be 2 to 7 characters long. "
  - static text (95, 119, 111 x 16) "New Star Name:"
  - static text (9, 82, 263 x 34) "(If you’d rather not name a star, click “OK” with the name blank.)"

DITL 4060 "":
  - button (260, 196, 58 x 20) "OK"
  - button (184, 196, 58 x 20) "Cancel"
  - user item (256, 192, 66 x 28)
  - user item (12, 52, 310 x 130)
  - static text (12, 12, 314 x 33) "Which fleet would you like to group with your ^0? "

DITL 4070 "":
  - button (156, 134, 58 x 20) "OK"
  - button (78, 134, 58 x 20) "Cancel"
  - user item (152, 130, 66 x 28)
  - static text (13, 13, 209 x 64) "You currently have $^0 in ship money. You can take out up to $^1. How much would you like?"
  - edit text (13, 91, 99 x 16) "Edit Text"

DITL 4080 "":
  - button (268, 212, 58 x 20) "OK"
  - user item (264, 208, 66 x 28)
  - user item (16, 48, 317 x 152)
  - button (20, 212, 58 x 20) "Details"
  - static text (16, 8, 112 x 16) "Hall Of Fame"
  - static text (16, 32, 50 x 14) "Name"
  - static text (116, 32, 60 x 15) "When"
  - static text (216, 32, 100 x 16) "Difficulty"

DITL 4090 "":
  - button (268, 212, 58 x 20) "OK"
  - user item (264, 208, 66 x 28)
  - user item (16, 48, 317 x 152)
  - button (104, 212, 58 x 20) "Details"
  - static text (16, 8, 112 x 16) "Hall Of Shame"
  - static text (16, 32, 50 x 14) "Name"
  - static text (116, 32, 60 x 15) "When"
  - static text (216, 32, 100 x 16) "Difficulty"

DITL 4100 "":
  - button (308, 224, 58 x 20) "OK"
  - user item (304, 220, 66 x 28)
  - static text (164, 84, 75 x 16) "Humans"
  - static text (164, 104, 75 x 16) "Comp"
  - static text (324, 184, 75 x 16) "Style"
  - static text (244, 184, 75 x 16) "Density"
  - static text (164, 184, 75 x 16) "Size"
  - static text (164, 144, 75 x 16) "Int"
  - static text (164, 164, 75 x 16) "GameDate"
  - static text (164, 124, 75 x 16) "Allies"
  - static text (164, 44, 105 x 16) "RealDate"
  - static text (164, 64, 75 x 16) "Bonus"
  - static text (164, 24, 190 x 17) "Name"
  - static text (164, 204, 75 x 16) "Skill"
  - static text (164, 224, 75 x 16) "Arms."
  - user item (308, 52, 74 x 74)
  - static text (4, 4, 179 x 17) "Summary of Game Victory"
  - static text (105, 24, 54 x 15) "Winner:"
  - static text (121, 44, 38 x 16) "Date:"
  - static text (89, 64, 70 x 16) "Difficulty:"
  - static text (86, 84, 73 x 16) "# Humans:"
  - static text (66, 104, 93 x 16) "# Computers:"
  - static text (4, 144, 155 x 16) "Computer Intelligence:"
  - static text (70, 184, 89 x 16) "Galaxy Style:"
  - static text (101, 124, 58 x 16) "# Allies:"
  - static text (80, 164, 79 x 16) "Game Date:"
  - static text (77, 204, 82 x 16) "Player Skill:"
  - static text (60, 224, 97 x 16) "Armageddons:"

DITL 4110 "":
  - button (308, 224, 58 x 20) "OK"
  - user item (304, 220, 66 x 28)
  - static text (164, 84, 75 x 16) "Humans"
  - static text (164, 104, 75 x 16) "Comp"
  - static text (324, 184, 75 x 16) "Style"
  - static text (244, 184, 75 x 16) "Density"
  - static text (164, 184, 75 x 16) "Size"
  - static text (164, 144, 75 x 16) "Int"
  - static text (164, 164, 75 x 16) "GameDate"
  - static text (164, 124, 75 x 16) "Allies"
  - static text (164, 44, 105 x 16) "RealDate"
  - static text (164, 64, 75 x 16) "Bonus"
  - static text (164, 24, 199 x 17) "Name"
  - static text (164, 204, 75 x 16) "Skill"
  - static text (164, 224, 75 x 16) "Arms."
  - user item (300, 44, 74 x 74)
  - static text (4, 4, 179 x 17) "Summary of Game Loss"
  - static text (115, 24, 44 x 15) "Loser:"
  - static text (121, 44, 38 x 16) "Date:"
  - static text (90, 64, 69 x 16) "Difficulty:"
  - static text (86, 84, 73 x 16) "# Humans:"
  - static text (66, 104, 93 x 16) "# Computers:"
  - static text (4, 144, 155 x 16) "Computer Intelligence:"
  - static text (70, 184, 89 x 16) "Galaxy Style:"
  - static text (101, 124, 58 x 16) "# Allies:"
  - static text (80, 164, 79 x 16) "Game Date:"
  - static text (77, 204, 82 x 16) "Player Skill:"
  - static text (60, 224, 98 x 16) "Armageddons:"

DITL 4130 "":
  - button (312, 160, 58 x 20) "OK"
  - button (232, 160, 58 x 20) "Cancel"
  - user item (308, 156, 66 x 28)
  - static text (308, 12, 78 x 14) "Arkaid"
  - static text (308, 32, 75 x 14) "Never Explored."
  - static text (308, 52, 75 x 14) "unknown"
  - static text (88, 112, 75 x 14) "unknown"
  - static text (88, 132, 75 x 14) "unknown"
  - static text (88, 152, 75 x 14) "unknown"
  - static text (88, 172, 75 x 14) "unknown"
  - static text (308, 128, 75 x 14) "unknown"
  - static text (308, 74, 75 x 14) "No battles."
  - static text (308, 98, 75 x 14) "n/a"
  - user item (6, 6, 190 x 100)
  - static text (224, 12, 74 x 14) "Planet Info For:"
  - static text (224, 52, 75 x 14) "Population:"
  - static text (8, 132, 75 x 14) "Temperature:"
  - static text (8, 112, 75 x 14) "Gravity:"
  - static text (8, 152, 75 x 14) "Metal:"
  - static text (8, 172, 75 x 14) "Owner:"
  - static text (224, 32, 75 x 14) "Info Date:"
  - static text (224, 74, 77 x 14) "Battle Date:"
  - static text (224, 128, 75 x 14) "Income:"
  - static text (224, 94, 75 x 30) "Ships Built This Turn:"

DITL 5000 "":
  - button (247, 104, 58 x 20) "Save"
  - button (26, 104, 74 x 20) "Don’t Save"
  - button (156, 104, 58 x 20) "Cancel"
  - static text (78, 13, 228 x 73) "^0, do you want to save the changes you’ve made before closing the current game?"
  - icon (13, 13, 32 x 32) id 2

DITL 5010 "":
  - button (156, 156, 58 x 20) "OK"
  - picture (13, 117, 74 x 74) id 3020
  - static text (12, 8, 224 x 108) "^0^1^2^3"

DITL 5030 "":
  - button (234, 195, 58 x 20) "OK"
  - static text (13, 13, 284 x 86) "Oops! Something kinda funny has happened in TheHo 2.0. Please write down the following problem with as much information as you can on what you think led up to it. Then let us know. Thanks."
  - static text (13, 104, 282 x 81) "^0^1^2^3"

DITL 5040 "":
  - button (92, 220, 58 x 20) "OK"
  - user item (88, 216, 66 x 28)
  - static text (13, 13, 202 x 36) "Congratulations! You have conquered the galaxy!"
  - picture (39, 52, 149 x 151) id 3030

DITL 5041 "":
  - button (92, 220, 58 x 20) "OK"
  - user item (88, 216, 66 x 28)
  - static text (13, 13, 202 x 36) "Congratulations! You have conquered the galaxy!"
  - picture (39, 52, 149 x 151) id 3530

DITL 5050 "":
  - button (80, 220, 71 x 20) "Oh, well…"
  - user item (76, 216, 79 x 28)
  - picture (39, 52, 149 x 151) id 3040
  - static text (13, 13, 209 x 34) "Unfortunately, you have been eliminated from the game…"

DITL 5051 "":
  - button (80, 220, 71 x 20) "Oh, well…"
  - user item (76, 216, 79 x 28)
  - picture (39, 52, 149 x 152) id 3540
  - static text (13, 13, 209 x 34) "Unfortunately, you have been eliminated from the game…"

> DLOG 5050 / 5051: the Mac's You Lost (`DoMessageAction` on report 0x432); Windows shows
> dialog 377 with its line and bitmap set by the code (`FUN_00470dec`: "Unfortunately, you
> have been eliminated from the game...", bitmap 3010). Built: `rs.youLost`.

DITL 6000 "":
  - button (420, 284, 58 x 20) "OK"
  - button (368, 252, 111 x 20) "Build & Continue"
  - button (348, 284, 58 x 20) "Cancel"
  - user item (416, 280, 66 x 28)
  - button (460, 196, 20 x 20) "+"
  - button (460, 220, 20 x 20) "-"
  - edit text (428, 208, 27 x 16) "999"
  - button (108, 284, 80 x 20) "Don’t Scrap"
  - user item (2, 2, 137 x 267)
  - user item (184, 4, 120 x 40)
  - edit text (176, 52, 140 x 16) "Edit Text"
  - control (156, 78, 176 x 20) id 6015
  - static text (240, 102, 82 x 16) "$99,999,999"
  - static text (240, 122, 82 x 16) "ProCost"
  - static text (240, 142, 82 x 16) "MetalCost"
  - static text (215, 166, 42 x 16) "99/99"
  - static text (215, 186, 42 x 16) "99"
  - static text (215, 206, 42 x 16) "99"
  - static text (215, 226, 42 x 16) "99"
  - static text (215, 246, 42 x 16) "99"
  - control (260, 166, 70 x 16) id 6010
  - control (260, 186, 70 x 16) id 6011
  - control (260, 206, 70 x 16) id 6012
  - control (260, 226, 70 x 16) id 6013
  - control (260, 246, 70 x 16) id 6014
  - static text (388, 132, 39 x 16) "999"
  - static text (424, 156, 39 x 16) "9,999"
  - user item (434, 4, 63 x 50)
  - user item (434, 64, 63 x 50)
  - static text (344, 26, 88 x 16) "$100,000,000"
  - static text (344, 86, 88 x 16) "999,999"
  - button (230, 284, 64 x 20) "Max Out"
  - static text (160, 102, 79 x 16) "Dev. Cost:"
  - static text (160, 122, 79 x 16) "Pro. Cost:"
  - static text (160, 142, 78 x 16) "Metal Cost:"
  - static text (152, 166, 47 x 16) "Range"
  - static text (152, 186, 47 x 16) "Speed"
  - static text (152, 206, 61 x 16) "Weapons"
  - static text (152, 226, 55 x 16) "Shields"
  - static text (152, 246, 50 x 16) "Mini"
  - static text (348, 132, 38 x 16) "Built:"
  - static text (348, 156, 73 x 16) "In Service:"
  - static text (344, 6, 56 x 17) "Savings:"
  - static text (344, 66, 46 x 16) "Metal:"
  - static text (348, 208, 75 x 16) "# To Build:"

DITL 6030 "":
  - button (364, 264, 82 x 20) "OK"
  - user item (360, 260, 90 x 28)
  - button (260, 264, 82 x 20) "Go To Fleet"
  - user item (13, 26, 455 x 226)
  - control (13, 265, 200 x 20) id 6030
  - static text (13, 2, 132 x 20) "List of All Fleets:"

DITL 6040 "":
  - button (321, 264, 82 x 20) "OK"
  - user item (317, 260, 90 x 28)
  - button (229, 264, 82 x 20) "Go To Star"
  - user item (13, 26, 362 x 222)
  - control (20, 264, 214 x 20) id 6040
  - static text (13, 2, 178 x 21) "List of All Explored Stars:"

DITL 6050 "":
  - button (400, 260, 58 x 20) "OK"
  - user item (396, 256, 66 x 28)
  - user item (13, 26, 455 x 225)
  - button (290, 260, 87 x 20) "Show Skills"
  - static text (13, 2, 454 x 19) "Comparison of 99 remaining players in 9999:"

DITL 6055 "":
  - button (468, 266, 54 x 20) "OK"
  - user item (464, 262, 62 x 28)
  - user item (4, 20, 484 x 223)
  - user item (4, 247, 452 x 47)
  - user item (4, 295, 452 x 7)
  - static text (4, 1, 452 x 17) "Select an icon to see recent recorded history:"

DITL 6056 "":
  - button (468, 264, 54 x 20) "OK"
  - user item (464, 260, 62 x 28)
  - user item (4, 20, 484 x 223)
  - user item (4, 247, 452 x 47)
  - user item (4, 295, 452 x 7)
  - static text (4, 1, 452 x 17) "Select an icon to see recently recorded history:"

DITL 6060 "":
  - button (416, 248, 58 x 20) "OK"
  - user item (412, 244, 66 x 28)
  - button (340, 248, 65 x 20) "Cancel"
  - user item (36, 56, 405 x 180)
  - button (108, 248, 66 x 20) "Group All"
  - button (184, 248, 66 x 20) "Divide All"
  - button (16, 248, 72 x 20) "Next Type"
  - button (260, 248, 66 x 20) "Split All"
  - static text (13, 0, 129 x 16) "To Organize Fleets:"
  - static text (16, 18, 347 x 17) "• Click and drag fleets into desired number of piles"
  - static text (16, 35, 346 x 16) "• Shift-Click selects an entire pile"

DITL 6070 "":
  - button (269, 284, 58 x 20) "Send"
  - button (192, 285, 58 x 20) "Erase"
  - user item (265, 280, 66 x 28)
  - user item (81, 33, 47 x 182)
  - user item (154, 33, 227 x 182)
  - static text (154, 7, 201 x 17) "<Modal Command>:"
  - button (342, 284, 58 x 20) "Done"
  - static text (156, 224, 97 x 16) "Message Text:"
  - edit text (156, 244, 241 x 17) ""
  - static text (6, 7, 131 x 18) "Send Message:"
  - static text (44, 47, 30 x 16) "To:"
  - static text (15, 85, 59 x 16) "Content:"

DITL 6080 "":
  - button (366, 272, 58 x 20) "Create"
  - button (288, 272, 58 x 20) "Cancel"
  - user item (362, 268, 66 x 28)
  - user item (160, 40, 272 x 47)
  - user item (8, 40, 92 x 47)
  - user item (8, 116, 182 x 47)
  - user item (204, 116, 227 x 47)
  - control (232, 172, 130 x 16) id 6080
  - static text (212, 172, 19 x 15) "20"
  - check box (8, 196, 98 x 18) "Alliances"
  - control (172, 220, 156 x 20) id 6060
  - control (172, 196, 255 x 20) id 6050
  - static text (160, 276, 28 x 16) "999"
  - check box (8, 220, 124 x 18) "Luck in Battles"
  - check box (8, 244, 417 x 18) "Automatically end turn for unconnected players"
  - static text (160, 0, 140 x 16) "Create New Galaxy"
  - static text (160, 20, 92 x 18) "Galaxy Style:"
  - static text (8, 20, 109 x 18) "Galaxy Density:"
  - static text (8, 96, 180 x 18) "Computer Intelligence:"
  - static text (8, 172, 201 x 16) "Number of Computer Players:"
  - static text (204, 96, 122 x 17) "Galaxy Size:"
  - static text (8, 276, 150 x 16) "Base Difficulty Rating:"

DITL 6100 "":
  - button (277, 262, 82 x 20) "OK"
  - user item (273, 258, 90 x 28)
  - user item (13, 26, 350 x 226)
  - static text (169, 260, 97 x 20) "Smart"
  - static text (13, 2, 286 x 20) "List of all players and their skill levels:"
  - static text (13, 260, 155 x 19) "Computer Intelligence:"

DITL 6110 "":
  - button (404, 272, 58 x 20) "OK"
  - button (332, 272, 58 x 20) "Cancel"
  - user item (400, 268, 66 x 28)
  - user item (4, 80, 152 x 182)
  - user item (160, 80, 152 x 182)
  - user item (316, 80, 152 x 182)
  - static text (16, 60, 121 x 15) "I Really Like Them"
  - static text (200, 60, 79 x 15) "I Like Them"
  - static text (336, 60, 122 x 15) "I Don’t Like Them"
  - static text (4, 4, 421 x 33) "Click on a player’s icon to move it horizontally to specify whether you would or would not like to ally with that player."
  - static text (4, 36, 460 x 16) "Their icon represents what their current opinion of you is."

DITL 6120 "":
  - button (384, 168, 58 x 20) "Give"
  - button (384, 140, 58 x 20) "Cancel"
  - user item (380, 164, 66 x 28)
  - user item (20, 20, 227 x 182)
  - edit text (263, 40, 72 x 16) "0"
  - edit text (263, 100, 72 x 16) "0"
  - static text (260, 20, 163 x 16) "Give How Much Money?"
  - static text (260, 80, 162 x 15) "Give How Much Metal?"
  - static text (20, 0, 153 x 18) "Give Stuff To:"

DITL 6130 "":
  - button (274, 180, 58 x 20) "OK"
  - button (274, 140, 58 x 20) "Cancel"
  - user item (270, 176, 66 x 28)
  - user item (20, 20, 227 x 182)
  - static text (20, 0, 153 x 18) "Surrender To:"

DITL 6140 "":
  - button (160, 160, 58 x 20) "OK"
  - static text (10, 10, 220 x 87) "^0^1^2^3"
  - user item (156, 156, 66 x 28)
  - picture (10, 110, 74 x 74) id 3020

DITL 6141 "":
  - button (160, 160, 58 x 20) "OK"
  - static text (10, 10, 220 x 87) "^0^1^2^3"
  - user item (156, 156, 66 x 28)
  - picture (10, 110, 74 x 74) id 3520

DITL 6150 "":
  - button (400, 266, 58 x 20) "OK"
  - button (324, 266, 58 x 20) "Cancel"
  - user item (396, 262, 66 x 28)
  - check box (290, 44, 193 x 16) "Show Fleets Paths"
  - check box (16, 44, 216 x 16) "Automatically Sort Planet List"
  - check box (16, 64, 173 x 16) "Show Event Messages"
  - check box (28, 104, 188 x 16) "Review Event Battles"
  - edit text (298, 116, 139 x 16) ""
  - control (156, 174, 130 x 16) id 4040
  - check box (16, 194, 176 x 16) "Fully Animated Battles"
  - check box (200, 194, 192 x 16) "Groups Shoot Together"
  - check box (16, 124, 234 x 16) "Give Helpful Game Play Hints"
  - check box (290, 64, 180 x 16) "Temp. in Celsius (not °F)"
  - check box (28, 84, 243 x 16) "But Only The Most Important Ones"
  - control (158, 238, 130 x 16) id 4060
  - static text (334, 238, 20 x 16) "99"
  - static text (188, 0, 98 x 15) "Preferences "
  - static text (282, 92, 136 x 16) "Your Password:"
  - static text (16, 174, 95 x 16) "Battle Speed:"
  - static text (116, 174, 34 x 16) "Fast"
  - static text (292, 174, 43 x 16) "Slow"
  - static text (22, 238, 90 x 16) "Polling Time:"
  - static text (118, 238, 33 x 16) "Fast"
  - static text (294, 238, 35 x 16) "Slow"
  - static text (358, 238, 75 x 16) "Seconds"
  - static text (8, 24, 183 x 16) "After Every Turn Update:"
  - static text (282, 24, 162 x 16) "On The Star Map:"
  - static text (8, 154, 172 x 15) "When Reviewing Battles:"
  - static text (6, 218, 394 x 16) "When Checking To See If All Players Have Ended Their Turn:"

DITL 6160 "":
  - button (288, 200, 58 x 20) "OK"
  - user item (284, 196, 66 x 28)
  - static text (204, 44, 130 x 16) "4,999,999,999"
  - static text (204, 68, 130 x 16) ""
  - static text (204, 92, 130 x 16) ""
  - static text (204, 116, 130 x 16) ""
  - static text (204, 140, 130 x 16) ""
  - static text (204, 164, 130 x 16) ""
  - static text (12, 12, 204 x 16) "Cumulative Statistics:"
  - static text (16, 44, 160 x 16) "Total Population Gained:"
  - static text (16, 68, 160 x 16) "Total Population Killed:"
  - static text (16, 92, 166 x 16) "Enemy Population Killed:"
  - static text (16, 116, 160 x 16) "Total # of Ships Built:"
  - static text (16, 140, 181 x 16) "Total # of Ships Destroyed:"
  - static text (16, 164, 166 x 32) "Total # of Enemy Ships Destroyed:"

DITL 6170 "":
  - button (368, 188, 58 x 20) "OK"
  - user item (364, 184, 66 x 28)
  - user item (44, 40, 382 x 18)
  - user item (44, 76, 382 x 18)
  - user item (44, 112, 382 x 18)
  - user item (44, 148, 382 x 18)
  - user item (4, 32, 32 x 32)
  - user item (4, 68, 32 x 32)
  - user item (4, 104, 32 x 32)
  - user item (4, 140, 32 x 32)
  - static text (4, 4, 286 x 17) "You can cancel one research program:"

DITL 6180 "":
  - button (380, 184, 58 x 20) "OK"
  - user item (376, 180, 66 x 28)
  - user item (16, 48, 425 x 122)
  - user item (408, 8, 32 x 32)
  - static text (16, 8, 112 x 16) "Master Points:"
  - static text (16, 32, 50 x 16) "Name"
  - static text (141, 32, 75 x 16) "Points"
  - static text (266, 32, 75 x 16) "Rank"

DITL 7000 "":
  - static text (11, 15, 209 x 16) "Doing Pass 1 for Player 1…"
  - control (13, 39, 100 x 16) id 7000

DITL 7005 "":
  - static text (16, 44, 298 x 33) "You will take over for a computer player after the current turn has been completed!"
  - static text (16, 16, 236 x 16) "Please wait a moment…"

DITL 7010 "":
  - button (193, 273, 58 x 20) "Skip"
  - user item (189, 269, 66 x 28)

DITL 7011 "":
  - button (193, 273, 58 x 20) "Skip"
  - user item (189, 269, 66 x 28)

## Controls (CNTL)

- CNTL 4020 "Message Delay": "", proc 16, value 0 (1 to 15)
- CNTL 4021 "Aggressiveness": "", proc 16, value 0 (0 to 10)
- CNTL 4022 "Defensiveness": "", proc 16, value 0 (0 to 100)
- CNTL 4040 "Battle Speed (ticks)": "", proc 16, value 0 (10 to 60)
- CNTL 4060 "Polling Time (Seconds)": "", proc 16, value 0 (1 to 15)
- CNTL 6000 "List Types Scrollbar": "", proc 16080, value 0 (0 to 0)
- CNTL 6010 "Create Range Scrollbar": "", proc 16, value 0 (0 to 0)
- CNTL 6011 "Create Speed": "", proc 16, value 0 (0 to 0)
- CNTL 6012 "Create Weapons": "", proc 16, value 0 (0 to 0)
- CNTL 6013 "Create Shields": "", proc 16, value 0 (0 to 0)
- CNTL 6014 "Create Mini": "", proc 16, value 0 (0 to 0)
- CNTL 6015 "Create Type Popup": "", proc 16002, value 0 (6015 to 0)
- CNTL 6016 "Create Type Popup": "Class:", proc 16002, value 0 (6016 to 78)
- CNTL 6030 "List Fleets Sort Popup": "Sort By:", proc 16002, value 2 (6030 to 64)
- CNTL 6040 "List Stars Sort Popup": "Sort By:", proc 16002, value 2 (6040 to 64)
- CNTL 6050 "Turn Time Limit Popup": "Turn Time Limit:", proc 16002, value 1 (6050 to 106)
- CNTL 6060 "Years Per Turn Popup": "Years Per Turn:", proc 16002, value 1 (6060 to 106)
- CNTL 6070 "Message Player Popup": "", proc 16002, value 0 (6070 to 0)
- CNTL 6071 "Message Person Popup": "", proc 16002, value 0 (6071 to 0)
- CNTL 6080 "Number of Computer Players": "", proc 16, value 0 (0 to 0)
- CNTL 6081 "Turn Duration": "", proc 16, value 0 (1 to 10)
- CNTL 7000 "Status Bar": "", proc 16032, value 0 (0 to 100)

## String lists (STR#)

### STR# 128 "Req’d Strings"

1. "Any version of Quickdraw"
2. "Color Quickdraw"
3. "32-bit Quickdraw version"
4. "68000"
5. "68010"
6. "68020"
7. "68030"
8. "68040"

### STR# 2000 "Winner's Star Names"

1. "Tiber"

### STR# 6000 "Error Strings"

1. "Failed to write mailbox (network) game file."
2. "Error during turn update."
3. "Could not write battle summary to disk."
4. "Could not create galaxy."
5. "Could not create ally fleet information record."
6. "Could not resize player record for newly colonized star."
7. "Could not load galaxy."
8. "Could not resize player record for newly created fleet."
9. "No memory available to determine fleet path."
10. "Personalization failed."
11. "Could not write updated turn information to disk."
12. "Could not read galaxy information from disk."
13. "Could not read player information from disk."
14. "Could not write updated player information to disk."
15. "Could not read player information from disk."
16. "Could not modify mailbox file to register current request."
17. "Could not create/open game history file."
18. "Could not access game file. Closing game."

### STR# 6010 "Error Code Strings"

1. "Misc. Error"
2. "Nil Error Code"
3. "Disk Full"
4. "File Locked"
5. "I/O Error"
6. "Volume Locked"
7. "Out of Memory"
8. "File is Busy"
9. "File Not Found"
10. "Diskette is Locked"
11. "Spaceward Ho! Failure"
12. "Server Volume Has Been Disconnected"
13. "Duplicate file name. File is already open?"

### STR# 6020 "File Strings"

1. "Spaceward Ho! 4.0 Prefs"
2. "Ho! 4.0 Color Picts"
3. " History"
4. "Ho! Game History"
5. "Ho! Resources"
6. "Spaceward Ho! 4.0 Demo Prefs"
7. "Spaceward Ho! 4.0 Net Prefs"

### STR# 6030 "Message Window Strings"

1. "%.*s: %.*s"
2. "Anonymous: %.*s"
3. "You: %.*s"
4. "Player #%d: %.*s"

### STR# 6040 "Report Window Templates"

1. "Spaceward Ho! Version 4.0.3 by Peter Commons."
2. "Spaceward Ho! DEMO Version 4.0.3 by Peter Commons."
3. "Artwork by Howard Vives and Bob Van de walle."
4. "Your Range Technology has reached level %d."
5. "Your Speed Technology has reached level %d."
6. "Your Weapons Technology has reached level %d."
7. "Your Shield Technology has reached level %d."
8. "Your Miniaturization Technology has reached level %d."
9. "Your Radical researchers have just made another wild discovery!"
10. "You have abandoned %.*s."
11. "%.*s has gone nova."
12. "%.*s destroyed your colony at %.*s. You lost %d of your ships. %.*s lost %d. You lost %.*s people."
13. "Year %d:"
14. "Your colony at %.*s is not receiving sufficient funds to support itself."
15. "You are not supporting %.*s enough. The people have revolted and now belong to %.*s"
16. "Warning: you are terraforming %.*s, a planet that will never become profitable."
17. "You have completely terraformed %.*s."
18. "A volcanic eruption at %.*s has drastically warmed the temperature to %.*s!"
19. "Your fleet of %.*s at %.*s has been scrapped for %.*s metal."
20. "Your “%.*s” ship type has been scrapped. %d of this type scrapped for %.*s metal."
21. "Your fleet of %.*s disappeared through a wormhole in space and is lost."
22. "Your %.*s can no longer reach %.*s."
23. "Your fleet of %.*s has arrived at %.*s."
24. "Your fleet of %.*s has stopped at %.*s on the way to %.*s."
25. "%.*s’s fleet of %.*s has arrived at %.*s."
26. "Your fleet of %.*s has eaten %.*s people while refueling at %.*s."
27. "%.*s’s fleet of biologicals has eaten %.*s people while refueling at %.*s."
28. "%.*s has run out of metal."
29. "%.*s has run out of metal. You should probably abandon it."
30. "%.*s has just become a profitable colony."
31. "It’s a baby boom! The population at %.*s has started growing quickly."
32. "%.*s’s population growth rate has slowed."
33. "You have explored %.*s. Gravity: %d.%2.2dG. Temp: %.*s. Metal: %.*s."
34. "%.*s has explored %.*s. Gravity: %d.%2.2dG. Temp: %.*s. Metal: %.*s."
35. "You have colonized %.*s."
36. "You won a battle at %.*s. You lost %d of your ships. %.*s lost %d."
37. "You lost a battle at %.*s. You lost %d of your ships. %.*s lost %d."
38. "%.*s survived an enemy attack from %.*s. You lost %d of your ships. %.*s lost %d. You lost %.*s people."
39. "%.*s says, “I want %.*s.”"
40. "%.*s says, “You take %.*s.”"
41. "%.*s says, “I like %.*s.”"
42. "%.*s says, “I hate %.*s.”"
43. "%.*s says, “I own %.*s.”"
44. "%.*s says, “I need money.”"
45. "%.*s says, “I need metal.”"
46. "%.*s says, “Let’s attack %.*s.”"
47. "%.*s says, “Thank You!”"
48. "%.*s says, “Sorry!”"
49. "%.*s says, “#!$@*$&@•™!”"
50. "%.*s says, “I like planets that are %d.%2.2dG and %.*s.”"
51. "%.*s says, “I saw %.*s at %.*s!”"
52. "%.*s says, “Look at %.*s.”"
53. "%.*s is cheating."
54. "%.*s says: %.*s"
55. "You told %.*s that you want %.*s."
56. "You told %.*s that you don’t want %.*s."
57. "You told %.*s that you like %.*s."
58. "You told %.*s that you hate %.*s."
59. "You told %.*s that you own %.*s."
60. "You told %.*s that you need money."
61. "You told %.*s that you need metal."
62. "You told %.*s, “Let’s attack %.*s.”"
63. "You told %.*s, “Thank You!”"
64. "You told %.*s, “Sorry!”"
65. "You said “#!$@*$&@•™!” to %.*s."
66. "You told %.*s what gravity and temperature you prefer."
67. "You told %.*s you saw %.*s at %.*s."
68. "You told %.*s all about %.*s."
69. "Wow! You seem to be doing really well! Congratulations!"
70. "Your message to %.*s: %.*s"
71. "You recovered %.*s metal from the battle at %.*s."
72. "%.*s metal has fallen onto %.*s from your recent battle."
73. "Oh no! %.*s people were killed when a heavy meteor shower hit %.*s."
74. "%.*s has just been eliminated from the game."
75. "You have just been eliminated from the game."
76. "%.*s has just won the game."
77. "Congratulations! You won the game. Game difficulty rating was %d."
78. "You are not spending any money on technology research."
79. "The meteor shower destroyed your colony at %.*s."
80. "Oh, no! All the metal on %.*s has suddenly disappeared."
81. "Uh-oh! %.*s has started growing and is turning bright red in hue!"
82. "%.*s has just gone supernova. The planet has been obliterated."
83. "The shock wave from the supernova threw %.*s metal at %.*s, killing %.*s people."
84. "Your %.*s technology just jumped to %d."
85. "Eeek! A nasty computer bug has broken into your game and started wreaking havoc!"
86. "%.*s has offered to ally with you."
87. "%.*s no longer wants to ally with you."
88. "You have offered to ally with %.*s."
89. "You no longer want to ally with %.*s."
90. "You have formed an alliance with %.*s."
91. "Your alliance with %.*s is gone."
92. "%.*s has offered to be your best buddy."
93. "%.*s no longer wants to be your best buddy. He just wants to be allies."
94. "You have offered to be best buddies with %.*s."
95. "You no longer want to be best buddies with with %.*s. You just want to be allies."
96. "You are now best buddies with %.*s."
97. "Your best buddy relationship with %.*s is gone. You're only allies now."
98. "The amount of energy emanating from %.*s suggests a big battle just took place."
99. "%.*s has just given you $%.*s."
100. "%.*s has just given you %.*s metal."
101. "You just gave %.*s $%.*s."
102. "You just gave %.*s %.*s metal."
103. "%.*s has just surrendered."
104. "%.*s has just surrendered to %.*s."
105. "You have just surrendered."
106. "You have just surrendered to %.*s."
107. "Your mining consortium has just been able to extract an additional %.*s metal from every planet you have."
108. "Weird weather patterns have allowed astronomers to explore certain far away stars."
109. "Your ship technicians have designed a set of new ships with no development cost."
110. "Your ship technicians have designed a decoy ship. It's really weak, but it looks menacing and can help keep your allies in line!"
111. "Your mad scientists have created a space monster ship! It's not too powerful, but it doesn't cost any metal!"
112. "Your scientists have discovered how to turn your monitor from black and white to color!"
113. "Your scientists apologize, but they seem to be having “hardware problems.”"
114. "Your scientists realize you already are running in color, shrug, and go back off to work."
115. "Your archaeologists have found ancient scientific documents from a lost civilization. You can now mine more efficiently."
116. "Your sociologists have discovered how to safely increase the maximum population of your planets!"
117. "Your climatologists have discovered how to terraform planets more efficiently."
118. "Your military training program has improved. Your generals are now smarter."
119. "You have improved your recycling program. You can now get more metal from scrapped ships."
120. "Your spies have stolen some technological secrets from %.*s!"
121. "You have found a wealth of precious metals and have increased your savings by $%.*s"
122. "Your radical researchers are hard at work on another discovery!"
123. "Warning! Ship money is being used to support %.*s."
124. "Warning! After supporting your planets and paying your interest, you have no money to spend!"
125. "Your alliance will win the game next turn if it holds!"
126. "Uh-oh! Having to borrow more ship money to pay all your interest!"
127. "You don’t have enough money! You’re neglecting your planets! Global warming is taking place!"
128. "Due to a lack of funds, one of your fleets can’t be maintained. It is being scrapped."
129. "Oh No! It’s armageddon!"
130. "Hmm! The armadeddon device was activated, but there wasn't enough mass in the galaxy to get it to work…"
131. "The armageddon device has caused half of the stars to supernova!"
132. "%.*s’s armageddon device has just been turned on!"
133. "Whew! %.*s’s armageddon device was just turned off."
134. "You just received %.*s metal from someone scrapping a fleet or from a battle over %.*s."
135. "Congratulations, %.*s! Your population now exceeds %.*s!"
136. "Your %.*s tech would have just gone up if you hadn’t been playing the demo version!"
137. "%.*s has just taken over for the computer player %.*s."
138. "You now have %.*s Range Technology (%d)."
139. "You now have %.*s Speed Technology (%d)."
140. "You now have %.*s Weapons Technology (%d)."
141. "You now have %.*s Shield Technology (%d)."
142. "You now have %.*s Miniaturization Technology (%d)."
143. "%.*s surrenders to you, giving you $%.*s."
144. "%.*s surrenders to you, giving you %.*s metal."
145. "%.*s surrenders to you, giving you the planet %.*s."
146. "Oh no! The Valdez has sprung a leak! The ecology on %.*s is in shambles! The citizens are suing you for negligence for twice your net worth!"

### STR# 6050 "Tech Names & Tech Bar Strings"

1. "Range"
2. "Speed"
3. "Weapons"
4. "Shields"
5. "Mini"
6. "Radical"
7. "100%"
8. "Tech Spending"
9. "Current Levels:"

### STR# 6060 "Star Names"

1. "Sol"
2. "Sirius"
3. "Canopus"
4. "Vega"
5. "Rigel"
6. "Capella"
7. "Procyon"
8. "Mira"
9. "Altair"
10. "Antares"
11. "Spica"
12. "Pollux"
13. "Castor"
14. "Deneb"
15. "Regulus"
16. "Polaris"
17. "Algol"
18. "Proxima"
19. "Alban"
20. "Thuban"
21. "Mizar"
22. "Alcor"
23. "Doobie"
24. "Merak"
25. "Phad"
26. "Megrez"
27. "Alioth"
28. "Alkaid"
29. "Mintaka"
30. "Alnitak"
31. "Atlas"
32. "Remus"
33. "Alcyon"
34. "Electra"
35. "Maia"
36. "Merope"
37. "Taygeta"
38. "Sterope"
39. "Hadar"
40. "Quark"
41. "Mimosa"
42. "Adhara"
43. "Shaula"
44. "Nath"
45. "Almak"
46. "Alshain"
47. "Tarazed"
48. "Hamal"
49. "Izar"
50. "Shedir"
51. "Menkar"
52. "Diphda"
53. "Etamin"
54. "Acamar"
55. "Alhena"
56. "Alphard"
57. "Arneb"
58. "Nihal"
59. "Saiph"
60. "Markab"
61. "Kansas"
62. "Enif"
63. "Nunki"
64. "Kokab"
65. "Ain"
66. "Ancha"
67. "Arkab"
68. "Atik"
69. "Atria"
70. "Shadow"
71. "Azha"
72. "Baham"
73. "Beid"
74. "Botein"
75. "Caph"
76. "Coxa"
77. "Cursa"
78. "Dabih"
79. "Furud"
80. "Gedi"
81. "Gienah"
82. "Heka"
83. "Keid"
84. "Maaz"
85. "Matar"
86. "Mirfak"
87. "Murzim"
88. "Delta"
89. "Ozworld"
90. "Okda"
91. "Phact"
92. "Propus"
93. "Rana"
94. "Risha"
95. "Sabik"
96. "Petro"
97. "Syrma"
98. "Tarf"
99. "Wasat"
100. "Wazn"
101. "Yed"
102. "Yildun"
103. "Zaniah"
104. "Zaurac"
105. "Zosma"
106. "Ylum"
107. "Arrakis"
108. "Akworld"
109. "Colma"
110. "Henry"
111. "Foundat"
112. "Trantor"
113. "Barsoom"
114. "Rover"
115. "Fluffy"
116. "Lennon"
117. "Gorby"
118. "Atlanta"
119. "Chicago"
120. "Miami"
121. "Home"
122. "Binar"
123. "Nemesis"
124. "Harkon"
125. "Talos"
126. "Aries"
127. "Taurus"
128. "Gemini"
129. "Cancer"
130. "Leo"
131. "Virgo"
132. "Libra"
133. "Scorpio"
134. "Pisces"
135. "Canis"
136. "Ursa"
137. "Beta"
138. "Zeta"
139. "Upsilon"
140. "Rho"
141. "Cepheus"
142. "Calvin"
143. "Hobbes"
144. "Pooh"
145. "Tigger"
146. "Bambi"
147. "Dumbo"
148. "Tweety"
149. "Bugs"
150. "Torino"
151. "Denali"
152. "Woz"
153. "Sauron"
154. "Smaug"
155. "Thune"
156. "Thorin"
157. "Gollum"
158. "Fazaron"
159. "Trellor"
160. "Regor"
161. "Basil"
162. "Ursula"
163. "Styx"
164. "Lentor"
165. "Sooltar"
166. "Romula"
167. "Vulcan"
168. "Paradox"
169. "Kessel"
170. "Redox"
171. "Sith"
172. "Yavin"
173. "Quatro"
174. "Remulak"
175. "Kathoon"
176. "Thanos"
177. "Krypton"
178. "Darven"
179. "Gotham"
180. "Klah"
181. "Zaphod"
182. "Turin"
183. "Vives"
184. "Timmer"
185. "Argot"
186. "Willy"
187. "Sirgil"
188. "Ender"
189. "Wobbler"
190. "Quayle"
191. "Hope"

### STR# 6070 "Text For Map Window"

1. "Current Year:"
2. "Savings:"
3. "Net Income:"
4. "Metal:"
5. "(up $%s)"
6. "(down $%s)"
7. "(up %s)"
8. "(down %s)"
9. "$%s"
10. "(Int: $%s)"
11. "Planet:"
12. "Income:"
13. "Pop:"
14. "Temp:"
15. "Gravity:"
16. "Metal:"
17. "Terra"
18. "Mine"
19. "Ship"
20. "You have no information about this planet."
21. "Uninhabited"
22. "Unknown"
23. "Tech"
24. "Ships"
25. "%d.%1.1d, %d°"

### STR# 6080 "Ship Class Names"

1. "Scout"
2. "Dreadnought"
3. "Fighter"
4. "Tanker"
5. "Colony Ship"
6. "Satellite"
7. "Biological"
8. "Decoy"

### STR# 6090 "Player Skills"

1. "Novice"
2. "Beginner"
3. "Normal"
4. "Advanced"
5. "Expert"
6. "Master"

### STR# 6100 "Compare Players Strings"

1. "Income"
2. "Metal"
3. "Planets"
4. "Ships"
5. "Range"
6. "Speed"
7. "Weapons"
8. "Shields"
9. "Mini"
10. "Best"
11. "Average"
12. "Worst"

### STR# 6110 "Computer Skill Names"

1. "Dumb"
2. "Average"
3. "Smart"
4. "Diabolical"
5. "Super Genius"

### STR# 6120 "Menu Text Strings"

1. "Show Floating Windows"
2. "Hide Floating Windows"
3. "Build/Design Ships…"
4. "Can’t Build Ships Here…"
5. "Review Battle at %s…"
6. "No Battles here…"
7. "Organize Ships…"
8. "No ships to organize…"
9. "Scrap Current Fleet"
10. "Don’t Scrap Current Fleet"
11. "Hide Information"
12. "Show Information"
13. "Don’t Abandon Planet"
14. "Abandon Planet"

### STR# 6130 "Player History Graph Strings"

1. "Net Income"
2. "Metal"
3. "Ship Money"
4. "Ship Power"
5. "Population"
6. "Range"
7. "Speed"
8. "Weapons"
9. "Shields"
10. "Mini"
11. "$%s"
12. "%sM"
13. "$%s"
14. "%sP"
15. "%s"

### STR# 6140 "Galaxy Menu Procedures' Strings"

1. "No Climate Info."
2. "Own"
3. "Explored"
4. "Enemy"
5. "Sorry, no comparisons in the year 2000."
6. "Sorry, you can only send ten messages per turn."
7. "Your rankings among the %d remaining players in %d:"
8. "You won the game in %d."
9. "You were elminated in %d."
10. "Sorry, you can only give three gifts per turn."
11. "Scrap All"
12. "Don’t Scrap"

### STR# 6150 "Battle Dialog Strings"

1. "%d dead %.*s"
2. "%d dead %.*ss"
3. "Summary of battle"
4. "at %s in %d:"
5. "Round %d"
6. "Congratulations!"
7. "You won the battle!"
8. "Unfortunately,"
9. "you lost the battle…"
10. "OK"
11. "You have no information."
12. "You were destroyed immediately."

### STR# 6160 "End Turn Strings"

1. "Processing Turns..."
2. "Processing Year %d..."
3. "Battle Stage..."
4. "Seeing What Happened..."

### STR# 6170 "Additional Ho Strings"

1. "Building Game File in Memory..."
2. "%.*s in %.*s in %d"
3. "%d.%1.1d°F"
4. "%d.%1.1d°C"
5. "%d.%2.2dG"
6. "Owner:"
7. "There are no fleets at this planet."
8. "Fleet to be scrapped for metal."
9. "Stationed at:"
10. "Departing to:"
11. "%s (Dist %d; Time %d)"
12. "Going to %s (D %d; T %d) via %s"
13. "Fuel: %d/%d"
14. "Speed: %d"
15. "Full"
16. "Empty"
17. "Scrap: %s"
18. "more…"
19. "you"
20. "%.*s stationed at %s."
21. "%.*s leaving %s for %s to arrive in %d."
22. "%.*s to arrive at %s in %d."
23. "%.*s marooned at %s."
24. "Spaceward Ho! 4.0"
25. "%s dead"
26. "Alliances:"
27. "You’re allied with %s."
28. "Fleets:"
29. "Stars:"
30. "No One"
31. "Everyone"
32. "Building At:"
33. "Viewing At:"
34. "one"
35. "%.*s’s %.*s"
36. "Reading Game File..."
37. "Your Allies"
38. "Your Buddies"
39. "Abandoning"

### STR# 6180 "Standard Alert Strings"

1. "Sorry, but that is not the correct password for “^0”. Please try again."
2. "Sorry, but Spaceward Ho! 4.0 can't read galaxy files created with versions 1.0 - 3.0.1."
3. "Sorry, but this is a private scratch file. It cannot be opened!"
4. "Please name your new ship type."
5. "Sorry, your turn can’t be saved. Although you are in the year ^0, the game has already been updated to ^1…"
6. "Sorry, but the file way busy and the turn could not be marked “done.” Please try again in a moment."
7. "Please unlock this disk and try again."
8. "Please enter both your name and a company name or address."
9. "The turn is about to be updated. You have made some changes since ending your turn that will now be lost."
10. "Sorry, but that fleet is currently in hyperspace and can’t be contacted until it arrives at its next location."
11. "There are no colonists aboard that colony ship. To refill it, you must either wait one turn or abandon the colony."
12. "Sorry but the battle information for that battle is no longer available. It isn't in your game history file."
13. "Sorry, there’s already a star named  “^0.” Please pick another name."
14. "Sorry, but you don’t have any metal to build more ships."
15. "Sorry, but you have no specific information about that battle. All you know is that there was one, and it was pretty big."
16. "Sorry, but since you did not fight in that battle, you have no information about it."
17. "Sorry, but this game was created with a newer version of Spaceward Ho!"
18. "Sorry, but you have that fleet marked for the scrap heap. It’s not going anywhere!"
19. "Whoa! The game you were just playing is no longer the same! A file exists in the same place, but it’s a different game…"
20. "You can’t build that ship because you can’t go any further into debt!"
21. "Please enter your name and an optional password in the spaces provided."
22. "Sorry, but this setting can’t be changed in the demo version of Spaceward Ho!"
23. "Sorry, but the demo version of Spaceward Ho! is not multi-player. This game already has a human player registered."
24. "Give Help."
25. "Sorry, but you have already ended your turn. Although you can look at information, no changes can be made until next turn."
26. "Sorry, but you may only build as many ships as population units in one turn."
27. "Looks like something interesting happened! Better check this out. (Taking you off autoplay.)"
28. "Sorry, but someone is already taking over for computer this turn. Wait until next turn."
29. "Sorry, but the game has already begun, and there aren’t any computers to take over for. You can’t join."
30. "Sorry, the game already has the maximum number of players in it. You can’t join."
31. "Sorry, but the game already has the maximum number of humans. You can’t join."
32. "You have no graph history information saved at this time."
33. "Sorry, but someone is already logged into the game with that name."
34. "Sorry, but someone in the game already has that name. Try something else."
35. "Sorry, but another human player must be connected to the game to allow a takeover."
36. "Sorry, but the game is in the process of being updated to the next turn. Try again in a minute."
37. "Sorry, but this game file is missing some information. It can't be opened."
38. "Sorry, but the game is currently in the turn update stage. You will join the game next turn."
39. "Sorry, but this was created with an older version of Spaceward Ho! 4.0 and can't be read."

### STR# 6190 "Male Computer Names"

1. "Peter"
2. "Joe"
3. "Timmer"
4. "Howard"
5. "Bob"
6. "Ed"
7. "Mark"
8. "Guy"
9. "Ben"
10. "Dan"
11. "Kon"
12. "Robert"
13. "Clinton"
14. "Mike"
15. "Dave"
16. "Steve"
17. "Rosko"
18. "Willy"
19. "Jack"
20. "Albert"

### STR# 6200 "Female Computer Names"

1. "Christie"
2. "Suzy"
3. "Ann"
4. "Julia"
5. "Nancy"
6. "Xena"
7. "Athena"
8. "Heather"
9. "Caryl"
10. "Jennifer"
11. "Kathy"
12. "Kate"
13. "Jane"
14. "Paula"
15. "Michelle"
16. "Iris"
17. "Pam"
18. "Liz"
19. "Alexis"
20. "Grace"

### STR# 6210 "Scout Names"

1. "Needle"
2. "Explorer"
3. "Looker"
4. "Columbus"
5. "Magellan"
6. "Intrepid"
7. "Wanderer"
8. "Rudolph"
9. "Eagle"
10. "Sparrow"
11. "Ranger"
12. "Whisper"
13. "Weasel"
14. "Enterprise"
15. "De Gama"

### STR# 6211 "Death Star Names"

1. "Big Surprise"
2. "HelliMoon"
3. "Mass Murder"
4. "Watch Out!"
5. "Terror"
6. "Godzilla"
7. "Mammoth"
8. "Tyrannosaurus"
9. "Galactus"
10. "Hercules"
11. "Monster X"
12. "Nightmare"
13. "Brontosaurus"
14. "Destructor"
15. "Annihilator"

### STR# 6212 "Fighter Names"

1. "Reliant"
2. "Demon"
3. "Hurricane"
4. "Typhoon"
5. "Slasher"
6. "Patton"
7. "Stingray"
8. "Blaster"
9. "Talon"
10. "Serpent"
11. "Dragon"
12. "Tornado"
13. "Wraith"
14. "Storm"
15. "Dagger"

### STR# 6213 "Tanker Names"

1. "Chevron"
2. "Union 76"
3. "Shell"
4. "Exxon"
5. "Texaco"
6. "Arco"
7. "Mobil"
8. "BP"
9. "Apollo Oil"
10. "Diesel"
11. "Rotten Robbie"
12. "Full Serve"
13. "Valdez"
14. "Premium"
15. "Unleaded"

### STR# 6214 "Colony Ship Names"

1. "Spreader"
2. "Mother"
3. "Expander"
4. "Nina"
5. "Pinta"
6. "Santa Maria"
7. "Stork"
8. "Freedom"
9. "People Mover"
10. "Discover"
11. "Taurus"
12. "Minerva"
13. "Egg"
14. "Peaceful"
15. "Hardy"

### STR# 6215 "Satellite Names"

1. "Defender"
2. "Stopper"
3. "Protector"
4. "Eye"
5. "Armor"
6. "Shield"
7. "Peach"
8. "Washington"
9. "Gabriel"
10. "Sun Dog"
11. "Mercy"
12. "Vision"
13. "Pebble"
14. "Rock"
15. "Stone"

### STR# 6216 "Biological Names"

1. "Medusa"
2. "Slither"
3. "Snake"
4. "Gobbler"
5. "Digester"
6. "Big Stomach"
7. "Breakfast"
8. "Lunch"
9. "Dinner"
10. "Midnight Snack"
11. "Rust Monster"
12. "Gelatinous Cube"
13. "Compost Pile"
14. "Disposal"
15. "Trash Compactor"

### STR# 6220 "Message Verbs"

1. "I Want"
2. "You Take"
3. "I Like"
4. "I Don’t Like"
5. "I Own"
6. "I Need Money"
7. "I Need Metal"
8. "Let’s Attack"
9. "Thank You"
10. "Sorry"
11. "#!$@*$&@•™!"
12. "My Stats"
13. "I Saw"
14. "Star Stats"
15. "Text Msg."

### STR# 6230 "Message Descriptor Types"

1. "Planet"
2. "Player"

### STR# 6240 "Message Control Strings"

1. "Send Message To Who?"
2. "Saying What?"
3. "Which Star?"
4. "When?"
5. "Who?"
6. "Where?"

### STR# 6250 "Help Messages (last ones demo only)"

1. "Click here to make this message go away. Click on the clock to end your turn."
2. "Click and Drag from one star to another to move fleets."
3. "Play with the spending bars. Conquer the galaxy. Enjoy."
4. "Ships with higher Speed Tech shoot first."
5. "A dot by a planet means you have ships in orbit there."
6. "Good planets look “prettier” than bad planets when you explore them."
7. "Range is how far your ships can reach."
8. "Satellites can't move, but they shoot just as well as any other ship."
9. "There's a limited amount of metal in the game."
10. "Miniaturization makes ships cost more money, but less metal."
11. "Radical Tech can have a variety of effects."
12. "Be careful with your metal--it can easily run out."
13. "Click and hold for a second to cancel a fleet's movement."
14. "Build Satellites to protect vulnerable planets."
15. "Colonize good planets with Colony ships."
16. "Scout ships have higher Range, but lower Weapons and Shields."
17. "If your Weapons are higher than the opponent's Shields, you'll do lots of damage."
18. "If your Shields are higher than the opponents Weapons, he'll barely hurt you."
19. "Lots of ships can make up for having low Technology."
20. "You get money every turn."
21. "Good planets are close to 1.0 G."
22. "Good planets are close to 72 degrees."
23. "Each player has a different idea of what a good planet is."
24. "If a planet is over 2.5 G or below 0.4 G, it will never make a profit."
25. "Abandon bad planets after you strip-mine them."
26. "Terraforming improves a planet's temperature."
27. "Mining takes metal from a planet and puts it into your reserve."
28. "Ship savings puts money away for shipbuilding."
29. "Savings generates extra income."
30. "If you go into debt, part of your income goes to pay interest."
31. "Order the real version of Spaceward Ho! from Delta Tao at 800-827-9316."
32. "The real version of Spaceward Ho! can handle alliances."
33. "The real version of Spaceward Ho! has supernovas."
34. "Your Technology levels are limited only in the demo version."
35. "The real version of Spaceward Ho! has an Armageddon feature."
36. "Don't spend money on a Technology if you've reached its limits for the Demo version."
37. "The real version of Spaceward Ho! doesn't have Technology limits."
38. "The real version of Spaceward Ho! has more and better graphics."
39. "The real version of Spaceward Ho! can handle up to 20 players."
40. "The real version of Spaceward Ho! has configurable galaxies and opponents."

### STR# 6260 "Radical Tech Strings"

1. "Search for more metal on your planets"
2. "Explore distant stars"
3. "Get lots of money immediately"
4. "Improve mining efficiency"
5. "Improve population maximums"
6. "Improve terraforming efficiency"
7. "Educate battle generals better"
8. "Improve recycling program"
9. "Build a decoy ship"
10. "Build a biological space monster"
11. "Steal technology from another player"
12. "Build a set of ships without development cost"
13. "Improve range tech dramatically"
14. "Improve speed tech dramatically"
15. "Improve weapons tech dramatically"
16. "Improve shields tech dramatically"
17. "Improve mini tech dramatically"

### STR# 6270 "Range Tech Strings"

1. "1"
2. "2"
3. "3"
4. "4"
5. "5"
6. "6"
7. "Topping off the Tanks"
8. "Fusion Pile"
9. "Magneto-Hydrodynamic Power"
10. "Allotropic Iron"
11. "Gravitic Battery"
12. "Quantum Energy Storage"
13. "Singularity"
14. "Plasma Siphon"
15. "Muon Ladder"
16. "There and Back"
17. "Quark Grinder"
18. "Pulsar Radiant"
19. "Anti-Matter"
20. "Star Harness"

### STR# 6271 "Speed Tech Strings"

1. "1"
2. "Solar Sail"
3. "Ion Rocket"
4. "Gravitic Slingshot"
5. "Fusion Dump Drive"
6. "Relativity Drive"
7. "Trans-Light"
8. "Hyperspace"
9. "Rift Drive"
10. "Hawking Propulsion System"
11. "Hyper-Rift Drive"
12. "PowerPC™"
13. "Trans-Rift Hyper Drive"
14. "Hawking Trans-Hyper Drive"
15. "Time Distortion"
16. "Quantum Continuum"
17. "Already There"
18. "Speedy Gonzalez™"
19. "Teleportation"
20. "Yesterday Drive"

### STR# 6272 "Weapons Tech Strings"

1. "1"
2. "2"
3. "Mass Driver Cannon"
4. "Laser 20"
5. "Turbolaser"
6. "Maser"
7. "Gamma-Ray Laser"
8. "Spectrum Cannon"
9. "Energy Ball"
10. "Nuclear Magnetic Resonance"
11. "Phase Disruption"
12. "Focused Quark Beam"
13. "Hard Pixel"
14. "Tachyon Cannon"
15. "+5 Rustproof Vorpal"
16. "Hyperspace Pulse"
17. "Delta Particle Stream"
18. "Neutron Compression"
19. "Nova Cannon"
20. "Galactic Disruption"
21. "Advanced Space-Time Annihilation"

### STR# 6273 "Shield Tech Strings"

1. "1"
2. "2"
3. "Armored Hull"
4. "Mass Repulser"
5. "Energy Dispersion"
6. "Deflector"
7. "Energy Bonded Armor"
8. "Anti-Energy"
9. "Quark Shell"
10. "Delta Wave"
11. "Energy Injestor"
12. "Refractor Field"
13. "Holographic Decoy"
14. "Stasis Flicker"
15. "Conversion Field"
16. "Tao Wave"
17. "Gluon Armor"
18. "Hide behind a big rock"
19. "+5 Blessed Plate Mail"
20. "Displacer Field"

### STR# 6274 "Mini Tech Strings"

1. "Integrated Circuit"
2. "Integrated Chip"
3. "Large Scale Integration"
4. "VLSI"
5. "Wonkavision"
6. "Ultra-microscopic"
7. "Nanoscopic"
8. "Advanced Nanoscopic"
9. "Really Amazingly Small"
10. "Yellow Polka Dot Bikini"
11. "Sub-Atomic"
12. "Partial Lepton"
13. "Quark"
14. "Sub-Quark"
15. "Micro-Quark"
16. "Nano-Quark"
17. "Advanced Nano-Quark"
18. "Bikini Again (Thought it was funny)"
19. "Quantum Superstring"
20. "Sub-Quantum Superstring"

### STR# 6280 "Master Point Levels"

1. "Red-neck"
2. "Bow-legs"
3. "Cowpoke"
4. "Deputy"
5. "Gunfighter"
6. "Town Sheriff"
7. "Federal Marshall"
8. "Lone Ranger"
9. "QuickDraw™ McGraw"
10. "Best in the West"
11. "Ho! Champion"

### STR# 6300 "Ho! Server Strings"

1. "Save game file as:"
2. "Milky Way"
3. "Everyone's Ready"
4. "I'm Playing Alone"
5. "Current Game: %.*s"
6. "Current Player: %.*s"
7. "No current player"
8. "Game is in year: %d"
9. "The game is waiting to start. Humans: %d"
10. "You will be taking over for a computer player next turn"
11. "No game is currently open."
12. "Computer Players: %d"


## Menus (MENU, with their xmnu commands)

Menu bars: MBAR 128: 128, 129, 130, 131, 132, 133, 134.

- MENU 128 "\x14" 
  - "About Spaceward Ho! 4.0…"
  - "-"
- MENU 129 "File" 
  - "New Game…" (cmd-N)
  - "Open Game…" (cmd-O)
  - "Begin Game" (cmd-B)
  - "-"
  - "Close Game" (cmd-W)
  - "Save Game" (cmd-S)
  - "-"
  - "End Turn" (cmd-T)
  - "End Turn and Switch Players" (cmd- )
  - "-"
  - "Page Setup…"
  - "Print…" (cmd-P)
  - "-"
  - "Quit" (cmd-Q)
- MENU 130 "Edit" 
  - "Undo" (cmd-Z)
  - "-"
  - "Cut" (cmd-X)
  - "Copy" (cmd-C)
  - "Paste" (cmd-V)
  - "Clear"
- MENU 131 "Options" 
  - "Auto Play…"
  - "-"
  - "Sound"
  - "-"
  - "Master Point List…"
  - "Hall of Fame…"
  - "Hall of Shame…"
  - "-"
  - "Preferences…"
- MENU 132 "Ships" 
  - "<build/design>" (cmd-B)
  - "-"
  - "List All Fleets…" (cmd-L)
  - "Organize <type>…" (cmd-G)
  - "Scrap Current Fleet"
  - "-"
  - "Review Battle at <star>…" (cmd-R)
- MENU 133 "Galaxy" 
  - "Compare Players…" (cmd-Y)
  - "Graph History…" (cmd-H)
  - "Statistics…"
  - "List All Explored Stars…"
  - "-"
  - "Dip Into Savings…" (cmd-D)
  - "Abandon Planet…" (cmd-A)
  - "-"
  - "Alliances…"
  - "Give Money/Metal…"
  - "Surrender To…"
  - "Send Message…" (cmd-M)
  - "-"
  - "Armageddon"
- MENU 134 "Window" 
  - "Tech Spending Window" (cmd-1)
  - "Report Window" (cmd-2)
  - "Chat Window" (cmd-3)
  - "-"
  - "Zoom In" (cmd-=)
  - "Zoom Out" (cmd--)
  - "Hide Information" (cmd-I)
  - "-"
  - "Clean Up Windows"
- MENU 6015 "\x00" (Class Menu)
  - "Scout"
  - "Dreadnought"
  - "Fighter"
  - "Tanker"
  - "Colony Ship"
  - "Satellite"
  - "Biological" (disabled)
- MENU 6030 "\x00" 
  - "Ship Power"
  - "Ship Class"
- MENU 6040 "\x00" 
  - "Metal"
  - "Quality"
  - "Gravity"
  - "Owner"
- MENU 6050 "\x00" (Time Limit)
  - "No Time Limit"
  - "Fast (30/120)"
  - "Medium (60/180)"
  - "Slow (90/180)"
- MENU 6060 "\x00" (Years Per Turn)
  - "10"
  - "20"
  - "30"
  - "50"


## Windows 95: SPACEHO.EXE

```
dialog 100 "About Spaceho" (34, 22, 217, 55) font MS Sans Serif 8
  65535 icon           '#2'                                     (11, 17, 20, 20)
  65535 STATIC         'Spaceho Application Version 1.0'        (40, 10, 119, 8)
  65535 STATIC         'Copyright © 1994'                       (40, 25, 119, 8)
      1 default push   'OK'                                     (176, 6, 32, 14)
dialog 102 "Tech Spending" (0, 0, 156, 55) font MS Sans Serif 7
   1000 group box      ''                                       (0, 0, 156, 54)
   1211 push           'Dummy 1'                                (23, 24, 50, 14)
   1212 push           'Dummy 2'                                (82, 25, 50, 14)
dialog 104 "" (0, 0, 86, 151) font MS Sans Serif 7
   1001 push           'Sort'                                   (4, 1, 20, 11)
   1004 group box      ''                                       (1, 6, 75, 145)
   1005 scroll bar (vertical) ''                                       (76, 15, 10, 136)
dialog 108 "" (0, 0, 210, 257) font MS Sans Serif 8
   1007 group box      ''                                       (4, 0, 201, 150)
  65535 STATIC         'Written by Peter Commons\nArt by Howard Wives and Bob Van de Walle\nSounds by Mark Madeley and Guy Vardaman\nWindows programming by Paul Toth\nCopyright 1991-1996 by Delta Tao Software, Inc.\n760 Harvard Avenue Sunnyvale, CA 94087 \n \n \n \n\n(408) 730-9336' (3, 154, 157, 49)
   1173 STATIC         ''                                       (4, 226, 195, 31)
   1174 STATIC         ''                                       (152, 155, 47, 32)
dialog 111 "" (0, 0, 333, 218) font MS Sans Serif 8
      1 push           'Create'                                 (264, 196, 50, 14)
      2 push           'Cancel'                                 (208, 196, 50, 14)
   1012 scroll bar (horizontal) ''                                       (177, 123, 108, 11)
   1013 COMBOBOX       ''                                       (232, 141, 78, 75)
   1014 COMBOBOX       ''                                       (232, 160, 45, 57)
   1015 auto check box ''                                       (12, 141, 8, 8)
   1203 auto check box ''                                       (12, 160, 9, 8)
   1204 auto check box ''                                       (12, 177, 8, 8)
dialog 176 "" (0, 0, 343, 200) font MS Sans Serif 8
      1 default push   'OK'                                     (242, 180, 50, 14)
   1016 LISTBOX        ''                                       (5, 7, 121, 168)
   1020 owner-drawn    ''                                       (149, 5, 65, 24)
   1021 EDIT           ''                                       (144, 31, 75, 13)
   1022 COMBOBOX       ''                                       (139, 48, 85, 87)
  65535 STATIC         'Dev. Cost:'                             (138, 65, 33, 8)
  65535 STATIC         'Pro. Cost:'                             (138, 74, 34, 8)
  65535 STATIC         'Metal Cost:'                            (138, 83, 35, 8)
   1026 STATIC         ''                                       (177, 66, 45, 8)
   1027 STATIC         ''                                       (177, 75, 45, 8)
   1028 STATIC         ''                                       (177, 83, 45, 8)
  65535 STATIC         'Range'                                  (135, 101, 30, 8)
  65535 STATIC         'Speed'                                  (135, 117, 30, 8)
  65535 STATIC         'Weapons'                                (135, 132, 33, 8)
  65535 STATIC         'Shields'                                (135, 147, 30, 8)
  65535 STATIC         'Mini'                                   (135, 162, 30, 8)
   1029 STATIC         ''                                       (169, 102, 28, 8)
   1030 STATIC         ''                                       (169, 117, 28, 8)
   1031 STATIC         ''                                       (169, 132, 28, 8)
   1032 STATIC         ''                                       (169, 147, 28, 8)
   1033 STATIC         ''                                       (169, 161, 28, 8)
   1018 push           'Scap All'                               (23, 180, 50, 14)
   1017 push           'Max Out'                                (87, 180, 50, 14)
      2 push           'Cancel'                                 (180, 180, 50, 14)
   1034 scroll bar (horizontal) ''                                       (199, 100, 50, 11)
   1035 scroll bar (horizontal) ''                                       (199, 115, 50, 11)
   1036 scroll bar (horizontal) ''                                       (199, 130, 50, 11)
   1037 scroll bar (horizontal) ''                                       (199, 145, 50, 11)
   1038 scroll bar (horizontal) ''                                       (199, 160, 50, 11)
  65535 STATIC         'Savings:'                               (244, 6, 30, 8)
   1039 STATIC         ''                                       (244, 18, 50, 8)
  65535 STATIC         'Metal:'                                 (244, 40, 24, 8)
   1040 STATIC         ''                                       (244, 52, 50, 8)
  65535 STATIC         'Built:'                                 (244, 75, 18, 8)
  65535 STATIC         'In Service:'                            (244, 88, 34, 8)
   1041 STATIC         ''                                       (263, 75, 27, 8)
   1042 STATIC         ''                                       (280, 88, 35, 8)
  65535 STATIC         '# To Build:'                            (258, 116, 35, 8)
   1043 EDIT           ''                                       (295, 114, 20, 13)
   1045 push           '+'                                      (318, 107, 12, 12)
   1046 push           '-'                                      (318, 122, 12, 12)
   1047 STATIC         ''                                       (291, 6, 40, 32)
   1048 STATIC         ''                                       (291, 40, 40, 32)
   1205 push           'Build and Continue'                     (265, 156, 68, 14)
dialog 315 "" (0, 0, 231, 251) font MS Sans Serif 8
      2 default push   'Quit'                                   (151, 230, 50, 14)
   1049 push           'New Game'                               (90, 230, 50, 14)
   1050 push           'Open Game'                              (29, 230, 50, 14)
   1051 STATIC         ''                                       (0, 1, 231, 149)
   1174 STATIC         ''                                       (159, 152, 47, 32)
  65535 STATIC         'Written by Peter Commons\nArt by Howard Vives and Bob Van de Walle\nSounds by Mark Madeley and Guy Vardaman\nWindows programming by Paul Toth\nCopyright 1991-1996 by Delta Tao Software, Inc.\n760 Harvard Avenue Sunnyvale, CA 94087 \n \n \n \n\n(408) 730-9' (4, 154, 156, 50)
dialog 317 "" (0, 0, 174, 114) font MS Sans Serif 8
      1 default push   'OK'                                     (131, 93, 32, 14)
      2 push           'Cancel'                                 (87, 93, 35, 14)
  65535 STATIC         'Please Identify Yourself:'              (77, 7, 75, 8)
  65535 STATIC         'Player Name:'                           (77, 21, 52, 8)
   1052 EDIT           ''                                       (75, 36, 71, 13)
  65535 STATIC         'Player Password:'                       (77, 55, 54, 8)
   1053 EDIT           ''                                       (75, 69, 71, 13)
   1159 STATIC         ''                                       (5, 25, 64, 64)
dialog 318 "" (0, 0, 178, 135) font MS Sans Serif 8
      1 default push   'Join'                                   (103, 113, 50, 14)
      2 push           'Cancel'                                 (36, 113, 50, 14)
  65535 STATIC         'Skill Level:'                           (69, 34, 37, 8)
   1055 auto radio     'Novice'                                 (76, 46, 35, 10)
   1056 auto radio     'Beginner'                               (76, 58, 40, 10)
   1057 auto radio     'Normal'                                 (76, 70, 35, 10)
   1058 auto radio     'Advanced'                               (76, 82, 50, 10)
   1059 auto radio     'Expert'                                 (76, 94, 35, 10)
  65535 STATIC         'Sex:'                                   (129, 34, 19, 8)
   1060 auto radio     'Male'                                   (130, 45, 35, 10)
   1061 auto radio     'Female'                                 (130, 57, 35, 10)
   1062 STATIC         'Name'                                   (51, 6, 75, 8)
   1063 STATIC         'Password'                               (51, 19, 77, 8)
  65535 STATIC         'Your Name:'                             (8, 6, 40, 8)
  65535 STATIC         'Password:'                              (8, 19, 34, 8)
   1051 STATIC         ''                                       (6, 46, 58, 53)
dialog 346 "" (0, 0, 330, 272) font MS Sans Serif 8
      1 default push   'Skip'                                   (145, 253, 39, 14) hidden
   1064 STATIC         ''                                       (4, 4, 325, 242) hidden
dialog 347 "" (0, 0, 320, 214) font Arial 8
      1 default push   'OK'                                     (270, 190, 40, 14)
      2 push           'Cancel'                                 (220, 190, 40, 14)
   1065 STATIC         ''                                       (24, 31, 274, 151)
   1066 push           'Group All'                              (62, 190, 40, 14)
   1067 push           'Split All'                              (116, 190, 40, 14)
   1068 push           'Divide All'                             (169, 190, 40, 14)
   1069 push           'Next Type'                              (12, 190, 40, 14)
  65535 STATIC         'To Organize Fleets:'                    (8, 0, 66, 8)
  65535 STATIC         '•  Click and drag fleets into desired number of piles' (11, 9, 170, 8)
  65535 STATIC         '•  Shift-Click selects an entire pile'  (11, 18, 173, 8)
dialog 348 "" (0, 0, 253, 145) font MS Sans Serif 8
      1 default push   'OK'                                     (179, 122, 50, 14)
   1080 STATIC         'You can cancel one research program:'   (4, 5, 126, 8)
   1070 STATIC         ''                                       (7, 24, 16, 16)
   1071 STATIC         ''                                       (7, 48, 16, 16)
   1072 STATIC         ''                                       (7, 72, 16, 16)
   1073 STATIC         ''                                       (7, 96, 16, 16)
   1076 STATIC         ''                                       (43, 29, 197, 8)
   1077 STATIC         ''                                       (43, 53, 202, 8)
   1078 STATIC         ''                                       (43, 77, 200, 8)
   1079 STATIC         ''                                       (43, 101, 202, 8)
dialog 349 "" (0, 0, 270, 145) font MS Sans Serif 8
      1 default push   'OK'                                     (200, 119, 40, 14)
   1081 STATIC         ''                                       (5, 6, 126, 71)
  65535 STATIC         'Gravity:'                               (8, 83, 30, 8)
  65535 STATIC         'Temperature:'                           (8, 95, 45, 8)
  65535 STATIC         'Metal:'                                 (8, 106, 30, 8)
  65535 STATIC         'Owner:'                                 (8, 118, 30, 8)
  65535 STATIC         'Planet Info For:'                       (140, 9, 53, 8)
  65535 STATIC         'Info Date:'                             (140, 20, 50, 8)
  65535 STATIC         'Population:'                            (140, 32, 38, 8)
  65535 STATIC         'Battle Date:'                           (140, 43, 40, 8)
  65535 STATIC         'Ships Built This'                       (140, 54, 56, 8)
  65535 STATIC         'Turn:'                                  (140, 62, 30, 8)
  65535 STATIC         'Income:'                                (141, 74, 30, 8)
   1082 STATIC         ''                                       (56, 83, 46, 8)
   1083 STATIC         ''                                       (56, 95, 46, 8)
   1084 STATIC         ''                                       (56, 105, 45, 8)
   1085 STATIC         ''                                       (56, 118, 63, 8)
   1086 STATIC         ''                                       (200, 9, 50, 8)
   1087 STATIC         ''                                       (200, 20, 62, 8)
   1088 STATIC         ''                                       (200, 32, 50, 8)
   1089 STATIC         ''                                       (200, 43, 50, 8)
   1090 STATIC         ''                                       (200, 59, 50, 8)
   1091 STATIC         ''                                       (200, 74, 49, 8)
dialog 350 "" (0, 0, 267, 224) font MS Sans Serif 8
   1102 EDIT           ''                                       (167, 80, 74, 13)
      1 default push   'OK'                                     (199, 198, 50, 14)
      2 push           'Cancel'                                 (142, 198, 50, 14)
  65535 STATIC         'Preferences'                            (98, 5, 40, 8)
  65535 STATIC         'After Every Turn Update:'               (5, 24, 80, 8)
   1092 auto check box 'Automatically Sort Planet List'         (9, 35, 107, 10)
   1093 auto check box 'Show Event Messages'                    (9, 48, 86, 10)
   1094 auto check box 'But Only The Most Important Ones'       (15, 63, 124, 10)
   1095 auto check box 'Review Event Battles'                   (15, 78, 87, 10)
   1096 auto check box 'Give Helpful Game Play Hints'           (9, 93, 115, 10)
  65535 STATIC         'When Reviewing Battles:'                (5, 115, 96, 8)
  65535 STATIC         'Battle Speed:  Fast'                    (10, 129, 61, 8)
   1103 scroll bar (horizontal) ''                                       (84, 127, 82, 11)
  65535 STATIC         'Slow'                                   (179, 129, 16, 8)
   1097 auto check box 'Fully Animated Battles'                 (10, 144, 81, 10)
   1098 auto check box 'Groups Shoot Together'                  (107, 144, 97, 10)
  65535 STATIC         'When Checking To See If All Players Have Ended Their Turn:' (6, 163, 219, 8)
  65535 STATIC         'Polling Time:  Fast'                    (12, 177, 59, 8)
   1104 scroll bar (horizontal) ''                                       (86, 175, 84, 11)
  65535 STATIC         'Slow'                                   (180, 176, 17, 8)
   1099 STATIC         '1'                                      (203, 176, 8, 8)
  65535 STATIC         'Seconds'                                (219, 176, 30, 8)
  65535 STATIC         'On The Star Map:'                       (162, 22, 84, 8)
   1100 auto check box 'Show Fleet Paths'                       (167, 33, 73, 10)
   1101 auto check box 'Temp. in Celsius (not °F)'              (167, 48, 92, 10)
  65535 STATIC         'Your Password:'                         (161, 69, 52, 8)
dialog 351 "Report Messages" (0, 0, 157, 55) font MS Sans Serif 8
dialog 352 "" (0, 0, 343, 218) font MS Sans Serif 8
      1 default push   'OK'                                     (259, 196, 50, 14)
      2 push           'Show Skills'                            (197, 196, 50, 14)
   1106 STATIC         ''                                       (5, 4, 195, 8)
   1107 STATIC         ''                                       (6, 15, 329, 175)
dialog 353 "" (0, 0, 304, 176) font MS Sans Serif 8
      1 default push   'OK'                                     (253, 157, 38, 14)
  65535 STATIC         'List of all players and their skill levels:' (4, 5, 133, 8)
   1108 LISTBOX        ''                                       (4, 15, 290, 138)
   1110 STATIC         ''                                       (75, 160, 78, 8)
  65535 STATIC         'Computer Intelligence:'                 (3, 160, 69, 8)
dialog 354 "" (0, 0, 381, 197) font MS Sans Serif 8
      1 default push   'OK'                                     (353, 164, 24, 14)
  65535 STATIC         'Select an icon to see recent recorded history:' (4, 3, 147, 8)
   1111 STATIC         ''                                       (7, 151, 33, 30)
   1084 STATIC         ''                                       (41, 151, 33, 30)
   1112 STATIC         ''                                       (75, 151, 33, 30)
   1113 STATIC         ''                                       (109, 151, 33, 30)
   1088 STATIC         ''                                       (143, 151, 33, 30)
   1114 STATIC         ''                                       (177, 151, 33, 30)
   1115 STATIC         ''                                       (211, 151, 33, 30)
   1116 STATIC         ''                                       (245, 151, 33, 30)
   1117 STATIC         ''                                       (279, 151, 33, 30)
   1118 STATIC         ''                                       (313, 151, 33, 30)
   1119 STATIC         ''                                       (5, 18, 363, 126)
dialog 355 "" (0, 0, 185, 113) font MS Sans Serif 8
      1 default push   'OK'                                     (102, 94, 39, 14)
  65535 STATIC         'Cumulative Statistics:'                 (2, 3, 74, 8)
  65535 STATIC         'Total Population Gained:'               (7, 16, 78, 8)
  65535 STATIC         'Total Population Killed:'               (7, 29, 77, 8)
  65535 STATIC         'Enemy Population Killed:'               (8, 41, 83, 8)
  65535 STATIC         'Total # of Ships Built:'                (8, 54, 70, 8)
  65535 STATIC         'Total # of Ships Destroyed:'            (8, 67, 96, 8)
  65535 STATIC         'Total # of Enemy Ships'                 (8, 80, 78, 8)
  65535 STATIC         'Destroyed:'                             (8, 90, 36, 8)
   1120 STATIC         ''                                       (102, 16, 60, 8)
   1121 STATIC         ''                                       (102, 29, 65, 8)
   1122 STATIC         ''                                       (102, 41, 65, 8)
   1123 STATIC         ''                                       (102, 54, 66, 8)
   1124 STATIC         ''                                       (102, 67, 66, 8)
   1125 STATIC         ''                                       (102, 80, 64, 8)
dialog 356 "" (0, 0, 277, 217) font MS Sans Serif 8
   1129 group box      ''                                       (0, 0, 277, 217)
      2 push           'OK'                                     (204, 180, 50, 14)
  65535 STATIC         'List of All Explored Stars:'            (16, 11, 81, 8)
   1131 LISTBOX        ''                                       (16, 24, 248, 152)
  65535 STATIC         'Sort By:'                               (9, 182, 26, 8)
   1132 COMBOBOX       ''                                       (35, 180, 65, 45)
      1 push           'Go To Star'                             (122, 180, 61, 14)
dialog 358 "" (0, 0, 113, 105) font MS Sans Serif 8
      1 default push   'OK'                                     (61, 85, 40, 14)
      2 push           'Cancel'                                 (15, 85, 40, 14)
   1134 group box      ''                                       (0, 0, 113, 105)
   1135 STATIC         ''                                       (5, 12, 103, 47)
   1136 EDIT           ''                                       (11, 66, 60, 13)
dialog 360 "" (0, 0, 171, 123) font MS Sans Serif 8
      1 default push   'OK'                                     (131, 100, 31, 14)
      2 push           'Cancel'                                 (91, 100, 35, 14)
   1137 group box      ''                                       (0, 0, 171, 122)
   1138 STATIC         ''                                       (10, 10, 70, 59)
   1106 STATIC         ''                                       (62, 9, 96, 84)
dialog 361 "" (0, 0, 345, 224) font MS Sans Serif 8
      1 default push   'OK'                                     (282, 203, 37, 14)
      2 push           'Cancel'                                 (236, 203, 37, 14)
  65535 STATIC         "Click on a player's icon to move it horizontally to specify whether you would or would not like to ally with that player. Their icon represents what their current opinion of you is." (7, 7, 190, 26)
   1140 group box      ''                                       (0, 1, 345, 223)
   1141 LISTBOX        ''                                       (5, 49, 105, 145)
   1142 LISTBOX        ''                                       (118, 49, 106, 145)
   1143 LISTBOX        ''                                       (231, 49, 106, 145)
  65535 STATIC         'I Really Like Them'                     (10, 39, 58, 8)
  65535 STATIC         'I Like Them'                            (126, 38, 43, 8)
  65535 STATIC         "I Don't Like Them"                      (238, 39, 54, 8)
dialog 362 "" (0, 0, 306, 192) font MS Sans Serif 8
      1 default push   'Give'                                   (235, 172, 41, 14)
      2 push           'Cancel'                                 (235, 154, 41, 14)
  65535 STATIC         'Give Stuff To:'                         (11, 4, 43, 8)
  65535 STATIC         'Give How Much Money?'                   (213, 94, 85, 8)
   1145 EDIT           ''                                       (215, 105, 54, 13)
  65535 STATIC         'Give How Much Metal?'                   (213, 127, 87, 8)
   1146 EDIT           ''                                       (215, 137, 55, 13)
   1148 group box      ''                                       (9, 15, 201, 172)
dialog 363 "" (0, 0, 275, 191) font MS Sans Serif 8
      1 default push   'OK'                                     (227, 166, 38, 14)
      2 push           'Cancel'                                 (227, 145, 38, 14)
   1148 group box      ''                                       (7, 12, 216, 169)
  65535 STATIC         'Surrender To:'                          (6, 3, 65, 8)
dialog 364 "" (0, 0, 158, 114) font MS Sans Serif 8
      1 default push   'Really'                                 (112, 92, 36, 14)
      2 push           'Cancel'                                 (72, 92, 35, 14)
   1149 STATIC         'Do you really, REALLY want to surrender?' (13, 6, 85, 26)
dialog 365 "" (0, 0, 321, 236) font MS Sans Serif 8
      1 default push   'Done'                                   (197, 211, 44, 14)
   1150 push           'Send'                                   (123, 211, 48, 14)
   1151 push           'Erase'                                  (47, 211, 50, 14)
  65535 STATIC         'Send Message'                           (16, 3, 51, 8)
   1156 STATIC         ''                                       (76, 4, 91, 8)
  65535 STATIC         'To:'                                    (19, 18, 15, 8)
  65535 STATIC         'Content:'                               (6, 39, 26, 8)
   1148 group box      ''                                       (79, 13, 232, 162)
   1154 group box      ''                                       (35, 13, 40, 162)
   1157 STATIC         'MessageText:'                           (63, 183, 92, 8)
   1158 EDIT           ''                                       (63, 193, 113, 13)
dialog 369 "" (0, 0, 119, 128) font MS Sans Serif 8
      1 default push   'OK'                                     (34, 105, 50, 14)
  65535 STATIC         'Congratulations!  You have conquered the galaxy!1' (20, 11, 85, 18)
   1159 STATIC         ''                                       (37, 30, 32, 32)
dialog 376 "" (0, 0, 219, 100) font MS Sans Serif 8
      1 push           'OK'                                     (151, 79, 60, 14)
      2 push           'Cancel'                                 (83, 79, 60, 14)
   1106 STATIC         ''                                       (7, 3, 202, 38)
   1138 STATIC         ''                                       (7, 46, 72, 50)
dialog 377 "" (0, 0, 128, 129) font MS Sans Serif 8
      1 default push   'OK'                                     (39, 107, 50, 14)
   1161 STATIC         'Congratulations!  You have conquered the galaxy!' (25, 9, 91, 29)
   1160 STATIC         ''                                       (31, 34, 64, 64)
dialog 378 "" (0, 0, 182, 134) font MS Sans Serif 8
   1162 EDIT           ''                                       (86, 84, 78, 13)
      1 default push   'OK'                                     (111, 116, 50, 14)
  65535 STATIC         'You won the game, so you get to name a star.\n\nStar names must be 2 to 7 characters long.\n\nIf you\'d rather not name a star, click "OK" with the name blank.' (6, 6, 167, 55)
   1159 STATIC         ''                                       (9, 61, 64, 64)
  65535 STATIC         'New Star Name:'                         (88, 71, 58, 8)
dialog 379 "" (0, 0, 242, 146) font MS Sans Serif 8
      1 default push   'OK'                                     (160, 124, 50, 14)
  65535 STATIC         'Auto Play Options:'                     (12, 8, 65, 8)
   1163 auto radio     'Have Computer play for me.'             (18, 22, 135, 10)
   1164 auto radio     'Just mark me done every turn.'          (18, 35, 121, 10)
   1165 auto radio     'Mark me done until something interesting happens.' (18, 48, 181, 10)
   1166 auto radio     "I'll play my own turns, thank you."     (18, 61, 148, 10)
  65535 STATIC         'Under auto play, event messages disappear after:' (17, 84, 171, 8)
  65535 STATIC         'seconds'                                (28, 99, 29, 8)
   1167 scroll bar (horizontal) ''                                       (61, 98, 108, 11)
   1168 push           'Config...'                              (176, 23, 50, 14)
   1170 STATIC         ''                                       (9, 99, 17, 8)
dialog 380 "" (0, 0, 220, 102) font MS Sans Serif 8
      1 default push   'OK'                                     (163, 80, 50, 14)
      2 push           'Cancel'                                 (103, 80, 50, 14)
  65535 STATIC         "Configure Computer's Auto Play Style:"  (12, 12, 128, 8)
   1171 scroll bar (horizontal) ''                                       (58, 32, 110, 11)
   1172 scroll bar (horizontal) ''                                       (58, 56, 110, 11)
  65535 STATIC         'Friendly'                               (11, 33, 30, 8)
  65535 STATIC         'No Defense'                             (11, 57, 43, 8)
  65535 STATIC         'Aggressive'                             (177, 34, 39, 8)
  65535 STATIC         'Dig In'                                 (177, 57, 30, 8)
dialog 384 "" (0, 0, 339, 233) font MS Sans Serif 8
      1 default push   'OK'                                     (259, 197, 50, 14)
  65535 STATIC         'List of All Fleets:'                    (6, 6, 59, 8)
   1175 LISTBOX        ''                                       (5, 18, 321, 171)
   1176 push           'Go To Fleet'                            (193, 197, 50, 14)
  65535 STATIC         'Sort By:'                               (13, 197, 30, 8)
   1177 COMBOBOX       ''                                       (45, 196, 82, 35)
dialog 386 "" (0, 0, 306, 174) font MS Sans Serif 8
      1 default push   'OK'                                     (243, 152, 50, 14)
   1178 LISTBOX        ''                                       (12, 29, 280, 114)
   1179 push           'Details'                                (13, 150, 50, 14)
   1198 STATIC         'Hall of Fame'                           (14, 2, 52, 8)
   1086 STATIC         'Name'                                   (16, 18, 30, 8)
   1180 STATIC         'When'                                   (104, 19, 30, 8)
   1181 STATIC         'Difficulty'                             (221, 19, 38, 8)
dialog 387 "" (0, 0, 265, 145) font MS Sans Serif 8
      1 default push   'OK'                                     (187, 126, 50, 14)
   1198 STATIC         'Summary of Game Victory'                (9, 6, 96, 8)
   1206 STATIC         'Winner:'                                (53, 24, 30, 8)
  65535 STATIC         'Date:'                                  (51, 33, 30, 8)
  65535 STATIC         'Difficulty:'                            (53, 43, 30, 8)
  65535 STATIC         '# Humans:'                              (47, 53, 37, 8)
  65535 STATIC         '# of Computers:'                        (29, 63, 56, 8)
  65535 STATIC         '# Allies:'                              (51, 73, 32, 8)
  65535 STATIC         'Computer Intelligence:'                 (9, 82, 78, 8)
  65535 STATIC         'Game Date:'                             (15, 92, 68, 8)
  65535 STATIC         'Galaxy Size:'                           (41, 103, 42, 8)
  65535 STATIC         'Player Skill:'                          (25, 113, 58, 8)
  65535 STATIC         'Armageddons:'                           (30, 123, 53, 8)
   1062 STATIC         'Name'                                   (93, 24, 60, 8)
   1182 STATIC         'RealDate'                               (93, 33, 60, 8)
   1183 STATIC         'Bonus'                                  (93, 43, 61, 8)
   1184 STATIC         'Humans'                                 (93, 53, 60, 8)
   1185 STATIC         'Comp'                                   (93, 63, 60, 8)
   1186 STATIC         'Allies'                                 (93, 73, 60, 8)
   1187 STATIC         'Int'                                    (93, 82, 61, 8)
   1188 STATIC         'GameDate'                               (92, 92, 60, 8)
   1189 STATIC         'Size'                                   (93, 103, 60, 8)
   1190 STATIC         'Skill'                                  (93, 113, 60, 8)
   1191 STATIC         'Arms.'                                  (93, 123, 60, 8)
   1193 STATIC         'Density'                                (155, 103, 39, 8)
   1192 STATIC         'Style'                                  (199, 103, 51, 8)
   1194 STATIC         ''                                       (180, 29, 58, 53)
dialog 388 "" (0, 0, 392, 174) font MS Sans Serif 8
      1 default push   'OK'                                     (328, 153, 50, 14)
  65535 STATIC         'Master Points:'                         (9, 6, 75, 8)
   1195 LISTBOX        ''                                       (6, 35, 379, 113)
   1086 STATIC         'Name'                                   (12, 24, 30, 8)
   1196 STATIC         'Points'                                 (148, 23, 30, 8)
   1197 STATIC         'Rank'                                   (284, 23, 30, 8)
   1160 STATIC         ''                                       (355, 5, 24, 24)
dialog 389 "Chat" (0, 0, 168, 73) font MS Sans Serif 8
   1199 EDIT           ''                                       (3, 37, 165, 36)
   1200 EDIT           ''                                       (3, 0, 165, 36)
dialog 390 "" (0, 0, 189, 58) font MS Sans Serif 8
      1 default push   'OK'                                     (125, 37, 50, 14)
      2 push           'No, thanks.'                            (65, 38, 50, 14)
  65535 STATIC         'The game has already started.  Would you like to take over for a computer player?' (5, 6, 165, 26)
dialog 391 "" (0, 0, 178, 54) font MS Sans Serif 8
  65535 STATIC         'Please wait a moment...'                (15, 6, 83, 8)
  65535 STATIC         'You will take over for a computer player after the current turn has been completed!' (18, 20, 137, 25)
dialog 392 "" (0, 0, 167, 33) font MS Sans Serif 8
   1201 STATIC         'Doing Pass 1 for Player 1...'           (6, 4, 136, 8)
   1202 STATIC         ''                                       (6, 19, 142, 10)
dialog 404 "" (0, 0, 181, 63) font MS Sans Serif 8
  65535 STATIC         'Please wait a moment...'                (7, 7, 102, 14)
  65535 STATIC         'You will take over for a computer player after the current turn has been completed.' (7, 24, 167, 33)
dialog 405 "" (0, 0, 163, 84) font MS Sans Serif 8
      1 default push   'OK'                                     (96, 63, 50, 14)
   1208 push           "Don't Save"                             (25, 63, 50, 14)
   1161 STATIC         'Static'                                 (11, 6, 145, 39)
dialog 410 "Dialog" (0, 0, 186, 95) font MS Sans Serif 8
      1 default push   'OK'                                     (129, 7, 50, 14)
      2 push           'Cancel'                                 (129, 24, 50, 14)
dialog 30721 "New" (9, 26, 183, 70) font MS Sans Serif 8
  65535 STATIC         '&New '                                  (6, 5, 123, 8)
    100 LISTBOX        ''                                       (6, 15, 125, 49)
      1 default push   'OK'                                     (137, 6, 40, 14)
      2 push           'Cancel'                                 (137, 23, 40, 14)
  57670 push           '&Help'                                  (137, 43, 40, 14)
dialog 30722 "" (6, 18, 133, 95) font MS Sans Serif 8
  65535 STATIC         'Printing'                               (0, 9, 133, 8)
    201 STATIC         ''                                       (0, 19, 133, 8)
  65535 STATIC         'on the'                                 (0, 29, 133, 8)
    202 STATIC         ''                                       (0, 39, 133, 8)
    203 STATIC         ''                                       (0, 49, 133, 8)
    204 STATIC         ''                                       (0, 59, 133, 8)
      2 push           'Cancel'                                 (46, 74, 40, 14)
dialog 30723 "" (0, 0, 330, 16) font MS Sans Serif 8
  58116 push           '&Print...'                              (2, 2, 44, 12)
  58114 push           '&Next Page'                             (48, 2, 44, 12)
  58115 push           'Pre&v Page'                             (94, 2, 44, 12)
  58113 push           ''                                       (140, 2, 44, 12)
  58117 push           'Zoom &In'                               (186, 2, 44, 12)
  58118 push           'Zoom &Out'                              (232, 2, 44, 12)
  58112 push           '&Close'                                 (278, 2, 44, 12)
menu 2
  &File
    &New Game  Ctrl+N
    &Open Game...  Ctrl+O
    -
    &Save Game  Ctrl+S
    -
    &End Turn  Ctrl+T
    -
    Recent File
    -
    E&xit  Ctrl-Q
  &Edit
    &Undo  Ctrl+Z
    -
    Cu&t  Ctrl+X
    &Copy  Ctrl+C
    &Paste  Ctrl+V
  &Options
    &Auto Play...
    -
    &Sound
    -
    &Master Point List...
    &Hall of Fame...
    Ha&ll of Shame...
    -
    &Preferences...
  &Ships
    &Build/Design  Ctrl+B
    -
    &List All Fleets  Ctrl+L
    &Organize  Ctrl-G
    &Scrap Current Fleet
    -
    &Review Battle  Ctrl+R
  &Galaxy
    Compare Players....  Ctrl+Y
    Graph History...  Ctrl+H
    Statistics...
    List All Explored Stars...
    -
    Dip Into Savings  Ctrl+D
    Abandon Planet  Ctrl+A
    -
    Alliances...
    Give Money/Metal...
    Surrender To...
    Send Message...  Ctrl+M
    -
    Armageddon
  &Window
    &Tech Spending Window  Ctrl+1
    &Report Window  Ctrl+2
    &Chat Window  Ctrl+3
    -
    Zoom &In  Ctrl+I
    Zoom &Out  Ctrl+J
    &Hide Information  Alt+I
    -
    C&lean Up Windows
  &Help
    &About Spaceho...
    &Help Topics
```

RT_DLGINIT (the combo boxes' items): dialog 111 control 1013 "No Time Limit", "Fast (30 / 120)", "Medium (60 / 180)", "Slow (90 / 180)"; control 1014 "10", "20", "30", "50"; dialog 356 control 1132 "Metal", "Quality", "Gravity", "Owner"; dialog 384 control 1177 "Ship Power", "Ship Class". The string table (RT_STRING, 93 blocks) is `python3 tools/extract/windlg.py SPACEHO.EXE strings`, already in `js/rules-405.js` and `assets/skins/w95/strings.json`.
