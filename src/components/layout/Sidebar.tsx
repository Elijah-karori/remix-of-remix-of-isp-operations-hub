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
  Smartphone,
  Banknote,
  Wifi,
  Menu,
  FileCheck,
  Eye,
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
  permission?: string;
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/" },
  { label: "Projects", icon: FolderKanban, href: "/projects", permission: "projects:read" },
  { label: "Tasks", icon: CheckSquare, href: "/tasks", badge: "12", permission: "tasks:read" },
  {
    label: "Finance",
    icon: Wallet,
    href: "/finance", // Main Finance page
    permission: "finance:read",
    children: [
      // These children now correspond to the tab values in src/pages/Finance.tsx
      { label: "Overview", icon: LayoutDashboard, href: "/finance?tab=overview", permission: "finance:read" },
      { label: "Transactions", icon: ReceiptText, href: "/finance?tab=transactions", permission: "finance:mpesa:read" },
      { label: "Invoices", icon: FileText, href: "/finance?tab=invoices", permission: "finance:invoices:read" },
      { label: "M-Pesa", icon: Smartphone, href: "/finance?tab=mpesa", permission: "finance:mpesa:read" },
      { label: "Budgeting & Accounts", icon: Banknote, href: "/finance?tab=budgeting", permission: "finance:accounts:read" },
      { label: "Analytics & Reports", icon: BarChart3, href: "/finance?tab=analytics", permission: "finance:reports:read" },
    ]
  },
  { label: "Inventory", icon: Package, href: "/inventory", permission: "inventory:read" },
  {
    label: "HR",
    icon: Users,
    href: "/hr",
    permission: "hr:read",
    children: [
      { label: "Employees", icon: Users, href: "/hr/employees", permission: "hr:employees:read" },
      { label: "Payroll", icon: DollarSign, href: "/hr/payroll", permission: "hr:payroll:read" },
      { label: "Complaints", icon: FileText, href: "/hr/complaints", permission: "hr:complaints:read" },
    ]
  },
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
  }
];

const systemNavItems: NavItem[] = [
  { label: "Workflows", icon: GitBranch, href: "/system/workflows", permission: "workflow:read" },
  { label: "Permissions", icon: Shield, href: "/system/permissions", permission: "rbac:manage" },
  { label: "Analytics", icon: BarChart3, href: "/system/analytics", permission: "analytics:read" },
  { label: "Audit Logs", icon: FileText, href: "/system/audit", permission: "audit:read" },
  { label: "Settings", icon: Settings, href: "/system/settings", permission: "settings:manage" },
  { label: "Tester Coverage", icon: FileCheck, href: "/system/tester-coverage", permission: "dashboard:tester:coverage:read" },
  { label: "Auditor Heatmap", icon: Eye, href: "/system/auditor-heatmap", permission: "dashboard:auditor:heatmap:read" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { hasPermission } = useAuth();

  const isActive = (href?: string, children?: NavItem[]) => {
    // If it has children, check if any child's href matches the current path
    if (children && href) { // Check parent href for active state
        return location.pathname.startsWith(href) || children.some(child => {
            const childHref = child.href?.split('?')[0]; // Compare path only, ignore query params for child active state
            return location.pathname.startsWith(childHref || '') && location.pathname !== '/';
        });
    }
    // For single items, compare paths. For / (dashboard), exact match.
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href || '');
  };


  const filterNavItems = (items: NavItem[]) => {
    return items.filter(item => {
      if (!item.permission) return true;
      return hasPermission(item.permission);
    }).map(item => {
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
              // Ensure consistent open state handling
              const [isOpen, setIsOpen] = useState(() => {
                // Determine initial open state based on whether any child or the parent is active
                return isActive(item.href, item.children);
              });

              useEffect(() => {
                // Update open state if location changes and it matches a child or parent
                setIsOpen(isActive(item.href, item.children));
              }, [location.pathname, item.href, item.children]);


              return item.children ? (
                <Collapsible key={item.label} open={isOpen} onOpenChange={setIsOpen}>
                  <CollapsibleTrigger asChild>
                    <Link
                      to={item.href || ''}
                      className={cn(
                        "nav-item group",
                        isActive(item.href, item.children) && "nav-item-active", // Check if parent or any child is active
                        collapsed && "justify-center px-2"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-5 h-5 flex-shrink-0 transition-colors",
                          isActive(item.href, item.children) ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                        )}
                      />
                      {!collapsed && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                        </>
                      )}
                    </Link>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="pl-6 space-y-1"> {/* Indent children */}
                      {item.children.map(child => {
                         const childPath = child.href?.split('?')[0]; // Extract path without query params
                         const isChildActive = location.pathname === childPath && location.search === child.href?.split('?')[1];
                         
                        return (
                        <Link
                          key={child.href}
                          to={child.href || ''}
                          className={cn(
                            "nav-item group text-sm",
                            isChildActive && "nav-item-active", // Use isChildActive here
                            collapsed && "justify-center px-2"
                          )}
                        >
                          <child.icon
                            className={cn(
                              "w-4 h-4 flex-shrink-0 transition-colors",
                              isChildActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground" // Use isChildActive here
                            )}
                          />
                          {!collapsed && <span className="flex-1">{child.label}</span>}
                        </Link>
                      )})}
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