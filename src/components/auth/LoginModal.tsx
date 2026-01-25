import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api/auth';
import { loginRateLimiter } from '@/lib/security/rateLimit';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
    const [activeTab, setActiveTab] = useState<'password' | 'passwordless'>('password');
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Standard login state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Passwordless login state
    const [passwordlessEmail, setPasswordlessEmail] = useState('');
    const [passwordlessStep, setPasswordlessStep] = useState<'request' | 'verify'>('request');
    const [otp, setOtp] = useState('');
    const [passwordlessLoading, setPasswordlessLoading] = useState(false);
    const [passwordlessError, setPasswordlessError] = useState('');
    const [passwordlessSuccess, setPasswordlessSuccess] = useState('');

    // Rate limiting state
    const [isLockedOut, setIsLockedOut] = useState(false);
    const [lockoutTime, setLockoutTime] = useState(0);

    const handleStandardLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Check rate limiting
        if (loginRateLimiter.isLockedOut()) {
            const remaining = loginRateLimiter.getRemainingLockoutTime();
            setIsLockedOut(true);
            setLockoutTime(remaining);
            setError(`Too many failed attempts. Please try again in ${Math.ceil(remaining / 60)} minutes.`);
            return;
        }

        setIsLoading(true);

        try {
            await login(email, password, rememberMe);
            loginRateLimiter.recordSuccess();

            // Redirect to intended destination or dashboard
            const from = (location.state as any)?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
            onClose();
        } catch (err) {
            loginRateLimiter.recordFailedAttempt();
            const remaining = loginRateLimiter.getRemainingAttempts();

            if (remaining > 0) {
                setError(
                    err instanceof Error
                        ? `${err.message}. ${remaining} attempts remaining.`
                        : 'Login failed. Please try again.'
                );
            } else {
                const lockout = loginRateLimiter.getRemainingLockoutTime();
                setIsLockedOut(true);
                setLockoutTime(lockout);
                setError(`Too many failed attempts. Account locked for ${Math.ceil(lockout / 60)} minutes.`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordlessRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordlessError('');
        setPasswordlessSuccess('');
        setPasswordlessLoading(true);

        try {
            await authApi.requestPasswordlessLogin(passwordlessEmail);
            setPasswordlessSuccess('Magic link and OTP sent to your email!');
            setPasswordlessStep('verify');
        } catch (err) {
            setPasswordlessError(
                err instanceof Error ? err.message : 'Failed to send magic link'
            );
        } finally {
            setPasswordlessLoading(false);
        }
    };

    const handlePasswordlessVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordlessError('');
        setPasswordlessLoading(true);

        try {
            await authApi.verifyPasswordlessOTP(passwordlessEmail, otp);
            setPasswordlessSuccess('Login successful!');

            // Redirect after brief delay
            setTimeout(() => {
                const from = (location.state as any)?.from?.pathname || '/dashboard';
                navigate(from, { replace: true });
                onClose();
            }, 1000);
        } catch (err) {
            setPasswordlessError(
                err instanceof Error ? err.message : 'Invalid OTP code'
            );
        } finally {
            setPasswordlessLoading(false);
        }
    };

    const resetPasswordlessFlow = () => {
        setPasswordlessStep('request');
        setOtp('');
        setPasswordlessError('');
        setPasswordlessSuccess('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Welcome Back
                    </DialogTitle>
                    <DialogDescription>
                        Sign in to access your ISP ERP dashboard
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="password">Password</TabsTrigger>
                        <TabsTrigger value="passwordless">Passwordless</TabsTrigger>
                    </TabsList>

                    {/* Standard Login */}
                    <TabsContent value="password" className="space-y-4">
                        <form onSubmit={handleStandardLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={isLoading || isLockedOut}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={isLoading || isLockedOut}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="remember"
                                        checked={rememberMe}
                                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                        disabled={isLoading || isLockedOut}
                                    />
                                    <Label
                                        htmlFor="remember"
                                        className="text-sm font-normal cursor-pointer"
                                    >
                                        Remember me
                                    </Label>
                                </div>
                                <Button
                                    type="button"
                                    variant="link"
                                    className="px-0 text-sm"
                                    onClick={() => setActiveTab('passwordless')}
                                >
                                    Forgot password?
                                </Button>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || isLockedOut}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>
                    </TabsContent>

                    {/* Passwordless Login */}
                    <TabsContent value="passwordless" className="space-y-4">
                        {passwordlessStep === 'request' ? (
                            <form onSubmit={handlePasswordlessRequest} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="passwordless-email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="passwordless-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={passwordlessEmail}
                                            onChange={(e) => setPasswordlessEmail(e.target.value)}
                                            className="pl-10"
                                            required
                                            disabled={passwordlessLoading}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        We'll send you a magic link and OTP code
                                    </p>
                                </div>

                                {passwordlessError && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{passwordlessError}</AlertDescription>
                                    </Alert>
                                )}

                                {passwordlessSuccess && (
                                    <Alert>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <AlertDescription>{passwordlessSuccess}</AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={passwordlessLoading}
                                >
                                    {passwordlessLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Magic Link'
                                    )}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handlePasswordlessVerify} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="otp">Enter OTP Code</Label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className="text-center text-2xl tracking-widest"
                                        required
                                        maxLength={6}
                                        disabled={passwordlessLoading}
                                    />
                                    <p className="text-xs text-muted-foreground text-center">
                                        Check your email for the 6-digit code
                                    </p>
                                </div>

                                {passwordlessError && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{passwordlessError}</AlertDescription>
                                    </Alert>
                                )}

                                {passwordlessSuccess && (
                                    <Alert>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <AlertDescription>{passwordlessSuccess}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={passwordlessLoading || otp.length !== 6}
                                    >
                                        {passwordlessLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Verifying...
                                            </>
                                        ) : (
                                            'Verify & Sign In'
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={resetPasswordlessFlow}
                                        disabled={passwordlessLoading}
                                    >
                                        Back
                                    </Button>
                                </div>
                            </form>
                        )}
                    </TabsContent>
                </Tabs>

                <div className="text-center text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Button
                        variant="link"
                        className="px-1"
                        onClick={() => {
                            onClose();
                            navigate('/register');
                        }}
                    >
                        Sign up
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
