import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Calendar, DollarSign, Star, TrendingUp } from 'lucide-react';
import Topbar from '../../components/Topbar';
import StatCard from '../../components/StatCard';
import EventoCard from '../../components/EventoCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function EmpresaDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.empresaId)
      api.get(`/dashboard/empresa/${user.empresaId}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando dashboard…</div>;
  if (!data) return null;

  const { empresa, stats, eventosActivos, eventosProximos, topColaboradores, participacionMensual } = data;

  return (
    <>
      <Topbar title={`Portal ${empresa.nombre}`} subtitle="Gestiona los beneficios de tus colaboradores" />
      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <StatCard label="Colaboradores Activos" value={stats.colaboradoresActivos} icon={Users} color="#028090" changePct={3} change="este mes" />
          <StatCard label="Eventos Disponibles" value={stats.eventosDisponibles} icon={Calendar} color="#4F46E5" />
          <StatCard label="Ahorro Total Generado" value={stats.ahorroTotal} icon={DollarSign} color="#10B981" prefix="$" changePct={18} />
          <StatCard label="Satisfacción" value={stats.satisfaccion} icon={Star} color="#F59E0B" suffix="%" />
        </div>

        {/* Participación chart */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          <div className="card">
            <div className="section-title">Participación Mensual de Colaboradores</div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={participacionMensual} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="gEmpresa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#028090" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#028090" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => [v, 'Colaboradores']} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }} />
                <Area type="monotone" dataKey="participacion" stroke="#028090" strokeWidth={2.5} fill="url(#gEmpresa)" dot={{ fill: '#028090', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top colaboradores */}
          <div className="card">
            <div className="section-title">Top Colaboradores por Puntos</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topColaboradores.map((c, i) => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `hsl(${i * 55 + 160}, 60%, 50%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                    #{i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{c.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.cargo}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={13} color="#F59E0B" fill="#F59E0B" />
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{c.puntos}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Eventos activos */}
        {eventosActivos.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div className="section-title">Eventos Activos para tus Colaboradores</div>
            <div className="grid-3">
              {eventosActivos.map(ev => (
                <EventoCard key={ev.id} evento={ev} />
              ))}
            </div>
          </div>
        )}

        {/* Próximos eventos */}
        {eventosProximos.length > 0 && (
          <div>
            <div className="section-title">Próximos Eventos</div>
            <div className="grid-3">
              {eventosProximos.map(ev => (
                <EventoCard key={ev.id} evento={ev} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
