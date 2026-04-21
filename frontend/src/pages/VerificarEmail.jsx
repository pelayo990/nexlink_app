import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function VerificarEmail() {
  const [params] = useSearchParams();
  const [estado, setEstado] = useState('cargando'); // cargando | ok | error
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setEstado('error'); setMensaje('Token no encontrado.'); return; }

    api.get(`/auth/verificar?token=${token}`)
      .then(r => { setEstado('ok'); setMensaje(r.data.message); })
      .catch(e => { setEstado('error'); setMensaje(e.response?.data?.error || 'Error al verificar.'); });
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F7FF', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '48px 40px', maxWidth: 440, width: '100%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,.08)' }}>

        {estado === 'cargando' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Verificando tu email...</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Un momento por favor.</p>
          </>
        )}

        {estado === 'ok' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#065F46' }}>¡Email confirmado!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>{mensaje}</p>
            <Link to="/login" style={{ display: 'inline-block', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', color: '#fff', textDecoration: 'none', padding: '12px 32px', borderRadius: 10, fontWeight: 700, fontSize: 15 }}>
              Iniciar sesión →
            </Link>
          </>
        )}

        {estado === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: '#991B1B' }}>Error de verificación</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>{mensaje}</p>
            <Link to="/registro" style={{ display: 'inline-block', background: '#EEF2FF', color: '#4F46E5', textDecoration: 'none', padding: '12px 32px', borderRadius: 10, fontWeight: 700, fontSize: 15 }}>
              Intentar nuevamente
            </Link>
          </>
        )}

      </div>
    </div>
  );
}
