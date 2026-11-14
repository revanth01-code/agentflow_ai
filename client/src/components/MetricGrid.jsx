import { AlertTriangle, Brain, CheckCircle2, Workflow } from 'lucide-react';

const icons = [Workflow, CheckCircle2, AlertTriangle, Brain];

export default function MetricGrid({ dashboard }) {
  const values = [
    ['Total Workflows', dashboard?.totalWorkflows || 0],
    ['Active Workflows', dashboard?.activeWorkflows || 0],
    ['Failed Workflows', dashboard?.failedWorkflows || 0],
    ['AI Reasoning Events', dashboard?.aiReasoningActivity || 0]
  ];

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {values.map(([label, value], index) => {
        const Icon = icons[index];
        return (
          <div key={label} className="rounded border border-slate-200 bg-white p-4 shadow-soft md:p-5">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">{label}</span>
              <Icon size={18} className="text-teal-700" />
            </div>
            <p className="text-3xl font-semibold text-slate-950">{value}</p>
          </div>
        );
      })}
    </section>
  );
}
