import { ShoppingCart, Tag } from 'lucide-react';

const PRODUCT_ICONS = {
  tv: '📺', tablet: '📱', soundbar: '🔊', parrilla: '🍖',
  chaqueta: '🧥', sartenes: '🍳', zapatillas: '👟', polera: '👕',
};

export default function ProductCard({ producto, onComprar }) {
  const icon = PRODUCT_ICONS[producto.imagen] || '📦';
  const ahorro = producto.precioOriginal - producto.precioEvento;
  const lowStock = producto.stock <= producto.stockMinimo * 2;

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Image area */}
      <div style={{
        height: 160, background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 64, position: 'relative',
      }}>
        {icon}
        <span style={{
          position: 'absolute', top: 12, left: 12,
          background: 'var(--danger)', color: '#fff',
          padding: '3px 10px', borderRadius: 99,
          fontSize: 13, fontWeight: 700,
        }}>
          -{producto.descuento}%
        </span>
        {lowStock && (
          <span style={{
            position: 'absolute', top: 12, right: 12,
            background: '#FEF3C7', color: '#92400E',
            padding: '3px 8px', borderRadius: 99, fontSize: 11, fontWeight: 600,
          }}>
            ¡Últimas unidades!
          </span>
        )}
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>
          {producto.categoria} • {producto.marca?.nombre}
        </div>
        <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4 }}>
          {producto.nombre}
        </h4>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
          {producto.descripcion?.slice(0, 80)}…
        </p>

        {/* Prices */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>
              ${producto.precioEvento.toLocaleString('es-CL')}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', textDecoration: 'line-through' }}>
              ${producto.precioOriginal.toLocaleString('es-CL')}
            </span>
            <span style={{ fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
              Ahorras ${ahorro.toLocaleString('es-CL')}
            </span>
          </div>
        </div>

        {/* Stock */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, fontSize: 12, color: 'var(--text-secondary)' }}>
          <Tag size={12} />
          <span>Stock: <strong>{producto.stock}</strong> unidades</span>
        </div>

        <button className="btn btn-primary btn-sm" style={{ width: '100%' }}
          onClick={() => onComprar?.(producto)}>
          <ShoppingCart size={14} />
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
