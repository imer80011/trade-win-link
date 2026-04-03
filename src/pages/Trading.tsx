import { useState } from "react";
import { motion } from "framer-motion";
import TradingChart from "@/components/TradingChart";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { createNotification } from "@/hooks/useNotifications";
import { useProfile } from "@/hooks/useProfile";
import { getVipLevel } from "@/lib/vipConfig";
import { Crown } from "lucide-react";

const pairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT"];

export default function Trading() {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [selectedPair, setSelectedPair] = useState(0);
  const [leverage, setLeverage] = useState("10");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  const totalDeposits = Number(profile?.total_deposits ?? 0);
  const vip = getVipLevel(totalDeposits);
  const baseProfitMax = 0.15;
  const bonusMultiplier = 1 + vip.profitBonus / 100;

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("الرجاء إدخال مبلغ صحيح");
      return;
    }
    if (!user) { toast.error("يرجى تسجيل الدخول أولاً"); return; }
    const baseProfit = parseFloat(amount) * (Math.random() * baseProfitMax + 0.02);
    const profit = baseProfit * bonusMultiplier;
    setLoading(true);
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "trade",
      amount: profit,
      status: "completed",
      detail: `${activeTab === "buy" ? "شراء" : "بيع"} ${pairs[selectedPair]} | مبلغ: $${parseFloat(amount).toFixed(2)} | رافعة ${leverage}x | ربح: $${profit.toFixed(2)} (VIP+${vip.profitBonus}%)`,
    });
    setLoading(false);
    if (error) { toast.error("حدث خطأ أثناء تسجيل الصفقة"); return; }
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    await createNotification(user.id, "نتيجة صفقة", `${activeTab === "buy" ? "شراء" : "بيع"} ${pairs[selectedPair]} | ربح: $${profit.toFixed(2)} 📈 (بونص VIP +${vip.profitBonus}%)`, "trade");
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    toast.success(
      `تم ${activeTab === "buy" ? "الشراء" : "البيع"} بنجاح! الربح: $${profit.toFixed(2)}`,
      { duration: 4000 }
    );
    setAmount("");
  };

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto space-y-4 pt-4" dir="rtl">
      {/* VIP Bonus Banner */}
      {vip.profitBonus > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${vip.bg} border border-primary/10`}
        >
          <Crown className={`h-4 w-4 ${vip.color}`} />
          <span className="text-xs font-semibold">
            بونص VIP {vip.name}: <span className="text-primary">+{vip.profitBonus}%</span> ربح إضافي على كل صفقة
          </span>
        </motion.div>
      )}

      {/* Pairs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {pairs.map((pair, i) => (
          <button
            key={pair}
            onClick={() => setSelectedPair(i)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              i === selectedPair
                ? "bg-primary text-primary-foreground"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {pair}
          </button>
        ))}
      </div>

      <TradingChart />

      {/* Trade Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 space-y-4"
      >
        <div className="grid grid-cols-2 gap-2 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab("buy")}
            className={`py-2.5 rounded-md text-sm font-bold transition-all ${
              activeTab === "buy" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            شراء (Long)
          </button>
          <button
            onClick={() => setActiveTab("sell")}
            className={`py-2.5 rounded-md text-sm font-bold transition-all ${
              activeTab === "sell" ? "bg-danger text-foreground" : "text-muted-foreground"
            }`}
          >
            بيع (Short)
          </button>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block">الرافعة المالية</label>
          <div className="flex gap-2">
            {["5", "10", "20", "50"].map((lev) => (
              <button
                key={lev}
                onClick={() => setLeverage(lev)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  leverage === lev ? "bg-secondary text-foreground border border-primary/50" : "bg-muted text-muted-foreground"
                }`}
              >
                {lev}x
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-2 block">المبلغ (USDT)</label>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-muted border border-border rounded-lg px-4 py-3 text-foreground font-mono focus:outline-none focus:border-primary/50 transition-colors"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">USDT</span>
          </div>
          <div className="flex gap-2 mt-2">
            {["25%", "50%", "75%", "100%"].map((pct) => (
              <button
                key={pct}
                onClick={() => setAmount(String((1250 * parseInt(pct)) / 100))}
                className="flex-1 py-1.5 text-xs bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                {pct}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">نسبة الربح المتوقعة</span>
            <span className="text-primary font-semibold">
              {(2 * bonusMultiplier).toFixed(1)}% - {(17 * bonusMultiplier).toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">الربح المتوقع</span>
            <span className="font-mono font-semibold">
              ${amount ? (parseFloat(amount) * 0.08 * bonusMultiplier).toFixed(2) : "0.00"}
            </span>
          </div>
          {vip.profitBonus > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">بونص VIP</span>
              <span className={`font-semibold ${vip.color}`}>+{vip.profitBonus}%</span>
            </div>
          )}
        </div>

        <button
          onClick={handleTrade}
          disabled={loading}
          className={`w-full py-3.5 rounded-lg font-bold text-sm transition-all disabled:opacity-50 ${
            activeTab === "buy" ? "bg-primary text-primary-foreground hover:brightness-110" : "bg-danger text-foreground hover:brightness-110"
          }`}
        >
          {loading ? "جاري التنفيذ..." : activeTab === "buy" ? "شراء الآن" : "بيع الآن"}
        </button>
      </motion.div>
    </div>
  );
}
