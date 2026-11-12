import { create } from 'zustand';
import api from '../lib/api';

function nodePosition(node, index = 0) {
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

function serverNodeToFlow(node, index = 0) {
  if (!node) return null;
  const id = String(node.id);
  return {
    id,
    type: 'workflowNode',
    position: nodePosition(node, index),
    data: {
      id,
      type: node.type,
      label: node.label || node.data?.label || node.type,
      category: node.category || node.data?.category || '',
      config: node.config || node.data?.config || {},
      status: node.status || 'idle'
    }
  };
}

function normalizeEdges(edges = [], nodes = []) {
  if (!Array.isArray(edges)) return [];
  const nodeIds = new Set((nodes || []).map((n) => (n && n.id ? String(n.id) : '')).filter(Boolean));
  return edges
    .map((edge, index) => {
      const source = typeof edge.source === 'object' ? edge.source?.id : edge.source;
      const target = typeof edge.target === 'object' ? edge.target?.id : edge.target;
      const sStr = String(source || '');
      const tStr = String(target || '');
      if (!nodeIds.has(sStr) || !nodeIds.has(tStr)) return null;
      return {
        id: edge.id || `e-${sStr}-${tStr}-${index}`,
        source: sStr,
        target: tStr,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
        label: edge.label || '',
        animated: edge.animated !== false,
        condition: edge.condition || ''
      };
    })
    .filter(Boolean);
}

function flowNodeToServer(node) {
  if (!node) return null;
  return {
    id: String(node.id),
    type: node.data?.type || node.type || 'custom',
    label: node.data?.label || node.label || '',
    category: node.data?.category || '',
    position: {
      x: Number(node.position?.x) || 0,
      y: Number(node.position?.y) || 0
    },
    config: node.data?.config || node.config || {},
    status: node.data?.status || node.status || 'idle'
  };
}

export const useWorkflowStore = create((set, get) => ({
  workflows: [],
  activeWorkflow: null,
  nodes: [],
  edges: [],
  executions: [],
  timeline: [],
  dashboard: null,
  loading: false,

  fetchDashboard: async () => {
    try {
      const res = await api.get('/workflows/dashboard');
      set({ dashboard: res.data });
      return res.data;
    } catch (_err) {
      return null;
    }
  },

  fetchWorkflows: async () => {
    try {
      const res = await api.get('/workflows');
      set({ workflows: res.data });
      return res.data;
    } catch (_err) {
      return [];
    }
  },

  loadWorkflow: async (id) => {
    try {
      const res = await api.get(`/workflows/${id}`);
      const wf = res.data;
      const nodes = (wf.nodes || []).map(serverNodeToFlow).filter(Boolean);
      const edges = normalizeEdges(wf.edges, nodes);
      set({ activeWorkflow: wf, nodes, edges });
      return wf;
    } catch (err) {
      throw err;
    }
  },

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => {
    const currentNodes = get().nodes;
    set({ edges: normalizeEdges(edges, currentNodes) });
  },

  saveWorkflow: async (overrideWorkflow) => {
    const { activeWorkflow, nodes, edges } = get();
    const base = overrideWorkflow || activeWorkflow || {};
    const payload = {
      ...base,
      name: base.name || 'Untitled Workflow',
      nodes: nodes.map(flowNodeToServer).filter(Boolean),
      edges: normalizeEdges(edges, nodes)
    };

    let res;
    if (base._id) {
      res = await api.put(`/workflows/${base._id}`, payload);
    } else {
      res = await api.post('/workflows', payload);
    }
    const saved = res.data;
    set({ activeWorkflow: saved });
    get().fetchWorkflows();
    return saved;
  },

  generateWorkflow: async (prompt) => {
    set({ loading: true });
    try {
      const res = await api.post('/workflows/generate', { prompt });
      const wf = res.data;
      const nodes = (wf.nodes || []).map(serverNodeToFlow).filter(Boolean);
      const edges = normalizeEdges(wf.edges, nodes);
      set({ activeWorkflow: wf, nodes, edges, executions: [], timeline: [] });
      get().fetchWorkflows();
      return wf;
    } finally {
      set({ loading: false });
    }
  },

  executeWorkflow: async (input = {}) => {
    const { activeWorkflow } = get();
    if (!activeWorkflow?._id) return null;

    const res = await api.post(`/workflows/${activeWorkflow._id}/execute`, { input });
    const execution = res.data;

    const outputs = execution.output || {};
    set((state) => ({
      nodes: state.nodes.map((n) => {
        const nodeOutput = outputs[n.id];
        return {
          ...n,
          data: {
            ...n.data,
            status: nodeOutput ? nodeOutput.status : (execution.status === 'FAILED' ? 'failed' : 'completed')
          }
        };
      }),
      executions: [execution, ...state.executions]
    }));

    if (execution._id) {
      get().fetchTimeline(execution._id);
    }
    get().fetchDashboard();
    return execution;
  },

  fetchExecutions: async (workflowId) => {
    try {
      const url = workflowId ? `/executions?workflowId=${workflowId}` : '/executions';
      const res = await api.get(url);
      set({ executions: res.data });
      return res.data;
    } catch (_err) {
      return [];
    }
  },

  fetchTimeline: async (executionId) => {
    if (!executionId) return [];
    try {
      const res = await api.get(`/executions/${executionId}/timeline`);
      set({ timeline: res.data });
      return res.data;
    } catch (_err) {
      return [];
    }
  }
}));
