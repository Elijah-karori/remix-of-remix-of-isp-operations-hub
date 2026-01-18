import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserOut, MilestoneOut, BudgetSummary, ProjectFinancialsOut } from '@/types/api';
import { Button } from '@/components/ui/button';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import { financeApi, projectsApi } from '@/lib/api'; // Import financeApi

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

  const { data: milestones, isLoading: isMilestonesLoading, error: milestonesError } = useQuery<MilestoneOut[], Error>({
    queryKey: ['projectMilestones', projectId],
    queryFn: () => projectsApi.getMilestones(projectId),
    enabled: !!projectId && !isNaN(projectId),
  });

  const handleCreateMilestone = () => {
    alert('Create Milestone functionality will be implemented here.');
  };

  const handleUpdateMilestone = (milestoneId: number) => {
    alert(`Update Milestone ${milestoneId} functionality will be implemented here.`);
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
                  <span>{project.budget ? project.budget.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'N/A'}</span>
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
                          <TableCell>{member.role?.name || 'N/A'}</TableCell>
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
                            <Button variant="outline" size="sm" onClick={() => handleUpdateMilestone(milestone.id)}>Edit</Button>
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
                      <span>{formatCurrency(budgetSummary.allocated_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spent:</span>
                      <span>{formatCurrency(budgetSummary.spent_amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Remaining:</span>
                      <span>{formatCurrency(budgetSummary.remaining_amount)}</span>
                    </div>
                     <div className="flex justify-between">
                      <span className="text-muted-foreground">Variance:</span>
                      <span>{formatCurrency(budgetSummary.variance)}</span>
                    </div>
                  </>
                )}

                {!isProjectFinancialsLoading && !projectFinancialsError && projectFinancials && (
                  <>
                    <Separator className="col-span-2 my-2" />
                    <h3 className="text-lg font-semibold col-span-2">Project Financials Overview</h3>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Budget:</span>
                      <span>{formatCurrency(projectFinancials.total_budget)}</span>
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
                    <pre className="col-span-2 text-sm bg-muted p-2 rounded">{JSON.stringify(costs, null, 2)}</pre>
                  </>
                )}

                {!isProfitabilityLoading && !profitabilityError && profitability && (
                  <>
                    <Separator className="col-span-2 my-2" />
                    <h3 className="text-lg font-semibold col-span-2">Profitability Analysis</h3>
                    {/* Assuming profitability object has properties to display */}
                    <pre className="col-span-2 text-sm bg-muted p-2 rounded">{JSON.stringify(profitability, null, 2)}</pre>
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
    </DashboardLayout>
  );
};

export default ProjectDetail;
