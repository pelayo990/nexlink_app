import { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import Topbar from '../../components/Topbar';
import api from '../../services/api';

export default function AdminColaboradores() {
  const [colaboradores, setColaboradores] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/colaboradores').then(r => setColaboradores(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = colaboradores.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.cargo?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar title="Colaboradores" subtitle="Todos los colaboradores de la plataforma" />
      <div className="page-body">
        <div className="page-header">
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Buscar colaborador..." style={{ paddingLeft: 32, width: 260, height: 38 }}
              value={search} onChange={e => setSearch(e.target.value)} />
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
                  <tr><th>Colaborador</th><th>Empresa</th><th>Cargo</th><th>Estado</th><th>Compras</th><th>Puntos</th></tr>
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
                      <td style={{ fontSize: 13 }}>{c.empresaId}</td>
                      <td style={{ fontSize: 13 }}>{c.cargo || '—'}</td>
                      <td><span className={`badge ${c.estado === 'activo' ? 'badge-success' : 'badge-gray'}`}>{c.estado}</span></td>
                      <td style={{ fontWeight: 600 }}>{c.compras?.length || 0}</td>
                      <td style={{ fontWeight: 700, color: '#F59E0B' }}>{c.puntos || 0}</td>
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
