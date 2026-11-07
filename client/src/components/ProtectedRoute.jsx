import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const { user, ready, bootstrap } = useAuthStore();

  // TODO: Bootstrap the session on mount, redirect to /login once ready without a user,
  // TODO: and render the loading state until the session is resolved.

  return children;
}
