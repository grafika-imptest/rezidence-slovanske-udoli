// node shot.mjs <path> <w> <h> <out> [full=1] [scrollY] [actions-js]
import puppeteer from 'puppeteer-core';
const [,, p, w, h, out, full = '1', sy = '0', js = ''] = process.argv;
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'] });
const pg = await b.newPage();
const mobile = +w < 768;
await pg.setViewport({ width: +w, height: +h, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
pg.on('requestfailed', r => errs.push('FAIL ' + r.url())); pg.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()); });
await pg.goto('http://localhost:5310/' + p, { waitUntil: 'networkidle2', timeout: 60000 });
await pg.evaluate(async () => { document.querySelectorAll('[data-reveal]').forEach(e => e.classList.add('is-in')); const imgs=[...document.images]; imgs.forEach(i => i.loading='eager'); await Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; setTimeout(r, 4000); }))); });
if (js) await pg.evaluate(js);
await new Promise(r => setTimeout(r, 900));
if (+sy) await pg.evaluate(y => window.scrollTo(0, y), +sy);
await new Promise(r => setTimeout(r, 400));
await pg.screenshot({ path: out, fullPage: full === '1', type: 'jpeg', quality: 70 });
const dims = await pg.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, sh: document.documentElement.scrollHeight }));
console.log(JSON.stringify({ dims, errs: errs.slice(0, 10) }));
await b.close();
