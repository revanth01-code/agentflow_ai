import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/ProtectedRoute';
import api from '../lib/api';

export default function SettingsPage() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.get('/health')
      .then((res) => setHealth(res.data))
      .catch((_err) => setHealth({ status: 'offline', error: 'Failed to reach backend API' }));
  }, []);

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
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
