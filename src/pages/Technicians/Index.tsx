import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Wrench, Trophy, MapPin, Star, TrendingUp, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTechnicianLeaderboard, useCustomerSatisfaction } from "@/hooks/use-technicians";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export default function TechniciansIndex() {
    const { data: leaderboard, isLoading: loadingLeaderboard } = useTechnicianLeaderboard();
    const { data: satisfaction, isLoading: loadingSatisfaction } = useCustomerSatisfaction({ limit: 5 });

    const stats = [
        {
            title: "Active Technicians",
            value: "18",
            change: "On Duty",
            icon: CheckCircle2,
            variant: "green" as const,
        },
        {
            title: "Avg Satisfaction",
            value: "4.8",
            change: "/ 5.0",
            icon: Star,
            variant: "blue" as const,
        },
        {
            title: "Avg Altitude",
            value: "1,620m",
            change: "Optimal",
            icon: MapPin,
            variant: "orange" as const,
        },
        {
            title: "Efficiency",
            value: "94%",
            change: "+2.1%",
            icon: TrendingUp,
            variant: "purple" as const,
        },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8 animate-fade-in">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-muted-foreground">
                            Technician Management
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Field performance, tracking, and customer feedback
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="glass border-muted/20">
                            <MapPin className="w-4 h-4 mr-2" />
                            Live Tracking
                        </Button>
                        <Button className="gradient-primary shadow-glow border-none">
                            <Wrench className="w-4 h-4 mr-2" />
                            Assign Task
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <StatCard
                            key={stat.title}
                            {...stat}
                            className="animate-slide-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        />
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Leaderboard */}
                    <Card className="lg:col-span-2 glass border-muted/20">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Field Leaderboard</CardTitle>
                                <CardDescription>Top performing technicians this month</CardDescription>
                            </div>
                            <Trophy className="w-6 h-6 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            {loadingLeaderboard ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="absolute left-4 top-0 bottom-0 w-px bg-muted/20 -z-10" />
                                    <div className="space-y-4">
                                        {leaderboard?.map((tech, index) => (
                                            <div key={index} className="flex items-center bg-muted/20 border border-muted/20 p-4 rounded-xl hover:shadow-glow hover:border-primary/30 transition-all duration-300 group">
                                                <div className="w-8 h-8 rounded-full bg-background border border-muted/20 flex items-center justify-center font-bold text-xs mr-4 shadow-sm">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">Technician #{index + 101}</p>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                        <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" /> {tech.tasks_completed} Tasks</span>
                                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {tech.avg_resolution_time.toFixed(1)}h avg</span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-primary">{tech.weighted_score.toFixed(1)}k</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Satisfaction */}
                    <div className="space-y-8">
                        <Card className="glass border-muted/20">
                            <CardHeader>
                                <CardTitle>Customer Feedback</CardTitle>
                                <CardDescription>Recent service ratings</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {loadingSatisfaction ? (
                                    <Skeleton className="h-48 w-full" />
                                ) : (
                                    <div className="space-y-4">
                                        {satisfaction?.map((sat, i) => (
                                            <div key={i} className="space-y-2 pb-3 border-b border-muted/10 last:border-0 last:pb-0">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-medium">Task #{sat.task_id}</span>
                                                    <div className="flex items-center gap-0.5">
                                                        {[...Array(5)].map((_, starI) => (
                                                            <Star key={starI} className={cn("w-3 h-3", starI < sat.rating ? "text-yellow-500 fill-yellow-500" : "text-muted")} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground italic line-clamp-2">"{sat.feedback || "Professional service."}"</p>
                                            </div>
                                        ))}
                                        <Button variant="outline" className="w-full text-xs" asChild>
                                            <Link to="/technicians/feedback">View All Reviews</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="glass border-muted/20 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                <AlertCircle className="w-24 h-24" />
                            </div>
                            <CardHeader>
                                <CardTitle className="text-sm">Issues This Week</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-red-500">3</div>
                                <p className="text-xs text-muted-foreground mt-1">Critical unresolved field issues</p>
                                <Button variant="ghost" size="sm" className="mt-4 px-0 text-primary hover:bg-transparent">
                                    Review incidents <TrendingUp className="w-3 h-3 ml-1" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

// Helper needed for Star rendering
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(" ");
}

import { CheckSquare } from "lucide-react";
