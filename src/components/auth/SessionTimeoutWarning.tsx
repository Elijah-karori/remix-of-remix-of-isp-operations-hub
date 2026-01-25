import { useState, useEffect } from 'react';
import { tokenService } from '@/services/tokenService';
import { useAuth } from '@/contexts/AuthContext';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface SessionTimeoutWarningProps {
    warningThreshold?: number; // seconds before expiration to show warning
}

export const SessionTimeoutWarning = ({
    warningThreshold = 300 // 5 minutes default
}: SessionTimeoutWarningProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [expiresIn, setExpiresIn] = useState(0);
    const { logout, refreshUser } = useAuth();

    useEffect(() => {
        // Start monitoring token expiration
        tokenService.startMonitoring(
            // On warning
            (remainingSeconds) => {
                setExpiresIn(remainingSeconds);
                setIsOpen(true);
            },
            // On expired
            () => {
                setIsOpen(false);
                logout();
            }
        );

        return () => {
            tokenService.stopMonitoring();
        };
    }, [logout]);

    const handleExtendSession = async () => {
        try {
            const success = await tokenService.refreshToken();
            if (success) {
                await refreshUser();
                setIsOpen(false);
            }
        } catch (error) {
            console.error('Failed to extend session:', error);
            logout();
        }
    };

    const handleLogout = () => {
        setIsOpen(false);
        logout();
    };

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <span className="text-2xl">⏰</span>
                        Session Expiring Soon
                    </DialogTitle>
                    <DialogDescription>
                        Your session will expire in <strong>{formatTime(expiresIn)}</strong>.
                        Would you like to extend your session?
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        Click "Extend Session" to continue working, or "Logout" to end your session now.
                    </p>
                </div>

                <DialogFooter className="flex gap-2 sm:gap-0">
                    <Button variant="outline" onClick={handleLogout}>
                        Logout
                    </Button>
                    <Button onClick={handleExtendSession}>
                        Extend Session
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
