# Spaceward Ho! 5 for Palm OS: forms, alerts and strings

The forms, alerts and string lists of Spaceward Ho! 5 for Palm OS 1.0.4 (`Spaceward Ho.prc`),
written by `tools/extract/palmforms.py`: each `tFRM` (title, labels, buttons, push buttons,
check boxes, sliders with their ranges, fields, lists), each `Talt` (alert) and each `tSTL`
(string list, numbered from 0). Frames are (x, y, w, h) in Palm pixels on the 160 x 160
screen. What was read from these before is in `docs/source-inventory.md`.

```
tFRM 1100 (2, 2, 156 x 156) default button 1105, help 0, menu 0
  - bitmap frame (4, 0) bitmap 1007
  - field id 1102 frame (4, 100, 150, 12) maxChars 120
  - field id 1103 frame (48, 100, 107, 36) maxChars 80
  - control button id 1104 'Register' frame (2, 126, 40, 12)
  - control button id 1105 'OK' frame (2, 142, 40, 12)
  - label id 1106 '© 2003 Mobilefreon' frame (50, 145)
  - label id 1107 '© 2003 Delta Tao' frame (50, 134)
tFRM 1200 (0, 0, 160 x 160) default button 1221, help 0, menu 1300
  - title 'Creation' frame (0, 0, 0, 0)
  - label id 1201 'Difficulty:' frame (91, 1)
  - label id 1202 'Density:' frame (36, 49)
  - field id 1203 frame (135, 1, 21, 12) maxChars 3
  - label id 1204 'Size:' frame (50, 34)
  - label id 1205 'IQ' frame (84, 76)
  - label id 1206 'Computer Players' frame (4, 64)
  - label id 1207 'Shape:' frame (41, 18)
  - list id 1208 frame (78, 18, 58, 0) items []
  - control popup trigger id 1209 'Circle' frame (79, 17, 39, 12)
  - popup control 1209 list 1208
  - control popup trigger id 1210 'None' frame (47, 76, 38, 13)
  - popup control 1210 list 1226
  - control popup trigger id 1211 '10' frame (78, 115, 27, 13)
  - popup control 1211 list 1220
  - control button id 1212 'Create' frame (119, 146, 40, 12)
  - field id 1213 frame (0, 147, 70, 12) maxChars 16
  - label id 1217 'Other Details' frame (3, 104)
  - label id 1218 'Galaxy' frame (0, 16)
  - control check box id 1219 'Best Buddies' frame (86, 92, 70, 12) on True
  - list id 1220 frame (80, 116, 38, 0) items []
  - control button id 1221 'Quit' frame (79, 146, 36, 12)
  - control popup trigger id 1222 '' frame (77, 130, 17, 13)
  - popup control 1222 list 1223
  - list id 1223 frame (79, 132, 58, 0) items []
  - label id 1224 'Years Per Turn' frame (9, 116)
  - label id 1225 'Home System' frame (13, 131)
  - list id 1226 frame (48, 78, 30, 0) items []
  - label id 1227 'Bad Guys' frame (7, 76)
  - label id 1228 'bigger' frame (128, 33)
  - label id 1229 'sparser' frame (126, 50)
  - control popup trigger id 1230 '' frame (5, 90, 17, 13)
  - popup control 1230 list 1231
  - list id 1231 frame (7, 92, 58, 0) items []
  - graffiti state
  - control feedback slider id 1233 frame (110, 74, 50, 15) min 0 max 150 value 0
  - control feedback slider id 1234 frame (74, 47, 50, 15) min 0 max 100 value 0
  - control feedback slider id 1235 frame (74, 31, 50, 15) min 0 max 100 value 0
tFRM 1300 (0, 0, 160 x 160) default button 0, help 0, menu 0
  - title 'Players' frame (0, 0, 0, 0)
  - control button id 1301 'Add' frame (49, 1, 25, 10)
  - control button id 1302 'Start' frame (77, 1, 25, 10)
  - control button id 1303 'End' frame (133, 1, 25, 10) hidden True
  - control button id 1304 'Take' frame (105, 1, 25, 10) hidden True
tFRM 1400 (0, 0, 160 x 160) default button 0, help 0, menu 1000
  - control push button id 1401 'S' frame (147, 133, 12, 12) group 2
  - control push button id 1402 'B' frame (147, 42, 12, 12) group 1
  - control push button id 1403 '' frame (147, 14, 12, 12) group 1
  - control push button id 1404 'H' frame (147, 27, 12, 12) group 1
  - control push button id 1405 'G' frame (147, 1, 12, 12) group 1
  - control push button id 1406 'E' frame (147, 71, 12, 12)
  - control push button id 1407 'P' frame (147, 146, 12, 12) group 2
  - control push button id 1408 'F' frame (147, 55, 12, 12) group 1
tFRM 1500 (2, 45, 156 x 70) default button 0, help 0, menu 0
  - title 'Add Player' frame (0, 0, 0, 0)
  - control button id 1501 'OK' frame (94, 48, 36, 12)
  - control button id 1502 'Cancel' frame (52, 48, 36, 12)
  - field id 1503 frame (50, 27, 79, 12) maxChars 80
  - label id 1504 'Name:' frame (20, 27)
tFRM 1600 (0, 0, 160 x 160) default button 0, help 0, menu 0
  - control push button id 1601 '' frame (147, 14, 12, 12) group 4
  - control push button id 1602 'E' frame (147, 71, 12, 12)
  - control push button id 1610 'Tech' frame (77, 50, 40, 12) group 5
  - control push button id 1611 'Planets' frame (37, 50, 40, 12) group 5
  - scroll bar id 1612 frame (145, 97, 7, 60)
  - control push button id 1627 'H' frame (147, 27, 12, 12) group 4
  - control push button id 1628 'G' frame (147, 1, 12, 12) group 4
tFRM 1700 (2, 2, 156 x 156) default button 1713, help 0, menu 0
  - title 'Auto Play' frame (0, 0, 0, 0)
  - control button id 1701 'OK' frame (117, 141, 36, 12)
  - control check box id 1702 'Auto Play' frame (4, 14, 68, 12) on True
  - control push button id 1703 '' frame (9, 28, 12, 12) group 6
  - control push button id 1704 '' frame (9, 80, 12, 12) group 6
  - control check box id 1705 '' frame (17, 95, 19, 12) on True
  - label id 1706 'Turn Off When Something \rInteresting Happens: battles, \rcolonizations, tech level \rchanges, etc.' frame (30, 95)
  - label id 1707 'Just End My Turns' frame (25, 80)
  - label id 1708 'Have Computer Play For Me' frame (25, 28)
  - control slider id 1709 frame (17, 45, 50, 15) min 0 max 150 value 0
  - control slider id 1710 frame (87, 45, 50, 15) min 0 max 150 value 0
  - label id 1711 'Friendly' frame (8, 63)
  - label id 1712 'Dig in' frame (122, 63)
  - control button id 1713 'Cancel' frame (77, 141, 36, 12)
  - field id 1714 frame (4, 141, 50, 12) maxChars 80
tFRM 1800 (0, 2, 160 x 160) default button 1834, help 2000, menu 0
  - title 'Build Ships' frame (0, 0, 0, 0)
  - control check box id 1801 'Allow Debt' frame (1, 74, 74, 12) on True
  - control repeating button id 1802 '\x03' frame (148, 147, 12, 12)
  - control repeating button id 1803 '\x02' frame (116, 147, 12, 12)
  - field id 1804 frame (44, 134, 46, 12) maxChars 80
  - control popup trigger id 1810 '' frame (134, 27, 17, 12)
  - popup control 1810 list 1815
  - control popup trigger id 1811 '' frame (134, 39, 17, 12)
  - popup control 1811 list 1816
  - control popup trigger id 1812 '' frame (134, 51, 17, 12)
  - popup control 1812 list 1817
  - control popup trigger id 1813 '' frame (134, 63, 17, 12)
  - popup control 1813 list 1818
  - control popup trigger id 1814 '' frame (134, 75, 17, 12)
  - popup control 1814 list 1819
  - list id 1815 frame (134, 27, 24, 0) items []
  - list id 1816 frame (134, 39, 24, 0) items []
  - list id 1817 frame (134, 51, 24, 0) items []
  - list id 1818 frame (134, 63, 24, 0) items []
  - list id 1819 frame (134, 75, 24, 0) items []
  - control button id 1820 'Max' frame (123, 101, 32, 12)
  - control popup trigger id 1821 'Dreadnought' frame (90, 15, 71, 12)
  - popup control 1821 list 1822
  - list id 1822 frame (90, 15, 68, 0) items []
  - field id 1823 frame (2, 61, 70, 12) maxChars 80
  - list id 1824 frame (1, 15, 86, 44) items []
  - field id 1825 frame (44, 148, 46, 12) maxChars 80
  - label id 1826 'Reserves' frame (42, 123)
  - label id 1827 'Metal:' frame (0, 112)
  - field id 1828 frame (0, 101, 90, 12) maxChars 80
  - field id 1830 frame (39, 111, 36, 12) maxChars 80
  - control button id 1831 'Build' frame (123, 133, 32, 12)
  - field id 1832 frame (128, 147, 20, 12) maxChars 80
  - control push button id 1833 'C' frame (94, 90, 12, 12) group 7
  - control button id 1834 'Cancel' frame (123, 117, 32, 12)
  - field id 1836 frame (0, 134, 42, 12) maxChars 80
  - field id 1837 frame (0, 148, 42, 12) maxChars 80
  - label id 1838 'Cost' frame (1, 123)
  - control push button id 1839 'S' frame (106, 90, 12, 12) group 7
tFRM 1900 (0, 0, 160 x 160) default button 0, help 0, menu 0
  - control button id 1901 'OK' frame (142, 1, 17, 11)
tFRM 2000 (2, 2, 156 x 156) default button 2008, help 0, menu 0
  - title 'Dip Into Savings' frame (0, 0, 0, 0)
  - control slider id 2001 frame (20, 20, 100, 15) min 0 max 30 value 0
  - label id 2002 '0%' frame (17, 38)
  - label id 2003 '15%' frame (57, 38)
  - label id 2004 '30%' frame (104, 38)
  - label id 2005 'What percentage of your \rsavings would you like to \ruse each turn to increase \ryour income?' frame (7, 54)
  - label id 2006 'Once started, you will continue\rto dip each turn until cancelled.' frame (7, 112)
  - control button id 2007 'OK' frame (117, 142, 36, 12)
  - control button id 2008 'Cancel' frame (77, 142, 36, 12)
tFRM 2100 (2, 2, 156 x 156) default button 2109, help 0, menu 0
  - title 'Battle at' frame (0, 0, 0, 0)
  - control button id 2102 'Info' frame (67, 124, 24, 12) hidden True
  - control button id 2103 frame (73, 18, 11, 11) bitmaps (1171, 1170) hidden True
  - control button id 2104 frame (73, 33, 11, 11) bitmaps (1173, 1172) hidden True
  - control button id 2109 'OK' frame (67, 140, 24, 12) hidden True
tFRM 2200 (0, 0, 160 x 160) default button 0, help 0, menu 0
  - control push button id 2201 '' frame (147, 14, 12, 12) group 9
  - scroll bar id 2202 frame (145, 97, 7, 60)
  - control push button id 2203 'G' frame (147, 1, 12, 12) group 9
  - control button id 2204 'Battle Info' frame (90, 42, 50, 12)
  - field id 2205 frame (4, 80, 135, 80) maxChars 80
  - control push button id 2206 'E' frame (147, 71, 12, 12)
  - control button id 2207 'Go See' frame (90, 26, 50, 12)
  - control push button id 2208 'H' frame (147, 27, 12, 12) group 9
  - field id 2211 frame (102, 2, 36, 12) maxChars 80
  - label id 2212 'Message History' frame (5, 2)
  - control button id 2213 "Don't Evacuate" frame (70, 58, 70, 12)
tFRM 2300 (0, 2, 160 x 160) default button 2303, help 2002, menu 0
  - title 'Organize Fleets' frame (0, 0, 0, 0)
  - control button id 2301 'Split' frame (1, 145, 40, 12)
  - control button id 2302 'Group All' frame (45, 145, 40, 12)
  - control button id 2303 'Done' frame (119, 145, 40, 12)
  - list id 2304 frame (89, 29, 70, 33) items []
  - list id 2305 frame (1, 29, 70, 33) items []
  - control button id 2306 '\x02' frame (74, 33, 12, 12)
  - control button id 2307 '\x03' frame (74, 33, 12, 12)
  - control popup trigger id 2308 'Empty Fleet' frame (92, 14, 66, 12)
  - popup control 2308 list 2309
  - list id 2309 frame (92, 15, 68, 0) items []
  - control popup trigger id 2310 'Empty Fleet' frame (0, 14, 66, 12)
  - popup control 2310 list 2311
  - list id 2311 frame (0, 15, 68, 0) items []
  - label id 2312 'R:' frame (2, 81)
  - label id 2313 'S:' frame (4, 92)
  - label id 2314 'To:' frame (76, 118)
  - label id 2315 'ETA' frame (4, 118)
  - label id 2316 'Scrap' frame (30, 118)
  - field id 2317 frame (14, 81, 12, 12) maxChars 80
  - field id 2318 frame (14, 92, 12, 12) maxChars 80
  - field id 2319 frame (95, 118, 40, 12) maxChars 80
  - field id 2320 frame (4, 130, 20, 12) maxChars 80
  - field id 2321 frame (30, 130, 32, 12) maxChars 80
  - label id 2322 'F:' frame (30, 81)
  - label id 2323 'C:' frame (29, 92)
  - label id 2324 'Final:' frame (66, 130)
  - field id 2325 frame (40, 81, 12, 12) maxChars 80
  - field id 2326 frame (40, 92, 12, 12) maxChars 80
  - field id 2327 frame (95, 130, 40, 12) maxChars 80
  - field id 2328 frame (41, 66, 20, 12) maxChars 4
  - list id 2329 frame (100, 105, 58, 33) items ['Offensive', 'Defensive', 'Normal']
  - control popup trigger id 2330 'Normal' frame (100, 105, 47, 12)
  - popup control 2330 list 2329
  - label id 2331 'Battle Attitude' frame (77, 93)
  - control check box id 2332 '' frame (147, 81, 19, 12) on True
  - label id 2333 'Delayed Arrival' frame (67, 81)
  - label id 2345 'ships' frame (1, 67)
  - control repeating button id 2346 '\x03' frame (61, 66, 12, 12)
  - control repeating button id 2347 '\x02' frame (29, 66, 12, 12)
tFRM 2400 (2, 2, 156 x 156) default button 2403, help 0, menu 0
  - title 'Scrap Ship Types' frame (0, 0, 0, 0)
  - list id 2401 frame (2, 14, 152, 77) items []
  - label id 2402 'Select the ship types you would like \rto scrap. If any ships of that type\r exist, they will be scrapped at their \rcurrent location during the next \rturn update.' frame (2, 95)
  - control button id 2403 'OK' frame (116, 141, 36, 12)
tFRM 2500 (2, 2, 156 x 156) default button 2511, help 0, menu 0
  - title 'Give Money/Metal' frame (0, 0, 0, 0)
  - list id 2501 frame (54, 17, 70, 0) items []
  - control popup trigger id 2502 '' frame (54, 16, 17, 12)
  - popup control 2502 list 2501
  - label id 2503 'Recipient:' frame (10, 16)
  - label id 2506 'Money:' frame (10, 45)
  - label id 2507 'Metal:' frame (10, 95)
  - label id 2508 '$0' frame (25, 78)
  - label id 2509 '0' frame (25, 128)
  - control button id 2510 'Give' frame (116, 141, 36, 12)
  - control button id 2511 'Cancel' frame (76, 141, 36, 12)
  - control feedback slider id 2512 frame (25, 60, 100, 15) min 0 max 1 value 0
  - control feedback slider id 2513 frame (25, 110, 100, 15) min 0 max 1 value 0
tFRM 2600 (2, 88, 156 x 70) default button 2608, help 0, menu 0
  - title 'Send Message' frame (0, 0, 0, 0)
  - list id 2601 frame (63, 18, 70, 0) items []
  - control popup trigger id 2602 '' frame (63, 18, 17, 12)
  - popup control 2602 list 2601
  - label id 2603 'To Whom:' frame (19, 18)
  - control popup trigger id 2604 '' frame (63, 38, 17, 12)
  - popup control 2604 list 2606
  - label id 2605 'Say What:' frame (19, 38)
  - list id 2606 frame (63, 38, 70, 33) items ['Thank You', 'Sorry', '%$*^&%!!']
  - control button id 2607 'OK' frame (116, 55, 36, 12)
  - control button id 2608 'Cancel' frame (76, 55, 36, 12)
tFRM 2700 (2, 88, 156 x 70) default button 2705, help 0, menu 0
  - title 'Surrender' frame (0, 0, 0, 0)
  - list id 2701 frame (75, 30, 70, 0) items []
  - control popup trigger id 2702 '' frame (75, 30, 17, 12)
  - popup control 2702 list 2701
  - label id 2703 'Who would you  like to \rsurrender  to?' frame (2, 18)
  - control button id 2704 'OK' frame (5, 53, 36, 12)
  - control button id 2705 'Cancel' frame (47, 53, 36, 12)
tFRM 2800 (2, 2, 156 x 156) default button 2802, help 0, menu 0
  - title 'Rank History' frame (0, 0, 0, 0)
  - list id 2801 frame (5, 72, 146, 66) items []
  - control button id 2802 'OK' frame (116, 141, 36, 12)
  - label id 2803 'MPs Needed:' frame (35, 43)
  - label id 2804 'Total Master Points:' frame (4, 29)
  - field id 2805 frame (90, 29, 55, 12) maxChars 80
  - field id 2806 frame (90, 44, 55, 12) maxChars 80
  - field id 2807 frame (29, 15, 80, 12) maxChars 80
  - label id 2808 'Rank:' frame (4, 15)
  - label id 2809 'Date Achieved' frame (5, 58)
  - label id 2810 'Rank' frame (82, 58)
  - field id 2811 frame (6, 141, 50, 12) maxChars 80
tFRM 2900 (2, 22, 156 x 136) default button 2908, help 0, menu 0
  - title 'Congratulation!' frame (0, 0, 0, 0)
  - field id 2901 frame (75, 74, 70, 12) maxChars 11
  - control button id 2902 'Cool!' frame (116, 121, 36, 12)
  - label id 2903 'You may name a star for use\rin future games:' frame (4, 64)
  - label id 2904 'Congratulations!' frame (3, 18)
  - label id 2905 'You have achieved  the rank of:' frame (4, 31)
  - field id 2906 frame (4, 45, 100, 12) maxChars 80
  - field id 2907 frame (3, 91, 140, 24) maxChars 80
  - control button id 2908 'Nevermind' frame (46, 121, 64, 12)
  - graffiti state
tFRM 3000 (2, 2, 156 x 156) default button 3010, help 0, menu 0
  - title 'Radical Research' frame (0, 0, 0, 0)
  - control push button id 3001 frame (10, 16, 20, 20) bitmaps (8010, 8011) group 3
  - control push button id 3002 frame (10, 42, 20, 20) bitmaps (8010, 8011) group 3
  - control push button id 3003 frame (10, 94, 20, 20) bitmaps (8010, 8011) group 3
  - control push button id 3004 frame (10, 68, 20, 20) bitmaps (8010, 8011) group 3
  - control push button id 3005 "Don't Cancel Any Programs" frame (10, 124, 120, 12) group 3
  - field id 3006 frame (40, 14, 110, 24) maxChars 80
  - field id 3007 frame (40, 40, 110, 24) maxChars 80
  - field id 3008 frame (40, 92, 110, 24) maxChars 80
  - field id 3009 frame (40, 66, 110, 24) maxChars 80
  - control button id 3010 'OK' frame (116, 141, 36, 12)
tFRM 3100 (2, 2, 156 x 156) default button 3102, help 2004, menu 0
  - title 'Enemies and Allies' frame (0, 0, 0, 0)
  - scroll bar id 3101 frame (147, 17, 7, 118)
  - control button id 3102 'OK' frame (117, 141, 36, 12)
  - control popup trigger id 3150 '' frame (79, 18, 17, 12)
  - popup control 3150 list 3160
  - control popup trigger id 3151 '' frame (79, 35, 17, 12)
  - popup control 3151 list 3161
  - control popup trigger id 3152 '' frame (79, 51, 17, 12)
  - popup control 3152 list 3162
  - control popup trigger id 3153 '' frame (79, 84, 17, 12)
  - popup control 3153 list 3163
  - control popup trigger id 3154 '' frame (79, 115, 17, 12)
  - popup control 3154 list 3164
  - control popup trigger id 3155 '' frame (79, 67, 17, 12)
  - popup control 3155 list 3165
  - control popup trigger id 3156 '' frame (79, 99, 17, 12)
  - popup control 3156 list 3166
  - control popup trigger id 3157 '' frame (13, 59, 17, 12)
  - popup control 3157 list 3167
  - control popup trigger id 3158 '' frame (11, 43, 17, 12)
  - popup control 3158 list 3168
  - list id 3160 frame (80, 16, 50, 0) items []
  - list id 3161 frame (80, 33, 50, 0) items []
  - list id 3162 frame (80, 49, 50, 0) items []
  - list id 3163 frame (80, 82, 50, 0) items []
  - list id 3164 frame (80, 114, 50, 0) items []
  - list id 3165 frame (80, 65, 50, 0) items []
  - list id 3166 frame (80, 98, 50, 0) items []
  - list id 3167 frame (14, 58, 50, 0) items []
  - list id 3168 frame (11, 43, 50, 0) items []
tFRM 3200 (2, 2, 156 x 156) default button 3214, help 0, menu 0
  - title 'Preferences' frame (0, 0, 0, 0)
  - control button id 3201 'OK' frame (117, 141, 36, 12)
  - control check box id 3202 'Sound' frame (4, 141, 49, 12) on True
  - control check box id 3203 'Money in € not $' frame (4, 32, 103, 12) on True
  - control check box id 3204 'Temp in °C not °F' frame (4, 46, 103, 12) on True
  - control popup trigger id 3205 '' frame (63, 15, 17, 12)
  - popup control 3205 list 3206
  - list id 3206 frame (63, 15, 68, 0) items []
  - label id 3207 'Player Sex:' frame (4, 15)
  - control check box id 3208 'Jump To History' frame (4, 60, 101, 12) on True
  - control check box id 3209 'Give Helpful Hints' frame (4, 74, 111, 12) on True
  - control check box id 3210 'Show Best Buddies Stars' frame (4, 88, 143, 12) on True
  - control check box id 3211 'Enable Auto-Zoom' frame (4, 102, 111, 12) on True
  - control check box id 3212 'Disable Auto-Off' frame (4, 116, 105, 12) on True
  - field id 3213 frame (59, 129, 50, 12) maxChars 80
  - control button id 3214 'Cancel' frame (77, 141, 36, 12)
tFRM 3300 (0, 0, 160 x 160) default button 3309, help 0, menu 0
  - bitmap frame (1, 50) bitmap 9401
  - control button id 3302 'OK' frame (117, 145, 36, 12)
  - field id 3303 frame (2, 2, 158, 48) maxChars 80
  - control push button id 3304 '' frame (117, 84, 12, 12) group 7
  - control push button id 3305 '' frame (117, 104, 12, 12) group 7
  - label id 3306 'On' frame (134, 83)
  - label id 3307 'Off' frame (134, 103)
  - bitmap frame (1, 50) bitmap 9402
  - control button id 3309 'Cancel' frame (117, 129, 36, 12)
tFRM 3400 (2, 2, 156 x 156) default button 3403, help 0, menu 0
  - title 'Game Over' frame (0, 0, 0, 0)
  - bitmap frame (2, 42) bitmap 9403
  - bitmap frame (2, 42) bitmap 9404
  - control button id 3403 'OK' frame (117, 141, 36, 12)
  - field id 3404 frame (2, 14, 150, 24) maxChars 100
  - field id 3405 frame (2, 60, 152, 80) maxChars 256
  - bitmap frame (2, 14) bitmap 9036
  - bitmap frame (2, 14) bitmap 9037
tFRM 3600 (2, 2, 156 x 156) default button 3601, help 0, menu 0
  - title 'List All' frame (0, 0, 0, 0)
  - control button id 3601 'OK' frame (117, 141, 36, 12)
  - scroll bar id 3602 frame (146, 15, 7, 120)
  - control button id 3603 'Goto' frame (117, 141, 36, 12) hidden True
  - control popup trigger id 3604 'Sort By' frame (47, 143, 48, 12)
  - popup control 3604 list 3605
  - list id 3605 frame (47, 143, 50, 66) items ['Name', 'Quality', 'Temp', 'Gravity', 'Date', 'Metal']
  - list id 3606 frame (47, 143, 50, 44) items ['Name', 'Fuel', 'People', 'Orders']
  - control popup trigger id 3607 'Sort By' frame (47, 143, 48, 12)
  - popup control 3607 list 3606
  - label id 3608 'Sort By:' frame (4, 143)
tFRM 3700 (2, 2, 156 x 156) default button 0, help 0, menu 0
  - title 'Debug' frame (0, 0, 0, 0)
  - control button id 3701 'Done' frame (117, 141, 36, 12)
  - scroll bar id 3702 frame (148, 12, 7, 120)
tFRM 3800 (2, 100, 156 x 58) default button 3801, help 0, menu 0
  - title 'Find A Star' frame (0, 0, 0, 0)
  - control button id 3801 'Cancel' frame (47, 42, 36, 12)
  - control button id 3802 'OK' frame (7, 42, 36, 12)
  - label id 3803 'Find:' frame (6, 21)
  - field id 3804 frame (34, 20, 110, 12) maxChars 12
  - graffiti state
tFRM 4000 (2, 2, 156 x 156) default button 4021, help 2003, menu 1300
  - title 'New Game Wizard' frame (0, 0, 0, 0)
  - field id 4002 frame (2, 73, 150, 66) maxChars 1000
  - list id 4003 frame (74, 25, 50, 0) items []
  - control popup trigger id 4004 'Circle' frame (75, 25, 39, 12)
  - popup control 4004 list 4003
  - field id 4005 frame (34, 38, 118, 36) maxChars 80
  - label id 4006 'Your Name:' frame (2, 13)
  - control button id 4007 'Register' frame (28, 141, 40, 12)
  - control button id 4012 'Create' frame (112, 141, 40, 12)
  - field id 4013 frame (62, 13, 80, 12) maxChars 16
  - label id 4018 'Galaxy Shape:' frame (2, 25)
  - control button id 4021 'Quit' frame (72, 141, 36, 12)
  - graffiti state
tFRM 4100 (2, 40, 156 x 100) default button 4106, help 0, menu 0
  - title 'Register Spaceward Ho!' frame (0, 0, 0, 0)
  - field id 4101 frame (20, 33, 130, 12) maxChars 40
  - field id 4102 frame (20, 65, 130, 12) maxChars 20
  - label id 4103 'Username:' frame (12, 18)
  - label id 4104 'Registration Code:' frame (12, 50)
  - control button id 4105 'OK' frame (116, 85, 36, 12)
  - control button id 4106 'Cancel' frame (74, 85, 36, 12)
  - graffiti state
tFRM 25000 (2, 68, 156 x 90) default button 0, help 0, menu 0
  - title ' ' frame (0, 0, 0, 0)
  - control button id 25002 'OK' frame (116, 72, 36, 12)
  - field id 25003 frame (3, 15, 150, 51) maxChars 400
Talt 1001 error 'System Incompatible': 'System Version 3.5  or greater is required to run this application.' ['OK']
Talt 1002 error 'Not Enough Memory': 'Your Palm does not have enough memory to play\n Spaceward Ho. (^1^2^3)' ['OK']
Talt 1100 error 'Not Enough Colors': 'Your screen does not support enough color depth to play Spaceward Ho!' ['OK']
Talt 1200 error 'You are Eliminated': 'You can not do that since you have been eliminated from the game!' ['OK']
Talt 1300 warning 'Not Your Planet': "You don't own ^1!" ['OK']
Talt 1400 warning 'No Planet Selected': 'You have not selected a planet.' ['OK']
Talt 1500 warning 'No Fleets at Planet': "You don't have any fleets at ^1!" ['OK']
Talt 1900 information 'No Destination': 'The current fleet does not have a destination' ['OK']
Talt 2000 warning 'No Fleet Selected': 'You have not selected a fleet.' ['OK']
Talt 2100 confirmation 'Quit Current Game': 'Starting a new game will replace the current game. Are you sure?' ['OK', 'Cancel']
Talt 2200 error "Can't Give to Anyone": '^1' ['OK']
Talt 2300 information '': '^1^2^3' ['OK']
Talt 2400 information '': '^1^2^3' ['OK', 'Cancel']
Talt 2500 information 'Not Implemented': 'That feature has not been implemented yet!' ['OK']
Talt 2600 information 'Something Interesting': 'Something interesting just happened!' ['OK', 'Show']
Talt 2700 error 'Failure!': '^1^2^3' ['OK']
Talt 2800 error 'Registration Invalid': 'Your registration information was not accepted.' ['OK']
Talt 2900 information 'Registered': 'You have now been registered; to unlock new features, start a new game.' ['OK']
tSTL 1001 (prefix ''): 91 strings
  0. 'Congratulations! You have conquered the galaxy!'
  1. 'Unfortunately, you have been eliminated from the game...'
  2. "Congratulations! You have conquered the galaxy! That's no small feat in demo mode."
  3. 'Unfortunately, you have been eliminated from the demo game...'
  4. 'Now, order the full version so that you can: \n 1. Amass master points for your wins\n 2. Try lots more galaxy styles\n 3. Play against smarter opponents\nAnd much more...'
  5. 'You surrender.'
  6. 'Congratulations, your ally won!'
  7. ' Calculating Turn'
  8. ' Processing Turn'
  9. 'G'
  10. '$'
  11. 'H'
  12. 'A'
  13. 'No Ships'
  14. 'No Satellites'
  15. 'No Planet Selected'
  16. 'Gone Supernova!'
  17. 'No Info'
  18. 'no metal'
  19. 'No saved game'
  20. 'Saved game loaded'
  21. 'Checking for saved game'
  22. 'Expires: %ld days'
  23. 'Expired'
  24. '%s [%s] %s'
  25. 'Unknown version'
  26. 'You are in DEMO mode. Please buy Spaceward Ho!'
  27. 'You are in DEMO mode. To activate this feature, you need to register your copy. If you have entered your reg code already, be sure to start a new game.'
  28. 'Note: In the registered version, you can customize the galaxy shape, size/density, the number of opponents, and many more features.'
  29. 'This copy is registered to %s'
  30. 'DEMO game: Compete versus three bad guys in a small galaxy.'
  31. 'You lost %ld ships'
  32. 'You lost 1 ship'
  33. 'You lost no ships'
  34. ' and %s people.'
  35. ' and no people.'
  36. '%s lost %d ships.'
  37. '%s lost 1 ship.'
  38. '%s lost no ships.'
  39. 'Round (%ld)'
  40. '%s / %s'
  41. '[%s] (%ld/%ld) %s'
  42. '('
  43. ')'
  44. '-'
  45. '$'
  46. '%s%ld,%03ld K'
  47. '%s%ld.%02ld M'
  48. '%s%ld.%02ld K'
  49. '%s%ld K'
  50. '(%s%ld,%03ld K)'
  51. '(%s%ld.%02ld M)'
  52. '(%s%ld.%02ld K)'
  53. '(%s%ld K)'
  54. '%ld,%03ld K'
  55. '%ld.%02ld M'
  56. '%ld.%02ld K'
  57. '%ld K'
  58. '-%ld,%03ld K'
  59. '-%ld.%02ld M'
  60. '-%ld.%02ld K'
  61. '-%ld K'
  62. '%s0'
  63. '0'
  64. '(Int: %s%s)'
  65. 'Start: %s'
  66. 'IQ: %ld'
  67. '%lu.%02luG, %s'
  68. '%ld of %ld'
  69. '{%3ld} [%s] (%ld/%ld) %s'
  70. '%2ld| '
  71. '--| '
  72. 'Dev/Pro Cost (%s)'
  73. ' Saving game'
  74. ' Loading saved game'
  75. ' Creating game'
  76. 'Evacuate'
  77. "Don't Evacuate"
  78. 'Here is your armageddon device. If you turn it on, a cataclysm of unprecedented proportions will lay waste to half the galaxy...'
  79. '(%02ld) '
  80. 'Rng'
  81. 'Spd'
  82. 'Wpn'
  83. 'Shl'
  84. 'Min'
  85. ' : '
  86. 'Build capacity left:'
  87. 'Built: %s'
  88. 'In Service: %s'
  89. 'rusty'
  90. 'The computer has already calculated your move for this turn.'
tSTL 6001 (prefix ''): 60 strings
  0. 'one'
  1. 'Decoy'
  2. '100%'
  3. 'Range'
  4. 'Speed'
  5. 'Weapons'
  6. 'Shields'
  7. 'Mini'
  8. 'Radical'
  9. 'Savings'
  10. 'Tech'
  11. 'Pop:'
  12. 'Gravity:'
  13. 'Metal:'
  14. 'Temp:'
  15. 'Dismantle Current Fleet'
  16. 'Don’t Dismantle Current Fleet'
  17. 'Dismantle '
  18. 'Don’t Dismantle '
  19. 'Evacuate Planet'
  20. 'Don’t Evacuate Planet'
  21. 'Show Information'
  22. 'Hide Information'
  23. 'Metal:'
  24. 'Savings:'
  25. 'Income:'
  26. 'Income:'
  27. '$'
  28. 'Milky Way'
  29. 'You'
  30. 'more...'
  31. 'Evacuating'
  32. 'Attack & Refuel Fleet'
  33. 'Attack & Colonize Fleet'
  34. 'Mixed Fleet'
  35. 'Empty Fleet'
  36. 'Rake & Pillage Fleet'
  37. 'n/a'
  38. 'Your enemies'
  39. 'and your allies '
  40. 'Disp. Inc.: $'
  41. '…'
  42. 'No Information'
  43. 'No One'
  44. 'Owner:'
  45. 'Info:'
  46. 'Grav:'
  47. 'No Graph Information Available'
  48. 'Show Planet Info Box'
  49. 'Hide Planet Info Box'
  50. 'Ship Type Information'
  51. 'http://www.joedelta.com/ho5/buyitnow.html'
  52. 'Hyperspace'
  53. 'Congratulations! You won the battle.'
  54. 'Unfortunately, you lost the battle.'
  55. 'You have no information about the battle; your fleet was destroyed too quickly.'
  56. 'Cool! Your best buddy won this battle.'
  57. 'Darn. Your best buddy lost this battle.'
  58. 'Your buddy was destroyed too fast and has no information about this battle.'
  59. ' (Need more MPs)'
tSTL 6002 (prefix ''): 14 strings
  0. 'Scout'
  1. 'Dreadnought'
  2. 'Fighter'
  3. 'Tanker'
  4. 'Colony Ship'
  5. 'Satellite'
  6. 'Biological'
  7. 'Scouts'
  8. 'Dreadnoughts'
  9. 'Fighters'
  10. 'Tankers'
  11. 'Colony Ships'
  12. 'Satellites'
  13. 'Biologicals'
tSTL 6003 (prefix ''): 20 strings
  0. '%lu.%02luG'
  1. '%ld.%1ld°F'
  2. '%ld.%1ld°C'
  3. '(+ %s%s)'
  4. '(- %s%s)'
  5. '(+ %s)'
  6. '(- %s)'
  7. '( %s%s)'
  8. '%s in %s in %ld'
  9. '%s People killed'
  10. 'one dead %s'
  11. '%ld dead %s'
  12. 'Review Battle at %s in %ld'
  13. 'Round %ld'
  14. '%ld/%ld %ss'
  15. '%s of %s People survived'
  16. '%s Information'
  17. "Do you really want to evacuate %s? It's a profitable colony!"
  18. '%s’s Rank History'
  19. 'You have earned the ability to %s.'
tSTL 6004 (prefix ''): 39 strings
  0. 'Are you sure you want to leave your current network game?'
  1. 'Do you really want to surrender?'
  2. 'You are no longer surrendering to anyone.'
  3. 'Are you sure you want to destroy half the galaxy? Millions of innocent lives will be lost…'
  4. "Whew! It's good to see that that clearer heads have prevailed!"
  5. 'Sorry, but you may only give 3 gifts per turn.'
  6. 'Sorry, but there is no one else alive to give or send something to.'
  7. 'Do you really want to scrap all existing ships of this type?'
  8. 'Sorry, but the battle record for this battle is no longer available.'
  9. 'Sorry, but there is already a star with that name. How about a different name?'
  10. 'Sorry, but spacewardho.net already has a game with that name running. Please try a different name.'
  11. 'Please name your galaxy.'
  12. 'Unable to connect to game server at spacewardho.net.'
  13. 'You have become disconnected from spacewardho.net. Try to reconnect if you want.'
  14. "We haven't heard from the server in a while. It may be down or your connection may be severed. You may want to quit and then try to reconnect."
  15. 'Sorry, but your assembly lines are full. You must scrap a ship type first before you can design any more ship types.\n'
  16. "Sorry, you don't have the details about this battle that your ally fought."
  17. 'Sorry, but you have no additional information about this battle; all you know is that is was pretty big.'
  18. 'You must fill in all fields with the proper data before you can register.'
  19. 'The serial number you entered is not valid. Please check that you entered it in correctly.'
  20. 'The serial number you have entered has already been registered under a different login/screen name. Please enter the same name you did the first time.'
  21. 'Sorry, but the screen name you have requested has already been taken. Please try a different username.'
  22. 'Sorry, but the screen name you have requested is invalid. Please try again.'
  23. 'Sorry, but Spaceward Ho! cannot connect to the registration server. Please make sure you are connected to the Internet.'
  24. 'Sorry, but this serial number has been overused in some way and has been locked out. Please call tech support for assistance.'
  25. 'Sorry, but this version of Spaceward Ho! only permits network play.'
  26. 'Sorry, but the Registration server is returning an error. You may be trying to connect with an old version of Spaceward Ho! that is no longer compatible.'
  27. 'You were idle for 15 minutes and have been disconnected for spacewardho.net.\n'
  28. 'Sorry, but you have no detailed information about the battle. All you know was that it was big.'
  29. "Sorry, but that fleet doesn't have enough fuel to reach the selected destination. You can tell this because there are no arrows on either end of the dragged line.\n"
  30. 'The serial number you entered is invalid. Please check it and try again.'
  31. 'Are you sure you want to de-register this copy of Spaceward Ho!? It will revert to demo mode.'
  32. 'This copy has been de-registered. You must quit Spaceward Ho! for this operation to be complete.'
  33. 'You are playing with a monitor depth less than millions of colors. Please change to millions if possible, as graphic glitches may otherwise result.'
  34. 'Sorry, but you cannot open saved games in demo mode.'
  35. 'Are you sure you want to build that many scout ships?'
  36. 'Are you sure you want to build that many tankers?'
  37. "Dorothy, I guess that means we're not in Kansas anymore…"
  38. 'This version of the client is not compatible with the current version of the spacewardho.net server. You will need to upgrade first before you can register.'
tSTL 6010 (prefix ''): 15 strings
  0. 'Needle'
  1. 'Explorer'
  2. 'Looker'
  3. 'Columbus'
  4. 'Magellan'
  5. 'Intrepid'
  6. 'Wanderer'
  7. 'Rudolph'
  8. 'Eagle'
  9. 'Sparrow'
  10. 'Ranger'
  11. 'Whisper'
  12. 'Weasel'
  13. 'Enterprise'
  14. 'De Gama'
tSTL 6011 (prefix ''): 15 strings
  0. 'Big Surprise'
  1. 'HelliMoon'
  2. 'Mass Murder'
  3. 'Watch Out!'
  4. 'Terror'
  5. 'Godzilla'
  6. 'Mammoth'
  7. 'Tyrannosaurus'
  8. 'Galactus'
  9. 'Hercules'
  10. 'Monster X'
  11. 'Nightmare'
  12. 'Brontosaurus'
  13. 'Destructor'
  14. 'Annihilator'
tSTL 6012 (prefix ''): 15 strings
  0. 'Reliant'
  1. 'Demon'
  2. 'Hurricane'
  3. 'Typhoon'
  4. 'Slasher'
  5. 'Patton'
  6. 'Stingray'
  7. 'Blaster'
  8. 'Talon'
  9. 'Serpent'
  10. 'Dragon'
  11. 'Tornado'
  12. 'Wraith'
  13. 'Storm'
  14. 'Dagger'
tSTL 6013 (prefix ''): 15 strings
  0. 'Chevron'
  1. 'Union 76'
  2. 'Shell'
  3. 'Exxon'
  4. 'Texaco'
  5. 'Arco'
  6. 'Mobil'
  7. 'BP'
  8. 'Apollo Oil'
  9. 'Diesel'
  10. 'Rotten Robbie'
  11. 'Full Serve'
  12. 'Valdez'
  13. 'Premium'
  14. 'Unleaded'
tSTL 6014 (prefix ''): 15 strings
  0. 'Spreader'
  1. 'Mother'
  2. 'Expander'
  3. 'Nina'
  4. 'Pinta'
  5. 'Santa Maria'
  6. 'Stork'
  7. 'Freedom'
  8. 'People Mover'
  9. 'Discover'
  10. 'Taurus'
  11. 'Minerva'
  12. 'Egg'
  13. 'Peaceful'
  14. 'Hardy'
tSTL 6015 (prefix ''): 15 strings
  0. 'Defender'
  1. 'Stopper'
  2. 'Protector'
  3. 'Eye'
  4. 'Armor'
  5. 'Shield'
  6. 'Peach'
  7. 'Washington'
  8. 'Gabriel'
  9. 'Sun Dog'
  10. 'Mercy'
  11. 'Vision'
  12. 'Pebble'
  13. 'Rock'
  14. 'Stone'
tSTL 6016 (prefix ''): 15 strings
  0. 'Medusa'
  1. 'Slither'
  2. 'Snake'
  3. 'Gobbler'
  4. 'Digester'
  5. 'Big Stomach'
  6. 'Breakfast'
  7. 'Lunch'
  8. 'Dinner'
  9. 'Midnight Snack'
  10. 'Rust Monster'
  11. 'Gelatinous Cube'
  12. 'Compost Pile'
  13. 'Disposal'
  14. 'Trash Compactor'
tSTL 6020 (prefix ''): 160 strings
  0. 'Spaceward Ho! by Peter Commons.'
  1. 'Spaceward Ho! DEMO by Peter Commons.'
  2. 'Artwork by Howard Vives and Bob Van de walle.'
  3. 'Your Range Technology has reached level %ld.'
  4. 'Your Speed Technology has reached level %ld.'
  5. 'Your Weapons Technology has reached level %ld.'
  6. 'Your Shield Technology has reached level %ld.'
  7. 'Your Miniaturization Technology has reached level %ld.'
  8. 'Your Radical researchers have just made another wild discovery!'
  9. 'You have evacuated %s.'
  10. '%s has gone nova.'
  11. '%s destroyed your colony at %s. You %slost %ld of your ships. %s lost %ld. You lost %s people.'
  12. 'Year %ld:'
  13. 'Your colony at %s is not receiving sufficient funds to support itself.'
  14. 'You are not supporting %s enough. The people have revolted and now belong to %s'
  15. 'Warning: you are terraforming %s, a planet that will never become profitable.'
  16. 'You have completely terraformed %s.'
  17. 'A volcanic eruption at %s has drastically warmed the temperature to %s!'
  18. 'Your fleet of %s at %s has been dismantled for %s metal.'
  19. 'Your fleet of %s was dismantled while in hyperspace.'
  20. 'Your “%s” ship type has been dismantled. %ld of this type scrapped for %s metal.'
  21. 'Your fleet of %s disappeared through a wormhole in space and is lost.'
  22. 'Your %s is waiting to refuel before it can continue on to %s.'
  23. 'Your fleet of %s has arrived at %s.'
  24. 'Your fleet of %s has stopped at %s on the way to %s.'
  25. '%s’s fleet of %s has arrived at %s.'
  26. 'Your fleet of %s has eaten %s people while refueling at %s.'
  27. '%s’s fleet of biologicals has eaten %s people while refueling at %s.'
  28. '%s has run out of metal.'
  29. '%s has run out of metal. You should probably evacuate it.'
  30. '%s has just become a profitable colony.'
  31. 'It’s a baby boom! The population at %s has started growing quickly.'
  32. '%s’s population growth rate has slowed.'
  33. 'You have explored %s. Gravity: %lu.%02luG. Temp: %s. Metal: %s.'
  34. '%s has explored %s. Gravity: %lu.%02luG. Temp: %s. Metal: %s.'
  35. 'You have colonized %s.'
  36. 'You %swon a battle at %s. You %slost %ld of your ships. %s lost %ld.'
  37. 'You %slost a battle at %s. You %slost %ld of your ships. %s lost %ld.'
  38. '%s survived an attack from %s. You %slost %ld of your ships; %s lost %ld. You lost %s people.'
  39. '%s says, “I want %s.”'
  40. '%s says, “You take %s.”'
  41. '%s says, “I like %s.”'
  42. '%s says, “I hate %s.”'
  43. '%s says, “I own %s.”'
  44. '%s says, “I need money.”'
  45. '%s says, “I need metal.”'
  46. '%s says, “Let’s attack %s.”'
  47. '%s says, “Thank You!”'
  48. '%s says, “Sorry!”'
  49. '%s says, “#!$@*$&@•™!”'
  50. '%s says, “I like planets that are %ld.%ldG and %s.”'
  51. '%s says, “I saw %s at %s!”'
  52. '%s says, “Look at %s.”'
  53. '%s is cheating.'
  54. '%s says: %s'
  55. 'You told %s that you want %s.'
  56. 'You told %s that you don’t want %s.'
  57. 'You told %s that you like %s.'
  58. 'You told %s that you hate %s.'
  59. 'You told %s that you own %s.'
  60. 'You told %s that you need money.'
  61. 'You told %s that you need metal.'
  62. 'You told %s, “Let’s attack %.*s.”'
  63. 'You told %s, “Thank You!”'
  64. 'You told %s, “Sorry!”'
  65. 'You said “#!$@*$&@•™!” to %s.'
  66. 'You told %s what gravity and temperature you prefer.'
  67. 'You told %s you saw %s at %.*s.'
  68. 'You told %s all about %s.'
  69. 'Wow! You seem to be doing really well! Congratulations!'
  70. 'Your message to %s: %s'
  71. 'You recovered %s metal from the battle at %s.'
  72. '%s metal has fallen onto %s from your recent battle.'
  73. 'Oh no! %s people were killed when a heavy meteor shower hit %s.'
  74. '%s has just been eliminated from the game.'
  75. 'You have just been eliminated from the game.'
  76. '%s has just won the game.'
  77. 'Your ally %s has just won the game.'
  78. 'Congratulations! You won a %ld difficulty game and have earned %s master points.'
  79. 'You are not spending any money on technology research.'
  80. 'The meteor shower destroyed your colony at %s.'
  81. 'Oh, no! All the metal on %s has suddenly disappeared.'
  82. 'Uh-oh! %s has started growing and is turning bright red in hue!'
  83. '%s has just gone supernova. The planet has been obliterated.'
  84. 'The shock wave from the supernova threw %s metal at %s, killing %s people.'
  85. 'Your %s technology just jumped to %ld.'
  86. 'Eeek! A nasty computer bug has broken into your game and started wreaking havoc!'
  87. '%s has offered to ally with you.'
  88. '%s no longer wants to ally with you.'
  89. 'You have offered to ally with %s.'
  90. 'You no longer want to ally with %s.'
  91. 'You have formed an alliance with %s.'
  92. 'Your alliance with %s is gone.'
  93. '%s has offered to be your best buddy.'
  94. '%s no longer wants to be your best buddy. He just wants to be allies.'
  95. 'You have offered to be best buddies with %s.'
  96. 'You no longer want to be best buddies with with %s. You just want to be allies.'
  97. 'You are now best buddies with %s.'
  98. "Your best buddy relationship with %s is gone. You're only allies now."
  99. 'The amount of energy emanating from %s suggests a big battle just took place.'
  100. '%s has just given you %s.'
  101. '%s has just given you %s metal.'
  102. 'You just gave %s %s.'
  103. 'You just gave %s %s metal.'
  104. '%s has just surrendered.'
  105. '%s has just surrendered to %s.'
  106. 'You have just surrendered.'
  107. 'You have just surrendered to %s.'
  108. 'Your mining consortium has just been able to extract an additional %s metal from every planet you have.'
  109. 'Weird weather patterns have allowed astronomers to explore certain far away stars.'
  110. 'Your ship technicians have designed a set of new ships with no development cost.'
  111. "Your ship technicians have designed a decoy ship. It's really weak, but it looks menacing and can help keep your allies in line!"
  112. "Your mad scientists have created a space monster ship! It's not too powerful, but it doesn't cost any metal!"
  113. 'Your scientists have discovered how to turn your monitor from black and white to color!'
  114. 'Your scientists apologize, but they seem to be having “hardware problems.”'
  115. 'Your scientists realize you already are running in color, shrug, and go back off to work.'
  116. 'Your archaeologists have found ancient scientific documents from a lost civilization. You can now mine more efficiently.'
  117. 'Your sociologists have discovered how to safely increase the maximum population of your planets!'
  118. 'Your climatologists have discovered how to terraform planets more efficiently.'
  119. 'Your military training program has improved. Your generals are now smarter.'
  120. 'You have improved your recycling program. You can now get more metal from scrapped ships.'
  121. 'You have built a new research facility; tech spending is now 10%% more effective.'
  122. "You've raised the prime lending rate and can now earn 50%% higher interest on savings."
  123. 'You have renegotiated your line of credit and can now borrow at a 50%% better interest rate.'
  124. 'Your spies have stolen some technological secrets from %s!'
  125. 'You have found a wealth of precious metals and have increased your savings by %s'
  126. 'Your Radical researchers are hard at work on another discovery!'
  127. 'Warning! Savings is being used to support %s.'
  128. 'Warning! After supporting your planets and paying your interest, you have no money to spend!'
  129. 'Your alliance will win the game next turn if it holds!'
  130. 'Uh-oh! Having to borrow more to pay all your interest!'
  131. 'You don’t have enough money! You’re neglecting your planets! Global warming is taking place!'
  132. 'Due to a lack of funds, one of your fleets can’t be maintained. It is being scrapped.'
  133. 'Oh No! It’s armageddon!'
  134. "Hmm! The armadeddon device was activated, but there wasn't enough mass in the galaxy to get it to work…"
  135. 'The armageddon device has caused half of the stars to supernova!'
  136. '%s’s armageddon device has just been turned on!'
  137. 'Whew! %s’s armageddon device was just turned off.'
  138. 'You just received %s metal from someone scrapping a fleet or from a battle over %s.'
  139. 'Congratulations, %s! Your population now exceeds %s!'
  140. 'Your %s tech would have just gone up if you hadn’t been playing the demo version!'
  141. '%s has just taken over for the computer player %s.'
  142. 'You now have %s Range Technology (%ld).'
  143. 'You now have %s Speed Technology (%ld).'
  144. 'You now have %s Weapons Technology (%ld).'
  145. 'You now have %s Shield Technology (%ld).'
  146. 'You now have %s Miniaturization Technology (%ld).'
  147. '%s surrenders to you, giving you %s.'
  148. '%s surrenders to you, giving you %s metal.'
  149. '%s surrenders to you, giving you the planet %s.'
  150. 'Oh no! The Valdez has sprung a leak! The ecology on %s is in shambles! The citizens are suing you for negligence for twice your net worth!'
  151. 'You just watched some of your allies fight a battle at %s.'
  152. 'There were not enough tankers to fully refuel your fleet of %s at %s.'
  153. 'Your fleet of %s is fully refueled and is ready to depart %s for %s.'
  154. '%s people managed to escape the meteor shower at %s by fleeing to the orbiting colony ship(s).\n'
  155. 'Designed by Joe Williams.'
  156. "Your %s can no longer reach %s because some of the ships in the fleet don't have enough range."
  157. "It's a miracle! Your scientist have figured out how to prevent %s from going supernova."
  158. "Wow, that's wierd! %s is no longer red and appears not to be in danger of going nova."
  159. 'Palm OS version by Christopher Cotton and Steve Orens of Mobilefreon (tm)'
tSTL 6021 (prefix ''): 51 strings
  0. 'Click the G button to see the Galaxy, click the $ button to see the Spendingscreen and click the H button to see these messages.'
  1. 'Fleets appear as icons next to your planets. To send a fleet to another planet, select it and then drag it to the new planet.'
  2. 'Play with the spending bars. Conquer the galaxy. Gain ranks to unlock more game options. Enjoy.'
  3. 'Ships with higher Speed Tech shoot first.'
  4. 'Icons by your planet mean you have ships orbiting around it. Fleets are on the right; satellites are on the left.'
  5. 'Good planets look “prettier” than bad planets when you explore them.'
  6. 'Range is how far your ships can reach.'
  7. "Satellites can't move, but they shoot just as well as any other ship."
  8. "There's a limited amount of metal in the game."
  9. 'Miniaturization makes ships cost more money, but less metal.'
  10. 'Radical Tech can have a variety of effects.'
  11. 'Be careful with your metal--it can easily run out.'
  12. "To cancel a fleet's movement, make sure that fleet is selected in the Ship Info window and click the origin planet. You can also use the 'Cancel Fleet Trip' menu item in the 'Ships' menu."
  13. 'Build Satellites to protect vulnerable planets.'
  14. 'Colonize good planets with Colony ships.'
  15. 'Scout ships have higher Range, but lower Weapons and Shields.'
  16. "If your Weapons are higher than the opponent's Shields, you'll do lots of damage."
  17. "If your Shields are higher than the opponents Weapons, he'll barely hurt you."
  18. 'Lots of ships can make up for having low Technology.'
  19. 'You get money every turn.'
  20. 'Good planets are close to 1.0 G.'
  21. 'Good planets are close to 72°F (20°C).'
  22. 'Each player has a different idea of what a good planet is.'
  23. 'If a planet is over 2.5 G or below 0.4 G, it will never make a profit.'
  24. 'Abandon bad planets after you strip-mine them.'
  25. "Terraforming improves a planet's temperature."
  26. 'Mining takes metal from a planet and puts it into your reserve.'
  27. 'Savings puts money away for shipbuilding.'
  28. 'Savings generates extra income.'
  29. 'If you go into debt, part of your income goes to pay interest.'
  30. "If you have a fleet with fighters and a colony ship, mark the colony ship to arrive late. It'll probably survive longer."
  31. 'Ships in a fleet that arrive late may miss the worst initial battle.\n'
  32. 'Offensive ships attack better but defend worse.'
  33. 'Defensive ships defend better but attack worse.'
  34. 'There are menus and menu shortcuts in the Galaxy screen for your convenience.'
  35. 'The computer will help choose the best path possible for your fleets.'
  36. 'Put multiple ships in the same fleet with Organize Fleets. '
  37. 'Change the battle attitude of ships in your fleets in the Organize Fleets screen.'
  38. 'The Enemy and Allies screen can show who your friends and enemies are. It also so shows who is doing the best.'
  39. 'The first person in the Enemies and Allies list is winning.'
  40. "If you've just started, you might want to try turning on auto-play and watching."
  41. "If you and your allies arrive at  a star in the same turn, they'll fight side-by-side in battle."
  42. 'Armageddons make the galaxy smaller.'
  43. 'If you like playing the DEMO version, please consider purchasing Spaceward Ho! for the PalmOrder the Macintosh version of Spaceward Ho! from Delta Tao at www.spacewardho.net!'
  44. "Check out Mobilefreon's other Palm games at mobilefreon.com/products"
  45. 'The real version of Spaceward Ho! for the Palm OS will let you gain levels to unlock new features.'
  46. 'Your Technology levels are limited only in the demo version.'
  47. 'Your Technology levels are limited only in the demo version.'
  48. "Don't spend money on a Technology if you've reached its limits for the Demo version."
  49. "The real version of Spaceward Ho! for the Palm OS doesn't have Technology limits."
  50. 'The real version of Spaceward Ho! for the Palm OS has configurable galaxies and opponents.'
tSTL 6060 (prefix ''): 255 strings
  0. 'Sol'
  1. 'Sirius'
  2. 'Canopus'
  3. 'Vega'
  4. 'Rigel'
  5. 'Capella'
  6. 'Procyon'
  7. 'Mira'
  8. 'Altair'
  9. 'Antares'
  10. 'Spica'
  11. 'Pollux'
  12. 'Castor'
  13. 'Deneb'
  14. 'Regulus'
  15. 'Polaris'
  16. 'Algol'
  17. 'Proxima'
  18. 'Alban'
  19. 'Thuban'
  20. 'Mizar'
  21. 'Alcor'
  22. 'Doobie'
  23. 'Merak'
  24. 'Phad'
  25. 'Megrez'
  26. 'Alioth'
  27. 'Alkaid'
  28. 'Mintaka'
  29. 'Alnitak'
  30. 'Atlas'
  31. 'Remus'
  32. 'Alcyon'
  33. 'Electra'
  34. 'Maia'
  35. 'Merope'
  36. 'Taygeta'
  37. 'Sterope'
  38. 'Hadar'
  39. 'Quark'
  40. 'Mimosa'
  41. 'Adhara'
  42. 'Shaula'
  43. 'Nath'
  44. 'Almak'
  45. 'Alshain'
  46. 'Tarazed'
  47. 'Hamal'
  48. 'Izar'
  49. 'Shedir'
  50. 'Menkar'
  51. 'Diphda'
  52. 'Etamin'
  53. 'Acamar'
  54. 'Alhena'
  55. 'Alphard'
  56. 'Arneb'
  57. 'Nihal'
  58. 'Saiph'
  59. 'Markab'
  60. 'Kansas'
  61. 'Enif'
  62. 'Nunki'
  63. 'Kokab'
  64. 'Ain'
  65. 'Ancha'
  66. 'Arkab'
  67. 'Atik'
  68. 'Atria'
  69. 'Shadow'
  70. 'Azha'
  71. 'Baham'
  72. 'Beid'
  73. 'Botein'
  74. 'Caph'
  75. 'Coxa'
  76. 'Cursa'
  77. 'Dabih'
  78. 'Furud'
  79. 'Gedi'
  80. 'Gienah'
  81. 'Heka'
  82. 'Keid'
  83. 'Maaz'
  84. 'Matar'
  85. 'Mirfak'
  86. 'Murzim'
  87. 'Delta'
  88. 'Ozworld'
  89. 'Okda'
  90. 'Phact'
  91. 'Propus'
  92. 'Rana'
  93. 'Risha'
  94. 'Sabik'
  95. 'Petro'
  96. 'Syrma'
  97. 'Tarf'
  98. 'Wasat'
  99. 'Wazn'
  100. 'Yed'
  101. 'Yildun'
  102. 'Zaniah'
  103. 'Zaurac'
  104. 'Zosma'
  105. 'Ylum'
  106. 'Arrakis'
  107. 'Akworld'
  108. 'Colma'
  109. 'Moria'
  110. 'Foundat'
  111. 'Trantor'
  112. 'Barsoom'
  113. 'Aurora'
  114. 'Fluffy'
  115. 'Lennon'
  116. 'Seti Alpha\n'
  117. 'Paradox'
  118. 'Santa Fe'
  119. 'Victoria'
  120. 'Fez'
  121. 'Binar'
  122. 'Nemesis'
  123. 'Harkon'
  124. 'Talos'
  125. 'Aries'
  126. 'Taurus'
  127. 'Gemini'
  128. 'Cancer'
  129. 'Leo'
  130. 'Virgo'
  131. 'Libra'
  132. 'Scorpio'
  133. 'Pisces'
  134. 'Canis'
  135. 'Ursa'
  136. 'Beta'
  137. 'Zeta'
  138. 'Upsilon'
  139. 'Rho'
  140. 'Cepheus'
  141. 'Calvin'
  142. 'Hobbes'
  143. 'Pooh'
  144. 'Tigger'
  145. 'Bambi'
  146. 'Dumbo'
  147. 'Tweety'
  148. 'Bugs'
  149. 'Torino'
  150. 'Denali'
  151. 'St. Moritz'
  152. 'Sauron'
  153. 'Smaug'
  154. 'Thune'
  155. 'Thorin'
  156. 'Gollum'
  157. 'Fazaron'
  158. 'Trellor'
  159. 'Regor'
  160. 'Basil'
  161. 'Ursula'
  162. 'Styx'
  163. 'Lentor'
  164. 'Sooltar'
  165. 'Romula'
  166. 'Vulcan'
  167. 'Hobbiton'
  168. 'Kessel'
  169. 'Redox'
  170. 'Sith'
  171. 'Yavin'
  172. 'Quatro'
  173. 'Remulak'
  174. 'Kathoon'
  175. 'Thanos'
  176. 'Krypton'
  177. 'Darven'
  178. 'Gotham'
  179. 'Klah'
  180. 'Zaphod'
  181. 'Turin'
  182. 'Krikkit'
  183. 'Vogon'
  184. 'Argot'
  185. 'Willy'
  186. 'Sirgil'
  187. 'Ender'
  188. 'Wobbler'
  189. 'Hoth'
  190. 'Naboo'
  191. 'Fomalhaut'
  192. 'Alpheratz'
  193. 'Arcturus'
  194. 'Regulus'
  195. 'Courasant'
  196. 'Aldebaran'
  197. 'Betelgeuse'
  198. 'Nekkar'
  199. 'Seginus'
  200. 'Benetnasch'
  201. 'Murphrid'
  202. 'Alkalurops'
  203. 'Acubens'
  204. 'Tegmen'
  205. 'Denebola'
  206. 'Aldhafera'
  207. 'Zavijava'
  208. 'Alderamin'
  209. 'Kornephoros'
  210. 'Yed Prior'
  211. 'Al Niyat'
  212. 'Andromeda'
  213. 'Sheratan'
  214. 'Achernar'
  215. 'A Centauri'
  216. 'Wolf 359'
  217. 'Genesis'
  218. 'Kirby'
  219. 'B Centauri'
  220. 'Tatooine'
  221. 'Alderran'
  222. 'Klendathu'
  223. 'Betazed'
  224. 'Cardassia'
  225. 'Delios VII'
  226. 'Ferenginar'
  227. "I'dania"
  228. 'Kostolian'
  229. 'Narenda III'
  230. 'Ocampa'
  231. 'Risa'
  232. 'Talax'
  233. 'Xendi Sabu'
  234. 'Yadera'
  235. 'Corellia'
  236. 'Coruscant'
  237. 'Geonosis'
  238. 'Kashyyyk'
  239. 'Arbra'
  240. 'Kamino'
  241. 'Lyra'
  242. 'Chetco'
  243. 'Cassidy'
  244. 'Zed'
  245. 'Arkanatex'
  246. 'Zoltar VII'
  247. 'Soph'
  248. 'Fluxer'
  249. 'Doldunn'
  250. 'Lochia'
  251. 'Crolax'
  252. 'Kylothia'
  253. 'Cerebrax'
  254. 'Quaz'
tSTL 6260 (prefix ''): 20 strings
  0. 'Search for more metal on your planets'
  1. 'Explore distant stars'
  2. 'Get lots of money immediately'
  3. 'Improve mining efficiency'
  4. 'Improve population maximums'
  5. 'Improve terraforming efficiency'
  6. 'Educate battle generals better'
  7. 'Improve recycling program'
  8. 'Improve technology output'
  9. 'Increase savings interest rate'
  10. 'Decrease borrowing interest rate'
  11. 'Build a decoy ship'
  12. 'Build a biological space monster'
  13. 'Steal technology from another player'
  14. 'Build a set of ships without development cost'
  15. 'Improve range tech dramatically'
  16. 'Improve speed tech dramatically'
  17. 'Improve weapons tech dramatically'
  18. 'Improve shields tech dramatically'
  19. 'Improve mini tech dramatically'
tSTL 6270 (prefix ''): 20 strings
  0. '1'
  1. '2'
  2. '3'
  3. '4'
  4. '5'
  5. '6'
  6. 'Topping off the Tanks'
  7. 'Fusion Pile'
  8. 'Magneto-Hydrodynamic Power'
  9. 'Allotropic Iron'
  10. 'Gravitic Battery'
  11. 'Quantum Energy Storage'
  12. 'Singularity'
  13. 'Plasma Siphon'
  14. 'Muon Ladder'
  15. 'There and Back'
  16. 'Quark Grinder'
  17. 'Pulsar Radiant'
  18. 'Anti-Matter'
  19. 'Star Harness'
tSTL 6271 (prefix ''): 20 strings
  0. '1'
  1. 'Solar Sail'
  2. 'Ion Rocket'
  3. 'Gravitic Slingshot'
  4. 'Fusion Dump Drive'
  5. 'Relativity Drive'
  6. 'Trans-Light'
  7. 'Hyperspace'
  8. 'Rift Drive'
  9. 'Hawking Propulsion System'
  10. 'Hyper-Rift Drive'
  11. 'PowerPC™'
  12. 'Trans-Rift Hyper Drive'
  13. 'Hawking Trans-Hyper Drive'
  14. 'Time Distortion'
  15. 'Quantum Continuum'
  16. 'Already There'
  17. 'Speedy Gonzalez™'
  18. 'Teleportation'
  19. 'Yesterday Drive'
tSTL 6272 (prefix ''): 21 strings
  0. '1'
  1. '2'
  2. 'Mass Driver Cannon'
  3. 'Laser 20'
  4. 'Turbolaser'
  5. 'Maser'
  6. 'Gamma-Ray Laser'
  7. 'Spectrum Cannon'
  8. 'Energy Ball'
  9. 'Nuclear Magnetic Resonance'
  10. 'Phase Disruption'
  11. 'Focused Quark Beam'
  12. 'Hard Pixel'
  13. 'Tachyon Cannon'
  14. '+5 Rustproof Vorpal'
  15. 'Hyperspace Pulse'
  16. 'Delta Particle Stream'
  17. 'Neutron Compression'
  18. 'Nova Cannon'
  19. 'Galactic Disruption'
  20. 'Advanced Space-Time Annihilation'
tSTL 6273 (prefix ''): 20 strings
  0. '1'
  1. '2'
  2. 'Armored Hull'
  3. 'Mass Repulser'
  4. 'Energy Dispersion'
  5. 'Deflector'
  6. 'Energy Bonded Armor'
  7. 'Anti-Energy'
  8. 'Quark Shell'
  9. 'Delta Wave'
  10. 'Energy Injestor'
  11. 'Refractor Field'
  12. 'Holographic Decoy'
  13. 'Stasis Flicker'
  14. 'Conversion Field'
  15. 'Tao Wave'
  16. 'Gluon Armor'
  17. 'Hide behind a big rock'
  18. '+5 Blessed Plate Mail'
  19. 'Displacer Field'
tSTL 6274 (prefix ''): 20 strings
  0. 'Integrated Circuit'
  1. 'Integrated Chip'
  2. 'Large Scale Integration'
  3. 'VLSI'
  4. 'Wonkavision'
  5. 'Ultra-microscopic'
  6. 'Nanoscopic'
  7. 'Advanced Nanoscopic'
  8. 'Really Amazingly Small'
  9. 'Yellow Polka Dot Bikini'
  10. 'Sub-Atomic'
  11. 'Partial Lepton'
  12. 'Quark'
  13. 'Sub-Quark'
  14. 'Micro-Quark'
  15. 'Nano-Quark'
  16. 'Advanced Nano-Quark'
  17. 'Bikini Again (Thought it was funny)'
  18. 'Quantum Superstring'
  19. 'Sub-Quantum Superstring'
tSTL 6280 (prefix ''): 20 strings
  0. 'Peter'
  1. 'Joe'
  2. 'Timmer'
  3. 'Howard'
  4. 'Bob'
  5. 'Ed'
  6. 'Mark'
  7. 'Guy'
  8. 'Ben'
  9. 'Dan'
  10. 'Kon'
  11. 'Brennan'
  12. 'John'
  13. 'Mike'
  14. 'Dave'
  15. 'Steve'
  16. 'Rosko'
  17. 'Willy'
  18. 'Jack'
  19. 'Albert'
tSTL 6281 (prefix ''): 22 strings
  0. 'Christie'
  1. 'Suzy'
  2. 'Ann'
  3. 'Julia'
  4. 'Nancy'
  5. 'Xena'
  6. 'Athena'
  7. 'Heather'
  8. 'Caryl'
  9. 'Jennifer'
  10. 'Kathy'
  11. 'Kate'
  12. 'Jane'
  13. 'Paula'
  14. 'Michelle'
  15. 'Iris'
  16. 'Pam'
  17. 'Liz'
  18. 'Alexis'
  19. 'Grace'
  20. 'Sabrina'
  21. 'Claire'
tSTL 6300 (prefix ''): 9 strings
  0. 'Outpost'
  1. 'Barren'
  2. 'Backward'
  3. 'Normal'
  4. 'Advanced'
  5. 'Thriving'
  6. 'Abundant'
  7. '--unused--'
  8. 'Any'
tSTL 6500 (prefix ''): 26 strings
  0. 'The version of Spaceward Ho! you are running is too old to talk with this server. Please go to www.deltatao.com and check for an update.'
  1. 'The server received a message with an invalid data length.'
  2. 'The server received a client message.'
  3. 'The client received a server message.'
  4. 'The game ID for the message that was just sent is unknown.'
  5. 'Received an unknown general message.'
  6. 'Received an unknown galaxy message.'
  7. "You can't join this game; it has already started."
  8. 'You cannot perform that operation; you are not the host of this game.'
  9. 'You are already in this game; you cannot be added again.'
  10. 'You are not in the game you just sent a message about.'
  11. 'Sorry, but you already ended your turn; you cannot end it agagin.'
  12. 'Uh-oh! You are not in the right year for this game. '
  13. 'Failed to connect to server. Server may not be responding.'
  14. 'Invalid change object for pre-start game.'
  15. 'Sorry but a game with that name already exists on the server.'
  16. 'A game with that game ID already exists on the sever. Try creating your game again.'
  17. 'The serial number you have supplied is invalid or does not match your user information; you will need to re-register.'
  18. 'There is already someone logged in to spacewardho.net with your serial number.'
  19. 'There is already someone logged in to spacewardho.net with your name.'
  20. 'Client authentication required.'
  21. 'The file you are trying to read is corrupted in some way.'
  22. 'The file you are trying to load is an incompatible version.'
  23. 'The player information you just sent had an invalid checksum. You may be out of sync.\n'
  24. 'The version of Spaceward Ho! you are running is too new to talk with the current server. Hrm.'
  25. 'There are already 8 humans in this game. Please try another game.'
tSTL 6501 (prefix ''): 3 strings
  0. 'General operational error. This is probably really bad.'
  1. 'Unknown key error (archive storage issue).'
  2. "Battle record missing; can't review battle."
tSTR 2000: 'The list in the top-left hand corner is the list of ship types you have designed and/or built. For ships designs that have already had at least one ship built, the Development Cost will be grayed out. Also, the Num built indicator will show more 1 or more. Scroll through the list to find the ship type you want to build and select that type by clicking on the item in the list (it should now be highlighted). Increase the number you want to build by clicking on the right-arrow button in the bottom-right hand corner of the screen. As you click-and-hold this button down, the number of ships will increase more rapidly. Once the indicator shows the number of ships you want to build, click the "Build" button.\n\nTo cancel out of this dialog without building any ships, just hit cancel.\n\nTo design a new ship type, you can adjust the ship class pop-up, in the top-right hand most corner. Then you can adjust the individual technology levels or just hit the "Max" button to increase all of the stats to their max level. Note: if the stats are already at their max level, the "Max" button will not be available.\n\nThe numbers in paranthesis to the left of the technology labels indicate your max level for that particular technology.\n\nUnderneath the ship types list is the current ship\'s name. If you are designing a new ship type, a new name will auto-matically be chosen for you. However, you can fill in your own name if chose. Simply click the field with the name, erase the current one and write in your own. Note: names of ship types do not have to be unique.\n\nAs you design a new ship, the costs for Development, Production and in Metal will change accordingly. To view this information, make sure the "C" push-button in the middle of the screen has been selection. These push-buttons control which information is displayed in the lower-left hand corner of the screen. If the "C" button is selected, you will see Cost information. If the "S" button is selection, you will see additional Stats on that ship type, including number in service, number built, total ship building capacity at that planet and whether or not that ship type has become "rusty". The Cost information includes Development cost, Production cost, Metal cost as well as indicators for the total money and metal it will take to fill your order as well as how much money and metal you would have afterwards.\n\nIf you do not have enough money to design and/or build a set of ships, you have the option of going into debt to make the purchase. Click the "Allow Debt" checkbox, and the indicators for the money you have in Reserve will increase by the amount of the loan. Once the order is placed, this money will be deducted from your savings and if you spend more money then you have in savings, it will be counted as a loan and your Reserve money will show up as negative.'
tSTR 2002: 'The Organize Fleets dialog is made up of two pop-ups and two lists. These pop-ups display a list of the current fleets at that planet. If you choose a particular fleet from a pop-up, the list below it will display a list of the ships in that fleet. You can use the right/left arrow button that appears in between the two ship lists to move ships from one fleet to another. The list with the selected ship indicates which is the currently selected fleet. The selected fleet is always the source fleet and the non-selected fleet (in the other list) is always the destination fleet.\n\nThe "Group All" button will move all ships at a planet to a single fleet. The "Split" button will split the selected fleet into individual fleets for each type in the source fleet. If there is only one type in the current fleet, the "Split" button will move each ship into its own fleet.\n\nFor each ship in a fleet, the following information is displayed:\nR: range\nS: speed\nF: remaining fuel\nC: number of colonists on board.\n\nFor each ship, the following information can be modified:\nDelayed Arrival: This allows the selected ship in the fleet to arrive later than other ships in the same fleet.\nBattle Attitude: This allows the selected ship to adopt a particular battle attitude, either normal, offensive or defensive.\n\nFor each fleet, the following information is displayed:\nETA: Estimated Time of Arrival at its destination\nScrap: the value in metal that would be returned to the player whose planet the fleet is orbitting if the fleet were dismantled and scrapped.\nTo: shows where the fleet is going to arrive next.\nFinal: shows where the fleet\'s final destination is.\n\nWhen you are done modifying your fleets, click the "Done" button.'
tSTR 2003: 'This is an unregistered copy of Spaceward Ho! 5 for the Palm OS. The Demo version limits you to a small, relatively dense galaxy playing against three bad guys each with an IQ of 70 points. Your home system is limited to Thriving and the computer players are limited to home systems based on their IQ. You can choose between a spiral shaped or circle shaped galaxy.\n\nIn the registered version of the game, you can customize the galaxy shape, size and density, your home system type, the number of computer players, their IQ and their starting home system type.\n\nIn the registered version, as you win games, you will receive master points. As your master points increase, you will increase your rank. Each rank you obtain unlocks even more features and options in customizing your games.'
tSTR 2004: 'You are in DEMO mode. You can not make allies in DEMO mode. To unlock this feature, you need to register your copy of Spaceward Ho! 5 for the Palm OS.\n\nYou can purchase Spaceward Ho! 5 for the Palm OS from www.mobilefreon.com.'
tSTR 2005: 'This is the Allies screen. Here you can adjust your relationship with the other players. Use the pop-ups next to each player to set the desired state of friendliness. If the player in question responds, you will be notified.'
tSTR 25000: '^0'
```
