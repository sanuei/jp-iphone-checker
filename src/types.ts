export type Status = 'O' | '△' | 'X' | '-' | 'Unknown';
// O: Network safe (Circle)
// △: Still paying/Probation (Triangle)
// X: Restricted/Blacklisted (Cross)
// -: Not found/IMEI invalid (Hyphen)

export interface CheckResult {
  carrier: 'Docomo' | 'au' | 'SoftBank' | 'Rakuten';
  status: Status;
  message?: string;
}

export interface Checker {
  check(imei: string): Promise<CheckResult>;
}