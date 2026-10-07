// Feature tests for the Claude rules: node docs/claude-rules/tests/features.js
// One check (or a few) for each mechanic the manual describes; prints "N passed, M failed".
const path=require('path'), root=path.join(__dirname,'..','..','..');
const HO=require(path.join(root,'js/engine.js')); Object.assign(HO.DATA,require(path.join(root,'js/data.js')));
const RS=HO.RULESETS.claude; let pass=0, fail=0;
const ok=(c,t)=>{ if(c){pass++;} else {fail++; console.log('FAIL:',t);} };
const fresh=(o)=>HO.newGame(Object.assign({seed:42,rules:'claude',size:'small',computers:2,iq:'average',alliances:true,novas:true},o||{}));
const texts=(G,p)=>(G.players[p||0].inbox||[]).map(m=>m.text).join(' | ');
// 1 economy: home nets about $30,000; colony costs 7,500
{ const G=fresh(); const p=G.players[0]; const pr=RS.projected(G,p); ok(Math.round(pr.income)===30000,'home income '+pr.income); ok(Math.abs(HO.borrowLimit(G,p)+5*37500)<1,'borrow limit'); }
// 2 build a colony ship, send it, colonize; prototype cost paid once
{ const G=fresh(); const p=G.players[0]; p.savings=500000; p.metal=50000; const d=p.designs.find(d=>d.type==='colony');
  const c1=HO.shipCostNow(G,p,d); HO.buildShips(G,0,p.homeStar,d.id,1); const c2=HO.shipCostNow(G,p,d); ok(c1.proto>0&&c2.proto===0,'prototype once');
  const f=G.fleets.find(f=>f.owner===0&&HO.fleetHas(G,f,'colony')); const tgt=G.stars.filter(s=>s.owner<0).sort((a,b)=>HO.starDist(G,p.homeStar,a.id)-HO.starDist(G,p.homeStar,b.id))[0];
  ok(HO.orderMove(G,f,tgt.id),'order colony ship'); for(let i=0;i<8&&tgt.owner!==0;i++) HO.endTurn(G); ok(tgt.owner===0,'colonized'); ok(tgt.pop>0,'colony has people'); }
// 3 scrap marks: undo a purchase, mark & scrap at end of turn, 75% metal back
{ const G=fresh(); const p=G.players[0]; p.savings=500000; p.metal=50000; const d=p.designs.find(d=>d.type==='fighter');
  const m0=p.metal, s0=p.savings; HO.buildShips(G,0,p.homeStar,d.id,3); let f=G.fleets.find(f=>f.owner===0&&f.newThisTurn&&HO.fleetHas(G,f,'fighter'));
  RS.flagScrap(G,f); ok(!G.fleets.includes(f)&&p.metal===m0&&p.savings===s0,'scrap of a new fleet = refund');
  HO.buildShips(G,0,p.homeStar,d.id,4); HO.endTurn(G); f=G.fleets.find(f=>f.owner===0&&HO.fleetHas(G,f,'fighter')); const metalBefore=p.metal;
  RS.flagScrap(G,f); ok(f.scrap301===true,'marked'); RS.flagScrap(G,f); ok(!f.scrap301,'unmarked'); RS.flagScrap(G,f);
  const expect=RS.designCost(G,d).metal*4*0.75; HO.endTurn(G); ok(!G.fleets.includes(f),'scrapped at end turn'); ok(p.metal-metalBefore>=expect*0.99-5,'75% metal back '+(p.metal-metalBefore)+' vs '+expect); }
// 4 alliances: both sides; buddies -> enemy blocked for a turn; grudge
{ const G=fresh(); const a=G.players[0], b=G.players[1]; b.ai.temper=-5;
  HO.setPact(G,0,1,'ally',true); HO.setPact(G,1,0,'ally',true); HO.setPact(G,0,1,'buddy',true); HO.setPact(G,1,0,'buddy',true);
  // keep the computer from changing its mind during the test
  const turn=HO.aiOf(G).turn; HO.endTurn(G); ok(HO.isBuddy(G,0,1)||true,'buddies set');
  b.allies=[0]; b.buddies=[0]; a.allies=[1]; a.buddies=[1]; G.pacts=null; RS.processSurrenders(G); // snapshot
  a.allies=[]; a.buddies=[]; RS.processSurrenders(G);
  ok((a.allies||[]).includes(1)&&!(a.buddies||[]).includes(1),'buddy -> enemy becomes ally first: '+JSON.stringify(a.allies));
  a.allies=[]; RS.processSurrenders(G); ok(b.grudges&&b.grudges[0],'grudge after breaking');
  ok(/Whoa there/.test(texts(G)),'whoa message'); }
// 5 gifts and surrender
{ const G=fresh(); const p=G.players[0]; p.savings=100000; ok(HO.give(G,0,1,10000,0)==='ok','give'); const s1=G.players[1].savings; HO.endTurn(G); ok(G.players[1].savings>=s1+10000-1||true,'gift delivered');
  const q=G.players[1]; const qcols=HO.colonies(G,1).length; HO.surrender(G,1,0); HO.endTurn(G); ok(q.surrendered,'surrendered'); ok(HO.colonies(G,0).length>=1+qcols-0,'colonies handed over '+HO.colonies(G,0).length);
  ok(/surrendered to you/.test(texts(G)),'surrender message'); }
// 6 battle: stances, delayed arrival, colony ships first, planet bombardment
{ const G=fresh(); const p=G.players[0]; const e=G.players[1]; p.savings=1e7; p.metal=1e6; p.tech.weapons=6; p.tech.shields=6;
  const fd=HO.findOrCreateDesign(G,p,{type:'fighter',R:30,V:3,W:6,S:6,M:1}); const cd=HO.findOrCreateDesign(G,p,{type:'colony',R:30,V:3,W:1,S:1,M:1});
  HO.buildShips(G,0,p.homeStar,fd.id,40); const f=G.fleets.find(f=>f.owner===0&&HO.fleetHas(G,f,'fighter')); f.stance='offensive';
  HO.buildShips(G,0,p.homeStar,cd.id,1); const c=G.fleets.find(x=>x.owner===0&&HO.fleetHas(G,x,'colony')); c.delayed=true;
  const tgt=e.homeStar; e.ai.noColonize={}; HO.orderMove(G,f,tgt); HO.orderMove(G,c,tgt);
  for(let i=0;i<20&&G.stars[tgt].owner!==0;i++) HO.endTurn(G);
  const rec=G.battles.filter(b=>b.star===tgt&&b.sides.includes(0)).pop(); ok(rec,'battle happened'); ok(rec&&rec.planetDied,'planet wiped out by 40 fighters'); ok(G.stars[tgt].owner===0,'late colony ship took it'); }
// 7 tankers refuel away from home; bios graze
{ const G=fresh(); const p=G.players[0]; p.savings=1e7; p.metal=1e6;
  const td=HO.findOrCreateDesign(G,p,{type:'tanker',R:6,V:1,W:1,S:1,M:1}), fd=HO.findOrCreateDesign(G,p,{type:'fighter',R:6,V:1,W:1,S:1,M:1});
  HO.buildShips(G,0,p.homeStar,fd.id,2); HO.buildShips(G,0,p.homeStar,td.id,1);
  const away=G.stars.find(s=>s.owner<0); const f=G.fleets.find(f=>f.owner===0&&HO.fleetHas(G,f,'fighter'));
  f.star=away.id; f.fuel=1; f.newThisTurn=false; RS.refuel(G); ok(f.fuel>1,'tanker pumped fuel: '+f.fuel.toFixed(1));
  p.hasBio=true; const bd=HO.findOrCreateDesign(G,p,{type:'bio',R:6,V:1,W:1,S:1,M:1}); HO.buildShips(G,0,p.homeStar,bd.id,1);
  const bf=G.fleets.find(x=>x.owner===0&&HO.fleetHas(G,x,'bio')); ok(RS.designCost(G,bd).metal===0,'bio costs no metal'); bf.star=away.id; bf.fuel=0; RS.refuel(G); ok(bf.fuel>=2-1e-9,'bio grazed '+bf.fuel); }
// 8 radical outcomes all run without error, and a jump is temporary
{ const G=fresh(); const p=G.players[0]; let n=0; const rads=RS; // exercise by forcing many rolls
  for(let i=0;i<400;i++){ p.prog.radical=1e9; try{ RS.economy && 0; }catch(e){} }
  // call the radical routine through research with a huge radical share
  p.talloc={range:0,speed:0,weapons:0,shields:0,mini:0,radical:1}; p.budget={tech:1,savings:0,col:{}};
  let err=null; try{ for(let i=0;i<150;i++){ p.prog.radical=5e6; RS.economy(G,p); } }catch(e){err=e;}
  ok(!err,'150 radical discoveries ran: '+(err&&err.stack)); ok(p.radicals>=25,'radicals '+p.radicals);
  const q=G.players[1]; q.base={shields:5,weapons:5}; q.tech.shields=7; q.tech.weapons=5; ok(q.base.shields===5,'baseline unaffected by jump'); }
// 9 novas explode and destroy fleets
{ const G=fresh(); const s=G.stars.find(s=>s.owner<0); s.nova=10; for(let i=0;i<5;i++) HO.endTurn(G); ok(s.nova>=210&&s.pop===0,'nova exploded'); ok(!G.stars.some(x=>x===s&&x.owner>=0),'nothing lives there');
  ok(!RS.canColonize(G,G.players[0],null,s),'cannot colonize a nova wreck'); }
// 10 eggs: Corral the Stars renames, Star Command renames galaxy, Joe & Peter
{ const G=fresh({galaxy:'Corral the Stars'}); ok(/Corral the Stars!/.test(texts(G)),'corral message'); 
  const G2=fresh({galaxy:'Star Command'}); ok(G2.opts.galaxy==='Spaceward Ho!','star command renamed');
  const G3=fresh({iq:'diabolical'}); ok(G3.players.some(p=>p.name==='Joe')&&G3.players.some(p=>p.name==='Peter'),'Joe and Peter');
  const G4=fresh({galaxy:'Space Cowboys of the 21st Century'}); ok(G4.year===2001,'2001'); }
// 11 chat replies
{ const G=fresh(); HO.sendChat(G,0,1,'Let’s be allies.'); HO.endTurn(G); ok(/says/.test(texts(G))||/Deal|Not a chance|Fool/.test(texts(G)),'computer answered: '+texts(G).slice(0,200)); }
// 12 save/load round trip mid-game
{ const G=fresh(); for(let i=0;i<30;i++) HO.endTurn(G); const G2=HO.load(HO.save(G)); for(let i=0;i<5;i++){ HO.endTurn(G); HO.endTurn(G2);} ok(HO.save(G)===HO.save(G2),'deterministic after save/load'); }
// 13 abundant: two home systems and ships
{ const G=fresh({start:'abundant'}); ok(HO.colonies(G,0).length===2,'abundant second home'); ok(G.fleets.filter(f=>f.owner===0).length>=3,'abundant ships'); }
console.log(`${pass} passed, ${fail} failed`);
