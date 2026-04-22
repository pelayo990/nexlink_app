import { useEffect, useState } from 'react';
import { Search, Plus, Building2, X, Trash2 } from 'lucide-react';
import Topbar from '../../components/Topbar';
import api from '../../services/api';

const EMPTY = { nombre: '', industria: '', contactoRRHH: '', emailRRHH: '', telefono: '', rut: '', plan: 'standard', estado: 'activo', totalColaboradores: 0, dominiosPermitidos: [], usuarioEmail: '', usuarioPassword: '', usuarioNombre: '' };

function Modal({ empresa, onClose, onSave }) {
  const [form, setForm] = useState(empresa || EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const [dominioInput, setDominioInput] = useState('');

  const agregarDominio = () => {
    const d = dominioInput.trim().toLowerCase().replace('@', '');
    if (!d || form.dominiosPermitidos.includes(d)) return;
    setForm(f => ({ ...f, dominiosPermitidos: [...f.dominiosPermitidos, d] }));
    setDominioInput('');
  };

  const eliminarDominio = (d) => {
    setForm(f => ({ ...f, dominiosPermitidos: f.dominiosPermitidos.filter(x => x !== d) }));
  };

  const handleSubmit = async () => {
    if (!form.nombre || !form.industria) return setError('Nombre e industria son obligatorios');
    if (!empresa?.id && (!form.usuarioNombre || !form.usuarioEmail || !form.usuarioPassword))
      return setError('El nombre, email y contraseña del administrador son obligatorios');
    if (!empresa?.id && form.usuarioPassword.length < 6)
      return setError('La contraseña debe tener al menos 6 caracteres');
    setLoading(true);
    setError('');
    try {
      if (empresa?.id) {
        await api.put(`/empresas/${empresa.id}`, form);
      } else {
        await api.post('/empresas', form);
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
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{empresa?.id ? 'Editar Empresa' : 'Nueva Empresa'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nombre *</label>
              <input className="input" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Banco de Chile" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Industria *</label>
              <select className="input" value={form.industria} onChange={e => set('industria', e.target.value)} style={{ width: '100%' }}>
                <option value="">Seleccionar...</option>
                {['Banca y Finanzas','Telecomunicaciones','Retail','Aviación','Tecnología','Salud','Educación','Energía','Minería','Otro'].map(i => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>RUT</label>
              <input className="input" value={form.rut} onChange={e => set('rut', e.target.value)} placeholder="97.006.000-6" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Teléfono</label>
              <input className="input" value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+56 2 2637 1111" style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Contacto RRHH</label>
              <input className="input" value={form.contactoRRHH} onChange={e => set('contactoRRHH', e.target.value)} placeholder="Nombre del contacto" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email RRHH</label>
              <input className="input" type="email" value={form.emailRRHH} onChange={e => set('emailRRHH', e.target.value)} placeholder="rrhh@empresa.cl" style={{ width: '100%' }} />
            </div>
          </div>

          <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Dominios de email permitidos</label>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                Los colaboradores solo podrán registrarse con emails de estos dominios (ej: bancochile.cl)
              </p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <input className="input" value={dominioInput} onChange={e => setDominioInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && agregarDominio()}
                  placeholder="ej: bancochile.cl" style={{ flex: 1 }} />
                <button className="btn btn-secondary" onClick={agregarDominio} type="button">Agregar</button>
              </div>
              {form.dominiosPermitidos.length === 0 ? (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Sin dominios agregados</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {form.dominiosPermitidos.map(d => (
                    <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EEF2FF', color: '#4F46E5', padding: '4px 10px', borderRadius: 99, fontSize: 13, fontWeight: 600 }}>
                      @{d}
                      <button onClick={() => eliminarDominio(d)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4F46E5', padding: 0, display: 'flex', alignItems: 'center' }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>N° Colaboradores</label>
              <input className="input" type="number" value={form.totalColaboradores} onChange={e => set('totalColaboradores', parseInt(e.target.value) || 0)} style={{ width: '100%' }} />
            </div>
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

        {!empresa?.id && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, marginTop: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Usuario administrador de la empresa</div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Se creará automáticamente una cuenta para que la empresa pueda ingresar al portal.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nombre del administrador *</label>
                <input className="input" value={form.usuarioNombre} onChange={e => set('usuarioNombre', e.target.value)}
                  placeholder="Ej: Roberto Fuentes" style={{ width: '100%' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email de acceso *</label>
                  <input className="input" type="email" value={form.usuarioEmail} onChange={e => set('usuarioEmail', e.target.value)}
                    placeholder="admin@empresa.cl" style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Contraseña *</label>
                  <input className="input" type="password" value={form.usuarioPassword} onChange={e => set('usuarioPassword', e.target.value)}
                    placeholder="Mínimo 6 caracteres" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : empresa?.id ? 'Guardar cambios' : 'Crear Empresa'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminEmpresas() {
  const [empresas, setEmpresas] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const cargar = () => {
    setLoading(true);
    api.get('/empresas').then(r => setEmpresas(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const handleSave = () => { setModal(null); cargar(); };
  const [eliminando, setEliminando] = useState(null);

  const eliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar la empresa "${nombre}"? Se eliminarán todos sus colaboradores, productos y eventos. Esta acción no se puede deshacer.`)) return;
    setEliminando(id);
    try {
      await api.delete(`/empresas/${id}`);
      cargar();
    } catch (e) {
      alert(e.response?.data?.error || 'Error al eliminar');
    } finally {
      setEliminando(null);
    }
  };

  const filtered = empresas.filter(e =>
    e.nombre.toLowerCase().includes(search.toLowerCase()) ||
    e.industria.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar title="Gestión de Empresas" subtitle="Administra las empresas cliente de NexLink" />
      {modal && <Modal empresa={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />}

      <div className="page-body">
        <div className="page-header">
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Buscar empresa..." style={{ paddingLeft: 32, width: 240, height: 38 }}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={16} /> Nueva Empresa</button>
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Empresas',       value: empresas.length,                                                                                       color: '#4F46E5' },
            { label: 'Activas',              value: empresas.filter(e => e.estado === 'activo').length,                                                    color: '#10B981' },
            { label: 'Colaboradores Total',  value: empresas.reduce((s, e) => s + e.totalColaboradores, 0).toLocaleString('es-CL'),                        color: '#06B6D4' },
            { label: 'Ahorro Generado',      value: `$${(empresas.reduce((s, e) => s + e.ahorroColaboradores, 0) / 1000000).toFixed(1)}M`,                color: '#10B981' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando…</div> : (
              <table>
                <thead>
                  <tr><th>Empresa</th><th>Industria</th><th>Plan</th><th>Estado</th><th>Colaboradores</th><th>Ahorro generado</th><th>Satisfacción</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {filtered.map(e => (
                    <tr key={e.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#028090,#02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800 }}>
                            {e.logo || e.nombre.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700 }}>{e.nombre}</div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{e.emailRRHH}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="tag">{e.industria}</span></td>
                      <td><span className={`badge ${e.plan === 'enterprise' ? 'badge-purple' : e.plan === 'premium' ? 'badge-info' : 'badge-gray'}`}>{e.plan}</span></td>
                      <td><span className={`badge ${e.estado === 'activo' ? 'badge-success' : 'badge-warning'}`}>{e.estado}</span></td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{e.colaboradoresActivos.toLocaleString('es-CL')}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>de {e.totalColaboradores.toLocaleString('es-CL')}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>${(e.ahorroColaboradores / 1000000).toFixed(1)}M</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 60 }}>
                            <div className="progress-fill" style={{ width: `${e.satisfaccion}%`, background: e.satisfaccion > 90 ? '#10B981' : '#F59E0B' }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{e.satisfaccion}%</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setModal(e)}>Editar</button>
                          <button className="btn btn-ghost btn-sm" style={{ color: '#EF4444' }}
                            onClick={() => eliminar(e.id, e.nombre)}
                            disabled={eliminando === e.id}>
                            <Trash2 size={14} /> {eliminando === e.id ? '...' : 'Eliminar'}
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
