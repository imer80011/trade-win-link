import { motion } from "framer-motion";
import { Copy, Wallet, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import depositQr from "@/assets/deposit-qr-cropped.png";

const WALLET_ADDRESS = "TDaxqTa4VuGtQZog3toXGDN8thasQcnXot";
const MIN_DEPOSIT = 50;
const DEPOSIT_TIME_LIMIT = 30; // minutes

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DEPOSIT_TIME_LIMIT * 60);
  const [timerActive, setTimerActive] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!timerActive) return;
    if (timeLeft <= 0) {
      setTimerActive(false);
      toast.error("انتهى الوقت المحدد للإيداع! يرجى إعادة المحاولة.");
      return;
    }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) < MIN_DEPOSIT) {
      toast.error(`الحد الأدنى للإيداع: $${MIN_DEPOSIT}`);
      return;
    }
    if (!user) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "deposit",
      amount: parseFloat(amount),
      status: "pending",
      detail: `إيداع USDT (TRC20) - ${WALLET_ADDRESS}`,
    });
    setLoading(false);
    if (error) {
      toast.error("حدث خطأ أثناء تسجيل الإيداع");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success("تم إرسال طلب الإيداع بنجاح! سيتم تأكيده بعد التحقق.");
    setAmount("");
    setTimerActive(true);
    setTimeLeft(DEPOSIT_TIME_LIMIT * 60);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS);
    toast.success("تم نسخ عنوان المحفظة!");
  };

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto space-y-5 pt-4" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-bold mb-1">إيداع USDT</h2>
        <p className="text-sm text-muted-foreground">
          أرسل USDT عبر شبكة TRC20 إلى العنوان أدناه
        </p>
      </motion.div>

      {/* QR Code */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 flex flex-col items-center space-y-4"
      >
        <div className="bg-white rounded-xl p-3">
          <img
            src={depositQr}
            alt="QR Code لعنوان المحفظة"
            className="w-48 h-48 object-contain"
          />
        </div>

        {/* Wallet Address */}
        <div className="w-full bg-muted rounded-lg p-3">
          <p className="text-xs text-muted-foreground mb-1 text-center">العنوان</p>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 text-xs font-mono text-foreground break-all text-center"
              dir="ltr"
            >
              {WALLET_ADDRESS}
            </code>
            <button
              onClick={copyAddress}
              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex-shrink-0"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Network & Min Info */}
        <div className="w-full space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-muted-foreground">الشبكة</span>
            <span className="text-sm font-semibold">TRC20 (Tron)</span>
          </div>
          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-muted-foreground">الحد الأدنى للإيداع</span>
            <span className="text-sm font-semibold font-mono">${MIN_DEPOSIT}</span>
          </div>
        </div>
      </motion.div>

      {/* Timer */}
      {timerActive && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 rounded-lg bg-accent/10 border border-accent/20"
        >
          <Clock className="h-4 w-4 text-accent flex-shrink-0" />
          <span className="text-sm font-semibold">
            الوقت المتبقي للإيداع:{" "}
            <span className="font-mono text-accent">{formatTime(timeLeft)}</span>
          </span>
        </motion.div>
      )}

      {/* Warning */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex items-start gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20"
      >
        <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
        <div className="text-xs text-muted-foreground space-y-1">
          <p>* لا تودع أي أصول بخلاف USDT على هذا العنوان.</p>
          <p>* يجب إتمام الإيداع خلال <strong className="text-foreground">30 دقيقة</strong>.</p>
          <p>* الحد الأدنى للإيداع <strong className="text-foreground">${MIN_DEPOSIT}</strong>.</p>
        </div>
      </motion.div>

      {/* Amount & Confirm */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-4 space-y-4"
      >
        <label className="text-sm font-semibold">مبلغ الإيداع (USDT)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={`الحد الأدنى $${MIN_DEPOSIT}`}
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

        <button
          onClick={handleDeposit}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
        >
          {loading ? "جاري الإرسال..." : "تأكيد الإيداع"}
        </button>
      </motion.div>
    </div>
  );
}
