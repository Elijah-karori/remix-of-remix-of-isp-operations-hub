import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Search,
    Truck,
    PackagePlus,
    Settings2,
    ShoppingCart,
    Ship,
    ShieldCheck,
    RefreshCcw,
    Barcode
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Sub-steps (Placeholders for now, to be expanded) ---

const DiscoveryStep = ({ onNext }: { onNext: (data: any) => void }) => (
    <div className="space-y-4">
        <div className="p-4 border-2 border-dashed rounded-lg text-center space-y-2">
            <Search className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="font-medium">Product Discovery</p>
            <p className="text-sm text-muted-foreground">Search and identify new products for the inventory.</p>
        </div>
        <Button onClick={() => onNext({ product: 'New Fiber Cable' })} className="w-full">Select Product</Button>
    </div>
);

const SupplierSelectionStep = ({ onNext }: { onNext: (data: any) => void }) => (
    <div className="space-y-4">
        <div className="p-4 border-2 border-dashed rounded-lg text-center space-y-2">
            <Truck className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="font-medium">Supplier Selection</p>
            <p className="text-sm text-muted-foreground">Choose a verified supplier for the selected product.</p>
        </div>
        <Button onClick={() => onNext({ supplier: 'Global Optics' })} className="w-full">Select Supplier</Button>
    </div>
);

// ... other steps ...

export const ProductLifecycleFlow = () => {
    const [step, setStep] = useState(0);
    const [payload, setPayload] = useState<any>({});

    const steps = [
        { title: 'Discovery', icon: Search, component: <DiscoveryStep onNext={(d) => { setPayload({ ...payload, ...d }); setStep(1); }} /> },
        { title: 'Supplier', icon: Truck, component: <SupplierSelectionStep onNext={(d) => { setPayload({ ...payload, ...d }); setStep(2); }} /> },
        { title: 'Creation', icon: PackagePlus, component: <div className="p-8 text-center">Step 3: Creation Logic</div> },
        { title: 'Management', icon: Settings2, component: <div className="p-8 text-center">Step 4: Management Logic</div> },
        { title: 'Procurement', icon: ShoppingCart, component: <div className="p-8 text-center">Step 5: Procurement Logic</div> },
        { title: 'Delivery', icon: Ship, component: <div className="p-8 text-center">Step 6: Delivery Logic</div> },
        { title: 'Quality', icon: ShieldCheck, component: <div className="p-8 text-center">Step 7: Quality Logic</div> },
        { title: 'Update', icon: RefreshCcw, component: <div className="p-8 text-center">Step 8: Update Logic</div> },
        { title: 'Tracking', icon: Barcode, component: <div className="p-8 text-center">Step 9: Tracking Logic</div> },
    ];

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-xl border-t-4 border-t-primary">
            <CardHeader>
                <div className="flex justify-between items-center mb-2">
                    <CardTitle className="text-xl">Product Lifecycle Flow</CardTitle>
                    <span className="text-sm font-bold text-primary">Step {step + 1} of 9</span>
                </div>
                <Progress value={((step + 1) / 9) * 100} className="h-2" />
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid grid-cols-9 gap-2 mb-8 border-b pb-6">
                    {steps.map((s, i) => (
                        <div key={s.title} className="flex flex-col items-center gap-1 group">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                                step === i ? "bg-primary text-primary-foreground scale-110 shadow-md" :
                                    step > i ? "bg-green-100 text-green-600" : "bg-muted text-muted-foreground grayscale"
                            )}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <span className={cn(
                                "text-[10px] uppercase font-bold text-center",
                                step === i ? "text-primary" : "text-muted-foreground"
                            )}>
                                {s.title}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="min-h-[300px] flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
                    <div className="w-full max-w-md">
                        {steps[step].component}
                    </div>
                </div>

                <div className="flex justify-between mt-8">
                    <Button variant="outline" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                        Previous
                    </Button>
                    <div className="flex gap-2 text-xs text-muted-foreground items-center italic">
                        {step < 8 ? `Next: ${steps[step + 1].title}` : 'Flow Complete'}
                    </div>
                    <Button onClick={() => setStep(Math.min(8, step + 1))} disabled={step === 8}>
                        Skip Logic (Demo)
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};
