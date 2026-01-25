import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/lib/api/auth';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Phone, User, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type RegistrationStep = 'details' | 'otp' | 'complete';

export const RegistrationModal = ({ isOpen, onClose }: RegistrationModalProps) => {
    const navigate = useNavigate();
    const [step, setStep] = useState<RegistrationStep>('details');

    // Form data
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    /**
     * Step 1: Register user using passwordless OTP flow
     * This calls /api/v1/auth/register/otp/request which:
     * - Creates INACTIVE user if not exists
     * - Sends OTP to email
     */
    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            // Use passwordless registration OTP endpoint
            await authApi.requestRegistrationOTP(email, fullName, phone);
            setSuccess('OTP sent to your email! Check your inbox.');
            setStep('otp');
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to send OTP'
            );
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Step 2: Verify OTP
     * This calls /api/v1/auth/register/otp/verify which:
     * - Verifies OTP
     * - Activates user
     * - Returns access tokens (Auto-login)
     */
    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authApi.verifyRegistrationOTP(email, otp);
            setSuccess('Registration successful! Redirecting...');
            setStep('complete');

            // Redirect to dashboard after brief delay
            setTimeout(() => {
                navigate('/');
                onClose();
            }, 1500);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Invalid OTP code. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setStep('details');
        setEmail('');
        setFullName('');
        setPhone('');
        setOtp('');
        setError('');
        setSuccess('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                resetForm();
                onClose();
            }
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {step === 'details' && 'Create Account'}
                        {step === 'otp' && 'Verify Email'}
                        {step === 'complete' && 'Welcome!'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'details' && 'Enter your details to get started'}
                        {step === 'otp' && 'Enter the OTP code sent to your email'}
                        {step === 'complete' && 'Your account has been created successfully'}
                    </DialogDescription>
                </DialogHeader>

                {/* Step 1: Enter Details */}
                {step === 'details' && (
                    <form onSubmit={handleRequestOTP} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="fullName"
                                    type="text"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="pl-10"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reg-email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="reg-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+254 700 000 000"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="pl-10"
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert>
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}

                        <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded">
                            <p>
                                <strong>Note:</strong> Your account will be created with PENDING_OTP status.
                                You must verify your email with the OTP code to activate your account.
                            </p>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Account & Sending OTP...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </form>
                )}

                {/* Step 2: Verify OTP */}
                {step === 'otp' && (
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
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
                                disabled={isLoading}
                                autoFocus
                            />
                            <p className="text-xs text-muted-foreground text-center">
                                Check your email ({email}) for the 6-digit code
                            </p>
                        </div>

                        <div className="text-xs text-muted-foreground bg-amber-50 p-3 rounded">
                            <p>
                                <strong>Account Status:</strong> PENDING_OTP
                            </p>
                            <p className="mt-1">
                                Your account has been created but is inactive. Enter the OTP to activate it.
                            </p>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert>
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertDescription>{success}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || otp.length !== 6}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Verifying & Activating...
                                    </>
                                ) : (
                                    'Verify & Activate Account'
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setStep('details');
                                    setOtp('');
                                    setError('');
                                }}
                                disabled={isLoading}
                            >
                                Back
                            </Button>
                        </div>
                    </form>
                )}

                {/* Step 3: Complete */}
                {step === 'complete' && (
                    <div className="text-center space-y-4 py-4">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                            <p className="font-semibold text-lg">Account Activated!</p>
                            <p className="text-muted-foreground mt-2">
                                {success || 'Your account has been verified and activated successfully!'}
                            </p>
                        </div>
                    </div>
                )}

                <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{' '}
                    <Button
                        variant="link"
                        className="px-1"
                        onClick={() => {
                            resetForm();
                            onClose();
                            navigate('/login');
                        }}
                    >
                        Sign in
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
