import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Clock,
    Calculator,
    CheckCircle,
    Wallet,
    FileText,
    TrendingDown,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const PayrollProcessingFlow = () => {
    const [step, setStep] = useState(0);

    const steps = [
        { title: 'Review Hours', icon: Clock },
        { title: 'Deductions', icon: Calculator },
        { title: 'Approval', icon: CheckCircle },
        { title: 'Payout', icon: Wallet }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-4">
            <div className="flex justify-between items-end bg-white p-8 rounded-3xl shadow-sm border ring-1 ring-slate-100">
                <div className="space-y-1">
                    <Badge className="bg-blue-500 hover:bg-blue-600 mb-2">January 2026 Cycle</Badge>
                    <h1 className="text-3xl font-black tracking-tight">Payroll Engine</h1>
                    <p className="text-slate-500 font-medium">Verify earnings, taxes, and statutory deductions.</p>
                </div>
                <div className="flex gap-4">
                    {steps.map((s, i) => (
                        <div key={s.title} className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                step === i ? "bg-primary text-white shadow-xl rotate-0" :
                                    step > i ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400 rotate-6"
                            )}>
                                <s.icon className="w-6 h-6" />
                            </div>
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", step === i ? "text-primary" : "text-slate-400")}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                    <Card className="border-none shadow-2xl ring-1 ring-slate-200 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b p-8">
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-primary" />
                                    {steps[step].title} Details
                                </CardTitle>
                                <Badge variant="outline" className="font-mono">REFR-PYRL-2026-001</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 min-h-[500px]">
                            {step === 0 && (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50/50">
                                            <TableHead className="pl-8">Employee</TableHead>
                                            <TableHead>Expected Hrs</TableHead>
                                            <TableHead>Actual Hrs</TableHead>
                                            <TableHead>Variance</TableHead>
                                            <TableHead className="text-right pr-8">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[
                                            { name: 'John Doe', expected: 160, actual: 168, var: '+8', status: 'verified' },
                                            { name: 'Jane Smith', expected: 160, actual: 154, var: '-6', status: 'review_pending' },
                                            { name: 'Mike Ross', expected: 160, actual: 160, var: '0', status: 'verified' }
                                        ].map((row, i) => (
                                            <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="pl-8 font-bold">{row.name}</TableCell>
                                                <TableCell className="font-mono">{row.expected}</TableCell>
                                                <TableCell className="font-mono">{row.actual}</TableCell>
                                                <TableCell className={cn("font-bold font-mono", row.var.startsWith('+') ? "text-green-600" : row.var.startsWith('-') ? "text-red-500" : "text-slate-400")}>{row.var}</TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <Badge variant={row.status === 'verified' ? 'default' : 'secondary'} className="uppercase text-[10px] tracking-widest">
                                                        {row.status.replace('_', ' ')}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                            {step > 0 && (
                                <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground italic space-y-4">
                                    <Calculator className="w-16 h-16 opacity-10 animate-pulse" />
                                    <p>Initializing "{steps[step].title}" calculation engine...</p>
                                </div>
                            )}
                        </CardContent>
                        <div className="p-8 border-t bg-slate-50/50 flex justify-between items-center">
                            <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back to {steps[step - 1]?.title}</Button>
                            <Button className="h-12 px-10 rounded-xl font-bold text-md shadow-lg" onClick={() => setStep(Math.min(3, step + 1))}>
                                {step === 3 ? 'Finalize Payout' : 'Proceed to ' + steps[step + 1]?.title}
                            </Button>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
                        <CardHeader className="pb-2">
                            <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Net Payout Pipeline</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-1">
                                <p className="text-4xl font-black font-mono tracking-tighter">KES 0.00</p>
                                <p className="text-xs text-slate-400 flex items-center gap-2">
                                    <TrendingDown className="w-3 h-3 text-red-500" />
                                    KES 420K Est. Deductions
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Tax (PAYE)</p>
                                    <p className="font-mono font-bold">KES 0.00</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">Statutory</p>
                                    <p className="font-mono font-bold">KES 0.00</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl ring-1 ring-slate-200">
                        <CardHeader>
                            <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest">
                                <AlertCircle className="w-4 h-4 text-amber-500" /> System Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
                                <div className="w-1 h-full bg-amber-400 rounded-full" />
                                <p className="text-xs text-amber-800 leading-relaxed font-medium"><strong>3 Employees</strong> have missing timesheet approvals for this cycle. Verification required.</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
                                <div className="w-1 h-full bg-blue-400 rounded-full" />
                                <p className="text-xs text-blue-800 leading-relaxed font-medium">Bank batch format updated for NCBA and Equity integrations.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
