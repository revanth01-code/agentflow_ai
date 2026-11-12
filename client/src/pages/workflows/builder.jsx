import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import { useWorkflowStore } from '../../store/workflowStore';

export default function WorkflowBuilderPage() {
  const router = useRouter();
  const { generateWorkflow, loadWorkflow, loading } = useWorkflowStore();
  const [prompt, setPrompt] = useState('');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    if (!router.isReady || !router.query.workflow) return;
    loadWorkflow(router.query.workflow).catch((err) => setNotice({
      type: 'error',
      text: err.response?.data?.message || err.message || 'Unable to load template.'
    }));
  }, [router.isReady, router.query.workflow, loadWorkflow]);

  const submit = async (event) => {
    event.preventDefault();
    setNotice(null);
    try {
      const generated = await generateWorkflow(prompt);
      const count = generated?.nodes?.length || 0;
      setNotice({
        type: 'success',
        text: `Generated workflow "${generated?.name || 'Workflow'}" with ${count} nodes.`
      });
    } catch (err) {
      setNotice({
        type: 'error',
        text: err.response?.data?.message || err.message || 'Workflow generation failed.'
      });
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="Workflow Builder">
        <div className="mb-4 rounded border border-slate-200 bg-white p-4 shadow-soft">
          <form className="grid gap-3 lg:grid-cols-[1fr_auto]" onSubmit={submit}>
            <textarea
              className="min-h-20 rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              value={prompt}
              placeholder="Describe your automation..."
              onChange={(event) => setPrompt(event.target.value)}
            />
            <button type="submit" disabled={loading} className="rounded bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
              {loading ? 'Generating...' : 'Generate Workflow'}
            </button>
          </form>
          <p className="mt-2 text-xs text-slate-500">
            💡 Need ideas? Try: 'Read from my Google Sheet and send a summary to Slack.'
          </p>
          <p className="mt-3 rounded bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900">
            ⚠️ AI can make mistakes. Please review the generated workflow before executing.
          </p>
          {notice && (
            <p className={`mt-3 rounded px-3 py-2 text-sm font-medium ${
              notice.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-slate-50 text-slate-700'
            }`}>
              {notice.text}
            </p>
          )}
        </div>
        <WorkflowCanvas />
      </AppShell>
    </ProtectedRoute>
  );
}
