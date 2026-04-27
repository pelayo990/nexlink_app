import { Calendar, Clock, Package, Users, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ESTADO_MAP = {
  activo:    { label: 'Activo',     cls: 'badge-success' },
  proximo:   { label: 'Próximo',    cls: 'badge-info' },
  finalizado:{ label: 'Finalizado', cls: 'badge-gray' },
};

const EMPRESA_COLORS = ['#4F46E5','#028090','#10B981','#F59E0B','#EF4444','#7C3AED','#0EA5E9','#EC4899'];

function strToColor(str) {
  if (!str) return EMPRESA_COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return EMPRESA_COLORS[Math.abs(hash) % EMPRESA_COLORS.length];
}

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function EventoCard({ evento, showActions = false, onEdit, onView }) {
  const navigate = useNavigate();
  const estado = ESTADO_MAP[evento.estado] || ESTADO_MAP.finalizado;
  const color = strToColor(evento.empresaId || evento.marcaId);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', transition: 'box-shadow .2s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-lg)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow)'}>
      {/* Header */}
      <div style={{ height: 8, background: `linear-gradient(90deg, ${color}, ${color}99)` }} />
      <div style={{ padding: '20px 20px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <div>
            <span className={`badge ${estado.cls}`}>{estado.label}</span>
            {evento.destacado && <span className="badge badge-purple" style={{ marginLeft: 6 }}>Destacado</span>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
            {evento.marca?.nombre || ''}
          </div>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          {evento.nombre}
        </h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16 }}>
          {evento.descripcion?.slice(0, 100)}{evento.descripcion?.length > 100 ? '…' : ''}
        </p>

        {/* Dates */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <Calendar size={13} /> <span>{fmt(evento.fechaInicio)}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <Clock size={13} /> <span>Hasta {fmt(evento.fechaFin)}</span>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 20, padding: '12px 0', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <Package size={14} color="var(--text-muted)" />
            <span style={{ fontWeight: 600 }}>{evento.totalProductos ?? evento.productosIds?.length ?? 0}</span>
            <span style={{ color: 'var(--text-muted)' }}>productos</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <Users size={14} color="var(--text-muted)" />
            <span style={{ fontWeight: 600 }}>{evento.estadisticas?.colaboradoresUnicos?.toLocaleString('es-CL') ?? 0}</span>
            <span style={{ color: 'var(--text-muted)' }}>colaboradores</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
          <button className="btn btn-primary btn-sm" style={{ flex: 1 }}
            onClick={() => onView ? onView(evento) : navigate(`/evento/${evento.id}`)}>
            Ver Evento <ChevronRight size={14} />
          </button>
          <button onClick={() => navigate(`/empresa/eventos/${evento.id}`)}
        style={{ width: '100%', marginTop: 12, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        Ver detalle <ArrowRight size={14} />
      </button>
      {showActions && (
            <button className="btn btn-secondary btn-sm" onClick={() => onEdit?.(evento)}>
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
