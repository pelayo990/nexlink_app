import { useEffect, useState } from 'react';
import { Search, Plus, X, Calendar } from 'lucide-react';
import Topbar from '../../components/Topbar';
import EventoCard from '../../components/EventoCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const EMPTY = { nombre: '', descripcion: '', fechaInicio: '', fechaFin: '', estado: 'proximo', tipo: 'flash', destacado: false, maxComprasPorColaborador: 2, empresasInvitadas: [] };

function Modal({ evento, onClose, onSave, empresaId }) {
  const [form, setForm] = useState(evento ? {
    ...evento,
    fechaInicio: evento.fechaInicio ? new Date(evento.fechaInicio).toISOString().slice(0, 16) : '',
    fechaFin: evento.fechaFin ? new Date(evento.fechaFin).toISOString().slice(0, 16) : '',
  } : EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.nombre || !form.fechaInicio || !form.fechaFin)
      return setError('Nombre y fechas son obligatorios');
    setLoading(true);
    setError('');
    try {
      const payload = { ...form, maxComprasPorColaborador: parseInt(form.maxComprasPorColaborador) || 2, empresasInvitadas: [empresaId] };
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
      <div style={{ position: 'relative', background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', overflowX: 'hidden', padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{evento?.id ? 'Editar Evento' : 'Nuevo Evento'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nombre *</label>
            <input className="input" value={form.nombre} onChange={e => set('nombre', e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Descripción</label>
            <textarea className="input" value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={3} style={{ width: '100%', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Fecha inicio *</label>
              <input className="input" type="datetime-local" value={form.fechaInicio} onChange={e => set('fechaInicio', e.target.value)} style={{ width: '100%', minWidth: 0 }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Fecha fin *</label>
              <input className="input" type="datetime-local" value={form.fechaFin} onChange={e => set('fechaFin', e.target.value)} style={{ width: '100%', minWidth: 0 }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
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

export default function EmpresaEventos() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const cargar = () => {
    setLoading(true);
    api.get('/eventos').then(r => setEventos(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const filtered = eventos.filter(ev =>
    ev.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar title="Mis Eventos" subtitle="Gestiona los eventos flash de tu empresa" />
      {modal && <Modal evento={modal === 'new' ? null : modal} empresaId={user?.empresaId} onClose={() => setModal(null)} onSave={() => { setModal(null); cargar(); }} />}
      <div className="page-body">
        <div className="page-header">
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Buscar evento..." style={{ paddingLeft: 32, width: 220, height: 38 }}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={16} /> Nuevo Evento</button>
        </div>
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total', value: eventos.length, color: '#4F46E5' },
            { label: 'Activos', value: eventos.filter(e => e.estado === 'activo').length, color: '#10B981' },
            { label: 'Próximos', value: eventos.filter(e => e.estado === 'proximo').length, color: '#F59E0B' },
            { label: 'Finalizados', value: eventos.filter(e => e.estado === 'finalizado').length, color: '#94A3B8' },
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
            <div style={{ fontSize: 16, fontWeight: 600 }}>No hay eventos aún</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>Crea tu primer evento flash para tus colaboradores</div>
          </div>
        ) : (
          <div className="grid-3">
            {filtered.map(ev => (
              <div key={ev.id} style={{ position: 'relative' }}>
                <EventoCard evento={ev} showActions />
                <button className="btn btn-secondary btn-sm" onClick={() => setModal(ev)} style={{ position: 'absolute', top: 12, right: 12 }}>Editar</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
