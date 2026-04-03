import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Shield, Crown, Star, ChevronLeft, Bell, Lock, Globe,
  Moon, LogOut, Copy, TrendingUp, Wallet, Users
} from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useNavigate } from "react-router-dom";
import { getVipLevel, getNextVipLevel, getVipProgress } from "@/lib/vipConfig";

export default function Profile() {
  const { user, signOut } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const navigate = useNavigate();

  const totalDeposits = Number(profile?.total_deposits ?? 0);
  const totalProfits = Number(profile?.total_profits ?? 0);
  const totalTrades = profile?.total_trades ?? 0;
  const totalReferrals = profile?.total_referrals ?? 0;
  const displayName = profile?.display_name || "مستخدم TradeX";
  const referralCode = profile?.referral_code || "---";

  const currentVip = getVipLevel(totalDeposits);
  const nextVip = getNextVipLevel(currentVip);
  const progress = getVipProgress(totalDeposits, currentVip, nextVip);

  const copyId = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("تم نسخ رمز الإحالة");
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("تم تسجيل الخروج");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto space-y-4 pt-4" dir="rtl">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 glow-border"
      >
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/40 flex items-center justify-center">
            <User className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{displayName}</h2>
            <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <button onClick={copyId} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <span className="font-mono">{referralCode}</span>
                <Copy className="h-3 w-3" />
              </button>
            </div>
            <button onClick={() => navigate("/vip")} className={`flex items-center gap-1 mt-1.5 ${currentVip.color} hover:opacity-80 transition-opacity`}>
              <Crown className="h-3.5 w-3.5" />
              <span className="text-xs font-bold">VIP {currentVip.level} - {currentVip.name}</span>
              <ChevronLeft className="h-3 w-3" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* VIP Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-4 space-y-3 cursor-pointer hover:border-primary/30 transition-all"
        onClick={() => navigate("/vip")}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Crown className="h-4 w-4 text-primary" />
            مستوى VIP
          </h3>
          {nextVip && (
            <span className="text-[10px] text-muted-foreground">
              التالي: <span className={nextVip.color + " font-bold"}>{nextVip.name}</span>
            </span>
          )}
        </div>

        {nextVip && (
          <>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute inset-y-0 right-0 bg-gradient-to-l from-primary to-primary/60 rounded-full"
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>${totalDeposits.toLocaleString()} إيداع حالي</span>
              <span>يتطلب ${nextVip.min.toLocaleString()}</span>
            </div>
          </>
        )}

        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { label: "بونص ربح", value: `+${currentVip.profitBonus}%` },
            { label: "حد السحب اليومي", value: `$${currentVip.maxWithdrawDaily.toLocaleString()}` },
            { label: "مكافأة إحالة", value: `${currentVip.referralBonus}%` },
          ].map((b) => (
            <div key={b.label} className="bg-muted rounded-lg p-2 text-center">
              <p className="text-[9px] text-muted-foreground">{b.label}</p>
              <p className="text-xs font-mono font-bold mt-0.5 text-primary">{b.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Account Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        {[
          { icon: Wallet, label: "إجمالي الإيداعات", value: `$${totalDeposits.toLocaleString()}`, color: "text-primary bg-primary/10" },
          { icon: TrendingUp, label: "إجمالي الأرباح", value: `$${totalProfits.toLocaleString()}`, color: "text-primary bg-primary/10" },
          { icon: Star, label: "عدد الصفقات", value: String(totalTrades), color: "text-warning bg-warning/10" },
          { icon: Users, label: "الإحالات", value: String(totalReferrals), color: "text-info bg-info/10" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.04 }}
            className="glass-card p-3"
          >
            <div className={`p-1.5 rounded-lg w-fit ${s.color}`}>
              <s.icon className="h-3.5 w-3.5" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">{s.label}</p>
            <p className="text-base font-mono font-bold">{s.value}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card divide-y divide-border"
      >
        <h3 className="text-sm font-bold p-4 pb-2">إعدادات الحساب</h3>

        <SettingRow icon={Bell} label="الإشعارات" toggle checked={notifications}
          onChange={() => { setNotifications(!notifications); toast.success(!notifications ? "تم تفعيل الإشعارات" : "تم إيقاف الإشعارات"); }} />
        <SettingRow icon={Moon} label="الوضع الداكن" toggle checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
        <SettingRow icon={Lock} label="تغيير كلمة المرور" onClick={() => toast.info("سيتم إضافة هذه الميزة قريباً")} />
        <SettingRow icon={Shield} label="التحقق من الهوية" badge="غير مكتمل" onClick={() => toast.info("سيتم إضافة هذه الميزة قريباً")} />
        <SettingRow icon={Globe} label="اللغة" value="العربية" onClick={() => toast.info("سيتم إضافة هذه الميزة قريباً")} />
        <AdminLink />
        <SettingRow icon={LogOut} label="تسجيل الخروج" danger onClick={handleSignOut} />
      </motion.div>

      <p className="text-center text-[10px] text-muted-foreground/50 pb-2">
        عضو منذ {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("ar-EG") : "---"}
      </p>
    </div>
  );
}

function SettingRow({ icon: Icon, label, toggle, checked, onChange, onClick, value, badge, danger }: {
  icon: any; label: string; toggle?: boolean; checked?: boolean; onChange?: () => void;
  onClick?: () => void; value?: string; badge?: string; danger?: boolean;
}) {
  return (
    <button onClick={toggle ? onChange : onClick} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
      <Icon className={`h-4 w-4 ${danger ? "text-danger" : "text-muted-foreground"}`} />
      <span className={`text-sm flex-1 text-right ${danger ? "text-danger" : ""}`}>{label}</span>
      {badge && <span className="text-[10px] bg-warning/10 text-warning px-2 py-0.5 rounded-full font-semibold">{badge}</span>}
      {value && <span className="text-xs text-muted-foreground">{value}</span>}
      {toggle && (
        <div className={`w-10 h-5 rounded-full transition-colors relative ${checked ? "bg-primary" : "bg-muted"}`}>
          <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition-transform ${checked ? "right-0.5" : "left-0.5"}`} />
        </div>
      )}
      {!toggle && !badge && !value && <ChevronLeft className="h-4 w-4 text-muted-foreground" />}
    </button>
  );
}

function AdminLink() {
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  if (!isAdmin) return null;
  return (
    <button onClick={() => navigate("/admin")} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors">
      <Shield className="h-4 w-4 text-primary" />
      <span className="text-sm flex-1 text-right text-primary font-semibold">لوحة الإدارة</span>
      <ChevronLeft className="h-4 w-4 text-primary" />
    </button>
  );
}
