import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketingApi } from '@/lib/api';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useCampaigns, useCreateCampaign } from '@/hooks/use-marketing'; // Use new hooks
import { CampaignPerformanceDialog } from '@/components/marketing/CampaignPerformanceDialog'; // Import dialog

const Marketing: React.FC = () => {
  const queryClient = useQueryClient(); // Still need queryClient for invalidation
  const [isCreateCampaignDialogOpen, setIsCreateCampaignDialogOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDescription, setNewCampaignDescription] = useState('');
  const [isViewPerformanceDialogOpen, setIsViewPerformanceDialogOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

  // Use the new useCampaigns hook for listing
  const { data: campaigns, isLoading, error } = useCampaigns();
  const createCampaignMutation = useCreateCampaign(); // Use the new create campaign hook

  const handleCreateCampaignSubmit = () => {
    if (!newCampaignName) {
      toast.error('Campaign name cannot be empty.');
      return;
    }
    createCampaignMutation.mutate({ name: newCampaignName, description: newCampaignDescription });
  };

  const handleViewPerformance = (campaignId: number) => {
    setSelectedCampaignId(campaignId);
    setIsViewPerformanceDialogOpen(true);
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
          <AlertDescription>Failed to load campaigns: {error.message}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Marketing Campaigns" subtitle="Manage and track your marketing initiatives.">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Your Campaigns</CardTitle>
          <Button size="sm" onClick={() => setIsCreateCampaignDialogOpen(true)}>
            <PlusCircledIcon className="mr-2 h-4 w-4" /> Create New Campaign
          </Button>
        </CardHeader>
        <CardContent>
          {campaigns && campaigns.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>{campaign.description || 'N/A'}</TableCell>
                    <TableCell>{campaign.status || 'N/A'}</TableCell>
                    <TableCell>{campaign.budget?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || 'N/A'}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleViewPerformance(campaign.id)}>View Performance</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No marketing campaigns found. Click "Create New Campaign" to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Campaign Dialog */}
      <Dialog open={isCreateCampaignDialogOpen} onOpenChange={setIsCreateCampaignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Fill in the details for your new marketing campaign.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="campaignName" className="text-right">
                Name
              </Label>
              <Input
                id="campaignName"
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="campaignDescription" className="text-right">
                Description
              </Label>
              <Textarea
                id="campaignDescription"
                value={newCampaignDescription}
                onChange={(e) => setNewCampaignDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateCampaignDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCampaignSubmit}
              disabled={createCampaignMutation.isPending}
            >
              {createCampaignMutation.isPending && <LoadingSpinner className="mr-2" />}
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Campaign Performance Dialog */}
      <CampaignPerformanceDialog
        campaignId={selectedCampaignId}
        isOpen={isViewPerformanceDialogOpen}
        onClose={() => setIsViewPerformanceDialogOpen(false)}
      />
    </DashboardLayout>
  );
};

export default Marketing;