import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function WelcomeModal({ user }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !user?.email) return;
    const storageKey = `agentflow_welcome_seen_${user.email}`;
    if (!window.localStorage.getItem(storageKey)) {
      setOpen(true);
    }
  }, [user]);

  const dismiss = () => {
    if (typeof window !== 'undefined' && user?.email) {
      window.localStorage.setItem(`agentflow_welcome_seen_${user.email}`, 'true');
    }
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
      >
        <h2 id="welcome-modal-title" className="text-xl font-semibold text-slate-950">
          Welcome to Agentflow AI!
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          To use AI generation and execution, you must provide your own API keys. This keeps the platform free and
          secure. Please visit Settings to add your Gemini or OpenRouter keys. Note: OAuth tokens (Gmail, Slack) may
          expire, so you can reconnect them anytime in Integrations.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={dismiss}
            className="rounded border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Continue
          </button>
          <Link
            href="/settings"
            onClick={dismiss}
            className="rounded bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Go to Settings
          </Link>
        </div>
      </section>
    </div>
  );
}
