"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const softbank_1 = require("./checkers/softbank");
const au_1 = require("./checkers/au");
const docomo_1 = require("./checkers/docomo");
async function main() {
    const imei = process.argv[2];
    if (!imei) {
        console.log('Please provide an IMEI as an argument.');
        process.exit(1);
    }
    console.log(`Checking IMEI: ${imei}...`);
    const results = await Promise.all([
        new softbank_1.SoftBankChecker().check(imei),
        new au_1.AuChecker().check(imei),
        new docomo_1.DocomoChecker().check(imei)
    ]);
    results.forEach(res => {
        console.log(`[${res.carrier}] Status: ${res.status} ${res.message ? `(${res.message})` : ''}`);
    });
}
main();
