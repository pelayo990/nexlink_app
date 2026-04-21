import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Registro() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '', rol: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const nextStep = () => {
    if (!form.nombre || !form.email) return setError('Completa todos los campos');
    if (!form.email.includes('@')) return setError('Email inválido');
    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!form.rol) return setError('Selecciona un tipo de cuenta');
    if (!form.password) return setError('Ingresa una contraseña');
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres');
    if (form.password !== form.confirmar) return setError('Las contraseñas no coinciden');

    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/registro', {
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        rol: form.rol,
      });
      localStorage.setItem('nexlink_token', data.token);
      localStorage.setItem('nexlink_user', JSON.stringify(data.user));
      window.location.href = data.user.rol === 'marca' ? '/marca' : '/empresa';
    } catch (e) {
      setError(e.response?.data?.error || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Panel izquierdo */}
      <div style={{ flex: 1, background: 'linear-gradient(135deg,#0F172A,#1E2761)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 80px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 24, fontWeight: 800 }}>NexLink</span>
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 20 }}>
          Únete a la plataforma de beneficios corporativos
        </h1>
        <p style={{ fontSize: 16, opacity: .75, lineHeight: 1.6, marginBottom: 40 }}>
          Conecta tu marca o empresa con miles de colaboradores a través de eventos flash exclusivos.
        </p>

        {[
          { icon: '🏷️', titulo: 'Para Marcas', desc: 'Liquidá inventario con descuentos exclusivos para empresas' },
          { icon: '🏢', titulo: 'Para Empresas', desc: 'Beneficios reales para tus colaboradores sin costo operativo' },
        ].map(b => (
          <div key={b.titulo} style={{ display: 'flex', gap: 16, marginBottom: 20, padding: '16px 20px', background: 'rgba(255,255,255,.07)', borderRadius: 12 }}>
            <span style={{ fontSize: 24 }}>{b.icon}</span>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{b.titulo}</div>
              <div style={{ fontSize: 13, opacity: .7 }}>{b.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Panel derecho */}
      <div style={{ width: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 48px', background: '#fff' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? '#4F46E5' : '#E2E8F0', transition: 'background .3s' }} />
            ))}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>
            {step === 1 ? 'Crea tu cuenta' : 'Elige tu plan'}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {step === 1 ? 'Ingresa tus datos básicos' : 'Selecciona el tipo de cuenta y contraseña'}
          </p>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 14px', borderRadius: 8, marginBottom: 20, fontSize: 13, fontWeight: 600 }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nombre completo</label>
              <input className="input" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Tu nombre" style={{ width: '100%', height: 44 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email corporativo</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="tu@empresa.cl" style={{ width: '100%', height: 44 }} />
            </div>
            <button className="btn btn-primary" style={{ width: '100%', height: 44, marginTop: 8 }} onClick={nextStep}>
              Continuar →
            </button>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 10 }}>Tipo de cuenta</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { value: 'marca', icon: '🏷️', label: 'Marca', desc: 'Publico productos en liquidación' },
                  { value: 'empresa', icon: '🏢', label: 'Empresa', desc: 'Ofrezco beneficios a mis colaboradores' },
                ].map(r => (
                  <div key={r.value} onClick={() => set('rol', r.value)}
                    style={{ padding: '16px 14px', borderRadius: 10, cursor: 'pointer', border: `2px solid ${form.rol === r.value ? '#4F46E5' : '#E2E8F0'}`, background: form.rol === r.value ? '#EEF2FF' : '#fff', transition: 'all .15s', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{r.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: form.rol === r.value ? '#4F46E5' : 'var(--text-primary)' }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Contraseña</label>
              <input className="input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Mínimo 6 caracteres" style={{ width: '100%', height: 44 }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Confirmar contraseña</label>
              <input className="input" type="password" value={form.confirmar} onChange={e => set('confirmar', e.target.value)} placeholder="Repite la contraseña" style={{ width: '100%', height: 44 }} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1, height: 44 }} onClick={() => { setStep(1); setError(''); }}>← Volver</button>
              <button className="btn btn-primary" style={{ flex: 2, height: 44 }} onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-secondary)' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#4F46E5', fontWeight: 600, textDecoration: 'none' }}>Iniciar sesión</Link>
        </p>
      </div>
    </div>
  );
}
