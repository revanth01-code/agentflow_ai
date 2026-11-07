import { create } from 'zustand';
import api from '../lib/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  // TODO: Start with ready: false so the app can wait for bootstrap() to finish.
  ready: true,
  setSession: ({ user, token }) => {
    // TODO: Persist the token in localStorage and store the session in the state.
  },
  bootstrap: async () => {
    // TODO: Read the saved token, call GET /auth/me to restore the session, and clear
    // TODO: the stored token when the request fails.
  },
  login: async (payload) => {
    // TODO: Post to /auth/login, persist the token, and store the returned user.
  },
  register: async (payload) => {
    // TODO: Post to /auth/register, persist the token, and store the returned user.
  },
  logout: () => {
    // TODO: Remove the stored token and reset the session state.
  }
}));
