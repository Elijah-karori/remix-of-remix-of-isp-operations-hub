import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/lib/api/auth';
import { loginRateLimiter } from '@/lib/security/rateLimit';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, verifyOTP } = useAuth();
    const [loginStep, setLoginStep] = useState<'password' | 'otp'>('password');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Check for success message from registration
    const searchParams = new URLSearchParams(location.search);
    const successMessage = searchParams.get('success');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Check rate limiting
        if (loginRateLimiter.isLockedOut()) {
            const remaining = loginRateLimiter.getRemainingLockoutTime();
            setError(`Too many failed attempts. Please try again in ${Math.ceil(remaining / 60)} minutes.`);
            return;
        }

        setIsLoading(true);

        try {
            if (loginStep === 'password') {
                // Phase 1: Verify Password
                await login(email, password);

                // Phase 2: Request OTP for 2FA
                await authApi.requestOTP(email);

                setLoginStep('otp');
                loginRateLimiter.recordSuccess(); // Partial success (credentials correct)
            } else {
                // Phase 3: Verify OTP and get Token
                await verifyOTP(email, otp, rememberMe);
                loginRateLimiter.recordSuccess();

                // Redirect to intended destination or dashboard
                const from = (location.state as any)?.from?.pathname || '/';
                navigate(from, { replace: true });
            }
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
                setError(`Too many failed attempts. Account locked for ${Math.ceil(lockout / 60)} minutes.`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {loginStep === 'password' ? 'Welcome back' : 'Verify Identity'}
                    </CardTitle>
                    <CardDescription>
                        {loginStep === 'password'
                            ? 'Sign in to your ERP account to continue'
                            : `Enter the 6-digit code sent to ${email}`}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Success message from registration */}
                    {successMessage && !error && (
                        <Alert className="bg-green-50 border-green-200">
                            <AlertDescription className="text-green-800">
                                {successMessage}
                            </AlertDescription>
                        </Alert>
                    )}

                    {loginStep === 'password' ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={isLoading}
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <Button
                                        type="button"
                                        variant="link"
                                        className="px-0 text-sm h-auto"
                                        onClick={() => navigate('/auth/passwordless/request')}
                                    >
                                        Forgot password?
                                    </Button>
                                </div>
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
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="remember"
                                    checked={rememberMe}
                                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                                    disabled={isLoading}
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-sm font-normal cursor-pointer"
                                >
                                    Remember me
                                </Label>
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
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Next'
                                )}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2 text-center">
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="000000"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="text-center text-3xl tracking-[0.5em] font-bold h-16"
                                    required
                                    maxLength={6}
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 text-lg"
                                disabled={isLoading || otp.length !== 6}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Authenticating...
                                    </>
                                ) : (
                                    'Verify & Login'
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => setLoginStep('password')}
                                disabled={isLoading}
                            >
                                Back to Password
                            </Button>
                        </form>
                    )}

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-muted-foreground">or</span>
                        </div>
                    </div>

                    {/* Passwordless Login */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate('/auth/passwordless/request')}
                    >
                        Sign in without password
                    </Button>

                    {/* Register Link */}
                    <div className="text-center text-sm text-muted-foreground">
                        Don't have an account?{' '}
                        <Button
                            variant="link"
                            className="px-1"
                            onClick={() => navigate('/auth/register')}
                        >
                            Create one
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
