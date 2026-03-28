import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, TrendingUp, TrendingDown, Filter } from "lucide-react";

type TransactionType = "all" | "deposit" | "withdraw" | "trade";

interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "buy" | "sell";
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
  detail: string;
}

const transactions: Transaction[] = [
  { id: "1", type: "buy", amount: 85.00, date: "2026-03-28 14:32", status: "completed", detail: "BTC/USDT - Long 10x" },
  { id: "2", type: "deposit", amount: 500.00, date: "2026-03-28 12:10", status: "completed", detail: "USDT (TRC20)" },
  { id: "3", type: "sell", amount: 42.50, date: "2026-03-27 22:45", status: "completed", detail: "ETH/USDT - Short 20x" },
  { id: "4", type: "withdraw", amount: 200.00, date: "2026-03-27 18:00", status: "pending", detail: "USDT (TRC20)" },
  { id: "5", type: "buy", amount: 150.00, date: "2026-03-27 10:15", status: "completed", detail: "SOL/USDT - Long 5x" },
  { id: "6", type: "deposit", amount: 1000.00, date: "2026-03-26 09:00", status: "completed", detail: "تحويل بنكي" },
  { id: "7", type: "sell", amount: 60.00, date: "2026-03-26 08:20", status: "failed", detail: "BNB/USDT - Short 10x" },
  { id: "8", type: "withdraw", amount: 300.00, date: "2026-03-25 16:30", status: "completed", detail: "بطاقة ائتمان" },
  { id: "9", type: "buy", amount: 220.00, date: "2026-03-25 11:00", status: "completed", detail: "BTC/USDT - Long 50x" },
  { id: "10", type: "deposit", amount: 250.00, date: "2026-03-24 14:00", status: "completed", detail: "USDT (TRC20)" },
];

const filters: { label: string; value: TransactionType }[] = [
  { label: "الكل", value: "all" },
  { label: "إيداع", value: "deposit" },
  { label: "سحب", value: "withdraw" },
  { label: "صفقات", value: "trade" },
];

const iconMap = {
  deposit: ArrowDownLeft,
  withdraw: ArrowUpRight,
  buy: TrendingUp,
  sell: TrendingDown,
};

const colorMap = {
  deposit: "text-primary bg-primary/10",
  withdraw: "text-accent bg-accent/10",
  buy: "text-primary bg-primary/10",
  sell: "text-danger bg-danger/10",
};

const statusMap = {
  completed: { label: "مكتمل", class: "text-primary bg-primary/10" },
  pending: { label: "قيد المعالجة", class: "text-warning bg-warning/10" },
  failed: { label: "فشل", class: "text-danger bg-danger/10" },
};

const typeLabel = {
  deposit: "إيداع",
  withdraw: "سحب",
  buy: "شراء",
  sell: "بيع",
};

export default function Transactions() {
  const [filter, setFilter] = useState<TransactionType>("all");

  const filtered = transactions.filter((t) => {
    if (filter === "all") return true;
    if (filter === "trade") return t.type === "buy" || t.type === "sell";
    return t.type === filter;
  });

  const totalDeposits = transactions.filter(t => t.type === "deposit" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const totalWithdraws = transactions.filter(t => t.type === "withdraw" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const totalTrades = transactions.filter(t => (t.type === "buy" || t.type === "sell") && t.status === "completed").length;

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
        {filtered.map((t, i) => {
          const Icon = iconMap[t.type];
          const color = colorMap[t.type];
          const status = statusMap[t.status];
          const isIncome = t.type === "deposit" || t.type === "buy";

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
                  <p className="text-sm font-semibold">{typeLabel[t.type]}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${status.class}`}>
                    {status.label}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate">{t.detail}</p>
                <p className="text-[10px] text-muted-foreground/60 font-mono">{t.date}</p>
              </div>
              <p className={`font-mono font-bold text-sm ${isIncome ? "text-primary" : "text-danger"}`}>
                {isIncome ? "+" : "-"}${t.amount.toFixed(2)}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
