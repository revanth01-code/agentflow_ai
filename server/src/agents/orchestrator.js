const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');
const { randomUUID } = require('crypto');

function getLangGraphStatus() {
  try {
    require('@langchain/langgraph');
    return 'available';
  } catch (_err) {
    return 'not-installed';
  }
}

async function runAgenticExecution({
  workflow,
  execution,
  input = {},
  onEvent = () => {},
  traceId = randomUUID(),
  resumeNodeId = null,
  initialOutputs = {},
  hitlInput
}) {
  const langGraphStatus = getLangGraphStatus();
  const reasoning = [];
  const outputs = {};
  const context = {
    input: input || {},
    previous: null,
    outputs,
    hitlInputs: resumeNodeId && hitlInput !== undefined ? { [resumeNodeId]: hitlInput } : {}
  };

  // 1. Planner Agent
  const plan = await plannerAgent({ workflow });
  reasoning.push(plan);
  onEvent({
    agent: 'planner',
    level: 'info',
    event: 'plan_created',
    message: plan.decision,
    traceId,
    spanId: execution?.spanId || null,
    parentSpanId: null,
    metadata: { path: plan.path, confidence: plan.confidence }
  });

  const nodes = workflow?.nodes || [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  let resumeReached = !resumeNodeId;

  // 2. Iterate through planned path
  for (const nodeId of plan.path) {
    const node = nodeMap.get(nodeId);
    if (!node) continue;

    if (resumeNodeId && !resumeReached && node.id !== resumeNodeId) {
      const previous = initialOutputs[node.id];
      if (previous) {
        context.outputs[node.id] = previous.data || previous;
        outputs[node.id] = previous;
      }
      continue;
    }
    if (node.id === resumeNodeId) resumeReached = true;

    const spanId = randomUUID();
    const parentSpanId = execution?.spanId || null;
    const nodeStartedAt = Date.now();
    onEvent({
      agent: 'orchestrator',
      nodeId: node.id,
      level: 'info',
      event: 'node_started',
      message: `Starting node [${node.label || node.id}]`,
      traceId,
      spanId,
      parentSpanId,
      metadata: { nodeType: node.type }
    });

    // Monitoring: Step Start
    const monitorStart = await monitoringAgent({
      workflow,
      execution,
      step: node.label || node.id,
      message: `Executing node [${node.label || node.id}] of type ${node.type}`
    });
    onEvent({
      agent: 'monitoring',
      nodeId: node.id,
      level: 'info',
      event: 'step_started',
      message: monitorStart.message,
      traceId,
      spanId,
      parentSpanId,
      metadata: monitorStart
    });

    let nodeOutput = null;
    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      try {
        nodeOutput = await executionAgent({ node, workflow, context });

        if (nodeOutput?.paused) {
          onEvent({
            agent: 'execution',
            nodeId: node.id,
            level: 'info',
            event: 'hitl_paused',
            message: nodeOutput.prompt,
            traceId,
            spanId,
            parentSpanId,
            metadata: { prompt: nodeOutput.prompt }
          });
          return {
            paused: true,
            pauseNodeId: node.id,
            pausePrompt: nodeOutput.prompt,
            outputs,
            reasoningSummary: reasoning,
            langGraphStatus,
            traceId
          };
        }

        // Validate node output
        const validation = await validationAgent({ node, output: nodeOutput });
        reasoning.push(validation);

        if (!validation.valid) {
          throw new Error(validation.decision);
        }

        onEvent({
          agent: 'validation',
          nodeId: node.id,
          level: 'success',
          event: 'validation',
          message: validation.decision,
          traceId,
          spanId,
          parentSpanId,
          metadata: validation
        });

        // Store in context
        context.outputs[node.id] = nodeOutput.data;
        context.previous = nodeOutput.data;
        outputs[node.id] = nodeOutput;

        onEvent({
          agent: 'execution',
          nodeId: node.id,
          level: 'success',
          event: 'node_completed',
          message: `Node [${node.label || node.id}] completed successfully`,
          traceId,
          spanId,
          parentSpanId,
          metadata: { ...nodeOutput, durationMs: Date.now() - nodeStartedAt }
        });

        break;
      } catch (err) {
        attempt++;
        const recovery = await recoveryAgent({ error: err, attempt });
        reasoning.push(recovery);

        onEvent({
          agent: 'recovery',
          nodeId: node.id,
          level: 'warning',
          event: 'recovery',
          message: `Node failure: ${err.message}. Action: ${recovery.action}`,
          traceId,
          spanId,
          parentSpanId,
          metadata: recovery
        });

        if (recovery.action === 'escalate' || attempt >= maxAttempts) {
          err.nodeId = node.id;
          throw err;
        }

        if (recovery.delayMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, Math.min(recovery.delayMs, 2000)));
        }
      }
    }
  }

  return {
    outputs,
    reasoningSummary: reasoning,
    langGraphStatus,
    traceId
  };
}

module.exports = { runAgenticExecution, getLangGraphStatus };
