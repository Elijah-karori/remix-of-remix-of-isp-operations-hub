import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Flag,
    Map,
    Play,
    Activity,
    CheckCircle,
    Layout,
    BarChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const ProjectLifecycleFlow = () => {
    const [step, setStep] = useState(0);

    const steps = [
        { title: 'Initiation', icon: Flag, desc: 'Project Charter & Setup' },
        { title: 'Planning', icon: Map, desc: 'WBS & Resource Allocation' },
        { title: 'Execution', icon: Play, desc: 'Implementation & Field Work' },
        { title: 'Monitoring', icon: Activity, desc: 'KPIs & Health Tracking' },
        { title: 'Closing', icon: CheckCircle, desc: 'Handover & Reporting' }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-3xl shadow-sm border ring-1 ring-slate-100">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Layout className="w-8 h-8 text-primary" />
                        PROJECT STAGE-GATE
                    </h1>
                    <p className="text-slate-500 font-medium italic">Standardized infrastructure deployment methodology.</p>
                </div>
                <div className="flex -space-x-3">
                    {steps.map((s, i) => (
                        <div key={i} className={cn(
                            "w-12 h-12 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg transition-all duration-500",
                            step === i ? "bg-primary text-white scale-125 z-20" :
                                step > i ? "bg-green-500 text-white z-10" : "bg-slate-100 text-slate-400 z-0"
                        )}>
                            <s.icon className="w-5 h-5" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <Card className="border-none shadow-lg ring-1 ring-slate-200">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-slate-400">Project Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-500">PROJECT ID</p>
                                <p className="font-mono text-sm">PRJ-2026-FIBER-042</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-500">PRIORITY</p>
                                <Badge className="bg-red-500 hover:bg-red-600 border-none font-bold text-[10px]">CRITICAL</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg bg-primary text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-primary-foreground/60">Stage Completion</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-black">{Math.round(((step + 1) / 5) * 100)}%</p>
                            <Progress value={((step + 1) / 5) * 100} className="h-1 bg-white/20 mt-2" />
                        </CardContent>
                    </Card>
                </div>

                <Card className="lg:col-span-3 border-none shadow-2xl ring-1 ring-slate-200 min-h-[600px] flex flex-col">
                    <CardHeader className="p-8 border-b bg-slate-50/30">
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Phase 0{step + 1}</p>
                                <CardTitle className="text-2xl font-black">{steps[step].title}</CardTitle>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-full font-bold text-[10px] uppercase border-2"><BarChart className="w-3 h-3 mr-2" /> View Analytics</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-12 flex items-center justify-center">
                        <div className="text-center space-y-8 max-w-sm">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center shadow-inner border-2 border-slate-200 transform -rotate-12 transition-transform hover:rotate-0 duration-500">
                                    {React.createElement(steps[step].icon, { className: "w-12 h-12 text-slate-400" })}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-2xl shadow-xl flex items-center justify-center border ring-4 ring-slate-50">
                                    <span className="font-black text-primary italic">!</span>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-xl font-black tracking-tight">{steps[step].desc}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed font-medium">The "{steps[step].title}" sub-module for project management is being configured with the core PMS engine. Integration with field tools will appear here.</p>
                            </div>
                            <div className="pt-4 flex flex-col gap-3">
                                <Button className="h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20" onClick={() => setStep(Math.min(4, step + 1))}>
                                    Finalize {steps[step].title} Gate
                                </Button>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Requires PMO Approval to Proceed</p>
                            </div>
                        </div>
                    </CardContent>
                    <div className="p-8 border-t bg-slate-50/50 flex justify-between">
                        <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="font-bold text-slate-500">Previous Gate</Button>
                        <div className="flex gap-4">
                            <Button variant="ghost" className="font-bold text-slate-500">WBS View</Button>
                            <Button variant="ghost" className="font-bold text-red-500">Halt Project</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
