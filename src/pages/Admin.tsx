import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, CheckCircle, XCircle, Clock, DollarSign, ArrowDownCircle, ArrowUpCircle, User } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";

type Transaction = {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  detail: string | null;
  created_at: string;
};

const statusColors: Record<string, string> = {
  pending: "text-yellow-400",
  completed: "text-primary",
  rejected: "text-destructive",
};

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  completed: "مكتمل",
  rejected: "مرفوض",
};

const typeLabels: Record<string, string> = {
  deposit: "إيداع",
  withdraw: "سحب",
  trade: "تداول",
};

export default function Admin() {
  const { isAdmin, isLoading: roleLoading } = useIsAdmin();
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "rejected">("pending");
  const [typeFilter, setTypeFilter] = useState<"all" | "deposit" | "withdraw" | "trade">("all");
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["admin-transactions", filter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter !== "all") query = query.eq("status", filter);
      if (typeFilter !== "all") query = query.eq("type", typeFilter);

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: isAdmin,
  });

  const handleAction = async (id: string, newStatus: "completed" | "rejected") => {
    const { error } = await supabase
      .from("transactions")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      toast.error("حدث خطأ أثناء تحديث الحالة");
      return;
    }
    toast.success(newStatus === "completed" ? "تمت الموافقة على الطلب" : "تم رفض الطلب");
    queryClient.invalidateQueries({ queryKey: ["admin-transactions"] });
  };

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/" replace />;

  const pendingCount = transactions.filter((t) => t.status === "pending").length;

  return (
    <div className="pb-20 px-4 max-w-2xl mx-auto space-y-5 pt-4" dir="rtl">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">لوحة الإدارة</h2>
          <p className="text-sm text-muted-foreground">
            {pendingCount > 0 ? `${pendingCount} طلب بانتظار المراجعة` : "لا توجد طلبات معلقة"}
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "معلق", count: transactions.filter((t) => t.status === "pending").length, icon: Clock, color: "text-yellow-400" },
          { label: "مكتمل", count: transactions.filter((t) => t.status === "completed").length, icon: CheckCircle, color: "text-primary" },
          { label: "مرفوض", count: transactions.filter((t) => t.status === "rejected").length, icon: XCircle, color: "text-destructive" },
        ].map((stat) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-3 text-center">
            <stat.icon className={`h-5 w-5 mx-auto mb-1 ${stat.color}`} />
            <p className="text-lg font-bold font-mono">{stat.count}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(["pending", "all", "completed", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              filter === s ? "bg-primary text-primary-foreground" : "glass-card text-muted-foreground"
            }`}
          >
            {s === "all" ? "الكل" : statusLabels[s]}
          </button>
        ))}
      </div>

      {/* Type Filter */}
      <div className="flex gap-2">
        {(["all", "deposit", "withdraw", "trade"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              typeFilter === t ? "bg-secondary text-foreground border border-primary/30" : "bg-muted text-muted-foreground"
            }`}
          >
            {t === "all" ? "الكل" : typeLabels[t]}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : transactions.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground">لا توجد معاملات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="glass-card p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {tx.type === "deposit" ? (
                    <ArrowDownCircle className="h-5 w-5 text-primary" />
                  ) : tx.type === "withdraw" ? (
                    <ArrowUpCircle className="h-5 w-5 text-accent" />
                  ) : (
                    <DollarSign className="h-5 w-5 text-primary" />
                  )}
                  <div>
                    <p className="text-sm font-semibold">{typeLabels[tx.type] || tx.type}</p>
                    <p className="text-xs text-muted-foreground">{tx.detail}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-mono font-bold text-sm">${tx.amount.toLocaleString()}</p>
                  <p className={`text-xs font-semibold ${statusColors[tx.status]}`}>
                    {statusLabels[tx.status] || tx.status}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="font-mono">{tx.user_id.slice(0, 8)}...</span>
                </div>
                <span>{new Date(tx.created_at).toLocaleString("ar-EG")}</span>
              </div>

              {tx.status === "pending" && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleAction(tx.id, "completed")}
                    className="flex-1 py-2 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    موافقة
                  </button>
                  <button
                    onClick={() => handleAction(tx.id, "rejected")}
                    className="flex-1 py-2 bg-destructive/10 text-destructive rounded-lg text-sm font-semibold hover:bg-destructive/20 transition-colors flex items-center justify-center gap-1"
                  >
                    <XCircle className="h-4 w-4" />
                    رفض
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
