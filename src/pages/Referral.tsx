import { motion } from "framer-motion";
import { Copy, Share2, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export default function Referral() {
  const { user } = useAuth();
  const { data: profile } = useProfile();

  const { data: referrals } = useQuery({
    queryKey: ["referrals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("referrals")
        .select("*")
        .eq("referrer_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const referralCode = profile?.referral_code || "...";
  const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;
  const totalReferrals = profile?.total_referrals || 0;
  const totalRewards = referrals?.reduce((sum, r) => sum + Number(r.reward_amount || 0), 0) || 0;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("تم نسخ رابط الإحالة!");
  };

  const shareLink = async () => {
    if (navigator.share) {
      await navigator.share({ title: "TradeX Pro", text: "انضم إلى TradeX Pro واربح مكافآت!", url: referralLink });
    } else {
      copyLink();
    }
  };

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto space-y-5 pt-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 glow-border text-center"
      >
        <div className="inline-flex p-3 rounded-2xl bg-primary/10 mb-3">
          <Share2 className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-bold text-xl">ادعُ أصدقاءك واربح</h2>
        <p className="text-sm text-muted-foreground mt-2">
          احصل على <span className="text-primary font-bold">10%</span> عمولة من كل إيداع يقوم به صديقك
        </p>
      </motion.div>

      {/* Referral Link */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 space-y-3"
      >
        <h3 className="font-semibold text-sm">رابط الإحالة</h3>
        <div className="bg-muted rounded-lg px-3 py-3 text-xs font-mono text-muted-foreground" dir="ltr">
          {referralLink}
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyLink}
            className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all"
          >
            <Copy className="h-4 w-4" /> نسخ الرابط
          </button>
          <button
            onClick={shareLink}
            className="flex-1 bg-secondary text-secondary-foreground py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all"
          >
            <Share2 className="h-4 w-4" /> مشاركة
          </button>
        </div>
      </motion.div>

      {/* Code */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass-card p-4 text-center"
      >
        <p className="text-xs text-muted-foreground mb-2">كود الإحالة</p>
        <p className="text-2xl font-mono font-bold tracking-wider gradient-text">{referralCode}</p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3"
      >
        <div className="glass-card p-4 text-center">
          <Users className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-xl font-mono font-bold">{totalReferrals}</p>
          <p className="text-xs text-muted-foreground">إحالات ناجحة</p>
        </div>
        <div className="glass-card p-4 text-center">
          <DollarSign className="h-5 w-5 text-primary mx-auto mb-2" />
          <p className="text-xl font-mono font-bold gradient-text">${totalRewards.toFixed(0)}</p>
          <p className="text-xs text-muted-foreground">إجمالي العمولات</p>
        </div>
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-4"
      >
        <h3 className="font-semibold text-sm mb-3">كيف تعمل الإحالة؟</h3>
        <div className="space-y-3">
          {[
            { step: "1", text: "شارك رابط الإحالة مع أصدقائك" },
            { step: "2", text: "يسجل صديقك حساب جديد عبر رابطك" },
            { step: "3", text: "عند كل إيداع يقوم به، تحصل على 10% عمولة تلقائياً" },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                {item.step}
              </div>
              <p className="text-sm">{item.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
