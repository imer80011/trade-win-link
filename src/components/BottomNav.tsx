import { Home, TrendingUp, ListChecks, Users, Gift } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", icon: Home, label: "الرئيسية" },
  { to: "/trading", icon: TrendingUp, label: "التداول" },
  { to: "/tasks", icon: ListChecks, label: "المهام" },
  { to: "/team", icon: Users, label: "الفريق" },
  { to: "/gifts", icon: Gift, label: "الهدايا" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="font-cairo">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
