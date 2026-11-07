import { Plus } from 'lucide-react';
import { nodeGroups, nodeTemplate } from '../lib/nodeCatalog';

export default function NodePalette({ onAddNode, compact = false }) {
  return (
    <div className="space-y-4">
      {nodeGroups.map((group) => (
        <div key={group.title}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{group.title}</p>
          <div className={compact ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
            {group.nodes.map(([type, label], index) => (
              <button
                key={type}
                type="button"
                onClick={() => onAddNode(nodeTemplate(type, label, group.category, index))}
                className="flex w-full items-center justify-between rounded border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-700 hover:border-teal-500 hover:text-teal-800"
              >
                <span className="truncate">{label}</span>
                <Plus size={15} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
