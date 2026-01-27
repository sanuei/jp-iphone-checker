import puppeteer from 'puppeteer';
import { Checker, CheckResult, Status } from '../types';

export class DocomoChecker implements Checker {
  async check(imei: string): Promise<CheckResult> {
    const url = 'http://nw-restriction.nttdocomo.co.jp/top.php';
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
    });
    const page = await browser.newPage();

    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      
      // Docomo usually has a "Next" button or directly inputs.
      // Often you have to click "Agree" to terms first.
      // Let's look for a link or button to proceed.
      // Selector might be 'a' with text containing "次へ" or input.
      
      // Assuming straightforward for now (checking main page).
      // If it's the top page, usually need to click "利用制限の確認"
      
      // I'll try to find the input directly.
      const inputSelector = 'input[name="imei"], input[type="text"]';
      if (await page.$(inputSelector)) {
          await page.type(inputSelector, imei);
          await page.click('input[type="submit"]');
      } else {
          // Maybe need to click a link first?
          // I'll return specific error if input not found
          throw new Error("Input field not found, navigation might be required");
      }

      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 });
      const content = await page.content();
      
      let status: Status = 'Unknown';
      if (content.includes('○')) status = 'O';
      else if (content.includes('△')) status = '△';
      else if (content.includes('×') || content.includes('X')) status = 'X';
      else if (content.includes('－') || content.includes('-')) status = '-';

      return {
        carrier: 'Docomo',
        status
      };

    } catch (error: any) {
      return {
        carrier: 'Docomo',
        status: 'Unknown',
        message: error.message
      };
    } finally {
      await browser.close();
    }
  }
}