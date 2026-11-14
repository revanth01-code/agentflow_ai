import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AppShell from '../../components/AppShell';
import ProtectedRoute from '../../components/ProtectedRoute';
import WorkflowCanvas from '../../components/WorkflowCanvas';
import { useWorkflowStore } from '../../store/workflowStore';

function WorkflowDetailsContent() {
  const router = useRouter();
  const { id } = router.query;
  const { activeWorkflow, loadWorkflow, executeWorkflow, fetchExecutions, fetchTimeline, executions, timeline } = useWorkflowStore();
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (id) {
      loadWorkflow(id);
      fetchExecutions(id);
    }
  }, [id, loadWorkflow, fetchExecutions]);

  const runWorkflow = async () => {
    try {
      setStatus('Starting workflow execution...');
      const res = await executeWorkflow();
      const stepCount = Object.keys(res.output || {}).length;
      setStatus(`Execution ${res.status}: ${stepCount} node steps processed in ${res.durationMs || 0}ms.`);
      await fetchExecutions(id);
      if (res._id) await fetchTimeline(res._id);
    } catch (err) {
      setStatus(`Execution error: ${err.message}`);
    }
  };

  return (
    <AppShell title={activeWorkflow?.name || 'Workflow Details'}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded border border-slate-200 bg-white p-4 shadow-soft">
        <div>
          <p className="text-sm text-slate-500">Status: {activeWorkflow?.status || 'draft'}</p>
          <h2 className="text-lg font-semibold text-slate-950 md:text-xl">{activeWorkflow?.name}</h2>
        </div>
        <button type="button" onClick={runWorkflow} className="rounded bg-teal-700 px-4 py-2 text-sm font-semibold text-white">Execute Now</button>
      </div>
      {status && <p className="mb-4 rounded border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900">{status}</p>}
      <div className="mb-4 rounded border border-slate-200 bg-white p-4 shadow-soft">
        <h3 className="mb-3 text-sm font-semibold text-slate-950">Recent Executions</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {executions.map((execution) => (
            <button
              key={execution._id}
              type="button"
              onClick={() => fetchTimeline(execution._id)}
              className="rounded border border-slate-200 px-3 py-3 text-left text-sm hover:border-teal-500 hover:bg-teal-50"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-800">{execution.status}</p>
                <p className="text-xs text-slate-500">{execution.durationMs ? `${execution.durationMs} ms` : 'pending'}</p>
              </div>
              <p className="text-xs text-slate-500">{new Date(execution.createdAt).toLocaleString()}</p>
              <p className="mt-2 text-xs font-medium text-slate-600">
                {Object.keys(execution.output || {}).length} node steps completed
              </p>
            </button>
          ))}
          {executions.length === 0 && <p className="py-6 text-sm text-slate-500">No executions yet. Click Execute Now to run this workflow.</p>}
        </div>
      </div>
      <div className="mb-4 rounded border border-slate-200 bg-white p-4 shadow-soft">
        <h3 className="mb-3 text-sm font-semibold text-slate-950">Agent Timeline</h3>
        <div className="space-y-3">
          {timeline.map((log) => (
            <div key={log._id} className="border-l-2 border-teal-600 pl-4">
              <p className="text-sm font-semibold text-slate-900">{log.message}</p>
              <p className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()} / {log.agent} / {log.event}</p>
            </div>
          ))}
          {timeline.length === 0 && <p className="py-6 text-sm text-slate-500">Run an execution or select one above to see planner, monitoring, validation, and recovery logs.</p>}
        </div>
      </div>
      <WorkflowCanvas />
    </AppShell>
  );
}

export default function WorkflowDetailsPage() {
  return (
    <ProtectedRoute>
      <WorkflowDetailsContent />
    </ProtectedRoute>
  );
}
