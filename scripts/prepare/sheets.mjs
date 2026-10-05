import fs from 'fs';import sharp from 'sharp';import {load,render} from './pdf.mjs';
const B=(process.env.SOURCE_DIR || 'C:/Users/Omen/Documents/claude/slovanske udoli') + '/www.rezideceslovanskeudoli.cz/';const P='C:/Users/Omen/Documents/claude/rezidence-slovanske-udoli/public/';
const units=JSON.parse(fs.readFileSync('../research/units-extracted.json'));const tmp='../sheet-tmp.png';
const pad=n=>String(n).padStart(2,'0');const files={};
const techDirs={BD1:'Technické půdorysy BD1 - 25.6.2025',BD2:'Technické půdorysy BD2 - 27.6.2025',RDD:'Technické půdorysy RDD 01-04 - 2025_11_27','ŘRD':'Technické půdorysy ŘRD 05-07 08-10 - 2026_07_24'};
for(const u of units){const slug=(u.building==='ŘRD'?'RRD':u.building)+'-'+pad(u.number);
 const doc=await load(B+u.source);const d=await render(doc,1,tmp,2000);
 await sharp(tmp).resize(1600).webp({quality:82}).toFile(P+'media/sheets/'+slug+'.webp');
 if(u.building.startsWith('BD')){const W=d.w,H=d.h;await sharp(tmp).extract({left:Math.round(W*.435),top:Math.round(H*.04),width:Math.round(W*.55),height:Math.round(H*.75)}).resize(1200).webp({quality:84}).toFile(P+'media/plans/'+slug+'.webp')}
 else{await sharp(tmp).extract({left:Math.round(d.w*.62),top:0,width:Math.round(d.w*.38),height:d.h}).resize(900).webp({quality:84}).toFile(P+'media/plans/'+slug+'.webp')}
 fs.copyFileSync(B+u.source,P+'docs/units/'+slug+'-prodejni-list.pdf');
 const td=fs.readdirSync(B+techDirs[u.building]).map(f=>[f,f.normalize('NFC')]);
 const tech=u.building.startsWith('BD')?td.filter(([o,f])=>f.startsWith('Byt č.'+u.number+'_')):td.filter(([o,f])=>new RegExp('^(RDD|ŘRD) '+pad(u.number)+'_').test(f));
 const tf=[];for(const [o,f] of tech){const suf=f.match(/1\.(NP|PP)/)?'-'+f.match(/1\.(NP|PP)/)[0].replace('.','').toLowerCase():'';const n=slug+'-technicky-pudorys'+suf+'.pdf';fs.copyFileSync(B+techDirs[u.building]+'/'+o,P+'docs/units/'+n);tf.push(n)}
 files[slug]={sheet:slug+'-prodejni-list.pdf',tech:tf};process.stdout.write(slug+'('+tf.length+') ')}
fs.writeFileSync('../research/unit-files.json',JSON.stringify(files,null,1));
