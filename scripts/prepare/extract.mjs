import fs from 'fs';import {load,text} from './pdf.mjs';
const B=(process.env.SOURCE_DIR || 'C:/Users/Omen/Documents/claude/slovanske udoli') + '/www.rezideceslovanskeudoli.cz/';
const num=s=>{const m=(s||'').replace(/\s/g,'').match(/(\d+(?:[.,]\d+)?)/);return m?parseFloat(m[1].replace(',','.')):null};
function pairs(t,lx0,lx1,vx0,vx1){const labels=t.filter(i=>i.x>=lx0&&i.x<lx1);const out=[];
 // merge label items on same line
 const lines=[];for(const i of labels.sort((a,b)=>b.y-a.y||a.x-b.x)){const l=lines.find(l=>Math.abs(l.y-i.y)<=3);if(l){l.s+=' '+i.s}else lines.push({y:i.y,s:i.s})}
 for(const l of lines){const v=t.filter(i=>i.x>=vx0&&i.x<vx1&&Math.abs(i.y-l.y)<=4).sort((a,b)=>a.x-b.x).map(i=>i.s).join('');out.push([l.s.replace(/\s+/g,' ').trim(),v.trim()])}return out}
const units=[];
for(const [bd,dir] of [['BD1','Prodejní listy BD1 - 6.6.2025'],['BD2','Prodejní listy BD2 - 18.6.2025']]){
 for(const f0 of fs.readdirSync(B+dir)){const f=f0.normalize('NFC');if(!/^Byt/.test(f))continue;
  const doc=await load(B+dir+'/'+f0);const t=await text(doc,1);
  const p=pairs(t,20,160,165,300);const get=re=>{const r=p.find(x=>re.test(x[0]));return r?r[1]:null};
  const u={id:`${bd}-${num(f.match(/č\.(\d+)/)[1])}`,building:bd,number:num(f.match(/č\.(\d+)/)[1]),source:dir+'/'+f};
  const typ=p.find(x=>/^BYT [\d,]+\+kk/i.test(x[0]));u.layout=typ?typ[0].replace(/^BYT\s*/,'').replace('kk','kk'):null;
  u.floor=get(/^PODLAŽÍ/);
  const rooms=[];let inRooms=false;
  for(const [l,v] of p){if(/^(CHODBA|WC|KOUPELNA|POKOJ|LOŽNICE|OBÝVACÍ|KOMORA|ŠATNA|SPÍŽ|TECHN)/.test(l)&&v)rooms.push({name:l,area:num(v)})}
  u.rooms=rooms;u.livingArea=num(get(/^OBYTNÁ PLOCHA/));u.structures=num(get(/^SVISLÉ/));u.floorArea=num(get(/^PODLAHOVÁ/));
  u.loggia=num(get(/^LODŽIE/));u.balcony=num(get(/^BALKON/));u.terrace=num(get(/^TERASA/));u.garden=num(get(/^(ZAHRADA|PŘEDZAHRÁDKA)/));
  const sk=p.find(x=>/^SKLEP/.test(x[0]));u.cellar=sk?{no:num(sk[0].replace('SKLEP','')),area:num(sk[1])}:null;
  const ga=p.find(x=>/^GARÁŽOVÉ/.test(x[0]));u.parking=ga?{no:num(ga[0].replace(/GARÁŽOVÉ STÁNÍ/,''))}:null;
  u._pairs=p.filter(x=>x[0].length<40);units.push(u)}}
// houses
for(const dir of ['Prodejní listy RDD 01-04 - 2025_11_27','Prodejní listy ŘRD 05-07 08-10 - 2026_07_24']){
 for(const f0 of fs.readdirSync(B+dir)){const f=f0.normalize('NFC');const doc=await load(B+dir+'/'+f0);const t=await text(doc,1);
  const pg=await doc.getPage(1);const vp=pg.getViewport({scale:1});
  const head=t.filter(i=>/DŮM|DVOJDŮM/.test(i.s)).map(i=>i.s);
  const hx=t.find(i=>/OBYTNÁ PLOCHA CELKEM/.test(i.s)&&!/NP|PP/.test(i.s));
  const lx=hx?hx.x-5:700;const p=pairs(t,lx,lx+190,lx+190,lx+330);
  const no=num(f.match(/(\d+)/)[1]);const isRow=/ŘRD/.test(dir);
  const u={id:(isRow?'RRD-':'RDD-')+String(no).padStart(2,'0'),building:isRow?'ŘRD':'RDD',number:no,source:dir+'/'+f,title:head.join(' '),pageSize:[Math.round(vp.width),Math.round(vp.height)],_pairs:p};
  units.push(u)}}
fs.writeFileSync('../research/units-extracted.json',JSON.stringify(units,null,1));
for(const u of units){if(u.building.startsWith('BD'))console.log(u.id,u.layout,u.floor,u.livingArea,u.structures,u.floorArea,'L',u.loggia,'B',u.balcony,'T',u.terrace,'G',u.garden,'S',JSON.stringify(u.cellar),'P',JSON.stringify(u.parking),'rooms',u.rooms.length);else console.log(u.id,u.title,u.pageSize,JSON.stringify(u._pairs))}
