export const nodeGroups = [
  {
    title: 'Trigger Nodes',
    category: 'trigger',
    nodes: [
      ['gmail-trigger', 'Gmail Trigger'],
      ['webhook-trigger', 'Webhook Trigger'],
      ['schedule-trigger', 'Schedule Trigger'],
      ['manual-trigger', 'Manual Trigger'],
      ['slack-trigger', 'Slack Trigger']
    ]
  },
  {
    title: 'Action Nodes',
    category: 'action',
    nodes: [
      ['send-email', 'Send Email'],
      ['send-slack-message', 'Send Slack Message'],
      ['send-discord-message', 'Send Discord Message'],
      ['google-sheets-row', 'Create Google Sheet Row'],
      ['http-request', 'HTTP Request'],
      ['database-insert', 'Database Insert']
    ]
  },
  {
    title: 'AI Nodes',
    category: 'ai',
    nodes: [
      ['ai-classification', 'AI Classification'],
      ['ai-extraction', 'AI Extraction'],
      ['ai-summarization', 'AI Summarization'],
      ['ai-decision', 'AI Decision Node'],
      ['ai-validation', 'AI Validation Node'],
      ['dynamic-routing', 'Dynamic Routing Node']
    ]
  },
  {
    title: 'Logic Nodes',
    category: 'logic',
    nodes: [
      ['if-else', 'IF/ELSE'],
      ['retry', 'Retry Node'],
      ['delay', 'Delay Node'],
      ['approval', 'Approval Node'],
      ['parallel-execution', 'Parallel Execution Node']
    ]
  }
];

export function nodeTemplate(type, label, category, index = 0) {
  // TODO: Return a React Flow node with a unique id, a staggered position based on the
  // TODO: index, and the default data config (retries and backoff strategy).
  return {
    id: type,
    type,
    position: { x: 0, y: 0 },
    data: { type, label, category, config: {} }
  };
}
