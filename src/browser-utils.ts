import puppeteer from 'puppeteer-core';
const chrome = require('chrome-aws-lambda');

export async function launchBrowser() {
    const isVercel = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_VERSION;

    if (isVercel) {
        console.log("Launching Chromium for Serverless (chrome-aws-lambda)...");
        return puppeteer.launch({
            args: [...chrome.args, '--hide-scrollbars', '--disable-web-security'],
            defaultViewport: chrome.defaultViewport,
            executablePath: await chrome.executablePath,
            headless: chrome.headless,
            ignoreHTTPSErrors: true,
        });
    } else {
        // Local
        try {
            const p = require('puppeteer');
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