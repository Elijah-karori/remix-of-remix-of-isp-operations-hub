import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Link2,
    Key,
    GitCompare,
    RefreshCw,
    Activity,
    Box
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const StandardIntegrationFlow = () => {
    const [step, setStep] = useState(0);

    const steps = [
        { title: 'Connect', icon: Link2, desc: 'Endpoint Config' },
        { title: 'Auth', icon: Key, desc: 'Credential Handshake' },
        { title: 'Mapping', icon: GitCompare, desc: 'Object Alignment' },
        { title: 'Sync', icon: RefreshCw, desc: 'Initial Data Pull' },
        { title: 'Monitor', icon: Activity, desc: 'Health Checks' }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-6">
            <Card className="border-none shadow-sm ring-1 ring-slate-100 rounded-[2.5rem] bg-white overflow-hidden p-2">
                <div className="flex flex-col md:flex-row justify-between items-center p-8 bg-slate-50 rounded-[2rem] gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center shadow-2xl">
                            <Box className="w-8 h-8 text-primary animate-pulse" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">INTEGRATION HUB</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                Service-Oriented Architecture (SOA)
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="rounded-xl font-bold text-xs uppercase border-2">API Docs</Button>
                        <Button variant="outline" className="rounded-xl font-bold text-xs uppercase border-2">Postman</Button>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative px-4">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10" />
                {steps.map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-4 group">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 relative",
                            step === i ? "bg-primary text-white shadow-3xl scale-125 z-10" :
                                step > i ? "bg-green-500 text-white shadow-lg" : "bg-white border-2 border-slate-100 text-slate-300 shadow-sm"
                        )}>
                            <s.icon className="w-6 h-6" />
                            {step > i && <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center border-2 border-green-500"><div className="w-2 h-2 rounded-full bg-green-500" /></div>}
                        </div>
                        <div className="text-center">
                            <p className={cn("text-[9px] font-black uppercase tracking-widest", step === i ? "text-primary" : "text-slate-400")}>{s.title}</p>
                        </div>
                    </div>
                ))}
            </div>

            <Card className="border-none shadow-3xl ring-1 ring-slate-200 rounded-[3rem] min-h-[500px] flex flex-col overflow-hidden">
                <CardHeader className="p-10 border-b bg-slate-50/30 flex flex-row justify-between items-center">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">External Service Adapter</p>
                        <CardTitle className="text-2xl font-black italic">{steps[step].title}: {steps[step].desc}</CardTitle>
                    </div>
                    <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border flex items-center justify-center">
                        <RefreshCw className={cn("w-8 h-8 text-slate-200", step === 3 && "animate-spin text-primary")} />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-16 flex items-center justify-center">
                    <div className="text-center space-y-8 max-w-sm animate-in zoom-in-95 duration-700">
                        <div className="w-28 h-28 bg-slate-50 rounded-[3rem] mx-auto flex items-center justify-center border border-slate-100 shadow-inner group-hover:rotate-12 transition-transform">
                            {React.createElement(steps[step].icon, { className: "w-12 h-12 text-slate-300" })}
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-xl font-bold tracking-tight uppercase tracking-[0.1em]">{steps[step].desc}</h3>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed italic">The integration adapter is negotiating the protocol for the "{steps[step].title}" phase. REST/GraphQL/Webhook handshakes will appear here.</p>
                        </div>
                        <Button className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/10" onClick={() => setStep(Math.min(4, step + 1))}>
                            Finalize Connection Step
                        </Button>
                    </div>
                </CardContent>
                <div className="p-10 border-t bg-slate-50/50 flex justify-between items-center px-16">
                    <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="font-black text-slate-400">Back</Button>
                    <div className="flex gap-4">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">TLS 1.3 Active</span>
                    </div>
                    <Button variant="ghost" className="font-black text-red-400">Detach</Button>
                </div>
            </Card>
        </div>
    );
};
