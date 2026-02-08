import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    Node,
    Edge,
    Connection,
    addEdge,
    NodeChange,
    EdgeChange,
    applyNodeChanges,
    applyEdgeChanges,
} from 'reactflow';
import 'reactflow/dist/style.css';
import Button from '@/Components/UI/Button';
import { Badge } from '@/Components/UI/Badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface NodeItem {
    id: number;
    type: string;
    config: any;
    sort_order: number;
    pos_x?: number | null;
    pos_y?: number | null;
}

interface EdgeItem {
    id: number;
    from_node_id: number;
    to_node_id: number;
    label?: string | null;
    sort_order?: number | null;
}

interface FlowItem {
    id: number;
    name: string;
    trigger: any;
    enabled: boolean;
    priority: number;
    nodes: NodeItem[];
    edges: EdgeItem[];
}

export default function FlowBuilder({
    flow,
    onEditNode,
    onAddNode,
    onDeleteNode,
    onSelectEdge,
    onSaveGraph,
}: {
    flow: FlowItem;
    onEditNode: (node: NodeItem) => void;
    onAddNode: () => void;
    onDeleteNode: (nodeId: number) => void;
    onSelectEdge: (edge: EdgeItem) => void;
    onSaveGraph: (payload: { nodes: NodeItem[]; edges: EdgeItem[] }) => void;
}) {
    const initialNodes: Node[] = useMemo(() => {
        return (flow.nodes || []).map((node) => ({
            id: String(node.id),
            position: {
                x: node.pos_x ?? node.sort_order * 180,
                y: node.pos_y ?? 120,
            },
            data: {
                label: `${node.type}${node.config?.is_start ? ' (start)' : ''}`,
                meta: node,
            },
            style: {
                borderRadius: 12,
                border: '1px solid #E2E8F0',
                padding: 12,
                background: '#fff',
                minWidth: 140,
            },
        }));
    }, [flow.nodes]);

    const initialEdges: Edge[] = useMemo(() => {
        return (flow.edges || []).map((edge) => ({
            id: String(edge.id),
            source: String(edge.from_node_id),
            target: String(edge.to_node_id),
            label: edge.label || 'next',
            animated: edge.label === 'true' || edge.label === 'false',
            style: { stroke: '#6366F1' },
        }));
    }, [flow.edges]);

    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>(initialEdges);

    useEffect(() => {
        setNodes(initialNodes);
    }, [initialNodes]);

    useEffect(() => {
        setEdges(initialEdges);
    }, [initialEdges]);

    const onNodesChange = useCallback((changes: NodeChange[]) => {
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);

    const onEdgesChange = useCallback((changes: EdgeChange[]) => {
        setEdges((eds) => applyEdgeChanges(changes, eds));
    }, []);

    const onConnect = useCallback((connection: Connection) => {
        setEdges((eds) =>
            addEdge(
                {
                    ...connection,
                    id: `temp-${Date.now()}`,
                    label: 'next',
                    style: { stroke: '#6366F1' },
                },
                eds
            )
        );
    }, []);

    const handleSaveGraph = () => {
        const nodePayload: NodeItem[] = nodes.map((node, index) => {
            const meta = node.data?.meta as NodeItem;
            return {
                ...meta,
                sort_order: meta?.sort_order ?? index + 1,
                pos_x: Math.round(node.position.x),
                pos_y: Math.round(node.position.y),
            };
        });

        const edgePayload: EdgeItem[] = edges.map((edge, index) => ({
            id: edge.id && !Number.isNaN(Number(edge.id)) ? Number(edge.id) : 0,
            from_node_id: Number(edge.source),
            to_node_id: Number(edge.target),
            label: (edge.label as string) || 'next',
            sort_order: index + 1,
        }));

        onSaveGraph({ nodes: nodePayload, edges: edgePayload });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Flow Graph</div>
                    <div className="text-xs text-gray-500">
                        Drag nodes and connect them to create branches. Click “Save Graph” to persist.
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" className="rounded-xl" onClick={onAddNode}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Node
                    </Button>
                    <Button variant="secondary" size="sm" className="rounded-xl" onClick={handleSaveGraph}>
                        Save Graph
                    </Button>
                </div>
            </div>

            <div className="h-[420px] rounded-xl border border-gray-200 dark:border-gray-700 bg-white">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    fitView
                >
                    <MiniMap />
                    <Controls />
                    <Background gap={16} size={1} />
                </ReactFlow>
            </div>

            <div className="space-y-2">
                {(flow.nodes || []).map((node) => (
                    <div
                        key={node.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 p-3"
                    >
                        <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{node.type}</div>
                            <div className="text-xs text-gray-500">Order: {node.sort_order}</div>
                            {(node.config?.is_start ?? false) && (
                                <Badge variant="info" className="mt-2">Start</Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => onEditNode(node)}>
                                <Pencil className="h-4 w-4 mr-1" />
                                Edit
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => onDeleteNode(node.id)}>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
