import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api', // Works with Vercel (external URL) or Nginx proxy (prod)
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for sending/receiving cookies (refreshToken)
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401 and refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login') {
      originalRequest._retry = true;
      
      try {
        // Call refresh token endpoint (sends http-only cookie automatically)
        const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
        
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          // Update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
          return api(originalRequest); // Retry the request
        }
      } catch (refreshError) {
        // If refresh fails, clear everything and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
