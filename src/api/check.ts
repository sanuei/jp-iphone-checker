import { SoftBankChecker } from '../checkers/softbank';
import { AuChecker } from '../checkers/au';
import { DocomoChecker } from '../checkers/docomo';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { imei } = req.query;

  if (!imei || typeof imei !== 'string') {
    return res.status(400).json({ error: 'IMEI is required' });
  }

  try {
    const results = await Promise.all([
      new SoftBankChecker().check(imei),
      new AuChecker().check(imei),
      new DocomoChecker().check(imei)
    ]);

    return res.status(200).json({ results });
  } catch (error: any) {
    console.error("Handler error:", error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}