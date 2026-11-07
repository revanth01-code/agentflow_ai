async function validationAgent({ node, output }) {
  // TODO: Compare the node's required fields against the output data and report which
  // TODO: fields are missing along with the validation decision.
  return { agent: 'validation', valid: true, missing: [], decision: '' };
}

module.exports = validationAgent;
