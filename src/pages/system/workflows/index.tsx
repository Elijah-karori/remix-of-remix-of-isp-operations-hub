import { useCallback, useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const nodeTypes = {};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start' },
    position: { x: 250, y: 0 },
  },
  {
    id: '2',
    data: { label: 'Approval 1' },
    position: { x: 100, y: 100 },
  },
  {
    id: '3',
    data: { label: 'Approval 2' },
    position: { x: 400, y: 100 },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
];

export default function Workflows() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const addNode = () => {
    const newNode = {
      id: `${nodes.length + 1}`,
      data: { label: `Step ${nodes.length}` },
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Workflow Designer</h1>
        <div className="flex gap-2">
          <Button variant="outline">Save Workflow</Button>
          <Button>Publish</Button>
        </div>
      </div>
      
      <Card className="h-[600px]">
        <CardHeader>
          <CardTitle>Design your workflow</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-80px)]">
          <div className="h-full w-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
            >
              <Controls />
              <Background />
              <Panel position="top-right" className="flex gap-2">
                <Button size="sm" onClick={addNode} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Step
                </Button>
                <Button variant="outline" size="sm">
                  Add Approval
                </Button>
              </Panel>
            </ReactFlow>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
