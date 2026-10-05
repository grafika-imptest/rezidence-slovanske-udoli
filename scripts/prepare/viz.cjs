const sharp=require('sharp'),fs=require('fs');const dir=(process.env.SOURCE_DIR || 'C:/Users/Omen/Documents/claude/slovanske udoli') + '/Vizualizace + video/';const out='C:/Users/Omen/Documents/claude/rezidence-slovanske-udoli/public/media/viz/';
(async()=>{for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.jpg'))){const id='su-'+f.match(/_(\d{4})_/)[1];
for(const w of [640,1280,2400]){await sharp(dir+f).resize(w).webp({quality:w>2000?72:76}).toFile(out+id+'-'+w+'.webp')}
await sharp(dir+f).resize(1600).jpeg({quality:80,mozjpeg:true}).toFile(out+id+'-1600.jpg');console.log(id)}})()
