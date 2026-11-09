const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');

function getLangGraphStatus() {
  try {
    require('@langchain/langgraph');
    return 'available';
  } catch (_err) {
    return 'not-installed';
  }
}

async function runAgenticExecution({ workflow, execution, input = {}, onEvent = () => {} }) {
  const langGraphStatus = getLangGraphStatus();
  const reasoning = [];
  const outputs = {};
  const context = {
    input: input || {},
    previous: null,
    outputs
  };

  // 1. Planner Agent
  const plan = await plannerAgent({ workflow });
  reasoning.push(plan);
  onEvent({
    agent: 'planner',
    level: 'info',
    message: plan.decision,
    metadata: { path: plan.path, confidence: plan.confidence }
  });

  const nodes = workflow?.nodes || [];
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // 2. Iterate through planned path
  for (const nodeId of plan.path) {
    const node = nodeMap.get(nodeId);
    if (!node) continue;

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
      message: monitorStart.message,
      metadata: monitorStart
    });

    let nodeOutput = null;
    let attempt = 0;
    const maxAttempts = 3;

    while (attempt < maxAttempts) {
      try {
        nodeOutput = await executionAgent({ node, workflow, context });

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
          message: validation.decision,
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
          message: `Node [${node.label || node.id}] completed successfully`,
          metadata: nodeOutput
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
          message: `Node failure: ${err.message}. Action: ${recovery.action}`,
          metadata: recovery
        });

        if (recovery.action === 'escalate' || attempt >= maxAttempts) {
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
    langGraphStatus
  };
}

module.exports = { runAgenticExecution, getLangGraphStatus };
