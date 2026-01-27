import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Zap,
    LayoutGrid,
    GitBranchPlus,
    ShieldCheck,
    SendHorizonal,
    Network
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const WorkflowDesignFlow = () => {
    const [step, setStep] = useState(0);

    const steps = [
        { title: 'Trigger', icon: Zap, desc: 'Event Definition' },
        { title: 'Nodes', icon: LayoutGrid, desc: 'Select Actions' },
        { title: 'Linkage', icon: GitBranchPlus, desc: 'Define Logic Flow' },
        { title: 'Validation', icon: ShieldCheck, desc: 'Constraint Check' },
        { title: 'Publish', icon: SendHorizonal, desc: 'Activate Engine' }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pt-10">
            <div className="flex flex-col items-center text-center space-y-4 mb-10">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center rotate-45 transform hover:rotate-0 transition-all duration-700">
                    <Network className="w-10 h-10 text-primary -rotate-45 group-hover:rotate-0" />
                </div>
                <div className="space-y-1">
                    <h1 className="text-4xl font-black tracking-tighter italic">WORKFLOW ARCHITECT</h1>
                    <p className="text-slate-500 font-medium">Design and deploy autonomous organizational logic.</p>
                </div>
            </div>

            <div className="grid grid-cols-5 gap-4 mb-10">
                {steps.map((s, i) => (
                    <div key={i} className="space-y-2">
                        <div className={cn(
                            "h-2 rounded-full transition-all duration-1000",
                            step >= i ? "bg-primary" : "bg-slate-100"
                        )} />
                        <div className="flex items-center gap-2 px-1">
                            <s.icon className={cn("w-3 h-3", step >= i ? "text-primary" : "text-slate-300")} />
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", step >= i ? "text-slate-900" : "text-slate-400")}>{s.title}</span>
                        </div>
                    </div>
                ))}
            </div>

            <Card className="border-none shadow-3xl ring-1 ring-slate-200 rounded-[2.5rem] overflow-hidden min-h-[500px] flex flex-col bg-white">
                <CardHeader className="p-10 border-b flex flex-row justify-between items-center">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Automation Core</p>
                        <CardTitle className="text-2xl font-black">{steps[step].title}: {steps[step].desc}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                        <div className="px-4 py-2 bg-slate-100 rounded-xl font-mono text-[10px] font-bold">WF-ID: AD42-Z</div>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-16 flex items-center justify-center">
                    <div className="text-center space-y-8 max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-700">
                        <div className="w-24 h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] mx-auto flex items-center justify-center">
                            {React.createElement(steps[step].icon, { className: "w-10 h-10 text-slate-300" })}
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-bold tracking-tight">{steps[step].desc}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed italic">The visual editor is loading the components for "{steps[step].title}". Interactive canvas and node palette will appear here.</p>
                        </div>
                        <Button className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20" onClick={() => setStep(Math.min(4, step + 1))}>
                            Advance Design Phase
                        </Button>
                    </div>
                </CardContent>
                <div className="p-8 border-t bg-slate-50/10 flex justify-between items-center text-[10px]">
                    <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="font-bold text-slate-400 uppercase">Back</Button>
                    <div className="space-x-8 font-black text-slate-300 tracking-[0.3em] uppercase">
                        <span>Validation: OK</span>
                        <span>Complexity: Low</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" className="font-black text-red-500 uppercase">Discard</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
};
