import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    UserPlus,
    Briefcase,
    CreditCard,
    FileSignature,
    Tool,
    GraduationCap,
    CalendarCheck,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const EmployeeOnboardingFlow = () => {
    const [step, setStep] = useState(0);

    const steps = [
        { title: 'Search', icon: Search, desc: 'Find existing User' },
        { title: 'Profile', icon: UserPlus, desc: 'Create Employee Profile' },
        { title: 'Role', icon: Briefcase, desc: 'Assign Role & Dept' },
        { title: 'Bank', icon: CreditCard, desc: 'Payment Details' },
        { title: 'Contract', icon: FileSignature, desc: 'Sign Agreement' },
        { title: 'Assets', icon: Tool, desc: 'Equipment Issue' },
        { title: 'Training', icon: GraduationCap, desc: 'Induction Phase' },
        { title: 'Probation', icon: CalendarCheck, desc: 'Start Probation' }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center text-white bg-slate-900 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
                <div className="space-y-2 z-10">
                    <h1 className="text-3xl font-black tracking-tight italic">ONBOARDING COMPASS</h1>
                    <p className="text-slate-400 font-medium">Step-by-step talent induction and asset provisioning.</p>
                </div>
                <div className="hidden md:flex flex-col items-end z-10">
                    <Badge className="bg-primary hover:bg-primary border-none text-[10px] font-black uppercase tracking-widest px-3 py-1 mb-2">Internal Procedure</Badge>
                    <div className="flex gap-1">
                        {steps.map((_, i) => (
                            <div key={i} className={cn("w-2 h-2 rounded-full transition-all duration-300", step >= i ? "bg-primary w-4" : "bg-slate-700")} />
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="md:col-span-1 shadow-lg border-none ring-1 ring-slate-200">
                    <CardContent className="p-4 space-y-2">
                        {steps.map((s, i) => (
                            <div
                                key={s.title}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer",
                                    step === i ? "bg-primary text-white shadow-md translate-x-2" :
                                        step > i ? "text-green-600 bg-green-50" : "text-slate-400 hover:bg-slate-50"
                                )}
                                onClick={() => setStep(i)}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform",
                                    step === i && "scale-110"
                                )}>
                                    <s.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-tighter leading-none">{s.title}</p>
                                    <p className={cn("text-[9px] font-medium opacity-60", step === i ? "text-white" : "text-slate-500")}>{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="md:col-span-3 shadow-2xl border-none ring-1 ring-slate-200 min-h-[500px] flex flex-col">
                    <CardHeader className="border-b bg-slate-50/50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-xl font-bold">{steps[step].title}</CardTitle>
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Phase {step + 1} of 8</span>
                        </div>
                        <Progress value={((step + 1) / 8) * 100} className="h-1 mt-4" />
                    </CardHeader>
                    <CardContent className="flex-1 p-8 flex items-center justify-center">
                        <div className="text-center space-y-6 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="w-20 h-20 bg-slate-100 rounded-3xl mx-auto flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform shadow-inner border border-slate-200">
                                {React.createElement(steps[step].icon, { className: "w-10 h-10 text-slate-400" })}
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-lg">{steps[step].desc}</h3>
                                <p className="text-sm text-muted-foreground italic">Onboarding sub-module for "{steps[step].title}" is being integrated with HR backend. Interactive form logic will appear here.</p>
                            </div>
                            <Button className="w-full rounded-xl h-12 shadow-lg hover:shadow-primary/20 transition-all font-bold" onClick={() => setStep(Math.min(7, step + 1))}>
                                Complete {steps[step].title} Phase
                            </Button>
                        </div>
                    </CardContent>
                    <div className="p-6 border-t bg-slate-50/10 flex justify-between">
                        <Button variant="ghost" size="sm" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</Button>
                        <div className="flex gap-4">
                            <Button variant="ghost" size="sm" className="text-slate-400">Save Draft</Button>
                            <Button variant="ghost" size="sm" className="text-red-400">Cancel Flow</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
