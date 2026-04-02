import { motion } from "framer-motion";
import { Gift, Star, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { createNotification } from "@/hooks/useNotifications";

interface GiftItem {
  id: number;
  title: string;
  description: string;
  reward: number;
  requirement: string;
  claimed: boolean;
  available: boolean;
  icon: "star" | "gift";
}

const initialGifts: GiftItem[] = [
  { id: 1, title: "مكافأة الترحيب", description: "مكافأة تسجيل حساب جديد", reward: 5, requirement: "تسجيل حساب", claimed: false, available: true, icon: "gift" },
  { id: 2, title: "أول إيداع", description: "مكافأة عند أول إيداع", reward: 10, requirement: "إيداع $50+", claimed: false, available: true, icon: "star" },
  { id: 3, title: "متداول نشط", description: "أكمل 10 صفقات تداول", reward: 20, requirement: "10 صفقات", claimed: false, available: true, icon: "gift" },
  { id: 4, title: "قائد الفريق", description: "ادعُ 10 أصدقاء", reward: 50, requirement: "10 إحالات", claimed: false, available: false, icon: "star" },
  { id: 5, title: "مستثمر VIP", description: "إيداع $1,000 أو أكثر", reward: 100, requirement: "إيداع $1,000+", claimed: false, available: false, icon: "star" },
  { id: 6, title: "مكافأة شهرية", description: "ابق نشطاً لمدة 30 يوم", reward: 30, requirement: "30 يوم نشاط", claimed: false, available: false, icon: "gift" },
];

export default function Gifts() {
  const [gifts, setGifts] = useState(initialGifts);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const claimGift = async (id: number) => {
    const gift = gifts.find((g) => g.id === id);
    if (!gift || !gift.available || gift.claimed) return;
    if (!user) { toast.error("يرجى تسجيل الدخول أولاً"); return; }

    setLoadingId(id);
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "reward",
      amount: gift.reward,
      status: "completed",
      detail: `هدية: ${gift.title}`,
    });
    setLoadingId(null);

    if (error) { toast.error("حدث خطأ أثناء استلام الهدية"); return; }

    setGifts((prev) => prev.map((g) => g.id === id ? { ...g, claimed: true } : g));
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    toast.success(`تم الحصول على $${gift.reward.toFixed(2)}! 🎉`);
  };

  const totalClaimed = gifts.filter((g) => g.claimed).reduce((a, g) => a + g.reward, 0);

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto space-y-5 pt-4" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 glow-border text-center"
      >
        <div className="inline-flex p-3 rounded-2xl bg-accent/10 mb-3">
          <Gift className="h-8 w-8 text-accent" />
        </div>
        <h2 className="font-bold text-xl">مركز الهدايا</h2>
        <p className="text-sm text-muted-foreground mt-1">اجمع الهدايا والمكافآت</p>
        <p className="text-2xl font-mono font-bold gradient-gold-text mt-3">
          ${totalClaimed.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">المكافآت المحصلة</p>
      </motion.div>

      {/* Gifts List */}
      <div className="space-y-3">
        {gifts.map((gift, i) => (
          <motion.div
            key={gift.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass-card p-4 flex items-center gap-3 ${
              !gift.available ? "opacity-50" : gift.claimed ? "opacity-70" : ""
            }`}
          >
            <div className={`p-2 rounded-xl ${gift.icon === "star" ? "bg-accent/10" : "bg-primary/10"}`}>
              {gift.icon === "star" ? (
                <Star className="h-5 w-5 text-accent" />
              ) : (
                <Gift className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{gift.title}</p>
              <p className="text-xs text-muted-foreground">{gift.description}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="h-3 w-3" /> {gift.requirement}
              </p>
            </div>
            <div className="text-left">
              <p className="font-mono text-sm font-bold text-primary">${gift.reward}</p>
              {gift.claimed ? (
                <span className="text-xs text-primary flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> تم
                </span>
              ) : gift.available ? (
                <button
                  onClick={() => claimGift(gift.id)}
                  disabled={loadingId === gift.id}
                  className="mt-1 text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md font-semibold hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {loadingId === gift.id ? "..." : "استلام"}
                </button>
              ) : (
                <span className="text-xs text-muted-foreground">غير متاح</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
