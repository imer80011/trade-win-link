import { motion } from "framer-motion";
import { Gift, Star, Clock, CheckCircle2, Crown, Lock } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { createNotification } from "@/hooks/useNotifications";
import { useProfile } from "@/hooks/useProfile";
import { getVipLevel } from "@/lib/vipConfig";

interface GiftItem {
  id: number;
  title: string;
  description: string;
  reward: number;
  requirement: string;
  claimed: boolean;
  available: boolean;
  icon: "star" | "gift" | "crown";
  minVipLevel?: number;
}

const initialGifts: GiftItem[] = [
  { id: 1, title: "مكافأة الترحيب", description: "مكافأة تسجيل حساب جديد", reward: 5, requirement: "تسجيل حساب", claimed: false, available: true, icon: "gift" },
  { id: 2, title: "أول إيداع", description: "مكافأة عند أول إيداع", reward: 10, requirement: "إيداع $50+", claimed: false, available: true, icon: "star" },
  { id: 3, title: "متداول نشط", description: "أكمل 10 صفقات تداول", reward: 20, requirement: "10 صفقات", claimed: false, available: true, icon: "gift" },
  { id: 4, title: "قائد الفريق", description: "ادعُ 10 أصدقاء", reward: 50, requirement: "10 إحالات", claimed: false, available: false, icon: "star" },
  { id: 5, title: "مستثمر VIP", description: "إيداع $1,000 أو أكثر", reward: 100, requirement: "إيداع $1,000+", claimed: false, available: false, icon: "star" },
  { id: 6, title: "مكافأة شهرية", description: "ابق نشطاً لمدة 30 يوم", reward: 30, requirement: "30 يوم نشاط", claimed: false, available: false, icon: "gift" },
  { id: 7, title: "هدية VIP الذهبية", description: "هدية حصرية لأعضاء VIP الذهبي", reward: 75, requirement: "VIP 3+", claimed: false, available: true, icon: "crown", minVipLevel: 3 },
  { id: 8, title: "بونص VIP البلاتيني", description: "بونص خاص لأعضاء البلاتينيوم", reward: 200, requirement: "VIP 4+", claimed: false, available: true, icon: "crown", minVipLevel: 4 },
  { id: 9, title: "جائزة VIP الماسية", description: "الجائزة الكبرى لأعضاء الماسي", reward: 500, requirement: "VIP 5", claimed: false, available: true, icon: "crown", minVipLevel: 5 },
];

export default function Gifts() {
  const [gifts, setGifts] = useState(initialGifts);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  const totalDeposits = Number(profile?.total_deposits ?? 0);
  const vip = getVipLevel(totalDeposits);

  // Load claimed gifts from DB
  const { data: claimedGifts } = useQuery({
    queryKey: ["claimed-gifts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("claimed_rewards")
        .select("reward_id")
        .eq("user_id", user!.id)
        .eq("reward_type", "gift");
      if (error) throw error;
      return data.map((r) => r.reward_id);
    },
    enabled: !!user,
  });

  // Mark already claimed gifts
  useEffect(() => {
    if (claimedGifts) {
      setGifts((prev) =>
        prev.map((g) => ({
          ...g,
          claimed: claimedGifts.includes(String(g.id)),
        }))
      );
    }
  }, [claimedGifts]);

  const claimGift = async (id: number) => {
    const gift = gifts.find((g) => g.id === id);
    if (!gift || !gift.available || gift.claimed) return;
    if (gift.minVipLevel && vip.level < gift.minVipLevel) {
      toast.error(`هذه الهدية تتطلب VIP ${gift.minVipLevel} على الأقل`);
      return;
    }
    if (!user) { toast.error("يرجى تسجيل الدخول أولاً"); return; }

    setLoadingId(id);

    // Check duplicate in DB
    const { data: existing } = await supabase
      .from("claimed_rewards")
      .select("id")
      .eq("user_id", user.id)
      .eq("reward_type", "gift")
      .eq("reward_id", String(id))
      .maybeSingle();

    if (existing) {
      setLoadingId(null);
      toast.error("لقد استلمت هذه الهدية مسبقاً!");
      setGifts((prev) => prev.map((g) => g.id === id ? { ...g, claimed: true } : g));
      return;
    }

    // Record claim
    const { error: claimError } = await supabase.from("claimed_rewards").insert({
      user_id: user.id,
      reward_type: "gift",
      reward_id: String(id),
    });

    if (claimError) {
      setLoadingId(null);
      toast.error("لقد استلمت هذه الهدية مسبقاً!");
      return;
    }

    // Add reward transaction
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
    queryClient.invalidateQueries({ queryKey: ["claimed-gifts"] });
    await createNotification(user.id, "هدية جديدة", `تم استلام "${gift.title}" بقيمة $${gift.reward.toFixed(2)} 🎁`, "reward");
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    toast.success(`تم الحصول على $${gift.reward.toFixed(2)}! 🎉`);
  };

  const totalClaimed = gifts.filter((g) => g.claimed).reduce((a, g) => a + g.reward, 0);
  const regularGifts = gifts.filter((g) => !g.minVipLevel);
  const vipGifts = gifts.filter((g) => !!g.minVipLevel);

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

      {/* Regular Gifts */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-muted-foreground">الهدايا العامة</h3>
        {regularGifts.map((gift, i) => (
          <GiftCard key={gift.id} gift={gift} index={i} loadingId={loadingId} onClaim={claimGift} vipLevel={vip.level} />
        ))}
      </div>

      {/* VIP Exclusive Gifts */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm flex items-center gap-2 text-primary">
          <Crown className="h-4 w-4" /> هدايا VIP الحصرية 👑
        </h3>
        {!vip.exclusiveGifts && (
          <div className="glass-card p-4 text-center opacity-70">
            <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">هدايا VIP الحصرية متاحة من المستوى الذهبي (VIP 3) فما فوق</p>
          </div>
        )}
        {vipGifts.map((gift, i) => (
          <GiftCard key={gift.id} gift={gift} index={i} loadingId={loadingId} onClaim={claimGift} vipLevel={vip.level} />
        ))}
      </div>
    </div>
  );
}

function GiftCard({ gift, index, loadingId, onClaim, vipLevel }: {
  gift: GiftItem; index: number; loadingId: number | null; onClaim: (id: number) => void; vipLevel: number;
}) {
  const locked = gift.minVipLevel ? vipLevel < gift.minVipLevel : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`glass-card p-4 flex items-center gap-3 ${
        locked ? "opacity-40" : !gift.available ? "opacity-50" : gift.claimed ? "opacity-70" : ""
      }`}
    >
      <div className={`p-2 rounded-xl ${gift.icon === "crown" ? "bg-primary/10" : gift.icon === "star" ? "bg-accent/10" : "bg-primary/10"}`}>
        {gift.icon === "crown" ? (
          <Crown className="h-5 w-5 text-primary" />
        ) : gift.icon === "star" ? (
          <Star className="h-5 w-5 text-accent" />
        ) : (
          <Gift className="h-5 w-5 text-primary" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{gift.title}</p>
        <p className="text-xs text-muted-foreground">{gift.description}</p>
        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
          {locked ? <Lock className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
          {gift.requirement}
        </p>
      </div>
      <div className="text-left">
        <p className="font-mono text-sm font-bold text-primary">${gift.reward}</p>
        {gift.claimed ? (
          <span className="text-xs text-primary flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> تم
          </span>
        ) : locked ? (
          <span className="text-xs text-muted-foreground">مقفل</span>
        ) : gift.available ? (
          <button
            onClick={() => onClaim(gift.id)}
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
  );
}
