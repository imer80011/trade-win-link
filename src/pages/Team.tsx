import { motion } from "framer-motion";
import { Users, Crown, TrendingUp, Copy } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Team() {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const { data: referrals } = useQuery({
    queryKey: ["my-team", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch referred profiles
      if (!data.length) return [];
      const referredIds = data.map((r) => r.referred_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, vip_level, total_deposits")
        .in("user_id", referredIds);

      return data.map((r) => {
        const p = profiles?.find((p) => p.user_id === r.referred_id);
        return { ...r, profile: p };
      });
    },
    enabled: !!user,
  });

  const referralCode = profile?.referral_code || "";
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;
  const totalReferrals = profile?.total_referrals || 0;
  const totalRewards = referrals?.reduce((sum, r) => sum + Number(r.reward_amount || 0), 0) || 0;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("تم نسخ رابط الإحالة!");
  };

  const levels = [
    { level: "المستوى 1", commission: "10%", members: totalReferrals },
  ];

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto space-y-5 pt-4" dir="rtl">
      {/* Team Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 glow-border"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-primary/10">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg">فريقك</h2>
            <p className="text-xs text-muted-foreground">إجمالي الأعضاء: {totalReferrals}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xl font-mono font-bold">{totalReferrals}</p>
            <p className="text-xs text-muted-foreground">إحالات مباشرة</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xl font-mono font-bold gradient-text">${totalRewards.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">عمولات الإحالة</p>
          </div>
        </div>
      </motion.div>

      {/* Referral Link */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4"
      >
        <h3 className="font-bold text-sm mb-3">رابط الإحالة الخاص بك</h3>
        <div className="flex gap-2">
          <div className="flex-1 bg-muted rounded-lg px-3 py-2.5 text-xs font-mono text-muted-foreground truncate" dir="ltr">
            {referralLink}
          </div>
          <button
            onClick={copyLink}
            className="bg-primary text-primary-foreground px-4 rounded-lg flex items-center gap-1 text-sm font-semibold hover:brightness-110 transition-all"
          >
            <Copy className="h-4 w-4" />
            نسخ
          </button>
        </div>
      </motion.div>

      {/* Commission Levels */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-4"
      >
        <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
          <Crown className="h-4 w-4 text-accent" /> مستويات العمولة
        </h3>
        <div className="space-y-2">
          {levels.map((l) => (
            <div key={l.level} className="flex items-center justify-between bg-muted rounded-lg p-3">
              <span className="text-sm font-semibold">{l.level}</span>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-primary font-mono font-semibold">{l.commission}</span>
                <span className="text-muted-foreground">{l.members} عضو</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Team Members */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-muted-foreground flex items-center gap-2">
          <TrendingUp className="h-4 w-4" /> أعضاء الفريق
        </h3>
        {(!referrals || referrals.length === 0) ? (
          <div className="glass-card p-6 text-center text-muted-foreground text-sm">
            لم تقم بدعوة أي شخص بعد. شارك رابط الإحالة لبدء بناء فريقك!
          </div>
        ) : (
          referrals.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="glass-card p-4 flex items-center gap-3"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                {(member.profile?.display_name || "?").substring(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{member.profile?.display_name || "مستخدم"}</p>
                <p className="text-xs text-muted-foreground">
                  VIP {member.profile?.vip_level || 0}
                </p>
              </div>
              <p className="font-mono text-sm font-semibold text-primary">
                ${Number(member.reward_amount || 0).toFixed(0)}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
