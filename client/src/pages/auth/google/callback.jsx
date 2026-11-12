import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../../../store/authStore';

export default function GoogleCallback() {
  const router = useRouter();
  const loginWithGoogleToken = useAuthStore((state) => state.loginWithGoogleToken);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const token = typeof router.query.token === 'string' ? router.query.token : '';
    if (!token) {
      setError('Google authentication did not return a session.');
      return;
    }

    loginWithGoogleToken(token)
      .then(() => router.replace('/dashboard'))
      .catch(() => setError('Google authentication could not be completed.'));
  }, [router, loginWithGoogleToken]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 px-4">
      <p className="rounded bg-white px-6 py-4 text-sm text-slate-700">
        {error || 'Completing Google sign-in...'}
      </p>
    </main>
  );
}
