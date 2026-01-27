import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function launchBrowser() {
    const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION;

    if (isVercel) {
        console.log("Launching Chromium for Serverless...");
        return puppeteer.launch({
            args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
    } else {
        // Local
        try {
            // Try using the 'puppeteer' package which includes Chrome
            // We need to use require to avoid TS errors if types mismatch or if we want conditional import
            const p = require('puppeteer');
            // Puppeteer-extra is already set up in local files? 
            // If we want to use stealth locally, we should keep it.
            const pExtra = require('puppeteer-extra');
            const StealthPlugin = require('puppeteer-extra-plugin-stealth');
            pExtra.use(StealthPlugin());
            return pExtra.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-web-security']
            });
        } catch (e) {
            console.warn("Local puppeteer not found, trying core with default chrome...", e);
            return puppeteer.launch({
                channel: 'chrome',
                headless: true
            });
        }
    }
}