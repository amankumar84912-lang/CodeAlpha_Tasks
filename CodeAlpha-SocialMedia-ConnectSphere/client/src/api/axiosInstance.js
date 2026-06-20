import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// ── Request interceptor: attach JWT token ─────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cs_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: unwrap { success: true, data: ... } ─────────────────
// After this interceptor, res.data is always the actual payload — no need to
// change existing component code that accesses res.data.
api.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      'success' in response.data &&
      response.data.success === true
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('cs_token');
      localStorage.removeItem('cs_user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }

    // Normalise error message so components can always use err.response?.data?.message
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';
    if (error.response) {
      error.response.data = { message };
    }
    return Promise.reject(error);
  }
);

export default api;
