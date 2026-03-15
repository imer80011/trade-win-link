import { motion } from "framer-motion";
import { Users, Crown, TrendingUp, Copy } from "lucide-react";
import { toast } from "sonner";

const teamMembers = [
  { name: "أحمد محمد", level: "VIP 3", earnings: "$450.00", referrals: 8, avatar: "AM" },
  { name: "فاطمة علي", level: "VIP 2", earnings: "$280.00", referrals: 5, avatar: "FA" },
  { name: "خالد حسن", level: "VIP 1", earnings: "$120.00", referrals: 2, avatar: "KH" },
  { name: "سارة أحمد", level: "VIP 1", earnings: "$95.00", referrals: 1, avatar: "SA" },
  { name: "محمد يوسف", level: "VIP 1", earnings: "$65.00", referrals: 0, avatar: "MY" },
];

const levels = [
  { level: "المستوى 1", commission: "10%", members: 5 },
  { level: "المستوى 2", commission: "5%", members: 12 },
  { level: "المستوى 3", commission: "2%", members: 30 },
];

export default function Team() {
  const referralCode = "TRX-" + Math.random().toString(36).substring(2, 8).toUpperCase();
  const referralLink = `https://tradexpro.app/ref/${referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("تم نسخ رابط الإحالة!");
  };

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
            <p className="text-xs text-muted-foreground">إجمالي الأعضاء: 47</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xl font-mono font-bold">12</p>
            <p className="text-xs text-muted-foreground">إحالات مباشرة</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xl font-mono font-bold gradient-text">$890</p>
            <p className="text-xs text-muted-foreground">عمولات الإحالة</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <p className="text-xl font-mono font-bold">47</p>
            <p className="text-xs text-muted-foreground">إجمالي الفريق</p>
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
          <TrendingUp className="h-4 w-4" /> أفضل أعضاء الفريق
        </h3>
        {teamMembers.map((member, i) => (
          <motion.div
            key={member.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="glass-card p-4 flex items-center gap-3"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
              {member.avatar}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{member.name}</p>
              <p className="text-xs text-muted-foreground">{member.level} · {member.referrals} إحالات</p>
            </div>
            <p className="font-mono text-sm font-semibold text-primary">{member.earnings}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
