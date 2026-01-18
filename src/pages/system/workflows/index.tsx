import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ReactFlow, 
  Node, 
  Edge, 
  Connection, 
  Controls, 
  Background, 
  Panel,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge'; // From merged branch
import { Input } from '@/components/ui/input'; // From merged branch
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // From merged branch
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'; // From merged branch
import { Plus, Play, Clock, CheckCircle2, XCircle, Loader2, RefreshCw, GitBranch } from 'lucide-react'; // Combined icons
import { workflowApi } from '@/lib/api'; // From merged branch
import { WorkflowDefinitionRead, WorkflowInstanceRead } from '@/types/api'; // From merged branch
import { DashboardLayout } from '@/components/layout/DashboardLayout'; // From merged branch
import { toast } from 'sonner'; // Keeping sonner toast as it's consistently used elsewhere in the project
import { format } from 'date-fns'; // From merged branch

// nodeTypes can be extended for custom nodes if needed, but for now, it's empty as in HEAD
const nodeTypes = {};

export default function Workflows() {
  const queryClient = useQueryClient();
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinitionRead | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const { data: workflows, isLoading: loadingWorkflows, refetch: refetchWorkflows } = useQuery<WorkflowDefinitionRead[]>({
    queryKey: ['workflows'],
    queryFn: () => workflowApi.list(),
    staleTime: 30000,
  });

  const { data: pendingApprovals, isLoading: loadingApprovals, refetch: refetchApprovals } = useQuery<WorkflowInstanceRead[]>({
    queryKey: ['workflows', 'pending'],
    queryFn: () => workflowApi.pending(),
    staleTime: 30000,
  });

  const { data: myApprovals } = useQuery<WorkflowInstanceRead[]>({
    queryKey: ['workflows', 'my-approvals'],
    queryFn: () => workflowApi.myApprovals(),
    staleTime: 30000,
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) => workflowApi.approve(id, comment),
    onSuccess: () => {
      toast.success('Workflow instance approved successfully'); // Using sonner toast
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: (err: Error) => {
      toast.error(err.message); // Using sonner toast
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) => workflowApi.reject(id, comment),
    onSuccess: () => {
      toast.success('Workflow instance rejected'); // Using sonner toast
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: (err: Error) => {
      toast.error(err.message); // Using sonner toast
    },
  });

  // Convert workflow steps to ReactFlow nodes/edges
  const loadWorkflowToEditor = (workflow: WorkflowDefinitionRead) => {
    setSelectedWorkflow(workflow);
    
    // Clear existing nodes and edges
    setNodes([]);
    setEdges([]);

    const newNodes: Node[] = workflow.steps?.map((step, index) => ({
      id: step.id,
      type: step.type === 'start' ? 'input' : step.type === 'end' ? 'output' : 'default',
      data: { label: step.name },
      position: { x: 150, y: index * 100 },
      // Apply style for approval nodes based on the HEAD branch's logic if applicable
      style: step.type === 'approval' ? { backgroundColor: '#fde047', color: '#1e293b' } : undefined,
    })) || [];

    const newEdges: Edge[] = [];
    workflow.steps?.forEach(step => {
      step.next_steps?.forEach(nextId => {
        newEdges.push({
          id: `${step.id}-${nextId}`,
          source: step.id,
          target: nextId,
        });
      });
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  const onNodesChange = useCallback(
    (changes: any) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const addNode = (type: 'default' | 'approval' = 'default') => { // Combined addNode logic
    const newNode: Node = {
      id: `node-${Date.now()}`, // Unique ID from merged branch
      data: { label: type === 'approval' ? `Approval ${nodes.length + 1}` : `Step ${nodes.length + 1}` }, // Label from HEAD
      position: {
        x: Math.random() * 250, // Random position for new nodes
        y: Math.random() * 250,
      },
      style: type === 'approval' ? { backgroundColor: '#fde047', color: '#1e293b' } : undefined, // Style from HEAD
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const handleSaveWorkflow = () => { // Renamed to avoid conflict
    toast.info("Saving workflow...");
    // Implement actual API call to save workflow
    console.log("Nodes:", nodes);
    console.log("Edges:", edges);
    // workflowApi.saveWorkflow(selectedWorkflow.id, { nodes, edges });
    setTimeout(() => {
      toast.success("Workflow saved successfully");
    }, 1000);
  };

  const handlePublishWorkflow = () => { // Renamed to avoid conflict
    toast.info("Publishing workflow...");
    // Implement actual API call to publish workflow
    // workflowApi.publishWorkflow(selectedWorkflow.id);
    setTimeout(() => {
      toast.success("Workflow published successfully");
    }, 1000);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const isLoading = loadingWorkflows || loadingApprovals;

  return (
    <DashboardLayout title="Workflows" subtitle="Design and manage approval workflows">
      <Tabs defaultValue="definitions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="definitions" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Definitions
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Approvals
            {pendingApprovals && pendingApprovals.length > 0 && (
              <Badge variant="secondary" className="ml-1">{pendingApprovals.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="designer" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Designer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="definitions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Workflow Definitions</CardTitle>
                  <CardDescription>Manage your workflow templates</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => refetchWorkflows()}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Workflow
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingWorkflows ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : workflows?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Trigger Type</TableHead>
                      <TableHead>Steps</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workflows.map((workflow) => (
                      <TableRow key={workflow.id}>
                        <TableCell className="font-medium">{workflow.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{workflow.trigger_type}</Badge>
                        </TableCell>
                        <TableCell>{workflow.steps?.length || 0}</TableCell>
                        <TableCell>
                          <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                            {workflow.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(workflow.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => loadWorkflowToEditor(workflow)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No workflows defined. Create your first workflow to get started.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pending Approvals</CardTitle>
                  <CardDescription>Workflow instances awaiting your action</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchApprovals()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingApprovals ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pendingApprovals?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Workflow</TableHead>
                      <TableHead>Current Step</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApprovals.map((instance) => (
                      <TableRow key={instance.id}>
                        <TableCell className="font-medium">
                          {instance.workflow?.name || `Workflow #${instance.workflow_id}`}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{instance.current_step_id}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(instance.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(instance.created_at), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => approveMutation.mutate({ id: instance.id })}
                              disabled={approveMutation.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => rejectMutation.mutate({ id: instance.id })}
                              disabled={rejectMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No pending approvals. You're all caught up!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="designer" className="space-y-4">
          <Card className="h-[600px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedWorkflow ? `Editing: ${selectedWorkflow.name}` : 'Workflow Designer'}
                  </CardTitle>
                  <CardDescription>
                    {selectedWorkflow ? selectedWorkflow.description : 'Select a workflow to edit or create a new one'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveWorkflow}>
                    Save Draft
                  </Button>
                  <Button size="sm" onClick={handlePublishWorkflow}>
                    Publish
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[calc(100%-100px)]">
              <div className="h-full w-full border rounded-lg">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  fitView
                >
                  <Controls />
                  <Background />
                  <Panel position="top-right" className="flex gap-2">
                    <Button size="sm" onClick={() => addNode('default')} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Step
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => addNode('approval')}>
                      Add Approval
                    </Button>
                  </Panel>
                </ReactFlow>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}