import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auditApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Calendar as CalendarIcon, Filter, FileText, RefreshCw, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface AuditLog {
  id: number;
  timestamp: string;
  action: string;
  resource: string;
  resource_id?: number;
  user_id: number;
  user_email?: string;
  ip_address?: string;
  details?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
}

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({ 
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
    to: new Date() 
  });
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const limit = 50;

  const { data: logs, isLoading, error, refetch } = useQuery<AuditLog[]>({
    queryKey: ['audit', 'logs', page, actionFilter, resourceFilter, searchTerm, dateRange],
    queryFn: async () => {
      const params: any = { skip: page * limit, limit };
      if (actionFilter && actionFilter !== 'all') params.action = actionFilter;
      if (resourceFilter && resourceFilter !== 'all') params.resource = resourceFilter;
      if (searchTerm) params.searchTerm = searchTerm;
      if (dateRange?.from) params.startDate = dateRange.from.toISOString();
      if (dateRange?.to) params.endDate = dateRange.to.toISOString();

      return auditApi.logs(params) as Promise<AuditLog[]>;
    },
    staleTime: 30000,
  });

  const { data: stats } = useQuery<any>({
    queryKey: ['audit', 'stats'],
    queryFn: () => auditApi.stats(7),
    staleTime: 60000,
  });

  const handleRefresh = () => {
    toast.info("Refreshing audit logs...");
    refetch(); // Trigger a refetch of the audit logs
  };

  const handleExport = async () => {
    try {
      toast.info("Exporting audit logs...");
      // In a real scenario, you would call your backend export endpoint with current filters
      const params: any = {};
      if (actionFilter && actionFilter !== 'all') params.action = actionFilter;
      if (resourceFilter && resourceFilter !== 'all') params.resource = resourceFilter;
      if (searchTerm) params.searchTerm = searchTerm;
      if (dateRange?.from) params.startDate = dateRange.from.toISOString();
      if (dateRange?.to) params.endDate = dateRange.to.toISOString();

      // Assuming auditApi.export can take filters
      const result = await auditApi.export('csv', params);
      console.log('Export result:', result);
      toast.success("Audit logs exported successfully!");
      // Optionally, trigger a download if the API returns a file directly
    } catch (err) {
      toast.error("Failed to export audit logs.");
      console.error('Export failed:', err);
    }
  };

  // Filter logs for display
  const logsArray = Array.isArray(logs) ? logs : [];
  const displayedLogs = logsArray.filter(log => {
    const matchesSearch = 
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address?.includes(searchTerm);
    
    const logDate = new Date(log.timestamp);
    const matchesDateRange = (!dateRange?.from || logDate >= dateRange.from) &&
                             (!dateRange?.to || logDate <= new Date(dateRange.to.getTime() + 24 * 60 * 60 * 1000)); // Include full 'to' day

    return matchesSearch && matchesDateRange;
  }) || [];

  const getActionColor = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'create':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'update':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'delete':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'login':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'logout':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout title="Audit Logs" subtitle="Track and monitor all system activities">
      <div className="space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Events (7d)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_events || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Create Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.create_count || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Update Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.update_count || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Delete Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.delete_count || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>System Audit Logs</CardTitle>
                <CardDescription>
                  Detailed records of all system activities and changes
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search logs..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                </SelectContent>
              </Select>
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="project">Projects</SelectItem>
                  <SelectItem value="task">Tasks</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-8 text-destructive">
                Failed to load audit logs. <Button variant="link" onClick={handleRefresh}>Retry</Button>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Resource</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead className="w-[100px]">Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayedLogs.length > 0 ? (
                        displayedLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                            </TableCell>
                            <TableCell>
                              <Badge className={getActionColor(log.action)}>
                                {log.action}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{log.resource}</span>
                              {log.resource_id && (
                                <span className="text-xs text-muted-foreground ml-1">#{log.resource_id}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{log.user_email || `User #${log.user_id}`}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{log.ip_address || '-'}</TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setSelectedLog(log)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                            No logs found matching your criteria
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {page + 1} • Showing {displayedLogs.length} results
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={page === 0}
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled={displayedLogs.length < limit}
                      onClick={() => setPage(p => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Log Details Dialog */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedLog(null)}>
            <div className="bg-background rounded-lg w-full max-w-2xl p-6 space-y-4 m-4" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium">Log Details</h3>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedLog.timestamp), 'PPpp')}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSelectedLog(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Action</h4>
                    <Badge className={getActionColor(selectedLog.action)}>
                      {selectedLog.action}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Resource</h4>
                    <p className="text-sm">{selectedLog.resource} #{selectedLog.resource_id}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">User</h4>
                    <p className="text-sm">{selectedLog.user_email || `User #${selectedLog.user_id}`}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">IP Address</h4>
                    <p className="text-sm">{selectedLog.ip_address || 'N/A'}</p>
                  </div>
                </div>

                {selectedLog.details && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Details</h4>
                    <p className="text-sm">{selectedLog.details}</p>
                  </div>
                )}
                
                {(selectedLog.old_values || selectedLog.new_values) && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Changes</h4>
                    <div className="bg-muted/50 p-4 rounded-md mt-1">
                      <pre className="text-sm overflow-auto max-h-60">
                        {JSON.stringify({ old: selectedLog.old_values, new: selectedLog.new_values }, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <Button onClick={() => setSelectedLog(null)}>Close</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}