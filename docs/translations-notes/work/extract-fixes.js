const path=require('path'),root=process.cwd();
const HO=require(path.join(root,'js/engine.js'));
Object.assign(HO.DATA,require(path.join(root,'js/data.js')));
const fs=require('fs');
for(const f of fs.readdirSync('js').filter(f=>/^rules-.*\.js$/.test(f))){ try{require(path.join(root,'js',f));}catch(e){console.log('skip',f,e.message.slice(0,60))} }
const seen=new Map(); let n=0;
for(const [id,rs] of Object.entries(HO.RULESETS)){ for(const fx of (rs.fixes||[])){ for(const k of ['title','text']){ const s=fx[k]; if(typeof s!=='string') continue; n++; if(!seen.has(s)) seen.set(s,[]); seen.get(s).push(id+':'+fx.id+'.'+k);} } }
console.log('rulesets',Object.keys(HO.RULESETS).join(','));
console.log('fix strings',n,'unique',seen.size,'chars',[...seen.keys()].reduce((a,s)=>a+s.length,0));
fs.writeFileSync('docs/translations-notes/work/fixes-unique.json',JSON.stringify([...seen].map(([s,k])=>({en:s,in:k})),null,1));
