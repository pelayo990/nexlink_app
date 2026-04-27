import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROL_HOME = { admin: '/admin', empresa: '/empresa', colaborador: '/marketplace' };

export default function NotFound() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const home = ROL_HOME[user?.rol] || '/login';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F7FF', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{ fontSize: 96, fontWeight: 900, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1, marginBottom: 16 }}>
          404
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: '#0F172A' }}>Página no encontrada</h2>
        <p style={{ fontSize: 15, color: '#64748B', lineHeight: 1.6, marginBottom: 32 }}>
          La página que buscas no existe o fue movida. Vuelve al inicio y continúa desde ahí.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button onClick={() => navigate(-1)}
            style={{ padding: '10px 24px', borderRadius: 10, border: '1.5px solid #E2E8F0', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#374151' }}>
            ← Volver
          </button>
          <button onClick={() => navigate(home)}
            style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#fff' }}>
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
