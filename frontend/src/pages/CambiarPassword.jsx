import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, CheckCircle } from 'lucide-react';
import api from '../services/api';

export default function CambiarPassword() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nueva: '', confirmar: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nueva || !form.confirmar) return setError('Completa todos los campos');
    if (form.nueva.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    if (form.nueva !== form.confirmar) return setError('Las contraseñas no coinciden');

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/cambiar-password-forzado', {
        passwordNueva: form.nueva,
      });
      // Forzar re-login para obtener token actualizado
      logout();
      navigate('/login', { state: { mensaje: '¡Contraseña actualizada! Inicia sesión con tu nueva contraseña.' } });
    } catch (e) {
      setError(e.response?.data?.error || 'Error al cambiar contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F7FF', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '48px 40px', maxWidth: 440, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Lock size={24} color="#fff" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Cambia tu contraseña</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Hola <strong>{user?.nombre?.split(' ')[0]}</strong>, tu cuenta tiene una contraseña provisoria. Por seguridad debes cambiarla antes de continuar.
          </p>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 14px', borderRadius: 8, marginBottom: 20, fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nueva contraseña</label>
            <input className="input" type="password" value={form.nueva} onChange={e => set('nueva', e.target.value)}
              placeholder="Mínimo 6 caracteres" style={{ width: '100%', height: 44 }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Confirmar contraseña</label>
            <input className="input" type="password" value={form.confirmar} onChange={e => set('confirmar', e.target.value)}
              placeholder="Repite la contraseña" style={{ width: '100%', height: 44 }} />
          </div>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', height: 44, marginTop: 24, fontSize: 15 }}
          onClick={handleSubmit} disabled={loading}>
          <CheckCircle size={16} /> {loading ? 'Guardando...' : 'Actualizar contraseña'}
        </button>

        <button onClick={() => { logout(); navigate('/login'); }}
          style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)' }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
