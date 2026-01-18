import { useState, useEffect } from "react";
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
  ChevronDown,
  DollarSign,
  ListTodo,
  ReceiptText,
  CreditCard,
  Smartphone, // New import
  Banknote,   // New import
  Wifi,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";

interface NavItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  badge?: string;
  children?: NavItem[];
  permission?: string; // New: permission required to see this item
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Projects", icon: FolderKanban, href: "/projects", permission: "projects:read" },
  { label: "Tasks", icon: CheckSquare, href: "/tasks", badge: "12", permission: "tasks:read" },
  {
    label: "Finance",
    icon: Wallet,
    href: "/finance",
    permission: "finance:read",
    children: [
      { label: "Overview", icon: LayoutDashboard, href: "/finance" },
      { label: "Budgets", icon: FolderKanban, href: "/finance/budgets", permission: "finance:budgets:read" },
      { label: "Invoices", icon: ReceiptText, href: "/finance/invoices", permission: "finance:invoices:read" },
      { label: "Accounts", icon: CreditCard, href: "/finance/accounts", permission: "finance:accounts:read" },
      { label: "M-Pesa", icon: Smartphone, href: "/finance/mpesa", permission: "finance:mpesa:read" },
      { label: "NCBA Bank", icon: Banknote, href: "/finance/ncba", permission: "finance:ncba:read" },
      { label: "Reports", icon: FileText, href: "/finance/reports", permission: "finance:reports:read" },
    ]
  },
  { label: "Inventory", icon: Package, href: "/inventory", permission: "inventory:read" },
  { label: "HR", icon: Users, href: "/hr", permission: "hr:read" },
  { label: "Technicians", icon: Wrench, href: "/technicians", permission: "technicians:read" },
  {
    label: "CRM",
    icon: UserCircle,
    href: "/crm",
    permission: "crm:read",
    children: [
      { label: "Leads", icon: UserCircle, href: "/crm/leads", permission: "crm:leads:read" },
      { label: "Deals", icon: DollarSign, href: "/crm/deals", permission: "crm:deals:read" },
      { label: "Activities", icon: ListTodo, href: "/crm/activities", permission: "crm:activities:read" },
    ]
  },
  {
    label: "Marketing",
    icon: BarChart3,
    href: "/marketing",
    permission: "marketing:read",
    children: [
      { label: "Campaigns", icon: BarChart3, href: "/marketing/campaigns", permission: "marketing:campaigns:read" },
      { label: "Leads", icon: Users, href: "/marketing/leads", permission: "marketing:leads:read" },
    ]
  }
];

const systemNavItems: NavItem[] = [
  { label: "Workflows", icon: GitBranch, href: "/system/workflows", permission: "workflow:read" },
  { label: "Permissions", icon: Shield, href: "/system/permissions", permission: "rbac:manage" },
  { label: "Analytics", icon: BarChart3, href: "/system/analytics", permission: "analytics:read" },
  { label: "Audit Logs", icon: FileText, href: "/system/audit", permission: "audit:read" },
  { label: "Settings", icon: Settings, href: "/system/settings", permission: "settings:manage" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { hasPermission } = useAuth();

  const isActive = (href?: string, children?: NavItem[]) => {
    if (children) {
      return children.some(child => location.pathname.startsWith(child.href || ''));
    }
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href || '');
  };

  const filterNavItems = (items: NavItem[]) => {
    return items.filter(item => {
      // If no permission specified, show to everyone
      if (!item.permission) return true;
      // Check permission
      return hasPermission(item.permission);
    }).map(item => {
      // Also filter children if they exist
      if (item.children) {
        return {
          ...item,
          children: filterNavItems(item.children)
        };
      }
      return item;
    });
  };

  const filteredMainNav = filterNavItems(mainNavItems);
  const filteredSystemNav = filterNavItems(systemNavItems);

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
            {filteredMainNav.map((item) => {
              const [isOpen, setIsOpen] = useState(() => isActive(undefined, item.children)); // State for each collapsible
              useEffect(() => { // Update isOpen when location changes
                setIsOpen(isActive(undefined, item.children));
              }, [location.pathname, item.children]);

              return item.children ? (
                <Collapsible key={item.label} open={isOpen} onOpenChange={setIsOpen}>
                  <CollapsibleTrigger asChild>
                    <div
                      className={cn(
                        "nav-item group",
                        isActive(undefined, item.children) && "nav-item-active",
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-5 h-5 flex-shrink-0 transition-colors",
                          isActive(undefined, item.children) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                        </>
                      )}
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pl-6 space-y-1"> {/* Indent children */}
                      {item.children.map(child => (
                        <Link
                          key={child.href}
                          to={child.href || ''}
                          className={cn(
                            "nav-item group text-sm",
                            isActive(child.href) && "nav-item-active",
                            collapsed && "justify-center px-2"
                          )}
                        >
                          <child.icon
                            className={cn(
                              "w-4 h-4 flex-shrink-0 transition-colors",
                              isActive(child.href) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                            )}
                          />
                          {!collapsed && <span className="flex-1">{child.label}</span>}
                        </Link>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Link
                  key={item.href}
                  to={item.href || ''}
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
              )
            })}
          </div>
        </div>

        <div className="mt-8 space-y-1">
          {!collapsed && (
            <span className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              System
            </span>
          )}
          <div className="mt-2 space-y-1">
            {filteredSystemNav.map((item) => (
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
          <Link to="/profile" className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">View Profile</p>
            </div>
          </Link>
        </div>
      )}
    </aside>
  );
}
