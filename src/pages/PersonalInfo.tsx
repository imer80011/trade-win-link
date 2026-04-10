import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, Calendar, Wallet, Lock, Save, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";

export default function PersonalInfo() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const queryClient = useQueryClient();

  const [displayName, setDisplayName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [withdrawPassword, setWithdrawPassword] = useState("");
  const [confirmWithdrawPassword, setConfirmWithdrawPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasWithdrawPassword = !!profile?.withdraw_password;

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setWalletAddress((profile as any).wallet_address || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;

    if (withdrawPassword && withdrawPassword.length < 6) {
      toast.error("كلمة مرور السحب يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (withdrawPassword && withdrawPassword !== confirmWithdrawPassword) {
      toast.error("كلمة مرور السحب غير متطابقة");
      return;
    }

    setSaving(true);
    const updates: Record<string, any> = {
      display_name: displayName.trim() || null,
      wallet_address: walletAddress.trim() || null,
    };

    if (withdrawPassword) {
      updates.withdraw_password = withdrawPassword;
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);

    setSaving(false);
    if (error) {
      toast.error("حدث خطأ أثناء حفظ البيانات");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success("تم حفظ البيانات بنجاح");
    setWithdrawPassword("");
    setConfirmWithdrawPassword("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto space-y-5 pt-4" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold mb-1">المعلومات الشخصية</h2>
        <p className="text-sm text-muted-foreground">إدارة بياناتك ومحفظتك وكلمة مرور السحب</p>
      </motion.div>

      {/* Registration Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-4 space-y-3"
      >
        <h3 className="text-sm font-bold flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          معلومات التسجيل
        </h3>

        <InfoRow icon={Mail} label="البريد الإلكتروني" value={user?.email || "---"} />
        <InfoRow
          icon={Calendar}
          label="تاريخ التسجيل"
          value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" }) : "---"}
        />
        <InfoRow icon={User} label="رمز الإحالة" value={profile?.referral_code || "---"} />
      </motion.div>

      {/* Editable Fields */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 space-y-4"
      >
        <h3 className="text-sm font-bold">تعديل البيانات</h3>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">اسم العرض</label>
          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="اسمك المعروض"
              className="w-full bg-muted border border-border rounded-lg pr-10 pl-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>
      </motion.div>

      {/* Wallet Linking */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-4 space-y-4"
      >
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Wallet className="h-4 w-4 text-primary" />
          ربط المحفظة الشخصية
        </h3>
        <p className="text-xs text-muted-foreground">أدخل عنوان محفظتك USDT (TRC20) لاستخدامه في عمليات السحب</p>

        <div className="relative">
          <Wallet className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="T..."
            dir="ltr"
            className="w-full bg-muted border border-border rounded-lg pr-10 pl-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </motion.div>

      {/* Withdraw Password */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 space-y-4"
      >
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          كلمة مرور السحب
        </h3>
        <p className="text-xs text-muted-foreground">
          {hasWithdrawPassword
            ? "لديك كلمة مرور سحب مُعيّنة. أدخل كلمة جديدة لتغييرها."
            : "قم بتعيين كلمة مرور للسحب لحماية أموالك."}
        </p>

        <div className="relative">
          <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type={showPassword ? "text" : "password"}
            value={withdrawPassword}
            onChange={(e) => setWithdrawPassword(e.target.value)}
            placeholder={hasWithdrawPassword ? "كلمة مرور جديدة (اختياري)" : "كلمة مرور السحب"}
            className="w-full bg-muted border border-border rounded-lg pr-10 pl-10 py-3 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {withdrawPassword && (
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmWithdrawPassword}
              onChange={(e) => setConfirmWithdrawPassword(e.target.value)}
              placeholder="تأكيد كلمة مرور السحب"
              className="w-full bg-muted border border-border rounded-lg pr-10 pl-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        )}
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </motion.div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-2 py-2 bg-muted/50 rounded-lg">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className="text-xs text-muted-foreground flex-1">{label}</span>
      <span className="text-xs font-mono font-semibold truncate max-w-[180px]">{value}</span>
    </div>
  );
}
