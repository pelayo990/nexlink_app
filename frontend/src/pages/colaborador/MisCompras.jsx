import { useEffect, useState } from 'react';
import { ShoppingBag, Star, Package } from 'lucide-react';
import Topbar from '../../components/Topbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function MisCompras() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.colaboradorId)
      api.get(`/dashboard/colaborador/${user.colaboradorId}`).then(r => setData(r.data)).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Cargando…</div>;

  const stats = data?.stats || {};
  const historial = data?.historialCompras || [];

  return (
    <>
      <Topbar title="Mis Compras" subtitle="Historial y puntos acumulados" />
      <div className="page-body">
        <div className="grid-3" style={{ marginBottom: 24 }}>
          {[
            { icon: '🛍️', label: 'Compras Totales', value: stats.comprasTotales || 0, color: '#4F46E5' },
            { icon: '⭐', label: 'Puntos Acumulados', value: stats.puntos || 0, color: '#F59E0B' },
            { icon: '💰', label: 'Total Ahorrado', value: `$${(stats.montoAhorrado || 0).toLocaleString('es-CL', { maximumFractionDigits: 0 })}`, color: '#10B981' },
          ].map(s => (
            <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 36 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Historial de Compras</div>
          </div>
          {historial.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <p>No tienes compras aún. ¡Visita el marketplace!</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Producto</th><th>Evento</th><th>Fecha</th><th>Monto</th><th>Estado</th></tr></thead>
                <tbody>
                  {historial.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600 }}>{c.productoId}</td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{c.eventoId}</td>
                      <td style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(c.fecha).toLocaleDateString('es-CL')}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>${c.monto.toLocaleString('es-CL')}</td>
                      <td><span className={`badge ${c.estado === 'completada' ? 'badge-success' : 'badge-warning'}`}>{c.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
