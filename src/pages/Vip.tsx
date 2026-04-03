import { motion } from "framer-motion";
import { Crown, TrendingUp, Wallet, Users, Star, Lock, Gift, CheckCircle2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { vipLevels, getVipLevel, getNextVipLevel, getVipProgress } from "@/lib/vipConfig";

export default function Vip() {
  const { data: profile, isLoading } = useProfile();
  const totalDeposits = Number(profile?.total_deposits ?? 0);
  const current = getVipLevel(totalDeposits);
  const next = getNextVipLevel(current);
  const progress = getVipProgress(totalDeposits, current, next);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto space-y-5 pt-4" dir="rtl">
      {/* Current Level */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 glow-border text-center"
      >
        <div className={`inline-flex p-3 rounded-2xl ${current.bg} mb-3`}>
          <Crown className={`h-8 w-8 ${current.color}`} />
        </div>
        <h2 className="font-bold text-xl">VIP {current.level} - {current.name}</h2>
        <p className="text-sm text-muted-foreground mt-1">مستوى العضوية الحالي</p>

        {next && (
          <div className="mt-4 space-y-2">
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-y-0 right-0 bg-gradient-to-l from-primary to-primary/60 rounded-full"
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${totalDeposits.toLocaleString()} إيداع حالي</span>
              <span className={next.color}>المستوى التالي: {next.name} (${next.min.toLocaleString()})</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Current Benefits */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-4 space-y-3"
      >
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          مزاياك الحالية
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: TrendingUp, label: "بونص ربح إضافي", value: `+${current.profitBonus}%` },
            { icon: Wallet, label: "حد السحب اليومي", value: `$${current.maxWithdrawDaily.toLocaleString()}` },
            { icon: Users, label: "مكافأة إحالة", value: `${current.referralBonus}%` },
            { icon: Crown, label: "عمولة تداول", value: `${current.tradeFee}%` },
          ].map((b) => (
            <div key={b.label} className="bg-muted rounded-lg p-3 text-center">
              <b.icon className="h-4 w-4 text-primary mx-auto mb-1" />
              <p className="text-[10px] text-muted-foreground">{b.label}</p>
              <p className="text-sm font-mono font-bold text-primary mt-0.5">{b.value}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <div className={`flex-1 rounded-lg p-2 text-center ${current.exclusiveTasks ? "bg-primary/10" : "bg-muted"}`}>
            {current.exclusiveTasks ? <CheckCircle2 className="h-4 w-4 text-primary mx-auto mb-1" /> : <Lock className="h-4 w-4 text-muted-foreground mx-auto mb-1" />}
            <p className="text-[10px]">مهام حصرية</p>
          </div>
          <div className={`flex-1 rounded-lg p-2 text-center ${current.exclusiveGifts ? "bg-primary/10" : "bg-muted"}`}>
            {current.exclusiveGifts ? <CheckCircle2 className="h-4 w-4 text-primary mx-auto mb-1" /> : <Lock className="h-4 w-4 text-muted-foreground mx-auto mb-1" />}
            <p className="text-[10px]">هدايا حصرية</p>
          </div>
        </div>
      </motion.div>

      {/* All Levels */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-muted-foreground">جميع المستويات</h3>
        {vipLevels.map((vip, i) => {
          const isActive = vip.level === current.level;
          const isLocked = vip.level > current.level;
          return (
            <motion.div
              key={vip.level}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
              className={`glass-card p-4 transition-all ${
                isActive ? "border-primary/40 glow-border" : isLocked ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl ${vip.bg}`}>
                  {isLocked ? <Lock className={`h-5 w-5 ${vip.color}`} /> : <Crown className={`h-5 w-5 ${vip.color}`} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-bold ${vip.color}`}>VIP {vip.level} - {vip.name}</p>
                    {isActive && <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">الحالي</span>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {vip.max === Infinity ? `$${vip.min.toLocaleString()}+` : `$${vip.min.toLocaleString()} - $${vip.max.toLocaleString()}`}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="bg-muted/50 rounded p-1.5">
                  <p className="text-[8px] text-muted-foreground">بونص ربح</p>
                  <p className="text-[11px] font-mono font-bold text-primary">+{vip.profitBonus}%</p>
                </div>
                <div className="bg-muted/50 rounded p-1.5">
                  <p className="text-[8px] text-muted-foreground">حد سحب</p>
                  <p className="text-[11px] font-mono font-bold">${(vip.maxWithdrawDaily / 1000).toFixed(0)}K</p>
                </div>
                <div className="bg-muted/50 rounded p-1.5">
                  <p className="text-[8px] text-muted-foreground">إحالة</p>
                  <p className="text-[11px] font-mono font-bold">{vip.referralBonus}%</p>
                </div>
                <div className="bg-muted/50 rounded p-1.5">
                  <p className="text-[8px] text-muted-foreground">عمولة</p>
                  <p className="text-[11px] font-mono font-bold">{vip.tradeFee}%</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
