import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEmployees } from "@/hooks/use-hr";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus, Search, Filter, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Employees() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data: employees, isLoading } = useEmployees({ limit: 100 });

    const filtered = employees?.filter(e =>
        (e.user?.full_name || e.employee_code || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Employee Directory</h1>
                    <Button className="gradient-primary">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Employee
                    </Button>
                </div>

                <Card className="glass">
                    <CardHeader className="pb-3 px-6 pt-6">
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name or email..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" size="icon">
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-6">Name</TableHead>
                                        <TableHead>Role / Type</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right pr-6">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered?.map((emp) => (
                                        <TableRow key={emp.id}>
                                            <TableCell className="pl-6 font-medium">{emp.user?.full_name || emp.employee_code}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="text-sm">{emp.engagement_type}</span>
                                                    <span className="text-xs text-muted-foreground uppercase">{emp.user?.phone_number || "No phone"}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{emp.user?.email || "No email"}</TableCell>
                                            <TableCell>
                                                <Badge variant={emp.is_active ? "default" : "secondary"}>
                                                    {emp.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
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
