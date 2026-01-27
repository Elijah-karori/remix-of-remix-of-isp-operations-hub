import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Magnet,
    Target,
    PhoneCall,
    FileText,
    Handshake,
    BarChart4,
    Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const LeadManagementFlow = () => {
    const [step, setStep] = useState(0);

    const steps = [
        { title: 'Source', icon: Magnet, desc: 'Lead Acquisition' },
        { title: 'Qualify', icon: Target, desc: 'Scoring & Potential' },
        { title: 'Contact', icon: PhoneCall, desc: 'Engage Prospect' },
        { title: 'Proposal', icon: FileText, desc: 'Offers & Quotes' },
        { title: 'Closing', icon: Handshake, desc: 'Convert to Client' }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-white border border-slate-100 shadow-xl rounded-[2rem] gap-6">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-blue-200">
                        <Magnet className="w-8 h-8 text-white" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">CRM REVENUE FUNNEL</h1>
                        <p className="text-slate-400 font-medium">Full lead lifecycle and conversion tracking.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" />)}
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Sales Pods</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3 space-y-4">
                    <Card className="border-none shadow-lg ring-1 ring-slate-200 rounded-3xl overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b p-6">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <BarChart4 className="w-3 h-3" /> Funnel Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-1">
                                <p className="text-2xl font-black text-green-600">84%</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Retention Score</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-2xl font-black text-blue-600">KES 4.2M</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Pipeline Value</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-2 space-y-1 bg-white rounded-3xl border shadow-sm">
                        {steps.map((s, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex items-center gap-3 p-4 rounded-2xl transition-all duration-500 cursor-pointer",
                                    step === i ? "bg-slate-900 text-white shadow-2xl scale-105 z-10" :
                                        step > i ? "bg-green-50 text-green-700" : "hover:bg-slate-50 text-slate-400"
                                )}
                                onClick={() => setStep(i)}
                            >
                                <s.icon className={cn("w-5 h-5", step === i ? "text-primary" : "")} />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-tighter">{s.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-9">
                    <Card className="border-none shadow-2xl ring-1 ring-slate-200 rounded-[2.5rem] min-h-[600px] flex flex-col overflow-hidden">
                        <CardHeader className="p-10 border-b bg-slate-50/50">
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em]">STAGED PIPELINE</p>
                                    <CardTitle className="text-3xl font-black">{steps[step].title}</CardTitle>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border flex items-center justify-center">
                                        <Users className="w-5 h-5 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                            <Progress value={((step + 1) / 5) * 100} className="h-1.5 mt-8 bg-slate-200" />
                        </CardHeader>
                        <CardContent className="flex-1 p-12 flex items-center justify-center bg-gradient-to-br from-white to-slate-50/50">
                            <div className="text-center space-y-8 max-w-md animate-in zoom-in-95 duration-500">
                                <div className="w-28 h-28 bg-white shadow-2xl rounded-[3rem] mx-auto flex items-center justify-center border-4 border-slate-50 rotate-3 hover:rotate-0 transition-all duration-700">
                                    {React.createElement(steps[step].icon, { className: "w-12 h-12 text-slate-300" })}
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black tracking-tight">{steps[step].desc}</h3>
                                    <p className="text-sm text-slate-500 font-medium leading-relaxed italic">The CRM engine is preparing the dynamic environment for the "{steps[step].title}" phase. Data mapping for lead scores and source attribution will appear here.</p>
                                </div>
                                <Button className="w-full h-16 rounded-[2rem] font-black text-md uppercase tracking-widest shadow-2xl shadow-blue-200 hover:shadow-blue-400 transition-all" onClick={() => setStep(Math.min(4, step + 1))}>
                                    Advance Lead Phase
                                </Button>
                            </div>
                        </CardContent>
                        <div className="p-8 border-t bg-slate-50/50 flex justify-between items-center px-12">
                            <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="font-black text-slate-400">RESTORE PREV</Button>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pipeline Audit Trail Secure</p>
                            <div className="flex gap-4">
                                <Button variant="ghost" className="font-black text-red-400">DROP LEAD</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
