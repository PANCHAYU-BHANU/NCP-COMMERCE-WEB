import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8080/api', // Point to the Spring Boot backend
});

// Add a request interceptor to attach the JWT token to every request
api.interceptors.request.use(
  (config) => {
    // Get the auth object from localStorage
    const authData = localStorage.getItem('auth');
    if (authData) {
      const { token } = JSON.parse(authData);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
