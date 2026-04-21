import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const DEMO_USERS = [
  { label: 'Admin NexLink', email: 'admin@nexlink.cl', rol: 'admin', color: '#4F46E5' },
  { label: 'Marca (Samsung)', email: 'carolina@samsung.cl', rol: 'marca', color: '#065A82' },
  { label: 'Empresa (B. Chile)', email: 'rrhh@bancochile.cl', rol: 'empresa', color: '#028090' },
  { label: 'Colaborador', email: 'maria@bancochile.cl', rol: 'colaborador', color: '#7C3AED' },
];

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const ROL_REDIRECT = { admin: '/admin', marca: '/marca', empresa: '/empresa', colaborador: '/marketplace' };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const user = await login(form.email, form.password);
      navigate(ROL_REDIRECT[user.rol] || '/');
    } catch {}
  };

  const fillDemo = (email) => setForm({ email, password: 'password' });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #0F172A 100%)',
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 80px', color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-.03em' }}>NexLink</span>
        </div>

        <h1 style={{ fontSize: 40, fontWeight: 800, lineHeight: 1.15, marginBottom: 20, letterSpacing: '-.03em' }}>
          Soluciones innovadoras<br />
          <span style={{ background: 'linear-gradient(90deg,#818CF8,#A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            para conectar marcas
          </span><br />
          y colaboradores
        </h1>
        <p style={{ fontSize: 16, color: '#94A3B8', lineHeight: 1.7, maxWidth: 440, marginBottom: 48 }}>
          Plataforma privada de beneficios corporativos que conecta marcas con colaboradores a través de eventos flash exclusivos.
        </p>

        {/* 3 actors */}
        {[
          { icon: '🏷️', title: 'Marcas', desc: 'Rotan inventario sin afectar posicionamiento' },
          { icon: '🏢', title: 'Empresas', desc: 'Beneficios reales sin costo operativo' },
          { icon: '👥', title: 'Colaboradores', desc: 'Acceso a oportunidades exclusivas' },
        ].map(a => (
          <div key={a.title} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{a.icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{a.title}</div>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>{a.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Right panel - form */}
      <div style={{
        width: 480, background: '#fff', display: 'flex',
        flexDirection: 'column', justifyContent: 'center', padding: '60px 48px',
      }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Iniciar Sesión</h2>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 32 }}>Ingresa tus credenciales para continuar</p>

        {/* Demo users */}
        <div style={{ marginBottom: 24, padding: 16, background: '#F8FAFC', borderRadius: 10, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '.05em' }}>Demo — Selecciona un rol:</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {DEMO_USERS.map(u => (
              <button key={u.email} onClick={() => fillDemo(u.email)}
                style={{
                  padding: '8px 10px', borderRadius: 7, border: `1.5px solid ${u.color}22`,
                  background: `${u.color}0D`, cursor: 'pointer', textAlign: 'left',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = `${u.color}1A`}
                onMouseLeave={e => e.currentTarget.style.background = `${u.color}0D`}>
                <div style={{ fontSize: 12, fontWeight: 700, color: u.color }}>{u.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{u.email}</div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, color: '#991B1B', fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Email
            </label>
            <input className="input" type="email" placeholder="tu@empresa.cl" required
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={showPass ? 'text' : 'password'} placeholder="••••••••" required
                value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={{ paddingRight: 42 }} />
              <button type="button" onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Contraseña demo: <strong>password</strong></p>
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', height: 44, fontSize: 15 }}>
            {loading ? 'Ingresando…' : <><LogIn size={16} /> Ingresar</>}
          </button>
        </form>
      </div>
    </div>
  );
}
