import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Wallet,
  Package,
  Users,
  Wrench,
  UserCircle,
  GitBranch,
  Shield,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Projects", icon: FolderKanban, href: "/projects" },
  { label: "Tasks", icon: CheckSquare, href: "/tasks", badge: "12" },
  { label: "Finance", icon: Wallet, href: "/finance" },
  { label: "Inventory", icon: Package, href: "/inventory" },
  { label: "HR", icon: Users, href: "/hr" },
  { label: "Technicians", icon: Wrench, href: "/technicians" },
  { label: "CRM", icon: UserCircle, href: "/crm" },
];

const systemNavItems: NavItem[] = [
  { label: "Workflows", icon: GitBranch, href: "/workflows" },
  { label: "Permissions", icon: Shield, href: "/permissions" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Audit Logs", icon: FileText, href: "/audit" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Wifi className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-foreground">ISP ERP</span>
              <span className="text-xs text-muted-foreground">Enterprise Suite</span>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {!collapsed && (
            <span className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Main Menu
            </span>
          )}
          <div className="mt-2 space-y-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "nav-item group",
                  isActive(item.href) && "nav-item-active",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    isActive(item.href) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-1">
          {!collapsed && (
            <span className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              System
            </span>
          )}
          <div className="mt-2 space-y-1">
            {systemNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "nav-item group",
                  isActive(item.href) && "nav-item-active",
                  collapsed && "justify-center px-2"
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-colors",
                    isActive(item.href) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!collapsed && <span className="flex-1">{item.label}</span>}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">Admin</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
