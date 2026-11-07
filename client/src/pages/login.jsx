import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { LockKeyhole } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    // TODO: Sign in through the auth store, redirect to /dashboard, and show the API error.
  };

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded bg-teal-700 text-white">
            <LockKeyhole size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-950">Sign in</h1>
            <p className="text-sm text-slate-500">Resume workflow operations.</p>
          </div>
        </div>
        {error && <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-teal-600" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Password
          <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2 outline-none focus:border-teal-600" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
        </label>
        <button className="mt-6 w-full rounded bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800" type="submit">Login</button>
        <p className="mt-4 text-center text-sm text-slate-500">
          New workspace? <Link href="/register" className="font-semibold text-teal-700">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
