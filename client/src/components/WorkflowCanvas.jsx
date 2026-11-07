import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addEdge,
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  applyEdgeChanges,
  applyNodeChanges,
  useReactFlow
} from '@xyflow/react';
import { CheckCircle2, Download, Play, Save, Trash2, Upload } from 'lucide-react';
import NodeConfigPanel from './NodeConfigPanel';
import NodePalette from './NodePalette';
import { useWorkflowStore } from '../store/workflowStore';

function exportJson(workflow, nodes, edges) {
  // TODO: Serialize the workflow with its nodes and edges and trigger a JSON file download.
}

const categoryStyles = {
  trigger: 'border-sky-200 bg-sky-50 text-sky-900',
  action: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  ai: 'border-violet-200 bg-violet-50 text-violet-900',
  logic: 'border-amber-200 bg-amber-50 text-amber-900'
};

const statusStyles = {
  idle: 'bg-slate-100 text-slate-600',
  completed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-rose-100 text-rose-700'
};

function WorkflowNode({ id, data, selected, onRemove }) {
  const category = data?.category || 'action';
  const status = data?.status || 'idle';

  return (
    <div className={`min-w-48 rounded border bg-white p-3 shadow-soft ${selected ? 'ring-2 ring-teal-500' : ''}`}>
      <Handle type="target" position={Position.Left} />
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className={`rounded border px-2 py-1 text-[11px] font-semibold uppercase ${categoryStyles[category] || categoryStyles.action}`}>
          {category}
        </span>
        <button
          type="button"
          aria-label={`Remove ${data?.label || id}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(id);
          }}
          className="grid h-7 w-7 place-items-center rounded border border-slate-200 text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <p className="max-w-56 text-sm font-semibold text-slate-950">{data?.label || data?.type || id}</p>
      <p className="mt-1 max-w-56 truncate text-xs text-slate-500">{data?.type}</p>
      <span className={`mt-3 inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold ${statusStyles[status] || statusStyles.idle}`}>
        {status === 'completed' && <CheckCircle2 size={13} />}
        {status}
      </span>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

function fallbackPosition(node, index) {
  // TODO: Return the saved x / y when both are finite numbers, otherwise a grid position.
  return { x: 0, y: 0 };
}

function normalizeImportedNode(node, index = 0) {
  // TODO: Convert an imported node (React Flow shape or stored shape) into a
  // TODO: 'workflowNode' with a valid position and data payload.
  return null;
}

function normalizeImportedEdges(edges = [], nodes = []) {
  // TODO: Give every imported edge an id, resolve its source and target, and keep only
  // TODO: the edges that connect two known nodes.
  return [];
}

function WorkflowCanvasInner() {
  const {
    activeWorkflow,
    nodes,
    edges,
    setNodes,
    setEdges,
    saveWorkflow,
    executeWorkflow
  } = useWorkflowStore();
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [message, setMessage] = useState('');
  const { fitView } = useReactFlow();
  const selectedNode = useMemo(() => {
    // TODO: Return the node matching selectedNodeId.
    return null;
  }, [nodes, selectedNodeId]);

  useEffect(() => {
    // TODO: Fit the graph into the viewport whenever the node or edge count changes.
  }, [fitView, nodes.length, edges.length]);

  const onNodesChange = useCallback((changes) => {
    // TODO: Apply the React Flow node changes to the store.
  }, [nodes, setNodes]);

  const onEdgesChange = useCallback((changes) => {
    // TODO: Apply the React Flow edge changes to the store.
  }, [edges, setEdges]);

  const onConnect = useCallback((connection) => {
    // TODO: Add the new animated edge for the connection to the store.
  }, [edges, setEdges]);

  const removeNode = useCallback((nodeId) => {
    // TODO: Remove the node plus every edge attached to it, and clear the selection.
  }, []);

  const nodeTypes = useMemo(() => ({
    workflowNode: (props) => <WorkflowNode {...props} onRemove={removeNode} />
  }), [removeNode]);

  const onAddNode = (node) => {
    // TODO: Append the palette node to the canvas as a 'workflowNode' and show a hint.
  };

  const onNodeUpdate = (updatedNode) => {
    // TODO: Replace the matching node in the store with the edited version.
  };

  const importFile = async (file) => {
    // TODO: Read the JSON file, normalize its nodes and edges, and load them onto the canvas.
  };

  const handleSave = async () => {
    // TODO: Require at least one node, save through the store, and report the result.
    return null;
  };

  const handleExecute = async () => {
    // TODO: Require nodes, save the workflow first when it has no id, run the execution,
    // TODO: and report the resulting status or error.
  };

  return (
    <div className="grid min-h-[calc(100vh-8rem)] gap-4 xl:grid-cols-[280px_1fr_320px]">
      <aside className="rounded border border-slate-200 bg-white p-4 shadow-soft">
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase text-slate-500">Builder</p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">{activeWorkflow?.name || 'New Workflow'}</h2>
        </div>
        <NodePalette onAddNode={onAddNode} />
      </aside>

      <section className="overflow-hidden rounded border border-slate-200 bg-white shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-950">Visual Workflow Graph</p>
            <p className="text-xs text-slate-500">{nodes.length} nodes / {edges.length} edges</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleSave} className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Save size={15} />
              Save
            </button>
            <button type="button" onClick={handleExecute} className="inline-flex items-center gap-2 rounded bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800">
              <Play size={15} />
              Execute
            </button>
            <button type="button" onClick={() => exportJson(activeWorkflow, nodes, edges)} className="grid h-10 w-10 place-items-center rounded border border-slate-300 text-slate-700 hover:bg-slate-50" title="Export workflow">
              <Download size={16} />
            </button>
            <label className="grid h-10 w-10 cursor-pointer place-items-center rounded border border-slate-300 text-slate-700 hover:bg-slate-50" title="Import workflow">
              <Upload size={16} />
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(event) => event.target.files?.[0] && importFile(event.target.files[0])}
              />
            </label>
          </div>
        </div>
        {message && (
          <div className="border-b border-teal-100 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-900">
            {message}
          </div>
        )}
        <div className="h-[720px]">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            onPaneClick={() => setSelectedNodeId(null)}
            nodesDraggable
            nodesConnectable
            elementsSelectable
            fitView
          >
            <MiniMap pannable zoomable />
            <Controls />
            <Background gap={18} />
          </ReactFlow>
        </div>
      </section>

      <aside className="space-y-4">
        <NodeConfigPanel node={selectedNode} onChange={onNodeUpdate} onRemove={removeNode} />
        <div className="rounded border border-slate-200 bg-white p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase text-slate-500">Execution States</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
            {['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'RETRYING', 'PAUSED', 'CANCELLED'].map((state) => (
              <span key={state} className="rounded border border-slate-200 px-2 py-1">{state}</span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
}
