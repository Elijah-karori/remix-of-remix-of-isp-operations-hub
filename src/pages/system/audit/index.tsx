import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Download, Calendar as CalendarIcon, Filter, FileText, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  details: string;
  status: 'success' | 'failed' | 'warning';
}

const generateMockLogs = (count: number): AuditLog[] => {
  const actions = [
    'User Login',
    'Permission Updated',
    'User Created',
    'Settings Updated',
    'Password Changed',
    'Role Assigned',
    'Data Exported'
  ];
  
  const statuses: ('success' | 'failed' | 'warning')[] = ['success', 'failed', 'warning'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `log-${i + 1}`,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    action: actions[Math.floor(Math.random() * actions.length)],
    userId: `user-${Math.floor(Math.random() * 10) + 1}`,
    userEmail: `user${Math.floor(Math.random() * 10) + 1}@example.com`,
    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
    details: 'Action performed successfully',
    status: statuses[Math.floor(Math.random() * statuses.length)]
  }));
};

export default function AuditLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date | null; to: Date | null }>({ 
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 
    to: new Date() 
  });
  const [logs, setLogs] = useState<AuditLog[]>(() => generateMockLogs(50));
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const handleRefresh = () => {
    toast.info("Refreshing audit logs...");
    setLogs(generateMockLogs(50));
  };
  
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (dateRange.from && dateRange.to) {
      const logDate = new Date(log.timestamp);
      return matchesSearch && 
             logDate >= dateRange.from && 
             logDate <= new Date(dateRange.to.getTime() + 24 * 60 * 60 * 1000);
    }
    
    return matchesSearch;
  });

  const exportToCSV = () => {
    toast.info("Exporting logs to CSV...");
    const headers = "id,timestamp,action,userId,userEmail,ipAddress,details,status\n";
    const csvContent = filteredLogs.map(log => 
      `${log.id},${log.timestamp.toISOString()},"${log.action}","${log.userId}","${log.userEmail}","${log.ipAddress}","${log.details}","${log.status}"`
    ).join("\n");

    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "audit-logs.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground">
            Track and monitor all system activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>System Audit Logs</CardTitle>
              <CardDescription>
                Detailed records of all system activities and changes
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
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
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{log.userEmail}</span>
                          <span className="text-xs text-muted-foreground">{log.userId}</span>
                        </div>
                      </TableCell>
                      <TableCell>{log.ipAddress}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                          {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setSelectedLog(log)}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">View Details</span>
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
              Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(10, filteredLogs.length)}</span> of{' '}
              <span className="font-medium">{filteredLogs.length}</span> results
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg w-full max-w-2xl p-6 space-y-4">
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
              <div>
                <h4 className="font-medium">Action</h4>
                <p className="text-sm">{selectedLog.action}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">User</h4>
                  <p className="text-sm">{selectedLog.userEmail}</p>
                  <p className="text-xs text-muted-foreground">{selectedLog.userId}</p>
                </div>
                <div>
                  <h4 className="font-medium">IP Address</h4>
                  <p className="text-sm">{selectedLog.ipAddress}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium">Status</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLog.status)}`}>
                  {selectedLog.status.charAt(0).toUpperCase() + selectedLog.status.slice(1)}
                </span>
              </div>
              
              <div>
                <h4 className="font-medium">Details</h4>
                <div className="bg-muted/50 p-4 rounded-md mt-1">
                  <pre className="text-sm overflow-auto max-h-60">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setSelectedLog(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}