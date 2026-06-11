import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ClipboardCheck,
  Heart,
  Users as UsersIcon,
  UserCog,
  ChevronLeft,
  Droplets,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/checks", label: "Checks", icon: ClipboardCheck },
  { to: "/donors", label: "Donors", icon: Heart },
  { to: "/patients", label: "Patients", icon: UsersIcon },
  { to: "/users", label: "Users", icon: UserCog },
  { to: "/receivers-performance", label: "Receivers", icon: TrendingUp },
  { to: "/distributors-performance", label: "Distributors", icon: TrendingUp },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "no-print flex flex-col h-full bg-canvas border-r border-hairline transition-all duration-200",
        collapsed ? "w-16" : "w-56",
      )}
    >
      <div
        className={cn(
          "flex items-center h-16 px-4 border-b border-hairline",
          collapsed ? "justify-center" : "gap-3",
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
          <Droplets className="h-4 w-4 text-on-primary" />
        </div>
        {!collapsed && (
          <span className="text-body-sm font-semibold text-ink truncate">
            Blood Bank
          </span>
        )}
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.to ||
            location.pathname.startsWith(item.to + "/");

          const link = (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2 text-body-sm transition-colors relative",
                isActive
                  ? "bg-canvas-soft-2 text-ink font-medium"
                  : "text-body hover:bg-canvas-soft hover:text-ink",
                collapsed && "justify-center px-0",
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full" />
              )}
              <item.icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  isActive ? "text-ink" : "text-mute",
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return link;
        })}
      </nav>

      <div className="p-2 border-t border-hairline">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed((c) => !c)}
          className={cn("w-full", collapsed ? "" : "ml-auto")}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180",
            )}
          />
        </Button>
      </div>
    </aside>
  );
}
