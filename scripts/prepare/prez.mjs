import {load,render} from './pdf.mjs';import sharp from 'sharp';
const [,,file,prefix,w]=process.argv;const doc=await load(file);console.log('pages',doc.numPages);const thumbs=[];
for(let p=1;p<=doc.numPages;p++){const out=`${prefix}-${String(p).padStart(2,'0')}.png`;await render(doc,p,out,+w||1600);thumbs.push(await sharp(out).resize(400,283,{fit:'contain',background:'#fff'}).png().toBuffer())}
const cols=5,rows=Math.ceil(thumbs.length/cols);await sharp({create:{width:2000,height:rows*290,channels:3,background:'#ccc'}}).composite(thumbs.map((b,i)=>({input:b,left:(i%cols)*400,top:Math.floor(i/cols)*290}))).jpeg().toFile(prefix+'-contact.jpg');
