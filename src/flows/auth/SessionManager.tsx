import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    ShieldCheck,
    UserCircle,
    Lock,
    LayoutDashboard,
    Activity,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const SessionManager = ({ children }: { children: React.ReactNode }) => {
    const { user, isLoading, isAuthChecked } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [status, setStatus] = useState('Initializing Security Sandbox...');

    const steps = [
        { title: 'Authenticating', icon: Lock },
        { title: 'Profiles', icon: UserCircle },
        { title: 'Permissions', icon: ShieldCheck },
        { title: 'Environment', icon: Activity },
        { title: 'Redirect', icon: LayoutDashboard }
    ];

    useEffect(() => {
        if (isAuthChecked && !isLoading) {
            let currentStep = 0;
            const interval = setInterval(() => {
                currentStep++;
                if (currentStep < steps.length) {
                    setStep(currentStep);
                    if (currentStep === 1) setStatus('Verifying Account Identity...');
                    if (currentStep === 2) setStatus('Loading RBAC Permission Map...');
                    if (currentStep === 3) setStatus('Preparing Workspace Environment...');
                    if (currentStep === 4) setStatus('Handing over to Dashboard...');
                } else {
                    clearInterval(interval);
                }
            }, 800);
            return () => clearInterval(interval);
        }
    }, [isAuthChecked, isLoading]);

    if (isLoading || !isAuthChecked || step < 4) {
        return (
            <div className="fixed inset-0 bg-slate-900 flex items-center justify-center z-[100] p-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10 pointer-events-none" />

                <Card className="max-w-md w-full border-none bg-white/5 backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)] ring-1 ring-white/10 rounded-[3rem] overflow-hidden">
                    <CardHeader className="p-10 text-center space-y-4">
                        <div className="relative inline-block">
                            <div className="w-24 h-24 bg-primary/20 rounded-[2.5rem] flex items-center justify-center animate-pulse">
                                {React.createElement(steps[step].icon, { className: "w-10 h-10 text-primary shadow-2xl" })}
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-xl">
                                <ShieldCheck className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <CardTitle className="text-white text-2xl font-black tracking-tighter uppercase italic">ISP NEXUS</CardTitle>
                            <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4rem]">{status}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 space-y-8">
                        <div className="flex justify-between px-2">
                            {steps.map((s, i) => (
                                <div key={i} className={cn(
                                    "w-2 h-2 rounded-full transition-all duration-500",
                                    step === i ? "bg-primary scale-150 shadow-[0_0_15px_rgba(var(--primary),0.8)]" :
                                        step > i ? "bg-green-500" : "bg-white/10"
                                )} />
                            ))}
                        </div>
                        <div className="space-y-4">
                            <Progress value={((step + 1) / 5) * 100} className="h-1 bg-white/5" />
                            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <span>Phase 0{step + 1}</span>
                                <span>Gateway v4.2 Secure</span>
                            </div>
                        </div>
                    </CardContent>
                    <div className="p-6 bg-white/5 border-t border-white/5 flex items-center justify-center gap-2">
                        <Activity className="w-3 h-3 text-primary animate-spin" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Continuous Trust Verification Active</span>
                    </div>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
};
