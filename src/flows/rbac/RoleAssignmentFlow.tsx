import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    UserPlus,
    UserCheck,
    ShieldAlert,
    FileCheck,
    Zap,
    Lock,
    History
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const RoleAssignmentFlow = () => {
    const [step, setStep] = useState(0);

    const steps = [
        { title: 'Request', icon: UserPlus, desc: 'Assigner Initiation' },
        { title: 'Manager Review', icon: UserCheck, desc: 'Dept Sign-off' },
        { title: 'Security Audit', icon: ShieldAlert, desc: 'Compliance Check' },
        { title: 'Validation', icon: FileCheck, desc: 'Conflict Detection' },
        { title: 'Activation', icon: Zap, desc: 'Commit Access' }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            <div className="flex flex-col md:flex-row justify-between items-center bg-slate-50 border-2 border-slate-100 p-8 rounded-[2rem] shadow-inner gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-900 rounded-[1.5rem] flex items-center justify-center shadow-xl">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tighter">ROLE GOVERNANCE</h1>
                        <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                            Zero-Trust Access Provisioning
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full shadow-sm"><History className="w-4 h-4 mr-2" /> Logs</Button>
                    <Button variant="outline" size="sm" className="rounded-full shadow-sm">Policies</Button>
                </div>
            </div>

            <div className="relative pt-12">
                <div className="flex justify-between items-center px-4 relative z-10">
                    {steps.map((s, i) => (
                        <div key={i} className="flex flex-col items-center gap-3">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700",
                                step === i ? "bg-primary text-white shadow-2xl scale-125 rotate-0" :
                                    step > i ? "bg-green-500 text-white rotate-0" : "bg-white border-2 border-slate-200 text-slate-300 rotate-12"
                            )}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <span className={cn("text-[9px] font-black uppercase tracking-[0.2em]", step === i ? "text-primary" : "text-slate-400")}>{s.title}</span>
                        </div>
                    ))}
                </div>
                <div className="absolute top-18 left-0 w-full h-0.5 bg-slate-100 -z-0 mx-auto max-w-[90%]" />
            </div>

            <Card className="border-none shadow-2xl ring-1 ring-slate-200 rounded-[2.5rem] overflow-hidden min-h-[500px] flex flex-col">
                <CardHeader className="p-10 border-b bg-slate-50/10">
                    <div className="flex justify-between items-center">
                        <div className="space-y-1">
                            <CardDescription className="font-black text-primary text-[10px] uppercase tracking-widest">Security Sub-system</CardDescription>
                            <CardTitle className="text-2xl font-black">{steps[step].title}: {steps[step].desc}</CardTitle>
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono px-3 py-1">REQ-AUTH-2026-N1</Badge>
                    </div>
                    <Progress value={((step + 1) / 5) * 100} className="h-1 mt-8" />
                </CardHeader>
                <CardContent className="flex-1 p-12 flex items-center justify-center">
                    <div className="text-center space-y-8 max-w-sm animate-in zoom-in-95 duration-700">
                        <div className="w-24 h-24 bg-slate-50 border border-slate-200 shadow-inner rounded-[2rem] mx-auto flex items-center justify-center group hover:bg-white transition-colors">
                            {React.createElement(steps[step].icon, { className: "w-10 h-10 text-slate-300 group-hover:text-primary transition-colors" })}
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-black tracking-tight">{steps[step].desc}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed italic">The RBAC engine is calculating the policy impacts for the "{steps[step].title}" phase. Detective and preventive control validation will appear here.</p>
                        </div>
                        <Button className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20" onClick={() => setStep(Math.min(4, step + 1))}>
                            Next Governance Gate
                        </Button>
                    </div>
                </CardContent>
                <div className="p-8 border-t bg-slate-50/30 flex justify-between items-center">
                    <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="font-bold text-slate-400">Back</Button>
                    <div className="flex gap-2">
                        <Button variant="ghost" className="text-red-500 font-bold">Reject Request</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
