import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Scale, Settings, CheckCircle2, ShoppingCart, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SmartProcurementFlow = () => {
    const [step, setStep] = useState(0);
    const [search, setSearch] = useState('');
    const [selectedItems, setSelectedItems] = useState<any[]>([]);

    const steps = [
        { title: 'Search', icon: Search },
        { title: 'Compare', icon: Scale },
        { title: 'Configure', icon: Settings },
        { title: 'Approve', icon: CheckCircle2 }
    ];

    return (
        <div className="space-y-6 max-w-5xl mx-auto p-4">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight">Smart Procurement</h2>
                    <p className="text-muted-foreground">Intelligent supplier comparison and order optimization.</p>
                </div>
                <div className="flex gap-4">
                    {steps.map((s, i) => (
                        <div key={s.title} className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                                step === i ? "bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20" :
                                    step > i ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400"
                            )}>
                                <s.icon className="w-6 h-6" />
                            </div>
                            <span className={cn("text-xs font-bold uppercase tracking-wider", step === i ? "text-primary" : "text-slate-400")}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 shadow-md">
                    <CardHeader>
                        <CardTitle>{steps[step].title}</CardTitle>
                        <CardDescription>Perform intelligent actions for this procurement phase.</CardDescription>
                    </CardHeader>
                    <CardContent className="min-h-[400px]">
                        {step === 0 && (
                            <div className="space-y-6">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by SKU, Name, or Category..."
                                        className="pl-10 h-12 text-lg"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Suggested Items</p>
                                    <div className="grid grid-cols-1 gap-3">
                                        {['6Core Fiber Cable', 'Mikrotik RB4011', 'Ubiquiti Rocket M5'].map(item => (
                                            <div key={item} className="flex justify-between items-center p-4 border rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => setSelectedItems([...selectedItems, { name: item, qty: 1 }])}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                        <ShoppingCart className="w-5 h-5 text-slate-500 group-hover:text-primary" />
                                                    </div>
                                                    <span className="font-medium">{item}</span>
                                                </div>
                                                <Button variant="ghost" size="sm">Add to List</Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-6">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead>Supplier</TableHead>
                                            <TableHead>Price (Unit)</TableHead>
                                            <TableHead>Lead Time</TableHead>
                                            <TableHead>Reliability</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[
                                            { name: 'Global Optics', price: '45,000', delta: '-5%', time: '3 Days', score: 98, best: true },
                                            { name: 'Local Tech Solutions', price: '48,500', delta: '+2%', time: '1 Day', score: 92, best: false },
                                            { name: 'China Direct', price: '39,000', delta: '-12%', time: '21 Days', score: 85, best: false }
                                        ].map(s => (
                                            <TableRow key={s.name} className={cn(s.best && "bg-green-50/50")}>
                                                <TableCell className="font-bold">{s.name} {s.best && <Badge className="ml-2 bg-green-500">Best Value</Badge>}</TableCell>
                                                <TableCell>
                                                    <span className="font-mono">KES {s.price}</span>
                                                    <span className={cn("ml-2 text-[10px]", s.delta.startsWith('-') ? "text-green-600" : "text-red-600")}>{s.delta}</span>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">{s.time}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={s.score} className="w-16 h-1.5" />
                                                        <span className="text-xs font-medium">{s.score}%</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell><Button variant="outline" size="sm">Select</Button></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                <div className="bg-blue-50 p-4 border border-blue-100 rounded-lg flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                                    <p className="text-sm text-blue-800">
                                        <strong>Smart Recommendation:</strong> Select <strong>Global Optics</strong> for the best balance of cost and delivery speed. They have a 98% fulfillment rate for fiber equipment.
                                    </p>
                                </div>
                            </div>
                        )}

                        {step >= 2 && <div className="p-20 text-center text-muted-foreground italic">Configuration and Approval logic placeholder...</div>}
                    </CardContent>
                    <div className="p-6 border-t flex justify-between bg-slate-50/50 rounded-b-xl">
                        <Button variant="ghost" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>Back</Button>
                        <Button onClick={() => setStep(Math.min(3, step + 1))}>{step === 3 ? 'Finalize Order' : 'Continue'}</Button>
                    </div>
                </Card>

                <Card className="shadow-md h-fit">
                    <CardHeader className="bg-slate-900 text-white rounded-t-xl">
                        <CardTitle className="text-lg">Order Basket</CardTitle>
                        <CardDescription className="text-slate-400">Items selected for procurement</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {selectedItems.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-10 italic">No items added yet</p>
                        ) : (
                            selectedItems.map((item, i) => (
                                <div key={i} className="flex justify-between items-center text-sm">
                                    <span>{item.name}</span>
                                    <span className="font-mono bg-slate-100 px-2 py-1 rounded">x{item.qty}</span>
                                </div>
                            ))
                        )}
                        <div className="pt-4 border-t space-y-2">
                            <div className="flex justify-between font-bold">
                                <span>Estimated Total</span>
                                <span>KES 0.00</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground uppercase text-center">Taxes and Duties calculated at checkout</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
