import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Building2, Users, Calendar, DollarSign, Activity, TrendingUp, Award } from 'lucide-react';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';
import api from '../../services/api';

const COLORS = ['#4F46E5', '#7C3AED', '#06B6D4', '#10B981'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin').then(r => setData(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando dashboard…</div>;
  if (!data) return null;

  const { resumen, ventasMensuales, topEmpresas, eventosPorEstado } = data;

  return (
    <>
      <Topbar title="Dashboard General" subtitle="Vista ejecutiva de la plataforma NexLink" />
      <div className="page-body">
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <StatCard label="Empresas Activas" value={resumen.empresasActivas} icon={Building2} color="#4F46E5" changePct={8} change="vs mes anterior" />
          <StatCard label="Colaboradores" value={resumen.totalColaboradores} icon={Users} color="#06B6D4" changePct={24} change="vs mes anterior" />
          <StatCard label="Ventas Plataforma" value={resumen.ventasTotalesPlataforma} icon={DollarSign} color="#10B981" prefix="$" changePct={31} change="vs mes anterior" />
          <StatCard label="Eventos Activos" value={resumen.eventosActivos} icon={Activity} color="#F59E0B" />
        </div>

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 28 }}>
          <StatCard label="Total Empresas" value={resumen.totalEmpresas} icon={Building2} color="#7C3AED" />
          <StatCard label="Eventos Totales" value={resumen.totalEventos} icon={Calendar} color="#EF4444" />
          <StatCard label="Eventos Próximos" value={resumen.eventosPorEstado?.proximo || 0} icon={TrendingUp} color="#0EA5E9" />
          <StatCard label="Eventos Finalizados" value={resumen.eventosPorEstado?.finalizado || 0} icon={Award} color="#8B5CF6" />
        </div>

        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="section-title">Ventas Mensuales (CLP)</div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={ventasMensuales} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `$${(v / 1000000).toFixed(0)}M`} />
                <Tooltip formatter={v => [`$${v.toLocaleString('es-CL')}`, 'Ventas']}
                  contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }} />
                <Area type="monotone" dataKey="ventas" stroke="#4F46E5" strokeWidth={2.5}
                  fill="url(#gVentas)" dot={{ fill: '#4F46E5', strokeWidth: 2, r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <div className="section-title">Eventos por Estado</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40 }}>
              <PieChart width={180} height={180}>
                <Pie data={[
                  { name: 'Activo', value: eventosPorEstado.activo || 0 },
                  { name: 'Próximo', value: eventosPorEstado.proximo || 0 },
                  { name: 'Finalizado', value: eventosPorEstado.finalizado || 0 },
                ]} cx={85} cy={85} innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {COLORS.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }} />
              </PieChart>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Activos', value: eventosPorEstado.activo || 0, color: COLORS[0] },
                  { label: 'Próximos', value: eventosPorEstado.proximo || 0, color: COLORS[1] },
                  { label: 'Finalizados', value: eventosPorEstado.finalizado || 0, color: COLORS[2] },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</span>
                    <span style={{ fontSize: 15, fontWeight: 700, marginLeft: 'auto', paddingLeft: 16 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={16} color="var(--primary)" /> Top Empresas por Compras
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Empresa</th><th>Industria</th><th>Colaboradores</th><th>Compras</th></tr></thead>
              <tbody>
                {topEmpresas.map((e, i) => (
                  <tr key={e.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: `hsl(${i * 80 + 150}, 60%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 800 }}>
                          #{i + 1}
                        </div>
                        <span style={{ fontWeight: 600 }}>{e.nombre}</span>
                      </div>
                    </td>
                    <td><span className="tag">{e.industria}</span></td>
                    <td style={{ fontWeight: 600 }}>{e.colaboradores?.toLocaleString('es-CL')}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>${(e.compras / 1000000).toFixed(1)}M</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
