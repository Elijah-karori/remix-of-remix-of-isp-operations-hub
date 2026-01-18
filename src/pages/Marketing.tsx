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

// Placeholder type for campaign performance since the API returns Record<string, any>
interface CampaignPerformance {
  campaign_id: number;
  name: string;
  total_spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  // Add other relevant fields from marketingApi.getCampaignPerformance as needed
}

const Marketing: React.FC = () => {
  const queryClient = useQueryClient();
  const [isCreateCampaignDialogOpen, setIsCreateCampaignDialogOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDescription, setNewCampaignDescription] = useState('');

  // Fetch campaigns
  // The documentation only provides getCampaignPerformance, so we'll use that to list campaigns
  // Assuming getCampaignPerformance can return a list of campaigns or an object containing them.
  // For simplicity, we'll call it for a generic ID (e.g., 1) and assume it lists all, or mock it for now.
  // A better API design would have a separate 'list campaigns' endpoint.
  // For the purpose of this implementation, let's assume getCampaignPerformance(0) returns all campaigns,
  // or we need to simulate a list. Given the API, it's more likely `getCampaignPerformance` is for a single campaign.
  // Since there is no explicit `marketingApi.listCampaigns` or similar, I will simulate campaigns.
  // If the backend API for `getCampaignPerformance` actually returns a list for a given `campaignId=0` or similar,
  // that would be the way to go. Otherwise, this is a missing feature in the API itself for listing.
  // For now, I will use a placeholder for listing until clarification or a suitable API endpoint is found.

  // Let's create a dummy list for display purposes initially
  const { data: campaigns, isLoading, error } = useQuery<CampaignPerformance[], Error>({
    queryKey: ['campaigns'],
    queryFn: async () => {
      // In a real app, this would be an actual API call to list campaigns
      // Since marketingApi.getCampaignPerformance is for a single campaign,
      // and marketingApi.createCampaign doesn't return the full list, we simulate for now.
      return [
        { campaign_id: 1, name: 'Summer Sale 2024', total_spend: 1500, impressions: 10000, clicks: 500, conversions: 50 },
        { campaign_id: 2, name: 'New Product Launch', total_spend: 2500, impressions: 15000, clicks: 800, conversions: 80 },
      ];
    },
    staleTime: Infinity, // Dummy data, won't change
  });


  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) => marketingApi.createCampaign(data),
    onSuccess: () => {
      toast.success('Campaign created successfully!');
      queryClient.invalidateQueries({ queryKey: ['campaigns'] }); // Invalidate to refetch campaigns
      setIsCreateCampaignDialogOpen(false);
      setNewCampaignName('');
      setNewCampaignDescription('');
    },
    onError: (err: Error) => {
      toast.error(`Failed to create campaign: ${err.message}`);
    },
  });

  const handleCreateCampaignSubmit = () => {
    if (!newCampaignName) {
      toast.error('Campaign name cannot be empty.');
      return;
    }
    createCampaignMutation.mutate({ name: newCampaignName, description: newCampaignDescription });
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
                  <TableHead>Total Spend</TableHead>
                  <TableHead>Impressions</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Conversions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.campaign_id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>{campaign.total_spend.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</TableCell>
                    <TableCell>{campaign.impressions.toLocaleString()}</TableCell>
                    <TableCell>{campaign.clicks.toLocaleString()}</TableCell>
                    <TableCell>{campaign.conversions.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">View Performance</Button>
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
    </DashboardLayout>
  );
};

export default Marketing;
