import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    UserCheck,
    Calendar,
    Send,
    PlayCircle,
    FileCheck,
    CheckCircle2,
    Clock,
    Navigation
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const FieldTaskFlow = () => {
    const [step, setStep] = useState(0);

    const steps = [
        { title: 'Assignment', icon: UserCheck },
        { title: 'Scheduling', icon: Calendar },
        { title: 'Dispatch', icon: Send },
        { title: 'Execution', icon: PlayCircle },
        { title: 'Reporting', icon: FileCheck },
        { title: 'Approval', icon: CheckCircle2 }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-md border ring-1 ring-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center shadow-inner">
                        <Navigation className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight">FIELD TASK FLOW</h2>
                        <p className="text-sm font-medium text-slate-500">Real-time technician dispatch and task management.</p>
                    </div>
                </div>
                <div className="hidden md:flex gap-2">
                    {steps.map((s, i) => (
                        <div key={i} className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300",
                            step === i ? "bg-primary text-white shadow-lg scale-110" :
                                step > i ? "bg-green-100 text-green-600" : "bg-slate-50 text-slate-300"
                        )}>
                            <s.icon className="w-5 h-5" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-12">
                    <Card className="border-none shadow-2xl ring-1 ring-slate-200 overflow-hidden">
                        <CardHeader className="bg-slate-900 text-white p-8">
                            <div className="flex justify-between items-center">
                                <div className="space-y-2">
                                    <Badge className="bg-primary/20 text-primary-foreground border-none font-black text-[10px] tracking-widest">PHASE 0{step + 1}</Badge>
                                    <CardTitle className="text-2xl font-bold">{steps[step].title}</CardTitle>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Tech Load</p>
                                    <p className="text-2xl font-black">94%</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 min-h-[400px]">
                            {step === 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="pl-8">Technician</TableHead>
                                            <TableHead>Skill Set</TableHead>
                                            <TableHead>Distance</TableHead>
                                            <TableHead>Load</TableHead>
                                            <TableHead className="text-right pr-8">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[
                                            { name: 'Peter Kamau', skills: 'Fiber, Splice', dist: '2.4km', load: '3/5', available: true },
                                            { name: 'Sarah Omolo', skills: 'TR-069, Config', dist: '5.1km', load: '5/5', available: false },
                                            { name: 'David Mwangi', skills: 'General Ops', dist: '1.2km', load: '1/5', available: true }
                                        ].map((tech, i) => (
                                            <TableRow key={i} className={cn(!tech.available && "opacity-50 grayscale bg-slate-50/30")}>
                                                <TableCell className="pl-8 font-bold">{tech.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        {tech.skills.split(',').map(s => <Badge key={s} variant="outline" className="text-[9px] font-black">{s.trim()}</Badge>)}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs">{tech.dist}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={(parseInt(tech.load.split('/')[0]) / 5) * 100} className="w-12 h-1.5" />
                                                        <span className="text-[10px] font-bold">{tech.load}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <Button size="sm" variant={tech.available ? "default" : "ghost"}>{tech.available ? 'Assign Task' : 'Busy'}</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                            {step > 0 && (
                                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground italic space-y-4">
                                    <Clock className="w-16 h-16 opacity-10 animate-pulse" />
                                    <p>Technician reporting sub-module for "{steps[step].title}" is in standby...</p>
                                </div>
                            )}
                        </CardContent>
                        <div className="p-8 border-t bg-slate-50/50 flex justify-between items-center">
                            <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="font-bold">Previous Step</Button>
                            <div className="flex items-center gap-6">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{steps[step].title} Phase Active</p>
                                <Button className="rounded-xl px-8 font-black shadow-lg" onClick={() => setStep(Math.min(5, step + 1))}>
                                    {step === 5 ? 'Archive Task' : 'Proceed to ' + steps[step + 1]?.title}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
