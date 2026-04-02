import { Bell, Wallet, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useUnreadCount } from "@/hooks/useNotifications";

export default function AppHeader() {
  const { data: profile } = useProfile();
  const balance = profile?.balance ?? 0;
  const unreadCount = useUnreadCount();

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <h1 className="text-lg font-bold gradient-text">TradeX Pro</h1>
        <div className="flex items-center gap-3">
          <Link to="/deposit" className="flex items-center gap-1 bg-primary/10 text-primary rounded-lg px-3 py-1.5 text-sm font-semibold">
            <Wallet className="h-4 w-4" />
            <span>${Number(balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </Link>
          <Link to="/notifications" className="relative text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full text-[9px] text-primary-foreground flex items-center justify-center font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
