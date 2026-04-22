import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, Star } from 'lucide-react';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function EmpresaReportes() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.empresaId)
      api.get(`/reportes/empresa/${user.empresaId}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando reportes…</div>;
  if (!data) return null;

  const { kpis, topProductos, topColaboradores, ventasMensuales } = data;

  return (
    <>
      <Topbar title="Reportes" subtitle="Métricas reales de tu empresa" />
      <div className="page-body">

        {/* KPIs */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <StatCard label="Total Compras" value={kpis.totalCompras} icon={ShoppingCart} color="#4F46E5" />
          <StatCard label="Monto Total" value={kpis.montoTotal} icon={DollarSign} color="#10B981" prefix="$" />
          <StatCard label="Ahorro Generado" value={kpis.ahorroTotal} icon={TrendingUp} color="#7C3AED" prefix="$" />
          <StatCard label="Ticket Promedio" value={kpis.ticketPromedio} icon={DollarSign} color="#F59E0B" prefix="$" />
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 28 }}>
          <StatCard label="Colaboradores" value={kpis.totalColaboradores} icon={Users} color="#06B6D4" />
          <StatCard label="Productos" value={kpis.totalProductos} icon={Package} color="#EF4444" />
          <StatCard label="Eventos" value={kpis.totalEventos} icon={Package} color="#0EA5E9" />
        </div>

        {/* Gráfico ventas por mes */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title">Compras por mes (CLP)</div>
          {ventasMensuales.length === 0 ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Sin compras registradas aún
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={ventasMensuales} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gEmpresaReporte" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip formatter={v => [`$${v.toLocaleString('es-CL')}`, 'Compras']}
                  contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }} />
                <Area type="monotone" dataKey="monto" stroke="#4F46E5" strokeWidth={2.5}
                  fill="url(#gEmpresaReporte)" dot={{ fill: '#4F46E5', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="grid-2">
          {/* Top productos */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>Top productos más comprados</div>
            {topProductos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 13 }}>Sin compras aún</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Producto</th><th>Categoría</th><th>Compras</th><th>Monto</th></tr></thead>
                  <tbody>
                    {topProductos.map((p, i) => (
                      <tr key={p.productoId}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: `hsl(${i * 60 + 220}, 70%, 55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800 }}>#{i + 1}</div>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{p.nombre}</span>
                          </div>
                        </td>
                        <td><span className="tag">{p.categoria}</span></td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{p._count}</td>
                        <td style={{ fontWeight: 700, color: 'var(--success)' }}>${(p._sum.monto / 1000).toFixed(0)}K</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top colaboradores */}
          <div className="card">
            <div className="section-title" style={{ marginBottom: 16 }}>Top colaboradores por puntos</div>
            {topColaboradores.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 13 }}>Sin colaboradores aún</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topColaboradores.map((c, i) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: i < topColaboradores.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${i * 55 + 160}, 60%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                      #{i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{c.nombre}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.cargo || '—'}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={13} color="#F59E0B" fill="#F59E0B" />
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{c.puntos}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
