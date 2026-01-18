import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { crmApi } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, RefreshCw, Pencil, Trash2, Eye, CalendarCheck, Phone, Mail, FileText } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { Activity } from '@/types/api';
import { format } from 'date-fns';
import { ActivityForm } from '@/components/crm/ActivityForm'; // Import ActivityForm
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'; // Import Dialog components
import { useDeleteActivity } from '@/hooks/use-crm'; // Import useDeleteActivity
import { toast } from 'sonner';

export default function Activities() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10); 
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | undefined>(undefined);

  const { data: activities, isLoading, error, refetch } = useQuery<Activity[]>({
    queryKey: ['crm', 'activities', page, limit],
    queryFn: () => crmApi.activities(page * limit, limit),
    staleTime: 5 * 60 * 1000,
  });

  const deleteActivityMutation = useDeleteActivity();

  const filteredActivities = activities?.filter(activity =>
    activity.activity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.status.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleRefresh = () => {
    refetch();
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setIsFormDialogOpen(true);
  };

  const handleDeleteActivity = async (activityId: number) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await deleteActivityMutation.mutateAsync(activityId);
        toast.success('Activity deleted successfully!');
      } catch (err: any) {
        toast.error(`Failed to delete activity: ${err.message || 'Unknown error'}`);
      }
    }
  };

  const handleViewActivity = (activity: Activity) => {
    console.log('View Activity:', activity);
    // Future: Implement a detailed view dialog/page
  };

  const handleLogActivity = () => {
    setEditingActivity(undefined);
    setIsFormDialogOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormDialogOpen(false);
    setEditingActivity(undefined);
    refetch();
  };

  const handleFormCancel = () => {
    setIsFormDialogOpen(false);
    setEditingActivity(undefined);
  };

  const getActivityIcon = (type: Activity['activity_type']) => {
    switch (type) {
      case 'Call': return <Phone className="h-4 w-4" />;
      case 'Meeting': return <CalendarCheck className="h-4 w-4" />;
      case 'Email': return <Mail className="h-4 w-4" />;
      case 'Task': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: Activity['status']) => {
    switch (status) {
      case 'Pending': return 'secondary';
      case 'Completed': return 'default';
      case 'Cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="CRM Activities" subtitle="Log and track customer interactions">
        <LoadingSkeleton />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="CRM Activities" subtitle="Log and track customer interactions">
        <ErrorState message="Failed to load activities" onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="CRM Activities" subtitle="Log and track customer interactions">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Activities</CardTitle>
                <CardDescription>
                  Log and manage customer interactions and tasks.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
                <Button size="sm" onClick={handleLogActivity}>
                  <Plus className="h-4 w-4 mr-2" /> Log Activity
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full mb-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Related Lead/Deal</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No activities found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-medium flex items-center gap-2">
                          {getActivityIcon(activity.activity_type)}
                          {activity.activity_type}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-[200px] truncate">{activity.notes || '-'}</TableCell>
                        <TableCell>{activity.due_date ? format(new Date(activity.due_date), 'MMM d, yyyy') : '-'}</TableCell>
                        <TableCell><Badge variant={getStatusVariant(activity.status)}>{activity.status}</Badge></TableCell>
                        <TableCell>
                          {activity.lead_id && <Badge variant="outline" className="mr-1">Lead: {activity.lead_id}</Badge>}
                          {activity.deal_id && <Badge variant="outline">Deal: {activity.deal_id}</Badge>}
                          {!activity.lead_id && !activity.deal_id && '-'}
                        </TableCell>
                        <TableCell>{format(new Date(activity.created_at), 'MMM d, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleViewActivity(activity)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleEditActivity(activity)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteActivity(activity.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Form Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingActivity ? 'Edit Activity' : 'Log New Activity'}</DialogTitle>
            <DialogDescription>
              {editingActivity ? 'Update the details for this activity.' : 'Fill in the details for a new activity.'}
            </DialogDescription>
          </DialogHeader>
          <ActivityForm
            initialData={editingActivity}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
