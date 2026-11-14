import { useEffect, useState } from 'react';
import { Lightbulb, X } from 'lucide-react';

const DISMISSED_KEY = 'agentflow_troubleshooting_tip_dismissed';

export default function TroubleshootingWidget() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(DISMISSED_KEY) !== '1');
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className="fixed bottom-20 left-4 right-4 z-30 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950 shadow-xl sm:left-5 sm:right-auto sm:max-w-sm">
      <Lightbulb size={18} className="mt-0.5 shrink-0 text-amber-700" />
      <p className="text-xs leading-5">
        <strong>Troubleshooting Tip:</strong> If a workflow fails, please check that you have added your AI API keys in Settings and connected the required accounts (Gmail, Slack, etc.) in Integrations.
      </p>
      <button type="button" onClick={dismiss} aria-label="Dismiss troubleshooting tip" className="shrink-0 rounded p-1 text-amber-700 hover:bg-amber-100">
        <X size={16} />
      </button>
    </aside>
  );
}
