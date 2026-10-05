import puppeteer from 'puppeteer-core';
const b = await puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new' });
const errs = [];
const res = {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function page(w) { const p = await b.newPage(); await p.setViewport({ width: w, height: 900, isMobile: w < 768, hasTouch: w < 768 }); p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); }); return p; }
const base = 'http://localhost:5310/';
let p = await page(1440);
await p.goto(base + 'nabidka/', { waitUntil: 'networkidle2' });
const count = () => p.$eval('[data-count]', (e) => +e.textContent);
res.all = await count();
await p.click('[data-tab="radovy-dum"]'); res.rrd = await count();
await p.click('[data-tab="byt"]'); res.byt = await count();
await p.click('[data-f-layout="2+kk"]'); res.byt2kk = await count();
await p.click('[data-f-free]'); res.byt2kkFree = await count();
res.url = await p.evaluate(() => location.search);
await p.click('[data-reset]'); res.afterReset = await count();
await p.evaluate(() => document.querySelector('.splan__obj[data-obj=BD2]').dispatchEvent(new MouseEvent('click', { bubbles: true })));
await sleep(200); res.bd2floor = [await count(), await p.$eval('[data-path-f]', (e) => e.textContent)];
await p.select('[data-sort]', 'price-desc');
await p.goto(base + 'nabidka/?typ=byt&dispozice=4+kk&stav=volne', { waitUntil: 'networkidle2' }); res.urlState = await count();
// favorites
await p.goto(base + 'nabidka/byt-bd1-07/', { waitUntil: 'networkidle2' });
await p.click('.ud__cta2 [data-fav]'); await p.click('.ud__cta2 [data-cmp]');
res.favPressed = await p.$eval('.ud__cta2 [data-fav]', (e) => e.getAttribute('aria-pressed'));
res.headerCounts = await p.$$eval('[data-fav-count],[data-cmp-count]', (els) => els.map((e) => e.textContent).slice(0, 2));
res.cmpbarVisible = await p.$eval('[data-cmpbar]', (e) => !e.hidden);
// form validation
await p.click('#poptavka button[type=submit]'); res.invalid = await p.$$eval('.field.is-invalid', (e) => e.length);
await p.type('#f-name', 'Test'); await p.type('#f-mail', 'test@example.com'); await p.click('[data-gdpr] input'); await p.click('#poptavka button[type=submit]');
res.sent = await p.$eval('[data-form]', (f) => f.classList.contains('is-sent'));
await p.goto(base + 'oblibene/', { waitUntil: 'networkidle2' }); await sleep(300);
res.favRows = await p.$$eval('[data-favs-rows] .urow', (e) => e.length);
// standards
await p.goto(base + 'standardy/?sada=radove-domy', { waitUntil: 'networkidle2' });
res.stdSet = await p.$eval('[data-set="radove-domy"]', (e) => e.getAttribute('aria-selected'));
await p.type('[data-std-search]', 'HÜPPE'); await sleep(100);
res.stdHits = await p.$$eval('[data-set-panel="radove-domy"] [data-std-item]:not(.is-hidden)', (e) => e.map((x) => x.id));
// mobile filters + lightbox
const m = await page(390);
await m.goto(base + 'nabidka/', { waitUntil: 'networkidle2' });
await m.click('[data-filters-open]'); await sleep(300);
res.mFiltersOpen = await m.$eval('[data-filters]', (e) => e.classList.contains('is-open'));
await m.click('[data-f-layout="3+kk"]'); await m.click('[data-filters-done]'); await sleep(300);
res.m3kk = await m.$eval('[data-count]', (e) => +e.textContent);
await m.goto(base + 'projekt/', { waitUntil: 'networkidle2' });
await m.click('.gal__i'); await sleep(200); res.lightbox = await m.$eval('.lb', (e) => !e.hidden);
const ov = await m.evaluate(() => document.documentElement.scrollWidth); res.mOverflowProjekt = ov;
console.log(JSON.stringify(res, null, 1)); console.log('ERRORS', errs);
await b.close();
