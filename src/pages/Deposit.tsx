import { motion } from "framer-motion";
import { Copy, CreditCard, Wallet, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

const methods = [
  { id: "usdt", name: "USDT (TRC20)", icon: Wallet, min: 10, fee: "0%" },
  { id: "card", name: "بطاقة ائتمان", icon: CreditCard, min: 20, fee: "2.5%" },
  { id: "bank", name: "تحويل بنكي", icon: Building2, min: 50, fee: "1%" },
];

export default function Deposit() {
  const [selectedMethod, setSelectedMethod] = useState("usdt");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleDeposit = async () => {
    const method = methods.find((m) => m.id === selectedMethod)!;
    if (!amount || parseFloat(amount) < method.min) {
      toast.error(`الحد الأدنى للإيداع: $${method.min}`);
      return;
    }
    if (!user) { toast.error("يرجى تسجيل الدخول أولاً"); return; }
    setLoading(true);
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "deposit",
      amount: parseFloat(amount),
      status: "pending",
      detail: `إيداع عبر ${method.name}`,
    });
    setLoading(false);
    if (error) { toast.error("حدث خطأ أثناء تسجيل الإيداع"); return; }
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success("تم إرسال طلب الإيداع بنجاح! سيتم تأكيده خلال دقائق.");
    setAmount("");
  };

  const walletAddress = "TRx7nH...kJ9mP2qW5";

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto space-y-5 pt-4" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold mb-1">إيداع الرصيد</h2>
        <p className="text-sm text-muted-foreground">اختر طريقة الإيداع المناسبة</p>
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
                الحد الأدنى: ${method.min} · الرسوم: {method.fee}
              </p>
            </div>
            <div className={`h-4 w-4 rounded-full border-2 ${
              selectedMethod === method.id ? "border-primary bg-primary" : "border-muted-foreground"
            }`} />
          </motion.button>
        ))}
      </div>

      {/* Amount */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 space-y-4"
      >
        <label className="text-sm font-semibold">مبلغ الإيداع</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground font-mono text-lg focus:outline-none focus:border-primary/50 transition-colors"
        />
        <div className="flex gap-2">
          {[50, 100, 250, 500].map((val) => (
            <button
              key={val}
              onClick={() => setAmount(String(val))}
              className="flex-1 py-2 text-sm bg-muted rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors font-mono"
            >
              ${val}
            </button>
          ))}
        </div>

        {selectedMethod === "usdt" && (
          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-2">عنوان المحفظة (TRC20)</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-foreground" dir="ltr">{walletAddress}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(walletAddress);
                  toast.success("تم نسخ العنوان!");
                }}
                className="text-primary"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleDeposit}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all"
        >
          تأكيد الإيداع
        </button>
      </motion.div>
    </div>
  );
}
