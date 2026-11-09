import { useEffect, useState } from 'react';
import { CheckCircle2, KeyRound, Link as LinkIcon, RefreshCw } from 'lucide-react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import api from '../lib/api';

const providers = [
  ['gmail', 'Gmail API', 'Connect Google OAuth for real email send/read actions', 'Access token', 'oauth'],
  ['slack', 'Slack API', 'Connect Slack OAuth for real channel messages', 'Bot token', 'oauth'],
  ['google-sheets', 'Google Sheets API', 'Connect Google OAuth for real spreadsheet row appends', 'Access token', 'oauth'],
  ['discord', 'Discord API', 'Paste a Discord webhook URL for real notifications', 'Webhook URL', 'manual'],
  ['openrouter', 'OpenRouter API', 'Configured from server environment variables', 'Managed in .env', 'env'],
  ['gemini', 'Gemini API', 'Configured from server environment variables', 'Managed in .env', 'env']
];

function IntegrationsContent() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState({});
  const [drafts, setDrafts] = useState({});
  const [message, setMessage] = useState('');

  const refreshIntegrations = async () => {
    try {
      const res = await api.get('/integrations');
      setItems(res.data || []);
    } catch (err) {
      setMessage(`Failed to load integrations: ${err.message}`);
    }
  };

  useEffect(() => {
    refreshIntegrations();
    api.get('/integrations/status').then((res) => setStatus(res.data)).catch(() => {});
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const connectedParam = params.get('connected');
      const errorParam = params.get('error');
      if (connectedParam) {
        setMessage(`Successfully connected ${connectedParam}`);
      } else if (errorParam) {
        setMessage(`Integration error: ${errorParam}`);
      }
    }
  }, []);

  const connected = new Set(items.map((item) => item.provider));

  const startOAuth = async (id, name) => {
    try {
      const res = await api.get(`/integrations/oauth/${id}/start`);
      if (res.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      setMessage(`Cannot start OAuth for ${name}: ${err.response?.data?.message || err.message}`);
    }
  };

  const connectProvider = async (id, name, placeholder, mode) => {
    if (mode === 'env') {
      setMessage(`${name} is configured via server environment variables (.env).`);
      return;
    }
    if (mode === 'oauth') {
      await refreshIntegrations();
      setMessage(`${name} uses OAuth authorization. Click the Connect OAuth button.`);
      return;
    }
    const credential = drafts[id] || '';
    if (!credential) {
      setMessage(`Please provide a value for ${name} (${placeholder}).`);
      return;
    }
    try {
      await api.post('/integrations', {
        provider: id,
        webhookUrl: credential,
        accessToken: credential,
        status: 'connected'
      });
      setMessage(`Successfully saved credential for ${name}.`);
      setDrafts((prev) => ({ ...prev, [id]: '' }));
      await refreshIntegrations();
    } catch (err) {
      setMessage(`Failed to connect ${name}: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <AppShell title="API Integrations">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {providers.map(([id, name, description, placeholder, mode]) => {
          const oauthManaged = mode === 'oauth';
          const credential = drafts[id] || '';
          return (
            <div key={id} className="rounded border border-slate-200 bg-white p-5 shadow-soft">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-950">{name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{description}</p>
                </div>
                {connected.has(id) ? <CheckCircle2 className="text-teal-700" size={20} /> : <KeyRound className="text-slate-400" size={20} />}
              </div>
              <p className="mb-4 rounded bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                {status[id] || status[id.replace('-', '')] || 'ready'}
              </p>
              {mode === 'manual' && (
                <input
                  type={id === 'discord' ? 'url' : 'password'}
                  value={credential}
                  onChange={(event) => setDrafts((current) => ({ ...current, [id]: event.target.value }))}
                  placeholder={connected.has(id) ? 'Connected - paste a new value to replace' : placeholder}
                  className="mb-3 w-full rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                />
              )}
              {oauthManaged && (
                <button
                  type="button"
                  onClick={() => startOAuth(id, name)}
                  className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  <LinkIcon size={15} />
                  {connected.has(id) ? 'Reconnect OAuth' : 'Connect OAuth'}
                </button>
              )}
              <button
                type="button"
                onClick={() => connectProvider(id, name, placeholder, mode)}
                className="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw size={15} />
                {mode === 'manual' ? (connected.has(id) ? 'Reconnect' : 'Connect') : 'Refresh Status'}
              </button>
            </div>
          );
        })}
      </div>
      {message && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded border border-teal-100 bg-teal-50 px-4 py-3 text-sm font-medium text-teal-900">
          <p>{message}</p>
          <button type="button" onClick={refreshIntegrations} className="rounded border border-teal-200 px-3 py-1 text-xs font-semibold hover:bg-white">
            Refresh
          </button>
        </div>
      )}
    </AppShell>
  );
}

export default function IntegrationsPage() {
  return (
    <ProtectedRoute>
      <IntegrationsContent />
    </ProtectedRoute>
  );
}
