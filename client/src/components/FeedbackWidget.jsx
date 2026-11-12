import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import api from '../lib/api';

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState(null);
  const [sending, setSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      await api.post('/feedback', { message });
      setMessage('');
      setStatus({ type: 'success', text: 'Feedback saved. Thank you!' });
    } catch (error) {
      setStatus({ type: 'error', text: error.response?.data?.message || 'Unable to save feedback.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-40 flex items-center gap-2 rounded-full bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-teal-800"
      >
        <MessageSquare size={17} />
        Feedback
      </button>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
          <section role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-950">Feedback &amp; Support</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close feedback">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <p className="mt-2 text-sm text-slate-600">Tell us what happened or how we can improve Agentflow.</p>
            <form onSubmit={submit} className="mt-4 space-y-3">
              <textarea
                required
                maxLength={5000}
                rows={6}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Describe a bug or share an idea..."
                className="w-full resize-y rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600"
              />
              <button
                type="submit"
                disabled={sending || !message.trim()}
                className="w-full rounded bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {sending ? 'Saving...' : 'Send Feedback'}
              </button>
              {status && (
                <p className={`text-sm ${status.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                  {status.text}
                </p>
              )}
            </form>
          </section>
        </div>
      )}
    </>
  );
}
