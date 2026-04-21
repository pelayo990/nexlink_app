import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Package, Calendar, Users, TrendingUp, Eye } from 'lucide-react';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const PIE_COLORS = ['#4F46E5', '#7C3AED', '#06B6D4'];

export default function MarcaDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.marcaId)
      api.get(`/dashboard/marca/${user.marcaId}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando dashboard…</div>;
  if (!data) return null;

  const { stats, ventasMensuales, productos, fuentesTrafico, eventosActivos, marca } = data;

  return (
    <>
      <Topbar title={`Bienvenido, ${marca.nombre}`} subtitle="Gestiona tus liquidaciones y maximiza tus ventas" />
      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <StatCard label="Ventas del Mes" value={stats.ventasMes} icon={DollarSign} color="#10B981" prefix="$" changePct={5.2} change="vs mes anterior" />
          <StatCard label="Productos en Liquidación" value={stats.productosActivos} icon={Package} color="#4F46E5" suffix=" Activos" />
          <StatCard label="Descuento Promedio" value={stats.descuentoPromedio} icon={TrendingUp} color="#F59E0B" suffix="% OFF" />
          <StatCard label="Puntos Canjeados" value={stats.puntosCanjeados} icon={Users} color="#7C3AED" suffix=" pts" />
        </div>

        {/* Charts */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          {/* Sales chart */}
          <div className="card">
            <div className="section-title">Ventas Mensuales</div>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={ventasMensuales} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gMarca" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000000).toFixed(0)}M`} />
                <Tooltip formatter={v => [`$${v.toLocaleString('es-CL')}`, 'Ventas']} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }} />
                <Area type="monotone" dataKey="ventas" stroke="#10B981" strokeWidth={2.5} fill="url(#gMarca)" dot={{ fill: '#10B981', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic */}
          <div className="card">
            <div className="section-title">Fuentes de Tráfico</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
              <PieChart width={180} height={180}>
                <Pie data={fuentesTrafico} cx={85} cy={85} innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="porcentaje">
                  {fuentesTrafico.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={v => [`${v}%`, '']} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }} />
              </PieChart>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {fuentesTrafico.map((f, i) => (
                  <div key={f.fuente} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: PIE_COLORS[i] }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f.fuente}</span>
                    <span style={{ fontSize: 16, fontWeight: 800, marginLeft: 'auto', paddingLeft: 16 }}>{f.porcentaje}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Liquidaciones activas */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Tus Liquidaciones Activas</div>
            <button className="btn btn-primary btn-sm">+ Crear Nueva Liquidación</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Producto</th><th>Descuento</th><th>Stock</th><th>Visitas</th><th>Estado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {productos.slice(0, 6).map(p => (
                  <tr key={p.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.sku}</div>
                      </div>
                    </td>
                    <td>
                      <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '3px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
                        {p.descuento}% OFF
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.stock}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Eye size={13} color="var(--text-muted)" />
                        <span>{(p.visitas || 0).toLocaleString('es-CL')}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.stock > p.stockMinimo * 2 ? 'badge-success' : 'badge-warning'}`}>
                        {p.stock > p.stockMinimo * 2 ? 'Activa' : 'Por Agotarse'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm">Editar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick stats sidebar */}
        <div className="grid-2">
          <div className="card">
            <div className="section-title">Estadísticas Rápidas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Ventas Hoy</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>$1.230.000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Nuevos Usuarios</span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>154.800</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Tasa de Rebote</span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>35.8%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Páginas / Sesión</span>
                <span style={{ fontSize: 18, fontWeight: 700 }}>6.2</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="section-title">Top Productos en Liquidación</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {productos.slice(0, 3).map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `hsl(${i * 60 + 220}, 70%, 55%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800 }}>
                    #{i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{p.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Stock: {p.stock}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>
                    {(p.visitas || 0).toLocaleString('es-CL')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
