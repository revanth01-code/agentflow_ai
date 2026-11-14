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
  const data = {
    name: workflow?.name || 'Workflow Export',
    description: workflow?.description || '',
    trigger: workflow?.trigger || { type: 'manual' },
    nodes: nodes.map((n) => ({
      id: n.id,
      type: n.data?.type || n.type,
      label: n.data?.label || n.label,
      category: n.data?.category || '',
      position: n.position,
      config: n.data?.config || {},
      status: n.data?.status || 'idle'
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: typeof e.source === 'object' ? e.source.id : e.source,
      target: typeof e.target === 'object' ? e.target.id : e.target,
      sourceHandle: e.sourceHandle || undefined,
      targetHandle: e.targetHandle || undefined,
      label: e.label || '',
      animated: e.animated !== false
    }))
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(data.name || 'workflow').toLowerCase().replace(/\s+/g, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
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
      {data?.type === 'if-else' ? (
        <>
          <Handle id="true" type="source" position={Position.Bottom} style={{ left: '35%', background: '#16a34a' }} />
          <Handle id="false" type="source" position={Position.Bottom} style={{ left: '65%', background: '#dc2626' }} />
        </>
      ) : data?.type === 'parallel-execution' ? (
        <>
          <Handle id="branch-1" type="source" position={Position.Bottom} style={{ left: '35%' }} />
          <Handle id="branch-2" type="source" position={Position.Bottom} style={{ left: '65%' }} />
        </>
      ) : (
        <Handle type="source" position={Position.Right} />
      )}
    </div>
  );
}

function fallbackPosition(node, index = 0) {
  if (
    node?.position &&
    typeof node.position.x === 'number' &&
    Number.isFinite(node.position.x) &&
    typeof node.position.y === 'number' &&
    Number.isFinite(node.position.y)
  ) {
    return { x: node.position.x, y: node.position.y };
  }
  return { x: 100 + (index % 4) * 260, y: 150 + Math.floor(index / 4) * 160 };
}

function normalizeImportedNode(node, index = 0) {
  if (!node) return null;
  const id = String(node.id || `node-${index + 1}`);
  const type = node.data?.type || node.type || 'workflowNode';
  const label = node.data?.label || node.label || type;
  const category = node.data?.category || node.category || 'action';
  const config = node.data?.config || node.config || {};
  const status = node.data?.status || node.status || 'idle';
  return {
    id,
    type: 'workflowNode',
    position: fallbackPosition(node, index),
    data: { id, type, label, category, config, status }
  };
}

function normalizeImportedEdges(edges = [], nodes = []) {
  if (!Array.isArray(edges)) return [];
  const validNodeIds = new Set((nodes || []).map((n) => (n && n.id ? String(n.id) : '')).filter(Boolean));
  return edges
    .map((edge, index) => {
      const source = typeof edge.source === 'object' ? edge.source?.id : edge.source;
      const target = typeof edge.target === 'object' ? edge.target?.id : edge.target;
      const sStr = String(source || '');
      const tStr = String(target || '');
      if (!validNodeIds.has(sStr) || !validNodeIds.has(tStr)) return null;
      return {
        id: edge.id || `e-${sStr}-${tStr}-${index}`,
        source: sStr,
        target: tStr,
        label: edge.label || '',
        animated: edge.animated !== false
      };
    })
    .filter(Boolean);
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
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  useEffect(() => {
    fitView({ padding: 0.2 });
  }, [fitView, nodes.length, edges.length]);

  const onNodesChange = useCallback((changes) => {
    setNodes(applyNodeChanges(changes, nodes));
  }, [nodes, setNodes]);

  const onEdgesChange = useCallback((changes) => {
    setEdges(applyEdgeChanges(changes, edges));
  }, [edges, setEdges]);

  const onConnect = useCallback((connection) => {
    setEdges(addEdge({ ...connection, animated: true }, edges));
  }, [edges, setEdges]);

  const removeNode = useCallback((nodeId) => {
    setNodes(nodes.filter((n) => n.id !== nodeId));
    setEdges(edges.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  }, [nodes, edges, selectedNodeId, setNodes, setEdges]);

  const nodeTypes = useMemo(() => ({
    workflowNode: (props) => <WorkflowNode {...props} onRemove={removeNode} />
  }), [removeNode]);

  const onAddNode = (paletteNode) => {
    const index = nodes.length;
    const id = `${paletteNode.type}-${Date.now().toString().slice(-4)}`;
    const newNode = {
      id,
      type: 'workflowNode',
      position: { x: 120 + (index % 3) * 260, y: 120 + Math.floor(index / 3) * 160 },
      data: {
        id,
        type: paletteNode.type,
        label: paletteNode.label,
        category: paletteNode.category,
        config: paletteNode.config || {},
        status: 'idle'
      }
    };
    setNodes([...nodes, newNode]);
    setMessage(`Added node: ${paletteNode.label}`);
    setTimeout(() => setMessage(''), 3000);
  };

  const onNodeUpdate = (updatedNode) => {
    setNodes(nodes.map((n) => (n.id === updatedNode.id ? updatedNode : n)));
  };

  const importFile = async (file) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const importedNodes = (json.nodes || []).map(normalizeImportedNode).filter(Boolean);
      const importedEdges = normalizeImportedEdges(json.edges, importedNodes);
      setNodes(importedNodes);
      setEdges(importedEdges);
      setMessage(`Imported ${importedNodes.length} nodes from file.`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(`Import failed: ${err.message}`);
    }
  };

  const handleSave = async () => {
    if (nodes.length === 0) {
      setMessage('Cannot save an empty workflow. Add at least one node.');
      return null;
    }
    try {
      const saved = await saveWorkflow();
      setMessage(`Saved workflow: ${saved.name}`);
      setTimeout(() => setMessage(''), 3000);
      return saved;
    } catch (err) {
      setMessage(`Save failed: ${err.message}`);
      return null;
    }
  };

  const handleExecute = async () => {
    if (nodes.length === 0) {
      setMessage('Cannot execute an empty workflow.');
      return;
    }
    try {
      let current = activeWorkflow;
      if (!current?._id) {
        current = await saveWorkflow();
      }
      setMessage('Executing workflow with AI agent orchestration...');
      const result = await executeWorkflow();
      setMessage(`Execution finished: ${result.status} in ${result.durationMs}ms`);
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setMessage(`Execution failed: ${err.message}`);
    }
  };

  return (
    <div className="grid min-h-[calc(100vh-8rem)] gap-4 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
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
          <div className={`border-b px-4 py-2 text-sm font-medium ${
            message.startsWith('Execution failed')
              ? 'border-red-100 bg-red-50 text-red-700'
              : 'border-teal-100 bg-teal-50 text-teal-900'
          }`}>
            {message}
          </div>
        )}
        <div className="h-[calc(100vh-100px)] min-h-[50vh] lg:h-[720px]">
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
