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
  const id = `${type}-${Date.now().toString().slice(-4)}-${index + 1}`;
  return {
    id,
    type: 'workflowNode',
    position: {
      x: 100 + (index % 3) * 260,
      y: 120 + Math.floor(index / 3) * 160
    },
    data: {
      id,
      type,
      label: label || type,
      category: category || 'action',
      config: {
        retries: 3,
        backoffStrategy: 'exponential'
      },
      status: 'idle'
    }
  };
}
