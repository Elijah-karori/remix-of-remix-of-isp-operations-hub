import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Trophy,
    Settings2,
    BarChart3,
    TrendingUp,
    Filter,
    Eye,
    Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const ExecutiveDashboardFlow = () => {
    const [step, setStep] = useState(0);

    const steps = [
        { title: 'Strategic KPIs', icon: Trophy, desc: 'High-level Goals' },
        { title: 'Operational', icon: Settings2, desc: 'Dept Performance' },
        { title: 'Financial', icon: TrendingUp, desc: 'P&L Deep-dive' },
        { title: 'Review', icon: Eye, desc: 'Insight Analysis' }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 p-6">
            <div className="flex justify-between items-end p-10 bg-gradient-to-r from-slate-900 to-slate-800 rounded-[3rem] shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
                <div className="space-y-2 z-10">
                    <h1 className="text-4xl font-black text-white tracking-tighter">EXECUTIVE COMMAND</h1>
                    <p className="text-slate-400 font-medium">Strategic intelligence and cross-departmental oversight.</p>
                </div>
                <div className="flex gap-4 z-10">
                    <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-2xl"><Filter className="w-4 h-4 mr-2" /> Adjust Period</Button>
                    <Button className="rounded-2xl shadow-xl shadow-primary/20"><Download className="w-4 h-4 mr-2" /> Export Report</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-4">
                    {steps.map((s, i) => (
                        <div
                            key={i}
                            className={cn(
                                "group p-6 rounded-[2rem] border-2 transition-all duration-500 cursor-pointer flex items-center gap-4",
                                step === i ? "bg-white border-primary shadow-2xl scale-105 z-10" :
                                    "bg-slate-50 border-transparent text-slate-400 opacity-60 hover:opacity-100"
                            )}
                            onClick={() => setStep(i)}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                step === i ? "bg-primary text-white" : "bg-slate-100"
                            )}>
                                <s.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest">{s.title}</p>
                                <p className="text-xs font-bold text-slate-500">{s.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <Card className="lg:col-span-3 border-none shadow-2xl ring-1 ring-slate-200 rounded-[3rem] min-h-[600px] flex flex-col overflow-hidden">
                    <CardHeader className="p-10 border-b bg-slate-50/20">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">Analytics Pipeline</p>
                                <CardTitle className="text-3xl font-black">Strategic Perspective: {steps[step].title}</CardTitle>
                            </div>
                            <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border flex items-center justify-center">
                                <BarChart3 className="w-8 h-8 text-primary/40" />
                            </div>
                        </div>
                        <Progress value={((step + 1) / 4) * 100} className="h-1.5 mt-8" />
                    </CardHeader>
                    <CardContent className="flex-1 flex items-center justify-center p-12">
                        <div className="text-center space-y-8 animate-in zoom-in-95 duration-700">
                            <div className="w-32 h-32 bg-slate-50 rounded-[4rem] mx-auto flex items-center justify-center shadow-inner border border-slate-100 transform -rotate-6 hover:rotate-0 transition-all duration-500">
                                {React.createElement(steps[step].icon, { className: "w-16 h-16 text-slate-200" })}
                            </div>
                            <div className="space-y-3 max-w-sm mx-auto">
                                <h3 className="text-2xl font-black tracking-tight italic">Analyzing Data Stream...</h3>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed">The analytics engine is aggregating cross-modular data for the "{steps[step].title}" view. Real-time visualizations and predictive trends will appear here.</p>
                            </div>
                            <Button className="h-14 px-12 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl" onClick={() => setStep(Math.min(3, step + 1))}>
                                Proceed to Next Perspective
                            </Button>
                        </div>
                    </CardContent>
                    <div className="p-10 border-t bg-slate-50/50 flex justify-between items-center px-16">
                        <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="font-black text-slate-400 uppercase">Back</Button>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Confidential High-Level Intelligence</p>
                        <Button variant="ghost" className="font-black text-primary uppercase">Deep Slice</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};
