import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, KeyRound, Mail, ShieldCheck, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '@/lib/api/auth';
import { cn } from '@/lib/utils';

// --- Sub-components ---

const VerifyIdentityStep = ({ onNext }: { onNext: (email: string) => void }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            // In a real flow, we might check if user exists first
            onNext(email);
        } catch (err) {
            setError('User not found');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Verify Identity</CardTitle>
                <CardDescription>Enter your email to start the password reset process</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
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
                            />
                        </div>
                    </div>
                    {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'Continue'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

const RequestOTPStep = ({ email, onNext, onBack }: { email: string; onNext: () => void; onBack: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRequest = async () => {
        setIsLoading(true);
        setError('');
        try {
            await authApi.requestPasswordReset(email);
            onNext();
        } catch (err) {
            setError('Failed to send reset code');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Request Reset Code</CardTitle>
                <CardDescription>We will send a 6-digit code to {email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                <Button onClick={handleRequest} className="w-full" disabled={isLoading}>
                    {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'Send Code'}
                </Button>
                <Button variant="ghost" className="w-full" onClick={onBack}>Change Email</Button>
            </CardContent>
        </Card>
    );
};

const EnterOTPStep = ({ email, onNext, onResend }: { email: string; onNext: (otp: string) => void; onResend: () => void }) => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length === 6) {
            onNext(otp);
        } else {
            setError('Invalid code');
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Enter Reset Code</CardTitle>
                <CardDescription>Enter the 6-digit code sent to your email</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="otp">Verification Code</Label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="otp"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="pl-10 text-center text-2xl tracking-[0.5em]"
                                required
                                maxLength={6}
                            />
                        </div>
                    </div>
                    {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                    <Button type="submit" className="w-full">Verify Code</Button>
                    <Button variant="link" className="w-full" onClick={onResend}>Resend Code</Button>
                </form>
            </CardContent>
        </Card>
    );
};

const SetNewPasswordStep = ({ email, otp, onSuccess }: { email: string; otp: string; onSuccess: () => void }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await authApi.resetPassword(email, otp, password);
            onSuccess();
        } catch (err) {
            setError('Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Set New Password</CardTitle>
                <CardDescription>Ensure your new password is secure</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10"
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3">
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm">Confirm New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="confirm"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-10"
                                required
                            />
                        </div>
                    </div>
                    {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : 'Reset Password'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

// --- Main Flow ---

export const PasswordResetFlow = () => {
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [success, setSuccess] = useState(false);

    if (success) {
        return (
            <Card className="w-full max-w-md mx-auto text-center p-6">
                <div className="mx-auto w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="mb-2">Password Reset Successful</CardTitle>
                <CardDescription className="mb-6">You can now sign in with your new password.</CardDescription>
                <Button className="w-full" onClick={() => window.location.href = '/login'}>Return to Login</Button>
            </Card>
        );
    }

    const steps = [
        <VerifyIdentityStep onNext={(e) => { setEmail(e); setStep(1); }} />,
        <RequestOTPStep email={email} onNext={() => setStep(2)} onBack={() => setStep(0)} />,
        <EnterOTPStep email={email} onResend={() => setStep(1)} onNext={(o) => { setOtp(o); setStep(3); }} />,
        <SetNewPasswordStep email={email} otp={otp} onSuccess={() => setSuccess(true)} />
    ];

    const titles = ['Verify Identity', 'Request Code', 'Enter Code', 'New Password'];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="w-full max-w-md space-y-6">
                <div className="flex justify-between items-center px-4">
                    {titles.map((title, i) => (
                        <div key={title} className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                                step >= i ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground"
                            )}>
                                {step > i ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                            </div>
                            <span className={cn(
                                "text-[10px] uppercase tracking-tighter font-semibold hidden sm:block",
                                step === i ? "text-primary" : "text-muted-foreground"
                            )}>
                                {title}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="transition-all duration-300 transform">
                    {steps[step]}
                </div>
            </div>
        </div>
    );
};
