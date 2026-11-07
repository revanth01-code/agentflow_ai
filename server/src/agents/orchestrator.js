const plannerAgent = require('./plannerAgent');
const executionAgent = require('./executionAgent');
const validationAgent = require('./validationAgent');
const recoveryAgent = require('./recoveryAgent');
const monitoringAgent = require('./monitoringAgent');

function getLangGraphStatus() {
  // TODO: Try to require '@langchain/langgraph' and report 'available' or 'not-installed'.
  return 'not-installed';
}

async function runAgenticExecution({ workflow, execution, input = {}, onEvent }) {
  // TODO: Ask the planner for the node order, then for every node: report monitoring,
  // TODO: run the execution agent, validate the output, and store it in the shared context.
  // TODO: On failure, call the recovery agent and either escalate or report the retry plan.
  // TODO: Return the collected outputs, the reasoning summary, and the LangGraph status.
  throw new Error('Agentic execution is not implemented yet');
}

module.exports = { runAgenticExecution, getLangGraphStatus };
