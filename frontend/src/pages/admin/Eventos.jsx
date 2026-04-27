import { useEffect, useState } from 'react';
import { Search, Plus, X, Calendar, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Topbar from '../../components/Topbar';
import EventoCard from '../../components/EventoCard';
import api from '../../services/api';

const EMPTY = { nombre: '', descripcion: '', marcaId: '', fechaInicio: '', fechaFin: '', estado: 'proximo', tipo: 'flash', destacado: false, maxComprasPorColaborador: 2, empresasInvitadas: [] };

function Modal({ evento, marcas, empresas, onClose, onSave }) {
  const [form, setForm] = useState(evento ? {
    ...evento,
    fechaInicio: evento.fechaInicio ? new Date(evento.fechaInicio).toISOString().slice(0, 16) : '',
    fechaFin: evento.fechaFin ? new Date(evento.fechaFin).toISOString().slice(0, 16) : '',
    empresasInvitadas: evento.empresas?.map(e => e.empresaId) || [],
  } : EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleEmpresa = (id) => {
    setForm(f => ({
      ...f,
      empresasInvitadas: f.empresasInvitadas.includes(id)
        ? f.empresasInvitadas.filter(e => e !== id)
        : [...f.empresasInvitadas, id],
    }));
  };

  const handleSubmit = async () => {
    if (!form.nombre || !form.fechaInicio || !form.fechaFin)
      return setError('Nombre y fechas son obligatorios');
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        maxComprasPorColaborador: parseInt(form.maxComprasPorColaborador) || 2,
      };
      if (evento?.id) {
        await api.put(`/eventos/${evento.id}`, payload);
      } else {
        await api.post('/eventos', payload);
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
      <div style={{ position: 'relative', background: '#fff', borderRadius: 16, width: 580, maxHeight: '90vh', overflowY: 'auto', padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{evento?.id ? 'Editar Evento' : 'Nuevo Evento'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nombre *</label>
            <input className="input" value={form.nombre} onChange={e => set('nombre', e.target.value)} placeholder="Ej: Samsung Tech Flash #9" style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Descripción</label>
            <textarea className="input" value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={3} style={{ width: '100%', resize: 'vertical' }} placeholder="Descripción del evento..." />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Marca</label>
            <select className="input" value={form.marcaId} onChange={e => set('marcaId', e.target.value)} style={{ width: '100%' }}>
              <option value="">Seleccionar marca...</option>
              {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Fecha inicio *</label>
              <input className="input" type="datetime-local" value={form.fechaInicio} onChange={e => set('fechaInicio', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Fecha fin *</label>
              <input className="input" type="datetime-local" value={form.fechaFin} onChange={e => set('fechaFin', e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Estado</label>
              <select className="input" value={form.estado} onChange={e => set('estado', e.target.value)} style={{ width: '100%' }}>
                <option value="proximo">Próximo</option>
                <option value="activo">Activo</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Máx. compras/colaborador</label>
              <input className="input" type="number" value={form.maxComprasPorColaborador} onChange={e => set('maxComprasPorColaborador', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, paddingBottom: 8 }}>
                <input type="checkbox" checked={form.destacado} onChange={e => set('destacado', e.target.checked)} />
                Destacado
              </label>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 10 }}>Empresas invitadas</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {empresas.map(e => (
                <button key={e.id} onClick={() => toggleEmpresa(e.id)}
                  style={{
                    padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: '1.5px solid',
                    borderColor: form.empresasInvitadas.includes(e.id) ? 'var(--primary)' : 'var(--border)',
                    background: form.empresasInvitadas.includes(e.id) ? '#EEF2FF' : '#fff',
                    color: form.empresasInvitadas.includes(e.id) ? 'var(--primary)' : 'var(--text-secondary)',
                  }}>
                  {e.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : evento?.id ? 'Guardar cambios' : 'Crear Evento'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminEventos() {
  const [eventos, setEventos] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const cargar = () => {
    setLoading(true);
    Promise.all([
      api.get('/eventos'),
      api.get('/marcas'),
      api.get('/empresas'),
    ]).then(([evRes, mRes, eRes]) => {
      setEventos(evRes.data);
      setMarcas(mRes.data);
      setEmpresas(eRes.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const navigate = useNavigate();
  const handleSave = () => { setModal(null); cargar(); };
  const [eliminando, setEliminando] = useState(null);

  const eliminar = async (id, nombre) => {
    if (!confirm(`¿Eliminar el evento "${nombre}"? Esta acción no se puede deshacer.`)) return;
    setEliminando(id);
    try {
      await api.delete(`/eventos/${id}`);
      cargar();
    } catch (e) {
      alert(e.response?.data?.error || 'Error al eliminar');
    } finally {
      setEliminando(null);
    }
  };

  const filtered = eventos.filter(ev => {
    const matchSearch = ev.nombre.toLowerCase().includes(search.toLowerCase()) ||
      ev.marca?.nombre?.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || ev.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  return (
    <>
      <Topbar title="Gestión de Eventos" subtitle="Controla todos los eventos flash de la plataforma" />
      {modal && <Modal evento={modal === 'new' ? null : modal} marcas={marcas} empresas={empresas} onClose={() => setModal(null)} onSave={handleSave} />}

      <div className="page-body">
        <div className="page-header">
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" placeholder="Buscar evento..." style={{ paddingLeft: 32, width: 220, height: 38 }}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input" style={{ width: 160, height: 38 }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="proximo">Próximos</option>
              <option value="finalizado">Finalizados</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={16} /> Nuevo Evento</button>
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Eventos',  value: eventos.length,                                          color: '#4F46E5' },
            { label: 'Activos',        value: eventos.filter(e => e.estado === 'activo').length,       color: '#10B981' },
            { label: 'Próximos',       value: eventos.filter(e => e.estado === 'proximo').length,      color: '#F59E0B' },
            { label: 'Finalizados',    value: eventos.filter(e => e.estado === 'finalizado').length,   color: '#94A3B8' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>Cargando eventos…</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <Calendar size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 16, fontWeight: 600 }}>No hay eventos</div>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map(ev => (
              <EventoCard key={ev.id} evento={ev} showActions onEdit={ev => setModal(ev)} onDelete={ev => eliminar(ev.id, ev.nombre)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
