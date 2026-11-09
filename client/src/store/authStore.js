import { create } from 'zustand';
import api from '../lib/api';

const TOKEN_KEY = 'agentflow_token';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  ready: false,
  setSession: ({ user, token }) => {
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    set({ user, token, ready: true });
  },
  bootstrap: async () => {
    if (typeof window === 'undefined') {
      set({ ready: true });
      return;
    }
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      set({ user: null, token: null, ready: true });
      return;
    }
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, token, ready: true });
    } catch (_err) {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, ready: true });
    }
  },
  login: async (payload) => {
    const response = await api.post('/auth/login', payload);
    const { user, token } = response.data;
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    set({ user, token, ready: true });
    return response.data;
  },
  register: async (payload) => {
    const response = await api.post('/auth/register', payload);
    const { user, token } = response.data;
    if (typeof window !== 'undefined' && token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    set({ user, token, ready: true });
    return response.data;
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
    set({ user: null, token: null, ready: true });
  }
}));
