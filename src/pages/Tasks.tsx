import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, DollarSign, Crown, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { createNotification } from "@/hooks/useNotifications";
import { useProfile } from "@/hooks/useProfile";
import { getVipLevel } from "@/lib/vipConfig";

interface Task {
  id: number;
  title: string;
  reward: number;
  completed: boolean;
  type: "daily" | "special" | "vip";
  minVipLevel?: number;
}

const initialTasks: Task[] = [
  { id: 1, title: "تسجيل الدخول اليومي", reward: 0.5, completed: false, type: "daily" },
  { id: 2, title: "مشاهدة فيديو تعليمي", reward: 1.0, completed: false, type: "daily" },
  { id: 3, title: "إتمام صفقة تداول", reward: 2.0, completed: false, type: "daily" },
  { id: 4, title: "دعوة صديق جديد", reward: 5.0, completed: false, type: "daily" },
  { id: 5, title: "إيداع $50 أو أكثر", reward: 3.0, completed: false, type: "daily" },
  { id: 6, title: "مشاركة التطبيق على وسائل التواصل", reward: 1.5, completed: false, type: "daily" },
  { id: 7, title: "إكمال التحقق من الهوية", reward: 10.0, completed: false, type: "special" },
  { id: 8, title: "أول إيداع بقيمة $100", reward: 15.0, completed: false, type: "special" },
  { id: 9, title: "دعوة 5 أصدقاء", reward: 25.0, completed: false, type: "special" },
  // VIP Exclusive Tasks
  { id: 10, title: "تداول 5 صفقات يومياً", reward: 8.0, completed: false, type: "vip", minVipLevel: 2 },
  { id: 11, title: "إيداع $500 في يوم واحد", reward: 20.0, completed: false, type: "vip", minVipLevel: 3 },
  { id: 12, title: "تحقيق 10 صفقات رابحة متتالية", reward: 50.0, completed: false, type: "vip", minVipLevel: 4 },
  { id: 13, title: "تداول بقيمة $5,000 في أسبوع", reward: 100.0, completed: false, type: "vip", minVipLevel: 5 },
];

export default function Tasks() {
  const [tasks, setTasks] = useState(initialTasks);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  const totalDeposits = Number(profile?.total_deposits ?? 0);
  const vip = getVipLevel(totalDeposits);

  const completeTask = async (id: number) => {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.completed) return;
    if (task.type === "vip" && task.minVipLevel && vip.level < task.minVipLevel) {
      toast.error(`هذه المهمة تتطلب VIP ${task.minVipLevel} على الأقل`);
      return;
    }
    if (!user) { toast.error("يرجى تسجيل الدخول أولاً"); return; }

    setLoadingId(id);
    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      type: "reward",
      amount: task.reward,
      status: "completed",
      detail: `مكافأة مهمة: ${task.title}`,
    });
    setLoadingId(null);

    if (error) { toast.error("حدث خطأ أثناء تسجيل المكافأة"); return; }

    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed: true } : t));
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    await createNotification(user.id, "مكافأة مهمة", `تم إكمال "${task.title}" وحصلت على $${task.reward.toFixed(2)}`, "reward");
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    toast.success(`تم إكمال المهمة! +$${task.reward.toFixed(2)}`);
  };

  const dailyTasks = tasks.filter((t) => t.type === "daily");
  const specialTasks = tasks.filter((t) => t.type === "special");
  const vipTasks = tasks.filter((t) => t.type === "vip");
  const completedCount = tasks.filter((t) => t.completed).length;
  const totalReward = tasks.filter((t) => t.completed).reduce((a, t) => a + t.reward, 0);

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto space-y-5 pt-4" dir="rtl">
      {/* Progress */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 glow-border"
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-lg">المهام اليومية</h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3" /> يتم التجديد كل 24 ساعة
            </p>
          </div>
          <div className="text-left">
            <p className="text-2xl font-mono font-bold gradient-text">
              ${totalReward.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">المكافآت المحصلة</p>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="h-2 rounded-full bg-primary transition-all"
            style={{ width: `${(completedCount / tasks.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {completedCount}/{tasks.length} مهمة مكتملة
        </p>
      </motion.div>

      {/* Daily Tasks */}
      <TaskSection title="المهام اليومية" tasks={dailyTasks} loadingId={loadingId} onComplete={completeTask} vipLevel={vip.level} />

      {/* Special Tasks */}
      <TaskSection title="مهام خاصة ⭐" tasks={specialTasks} loadingId={loadingId} onComplete={completeTask} accent vipLevel={vip.level} />

      {/* VIP Tasks */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm flex items-center gap-2 text-primary">
          <Crown className="h-4 w-4" /> مهام VIP الحصرية 👑
        </h3>
        {!vip.exclusiveTasks && (
          <div className="glass-card p-4 text-center opacity-70">
            <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">مهام VIP الحصرية متاحة من المستوى الفضي (VIP 2) فما فوق</p>
          </div>
        )}
        {vipTasks.map((task, i) => {
          const locked = task.minVipLevel ? vip.level < task.minVipLevel : false;
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
            >
              <button
                onClick={() => completeTask(task.id)}
                disabled={task.completed || loadingId === task.id || locked}
                className={`w-full glass-card p-4 flex items-center gap-3 text-right transition-all border-primary/20 ${
                  task.completed ? "opacity-60" : locked ? "opacity-40" : "hover:border-primary/40"
                }`}
              >
                {locked ? (
                  <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                ) : task.completed ? (
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                ) : loadingId === task.id ? (
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
                ) : (
                  <Crown className="h-5 w-5 text-primary flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold block">{task.title}</span>
                  {locked && <span className="text-[10px] text-muted-foreground">يتطلب VIP {task.minVipLevel}</span>}
                </div>
                <span className="flex items-center gap-1 text-xs font-mono text-primary font-semibold">
                  <DollarSign className="h-3 w-3" />
                  {task.reward.toFixed(2)}
                </span>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function TaskSection({ title, tasks, loadingId, onComplete, accent, vipLevel }: {
  title: string; tasks: Task[]; loadingId: number | null; onComplete: (id: number) => void; accent?: boolean; vipLevel: number;
}) {
  return (
    <div className="space-y-3">
      <h3 className={`font-bold text-sm ${accent ? "gradient-gold-text" : "text-muted-foreground"}`}>{title}</h3>
      {tasks.map((task, i) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <button
            onClick={() => onComplete(task.id)}
            disabled={task.completed || loadingId === task.id}
            className={`w-full glass-card p-4 flex items-center gap-3 text-right transition-all ${
              task.completed ? "opacity-60" : accent ? "hover:border-accent/40 border-accent/20" : "hover:border-primary/30"
            }`}
          >
            {task.completed ? (
              <CheckCircle2 className={`h-5 w-5 ${accent ? "text-accent" : "text-primary"} flex-shrink-0`} />
            ) : loadingId === task.id ? (
              <div className={`h-5 w-5 border-2 ${accent ? "border-accent" : "border-primary"} border-t-transparent rounded-full animate-spin flex-shrink-0`} />
            ) : (
              <Circle className={`h-5 w-5 ${accent ? "text-accent/50" : "text-muted-foreground"} flex-shrink-0`} />
            )}
            <span className="flex-1 text-sm font-semibold">{task.title}</span>
            <span className={`flex items-center gap-1 text-xs font-mono ${accent ? "text-accent" : "text-primary"} font-semibold`}>
              <DollarSign className="h-3 w-3" />
              {task.reward.toFixed(2)}
            </span>
          </button>
        </motion.div>
      ))}
    </div>
  );
}
