import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import { useWorkflowStore } from '../store/workflowStore';
import api from '../lib/api';

function ExecutionsContent() {
  const { executions, timeline, fetchExecutions, fetchTimeline } = useWorkflowStore();
  const [selectedExecutionId, setSelectedExecutionId] = useState('');
  const [humanInput, setHumanInput] = useState('');
  const [resumeMessage, setResumeMessage] = useState('');

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

  const selectedExecution = executions.find((execution) => execution._id === selectedExecutionId);

  const resumePausedExecution = async (event) => {
    event.preventDefault();
    try {
      await api.post(`/executions/${selectedExecutionId}/resume`, { input: humanInput });
      setHumanInput('');
      setResumeMessage('Input submitted. Execution resumed.');
      await fetchExecutions();
      await fetchTimeline(selectedExecutionId);
    } catch (err) {
      setResumeMessage(err.response?.data?.message || err.message || 'Unable to resume execution.');
    }
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
          {selectedExecution?.status === 'PAUSED' && (
            <form onSubmit={resumePausedExecution} className="mb-5 rounded border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-950">This workflow is waiting for your input.</p>
              <p className="mt-1 text-xs text-amber-800">Provide the requested information to continue execution.</p>
              <textarea
                value={humanInput}
                onChange={(event) => setHumanInput(event.target.value)}
                required
                className="mt-3 min-h-20 w-full rounded border border-amber-300 bg-white px-3 py-2 text-sm"
                placeholder="Type your response..."
              />
              <button type="submit" className="mt-3 rounded bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800">
                Submit & Resume
              </button>
              {resumeMessage && <p className="mt-2 text-xs font-medium text-amber-900">{resumeMessage}</p>}
            </form>
          )}
          <div className="space-y-3">
            {timeline.map((log) => (
              <details key={log._id} className="border-l-2 border-teal-600 pl-4" open={log.event === 'node_started'}>
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">{log.message}</summary>
                <p className="mt-1 text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()} / {log.agent} / {log.event}</p>
                {log.nodeId && <p className="mt-1 text-xs font-medium text-slate-600">Node: {log.nodeId}</p>}
                {(log.durationMs || log.metadata?.durationMs) && <p className="mt-1 text-xs text-slate-500">Duration: {log.durationMs || log.metadata.durationMs} ms</p>}
                {log.spanId && <p className="mt-1 text-[11px] text-slate-400">span: {log.spanId}{log.parentSpanId ? ` / parent: ${log.parentSpanId}` : ''}</p>}
              </details>
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
