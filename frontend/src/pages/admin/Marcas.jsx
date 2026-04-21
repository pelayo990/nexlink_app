import { useEffect, useState } from 'react';
import { Search, Plus, Tag } from 'lucide-react';
import Topbar from '../../components/Topbar';
import api from '../../services/api';

const ESTADO_MAP = {
  activo:   { label: 'Activo',   cls: 'badge-success' },
  pendiente:{ label: 'Pendiente',cls: 'badge-warning' },
  inactivo: { label: 'Inactivo', cls: 'badge-gray' },
};

export default function AdminMarcas() {
  const [marcas, setMarcas] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/marcas').then(r => setMarcas(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = marcas.filter(m =>
    m.nombre.toLowerCase().includes(search.toLowerCase()) ||
    m.categoria.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar title="Gestión de Marcas" subtitle="Administra todas las marcas de la plataforma" />
      <div className="page-body">
        <div className="page-header">
          <div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" placeholder="Buscar marca..." style={{ paddingLeft: 32, width: 240, height: 38 }}
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
          <button className="btn btn-primary"><Plus size={16} /> Nueva Marca</button>
        </div>

        {/* Summary cards */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 24 }}>
          {[
            { label: 'Total Marcas', value: marcas.length, color: '#4F46E5' },
            { label: 'Activas', value: marcas.filter(m => m.estado === 'activo').length, color: '#10B981' },
            { label: 'Pendientes', value: marcas.filter(m => m.estado === 'pendiente').length, color: '#F59E0B' },
            { label: 'Plan Premium', value: marcas.filter(m => m.plan === 'premium').length, color: '#7C3AED' },
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
                  <tr>
                    <th>Marca</th>
                    <th>Categoría</th>
                    <th>Plan</th>
                    <th>Estado</th>
                    <th>Eventos</th>
                    <th>Ventas</th>
                    <th>Colaboradores</th>
                    <th>Acciones</th>
                  </tr>
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
                        <td style={{ fontWeight: 600 }}>{m.statsVentas.totalEventos}</td>
                        <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                          ${(m.statsVentas.ventasTotales / 1000000).toFixed(1)}M
                        </td>
                        <td style={{ fontWeight: 600 }}>{m.statsVentas.colaboradoresAlcanzados.toLocaleString('es-CL')}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-secondary btn-sm">Ver</button>
                            <button className="btn btn-ghost btn-sm">Editar</button>
                          </div>
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
