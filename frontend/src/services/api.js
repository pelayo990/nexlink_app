import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('nexlink_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem('nexlink_token');
      localStorage.removeItem('nexlink_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
