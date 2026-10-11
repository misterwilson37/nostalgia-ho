// js/rules-gemini.js — the "Gemini" ruleset for the Spaceward Ho! web remake.
//
// Written by Gemini (Google) from the Spaceward Ho! 5 manual alone, over
// many rounds of test results relayed by Jake (see docs/gemini-rules/).
// Tidied by Claude with NO change to how the game plays: this header and
// trailing whitespace only. Same seed, same game, before and after.

(function (root) {
    'use strict';
    const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;

    // --- GAME CONSTANTS & BALANCE ---
    const BASE_UPKEEP = 7500;
    const DEBT_RATE = 0.15;
    const MAX_DEBT_MULTIPLIER = 5;
    const TECH_BASE_COST = 5000;

    // --- UTILITIES ---
    const distT = (s, p) => Math.abs(s.t - p.homeT);
    const distG = (s, p) => Math.abs(s.g - p.homeG);
    const getProfitMod = (s, p) => {
        let mod = 1.0 - (distT(s, p) * 0.01) - (distG(s, p) * 0.4);
        return Math.max(-0.5, Math.min(1.0, mod));
    };
    const dimReturn = (money, efficiency) => Math.sqrt(Math.max(0, money)) * efficiency;

    const Rules = {
        label: 'Gemini (rebuilt from the manual)',
        ai: 'gemini',
        yearsPerTurn: 10,
        maxDesigns: 30,
        galaxySizes: {
            small: [15, 12, 9],
            medium: [30, 18, 13],
            large: [50, 24, 18],
            huge: [80, 30, 22]
        },
        features: {
            alliances: true,
            chat: true,
            gifts: true,
            lateArrival: true,
            stances: true,
            surrender: true,
            waypoints: true,
            yearsPerTurn: true
        },
        colonyShipUsedUp: true,
        celsius: false,
        bestBuddies: true,
        evacuateCommand: true,
        evacuateToggle: {
            words: ['Evacuate', 'Cancel Evac'],
            marked: (G, sid) => G.stars[sid].evacuating === true,
            ask: (G, p, sid) => {
                if (G.stars[sid].evacuating) return { text: "Changed your mind? We'll unpack the bags.", notice: true };
                return { text: "Are you sure you want to abandon this rock? The colonists are finally getting used to the smell." };
            }
        },

        setupPlayer(G, p, home, start) {
            p.savings = 250000;
            p.metal = 15000;
            p.budget = { tech: 0.15, savings: 0.10, col: {} };
            p.talloc = { range: 0.2, speed: 0.2, weapons: 0.2, shields: 0.2, mini: 0.1, radical: 0.1 };

            p.tech = { range: 5, speed: 1, weapons: 1, shields: 1, mini: 1, radical: 1 };
            p.techProg = { range: 0, speed: 0, weapons: 0, shields: 0, mini: 0, radical: 0 };

            home.owner = p.id;
            home.pop = 50.0;
            home.t = p.homeT;
            home.terra = 0.5;
            p.budget.col[home.id] = 0.75;
        },

        afterSetup(G) {},

        newStar(G) {
            let gVal;
            do {
                if (E.R(G) < 0.3) {
                    gVal = 0.2 + E.R(G) * 3.3;
                } else {
                    gVal = E.gauss(G) * 0.8 + 1.2;
                }
            } while (gVal < 0.2 || gVal > 3.5);

            return {
                g: gVal,
                t: E.RI(G, -50, 250),
                metal: E.RI(G, 100, 50000)
            };
        },

        defaultDesigns(G, p) {
            E.findOrCreateDesign(G, p, { type: 'scout', R: 8, V: 2, W: 1, S: 1, M: 1 });
            E.findOrCreateDesign(G, p, { type: 'colony', R: 5, V: 1, W: 1, S: 1, M: 1 });
            E.findOrCreateDesign(G, p, { type: 'fighter', R: 5, V: 1, W: 1, S: 1, M: 1 });
        },

        maxPop(G, p, s) {
            let mod = getProfitMod(s, p);
            return Math.max(0, 100 * mod);
        },

        planetClass(G, gs) {
            if (gs < 0.4 || gs > 2.5) return 'inhospitable';
            if (gs < 0.7 || gs > 1.5) return 'semi';
            return 'good';
        },

        planetIncome(G, p, s) {
            if (s.owner !== p.id) return 0;
            let mod = getProfitMod(s, p);
            let gross = (s.pop * 750 * mod) - BASE_UPKEEP;
            return gross;
        },

        projected(G, p) {
            let income = E.colonies(G, p.id).reduce((sum, s) => sum + this.planetIncome(G, p, s), 0);
            let interest = p.savings < 0 ? p.savings * DEBT_RATE : 0;
            let net = income + interest;
            return { income, interest, net };
        },

        borrowLimit(G, p) {
            let inc = E.colonies(G, p.id).reduce((sum, s) => sum + Math.max(0, this.planetIncome(G, p, s)), 0);
            return -(inc * MAX_DEBT_MULTIPLIER);
        },

        economy(G, p) {
            let proj = this.projected(G, p);
            p.lastGross = proj.income;
            p.lastIncome = proj.net;

            p.savings += proj.net;

            let spendable = Math.max(0, p.lastIncome);
            p.lastNet = spendable;

            let techDollars = spendable * (p.budget.tech || 0);
            p.savings -= techDollars;

            for (const k of E.TECHS) {
                if (k === 'radical' && p.budget.noRadical) continue;
                let alloc = p.talloc[k] || 0;
                let spent = techDollars * alloc;

                if (spent > 0) {
                    p.techProg[k] += dimReturn(spent, 25.0);
                    let cost = Math.pow(p.tech[k], 2) * TECH_BASE_COST;

                    if (p.techProg[k] >= cost) {
                        p.techProg[k] -= cost;
                        p.tech[k]++;
                        if (p.human) {
                            E.msg(G, p.id, `Your ${E.DATA.techNames[k] || k} technology has reached level ${p.tech[k]}!`, { icon: 'm9010', quiet: false });
                        }
                    }
                }
            }

            if (techDollars * (p.talloc['radical'] || 0) > 1000) {
                this.rollRadical(G, p);
            }

            let cols = E.colonies(G, p.id);
            for (const s of cols) {
                let colSpend = spendable * (p.budget.col[s.id] || 0);
                p.savings -= colSpend;

                if (s.evacuating) {
                    E.evacuate(G, p.id, s.id);
                    continue;
                }

                let tSpend = colSpend * (s.terra != null ? s.terra : 0.5);
                let mSpend = colSpend * (1 - (s.terra != null ? s.terra : 0.5));

                if (tSpend > 0 && Math.abs(s.t - p.homeT) > 0.5) {
                    let move = dimReturn(tSpend, 0.5);
                    if (s.t > p.homeT) s.t = Math.max(p.homeT, s.t - move);
                    else s.t = Math.min(p.homeT, s.t + move);
                }
                if (mSpend > 0 && s.metal > 0) {
                    let extracted = Math.floor(dimReturn(mSpend, 2.0));
                    extracted = Math.min(extracted, s.metal);
                    s.metal -= extracted;
                    p.metal += extracted;
                }

                let maxP = this.maxPop(G, p, s);
                if (s.pop < maxP) {
                    let growth = s.pop * 0.15 * Math.max(0.1, getProfitMod(s, p));
                    s.pop = Math.min(maxP, s.pop + Math.max(0.02, growth));
                } else if (s.pop > maxP) {
                    s.pop -= s.pop * 0.05;
                }
            }

            // BANKRUPTCY PENALTY ("Bad Things Happen")
            let limit = this.borrowLimit(G, p);
            if (p.savings < limit) {
                if (p.human) {
                    E.msg(G, p.id, "BANKRUPTCY! Debts exceeded borrow limits. Colonists rioted, tech research was lost, and ships were repossessed!", { icon: 'm9002' });
                }

                // Pin to 80% of debt limit to provide a 1-turn cushion against looping, but strictly prevent exploit bouncing.
                p.savings = limit * 0.8;
                p.metal = Math.floor(p.metal * 0.2);

                for (let k of E.TECHS) p.techProg[k] = 0;

                for (let s of cols) s.pop = Math.max(0.01, s.pop * 0.7);

                let bailout = 0;
                for (let i = G.fleets.length - 1; i >= 0; i--) {
                    let f = G.fleets[i];
                    if (f.owner === p.id) {
                        let totalShips = 0;
                        for (let did in f.ships) {
                            let d = E.getDesign(G, p.id, parseInt(did));
                            let count = f.ships[did];
                            let repossessed = Math.ceil(count * 0.5);
                            f.ships[did] -= repossessed;

                            // Bank liquidates the ships and applies 50% scrap value to the massive debt
                            if (d && repossessed > 0) {
                                let cost = this.designCost(G, d);
                                bailout += repossessed * cost.money * 0.5;
                            }

                            if (f.ships[did] <= 0) {
                                delete f.ships[did];
                            } else {
                                totalShips += f.ships[did];
                            }
                        }
                        if (totalShips === 0) {
                            G.fleets.splice(i, 1);
                        }
                    }
                }

                p.savings += bailout;
                if (p.savings < limit) {
                    p.savings = limit * 0.8;
                }
            }
        },

        rollRadical(G, p) {
            if (E.R(G) > 0.05) return;
            const events = [
                () => {
                    p.tech.weapons += 2;
                    E.msg(G, p.id, "Breakthrough! Your scientists strapped a fusion reactor to a magnifying glass. Weapons Tech +2!", { icon: 'm9007', sound: 2000 });
                },
                () => {
                    p.tech.shields += 2;
                    E.msg(G, p.id, "Eureka! By wrapping ships in polarized bubble wrap, Shield Tech jumped by 2!", { icon: 'm9008', sound: 2000 });
                },
                () => {
                    E.findOrCreateDesign(G, p, { type: 'bio', R: p.tech.range, V: p.tech.speed, W: p.tech.weapons, S: p.tech.shields, M: 1, name: "Space Monster" });
                    E.msg(G, p.id, "Your mad scientists bred a living Space Monster ship! It requires zero metal, but eats colonists for fuel.", { icon: 'm9036', sound: 2000 });
                },
                () => {
                    p.savings += 500000;
                    E.msg(G, p.id, "Your radical economists found a loophole in the galactic tax code. +$500,000!", { icon: 'm9002', sound: 2000 });
                },
                () => {
                    E.msg(G, p.id, "Your scientists threw a massive party with the radical tech budget. No scientific discoveries, but the karaoke was legendary.", { icon: 'm9011', sound: 2001 });
                }
            ];
            E.pick(G, events)();
        },

        designLimits(G, p, type) {
            let l = { R: p.tech.range, V: p.tech.speed, W: p.tech.weapons, S: p.tech.shields, M: p.tech.mini };
            if (type === 'scout') { l.R += 3; l.W = Math.max(1, l.W - 1); l.S = Math.max(1, l.S - 1); }
            if (type === 'satellite') { l.R = 0; }
            if (type === 'decoy') { l.W = 0; }
            return l;
        },

        designMin(G, k, type) {
            if (type === 'decoy' && k === 'W') return 0;
            if (type === 'satellite' && k === 'R') return 0;
            return 1;
        },

        designCost(G, d) {
            let power = Math.max(1, d.W) * Math.max(1, d.S) * Math.max(1, d.R) * d.V;
            let miniModMetal = d.type === 'colony' ? 1 : Math.pow(0.80, Math.max(0, d.M - 1));
            let miniModMoney = 1.0 + ((d.M - 1) * 0.1);
            let multMetal = 5;
            let multMoney = 100;

            if (d.type === 'fighter') { multMetal *= 1; multMoney *= 1; }
            else if (d.type === 'scout') { multMetal *= 0.5; multMoney *= 1.5; }
            else if (d.type === 'satellite') { multMetal *= 0.3; multMoney *= 0.8; }
            else if (d.type === 'tanker') { multMetal *= 5; multMoney *= 5; }
            else if (d.type === 'colony') { multMetal = 500; multMoney = 15000; power = 1; miniModMetal = 1; }
            else if (d.type === 'dread') { multMetal *= 20; multMoney *= 25; }
            else if (d.type === 'bio') { multMetal = 0; multMoney *= 10; power *= 2; miniModMetal = 0; }
            else if (d.type === 'decoy') { multMetal *= 0.1; multMoney *= 0.1; }

            return {
                metal: Math.floor(power * multMetal * miniModMetal),
                money: Math.floor(power * multMoney * miniModMoney),
                proto: Math.floor(power * multMoney * 2)
            };
        },

        paysPrototype(G, p, d) { return true; },

        canBuild(G, p, type) { return true; },

        distance(G, s1, s2) {
            return Math.hypot(s1.x - s2.x, s1.y - s2.y);
        },

        refuel(G) {
            for (const f of G.fleets) {
                if (f.to != null || f.sat) continue;
                let s = G.stars[f.star];

                if (E.fleetHas(G, f, 'bio')) {
                    if (f.fuel < E.fleetMaxRange(G, f) && s.pop > 0) {
                        let eaten = Math.min(s.pop, 0.5);
                        s.pop -= eaten;

                        if (s.pop <= 0) {
                            s.pop = 0;
                            s.owner = -1;
                        }

                        f.fuel = E.fleetMaxRange(G, f);
                    }
                    continue;
                }

                let canRefuel = (s.owner === f.owner) || E.isAllied(G, s.owner, f.owner);
                if (!canRefuel && E.fleetHas(G, f, 'scout')) canRefuel = true;

                if (!canRefuel) {
                    let alliedTankers = G.fleets.find(tf => tf.star === f.star && tf.to == null && E.fleetHas(G, tf, 'tanker') && E.isAllied(G, tf.owner, f.owner));
                    if (alliedTankers) canRefuel = true;
                }

                if (canRefuel) {
                    f.fuel = E.fleetMaxRange(G, f);
                }
            }
        },

        battle(G, sid) {
            const s = G.stars[sid];
            const fleetsHere = G.fleets.filter(f => f.star === sid && f.to == null);
            if (fleetsHere.length === 0) return null;

            let ownerIds = [...new Set(fleetsHere.map(f => f.owner))];
            if (s.owner >= 0 && s.pop > 0 && !ownerIds.includes(s.owner)) ownerIds.push(s.owner);
            if (!ownerIds.some(a => ownerIds.some(b => !E.isAllied(G, a, b)))) return null;

            let originalPlanetOwner = s.owner >= 0 ? s.owner : -1;
            let combatants = [];
            let startRecord = [];

            for (const f of fleetsHere) {
                for (const did in f.ships) {
                    let count = f.ships[did];
                    let d = E.getDesign(G, f.owner, parseInt(did));
                    if (!d) continue;

                    for (let i = 0; i < count; i++) {
                        let hp = (d.W + d.S) || 1;
                        let shots = d.W || 0;
                        if (d.type === 'dread') { hp *= 25; shots *= 25; }
                        if (d.type === 'satellite') { shots *= 2; }
                        if (d.type === 'decoy') { hp = 1; shots = 0; }

                        combatants.push({
                            idx: combatants.length,
                            owner: f.owner,
                            design: d,
                            fleet: f,
                            did: parseInt(did),
                            hp: hp,
                            maxHp: hp,
                            shots: shots,
                            speed: d.V,
                            dead: false
                        });
                        startRecord.push({ o: f.owner, t: d.type, did: parseInt(did) });
                    }
                }
            }

            combatants.sort((a, b) => b.speed - a.speed);

            let initialPop = s.pop;
            let roundsRecord = [];
            let round = 0;

            while (round < 50) {
                let roundEvents = [];
                let activeOwners = [...new Set(combatants.filter(c => !c.dead).map(c => c.owner))];
                if (s.owner >= 0 && s.pop > 0 && !activeOwners.includes(s.owner)) activeOwners.push(s.owner);
                if (!activeOwners.some(a => activeOwners.some(b => !E.isAllied(G, a, b)))) break;

                for (let attacker of combatants) {
                    if (attacker.dead || attacker.shots <= 0) continue;

                    let targets = combatants.filter(c => !c.dead && !E.isAllied(G, attacker.owner, c.owner));
                    let targetPlanet = (s.owner >= 0 && s.pop > 0 && !E.isAllied(G, attacker.owner, s.owner));

                    if (targets.length === 0 && !targetPlanet) continue;

                    let totalShots = attacker.shots;
                    while (totalShots > 0) {
                        if (targets.length === 0 && !targetPlanet) break;

                        let targetIdx = E.RI(G, 0, targets.length + (targetPlanet ? 1 : 0) - 1);
                        if (targetIdx === targets.length) {
                            s.pop -= 0.1;
                            if (s.pop <= 0) {
                                s.pop = 0;
                                targetPlanet = false;
                                roundEvents.push({ a: attacker.owner, si: attacker.idx, p: true, k: true });
                            } else {
                                roundEvents.push({ a: attacker.owner, si: attacker.idx, p: true });
                            }
                        } else {
                            let def = targets[targetIdx];
                            let dmg = Math.pow(2, attacker.design.W - def.design.S) * 10;
                            def.hp -= dmg;
                            if (def.hp <= 0) {
                                def.dead = true;
                                targets.splice(targetIdx, 1);
                            }
                            roundEvents.push({ a: attacker.owner, si: attacker.idx, ti: def.idx, k: def.dead });
                        }
                        totalShots--;
                    }
                }
                roundsRecord.push(roundEvents);
                round++;
            }

            let survivors = {};
            let lost = {};
            let debris = 0;

            for (const f of fleetsHere) {
                f.ships = {};
            }

            for (let c of combatants) {
                if (!c.dead) {
                    c.fleet.ships[c.did] = (c.fleet.ships[c.did] || 0) + 1;
                    survivors[c.owner] = (survivors[c.owner] || 0) + 1;
                } else {
                    lost[c.owner] = (lost[c.owner] || 0) + 1;
                    debris += E.designCost(G, c.design).metal * 0.25;
                }
            }

            s.debris = (s.debris || 0) + Math.floor(debris);

            for (let i = G.fleets.length - 1; i >= 0; i--) {
                if (G.fleets[i].star === sid && E.fleetCount(G.fleets[i]) === 0) {
                    G.fleets.splice(i, 1);
                }
            }

            let planetDied = (initialPop > 0 && s.pop <= 0);
            if (planetDied) s.owner = -1;

            let rec = {
                id: G.battles.length + 1,
                star: sid,
                year: G.year,
                sides: ownerIds,
                start: startRecord,
                rounds: roundsRecord,
                end: [],
                pop0: initialPop,
                popR: [s.pop],
                lost: lost,
                survivors: survivors,
                planetOwner: originalPlanetOwner,
                planetDied: planetDied
            };
            G.battles.push(rec);

            return {
                ownerIds,
                survivors,
                lost,
                planetOwner: s.owner >= 0 ? s.owner : -1,
                planetDied,
                startPop: initialPop,
                rec
            };
        },

        scrapped(G, p, f, d) {},
        scrapReturn(G, p) { return 0.75; },
        scrapAt(G, pid, s, metal) { s.metal += metal; },
        scrapInSpace(G, f, metal) {},

        settle(G, p, s, f, d) {
            s.owner = p.id;
            s.pop = 0.01;
            s.terra = 0.5;
            p.budget.col[s.id] = 0.05;
        },

        exploreQuality(G, p, s) {
            let mod = getProfitMod(s, p);
            if (mod > 0.8) return 'good';
            if (mod > 0.2) return 'mediocre';
            return 'bad';
        },

        randomEvents(G) {},

        dragShare(G, p, key, newPerMille) {
            let frac = E.clamp(newPerMille / 1000, 0, 1);
            let target = key;
            if (target === 'tech') p.budget.tech = frac;
            else if (target === 'savings') p.budget.savings = frac;
            else p.budget.col[target] = frac;

            let otherTotal = 0;
            if (target !== 'tech') otherTotal += p.budget.tech;
            if (target !== 'savings') otherTotal += p.budget.savings;
            for (let id in p.budget.col) {
                if (id != target) otherTotal += p.budget.col[id];
            }
            if (otherTotal === 0) return;

            let scale = Math.max(0, 1.0 - frac) / otherTotal;
            if (target !== 'tech') p.budget.tech *= scale;
            if (target !== 'savings') p.budget.savings *= scale;
            for (let id in p.budget.col) {
                if (id != target) p.budget.col[id] *= scale;
            }
        }
    };

    // The game's first messages, in Gemini's own words (written for the
    // integration at Jake's request; see docs/gemini-rules/HANDOFF.md).
    Rules.welcome = [
        ["Spaceward Ho! \u2014 Gemini's rules, built from the Spaceward Ho! 5 manual alone. Click a message to make it go away.", { icon: 'm9004', sound: 11111 }],
        ["When the messages are gone, click the clock to end your turn. Good luck, and keep the bubble wrap handy for diplomatic emergencies!", { icon: 'm9024' }],
    ];
    E.registerRules('gemini', Rules);
})(this);