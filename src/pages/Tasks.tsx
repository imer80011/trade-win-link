import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: number;
  title: string;
  reward: number;
  completed: boolean;
  type: "daily" | "special";
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
];

export default function Tasks() {
  const [tasks, setTasks] = useState(initialTasks);

  const completeTask = (id: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id && !t.completed) {
          toast.success(`تم إكمال المهمة! +$${t.reward.toFixed(2)}`);
          return { ...t, completed: true };
        }
        return t;
      })
    );
  };

  const dailyTasks = tasks.filter((t) => t.type === "daily");
  const specialTasks = tasks.filter((t) => t.type === "special");
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
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-muted-foreground">المهام اليومية</h3>
        {dailyTasks.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <button
              onClick={() => completeTask(task.id)}
              disabled={task.completed}
              className={`w-full glass-card p-4 flex items-center gap-3 text-right transition-all ${
                task.completed ? "opacity-60" : "hover:border-primary/30"
              }`}
            >
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              )}
              <span className="flex-1 text-sm font-semibold">{task.title}</span>
              <span className="flex items-center gap-1 text-xs font-mono text-primary font-semibold">
                <DollarSign className="h-3 w-3" />
                {task.reward.toFixed(2)}
              </span>
            </button>
          </motion.div>
        ))}
      </div>

      {/* Special Tasks */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm gradient-gold-text">مهام خاصة ⭐</h3>
        {specialTasks.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
          >
            <button
              onClick={() => completeTask(task.id)}
              disabled={task.completed}
              className={`w-full glass-card p-4 flex items-center gap-3 text-right border-accent/20 transition-all ${
                task.completed ? "opacity-60" : "hover:border-accent/40"
              }`}
            >
              {task.completed ? (
                <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-accent/50 flex-shrink-0" />
              )}
              <span className="flex-1 text-sm font-semibold">{task.title}</span>
              <span className="flex items-center gap-1 text-xs font-mono text-accent font-semibold">
                <DollarSign className="h-3 w-3" />
                {task.reward.toFixed(2)}
              </span>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
