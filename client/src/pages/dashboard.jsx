import { useEffect } from 'react';
import Link from 'next/link';
import { Bot, ExternalLink, PlayCircle } from 'lucide-react';
import AppShell from '../components/AppShell';
import MetricGrid from '../components/MetricGrid';
import ProtectedRoute from '../components/ProtectedRoute';
import { useWorkflowStore } from '../store/workflowStore';

function DashboardContent() {
  const { dashboard, workflows, fetchDashboard, fetchWorkflows } = useWorkflowStore();

  useEffect(() => {
    fetchDashboard();
    fetchWorkflows();
  }, [fetchDashboard, fetchWorkflows]);

  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        <MetricGrid dashboard={dashboard} />
        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-950">Recent Workflows</h2>
              <Link href="/workflows/builder" className="text-sm font-semibold text-teal-700">Open Builder</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {workflows.length === 0 && <p className="py-8 text-sm text-slate-500">No workflows yet.</p>}
              {workflows.slice(0, 6).map((workflow) => (
                <Link key={workflow._id} href={`/workflows/${workflow._id}`} className="flex items-center justify-between py-3 hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-900">{workflow.name}</p>
                    <p className="text-xs text-slate-500">{workflow.nodes?.length || 0} nodes / {workflow.status}</p>
                  </div>
                  <ExternalLink size={16} className="text-slate-400" />
                </Link>
              ))}
            </div>
          </div>
          <div className="rounded border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <Bot size={18} className="text-teal-700" />
              <h2 className="text-base font-semibold text-slate-950">AI Reasoning Activity</h2>
            </div>
            <div className="space-y-3">
              {(dashboard?.recentExecutions || []).slice(0, 6).map((execution) => (
                <div key={execution._id} className="rounded border border-slate-200 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-800">{execution.status}</p>
                  <p className="text-xs text-slate-500">{new Date(execution.createdAt).toLocaleString()}</p>
                </div>
              ))}
              {(dashboard?.recentExecutions || []).length === 0 && (
                <div className="rounded border border-slate-200 px-3 py-8 text-center text-sm text-slate-500">
                  <PlayCircle className="mx-auto mb-2 text-slate-400" size={22} />
                  Executions will appear here.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
