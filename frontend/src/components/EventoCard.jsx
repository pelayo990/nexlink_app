import { Calendar, Clock, Package, Users, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ESTADO_MAP = {
  activo:    { label: 'Activo',     cls: 'badge-success' },
  proximo:   { label: 'Próximo',    cls: 'badge-info' },
  finalizado:{ label: 'Finalizado', cls: 'badge-gray' },
};

const MARCA_COLORS = { m1: '#1428A0', m2: '#CC0000', m3: '#000000', m4: '#E4003A' };

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function EventoCard({ evento, showActions = false, onEdit, onView }) {
  const navigate = useNavigate();
  const estado = ESTADO_MAP[evento.estado] || ESTADO_MAP.finalizado;
  const color = MARCA_COLORS[evento.marcaId] || '#4F46E5';

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
