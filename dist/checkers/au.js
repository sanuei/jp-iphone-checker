"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuChecker = void 0;
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
class AuChecker {
    async check(imei) {
        const url = 'https://my.au.com/cmn/WCV0010001/WCV0010001.jsp';
        const browser = await puppeteer_extra_1.default.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security'
            ]
        });
        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
            'Referer': 'https://www.au.com/',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"macOS"'
        });
        // Set a realistic User-Agent
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded' });
            // Au selectors (guessing common ones or based on past knowledge)
            // They often use name="mpn" or similar for IMEI.
            // Let's assume there's an input field.
            // If I get it wrong, I'll need to use 'browser' tool to inspect or 'curl' the page content to find selectors.
            // I'll take a safe bet: wait for *any* text input.
            await page.waitForSelector('input[type="text"]', { timeout: 5000 });
            // Usually there are multiple inputs? Au usually has just one for IMEI (Manufacturing Number).
            // Let's type in the first text input found.
            await page.type('input[type="text"]', imei);
            // Click button
            // Often <input type="image"> or <input type="button">
            // I'll look for a button or input[type=submit]
            const button = await page.$('input[type="submit"], input[type="image"], button');
            if (button)
                await button.click();
            else
                throw new Error("Submit button not found");
            await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 });
            const content = await page.content();
            let status = 'Unknown';
            if (content.includes('○'))
                status = 'O';
            else if (content.includes('△'))
                status = '△';
            else if (content.includes('×') || content.includes('X'))
                status = 'X';
            else if (content.includes('－') || content.includes('-'))
                status = '-';
            return {
                carrier: 'au',
                status
            };
        }
        catch (error) {
            return {
                carrier: 'au',
                status: 'Unknown',
                message: error.message
            };
        }
        finally {
            await browser.close();
        }
    }
}
exports.AuChecker = AuChecker;
