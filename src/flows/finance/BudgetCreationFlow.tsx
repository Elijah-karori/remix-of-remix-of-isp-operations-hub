import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
    FileText,
    PenTool,
    Layers,
    Search,
    CheckCircle,
    Activity,
    BarChart3
} from 'lucide-react';

export const BudgetCreationFlow = () => {
    const [step, setStep] = useState(0);
    const [budgetData, setBudgetData] = useState({
        name: '',
        total: '',
        description: '',
        breakdown: []
    });

    const steps = [
        { title: 'Request', icon: FileText, desc: 'Initial Request' },
        { title: 'Draft', icon: PenTool, desc: 'Setup Detail' },
        { title: 'Breakdown', icon: Layers, desc: 'Allocate funds' },
        { title: 'Review', icon: Search, desc: 'Final Check' },
        { title: 'Approval', icon: CheckCircle, desc: 'Get sign-off' },
        { title: 'Activation', icon: Activity, desc: 'Go Live' },
        { title: 'Monitoring', icon: BarChart3, desc: 'Track Spend' }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 p-6">
            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Budget Lifecycle</h1>
                    <p className="text-muted-foreground">Manage organizational spending from inception to analysis.</p>
                </div>
                <div className="bg-slate-100 p-2 rounded-lg flex items-center gap-2">
                    <Badge variant="outline" className="bg-white">FY 2026</Badge>
                    <Badge variant="outline" className="bg-white">Q1 Planning</Badge>
                </div>
            </div>

            <div className="relative">
                <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 -z-10" />
                <div className="flex justify-between items-center px-2">
                    {steps.map((s, i) => (
                        <div key={s.title} className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                step === i ? "bg-primary border-primary text-white scale-125 shadow-xl" :
                                    step > i ? "bg-green-500 border-green-500 text-white" : "bg-white border-slate-200 text-slate-400"
                            )}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <div className="text-center">
                                <p className={cn("text-[10px] font-bold uppercase", step === i ? "text-primary" : "text-slate-500")}>{s.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Card className="shadow-2xl border-none ring-1 ring-slate-200">
                <CardHeader className="bg-slate-50/50 border-b">
                    <CardTitle className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                            {React.createElement(steps[step].icon, { className: "w-4 h-4 text-primary" })}
                        </div>
                        {steps[step].title}: {steps[step].desc}
                    </CardTitle>
                    <Progress value={((step + 1) / steps.length) * 100} className="h-1 mt-4" />
                </CardHeader>
                <CardContent className="p-8 min-h-[400px]">
                    {step === 0 && (
                        <div className="space-y-6 max-w-xl mx-auto">
                            <div className="space-y-2">
                                <Label htmlFor="bname">Budget Name / Reference</Label>
                                <Input id="bname" placeholder="E.g. Infrastructure Upgrade Q3" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="btype">Budget Category</Label>
                                <Select>
                                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ops">Operations</SelectItem>
                                        <SelectItem value="capex">Capital Expenditure</SelectItem>
                                        <SelectItem value="marketing">Marketing</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="desc">Purpose / Justification</Label>
                                <Textarea id="desc" placeholder="Explain why this budget is needed..." className="min-h-[100px]" />
                            </div>
                        </div>
                    )}

                    {step > 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
                            <Activity className="w-12 h-12 opacity-20 animate-pulse" />
                            <p className="text-sm italic">Interactive form for "{steps[step].title}" phase is being initialized...</p>
                        </div>
                    )}
                </CardContent>
                <div className="p-6 border-t bg-slate-50/50 flex justify-between items-center rounded-b-xl">
                    <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Previous Phase</Button>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-medium text-slate-400">Phase {step + 1} of 7</span>
                        <Button onClick={() => setStep(Math.min(6, step + 1))}>{step === 6 ? 'Close' : 'Proceed to ' + steps[step + 1]?.title}</Button>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-600 text-white border-none shadow-lg overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    <CardHeader>
                        <CardTitle className="text-lg">Budget Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">Good</div>
                        <p className="text-blue-100 text-xs mt-2">All allocations are within threshold for FY26.</p>
                    </CardContent>
                </Card>

                <Card className="md:col-span-2 border-dashed">
                    <CardContent className="flex items-center justify-center p-8 gap-6 h-full">
                        <div className="text-center">
                            <p className="text-2xl font-bold">KES 0.00</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Total Requested</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200" />
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">0</p>
                            <p className="text-[10px] uppercase font-bold text-slate-400">Stakeholders Notified</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
