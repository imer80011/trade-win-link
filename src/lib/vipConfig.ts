export interface VipLevel {
  level: number;
  name: string;
  nameEn: string;
  min: number;
  max: number;
  color: string;
  bg: string;
  profitBonus: number;      // extra profit % added to base
  maxWithdrawDaily: number;  // daily withdraw limit
  referralBonus: number;     // referral bonus %
  tradeFee: number;          // trade fee %
  exclusiveTasks: boolean;
  exclusiveGifts: boolean;
}

export const vipLevels: VipLevel[] = [
  { level: 0, name: "عادي", nameEn: "Basic", min: 0, max: 500, color: "text-muted-foreground", bg: "bg-muted", profitBonus: 0, maxWithdrawDaily: 1000, referralBonus: 10, tradeFee: 0.10, exclusiveTasks: false, exclusiveGifts: false },
  { level: 1, name: "برونزي", nameEn: "Bronze", min: 500, max: 2000, color: "text-amber-600", bg: "bg-amber-600/10", profitBonus: 2, maxWithdrawDaily: 3000, referralBonus: 12, tradeFee: 0.085, exclusiveTasks: false, exclusiveGifts: false },
  { level: 2, name: "فضي", nameEn: "Silver", min: 2000, max: 5000, color: "text-slate-300", bg: "bg-slate-300/10", profitBonus: 5, maxWithdrawDaily: 5000, referralBonus: 14, tradeFee: 0.07, exclusiveTasks: true, exclusiveGifts: false },
  { level: 3, name: "ذهبي", nameEn: "Gold", min: 5000, max: 15000, color: "text-yellow-400", bg: "bg-yellow-400/10", profitBonus: 8, maxWithdrawDaily: 10000, referralBonus: 16, tradeFee: 0.055, exclusiveTasks: true, exclusiveGifts: true },
  { level: 4, name: "بلاتيني", nameEn: "Platinum", min: 15000, max: 50000, color: "text-cyan-400", bg: "bg-cyan-400/10", profitBonus: 12, maxWithdrawDaily: 25000, referralBonus: 18, tradeFee: 0.04, exclusiveTasks: true, exclusiveGifts: true },
  { level: 5, name: "ماسي", nameEn: "Diamond", min: 50000, max: Infinity, color: "text-primary", bg: "bg-primary/10", profitBonus: 18, maxWithdrawDaily: 100000, referralBonus: 22, tradeFee: 0.025, exclusiveTasks: true, exclusiveGifts: true },
];

export function getVipLevel(totalDeposits: number): VipLevel {
  return vipLevels.find((v) => totalDeposits >= v.min && totalDeposits < v.max) || vipLevels[0];
}

export function getNextVipLevel(current: VipLevel): VipLevel | null {
  return vipLevels[current.level + 1] || null;
}

export function getVipProgress(totalDeposits: number, current: VipLevel, next: VipLevel | null): number {
  if (!next) return 100;
  return ((totalDeposits - current.min) / (next.min - current.min)) * 100;
}
