import { Trash2 } from 'lucide-react';

export default function NodeConfigPanel({ node, onChange, onRemove }) {
  if (!node) {
    return (
      <div className="rounded border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
        Select a node to edit configuration.
      </div>
    );
  }

  const configText = JSON.stringify(node.data?.config || {}, null, 2);

  return (
    <div className="rounded border border-slate-200 bg-white p-4 shadow-soft">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase text-slate-500">Node Configuration</p>
        <h2 className="mt-1 text-base font-semibold text-slate-950">{node.data?.label}</h2>
      </div>
      <label className="block text-sm font-medium text-slate-700">
        Label
        <input
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
          value={node.data?.label || ''}
          onChange={(event) => onChange({ ...node, data: { ...node.data, label: event.target.value } })}
        />
      </label>
      <label className="mt-4 block text-sm font-medium text-slate-700">
        JSON Settings
        <textarea
          className="mt-1 h-48 w-full rounded border border-slate-300 px-3 py-2 font-mono text-xs outline-none focus:border-teal-600"
          value={configText}
          onChange={(event) => {
            try {
              onChange({ ...node, data: { ...node.data, config: JSON.parse(event.target.value) } });
            } catch (_error) {
              onChange({ ...node, data: { ...node.data, configDraft: event.target.value } });
            }
          }}
        />
      </label>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">Changes apply immediately. Click Save in the graph toolbar to persist.</p>
        <button
          type="button"
          onClick={() => onRemove?.(node.id)}
          className="inline-flex items-center gap-2 rounded border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
        >
          <Trash2 size={15} />
          Remove
        </button>
      </div>
    </div>
  );
}
