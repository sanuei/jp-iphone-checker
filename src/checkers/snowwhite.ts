import { Checker, CheckResult, Status } from '../types';
import { launchBrowser } from '../browser-utils';

export class SnowWhiteChecker implements Checker {
  async check(imei: string): Promise<CheckResult> {
    const url = 'https://network-utilization-restriction.com/';
    const browser = await launchBrowser();
    const page = await browser.newPage();

    try {
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      // Selector for the input box (based on common behavior of this site)
      // Usually id="imei"
      await page.waitForSelector('#imei', { timeout: 10000 });
      await page.type('#imei', imei);

      // Submit
      await page.click('#check-btn');

      // Wait for result table
      await page.waitForSelector('#result-table', { timeout: 15000 });

      // Extract text from the result table
      // We are looking for the row that corresponds to "au"
      // This part requires knowing the exact DOM structure.
      // I will dump the table text for now to see if we get *anything*.
      
      const tableText = await page.$eval('#result-table', el => el.textContent);
      
      let status: Status = 'Unknown';
      if (tableText?.includes('au') && tableText.includes('○')) status = 'O';
      else if (tableText?.includes('au') && tableText.includes('△')) status = '△';
      else if (tableText?.includes('au') && tableText.includes('×')) status = 'X';
      else if (tableText?.includes('au') && tableText.includes('-')) status = '-';

      return {
        carrier: 'au', // We are using this as a proxy for au
        status,
        message: 'Via SnowWhite'
      };

    } catch (error: any) {
      return {
        carrier: 'au',
        status: 'Unknown',
        message: `SnowWhite Error: ${error.message}`
      };
    } finally {
      await browser.close();
    }
  }
}