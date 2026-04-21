import { useEffect, useState } from 'react';
import { Search, Plus, Building2 } from 'lucide-react';
import Topbar from '../../components/Topbar';
import api from '../../services/api';

export default function AdminEmpresas() {
  const [empresas, setEmpresas] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/empresas').then(r => setEmpresas(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = empresas.filter(e =>
    e.nombre.toLowerCase().includes(search.toLowerCase()) ||
    e.industria.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar title="Gestión de Empresas" subtitle="Administra las empresas cliente de NexLink" />
      <div className="page-body">
        <div className="page-header">
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Buscar empresa..." style={{ paddingLeft: 32, width: 240, height: 38 }}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary"><Plus size={16} /> Nueva Empresa</button>
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Empresas', value: empresas.length, color: '#4F46E5' },
            { label: 'Activas', value: empresas.filter(e => e.estado === 'activo').length, color: '#10B981' },
            { label: 'Colaboradores Total', value: empresas.reduce((s, e) => s + e.totalColaboradores, 0).toLocaleString('es-CL'), color: '#06B6D4' },
            { label: 'Ahorro Generado', value: `$${(empresas.reduce((s, e) => s + e.estadisticas.ahorroColaboradores, 0) / 1000000).toFixed(1)}M`, color: '#10B981' },
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
                            {e.logo}
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
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                        ${(e.estadisticas.ahorroColaboradores / 1000000).toFixed(1)}M
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 60 }}>
                            <div className="progress-fill" style={{ width: `${e.estadisticas.satisfaccion}%`, background: e.estadisticas.satisfaccion > 90 ? '#10B981' : '#F59E0B' }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{e.estadisticas.satisfaccion}%</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm">Ver</button>
                          <button className="btn btn-ghost btn-sm">Editar</button>
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
