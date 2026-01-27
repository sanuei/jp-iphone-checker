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
      
      // Docomo: Click the "Next" / "Confirm" button to go to search.php
      const linkSelector = 'a[href="search.php"]';
      await page.waitForSelector(linkSelector, { timeout: 5000 });
      await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }),
          page.click(linkSelector)
      ]);

      // Now we should be on search.php
      const inputSelector = 'input[name="s"]'; // Assuming 's' or trying to find by type
      // Wait for input
      try {
          await page.waitForSelector(inputSelector, { timeout: 15000 });
      } catch {
          // If name="s" is wrong, try generic text input
          await page.waitForSelector('input[type="text"]', { timeout: 15000 });
      }
      
      // Find the correct input (often the first text input on search.php)
      const input = await page.$('input[name="s"]') || await page.$('input[type="text"]');
      if (input) {
          await input.type(imei);
          // Submit
          await page.click('input[type="submit"], button[type="submit"]');
      } else {
          throw new Error("Input field not found on search.php");
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