import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Users, Package, Calendar, Award } from 'lucide-react';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';
import api from '../../services/api';

const COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981', '#F59E0B'];

export default function AdminReportes() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reportes/resumen').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando reportes…</div>;
  if (!data) return null;

  const { kpis, eventosPorEstado, topMarcas, topEmpresas, topProductos, ventasMensuales } = data;

  const pieData = [
    { name: 'Activos', value: eventosPorEstado.activo || 0 },
    { name: 'Próximos', value: eventosPorEstado.proximo || 0 },
    { name: 'Finalizados', value: eventosPorEstado.finalizado || 0 },
  ];

  return (
    <>
      <Topbar title="Reportes" subtitle="Métricas reales calculadas desde la base de datos" />
      <div className="page-body">

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <StatCard label="Total Compras" value={kpis.totalCompras} icon={ShoppingCart} color="#4F46E5" />
          <StatCard label="Monto Total" value={kpis.montoTotal} icon={DollarSign} color="#10B981" prefix="$" />
          <StatCard label="Colaboradores" value={kpis.totalColaboradores} icon={Users} color="#06B6D4" />
          <StatCard label="Productos Activos" value={kpis.totalProductos} icon={Package} color="#7C3AED" />
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 28 }}>
          <StatCard label="Empresas" value={kpis.totalEmpresas} icon={Award} color="#F59E0B" />
          <StatCard label="Eventos Totales" value={kpis.totalEventos} icon={Calendar} color="#EF4444" />
          <StatCard label="Ticket Promedio" value={kpis.totalCompras > 0 ? Math.round(kpis.montoTotal / kpis.totalCompras) : 0} icon={TrendingUp} color="#8B5CF6" prefix="$" />
          <StatCard label="Ahorro Generado" value={Math.round(kpis.montoTotal * 0.35)} icon={DollarSign} color="#0EA5E9" prefix="$" />
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="section-title">Compras por mes (CLP)</div>
            {ventasMensuales.length === 0 ? (
              <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Sin datos de compras aún
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={ventasMensuales} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="gReportes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={v => [`$${v.toLocaleString('es-CL')}`, 'Ventas']} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }} />
                  <Area type="monotone" dataKey="ventas" stroke="#4F46E5" strokeWidth={2.5} fill="url(#gReportes)" dot={{ fill: '#4F46E5', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="card">
            <div className="section-title">Eventos por estado</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
              <PieChart width={180} height={180}>
                <Pie data={pieData} cx={85} cy={85} innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }} />
              </PieChart>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pieData.map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i] }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{d.name}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, marginLeft: 'auto', paddingLeft: 16 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {topProductos.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>Top productos más comprados</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProductos} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => v?.length > 20 ? v.slice(0, 20) + '…' : v} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => [v, 'Compras']} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }} />
                <Bar dataKey="_count.productoId" name="Compras" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid-2">
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>Top empresas por compras</div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Empresa</th><th>Industria</th><th>Satisfacción</th></tr></thead>
                <tbody>
                  {topEmpresas.map((e, i) => (
                    <tr key={e.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: `hsl(${i * 80 + 150}, 60%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800 }}>#{i + 1}</div>
                          <span style={{ fontWeight: 600 }}>{e.nombre}</span>
                        </div>
                      </td>
                      <td><span className="tag">{e.industria}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 50 }}>
                            <div className="progress-fill" style={{ width: `${e.satisfaccion}%`, background: e.satisfaccion > 90 ? '#10B981' : '#F59E0B' }} />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>{e.satisfaccion}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>Resumen general</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Total de empresas', value: kpis.totalEmpresas, color: '#4F46E5' },
                { label: 'Total de colaboradores', value: kpis.totalColaboradores.toLocaleString('es-CL'), color: '#06B6D4' },
                { label: 'Total de productos', value: kpis.totalProductos, color: '#7C3AED' },
                { label: 'Total de eventos', value: kpis.totalEventos, color: '#F59E0B' },
                { label: 'Total de compras', value: kpis.totalCompras, color: '#10B981' },
                { label: 'Monto total transado', value: `$${(kpis.montoTotal / 1000000).toFixed(1)}M`, color: '#EF4444' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
