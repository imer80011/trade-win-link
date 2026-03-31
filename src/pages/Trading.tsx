import { useState } from "react";
import { motion } from "framer-motion";
import TradingChart from "@/components/TradingChart";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

const pairs = ["BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT"];

export default function Trading() {
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("");
  const [selectedPair, setSelectedPair] = useState(0);
  const [leverage, setLeverage] = useState("10");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("الرجاء إدخال مبلغ صحيح");
      return;
    }
    if (!user) { toast.error("يرجى تسجيل الدخول أولاً"); return; }
    const profit = parseFloat(amount) * (Math.random() * 0.15 + 0.02);
    setLoading(true);
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "trade",
      amount: parseFloat(amount),
      status: "completed",
      detail: `${activeTab === "buy" ? "شراء" : "بيع"} ${pairs[selectedPair]} | رافعة ${leverage}x | ربح: $${profit.toFixed(2)}`,
    });
    setLoading(false);
    if (error) { toast.error("حدث خطأ أثناء تسجيل الصفقة"); return; }
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    toast.success(
      `تم ${activeTab === "buy" ? "الشراء" : "البيع"} بنجاح! الربح: $${profit.toFixed(2)}`,
      { duration: 4000 }
    );
    setAmount("");
  };

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto space-y-4 pt-4" dir="rtl">
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

      {/* Chart */}
      <TradingChart />

      {/* Trade Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 space-y-4"
      >
        {/* Buy/Sell Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-muted rounded-lg p-1">
          <button
            onClick={() => setActiveTab("buy")}
            className={`py-2.5 rounded-md text-sm font-bold transition-all ${
              activeTab === "buy"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            شراء (Long)
          </button>
          <button
            onClick={() => setActiveTab("sell")}
            className={`py-2.5 rounded-md text-sm font-bold transition-all ${
              activeTab === "sell"
                ? "bg-danger text-foreground"
                : "text-muted-foreground"
            }`}
          >
            بيع (Short)
          </button>
        </div>

        {/* Leverage */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">الرافعة المالية</label>
          <div className="flex gap-2">
            {["5", "10", "20", "50"].map((lev) => (
              <button
                key={lev}
                onClick={() => setLeverage(lev)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  leverage === lev
                    ? "bg-secondary text-foreground border border-primary/50"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {lev}x
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              USDT
            </span>
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

        {/* Estimated Profit */}
        <div className="bg-muted rounded-lg p-3 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">نسبة الربح المتوقعة</span>
            <span className="text-primary font-semibold">2% - 17%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">الربح المتوقع</span>
            <span className="font-mono font-semibold">
              ${amount ? (parseFloat(amount) * 0.08).toFixed(2) : "0.00"}
            </span>
          </div>
        </div>

        {/* Trade Button */}
        <button
          onClick={handleTrade}
          className={`w-full py-3.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === "buy"
              ? "bg-primary text-primary-foreground hover:brightness-110"
              : "bg-danger text-foreground hover:brightness-110"
          }`}
        >
          {activeTab === "buy" ? "شراء الآن" : "بيع الآن"}
        </button>
      </motion.div>
    </div>
  );
}
