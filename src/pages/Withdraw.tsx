import { motion } from "framer-motion";
import { Wallet, CreditCard, Building2, AlertCircle, Crown } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/hooks/useProfile";
import { getVipLevel } from "@/lib/vipConfig";

export default function Withdraw() {
  const [selectedMethod, setSelectedMethod] = useState("usdt");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const queryClient = useQueryClient();
  const balance = profile?.balance ?? 0;

  const totalDeposits = Number(profile?.total_deposits ?? 0);
  const vip = getVipLevel(totalDeposits);

  const methods = [
    { id: "usdt", name: "USDT (TRC20)", icon: Wallet, min: 20, fee: "$1", time: "10-30 دقيقة" },
    { id: "card", name: "بطاقة ائتمان", icon: CreditCard, min: 50, fee: "3%", time: "1-3 أيام" },
    { id: "bank", name: "تحويل بنكي", icon: Building2, min: 100, fee: "$5", time: "3-5 أيام" },
  ];

  const handleWithdraw = async () => {
    const method = methods.find((m) => m.id === selectedMethod)!;
    if (!amount || parseFloat(amount) < method.min) {
      toast.error(`الحد الأدنى للسحب: $${method.min}`);
      return;
    }
    if (parseFloat(amount) > balance) {
      toast.error("الرصيد غير كافي");
      return;
    }
    if (parseFloat(amount) > vip.maxWithdrawDaily) {
      toast.error(`حد السحب اليومي لمستوى VIP ${vip.level} هو $${vip.maxWithdrawDaily.toLocaleString()}`);
      return;
    }
    if (selectedMethod === "usdt" && !address) {
      toast.error("الرجاء إدخال عنوان المحفظة");
      return;
    }
    if (!user) { toast.error("يرجى تسجيل الدخول أولاً"); return; }
    setLoading(true);
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "withdraw",
      amount: parseFloat(amount),
      status: "pending",
      detail: `سحب عبر ${method.name}${address ? ` - ${address}` : ""}`,
    });
    setLoading(false);
    if (error) { toast.error("حدث خطأ أثناء تسجيل السحب"); return; }
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success(`تم إرسال طلب السحب! الوقت المتوقع: ${method.time}`);
    setAmount("");
    setAddress("");
  };

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto space-y-5 pt-4" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold mb-1">سحب الأرباح</h2>
        <p className="text-sm text-muted-foreground">
          الرصيد المتاح: <span className="font-mono text-primary font-semibold">${balance.toFixed(2)}</span>
        </p>
      </motion.div>

      {/* VIP Withdraw Limit Banner */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg ${vip.bg} border border-primary/10`}
      >
        <Crown className={`h-4 w-4 ${vip.color}`} />
        <span className="text-xs font-semibold">
          حد السحب اليومي (VIP {vip.level}): <span className="text-primary font-mono">${vip.maxWithdrawDaily.toLocaleString()}</span>
        </span>
      </motion.div>

      {/* Methods */}
      <div className="space-y-3">
        {methods.map((method, i) => (
          <motion.button
            key={method.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedMethod(method.id)}
            className={`w-full glass-card p-4 flex items-center gap-3 text-right transition-all ${
              selectedMethod === method.id ? "border-primary/50 glow-border" : "hover:border-primary/20"
            }`}
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <method.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{method.name}</p>
              <p className="text-xs text-muted-foreground">
                الحد الأدنى: ${method.min} · الرسوم: {method.fee} · {method.time}
              </p>
            </div>
            <div className={`h-4 w-4 rounded-full border-2 ${
              selectedMethod === method.id ? "border-primary bg-primary" : "border-muted-foreground"
            }`} />
          </motion.button>
        ))}
      </div>

      {/* Withdraw Form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 space-y-4"
      >
        <div>
          <label className="text-sm font-semibold mb-2 block">مبلغ السحب</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground font-mono text-lg focus:outline-none focus:border-primary/50 transition-colors"
          />
          {amount && parseFloat(amount) > vip.maxWithdrawDaily && (
            <p className="text-xs text-destructive mt-1">تجاوزت حد السحب اليومي (${ vip.maxWithdrawDaily.toLocaleString()})</p>
          )}
        </div>

        {selectedMethod === "usdt" && (
          <div>
            <label className="text-sm font-semibold mb-2 block">عنوان المحفظة (TRC20)</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="T..."
              dir="ltr"
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground font-mono text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        )}

        <div className="bg-muted rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            يتم معالجة طلبات السحب خلال ساعات العمل. تأكد من صحة البيانات المدخلة.
          </p>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
        >
          {loading ? "جاري الإرسال..." : "تأكيد السحب"}
        </button>
      </motion.div>
    </div>
  );
}
