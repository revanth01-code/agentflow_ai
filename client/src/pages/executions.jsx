import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import { useWorkflowStore } from '../store/workflowStore';

function ExecutionsContent() {
  const { executions, timeline, fetchExecutions, fetchTimeline } = useWorkflowStore();
  const [selectedExecutionId, setSelectedExecutionId] = useState('');

  useEffect(() => {
    fetchExecutions().then((data) => {
      if (Array.isArray(data) && data.length > 0) {
        setSelectedExecutionId(data[0]._id);
        fetchTimeline(data[0]._id);
      }
    });
  }, [fetchExecutions, fetchTimeline]);

  const selectExecution = async (executionId) => {
    setSelectedExecutionId(executionId);
    await fetchTimeline(executionId);
  };

  return (
    <AppShell title="Execution Logs">
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="rounded border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="mb-4 text-base font-semibold text-slate-950">Executions</h2>
          <div className="space-y-2">
            {executions.map((execution) => (
              <button
                key={execution._id}
                type="button"
                onClick={() => selectExecution(execution._id)}
                className={`w-full rounded border px-3 py-3 text-left hover:border-teal-500 ${
                  selectedExecutionId === execution._id ? 'border-teal-500 bg-teal-50' : 'border-slate-200'
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{execution.status}</p>
                  <p className="text-xs font-medium text-slate-500">{execution.durationMs ? `${execution.durationMs} ms` : 'not finished'}</p>
                </div>
                <p className="text-xs text-slate-500">{new Date(execution.createdAt).toLocaleString()}</p>
                <p className="mt-2 text-xs font-medium text-slate-600">
                  {Object.keys(execution.output || {}).length} node steps completed
                </p>
              </button>
            ))}
            {executions.length === 0 && <p className="py-8 text-sm text-slate-500">No execution records yet.</p>}
          </div>
        </section>
        <section className="rounded border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="mb-4 text-base font-semibold text-slate-950">AI Reasoning Timeline</h2>
          <div className="space-y-3">
            {timeline.map((log) => (
              <div key={log._id} className="border-l-2 border-teal-600 pl-4">
                <p className="text-sm font-semibold text-slate-900">{log.message}</p>
                <p className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()} / {log.agent} / {log.event}</p>
                {log.nodeId && <p className="mt-1 text-xs font-medium text-slate-600">Node: {log.nodeId}</p>}
              </div>
            ))}
            {timeline.length === 0 && <p className="py-8 text-sm text-slate-500">Select an execution to view agent decisions, retries, failures, and recovery actions.</p>}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function ExecutionsPage() {
  return (
    <ProtectedRoute>
      <ExecutionsContent />
    </ProtectedRoute>
  );
}
