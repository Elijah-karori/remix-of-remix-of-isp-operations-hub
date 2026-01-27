import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Smartphone,
    Send,
    Building2,
    CheckCircle2,
    Loader2,
    Receipt,
    History,
    Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const MpesaPaymentFlow = () => {
    const [activeTab, setActiveTab] = useState('c2b');
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');

    const handleProcess = () => {
        setIsProcessing(true);
        setStatus('pending');
        // Simulated processing
        setTimeout(() => {
            setIsProcessing(false);
            setStatus('success');
        }, 2000);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center shadow-inner">
                        <Smartphone className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold">M-Pesa Unified Gateway</h1>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Direct connection to Safaricom Daraja API
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full shadow-sm"><History className="w-4 h-4 mr-2" /> Recent</Button>
                    <Button variant="outline" size="sm" className="rounded-full shadow-sm"><Info className="w-4 h-4 mr-2" /> Support</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8">
                    <Card className="border-none shadow-xl ring-1 ring-slate-200 overflow-hidden">
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <CardHeader className="bg-slate-50/50 border-b pb-0 px-8">
                                <TabsList className="bg-transparent h-auto p-0 gap-6">
                                    {['c2b', 'b2c', 'b2b'].map((type) => (
                                        <TabsTrigger
                                            key={type}
                                            value={type}
                                            className={cn(
                                                "rounded-none border-b-2 border-transparent bg-transparent px-2 pb-4 pt-2 font-bold uppercase tracking-widest text-[10px] transition-all data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none",
                                            )}
                                        >
                                            {type === 'c2b' && <Smartphone className="w-4 h-4 mr-2" />}
                                            {type === 'b2c' && <Send className="w-4 h-4 mr-2" />}
                                            {type === 'b2b' && <Building2 className="w-4 h-4 mr-2" />}
                                            {type.toUpperCase()}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </CardHeader>

                            <CardContent className="p-8">
                                <TabsContent value="c2b" className="mt-0 space-y-6 transition-all duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Customer Phone Number</Label>
                                            <Input placeholder="254 7XX XXX XXX" className="h-12 bg-slate-50 border-slate-200 text-lg font-mono focus:bg-white transition-colors" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Amount (KES)</Label>
                                            <Input type="number" placeholder="0.00" className="h-12 bg-slate-50 border-slate-200 text-lg font-mono focus:bg-white transition-colors" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Bill Reference / Account No.</Label>
                                        <Input placeholder="Invoice-SH-2024-001" className="h-12" />
                                    </div>
                                </TabsContent>

                                <TabsContent value="b2c" className="mt-0 space-y-6">
                                    <p className="text-sm text-muted-foreground bg-amber-50 p-3 rounded-lg border border-amber-100 italic">This flow requires B2C credentials and shortcode registration.</p>
                                    <div className="space-y-4 pt-4 opacity-50 pointer-events-none">
                                        <Label>Payee Details Placeholder...</Label>
                                        <Input disabled />
                                    </div>
                                </TabsContent>

                                <TabsContent value="b2b" className="mt-0 space-y-6">
                                    <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-100 italic">Inter-organizational funds transfer.</p>
                                    <div className="space-y-4 pt-4 opacity-50 pointer-events-none">
                                        <Label>Partner Shortcode Placeholder...</Label>
                                        <Input disabled />
                                    </div>
                                </TabsContent>

                                <div className="pt-8 flex flex-col items-center gap-4">
                                    {status === 'success' ? (
                                        <div className="flex flex-col items-center gap-2 animate-in zoom-in-95 duration-300">
                                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                                            <p className="font-bold text-lg text-green-700">Transaction Successful</p>
                                            <Button variant="outline" onClick={() => setStatus('idle')} className="mt-4">New Transaction</Button>
                                        </div>
                                    ) : (
                                        <Button
                                            className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all rounded-xl"
                                            disabled={isProcessing}
                                            onClick={handleProcess}
                                        >
                                            {isProcessing ? (
                                                <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Processing with Safaricom...</>
                                            ) : (
                                                `Process ${activeTab.toUpperCase()} Payment`
                                            )}
                                        </Button>
                                    )}
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Secure SSL Encrypted Gateway</p>
                                </div>
                            </CardContent>
                        </Tabs>
                    </CardContent>
                </div>

                <div className="md:col-span-4 space-y-6">
                    <Card className="shadow-lg border-none bg-slate-900 text-white overflow-hidden relative">
                        <div className="absolute right-0 bottom-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Ledger Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-3xl font-bold font-mono">KES 0.00</p>
                                <p className="text-xs text-slate-400 italic">Pending Reconcilliation</p>
                            </div>
                            <div className="pt-4 border-t border-slate-800 space-y-3">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Total volume today</span>
                                    <span className="font-bold">KES 1.4M</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-400">Success Rate</span>
                                    <span className="font-bold text-green-400">99.2%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-none ring-1 ring-slate-200">
                        <CardHeader>
                            <CardTitle className="text-sm font-bold flex items-center gap-2"><Receipt className="w-4 h-4" /> Quick Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                    <p className="text-xs text-slate-600"><strong>C2B</strong> average time: <strong>0.8s</strong></p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <p className="text-xs text-slate-600"><strong>STK</strong> push timeout: <strong>45s</strong></p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
