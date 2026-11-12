const { isMemoryStore } = require('../config/db');
const memoryStore = require('../utils/memoryStore');
const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const ExecutionLog = require('../models/ExecutionLog');
const Notification = require('../models/Notification');
const ApiError = require('../utils/apiError');
const { generateWorkflow } = require('./aiService');

function normalizeEdges(edges = [], nodes = []) {
  if (!Array.isArray(edges)) return [];
  const validNodeIds = new Set(
    (nodes || []).map((n) => (n && n.id ? String(n.id) : '')).filter(Boolean)
  );

  return edges
    .map((edge, index) => {
      const source = typeof edge.source === 'object' ? edge.source?.id : edge.source;
      const target = typeof edge.target === 'object' ? edge.target?.id : edge.target;
      const sourceStr = String(source || '');
      const targetStr = String(target || '');

      if (!validNodeIds.has(sourceStr) || !validNodeIds.has(targetStr)) {
        return null;
      }

      return {
        id: edge.id || `e-${sourceStr}-${targetStr}-${index}`,
        source: sourceStr,
        target: targetStr,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
        label: edge.label || '',
        animated: edge.animated !== false,
        condition: edge.condition || ''
      };
    })
    .filter(Boolean);
}

function normalizeWorkflow(payload = {}, owner) {
  const nodes = Array.isArray(payload.nodes)
    ? payload.nodes
        .filter((node) => node && node.id)
        .map((node) => ({
          id: String(node.id),
          type: String(node.type || 'custom'),
          label: String(node.label || node.data?.label || node.type || ''),
          category: String(node.category || node.data?.category || ''),
          position: {
            x: Number(node.position?.x) || 0,
            y: Number(node.position?.y) || 0
          },
          config: node.config || node.data?.config || {},
          status: node.status || 'idle'
        }))
    : [];

  const edges = normalizeEdges(payload.edges, nodes);

  return {
    name: payload.name || 'Untitled Workflow',
    description: payload.description || '',
    owner: owner ? (owner._id ? String(owner._id) : String(owner)) : null,
    status: payload.status || 'draft',
    trigger: payload.trigger || { type: 'manual', config: {} },
    nodes,
    edges,
    version: Number(payload.version) || 1,
    tags: Array.isArray(payload.tags) ? payload.tags : [],
    lastExecutedAt: payload.lastExecutedAt || null
  };
}

async function createWorkflow(payload, owner) {
  const normalized = normalizeWorkflow(payload, owner);
  if (isMemoryStore()) {
    return memoryStore.insert('workflows', normalized);
  }
  return Workflow.create(normalized);
}

async function listWorkflows(owner) {
  const ownerId = String(owner._id || owner);
  if (isMemoryStore()) {
    const list = memoryStore.list('workflows', { owner: ownerId });
    return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }
  return Workflow.find({ owner: ownerId }).sort({ updatedAt: -1 }).lean();
}

async function getWorkflow(id, owner) {
  const ownerId = String(owner._id || owner);
  if (isMemoryStore()) {
    const wf = memoryStore.findOne('workflows', { _id: String(id), owner: ownerId });
    if (!wf) throw new ApiError(404, 'Workflow not found');
    return wf;
  }
  const wf = await Workflow.findOne({ _id: id, owner: ownerId }).lean();
  if (!wf) throw new ApiError(404, 'Workflow not found');
  return wf;
}

async function updateWorkflow(id, owner, payload) {
  const ownerId = String(owner._id || owner);
  const normalized = normalizeWorkflow(payload, ownerId);

  if (isMemoryStore()) {
    const existing = memoryStore.findOne('workflows', { _id: String(id), owner: ownerId });
    if (!existing) throw new ApiError(404, 'Workflow not found');
    const updated = memoryStore.update('workflows', String(id), normalized);
    return updated;
  }

  const updated = await Workflow.findOneAndUpdate(
    { _id: id, owner: ownerId },
    normalized,
    { new: true, runValidators: true }
  ).lean();
  if (!updated) throw new ApiError(404, 'Workflow not found');
  return updated;
}

async function duplicateWorkflow(id, owner) {
  const original = await getWorkflow(id, owner);
  const copyData = {
    ...original,
    name: `${original.name} Copy`,
    status: 'draft',
    version: 1
  };
  delete copyData._id;
  delete copyData.createdAt;
  delete copyData.updatedAt;
  return createWorkflow(copyData, owner);
}

async function deleteWorkflow(id, owner) {
  const ownerId = String(owner._id || owner);
  if (isMemoryStore()) {
    const deleted = memoryStore.remove('workflows', String(id));
    if (!deleted) throw new ApiError(404, 'Workflow not found');
    return true;
  }
  const deleted = await Workflow.findOneAndDelete({ _id: id, owner: ownerId });
  if (!deleted) throw new ApiError(404, 'Workflow not found');
  return true;
}

async function generateWorkflowFromPrompt(prompt, owner) {
  const graph = await generateWorkflow(prompt, owner);
  return createWorkflow(graph, owner);
}

async function dashboardStats(owner) {
  const ownerId = String(owner._id || owner);
  if (isMemoryStore()) {
    const workflows = memoryStore.list('workflows', { owner: ownerId });
    const allExecutions = memoryStore.list('executions');
    const wfIds = new Set(workflows.map((w) => String(w._id)));
    const executions = allExecutions.filter((e) => wfIds.has(String(e.workflow)));
    const failedWorkflows = executions.filter((e) => e.status === 'FAILED').length;
    const aiLogs = memoryStore.list('executionLogs');

    return {
      totalWorkflows: workflows.length,
      activeWorkflows: workflows.filter((w) => w.status === 'active').length,
      failedWorkflows,
      aiReasoningActivity: aiLogs.length,
      recentExecutions: executions.slice(0, 6)
    };
  }

  const workflows = await Workflow.find({ owner: ownerId }).lean();
  const wfIds = workflows.map((w) => w._id);
  const executions = await Execution.find({ workflow: { $in: wfIds } })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
  const failedCount = await Execution.countDocuments({
    workflow: { $in: wfIds },
    status: 'FAILED'
  });
  const aiLogCount = await ExecutionLog.countDocuments({
    workflow: { $in: wfIds }
  });

  return {
    totalWorkflows: workflows.length,
    activeWorkflows: workflows.filter((w) => w.status === 'active').length,
    failedWorkflows: failedCount,
    aiReasoningActivity: aiLogCount,
    recentExecutions: executions.slice(0, 6)
  };
}

module.exports = {
  createWorkflow,
  listWorkflows,
  getWorkflow,
  updateWorkflow,
  duplicateWorkflow,
  deleteWorkflow,
  generateWorkflowFromPrompt,
  dashboardStats,
  normalizeEdges,
  normalizeWorkflow
};
