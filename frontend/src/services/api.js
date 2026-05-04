import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  withCredentials: true, // envia la cookie httpOnly automáticamente
});

api.interceptors.response.use(
  r => r,
  err => {
    const status = err.response?.status;
    const mensaje = err.response?.data?.error || '';

    // 401 siempre es sesión expirada/inexistente → redirigir
    // 403 solo redirigir si el token es inválido/expirado, NO si el email no está verificado
    const esTokenInvalido =
      status === 401 ||
      (status === 403 && (
        mensaje.toLowerCase().includes('token inválido') ||
        mensaje.toLowerCase().includes('token expirado')
      ));

    if (esTokenInvalido) {
      localStorage.removeItem('nexlink_user');
      window.location.href = '/login';
    }

    return Promise.reject(err);
  }
);

export default api;
