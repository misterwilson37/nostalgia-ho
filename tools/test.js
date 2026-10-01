const HO=require('./src/engine.js');
Object.assign(HO.DATA,require('./src/data.json'));
function run(seed,opts){
  const G=HO.newGame(Object.assign({seed,size:'medium',computers:4,iq:'average',shape:'random'},opts||{}));
  G.players[0].auto=true; // human on autoplay
  G.players[0].ai=null;
  let t0=Date.now();
  for(let i=0;i<400 && !G.over;i++){ HO.endTurn(G);
    if(i%50==49){ console.log('turn',G.turn, G.players.map(p=>`${p.name}${p.alive?'':'(x)'}: c${HO.colonies(G,p.id).length} pop${Math.round(HO.colonies(G,p.id).reduce((a,s)=>a+s.pop,0))} $${Math.round(p.savings)} m${Math.round(p.metal)} t${p.tech.range}/${p.tech.speed}/${p.tech.weapons}/${p.tech.shields}/${p.tech.mini} sh${G.fleets.filter(f=>f.owner===p.id).reduce((a,f)=>a+HO.fleetCount(f),0)}`).join(' | '));}
  }
  console.log('end turn',G.turn,JSON.stringify(G.stat),'over',G.over,'winner',G.winner,'battles',G.battles.length,'ms',Date.now()-t0, 'size', HO.save(G).length);
}
run(1);run(2,{size:'small',computers:2});
