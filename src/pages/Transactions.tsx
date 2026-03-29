import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type TransactionType = "all" | "deposit" | "withdraw" | "trade";

const filters: { label: string; value: TransactionType }[] = [
  { label: "الكل", value: "all" },
  { label: "إيداع", value: "deposit" },
  { label: "سحب", value: "withdraw" },
  { label: "صفقات", value: "trade" },
];

const iconMap: Record<string, any> = {
  deposit: ArrowDownLeft,
  withdraw: ArrowUpRight,
  trade: TrendingUp,
};

const colorMap: Record<string, string> = {
  deposit: "text-primary bg-primary/10",
  withdraw: "text-accent bg-accent/10",
  trade: "text-primary bg-primary/10",
};

const statusMap: Record<string, { label: string; class: string }> = {
  completed: { label: "مكتمل", class: "text-primary bg-primary/10" },
  pending: { label: "قيد المعالجة", class: "text-warning bg-warning/10" },
  failed: { label: "فشل", class: "text-danger bg-danger/10" },
};

const typeLabel: Record<string, string> = {
  deposit: "إيداع",
  withdraw: "سحب",
  trade: "صفقة",
};

export default function Transactions() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<TransactionType>("all");

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const filtered = transactions.filter((t) => {
    if (filter === "all") return true;
    return t.type === filter;
  });

  const totalDeposits = transactions.filter(t => t.type === "deposit" && t.status === "completed").reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdraws = transactions.filter(t => t.type === "withdraw" && t.status === "completed").reduce((s, t) => s + Number(t.amount), 0);
  const totalTrades = transactions.filter(t => t.type === "trade" && t.status === "completed").length;

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto space-y-4 pt-4" dir="rtl">
      <h2 className="text-lg font-bold">سجل المعاملات</h2>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "إجمالي الإيداعات", value: `$${totalDeposits.toFixed(0)}` },
          { label: "إجمالي السحوبات", value: `$${totalWithdraws.toFixed(0)}` },
          { label: "عدد الصفقات", value: String(totalTrades) },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-3 text-center"
          >
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
            <p className="text-base font-mono font-bold mt-1">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              filter === f.value
                ? "bg-primary text-primary-foreground"
                : "glass-card text-muted-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">جاري التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">لا توجد معاملات بعد</div>
        ) : (
          filtered.map((t, i) => {
            const Icon = iconMap[t.type] || TrendingUp;
            const color = colorMap[t.type] || "text-primary bg-primary/10";
            const status = statusMap[t.status] || statusMap.pending;
            const isIncome = t.type === "deposit";

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="glass-card p-3 flex items-center gap-3"
              >
                <div className={`p-2 rounded-lg ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{typeLabel[t.type] || t.type}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${status.class}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{t.detail}</p>
                  <p className="text-[10px] text-muted-foreground/60 font-mono">
                    {new Date(t.created_at).toLocaleString("ar-EG")}
                  </p>
                </div>
                <p className={`font-mono font-bold text-sm ${isIncome ? "text-primary" : "text-danger"}`}>
                  {isIncome ? "+" : "-"}${Number(t.amount).toFixed(2)}
                </p>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
