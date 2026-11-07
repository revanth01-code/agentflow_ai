import { create } from 'zustand';
import api from '../lib/api';

function nodePosition(node, index) {
  // TODO: Return the saved x / y when both are finite numbers, otherwise a grid position.
  return { x: 0, y: 0 };
}

function serverNodeToFlow(node, index = 0) {
  // TODO: Map the stored node onto a React Flow node of type 'workflowNode' with its
  // TODO: data (type, label, category, config, status).
  return null;
}

function normalizeEdges(edges = [], nodes = []) {
  // TODO: Give every edge an id, resolve string / object source and target values, default
  // TODO: animated to true, and drop edges that do not connect two known nodes.
  return [];
}

function flowNodeToServer(node) {
  // TODO: Map a React Flow node back onto the stored node shape.
  return null;
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
    // TODO: Load GET /workflows/dashboard into the dashboard state.
  },
  fetchWorkflows: async () => {
    // TODO: Load GET /workflows into the workflows state.
  },
  loadWorkflow: async (id) => {
    // TODO: Load the workflow, convert its nodes and edges for the canvas, and set it active.
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => {
    // TODO: Normalize the edges against the current nodes before storing them.
    set({ edges });
  },
  saveWorkflow: async () => {
    // TODO: Convert the canvas back to the server shape, POST a new workflow or PUT an
    // TODO: existing one, and refresh the active workflow and the workflow list.
  },
  generateWorkflow: async (prompt) => {
    // TODO: Toggle loading, POST the prompt to /workflows/generate, and load the returned
    // TODO: graph onto the canvas, clearing the previous executions and timeline.
  },
  executeWorkflow: async () => {
    // TODO: POST /workflows/{id}/execute, mark the completed and failed nodes from the
    // TODO: execution output, prepend the execution, then refresh the timeline and dashboard.
  },
  fetchExecutions: async (workflowId) => {
    // TODO: Load GET /executions (optionally filtered by workflowId) into the executions state.
  },
  fetchTimeline: async (executionId) => {
    // TODO: Load GET /executions/{id}/timeline into the timeline state.
  }
}));
