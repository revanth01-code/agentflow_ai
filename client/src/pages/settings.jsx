import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import api from '../lib/api';

export default function SettingsPage() {
  const [aiKeys, setAiKeys] = useState({ geminiApiKey: '', openrouterApiKey: '' });
  const [keyMessage, setKeyMessage] = useState('');
  const [savingKeys, setSavingKeys] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [sendingFeedback, setSendingFeedback] = useState(false);

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

  const sendFeedback = async (event) => {
    event.preventDefault();
    setSendingFeedback(true);
    setFeedbackStatus(null);
    try {
      await api.post('/feedback', { message: feedback });
      setFeedback('');
      setFeedbackStatus({ type: 'success', message: 'Feedback sent successfully. Thank you!' });
    } catch (err) {
      setFeedbackStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to send feedback.'
      });
    } finally {
      setSendingFeedback(false);
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
          <section className="rounded border border-slate-200 bg-white p-5 shadow-soft">
            <h2 className="mb-2 text-base font-semibold text-slate-950">Feedback &amp; Support</h2>
            <p className="mb-4 text-sm text-slate-600">
              Tell us about a bug, confusing behavior, or improvement you would like to see.
            </p>
            <form onSubmit={sendFeedback} className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Your feedback
                <textarea
                  value={feedback}
                  onChange={(event) => setFeedback(event.target.value)}
                  required
                  maxLength={5000}
                  rows={6}
                  placeholder="Describe the issue or share your suggestion..."
                  className="mt-1 w-full resize-y rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
                />
              </label>
              <button
                type="submit"
                disabled={sendingFeedback || !feedback.trim()}
                className="rounded bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sendingFeedback ? 'Sending...' : 'Send Feedback'}
              </button>
            </form>
          </section>
        </div>
        {feedbackStatus && (
          <div
            role="status"
            className={`fixed bottom-6 right-6 z-50 rounded px-4 py-3 text-sm text-white shadow-lg ${
              feedbackStatus.type === 'success' ? 'bg-emerald-700' : 'bg-red-700'
            }`}
          >
            {feedbackStatus.message}
          </div>
        )}
      </AppShell>
    </ProtectedRoute>
  );
}
