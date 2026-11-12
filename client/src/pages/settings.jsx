import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import api from '../lib/api';

export default function SettingsPage() {
  const [health, setHealth] = useState(null);
  const [aiKeys, setAiKeys] = useState({ geminiApiKey: '', openrouterApiKey: '' });
  const [keyMessage, setKeyMessage] = useState('');
  const [savingKeys, setSavingKeys] = useState(false);

  useEffect(() => {
    api.get('/health')
      .then((res) => setHealth(res.data))
      .catch((_err) => setHealth({ status: 'offline', error: 'Failed to reach backend API' }));
  }, []);

  const saveAiKeys = async (event) => {
    event.preventDefault();
    setSavingKeys(true);
    setKeyMessage('');
    try {
      await api.put('/auth/ai-keys', aiKeys);
      setAiKeys({ geminiApiKey: '', openrouterApiKey: '' });
      setKeyMessage('AI provider keys saved securely.');
    } catch (err) {
      setKeyMessage(err.response?.data?.message || 'Failed to save AI provider keys.');
    } finally {
      setSavingKeys(false);
    }
  };

  return (
    <ProtectedRoute>
      <AppShell title="Settings">
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded border border-slate-200 bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="text-teal-700" size={20} />
              <h2 className="text-base font-semibold text-slate-950">Security</h2>
            </div>
            <div className="space-y-3 text-sm text-slate-600">
              <p>JWT expiration and protected APIs are enabled.</p>
              <p>Passwords are hashed with bcrypt.</p>
              <p>Credentials are encrypted before storage.</p>
              <p>Rate limiting, CORS, request validation, and Helmet headers are active.</p>
            </div>
          </section>
          <section className="rounded border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="mb-4 text-base font-semibold text-slate-950">Runtime Readiness</h2>
            <pre className="overflow-auto rounded bg-slate-950 p-4 text-xs text-slate-100">
              {JSON.stringify(health, null, 2)}
            </pre>
          </section>
          <section className="rounded border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="mb-2 text-base font-semibold text-slate-950">AI Provider Settings</h2>
            <p className="mb-4 text-sm text-slate-600">
              Add your own provider keys. Keys are encrypted before they are stored and are never displayed again.
            </p>
            <form onSubmit={saveAiKeys} className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Gemini API key
                <input
                  type="password"
                  value={aiKeys.geminiApiKey}
                  onChange={(event) => setAiKeys((current) => ({ ...current, geminiApiKey: event.target.value }))}
                  autoComplete="new-password"
                  placeholder="Leave blank to clear"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                />
              </label>
              <label className="block text-sm font-medium text-slate-700">
                OpenRouter API key
                <input
                  type="password"
                  value={aiKeys.openrouterApiKey}
                  onChange={(event) => setAiKeys((current) => ({ ...current, openrouterApiKey: event.target.value }))}
                  autoComplete="new-password"
                  placeholder="Leave blank to clear"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                />
              </label>
              <button
                type="submit"
                disabled={savingKeys}
                className="rounded bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingKeys ? 'Saving...' : 'Save Keys'}
              </button>
              {keyMessage && <p className="text-sm text-slate-600">{keyMessage}</p>}
            </form>
          </section>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
