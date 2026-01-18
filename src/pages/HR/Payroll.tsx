import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePendingPayouts, useApprovePayout } from "@/hooks/use-hr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DollarSign, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Payroll() {
    const { data: payouts, isLoading } = usePendingPayouts();
    const approveMutation = useApprovePayout();

    const handleApprove = (id: number) => {
        approveMutation.mutate({ payoutId: id, approved: true });
    };

    const totalPending = payouts?.reduce((sum, p) => sum + p.total_amount, 0) || 0;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Payroll & Payouts</h1>
                        <p className="text-muted-foreground text-sm">Review and approve employee earnings</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="glass border-green-500/20">
                        <CardHeader className="pb-2">
                            <CardDescription>Total Pending</CardDescription>
                            <CardTitle className="text-2xl font-bold text-green-500">Ksh {totalPending.toLocaleString()}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <DollarSign className="w-3 h-3" />
                                Across {payouts?.length || 0} employees
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="glass mt-8">
                    <CardHeader>
                        <CardTitle>Pending Payouts</CardTitle>
                        <CardDescription>Earnings awaiting management approval</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : payouts?.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground italic">
                                All payouts have been processed.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Employee ID</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead>Fixed Amount</TableHead>
                                        <TableHead>Variable Amount</TableHead>
                                        <TableHead>Total Earnings</TableHead>
                                        <TableHead className="text-right pr-6">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payouts?.map((payout) => (
                                        <TableRow key={payout.id}>
                                            <TableCell className="pl-6 font-medium">#{payout.user_id}</TableCell>
                                            <TableCell className="text-xs">
                                                {new Date(payout.period_start).toLocaleDateString()} - {new Date(payout.period_end).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>Ksh {payout.fixed_amount.toLocaleString()}</TableCell>
                                            <TableCell>Ksh {payout.variable_amount.toLocaleString()}</TableCell>
                                            <TableCell className="font-bold text-foreground">Ksh {payout.total_amount.toLocaleString()}</TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                        onClick={() => approveMutation.mutate({ payoutId: payout.id, approved: false })}
                                                        disabled={approveMutation.isPending}
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                                                        onClick={() => handleApprove(payout.id)}
                                                        disabled={approveMutation.isPending}
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
