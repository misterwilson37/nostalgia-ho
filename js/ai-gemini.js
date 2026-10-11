// js/ai-gemini.js — computer players for the "Gemini" ruleset.
//
// Written by Gemini (Google), including its "cold war" detector and its
// late-game turn to Biologicals (see docs/gemini-rules/). Tidied by Claude
// with NO change to how the game plays: this header and trailing whitespace
// only. Same seed, same game, before and after.

(function (root) {
    'use strict';
    const E = typeof module !== 'undefined' ? require('./engine.js') : root.HO;

    const AI = {
        name: 'gemini',

        make(G, p, iq) {
            return {
                iq: iq,
                active: true,
                topFighterId: null,
                topColonyId: null,
                topScoutId: null,
                coldWar: false
            };
        },

        turn(G, p) {
            if (!p.ai) p.ai = this.make(G, p, 100);

            this.manageBudget(G, p);
            this.manageTech(G, p);
            this.manageDesigns(G, p);
            this.manageBuilds(G, p);
            this.manageFleets(G, p);
        },

        noteBattle(G, p, rec, won) {},

        manageBudget(G, p) {
            let rules = E.rules(G);

            let baseTech = 0.20;
            let baseSavings = 0.35;
            let planetPool = 0.45;

            if (p.ai.coldWar) {
                // Space Race & Black Projects: Break the stalemate with Hyperdrives or Space Monsters
                baseTech = 0.60;
                baseSavings = 0.20;
                planetPool = 0.20;
            } else if (p.savings > 2000000) {
                baseTech = 0.50;
                baseSavings = 0.10;
                planetPool = 0.40;
            } else if (p.savings > 1000000 && p.metal < 50000) {
                baseSavings = 0.10;
                planetPool = 0.70;
            }

            p.budget.tech = baseTech;
            p.budget.savings = baseSavings;
            p.budget.col = {};

            let cols = E.colonies(G, p.id);
            if (cols.length === 0) return;

            let limit = rules.borrowLimit(G, p);
            let isNearBankrupt = limit < -10000 && p.savings < limit * 0.8;
            if (isNearBankrupt && cols.length > 1) {
                let worst = cols.sort((a, b) => a.pop - b.pop)[0];
                if (worst.pop < 20) worst.evacuating = true;
            }

            let needy = cols.filter(s => {
                let maxP = rules.maxPop(G, p, s);
                let needsTerra = Math.abs(s.t - p.homeT) > 0.5;
                let needsGrowth = s.pop < maxP * 0.95;
                let needsMine = s.metal > 0;
                return needsTerra || needsGrowth || needsMine;
            });

            if (needy.length > 0) {
                let share = planetPool / needy.length;
                for (let s of needy) {
                    p.budget.col[s.id] = share;
                }
            } else {
                p.budget.savings += planetPool;
            }
        },

        manageTech(G, p) {
            if (p.ai.coldWar) {
                // Skew heavily into Range, but reserve 10% for Radical to hopefully roll a bio-ship
                p.talloc = { range: 0.70, speed: 0.05, weapons: 0.05, shields: 0.05, mini: 0.05, radical: 0.10 };
            } else {
                p.talloc = { range: 0.35, speed: 0.15, weapons: 0.20, shields: 0.20, mini: 0.05, radical: 0.05 };
            }
        },

        manageDesigns(G, p) {
            let rules = E.rules(G);
            let R = p.tech.range;
            let V = p.tech.speed;
            let W = p.tech.weapons;
            let S = p.tech.shields;
            let M = p.tech.mini;

            let fighterD = E.findOrCreateDesign(G, p, { type: 'fighter', R: R, V: V, W: W, S: S, M: M });
            let colonyD = E.findOrCreateDesign(G, p, { type: 'colony', R: R, V: V, W: 1, S: 1, M: M });

            let scoutLimits = rules.designLimits(G, p, 'scout');
            let scoutD = E.findOrCreateDesign(G, p, { type: 'scout', R: scoutLimits.R, V: V, W: scoutLimits.W, S: scoutLimits.S, M: M });

            // MAD SCIENCE: If the AI successfully rolled a Space Monster from Radical tech, use it as the main fighter
            let bioD = Object.values(p.designs || {}).find(d => d.type === 'bio' && !d.scrapped);

            p.ai.topFighterId = bioD ? bioD.id : fighterD.id;
            p.ai.topColonyId = colonyD.id;
            p.ai.topScoutId = scoutD.id;

            let inUse = new Set();
            for (let f of G.fleets) {
                if (f.owner === p.id) {
                    for (let did in f.ships) {
                        if (f.ships[did] > 0) inUse.add(parseInt(did));
                    }
                }
            }

            let designVals = Object.values(p.designs || {});
            let activeCount = designVals.filter(d => !d.scrapped).length;

            if (activeCount > 20) {
                let keepIds = [fighterD.id, colonyD.id, scoutD.id];
                if (bioD) keepIds.push(bioD.id);

                for (let d of designVals) {
                    if (d.scrapped) continue;
                    if (!inUse.has(d.id) && !keepIds.includes(d.id)) {
                        d.scrapped = true;
                    }
                }
            }
        },

        manageBuilds(G, p) {
            let rules = E.rules(G);
            let cols = E.colonies(G, p.id);
            if (cols.length === 0) return;

            let scCost = rules.designCost(G, E.getDesign(G, p.id, p.ai.topScoutId)).money;
            let coCost = rules.designCost(G, E.getDesign(G, p.id, p.ai.topColonyId)).money;
            let fiCostMoney = rules.designCost(G, E.getDesign(G, p.id, p.ai.topFighterId)).money;
            let fiCostMetal = rules.designCost(G, E.getDesign(G, p.id, p.ai.topFighterId)).metal;

            let myScouts = 0, myColonies = 0;
            let strandedStars = new Set();

            for (let f of G.fleets) {
                if (f.owner === p.id) {
                    for(let did in f.ships) {
                        let d = E.getDesign(G, p.id, parseInt(did));
                        if (d && d.type === 'scout') myScouts += f.ships[did];
                        if (d && d.type === 'colony') myColonies += f.ships[did];
                    }

                    if (f.star !== null && G.stars[f.star]) {
                        if (!E.fleetHas(G, f, 'colony')) {
                            let s = G.stars[f.star];
                            if (s.owner === -1) {
                                strandedStars.add(f.star);
                            }
                        }
                    }
                }
            }

            let uncolonizedCount = Object.keys(G.stars).filter(k => {
                let kStar = E.know(G, p, parseInt(k));
                return kStar.owner === -1;
            }).length;

            let producers = cols.sort((a, b) => b.metal - a.metal);
            let bestPlanetId = producers[0].id;

            let targetScouts = Math.min(10, 3 + Math.floor(cols.length / 5));
            let targetColonies = Math.min(25, 3 + (strandedStars.size * 2) + Math.floor(cols.length / 10));

            let proj = rules.projected(G, p);
            let safeToExpand = p.savings > 0 && proj.net > -2000;
            let needsRescue = strandedStars.size > 0;

            if (uncolonizedCount > 0 && (safeToExpand || needsRescue)) {
                if (myScouts < targetScouts && p.savings >= scCost) {
                    E.buildShips(G, p.id, bestPlanetId, p.ai.topScoutId, 1);
                }
                if (myColonies < targetColonies && p.savings >= coCost) {
                    E.buildShips(G, p.id, bestPlanetId, p.ai.topColonyId, 1);
                }
            }

            let reserve = G.year < 30 ? 100000 : 25000;
            let surplus = p.savings - reserve;

            if (surplus >= fiCostMoney) {
                let maxByMoney = Math.floor(surplus / fiCostMoney);
                let maxByMetal = fiCostMetal > 0 ? Math.floor(p.metal / fiCostMetal) : maxByMoney;
                let buildFighters = Math.min(maxByMoney, maxByMetal);

                if (buildFighters > 0) {
                    let topProducers = producers.slice(0, 3);
                    let perPlanet = Math.max(1, Math.floor(buildFighters / topProducers.length));

                    for (let i = 0; i < topProducers.length; i++) {
                        if (buildFighters <= 0) break;
                        let toBuild = (i === topProducers.length - 1) ? buildFighters : Math.min(perPlanet, buildFighters);
                        E.buildShips(G, p.id, topProducers[i].id, p.ai.topFighterId, toBuild);
                        buildFighters -= toBuild;
                    }
                }
            }
        },

        manageFleets(G, p) {
            let rules = E.rules(G);
            let myFleets = G.fleets.filter(f => f.owner === p.id && f.to == null);

            let totalFighters = 0;
            let idleFighters = 0;

            for (let f of myFleets) {
                let fuel = f.fuel;

                let isFighter = E.fleetHas(G, f, 'fighter') || E.fleetHas(G, f, 'bio');
                let shipCount = 0;
                for (let did in f.ships) shipCount += f.ships[did];

                if (isFighter) totalFighters += shipCount;

                if (fuel <= 0) {
                    if (isFighter) idleFighters += shipCount;
                    continue;
                }

                let fStar = G.stars[f.star];
                if (!fStar) continue;

                let bestTarget = null;
                let bestScore = -999999;

                let isColony = E.fleetHas(G, f, 'colony');
                let isScout = E.fleetHas(G, f, 'scout');
                let canRefuelAnywhere = isScout || E.fleetHas(G, f, 'tanker') || E.fleetHas(G, f, 'bio');

                for (let sid in G.stars) {
                    let id = parseInt(sid);
                    if (id === f.star) continue;

                    let s = G.stars[id];
                    let dist = rules.distance(G, fStar, s);
                    if (dist > fuel + 0.001) continue;

                    let k = E.know(G, p, id);
                    let isEnemy = k.owner !== -1 && k.owner !== p.id && !E.isAllied(G, p.id, k.owner);
                    let isFriendly = k.owner === p.id || E.isAllied(G, p.id, k.owner);
                    let isEmpty = k.owner === -1;

                    let willBecomeFriendly = (isColony && isEmpty) || (isFighter && isEnemy);

                    if (!canRefuelAnywhere && !isFriendly && !willBecomeFriendly) {
                        let nearestFriendlyFromDest = 999999;
                        for (let sid2 in G.stars) {
                            let id2 = parseInt(sid2);
                            let k2 = E.know(G, p, id2);
                            if (k2.owner === p.id || E.isAllied(G, p.id, k2.owner)) {
                                let d2 = rules.distance(G, s, G.stars[id2]);
                                if (d2 < nearestFriendlyFromDest) nearestFriendlyFromDest = d2;
                            }
                        }
                        if (dist + nearestFriendlyFromDest > fuel + 0.001) {
                            continue;
                        }
                    }

                    let score = -dist;

                    if (isColony) {
                        if (k.explored && isEmpty) {
                            let maxP = rules.maxPop(G, p, s);
                            let hasStrandedFriendly = G.fleets.some(mf => mf.star === id && mf.owner === p.id && !E.fleetHas(G, mf, 'colony'));

                            if (maxP < 15 && p.savings < 150000 && !hasStrandedFriendly) continue;

                            let tDiff = Math.abs((k.t || 100) - p.homeT);
                            score += 1000 - tDiff;

                            if (hasStrandedFriendly) {
                                score += 10000;
                            }

                            if (score > bestScore) { bestScore = score; bestTarget = id; }
                        } else if (!k.explored) {
                            score += 500;
                            if (score > bestScore) { bestScore = score; bestTarget = id; }
                        }
                    } else if (isScout) {
                        if (!k.explored) {
                            score += 1000;
                            if (score > bestScore) { bestScore = score; bestTarget = id; }
                        } else if (isEnemy) {
                            score += 800;
                            if (score > bestScore) { bestScore = score; bestTarget = id; }
                        }
                    } else if (isFighter) {
                        if (k.explored && isEnemy) {
                            score += 2000;
                            if (k.pop < 50) score += 500;
                            if (score > bestScore) { bestScore = score; bestTarget = id; }
                        } else if (!k.explored) {
                            score += 300;
                            if (score > bestScore) { bestScore = score; bestTarget = id; }
                        }
                    }
                }

                let validStagingOrigin = (fStar.owner === p.id || E.isAllied(G, p.id, fStar.owner));
                if (bestTarget === null && isFighter && validStagingOrigin) {
                    let closestTargetDist = 999999;
                    let closestTargetId = null;

                    for (let sid in G.stars) {
                        let k = E.know(G, p, parseInt(sid));
                        let isE = k.owner !== -1 && k.owner !== p.id && !E.isAllied(G, p.id, k.owner);

                        if (isE || !k.explored) {
                            let d = rules.distance(G, fStar, G.stars[sid]);
                            if (d < closestTargetDist) {
                                closestTargetDist = d;
                                closestTargetId = parseInt(sid);
                            }
                        }
                    }

                    if (closestTargetId !== null) {
                        let targetStar = G.stars[closestTargetId];
                        let bestHopDist = closestTargetDist;
                        let hopTarget = null;

                        for (let sid in G.stars) {
                            let id = parseInt(sid);
                            if (id === f.star) continue;
                            let s = G.stars[id];

                            let distToHop = rules.distance(G, fStar, s);
                            if (distToHop > fuel + 0.001) continue;

                            let k = E.know(G, p, id);
                            if (k.owner === p.id || E.isAllied(G, p.id, k.owner)) {
                                let distFromHopToTarget = rules.distance(G, s, targetStar);
                                if (distFromHopToTarget < bestHopDist) {
                                    bestHopDist = distFromHopToTarget;
                                    hopTarget = id;
                                }
                            }
                        }
                        if (hopTarget !== null) bestTarget = hopTarget;
                    }
                }

                if (bestTarget === null && fStar.owner !== p.id && !E.isAllied(G, p.id, fStar.owner) && !canRefuelAnywhere) {
                    let nearestDist = 999999;
                    for (let sid in G.stars) {
                        let id = parseInt(sid);
                        if (id === f.star) continue;
                        let s = G.stars[id];
                        let k = E.know(G, p, id);
                        if (k.owner === p.id || E.isAllied(G, p.id, k.owner)) {
                            let dist = rules.distance(G, fStar, s);
                            if (dist <= fuel + 0.001 && dist < nearestDist) {
                                nearestDist = dist;
                                bestTarget = id;
                            }
                        }
                    }
                }

                if (bestTarget !== null) {
                    E.orderMove(G, f, bestTarget);
                } else if (isFighter) {
                    idleFighters += shipCount;
                }
            }

            if (totalFighters > 50 && (idleFighters / totalFighters) > 0.85) {
                p.ai.coldWar = true;
            } else {
                p.ai.coldWar = false;
            }
        }
    };

    E.registerAI('gemini', AI);
})(this);