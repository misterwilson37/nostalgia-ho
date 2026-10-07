// Invariant audit for the Claude rules: node docs/claude-rules/tests/audit.js [games=24] [turns=500]
// Plays varied headless games (every size, shape, IQ, start, 30-year turns, hot seat, computer best buddies,
// easter-egg galaxy names) and checks every turn for broken numbers, empty fleets, dead owned stars and design pile-ups.
// Stress/invariant audit for the Claude rules: many configurations, checks every turn.
const path=require('path'), root=path.join(__dirname,'..','..','..');
const HO=require(path.join(root,'js/engine.js')); Object.assign(HO.DATA,require(path.join(root,'js/data.js')));
const N=+(process.argv[2]||12), MAXT=+(process.argv[3]||500);
const sizes=['small','medium','large','huge'], shapes=['random','ring','cluster','spiral','grid','hex'], iqs=['dumb','average','smart','diabolical'];
const starts=['outpost','barren','backward','normal','advanced','thriving','abundant'];
const bad=[]; const out=[]; const fin=(x)=>typeof x==='number'&&isFinite(x);
let totalMs=0;
for(let g=0;g<N;g++){
  const seed=1000+g*7919;
  const o={seed,rules:'claude',size:sizes[g%4],shape:shapes[g%6],iq:iqs[(g>>1)%4],start:starts[g%7],cstart:starts[(g*3)%7],
    computers:2+(g%6),density:['dense','normal','sparse'][g%3],alliances:true,novas:true,luck:g%2===0,yearsPerTurn:g%5===0?30:10,buddies:g%9===4,
    galaxy:['Milky Way','Corral the Stars','Bonehead','Star Command','Stellar Conquest'][g%5], name: g%7===3?'Peter':'Jake'};
  if (g%8===6) o.humans=[{name:'Ann'},{name:'Bob'}];
  const G=HO.newGame(o); for(const p of HO.humans(G)){p.auto=true;p.ai=null;}
  const t0=Date.now(); let maxMsgs=0, msgCount=0; const gbad=bad.length;
  for(let i=0;i<MAXT&&!G.over;i++){
    HO.endTurn(G);
    for(const p of G.players){
      for(const k of ['savings','metal','lastGross']) if(!fin(p[k])) bad.push(`g${g} t${G.turn} ${p.name}.${k}=${p[k]}`);
      for(const k in p.tech) if(!fin(p.tech[k])||p.tech[k]<0) bad.push(`g${g} t${G.turn} tech ${k}=${p.tech[k]}`);
      const live=p.designs.filter(d=>!d.scrapped).length; if(live>60) bad.push(`g${g} ${p.name} live designs ${live}`); if(p.designs.length>400) bad.push(`g${g} ${p.name} total designs ${p.designs.length}`);
      if(p.human){ maxMsgs=Math.max(maxMsgs,(p.inbox||[]).filter(m=>!m.quiet).length); msgCount+=(p.inbox||[]).length; }
    }
    for(const s of G.stars){ if(!fin(s.pop)||s.pop<0||!fin(s.t)||!fin(s.metal)||s.metal<-1) bad.push(`g${g} t${G.turn} star ${s.name} pop${s.pop} t${s.t} m${s.metal}`);
      if(s.owner>=0&&!G.players[s.owner]) bad.push('bad owner'); if(s.owner>=0&&s.pop<=0) bad.push(`g${g} t${G.turn} owned dead star ${s.name}`); }
    for(const f of G.fleets){ if(HO.fleetCount(f)<=0) bad.push(`g${g} t${G.turn} empty fleet`); if(!fin(f.fuel)) bad.push(`g${g} fuel NaN`);
      for(const k in f.ships) if(!HO.getDesign(G,f.owner,+k)) bad.push(`g${g} missing design`); }
    if(bad.length>gbad+10) break;
  }
  JSON.parse(HO.save(G));
  const ms=Date.now()-t0; totalMs+=ms;
  const alive=G.players.filter(p=>p.alive);
  out.push(`g${g} ${o.size}/${o.shape}/${o.iq}/${o.computers}c ${o.start}/${o.cstart} ypt${o.yearsPerTurn}${o.buddies?' buddies':''}${o.humans?' hotseat':''}: over=${G.over} turn=${G.turn} alive=${alive.length}/${G.players.length} winner=${G.winner} caps=${G.stat.captures} maxMsgs/turn=${maxMsgs} msgs/turn=${(msgCount/Math.max(1,G.turn)).toFixed(1)} ${ms}ms`);
}
console.log(out.join('\n')); console.log('ended', out.filter(x=>x.includes('over=true')).length,'/',N, 'total ms',totalMs);
console.log(bad.length? 'PROBLEMS:\n'+[...new Set(bad)].slice(0,30).join('\n') : 'no invariant problems');
