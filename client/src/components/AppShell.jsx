import Link from 'next/link';
import { useRouter } from 'next/router';
import { Activity, Blocks, Cable, LayoutDashboard, LogOut, ScrollText, Settings, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const nav = [
  ['Dashboard', '/dashboard', LayoutDashboard],
  ['Workflow Builder', '/workflows/builder', Blocks],
  ['Execution Logs', '/executions', ScrollText],
  ['API Integrations', '/integrations', Cable],
  ['Settings', '/settings', Settings]
];

export default function AppShell({ children, title = 'AI Operations' }) {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white px-4 py-5 lg:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded bg-teal-700 text-white">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">AI Ops Automation</p>
            <p className="text-xs text-slate-500">Agentic workflows</p>
          </div>
        </div>
        <nav className="space-y-1">
          {nav.map(([label, href, Icon]) => {
            const active = router.pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded px-3 py-2 text-sm font-medium ${
                  active ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-8">
          <div className="flex items-center gap-3">
            <Activity className="text-teal-700" size={20} />
            <h1 className="text-base font-semibold text-slate-950">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">{user?.email}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="grid h-9 w-9 place-items-center rounded border border-slate-200 text-slate-600 hover:bg-slate-100"
              title="Log out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </header>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
