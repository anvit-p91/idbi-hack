import { Bell, Search, ChevronDown, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface TopNavProps {
  title: string;
}

export function TopNav({ title }: TopNavProps) {
  const [searchVal, setSearchVal] = useState("");

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-background border-b border-border flex-shrink-0">
      <div>
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search leads, customers..."
            value={searchVal}
            onChange={e => setSearchVal(e.target.value)}
            className="pl-9 pr-4 py-1.5 text-sm bg-muted rounded-lg border border-border focus:outline-none focus:ring-1 focus:ring-ring w-56 placeholder:text-muted-foreground"
            data-testid="top-search-input"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-muted transition-colors" data-testid="notifications-btn">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-destructive text-destructive-foreground border-0">
            5
          </Badge>
        </button>

        {/* RM Profile */}
        <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-muted transition-colors" data-testid="rm-profile-btn">
          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-medium text-foreground leading-tight">Anjali Singh</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Bandra West</p>
          </div>
          <ChevronDown className="w-3 h-3 text-muted-foreground hidden md:block" />
        </button>
      </div>
    </header>
  );
}
