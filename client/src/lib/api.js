import axios from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 20000
});

api.interceptors.request.use((config) => {
  // TODO: Read the saved token from localStorage and set the Authorization header.
  return config;
});

export default api;
