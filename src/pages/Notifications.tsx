import { motion } from "framer-motion";
import {
  Bell, CheckCircle2, DollarSign, Gift, TrendingUp, Info, Check,
} from "lucide-react";
import { useNotifications, markAsRead, markAllAsRead } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

const typeConfig: Record<string, { icon: any; color: string }> = {
  deposit: { icon: DollarSign, color: "text-primary bg-primary/10" },
  withdraw: { icon: DollarSign, color: "text-accent bg-accent/10" },
  trade: { icon: TrendingUp, color: "text-primary bg-primary/10" },
  reward: { icon: Gift, color: "text-accent bg-accent/10" },
  info: { icon: Info, color: "text-muted-foreground bg-muted" },
  approved: { icon: CheckCircle2, color: "text-primary bg-primary/10" },
  rejected: { icon: Info, color: "text-destructive bg-destructive/10" },
};

export default function Notifications() {
  const { data: notifications = [], isLoading } = useNotifications();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleMarkAllRead = async () => {
    if (!user) return;
    await markAllAsRead(user.id);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto space-y-4 pt-4" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">الإشعارات</h2>
            <p className="text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : "لا توجد إشعارات جديدة"}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"
          >
            <Check className="h-3 w-3" />
            قراءة الكل
          </button>
        )}
      </motion.div>

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-10 text-center"
        >
          <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">لا توجد إشعارات بعد</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => {
            const config = typeConfig[notif.type] || typeConfig.info;
            const Icon = config.icon;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                className={`glass-card p-4 flex items-start gap-3 cursor-pointer transition-all ${
                  !notif.is_read ? "border-primary/20 bg-primary/5" : "opacity-70"
                }`}
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${config.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{notif.title}</p>
                    {!notif.is_read && (
                      <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{notif.message}</p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {new Date(notif.created_at).toLocaleString("ar-EG")}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
