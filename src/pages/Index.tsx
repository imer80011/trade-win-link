import { ArrowDownLeft, ArrowUpRight, TrendingUp, Users, ListChecks, Gift, History } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const quickActions = [
  { to: "/deposit", icon: ArrowDownLeft, label: "إيداع", color: "bg-primary/10 text-primary" },
  { to: "/withdraw", icon: ArrowUpRight, label: "سحب", color: "bg-accent/10 text-accent" },
  { to: "/trading", icon: TrendingUp, label: "تداول", color: "bg-info/10 text-info" },
  { to: "/referral", icon: Users, label: "إحالة", color: "bg-warning/10 text-warning" },
];

const stats = [
  { label: "الأرباح اليوم", value: "$32.50", change: "+2.6%" },
  { label: "إجمالي الأرباح", value: "$1,890.00", change: "+18.4%" },
  { label: "الإحالات", value: "12", change: "+3" },
  { label: "المهام المكتملة", value: "5/7", change: "71%" },
];

export default function Index() {
  return (
    <div className="pb-20 px-4 max-w-lg mx-auto space-y-5 pt-4" dir="rtl">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 glow-border"
      >
        <p className="text-muted-foreground text-sm">مرحباً بك 👋</p>
        <h2 className="text-xl font-bold mt-1">الرصيد الإجمالي</h2>
        <p className="text-3xl font-mono font-bold gradient-text mt-2">$1,250.00</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
            +$32.50 اليوم
          </span>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {quickActions.map((action, i) => (
          <motion.div
            key={action.to}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={action.to}
              className="flex flex-col items-center gap-2 glass-card p-3 hover:border-primary/30 transition-all"
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="glass-card p-4"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-lg font-mono font-bold mt-1">{stat.value}</p>
            <span className="text-xs text-primary font-semibold">{stat.change}</span>
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-muted-foreground">الوصول السريع</h3>
        {[
          { to: "/tasks", icon: ListChecks, label: "المهام اليومية", desc: "أكمل مهامك واربح مكافآت" },
          { to: "/team", icon: Users, label: "فريقك", desc: "12 عضو في فريقك" },
          { to: "/gifts", icon: Gift, label: "الهدايا", desc: "3 هدايا متاحة" },
          { to: "/transactions", icon: History, label: "سجل المعاملات", desc: "عرض تاريخ الإيداعات والصفقات" },
        ].map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          >
            <Link
              to={item.to}
              className="glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-all"
            >
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
