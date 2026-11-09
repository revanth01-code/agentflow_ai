import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { user, ready, bootstrap } = useAuthStore();

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (ready && !user) {
      router.replace('/login');
    }
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
          <span className="text-sm font-medium">Loading session...</span>
        </div>
      </div>
    );
  }

  return children;
}
