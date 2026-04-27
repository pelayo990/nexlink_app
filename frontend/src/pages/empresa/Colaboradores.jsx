import { useEffect, useState } from 'react';
import { Search, Star, Download, Trash2, X, UserPlus } from 'lucide-react';
import Topbar from '../../components/Topbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function Modal({ colaborador, onClose, onSave, empresaId }) {
  const [form, setForm] = useState(colaborador || { nombre: '', email: '', cargo: '', area: '', rut: '', telefono: '', estado: 'activo', passwordProvisoria: '' });
  const [creado, setCreado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nombre || !form.email) return setError('Nombre y email son obligatorios');
    setLoading(true);
    setError('');
    try {
      if (colaborador?.id) {
        await api.put(`/colaboradores/${colaborador.id}`, form);
        onSave();
      } else {
        const { data } = await api.post('/colaboradores', { ...form, empresaId });
        setCreado({ email: data.email, password: data.passwordProvisoria });
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: 16, width: 480, maxHeight: '90vh', overflowY: 'auto', padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{colaborador?.id ? 'Editar Colaborador' : 'Nuevo Colaborador'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nombre *</label>
              <input className="input" value={form.nombre} onChange={e => set('nombre', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email *</label>
              <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Cargo</label>
              <input className="input" value={form.cargo || ''} onChange={e => set('cargo', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Área</label>
              <input className="input" value={form.area || ''} onChange={e => set('area', e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>RUT</label>
              <input className="input" value={form.rut || ''} onChange={e => set('rut', e.target.value)} placeholder="12.345.678-9" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Teléfono</label>
              <input className="input" value={form.telefono || ''} onChange={e => set('telefono', e.target.value)} placeholder="+56 9 1234 5678" style={{ width: '100%' }} />
            </div>
          </div>
          {!colaborador?.id && (
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Contraseña provisoria *</label>
              <input className="input" type="text" value={form.passwordProvisoria} onChange={e => set('passwordProvisoria', e.target.value)}
                placeholder="Mínimo 6 caracteres" style={{ width: '100%' }} />
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>El colaborador podrá cambiarla desde su perfil.</p>
            </div>
          )}
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Estado</label>
            <select className="input" value={form.estado} onChange={e => set('estado', e.target.value)} style={{ width: '100%' }}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>
        {creado && (
          <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 10, padding: '16px 20px', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, color: '#065F46', marginBottom: 8 }}>✅ Colaborador creado exitosamente</div>
            <div style={{ fontSize: 13, color: '#065F46' }}>Comparte estas credenciales con el colaborador:</div>
            <div style={{ marginTop: 10, background: '#fff', borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace', fontSize: 13 }}>
              <div>📧 Email: <strong>{creado.email}</strong></div>
              <div>🔑 Contraseña: <strong>{creado.password}</strong></div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 12, width: '100%' }} onClick={onSave}>Cerrar</button>
          </div>
        )}
        {!creado && <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : colaborador?.id ? 'Guardar cambios' : 'Crear Colaborador'}
          </button>
        </div>}

      </div>
    </div>
  );
}

export default function EmpresaColaboradores() {
  const { user } = useAuth();
  const [colaboradores, setColaboradores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | colaborador
  const [eliminando, setEliminando] = useState(null);

  const cargar = () => {
    setLoading(true);
    api.get('/colaboradores').then(r => setColaboradores(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const eliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar a ${nombre}? Esta acción no se puede deshacer.`)) return;
    setEliminando(id);
    try {
      await api.delete(`/colaboradores/${id}`);
      cargar();
    } catch (e) {
      alert(e.response?.data?.error || 'Error al eliminar');
    } finally {
      setEliminando(null);
    }
  };

  const filtered = colaboradores.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.cargo?.toLowerCase().includes(search.toLowerCase()) ||
    c.area?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar title="Colaboradores" subtitle="Gestiona los colaboradores activos en NexLink" />
      {modal && <Modal colaborador={modal === 'new' ? null : modal} empresaId={user?.empresaId} onClose={() => setModal(null)} onSave={() => { setModal(null); cargar(); }} />}

      <div className="page-body">
        <div className="page-header">
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Buscar colaborador..." style={{ paddingLeft: 32, width: 260, height: 38 }}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => window.open(`${import.meta.env.VITE_API_URL || ''}/api/colaboradores/exportar`, '_blank')}>
            <Download size={15} /> Exportar Excel
          </button>
            <button className="btn btn-primary" onClick={() => setModal('new')}><UserPlus size={15} /> Agregar Colaborador</button>
          </div>
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total', value: colaboradores.length, color: '#4F46E5' },
            { label: 'Activos', value: colaboradores.filter(c => c.estado === 'activo').length, color: '#10B981' },
            { label: 'Con Compras', value: colaboradores.filter(c => c.compras?.length > 0).length, color: '#F59E0B' },
            { label: 'Puntos Promedio', value: Math.round(colaboradores.reduce((s, c) => s + (c.puntos || 0), 0) / (colaboradores.length || 1)), color: '#7C3AED' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value.toLocaleString('es-CL')}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            {loading ? <div style={{ padding: 40, textAlign: 'center' }}>Cargando…</div> : (
              <table>
                <thead>
                  <tr><th>Colaborador</th><th>Cargo</th><th>Área</th><th>Estado</th><th>Compras</th><th>Puntos</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className="avatar">{c.nombre.charAt(0)}{c.nombre.split(' ')[1]?.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{c.nombre}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 14 }}>{c.cargo || '—'}</td>
                      <td><span className="tag">{c.area || '—'}</span></td>
                      <td><span className={`badge ${c.estado === 'activo' ? 'badge-success' : 'badge-gray'}`}>{c.estado}</span></td>
                      <td style={{ fontWeight: 600 }}>{c.compras?.length || 0}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Star size={13} color="#F59E0B" fill="#F59E0B" />
                          <span style={{ fontWeight: 700 }}>{c.puntos || 0}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setModal(c)}>Editar</button>
                          <button className="btn btn-ghost btn-sm" style={{ color: '#EF4444' }}
                            onClick={() => eliminar(c.id, c.nombre)}
                            disabled={eliminando === c.id}>
                            <Trash2 size={14} /> {eliminando === c.id ? '...' : 'Eliminar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
