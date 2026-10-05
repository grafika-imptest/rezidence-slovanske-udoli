import fs from 'fs';import sharp from 'sharp';import {load,text,render} from './pdf.mjs';
const B=(process.env.SOURCE_DIR || 'C:/Users/Omen/Documents/claude/slovanske udoli') + '/www.rezideceslovanskeudoli.cz/Celé barevné půdorysy/';
const OUT=process.argv[2];fs.mkdirSync(OUT,{recursive:true});const W=2400;const result={};
const isY=(r,g,b)=>r>225&&g>225&&b>140&&b<185&&Math.abs(r-g)<14;const isB=(r,g,b)=>r>175&&r<215&&g>225&&b>235;
for(const f0 of fs.readdirSync(B)){const f=f0.normalize('NFC');const m=f.match(/(BD\d)_PŮDORYS (\d\.(?:NP|PP))/);const key=m[1]+'_'+m[2].replace('.','');
 const doc=await load(B+f0);const png=`${OUT}/${key}.png`;const dim=await render(doc,1,png,W);const s=dim.w/dim.pw;
 const t=await text(doc,1);const labels=t.filter(i=>/^BYT\s*\d+$/.test(i.s.trim())).map(i=>({n:+i.s.match(/\d+/)[0],x:i.x*s+10,y:(dim.ph-i.y)*s-4}));
 const {data,info}=await sharp(png).raw().toBuffer({resolveWithObject:true});const w=info.width,h=info.height,ch=info.channels;
 const col=new Uint8Array(w*h);for(let p=0;p<w*h;p++){const r=data[p*ch],g=data[p*ch+1],b=data[p*ch+2];col[p]=isY(r,g,b)?1:isB(r,g,b)?2:0}
 for(const L of labels){// color at label: search nearby
  let best=null;for(let d=0;d<40&&!best;d++)for(let dy=-d;dy<=d&&!best;dy++)for(let dx=-d;dx<=d;dx++){const x=Math.round(L.x+dx),y=Math.round(L.y+dy);if(x>=0&&y>=0&&x<w&&y<h&&col[y*w+x]){best=col[y*w+x];break}}L.c=best}
 // components
 const comp=new Int32Array(w*h).fill(-1);const comps=[];
 for(let p=0;p<w*h;p++){if(!col[p]||comp[p]>=0)continue;const c=col[p];const id=comps.length;const st=[p];comp[p]=id;let n=0,sx=0,sy=0;
  while(st.length){const q=st.pop();n++;const x=q%w,y=(q/w)|0;sx+=x;sy+=y;for(const nb of [q-1,q+1,q-w,q+w]){if(nb<0||nb>=w*h)continue;if(Math.abs((nb%w)-x)>1)continue;if(col[nb]===c&&comp[nb]<0){comp[nb]=id;st.push(nb)}}}
  comps.push({c,n,cx:sx/n,cy:sy/n})}
 // assign comps (n>150) to nearest same-color label
 const owner=comps.map(cp=>{if(cp.n<150)return -1;let bd=1e9,bl=-1;for(const L of labels){if(L.c!==cp.c)continue;const d=Math.hypot(L.x-cp.cx,L.y-cp.cy);if(d<bd){bd=d;bl=L.n}}return bd<w*0.25?bl:-1});
 // cell grid
 const C=4,gw=Math.ceil(w/C),gh=Math.ceil(h/C);const units={};
 for(const L of labels){const g=new Uint8Array(gw*gh);for(let p=0;p<w*h;p++){const id=comp[p];if(id>=0&&owner[id]===L.n)g[((p/w|0)/C|0)*gw+((p%w)/C|0)]=1}
  // dilate 3 cells, then erode 2 (closing) to cover walls
  const dil=(a,r)=>{const o=new Uint8Array(a.length);for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){if(!a[y*gw+x])continue;for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<gw&&Y<gh)o[Y*gw+X]=1}}return o};
  const ero=(a,r)=>{const o=new Uint8Array(a.length);for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){let ok=1;for(let dy=-r;dy<=r&&ok;dy++)for(let dx=-r;dx<=r;dx++){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=gw||Y>=gh||!a[Y*gw+X]){ok=0;break}}o[y*gw+x]=ok}return o};
  const g2=ero(dil(g,4),3);
  // runs -> rects merged vertically
  let rects=[];let open={};for(let y=0;y<=gh;y++){const runs=[];if(y<gh){let x=0;while(x<gw){if(g2[y*gw+x]){let x2=x;while(x2<gw&&g2[y*gw+x2])x2++;runs.push([x,x2]);x=x2}else x++}}
   const next={};for(const [a,b] of runs){const k=a+'_'+b;if(open[k]){open[k].h++;next[k]=open[k];delete open[k]}else next[k]={x:a,y,w:b-a,h:1}}for(const k in open)rects.push(open[k]);open=next}
  const d=rects.map(r=>`M${r.x*C} ${r.y*C}h${r.w*C}v${r.h*C}h${-r.w*C}z`).join('');
  let minx=1e9,miny=1e9,maxx=0,maxy=0;rects.forEach(r=>{minx=Math.min(minx,r.x*C);miny=Math.min(miny,r.y*C);maxx=Math.max(maxx,(r.x+r.w)*C);maxy=Math.max(maxy,(r.y+r.h)*C)});
  units[L.n]={d,label:[Math.round(L.x),Math.round(L.y)],bbox:[minx,miny,maxx,maxy],rects:rects.length}}
 // crop bounds: union bbox + margin
 let bx=[1e9,1e9,0,0];Object.values(units).forEach(u=>{bx=[Math.min(bx[0],u.bbox[0]),Math.min(bx[1],u.bbox[1]),Math.max(bx[2],u.bbox[2]),Math.max(bx[3],u.bbox[3])]});
 result[key]={file:f,size:[w,h],labels:labels.map(l=>l.n),units,bounds:bx};
 console.log(key,'labels',labels.map(l=>l.n+(l.c==1?'y':l.c==2?'b':'?')).join(','),'paths',Object.entries(units).map(([k,u])=>k+':'+u.rects).join(' '))}
fs.writeFileSync(OUT+'/floors.json',JSON.stringify(result));
