import { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import { useRouter } from 'next/router';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import api from '../lib/api';

function TemplatesContent() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/templates').then((response) => setTemplates(response.data || []))
      .catch((error) => setMessage(error.response?.data?.message || error.message));
  }, []);

  const useTemplate = async (id) => {
    try {
      const response = await api.post(`/templates/${id}/use`);
      router.push(`/workflows/builder?workflow=${response.data._id}`);
    } catch (error) {
      setMessage(error.response?.data?.message || error.message);
    }
  };

  return (
    <AppShell title="Workflow Templates">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <article key={template._id} className="rounded border border-slate-200 bg-white p-4 shadow-soft md:p-5">
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 className="font-semibold text-slate-950">{template.name}</h2>
              <Copy size={18} className="text-teal-700" />
            </div>
            <p className="min-h-12 text-sm text-slate-500">{template.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(template.tags || []).map((tag) => <span key={tag} className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{tag}</span>)}
            </div>
            <button type="button" onClick={() => useTemplate(template._id)} className="mt-5 w-full rounded bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800">
              Use Template
            </button>
          </article>
        ))}
      </div>
      {templates.length === 0 && !message && <p className="rounded border border-slate-200 bg-white p-6 text-sm text-slate-500">No templates are available yet.</p>}
      {message && <p className="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>}
    </AppShell>
  );
}

export default function TemplatesPage() {
  return <ProtectedRoute><TemplatesContent /></ProtectedRoute>;
}
