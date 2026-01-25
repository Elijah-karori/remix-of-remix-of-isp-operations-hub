import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/lib/api/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export const MagicLinkVerify = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your magic link...');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('Invalid or missing verification token');
            return;
        }

        const verifyToken = async () => {
            try {
                await authApi.verifyMagicLink(token);
                setStatus('success');
                setMessage('Login successful! Redirecting to dashboard...');

                // Redirect after brief delay
                setTimeout(() => {
                    navigate('/', { replace: true });
                }, 2000);
            } catch (error) {
                setStatus('error');
                setMessage(
                    error instanceof Error
                        ? error.message
                        : 'Verification failed. The link may have expired.'
                );

                // Redirect to login after delay
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 3000);
            }
        };

        verifyToken();
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Magic Link Verification</CardTitle>
                    <CardDescription className="text-center">
                        Please wait while we verify your login
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    {status === 'verifying' && (
                        <>
                            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                            <p className="text-sm text-muted-foreground text-center">{message}</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <Alert>
                                <CheckCircle2 className="h-4 w-4" />
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertCircle className="h-8 w-8 text-red-600" />
                            </div>
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{message}</AlertDescription>
                            </Alert>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
