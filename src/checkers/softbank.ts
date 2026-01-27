import puppeteer from 'puppeteer';
import { Checker, CheckResult, Status } from '../types';

export class SoftBankChecker implements Checker {
  async check(imei: string): Promise<CheckResult> {
    const url = 'https://ct11.my.softbank.jp/WBF/icv';
    // Launch puppeteer. In production/serverless, might need different args.
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      
      // SoftBank input selector (usually name="imei")
      // We might need to inspect the page live, but I'll use standard selectors or try to find by ID
      // Assuming input id 'imei' or similar. 
      // Based on common knowledge: Input is often <input name="imei">
      
      const inputSelector = 'input[name="imei"]';
      await page.waitForSelector(inputSelector, { timeout: 5000 });
      await page.type(inputSelector, imei);

      // Submit button
      const buttonSelector = 'input[type="submit"], button[type="submit"]';
      await page.click(buttonSelector);

      // Wait for result
      // SoftBank result usually shows an image or text with "○", "△", "×", "－"
      await page.waitForSelector('.result, table', { timeout: 5000 });

      const content = await page.content();
      
      let status: Status = 'Unknown';
      if (content.includes('○')) status = 'O';
      else if (content.includes('△')) status = '△';
      else if (content.includes('×') || content.includes('X')) status = 'X';
      else if (content.includes('－') || content.includes('-')) status = '-';

      return {
        carrier: 'SoftBank',
        status
      };

    } catch (error: any) {
      return {
        carrier: 'SoftBank',
        status: 'Unknown',
        message: error.message
      };
    } finally {
      await browser.close();
    }
  }
}