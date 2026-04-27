import { ShoppingCart, Tag, X, Package } from 'lucide-react';
import { useState } from 'react';

const PRODUCT_ICONS = {
  tv: '📺', tablet: '📱', soundbar: '🔊', parrilla: '🍖',
  chaqueta: '🧥', sartenes: '🍳', zapatillas: '👟', polera: '👕',
};

function ProductModal({ producto, onClose, onComprar }) {
  const ahorro = producto.precioOriginal - producto.precioEvento;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ height: 200, background: 'linear-gradient(135deg,#EEF2FF,#E0E7FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 80, position: 'relative', borderRadius: '16px 16px 0 0' }}>
          {producto.imagen || '📦'}
          <span style={{ position: 'absolute', top: 16, left: 16, background: '#EF4444', color: '#fff', padding: '4px 12px', borderRadius: 99, fontSize: 14, fontWeight: 800 }}>-{producto.descuento}%</span>
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(0,0,0,.3)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
        </div>
        <div style={{ padding: 28 }}>
          <div style={{ marginBottom: 4 }}><span className="tag">{producto.categoria}</span></div>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: '8px 0 8px' }}>{producto.nombre}</h2>
          {producto.empresa?.nombre && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>por {producto.empresa.nombre}</div>}
          {producto.descripcion && <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>{producto.descripcion}</p>}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 8 }}>
            <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--primary)' }}>${producto.precioEvento.toLocaleString('es-CL')}</div>
            <div style={{ fontSize: 16, color: 'var(--text-muted)', textDecoration: 'line-through', marginBottom: 4 }}>${producto.precioOriginal.toLocaleString('es-CL')}</div>
          </div>
          <div style={{ fontSize: 13, color: '#10B981', fontWeight: 600, marginBottom: 20 }}>Ahorras ${ahorro.toLocaleString('es-CL')}</div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, fontSize: 13 }}>
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '8px 14px' }}>📦 Stock: <strong>{producto.stock}</strong></div>
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '8px 14px' }}>🏷️ SKU: <strong>{producto.sku || '—'}</strong></div>
            <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '8px 14px' }}>✨ <strong>{producto.condicion}</strong></div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', height: 48, fontSize: 16 }} onClick={() => { onComprar(producto); onClose(); }}>
            <ShoppingCart size={18} /> Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductCard({ producto, onComprar }) {
  const [showModal, setShowModal] = useState(false);
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

        <div style={{ display: 'flex', gap: 0 }}>
          <button onClick={() => setShowModal(true)}
            style={{ flex: 1, height: 40, background: 'var(--bg)', border: '1px solid var(--border)', borderLeft: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', borderRadius: '0 0 0 8px' }}>
            Ver detalle
          </button>
          <button className="btn btn-primary"
            style={{ flex: 2, borderRadius: '0 0 8px 0', height: 40, fontSize: 13 }}
            onClick={() => onComprar?.(producto)}>
            <ShoppingCart size={14} /> Agregar
          </button>
        </div>
      </div>
    </div>
      {showModal && <ProductModal producto={producto} onClose={() => setShowModal(false)} onComprar={onComprar} />}
  );
}
