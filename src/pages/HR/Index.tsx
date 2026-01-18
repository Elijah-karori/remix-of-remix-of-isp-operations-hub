import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Users, UserCheck, UserPlus, FileText, Calendar, DollarSign, Activity, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmployees, usePendingPayouts, useComplaints } from "@/hooks/use-hr";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export default function HRIndex() {
    const { data: employees, isLoading: loadingEmps } = useEmployees({ limit: 5 });
    const { data: payouts, isLoading: loadingPayouts } = usePendingPayouts(5);
    const { data: complaints, isLoading: loadingComplaints } = useComplaints();

    const stats = [
        {
            title: "Total Employees",
            value: "42",
            change: "+2.5%",
            icon: Users,
            variant: "blue" as const,
        },
        {
            title: "Active Technicians",
            value: "18",
            change: "+12%",
            icon: UserCheck,
            variant: "green" as const,
        },
        {
            title: "Pending Payouts",
            value: payouts?.length.toString() || "0",
            change: "Action required",
            icon: DollarSign,
            variant: "orange" as const,
        },
        {
            title: "Open Complaints",
            value: complaints?.filter(c => c.status !== "Resolved").length.toString() || "0",
            change: "Critical",
            icon: MessageSquare,
            variant: "red" as const,
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground transition-all duration-300">
                            Human Resources
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Manage employees, payroll, and workforce performance
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button className="gradient-primary shadow-glow border-none">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add Employee
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <StatCard
                            key={stat.title}
                            {...stat}
                            className={`animate-slide-up`}
                            style={{ animationDelay: `${index * 100}ms` }}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Employees */}
                    <Card className="lg:col-span-2 glass border-muted/20">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Recent Employees</CardTitle>
                                <CardDescription>Latest additions to the workforce</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link to="/hr/employees">View All</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {loadingEmps ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {employees?.map((emp) => (
                                        <div key={emp.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/30 border border-muted/20 hover:bg-muted/50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {(emp.user?.full_name || emp.employee_code || "U").charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{emp.user?.full_name || emp.employee_code}</p>
                                                    <p className="text-xs text-muted-foreground">{emp.user?.email || "No email"}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-500">
                                                    {emp.engagement_type}
                                                </span>
                                                <p className="text-xs text-muted-foreground mt-1">Joined {new Date(emp.hire_date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions & Payouts */}
                    <div className="space-y-8">
                        <Card className="glass border-muted/20">
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-3">
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 group">
                                    <Calendar className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs">Attendance</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 group">
                                    <FileText className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs">Leave Req</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 group">
                                    <DollarSign className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs">Payroll</span>
                                </Button>
                                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 group" asChild>
                                    <Link to="/hr/complaints">
                                        <Activity className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-xs">Complaints</span>
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="glass border-muted/20">
                            <CardHeader>
                                <CardTitle>Pending Payouts</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {loadingPayouts ? (
                                    <Skeleton className="h-24 w-full" />
                                ) : payouts?.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8 italic">No pending payouts</p>
                                ) : (
                                    <div className="space-y-4">
                                        {payouts?.map(payout => (
                                            <div key={payout.id} className="flex items-center justify-between text-sm">
                                                <span>User #{payout.employee_id}</span>
                                                <span className="font-bold text-green-500">Ksh {Number(payout.net_amount).toLocaleString()}</span>
                                            </div>
                                        ))}
                                        <Button variant="link" className="w-full text-primary" asChild>
                                            <Link to="/hr/payroll">Handle All Payouts</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
