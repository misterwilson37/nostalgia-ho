const fs=require('fs');
const root={};
new Function('root',fs.readFileSync('js/version-notes.js','utf8').replace('})(this);','})(root);'))(root);
const V=root.HOVERSIONS; const seen=new Map();
function walk(o,key){ if(typeof o==='string'){ if(!seen.has(o)) seen.set(o,[]); seen.get(o).push(key); }
 else if(Array.isArray(o)) o.forEach(x=>walk(x,key)); else if(o&&typeof o==='object'){ for(const k in o){ if(['url','show','fix'].includes(k)&&typeof o[k]!=='object') continue; walk(o[k],key);} } }
for(const k in V) walk(V[k],k);
const fx=JSON.parse(fs.readFileSync('docs/translations-notes/work/fixes-unique.json'));
const all=[];
for(const [s,k] of seen) all.push({kind:'notes',en:s,in:[...new Set(k)]});
for(const f of fx) if(!seen.has(f.en)) all.push({kind:'patch',en:f.en,in:f.in});
all.forEach((x,i)=>x.id=i);
fs.writeFileSync('docs/translations-notes/work/source-lines.json',JSON.stringify(all,null,1));
console.log(all.length,'strings',all.reduce((a,x)=>a+x.en.length,0),'chars; notes',all.filter(x=>x.kind=='notes').length);
