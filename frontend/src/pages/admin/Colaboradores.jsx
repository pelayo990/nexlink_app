import { useEffect, useState } from 'react';
import { Search, Trash2, X, UserPlus } from 'lucide-react';
import Topbar from '../../components/Topbar';
import api from '../../services/api';

const EMPTY = { nombre: '', email: '', cargo: '', area: '', rut: '', telefono: '', estado: 'activo', empresaId: '', passwordProvisoria: '' };

function Modal({ colaborador, onClose, onSave, empresas }) {
  const [form, setForm] = useState(colaborador || EMPTY);
  const [creado, setCreado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nombre || !form.email) return setError('Nombre y email son obligatorios');
    if (!colaborador?.id && !form.empresaId) return setError('Debes seleccionar una empresa');
    if (!colaborador?.id && (!form.passwordProvisoria || form.passwordProvisoria.length < 6))
      return setError('La contraseña provisoria debe tener al menos 6 caracteres');
    setLoading(true);
    setError('');
    try {
      if (colaborador?.id) {
        await api.put(`/colaboradores/${colaborador.id}`, form);
        onSave();
      } else {
        const { data } = await api.post('/colaboradores', form);
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
              <input className="input" value={form.rut || ''} onChange={e => set('rut', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Estado</label>
              <select className="input" value={form.estado} onChange={e => set('estado', e.target.value)} style={{ width: '100%' }}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : colaborador?.id ? 'Guardar cambios' : 'Crear Colaborador'}
          </button>
        </div>}
      </div>
    </div>
  );
}

export default function AdminColaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [empresas, setEmpresas] = useState([]);

  const cargar = () => {
    setLoading(true);
    Promise.all([api.get('/colaboradores'), api.get('/empresas')])
      .then(([cRes, eRes]) => { setColaboradores(cRes.data); setEmpresas(eRes.data); })
      .finally(() => setLoading(false));
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
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.cargo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar title="Colaboradores" subtitle="Todos los colaboradores de la plataforma" />
      {modal && <Modal colaborador={modal === 'new' ? null : modal} empresas={empresas} onClose={() => setModal(null)} onSave={() => { setModal(null); cargar(); }} />}

      <div className="page-body">
        <div className="page-header">
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Buscar colaborador..." style={{ paddingLeft: 32, width: 260, height: 38 }}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setModal('new')}><UserPlus size={15} /> Agregar Colaborador</button>
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
                  <tr><th>Colaborador</th><th>Empresa</th><th>Cargo</th><th>Estado</th><th>Compras</th><th>Puntos</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar">{c.nombre.charAt(0)}{c.nombre.split(' ')[1]?.charAt(0)}</div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{c.nombre}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13 }}>{c.empresa?.nombre || c.empresaId}</td>
                      <td style={{ fontSize: 13 }}>{c.cargo || '—'}</td>
                      <td><span className={`badge ${c.estado === 'activo' ? 'badge-success' : 'badge-gray'}`}>{c.estado}</span></td>
                      <td style={{ fontWeight: 600 }}>{c.compras?.length || 0}</td>
                      <td style={{ fontWeight: 700, color: '#F59E0B' }}>{c.puntos || 0}</td>
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
