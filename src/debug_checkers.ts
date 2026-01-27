import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import * as fs from 'fs';

puppeteer.use(StealthPlugin());

async function debug() {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    });

    // 1. Debug Docomo
    console.log('--- Debugging Docomo ---');
    const pageDocomo = await browser.newPage();
    try {
        await pageDocomo.goto('http://nw-restriction.nttdocomo.co.jp/top.php', { waitUntil: 'networkidle0' });
        const title = await pageDocomo.title();
        console.log(`Docomo Page Title: ${title}`);
        fs.writeFileSync('debug_docomo.html', await pageDocomo.content());
        console.log('Saved debug_docomo.html');
    } catch (e) {
        console.error('Docomo Error:', e);
    }

    // 2. Debug au
    console.log('--- Debugging au ---');
    const pageAu = await browser.newPage();
    await pageAu.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    try {
        await pageAu.goto('https://my.au.com/cmn/WCV0010001/WCV0010001.jsp', { waitUntil: 'networkidle0' });
        const titleAu = await pageAu.title();
        console.log(`au Page Title: ${titleAu}`);
        fs.writeFileSync('debug_au.html', await pageAu.content());
        console.log('Saved debug_au.html');
    } catch (e) {
        console.error('au Error:', e);
    }

    await browser.close();
}

debug();