import { useState, useEffect } from 'react';
import { User, Lock, CheckCircle, AlertCircle, Star } from 'lucide-react';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ROL_LABELS = {
  admin: 'Administrador NexLink',
  empresa: 'Portal Empresa',
  colaborador: 'Colaborador',
};

const ROL_COLORS = {
  admin: 'linear-gradient(135deg,#1E2761,#4F46E5)',
  empresa: 'linear-gradient(135deg,#028090,#02C39A)',
  colaborador: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
};

export default function Perfil() {
  const { user } = useAuth();
  const [tab, setTab] = useState('info');
  const [pwForm, setPwForm] = useState({ actual: '', nueva: '', confirmar: '' });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [colaboradorData, setColaboradorData] = useState(null);

  const setPw = (k, v) => setPwForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (user?.rol === 'colaborador' && user?.colaboradorId) {
      api.get(`/colaboradores/${user.colaboradorId}`).then(r => setColaboradorData(r.data)).catch(() => {});
    }
  }, [user]);

  const cambiarPassword = async () => {
    if (!pwForm.actual || !pwForm.nueva || !pwForm.confirmar)
      return setMsg({ tipo: 'error', texto: 'Completa todos los campos' });
    if (pwForm.nueva !== pwForm.confirmar)
      return setMsg({ tipo: 'error', texto: 'Las contraseñas nuevas no coinciden' });
    if (pwForm.nueva.length < 6)
      return setMsg({ tipo: 'error', texto: 'La contraseña debe tener al menos 6 caracteres' });

    setLoading(true);
    setMsg(null);
    try {
      await api.post('/auth/cambiar-password', {
        passwordActual: pwForm.actual,
        passwordNueva: pwForm.nueva,
      });
      setMsg({ tipo: 'ok', texto: '¡Contraseña actualizada exitosamente!' });
      setPwForm({ actual: '', nueva: '', confirmar: '' });
    } catch (e) {
      setMsg({ tipo: 'error', texto: e.response?.data?.error || 'Error al cambiar contraseña' });
    } finally {
      setLoading(false);
    }
  };

  const infoItems = [
    { label: 'Nombre completo', value: user?.nombre },
    { label: 'Email', value: user?.email },
    { label: 'Rol', value: ROL_LABELS[user?.rol] },
    ...(colaboradorData ? [
      { label: 'Empresa', value: colaboradorData.empresa?.nombre },
      { label: 'Cargo', value: colaboradorData.cargo || '—' },
      { label: 'Área', value: colaboradorData.area || '—' },
      { label: 'RUT', value: colaboradorData.rut || '—' },
      { label: 'Teléfono', value: colaboradorData.telefono || '—' },
    ] : []),
    { label: 'ID de cuenta', value: user?.id },
  ];

  return (
    <>
      <Topbar title="Mi Perfil" subtitle="Gestiona tu información personal" />
      <div className="page-body" style={{ maxWidth: 680 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 28, background: ROL_COLORS[user?.rol], borderRadius: 16, color: '#fff', marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, flexShrink: 0 }}>
            {user?.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{user?.nombre}</div>
            <div style={{ fontSize: 14, opacity: .85, marginTop: 2 }}>{user?.email}</div>
            <div style={{ marginTop: 8 }}>
              <span style={{ background: 'rgba(255,255,255,.2)', padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                {ROL_LABELS[user?.rol]}
              </span>
            </div>
          </div>
          {colaboradorData && (
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,.15)', borderRadius: 12, padding: '12px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                <Star size={18} fill="#FCD34D" color="#FCD34D" />
                <span style={{ fontSize: 24, fontWeight: 800 }}>{colaboradorData.puntos}</span>
              </div>
              <div style={{ fontSize: 12, opacity: .8, marginTop: 2 }}>Puntos</div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg)', borderRadius: 10, padding: 4 }}>
          {[
            { id: 'info', icon: User, label: 'Información' },
            { id: 'password', icon: Lock, label: 'Contraseña' },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setMsg(null); }}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, transition: 'all .15s', background: tab === t.id ? '#fff' : 'transparent', color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,.08)' : 'none' }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* Info tab */}
        {tab === 'info' && (
          <div className="card">
            <div className="section-title" style={{ marginBottom: 20 }}>Información de la cuenta</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {infoItems.map((item, i) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < infoItems.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</span>
                </div>
              ))}
            </div>

            {colaboradorData && colaboradorData.compras?.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div className="section-title" style={{ marginBottom: 16 }}>Últimas compras</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {colaboradorData.compras.slice(0, 5).map(c => (
                    <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg)', borderRadius: 8 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{c.producto?.nombre || c.productoId}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(c.fecha).toLocaleDateString('es-CL')}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 14 }}>${c.monto.toLocaleString('es-CL')}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Password tab */}
        {tab === 'password' && (
          <div className="card">
            <div className="section-title" style={{ marginBottom: 20 }}>Cambiar contraseña</div>
            {msg && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 8, marginBottom: 20, fontSize: 13, fontWeight: 600, background: msg.tipo === 'ok' ? '#D1FAE5' : '#FEE2E2', color: msg.tipo === 'ok' ? '#065F46' : '#991B1B' }}>
                {msg.tipo === 'ok' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                {msg.texto}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Contraseña actual</label>
                <input className="input" type="password" value={pwForm.actual} onChange={e => setPw('actual', e.target.value)} placeholder="••••••••" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nueva contraseña</label>
                <input className="input" type="password" value={pwForm.nueva} onChange={e => setPw('nueva', e.target.value)} placeholder="Mínimo 6 caracteres" style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Confirmar nueva contraseña</label>
                <input className="input" type="password" value={pwForm.confirmar} onChange={e => setPw('confirmar', e.target.value)} placeholder="Repite la contraseña" style={{ width: '100%' }} />
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 24, width: '100%', height: 44 }} onClick={cambiarPassword} disabled={loading}>
              {loading ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
