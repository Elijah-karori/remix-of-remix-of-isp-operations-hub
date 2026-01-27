import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Database,
    GitMerge,
    ShieldCheck,
    Settings2,
    FileCode2,
    Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const PermissionManagementFlow = () => {
    const [step, setStep] = useState(0);

    const steps = [
        { title: 'Resource', icon: Database, desc: 'Object Selection' },
        { title: 'Action', icon: GitMerge, desc: 'Mapping Verbs' },
        { title: 'Conditions', icon: Settings2, desc: 'Scope Filters' },
        { title: 'Policy', icon: ShieldCheck, desc: 'Rule Validation' },
        { title: 'Release', icon: FileCode2, desc: 'Commit to RBAC' }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border ring-1 ring-slate-100 flex justify-between items-center">
                <div className="flex gap-4 items-center">
                    <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                        <Database className="w-7 h-7 text-white" />
                    </div>
                    <div className="space-y-0.5">
                        <h1 className="text-2xl font-black tracking-tighter">PERM-BUILDER v2</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Granular Resource Control</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {steps.map((s, i) => (
                        <div key={i} className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                            step === i ? "bg-indigo-600 text-white shadow-lg scale-110" :
                                step > i ? "bg-green-500 text-white" : "bg-slate-50 text-slate-300"
                        )}>
                            <s.icon className="w-5 h-5" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                    <Card className="border-none shadow-2xl ring-1 ring-slate-200 rounded-[2rem] overflow-hidden min-h-[550px] flex flex-col">
                        <CardHeader className="p-8 border-b bg-slate-50/50">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xl font-black">{steps[step].title}: {steps[step].desc}</CardTitle>
                                <Badge variant="outline" className="font-mono text-[10px]">VERB-MAP-26</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-12 flex items-center justify-center">
                            <div className="text-center space-y-8 max-w-sm animate-in slide-in-from-bottom-6 duration-700">
                                <div className="w-24 h-24 bg-white shadow-xl rounded-[2.5rem] border border-slate-100 mx-auto flex items-center justify-center hover:bg-slate-50 transition-colors">
                                    {React.createElement(steps[step].icon, { className: "w-10 h-10 text-slate-400" })}
                                </div>
                                <div className="space-y-3">
                                    <h3 className="text-xl font-bold tracking-tight">{steps[step].desc}</h3>
                                    <p className="text-sm text-slate-500 font-medium italic">Policy generation engine for the "{steps[step].title}" phase is being initialized. Resource schemas and attribute mapping will appear here.</p>
                                </div>
                                <Button className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100" onClick={() => setStep(Math.min(4, step + 1))}>
                                    Proceed to {steps[step + 1]?.title || 'Finalize'}
                                </Button>
                            </div>
                        </CardContent>
                        <div className="p-8 border-t flex justify-between">
                            <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="font-bold text-slate-400">Back</Button>
                            <Button variant="ghost" className="font-bold text-slate-400">Simulation Mode</Button>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="shadow-lg border-none ring-1 ring-slate-200 rounded-[1.5rem] bg-indigo-900 text-white overflow-hidden relative">
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-300">Active Policy Draft</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Lock className="w-4 h-4 text-indigo-400" />
                                    <p className="text-sm font-bold">allow::system.users</p>
                                </div>
                                <div className="pl-7 space-y-1">
                                    <div className="flex gap-1">
                                        {['create', 'read', 'update'].map(a => <Badge key={a} className="bg-indigo-800 text-[9px] font-bold uppercase">{a}</Badge>)}
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-indigo-800">
                                <p className="text-[10px] text-indigo-400 font-bold uppercase">Affected Roles</p>
                                <p className="text-sm font-bold mt-1 inline-flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    Superadmin, Dept_Head
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
