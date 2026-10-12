import axios from 'axios';
import { API_URL } from './config';

const TOKEN_KEY = 'ff_token';
const USER_KEY = 'ff_user';

// localStorage can throw (private mode, blocked storage); never let that break the app.
const safe = (fn, fallback = null) => {
  try {
    return fn();
  } catch {
    return fallback;
  }
};

export const session = {
  getToken: () => safe(() => localStorage.getItem(TOKEN_KEY)),
  getUser: () => safe(() => JSON.parse(localStorage.getItem(USER_KEY))),
  save: (token, user) =>
    safe(() => {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }),
  saveUser: (user) => safe(() => localStorage.setItem(USER_KEY, JSON.stringify(user))),
  clear: () =>
    safe(() => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }),
};

const api = axios.create({ baseURL: API_URL, timeout: 25000 });

api.interceptors.request.use((config) => {
  const token = session.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // An expired/invalid token on a request that carried one: tell the app to log out.
    if (err.response?.status === 401 && session.getToken()) window.dispatchEvent(new Event('ff:unauthorized'));
    return Promise.reject(err);
  }
);

export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.code === 'ERR_NETWORK' || err?.code === 'ECONNABORTED') return 'Cannot reach the server. Please check your connection.';
  return fallback;
};

export default api;
