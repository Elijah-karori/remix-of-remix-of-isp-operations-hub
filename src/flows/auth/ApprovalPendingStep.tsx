import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, Mail, ExternalLink } from 'lucide-react';

export const ApprovalPendingStep = () => {
    return (
        <Card className="w-full max-w-md mx-auto text-center">
            <CardHeader>
                <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
                </div>
                <CardTitle className="text-2xl font-bold">Registration Submitted</CardTitle>
                <CardDescription>
                    Your account is currently pending approval from a department manager.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-left">
                    <h4 className="font-semibold text-amber-900 flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Next Steps
                    </h4>
                    <ul className="text-sm text-amber-800 space-y-2 list-disc pl-5">
                        <li>A manager from your selected department will review your request.</li>
                        <li>You will receive an email notification once access is granted.</li>
                        <li>In the meantime, you can check your email for any additional instructions.</li>
                    </ul>
                </div>

                <div className="flex flex-col gap-3">
                    <Button className="w-full" asChild>
                        <a href="mailto:support@example.com">
                            <Mail className="mr-2 h-4 w-4" />
                            Contact Support
                        </a>
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => window.location.href = '/login'}>
                        Return to Login
                    </Button>
                </div>

                <p className="text-xs text-muted-foreground pt-4">
                    Reference ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
                </p>
            </CardContent>
        </Card>
    );
};
