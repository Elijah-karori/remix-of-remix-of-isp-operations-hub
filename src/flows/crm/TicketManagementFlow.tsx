import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    Inbox,
    UserPlus,
    Search,
    CheckCircle2,
    BellRing,
    LifeBuoy,
    MessageSquare,
    AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const TicketManagementFlow = () => {
    const [step, setStep] = useState(0);

    const steps = [
        { title: 'Open', icon: Inbox, desc: 'Triage & Log' },
        { title: 'Assign', icon: UserPlus, desc: 'Technician Selection' },
        { title: 'Investigate', icon: Search, desc: 'Root Cause Analysis' },
        { title: 'Resolve', icon: CheckCircle2, desc: 'Fixed & Verified' },
        { title: 'Notify', icon: BellRing, desc: 'Client Communication' }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4">
            <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border ring-1 ring-slate-100 relative overflow-hidden">
                <div className="absolute left-0 top-0 w-1 h-full bg-primary" />
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center">
                        <LifeBuoy className="w-8 h-8 text-primary shadow-lg" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black italic tracking-widest">SUPPORT HUD</h2>
                        <p className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-bounce" />
                            SLA Breach: 0 | Critical: 4
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {steps.map((s, i) => (
                        <div key={i} className={cn(
                            "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-300",
                            step === i ? "bg-primary border-primary text-white shadow-xl scale-125" :
                                step > i ? "bg-green-500 border-green-500 text-white" : "bg-slate-50 border-slate-200 text-slate-300"
                        )}>
                            <s.icon className="w-5 h-5" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8">
                    <Card className="border-none shadow-2xl ring-1 ring-slate-200 rounded-[2rem] overflow-hidden min-h-[500px] flex flex-col">
                        <CardHeader className="p-8 bg-slate-50/50 border-b">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-lg font-black flex items-center gap-3">
                                    <MessageSquare className="w-5 h-5 text-slate-400" />
                                    PHASE: {steps[step].title}
                                </CardTitle>
                                <Badge variant="outline" className="font-mono text-[10px] px-3 py-1">TIX-2026-XQ-104</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-12 flex items-center justify-center">
                            <div className="text-center space-y-6 max-w-sm">
                                <div className="w-20 h-20 bg-slate-100 rounded-3xl mx-auto flex items-center justify-center border-2 border-dashed border-slate-300">
                                    {React.createElement(steps[step].icon, { className: "w-8 h-8 text-slate-400" })}
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold">{steps[step].desc}</h3>
                                    <p className="text-sm text-slate-500 font-medium italic">Support ticket orchestration for the "{steps[step].title}" phase is being synchronized with the helpdesk. Interactive diagnostics will appear here.</p>
                                </div>
                                <Button className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20" onClick={() => setStep(Math.min(4, step + 1))}>
                                    Update Ticket Status
                                </Button>
                            </div>
                        </CardContent>
                        <div className="p-6 border-t bg-slate-50/10 flex justify-between">
                            <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="font-bold">Prev Phase</Button>
                            <div className="flex gap-2">
                                <Button variant="ghost" className="text-amber-500 font-bold"><AlertTriangle className="w-4 h-4 mr-2" /> Escalate</Button>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="md:col-span-4 space-y-6">
                    <Card className="shadow-lg border-none ring-1 ring-slate-200 rounded-[1.5rem]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Service Level Agreement</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span>TIME REMAINING</span>
                                    <span className="text-red-500 font-mono">00:42:15</span>
                                </div>
                                <Progress value={75} className="h-1.5" />
                            </div>
                            <p className="text-[10px] text-slate-500 font-medium italic">Estimated resolution within 4 hours based on Tier 2 priority.</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-none bg-slate-900 text-white rounded-[1.5rem] overflow-hidden relative">
                        <div className="absolute right-0 bottom-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-500">Assignment Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-400">JD</div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold">John Doe (Lead Tech)</p>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">Field Unit 4</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
