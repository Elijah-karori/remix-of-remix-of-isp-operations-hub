import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { MenuItem } from '@/types/api';

interface DynamicSidebarProps {
    className?: string;
}

const SidebarItem = ({ item, depth = 0 }: { item: MenuItem; depth?: number }) => {
    const location = useLocation();
    const [isExpanded, setIsExpanded] = useState(false);
    const isActive = location.pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;

    return (
        <div>
            <Link
                to={item.path}
                className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    isActive && 'bg-accent text-accent-foreground font-medium',
                    depth > 0 && 'ml-4'
                )}
                onClick={(e) => {
                    if (hasChildren) {
                        e.preventDefault();
                        setIsExpanded(!isExpanded);
                    }
                }}
            >
                <div className="flex items-center gap-2">
                    {item.icon && <span className="text-lg">{item.icon}</span>}
                    <span>{item.label}</span>
                </div>
                {hasChildren && (
                    isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                    ) : (
                        <ChevronRight className="h-4 w-4" />
                    )
                )}
            </Link>

            {hasChildren && isExpanded && (
                <div className="mt-1 space-y-1">
                    {item.children!.map((child) => (
                        <SidebarItem key={child.key} item={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export const DynamicSidebar = ({ className }: DynamicSidebarProps) => {
    const { getFilteredMenus } = useAuth();
    const menus = getFilteredMenus();

    if (menus.length === 0) {
        return (
            <div className={cn('p-4', className)}>
                <p className="text-sm text-muted-foreground">No menu items available</p>
            </div>
        );
    }

    return (
        <nav className={cn('space-y-1 p-4', className)}>
            {menus.map((menu) => (
                <SidebarItem key={menu.key} item={menu} />
            ))}
        </nav>
    );
};
