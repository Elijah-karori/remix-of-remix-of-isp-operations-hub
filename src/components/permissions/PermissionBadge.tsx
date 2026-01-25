import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Check, X, Shield } from 'lucide-react';

interface PermissionBadgeProps {
    permission: string;
    showIcon?: boolean;
    variant?: 'default' | 'outline' | 'secondary';
}

export const PermissionBadge = ({
    permission,
    showIcon = true,
    variant = 'default'
}: PermissionBadgeProps) => {
    const { hasPermission } = useAuth();
    const granted = hasPermission(permission);

    return (
        <Badge
            variant={granted ? variant : 'outline'}
            className={granted ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}
        >
            {showIcon && (
                granted ? (
                    <Check className="mr-1 h-3 w-3" />
                ) : (
                    <X className="mr-1 h-3 w-3" />
                )
            )}
            {permission}
        </Badge>
    );
};

interface RoleBadgeProps {
    role: string;
    showIcon?: boolean;
}

export const RoleBadge = ({ role, showIcon = true }: RoleBadgeProps) => {
    return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">
            {showIcon && <Shield className="mr-1 h-3 w-3" />}
            {role}
        </Badge>
    );
};
