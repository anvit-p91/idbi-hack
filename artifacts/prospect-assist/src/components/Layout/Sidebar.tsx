import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, User, Brain, TrendingUp,
  Gift, BarChart3, Lightbulb, Settings, ChevronLeft, ChevronRight, Building2
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Lead Management", icon: Users, path: "/leads" },
  { label: "Customer 360", icon: User, path: "/customer360/1" },
  { label: "AI Intelligence", icon: Brain, path: "/ai-intelligence" },
  { label: "Income Intelligence", icon: TrendingUp, path: "/income/1" },
  { label: "Offer Recommendation", icon: Gift, path: "/offers/1" },
  { label: "Analytics", icon: BarChart3, path: "/analytics" },
  { label: "Explainability", icon: Lightbulb, path: "/explainability/1" },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex-shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded bg-accent flex items-center justify-center flex-shrink-0">
          <Building2 className="w-4 h-4 text-sidebar" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sidebar-foreground font-bold text-sm tracking-wide leading-tight">IDBI BANK</p>
            <p className="text-sidebar-foreground/50 text-xs leading-tight">Prospect Assist AI</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path ||
            (item.path !== "/" && location.startsWith(item.path.split("/").slice(0, 2).join("/")));
          return (
            <Link key={item.path} href={item.path}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-accent text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-sidebar" : "")} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          data-testid="sidebar-collapse-toggle"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}
