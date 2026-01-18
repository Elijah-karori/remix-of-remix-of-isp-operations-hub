import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hrApi } from '@/lib/api';
import { ComplaintResponse, ComplaintCreate } from '@/types/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircledIcon, EyeOpenIcon } from '@radix-ui/react-icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';

const HRComplaints: React.FC = () => {
  const queryClient = useQueryClient();
  const [isRecordComplaintDialogOpen, setIsRecordComplaintDialogOpen] = useState(false);
  const [newComplaintSubject, setNewComplaintSubject] = useState('');
  const [newComplaintDescription, setNewComplaintDescription] = useState('');
  const [newComplainantName, setNewComplainantName] = useState('');
  const [newComplainantContact, setNewComplainantContact] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintResponse | null>(null);
  const [isViewComplaintDialogOpen, setIsViewComplaintDialogOpen] = useState(false);
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [isInvestigating, setIsInvestigating] = useState(false);


  const { data: complaints, isLoading, error } = useQuery<ComplaintResponse[], Error>({
    queryKey: ['hrComplaints'],
    queryFn: () => hrApi.listComplaints(),
  });

  const recordComplaintMutation = useMutation({
    mutationFn: (data: ComplaintCreate) => hrApi.recordComplaint(data),
    onSuccess: () => {
      toast.success('Complaint recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['hrComplaints'] });
      setIsRecordComplaintDialogOpen(false);
      setNewComplaintSubject('');
      setNewComplaintDescription('');
      setNewComplainantName('');
      setNewComplainantContact('');
    },
    onError: (err: Error) => {
      toast.error(`Failed to record complaint: ${err.message}`);
    },
  });

  const investigateComplaintMutation = useMutation({
    mutationFn: ({ id, isValid, notes, resolution }: { id: number; isValid: boolean; notes: string; resolution?: string }) =>
      hrApi.investigateComplaint(id, isValid, notes, resolution),
    onSuccess: () => {
      toast.success('Complaint investigated successfully!');
      queryClient.invalidateQueries({ queryKey: ['hrComplaints'] });
      setIsViewComplaintDialogOpen(false);
      setSelectedComplaint(null);
      setInvestigationNotes('');
      setIsInvestigating(false);
    },
    onError: (err: Error) => {
      toast.error(`Failed to investigate complaint: ${err.message}`);
      setIsInvestigating(false);
    },
  });

  const handleRecordComplaintSubmit = () => {
    if (!newComplaintSubject || !newComplaintDescription) {
      toast.error('Subject and Description are required.');
      return;
    }
    recordComplaintMutation.mutate({
      subject: newComplaintSubject,
      description: newComplaintDescription,
      complainant_name: newComplainantName || undefined,
      complainant_contact: newComplainantContact || undefined,
    });
  };

  const handleInvestigateSubmit = (isValid: boolean) => {
    if (!selectedComplaint) return;
    setIsInvestigating(true);
    investigateComplaintMutation.mutate({
      id: selectedComplaint.id,
      isValid,
      notes: investigationNotes,
      resolution: isValid ? 'Resolved' : undefined,
    });
  };

  const openViewComplaintDialog = (complaint: ComplaintResponse) => {
    setSelectedComplaint(complaint);
    setInvestigationNotes(complaint.resolution || ''); // Pre-fill if already resolved/investigated
    setIsViewComplaintDialogOpen(true);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Failed to load complaints: {error.message}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="HR Complaints" subtitle="Manage employee complaints and investigations.">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">All Complaints</CardTitle>
          <Button size="sm" onClick={() => setIsRecordComplaintDialogOpen(true)}>
            <PlusCircledIcon className="mr-2 h-4 w-4" /> Record New Complaint
          </Button>
        </CardHeader>
        <CardContent>
          {complaints && complaints.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Complainant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Recorded</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell className="font-medium">{complaint.subject}</TableCell>
                    <TableCell>{complaint.complainant_name || 'N/A'}</TableCell>
                    <TableCell>{complaint.status}</TableCell>
                    <TableCell>{format(new Date(complaint.created_at), 'MMM d, yyyy HH:mm')}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => openViewComplaintDialog(complaint)}>
                        <EyeOpenIcon className="mr-2 h-4 w-4" /> View / Investigate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No HR complaints recorded.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record New Complaint Dialog */}
      <Dialog open={isRecordComplaintDialogOpen} onOpenChange={setIsRecordComplaintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record New Complaint</DialogTitle>
            <DialogDescription>
              Enter the details of the complaint.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject
              </Label>
              <Input
                id="subject"
                value={newComplaintSubject}
                onChange={(e) => setNewComplaintSubject(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newComplaintDescription}
                onChange={(e) => setNewComplaintDescription(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="complainantName" className="text-right">
                Complainant Name
              </Label>
              <Input
                id="complainantName"
                value={newComplainantName}
                onChange={(e) => setNewComplainantName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="complainantContact" className="text-right">
                Complainant Contact
              </Label>
              <Input
                id="complainantContact"
                value={newComplainantContact}
                onChange={(e) => setNewComplainantContact(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRecordComplaintDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRecordComplaintSubmit}
              disabled={recordComplaintMutation.isPending}
            >
              {recordComplaintMutation.isPending && <LoadingSpinner className="mr-2" />}
              Record Complaint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Investigate Complaint Dialog */}
      <Dialog open={isViewComplaintDialogOpen} onOpenChange={setIsViewComplaintDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
            <DialogDescription>
              Review and investigate the selected complaint.
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="grid gap-4 py-4">
              <div>
                <Label className="text-muted-foreground">Subject:</Label>
                <p className="font-medium">{selectedComplaint.subject}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Description:</Label>
                <p>{selectedComplaint.description}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Complainant Name:</Label>
                <p>{selectedComplaint.complainant_name || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status:</Label>
                <p>{selectedComplaint.status}</p>
              </div>
              <div>
                <Label htmlFor="investigationNotes" className="text-muted-foreground">Investigation Notes / Resolution:</Label>
                <Textarea
                  id="investigationNotes"
                  value={investigationNotes}
                  onChange={(e) => setInvestigationNotes(e.target.value)}
                  placeholder="Enter investigation notes or resolution..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewComplaintDialogOpen(false)}
            >
              Close
            </Button>
            {selectedComplaint?.status === 'Pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => handleInvestigateSubmit(false)}
                  disabled={isInvestigating}
                >
                  {isInvestigating && <LoadingSpinner className="mr-2" />}
                  Mark Invalid / Reject
                </Button>
                <Button
                  onClick={() => handleInvestigateSubmit(true)}
                  disabled={isInvestigating}
                >
                  {isInvestigating && <LoadingSpinner className="mr-2" />}
                  Mark Valid / Resolve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default HRComplaints;
