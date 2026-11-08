import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : '';
export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
};

// Create an Axios instance
const api = axios.create({
  baseURL: API_URL, // Points to /api (proxied via Vite or Nginx)
});

// Add a request interceptor to attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    // Get the auth object from localStorage
    const authData = localStorage.getItem('auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        const token = parsed?.token || parsed?.accessToken;
        if (token) {
          if (config.headers && typeof config.headers.set === 'function') {
            config.headers.set('Authorization', `Bearer ${token}`);
          } else {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        }
      } catch (e) {
        console.error("Error parsing authData in api.js:", e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Add a response interceptor to handle token expiration globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If we receive a 401 Unauthorized, it means the token is invalid or expired.
      // We could clear localStorage and redirect to login here.
      console.error("Token expired or unauthorized");
      // localStorage.removeItem('auth');
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
