import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("كلمة المرور غير متطابقة");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      toast.error("حدث خطأ أثناء تغيير كلمة المرور");
      return;
    }
    toast.success("تم تغيير كلمة المرور بنجاح");
    navigate("/profile");
  };

  return (
    <div className="pb-20 px-4 max-w-lg mx-auto space-y-5 pt-4" dir="rtl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
        <button onClick={() => navigate("/profile")} className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowRight className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold">تغيير كلمة المرور</h2>
          <p className="text-sm text-muted-foreground">أدخل كلمة المرور الجديدة</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-5 space-y-4"
      >
        <div>
          <label className="text-sm font-semibold mb-2 block">كلمة المرور الجديدة</label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="أدخل كلمة المرور الجديدة"
              className="w-full bg-muted border border-border rounded-lg pr-10 pl-10 py-3 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">تأكيد كلمة المرور</label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="أعد إدخال كلمة المرور"
              className="w-full bg-muted border border-border rounded-lg pr-10 pl-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <button
          onClick={handleChangePassword}
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3.5 rounded-lg font-bold text-sm hover:brightness-110 transition-all disabled:opacity-50"
        >
          {loading ? "جاري التغيير..." : "تغيير كلمة المرور"}
        </button>
      </motion.div>
    </div>
  );
}
