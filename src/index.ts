import { SoftBankChecker } from './checkers/softbank';
import { AuChecker } from './checkers/au';
import { DocomoChecker } from './checkers/docomo';

async function main() {
  const imei = process.argv[2];
  if (!imei) {
    console.log('Please provide an IMEI as an argument.');
    process.exit(1);
  }

  console.log(`Checking IMEI: ${imei}...`);

  const results = await Promise.all([
    new SoftBankChecker().check(imei),
    new AuChecker().check(imei),
    new DocomoChecker().check(imei)
  ]);

  results.forEach(res => {
      console.log(`[${res.carrier}] Status: ${res.status} ${res.message ? `(${res.message})` : ''}`);
  });
}

main();