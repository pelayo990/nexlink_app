import { useEffect, useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import Topbar from '../../components/Topbar';
import EventoCard from '../../components/EventoCard';
import api from '../../services/api';

export default function AdminEventos() {
  const [eventos, setEventos] = useState([]);
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/eventos').then(r => setEventos(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = eventos.filter(ev => {
    const matchSearch = ev.nombre.toLowerCase().includes(search.toLowerCase()) ||
      ev.marca?.nombre?.toLowerCase().includes(search.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || ev.estado === filtroEstado;
    return matchSearch && matchEstado;
  });

  return (
    <>
      <Topbar title="Gestión de Eventos" subtitle="Controla todos los eventos flash de la plataforma" />
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
          <button className="btn btn-primary"><Plus size={16} /> Nuevo Evento</button>
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Eventos', value: eventos.length, color: '#4F46E5' },
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
        ) : (
          <div className="grid-3">
            {filtered.map(ev => (
              <EventoCard key={ev.id} evento={ev} showActions />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
