import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Package, Users, Clock, Trash2 } from 'lucide-react';
import Topbar from '../../components/Topbar';
import api from '../../services/api';

function CountdownTimer({ fechaFin }) {
  const [tiempo, setTiempo] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = new Date(fechaFin) - new Date();
      if (diff <= 0) return setTiempo('Finalizado');
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTiempo(`${d}d ${h}h ${m}m`);
    };
    calc();
    const t = setInterval(calc, 60000);
    return () => clearInterval(t);
  }, [fechaFin]);
  return <span style={{ color: '#EF4444', fontWeight: 700 }}><Clock size={13} style={{ display: 'inline', marginRight: 4 }} />{tiempo}</span>;
}

const ESTADO_COLORS = {
  activo: { bg: '#D1FAE5', color: '#065F46', label: 'Activo' },
  proximo: { bg: '#FEF3C7', color: '#92400E', label: 'Próximo' },
  finalizado: { bg: '#F1F5F9', color: '#64748B', label: 'Finalizado' },
};

export default function EventoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evento, setEvento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eliminando, setEliminando] = useState(false);

  const eliminar = async () => {
    if (!confirm(`¿Eliminar el evento "${evento.nombre}"? Esta acción no se puede deshacer.`)) return;
    setEliminando(true);
    try {
      await api.delete(`/eventos/${id}`);
      navigate(-1);
    } catch (e) {
      alert(e.response?.data?.error || 'Error al eliminar');
      setEliminando(false);
    }
  };

  useEffect(() => {
    api.get(`/eventos/${id}`).then(r => setEvento(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando evento…</div>;
  if (!evento) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Evento no encontrado</div>;

  const estado = ESTADO_COLORS[evento.estado] || ESTADO_COLORS.finalizado;
  const empresasInvitadas = evento.empresas || [];
  const productos = evento.productos || [];

  return (
    <>
      <Topbar title={evento.nombre} subtitle="Detalle del evento flash" />
      <div className="page-body">

        {/* Botón volver + eliminar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600, padding: 0 }}>
            <ArrowLeft size={16} /> Volver
          </button>
          <button onClick={eliminar} disabled={eliminando}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, cursor: 'pointer', color: '#EF4444', fontSize: 14, fontWeight: 600, padding: '8px 16px' }}>
            <Trash2 size={15} /> {eliminando ? 'Eliminando...' : 'Eliminar evento'}
          </button>
        </div>

        {/* Header del evento */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{evento.nombre}</h2>
                <span style={{ background: estado.bg, color: estado.color, padding: '4px 12px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                  {estado.label}
                </span>
              </div>
              {evento.descripcion && (
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{evento.descripcion}</p>
              )}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <Calendar size={15} />
                  <span>Inicio: <strong>{new Date(evento.fechaInicio).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <Calendar size={15} />
                  <span>Fin: <strong>{new Date(evento.fechaFin).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></span>
                </div>
                {evento.estado === 'activo' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <CountdownTimer fechaFin={evento.fechaFin} />
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { icon: Package, label: 'Productos', value: productos.length, color: '#4F46E5' },
                { icon: Users, label: 'Empresas', value: empresasInvitadas.length, color: '#10B981' },
                { icon: Users, label: 'Máx. compras', value: evento.maxComprasPorColaborador, color: '#F59E0B' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '12px 20px', background: 'var(--bg)', borderRadius: 12 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* Productos del evento */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Productos del evento</div>
            </div>
            {productos.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Sin productos asignados</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Producto</th><th>Precio</th><th>Desc.</th><th>Stock</th></tr></thead>
                  <tbody>
                    {productos.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{p.nombre}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.categoria}</div>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>${p.precioEvento.toLocaleString('es-CL')}</td>
                        <td><span style={{ background: '#FEE2E2', color: '#991B1B', padding: '2px 8px', borderRadius: 6, fontSize: 12, fontWeight: 700 }}>-{p.descuento}%</span></td>
                        <td style={{ fontWeight: 600 }}>{p.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Empresas invitadas */}
          <div className="card" style={{ padding: 0 }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div className="section-title" style={{ marginBottom: 0 }}>Empresas invitadas</div>
            </div>
            {empresasInvitadas.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Sin empresas invitadas</div>
            ) : (
              <div style={{ padding: '12px 0' }}>
                {empresasInvitadas.map((ee, i) => (
                  <div key={ee.empresaId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 24px', borderBottom: i < empresasInvitadas.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#028090,#02C39A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                      {ee.empresa?.logo || ee.empresa?.nombre?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{ee.empresa?.nombre}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ee.empresa?.industria}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas si el evento está activo o finalizado */}
        {(evento.estado === 'activo' || evento.estado === 'finalizado') && (
          <div className="card" style={{ marginTop: 24 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>Estadísticas</div>
            <div className="grid-4">
              {[
                { label: 'Total Visitas', value: evento.totalVisitas?.toLocaleString('es-CL') || 0, color: '#4F46E5' },
                { label: 'Total Compras', value: evento.totalCompras?.toLocaleString('es-CL') || 0, color: '#10B981' },
                { label: 'Monto Total', value: `$${((evento.montoTotal || 0) / 1000000).toFixed(1)}M`, color: '#F59E0B' },
                { label: 'Colaboradores Únicos', value: evento.colaboradoresUnicos?.toLocaleString('es-CL') || 0, color: '#7C3AED' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '16px', background: 'var(--bg)', borderRadius: 12 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
