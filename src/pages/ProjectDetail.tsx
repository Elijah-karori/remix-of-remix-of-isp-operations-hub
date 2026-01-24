import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MilestoneForm } from '@/components/projects/MilestoneForm'; // New import
import { ExclamationTriangleIcon, PlusCircledIcon } from '@radix-ui/react-icons';
import { financeApi } from '@/lib/api/finance';
import { projectsApi } from '@/lib/api/projects';
import { ProjectOut, UserOut, MilestoneOut, BudgetSummary, ProjectFinancialsOut } from '@/types/api';
import { useMilestones } from '@/hooks/use-projects'; // New import for milestones

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = parseInt(id || '', 10);

  const { data: project, isLoading, error } = useQuery<ProjectOut, Error>({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.get(projectId),
    enabled: !!projectId && !isNaN(projectId),
  });

  const { data: team, isLoading: isTeamLoading, error: teamError } = useQuery<UserOut[], Error>({
    queryKey: ['projectTeam', projectId],
    queryFn: () => projectsApi.getTeam(projectId),
    enabled: !!projectId && !isNaN(projectId),
  });

  const { data: milestones, isLoading: isMilestonesLoading, error: milestonesError, refetch: refetchMilestones } = useMilestones(projectId);

  // States for milestone dialogs
  const [isCreateMilestoneDialogOpen, setIsCreateMilestoneDialogOpen] = useState(false);
  const [isEditMilestoneDialogOpen, setIsEditMilestoneDialogOpen] = useState(false);
  const [milestoneToEdit, setMilestoneToEdit] = useState<MilestoneOut | null>(null);

  // Financials hooks
  const { data: budgetSummary, isLoading: isBudgetSummaryLoading, error: budgetSummaryError } = useQuery<BudgetSummary, Error>({
    queryKey: ['projectBudgetSummary', projectId],
    queryFn: () => financeApi.projectBudgetSummary(projectId),
    enabled: !!projectId && !isNaN(projectId),
  });

  const { data: projectFinancials, isLoading: isProjectFinancialsLoading, error: projectFinancialsError } = useQuery<ProjectFinancialsOut, Error>({
    queryKey: ['projectFinancials', projectId],
    queryFn: () => financeApi.projectFinancials(projectId),
    enabled: !!projectId && !isNaN(projectId),
  });

  const { data: costs, isLoading: isCostsLoading, error: costsError } = useQuery<any, Error>({
    queryKey: ['projectCosts', projectId],
    queryFn: () => financeApi.trackProjectCosts(projectId),
    enabled: !!projectId && !isNaN(projectId),
  });

  const { data: profitability, isLoading: isProfitabilityLoading, error: profitabilityError } = useQuery<any, Error>({
    queryKey: ['projectProfitability', projectId],
    queryFn: () => financeApi.projectProfitability(projectId),
    enabled: !!projectId && !isNaN(projectId),
  });

  const handleCreateMilestone = () => {
    setMilestoneToEdit(null);
    setIsCreateMilestoneDialogOpen(true);
  };

  const handleEditMilestone = (milestone: MilestoneOut) => {
    setMilestoneToEdit(milestone);
    setIsEditMilestoneDialogOpen(true);
  };

  const handleMilestoneSuccess = () => {
    refetchMilestones();
    setIsCreateMilestoneDialogOpen(false);
    setIsEditMilestoneDialogOpen(false);
  };

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null) return "N/A";
    return `KES ${amount.toLocaleString()}`;
  };

  if (isNaN(projectId)) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Invalid project ID provided.</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

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
          <AlertDescription>Failed to load project: {error.message}</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <Alert>
          <AlertTitle>Project Not Found</AlertTitle>
          <AlertDescription>The requested project could not be found.</AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
          <Badge variant={
            project.status === 'Completed' ? 'success' :
            project.status === 'In Progress' ? 'info' :
            project.status === 'Pending' ? 'warning' : 'default'
          }>{project.status}</Badge>
        </div>
        <Separator />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Key information about the project.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span>{project.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span>{project.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Infrastructure Type:</span>
                  <span>{project.infrastructure_type || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span>{project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">End Date:</span>
                  <span>{project.end_date ? new Date(project.end_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Budget:</span>
                  <span>{project.budget ? formatCurrency(parseFloat(project.budget)) : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Completion:</span>
                  <span>{project.completion_percentage ? `${project.completion_percentage}%` : 'N/A'}</span>
                </div>
                 <div className="flex justify-between">
                  <span className="text-muted-foreground">Health Score:</span>
                  <span>{project.health_score ? `${project.health_score}%` : 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Project Team</CardTitle>
                <CardDescription>Manage members assigned to this project.</CardDescription>
              </CardHeader>
              <CardContent>
                {isTeamLoading && (
                  <div className="flex justify-center items-center">
                    <LoadingSpinner />
                  </div>
                )}
                {teamError && (
                  <Alert variant="destructive">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Failed to load team: {teamError.message}</AlertDescription>
                  </Alert>
                )}
                {!isTeamLoading && !teamError && team && team.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {team.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.full_name}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>{member.roles?.[0]?.name || 'N/A'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  !isTeamLoading && !teamError && <p className="text-muted-foreground">No team members assigned.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="milestones">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-bold">Project Milestones</CardTitle>
                <Button size="sm" onClick={handleCreateMilestone}>
                  <PlusCircledIcon className="mr-2 h-4 w-4" /> Add Milestone
                </Button>
              </CardHeader>
              <CardDescription>Track key milestones and progress.</CardDescription>
              <CardContent>
                {isMilestonesLoading && (
                  <div className="flex justify-center items-center">
                    <LoadingSpinner />
                  </div>
                )}
                {milestonesError && (
                  <Alert variant="destructive">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Failed to load milestones: {milestonesError.message}</AlertDescription>
                  </Alert>
                )}
                {!isMilestonesLoading && !milestonesError && milestones && milestones.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {milestones.map((milestone) => (
                        <TableRow key={milestone.id}>
                          <TableCell>{milestone.name}</TableCell>
                          <TableCell>{milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell>{milestone.status}</TableCell>
                          <TableCell>{milestone.progress}%</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => handleEditMilestone(milestone)}>Edit</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  !isMilestonesLoading && !milestonesError && <p className="text-muted-foreground">No milestones found.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financials">
            <Card>
              <CardHeader>
                <CardTitle>Project Financials</CardTitle>
                <CardDescription>Budget, costs, and profitability analysis.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                {(isBudgetSummaryLoading || isProjectFinancialsLoading || isCostsLoading || isProfitabilityLoading) && (
                  <div className="flex justify-center items-center col-span-2">
                    <LoadingSpinner />
                  </div>
                )}
                {(budgetSummaryError || projectFinancialsError || costsError || profitabilityError) && (
                  <Alert variant="destructive" className="col-span-2">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      Failed to load financial data:{" "}
                      {budgetSummaryError?.message || projectFinancialsError?.message || costsError?.message || profitabilityError?.message}
                    </AlertDescription>
                  </Alert>
                )}

                {!isBudgetSummaryLoading && !budgetSummaryError && budgetSummary && (
                  <>
                    <h3 className="text-lg font-semibold col-span-2">Budget Summary</h3>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Budget:</span>
                      <span>{formatCurrency(budgetSummary.total_budget)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Allocated:</span>
                      <span>{formatCurrency(budgetSummary.total_allocated)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spent:</span>
                      <span>{formatCurrency(budgetSummary.total_spent)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Remaining:</span>
                      <span>{formatCurrency(budgetSummary.remaining)}</span>
                    </div>
                  </>
                )}

                {!isProjectFinancialsLoading && !projectFinancialsError && projectFinancials && (
                  <>
                    <Separator className="col-span-2 my-2" />
                    <h3 className="text-lg font-semibold col-span-2">Project Financials Overview</h3>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Revenue:</span>
                      <span>{formatCurrency(projectFinancials.total_revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Cost:</span>
                      <span>{formatCurrency(projectFinancials.total_cost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gross Profit:</span>
                      <span>{formatCurrency(projectFinancials.gross_profit)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profit Margin:</span>
                      <span>{projectFinancials.profit_margin ? `${(projectFinancials.profit_margin * 100).toFixed(2)}%` : 'N/A'}</span>
                    </div>
                  </>
                )}

                {!isCostsLoading && !costsError && costs && (
                  <>
                    <Separator className="col-span-2 my-2" />
                    <h3 className="text-lg font-semibold col-span-2">Current Costs</h3>
                    {/* Assuming costs object has properties to display */}
                    <div className="grid grid-cols-2 gap-2 col-span-2">
                        {Object.entries(costs).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                                <span className="text-muted-foreground">{key.replace(/_/g, ' ')}:</span>
                                <span>{typeof value === 'number' ? formatCurrency(value) : String(value)}</span>
                            </div>
                        ))}
                    </div>
                  </>
                )}

                {!isProfitabilityLoading && !profitabilityError && profitability && (
                  <>
                    <Separator className="col-span-2 my-2" />
                    <h3 className="text-lg font-semibold col-span-2">Profitability Analysis</h3>
                    {/* Assuming profitability object has properties to display */}
                     <div className="grid grid-cols-2 gap-2 col-span-2">
                        {Object.entries(profitability).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                                <span className="text-muted-foreground">{key.replace(/_/g, ' ')}:</span>
                                <span>{typeof value === 'number' ? formatCurrency(value) : String(value)}</span>
                            </div>
                        ))}
                    </div>
                  </>
                )}

                {!budgetSummary && !projectFinancials && !costs && !profitability &&
                  !isBudgetSummaryLoading && !isProjectFinancialsLoading && !isCostsLoading && !isProfitabilityLoading &&
                  !budgetSummaryError && !projectFinancialsError && !costsError && !profitabilityError && (
                    <p className="text-muted-foreground col-span-2">No financial data available for this project.</p>
                  )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Milestone Dialog */}
      <Dialog open={isCreateMilestoneDialogOpen} onOpenChange={setIsCreateMilestoneDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Milestone</DialogTitle>
            <DialogDescription>
              Create a new milestone for this project.
            </DialogDescription>
          </DialogHeader>
          <MilestoneForm projectId={projectId} onSuccess={handleMilestoneSuccess} onCancel={() => setIsCreateMilestoneDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit Milestone Dialog */}
      <Dialog open={isEditMilestoneDialogOpen} onOpenChange={setIsEditMilestoneDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Milestone</DialogTitle>
            <DialogDescription>
              Make changes to the milestone details.
            </DialogDescription>
          </DialogHeader>
          {milestoneToEdit && (
            <MilestoneForm projectId={projectId} initialData={milestoneToEdit} onSuccess={handleMilestoneSuccess} onCancel={() => setIsEditMilestoneDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ProjectDetail;