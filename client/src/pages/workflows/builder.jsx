import { useState } from 'react';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import { useWorkflowStore } from '../../store/workflowStore';

export default function WorkflowBuilderPage() {
  const { generateWorkflow, loading } = useWorkflowStore();
  const [prompt, setPrompt] = useState('When invoice emails arrive, extract amount, notify finance, update Google Sheets, and escalate invoices above $5000.');
  const [notice, setNotice] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    // TODO: Generate the workflow graph from the prompt through the store and report how
    // TODO: many nodes were produced, or show the API error message.
  };

  return (
    <ProtectedRoute>
      <AppShell title="Workflow Builder">
        <div className="mb-4 rounded border border-slate-200 bg-white p-4 shadow-soft">
          <form className="grid gap-3 lg:grid-cols-[1fr_auto]" onSubmit={submit}>
            <textarea
              className="min-h-20 rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
            />
            <button type="submit" disabled={loading} className="rounded bg-teal-700 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">
              {loading ? 'Generating...' : 'Generate Workflow'}
            </button>
          </form>
          {notice && <p className="mt-3 rounded bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">{notice}</p>}
        </div>
        <WorkflowCanvas />
      </AppShell>
    </ProtectedRoute>
  );
}
