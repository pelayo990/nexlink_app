import { useEffect, useState } from 'react';
import { Search, Plus, Tag, X } from 'lucide-react';
import Topbar from '../../components/Topbar';
import api from '../../services/api';

const ESTADO_MAP = {
  activo:   { label: 'Activo',    cls: 'badge-success' },
  pendiente:{ label: 'Pendiente', cls: 'badge-warning' },
  inactivo: { label: 'Inactivo',  cls: 'badge-gray' },
};

const EMPTY = { nombre: '', categoria: '', descripcion: '', contacto: '', telefono: '', rut: '', plan: 'standard', estado: 'activo' };

function Modal({ marca, onClose, onSave }) {
  const [form, setForm] = useState(marca || EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nombre || !form.categoria) return setError('Nombre y categoría son obligatorios');
    setLoading(true);
    setError('');
    try {
      if (marca?.id) {
        await api.put(`/marcas/${marca.id}`, form);
      } else {
        await api.post('/marcas', form);
      }
      onSave();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: 16, width: 520, maxHeight: '90vh', overflowY: 'auto', padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{marca?.id ? 'Editar Marca' : 'Nueva Marca'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nombre *</label>
              <input className="input" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Samsung Chile" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Categoría *</label>
              <select className="input" value={form.categoria} onChange={e => set('categoria', e.target.value)} style={{ width: '100%' }}>
                <option value="">Seleccionar...</option>
                {['Electrónica','Retail','Deportes','Alimentos','Moda','Hogar','Tecnología','Otro'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Descripción</label>
            <textarea className="input" value={form.descripcion} onChange={e => set('descripcion', e.target.value)} placeholder="Descripción de la marca..." rows={3} style={{ width: '100%', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>RUT</label>
              <input className="input" value={form.rut} onChange={e => set('rut', e.target.value)} placeholder="96.123.456-7" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Teléfono</label>
              <input className="input" value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+56 2 2345 6789" style={{ width: '100%' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email de contacto</label>
            <input className="input" type="email" value={form.contacto} onChange={e => set('contacto', e.target.value)} placeholder="contacto@marca.cl" style={{ width: '100%' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Plan</label>
              <select className="input" value={form.plan} onChange={e => set('plan', e.target.value)} style={{ width: '100%' }}>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Estado</label>
              <select className="input" value={form.estado} onChange={e => set('estado', e.target.value)} style={{ width: '100%' }}>
                <option value="activo">Activo</option>
                <option value="pendiente">Pendiente</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : marca?.id ? 'Guardar cambios' : 'Crear Marca'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminMarcas() {
  const [marcas, setMarcas] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | marca object

  const cargar = () => {
    setLoading(true);
    api.get('/marcas').then(r => setMarcas(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const handleSave = () => { setModal(null); cargar(); };

  const filtered = marcas.filter(m =>
    m.nombre.toLowerCase().includes(search.toLowerCase()) ||
    m.categoria.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar title="Gestión de Marcas" subtitle="Administra todas las marcas de la plataforma" />
      {modal && <Modal marca={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}

      <div className="page-body">
        <div className="page-header">
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Buscar marca..." style={{ paddingLeft: 32, width: 240, height: 38 }}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={16} /> Nueva Marca</button>
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 24 }}>
          {[
            { label: 'Total Marcas',  value: marcas.length,                                          color: '#4F46E5' },
            { label: 'Activas',       value: marcas.filter(m => m.estado === 'activo').length,       color: '#10B981' },
            { label: 'Pendientes',    value: marcas.filter(m => m.estado === 'pendiente').length,    color: '#F59E0B' },
            { label: 'Plan Premium',  value: marcas.filter(m => m.plan === 'premium').length,        color: '#7C3AED' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando…</div>
            ) : (
              <table>
                <thead>
                  <tr><th>Marca</th><th>Categoría</th><th>Plan</th><th>Estado</th><th>Eventos</th><th>Ventas</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {filtered.map(m => {
                    const estado = ESTADO_MAP[m.estado] || ESTADO_MAP.inactivo;
                    return (
                      <tr key={m.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Tag size={16} color="#fff" />
                            </div>
                            <div>
                              <div style={{ fontWeight: 700 }}>{m.nombre}</div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.rut}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="tag">{m.categoria}</span></td>
                        <td>
                          <span className={`badge ${m.plan === 'premium' ? 'badge-purple' : m.plan === 'enterprise' ? 'badge-info' : 'badge-gray'}`}>
                            {m.plan}
                          </span>
                        </td>
                        <td><span className={`badge ${estado.cls}`}>{estado.label}</span></td>
                        <td style={{ fontWeight: 600 }}>{m.totalEventos}</td>
                        <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                          ${(m.ventasTotales / 1000000).toFixed(1)}M
                        </td>
                        <td>
                          <button className="btn btn-ghost btn-sm" onClick={() => setModal(m)}>Editar</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
