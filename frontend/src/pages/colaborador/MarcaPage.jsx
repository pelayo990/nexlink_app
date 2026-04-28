import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, CheckCircle, Package, Calendar, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

function ProductoCard({ producto, onComprar, estaEnCarrito, yaComprado }) {
  const ahorro = producto.precioOriginal - producto.precioEvento;
  const disabled = estaEnCarrito || yaComprado;
  return (
    <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e5e5', overflow: 'hidden', position: 'relative' }}>
      {disabled && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.85)', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
          <CheckCircle size={28} color="#10B981" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>{yaComprado ? 'Ya comprado' : 'En carrito'}</span>
        </div>
      )}
      <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 1, background: '#EF4444', color: '#fff', fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
        -{producto.descuento}%
      </div>
      <div style={{ height: 180, background: '#f8f8f8', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {producto.imagen?.startsWith('http')
          ? <img src={producto.imagen} alt={producto.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 64 }}>📦</span>}
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontSize: 13, color: '#666', marginBottom: 8, height: 38, overflow: 'hidden' }}>{producto.nombre}</div>
        <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, marginBottom: 2 }}>Antes ${producto.precioOriginal.toLocaleString('es-CL')}</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e' }}>${producto.precioEvento.toLocaleString('es-CL')}</div>
        <div style={{ fontSize: 12, color: '#00a650', fontWeight: 600, marginTop: 4 }}>Ahorro ${ahorro.toLocaleString('es-CL')}</div>
        <button onClick={() => onComprar(producto)} disabled={disabled}
          style={{ marginTop: 10, width: '100%', padding: 8, borderRadius: 6, border: 'none', background: disabled ? '#e5e5e5' : '#3483fa', color: disabled ? '#999' : '#fff', fontWeight: 700, fontSize: 13, cursor: disabled ? 'default' : 'pointer' }}>
          {disabled ? (yaComprado ? 'Ya comprado' : 'En carrito') : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  );
}

export default function MarcaPage() {
  const { empresaId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [carrito, setCarrito] = useState([]);
  const [misCompras, setMisCompras] = useState([]);
  const [compraOk, setCompraOk] = useState(false);
  const [tab, setTab] = useState('productos');

  useEffect(() => {
    Promise.all([
      api.get(`/pagina-empresa/${empresaId}`),
      api.get('/compras/mis-compras'),
    ]).then(([pRes, cRes]) => {
      setData(pRes.data);
      setMisCompras(cRes.data.map(c => c.productoId));
    }).finally(() => setLoading(false));
  }, [empresaId]);

  const estaEnCarrito = id => carrito.some(i => i.id === id);
  const yaComprado = id => misCompras.includes(id);

  const agregarCarrito = (p) => {
    if (estaEnCarrito(p.id) || yaComprado(p.id)) return;
    setCarrito(c => [...c, p]);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Cargando…</div>;
  if (!data) return null;

  const { pagina, empresa, productos, eventos } = data;
  const colorPrimario = pagina.colorPrimario || '#4F46E5';
  const colorSecundario = pagina.colorSecundario || '#7C3AED';

  return (
    <div style={{ background: '#ebebeb', minHeight: '100vh' }}>
      {compraOk && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 999, background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle size={20} color="#065F46" />
          <span style={{ fontWeight: 600, color: '#065F46' }}>¡Producto agregado al carrito!</span>
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate('/marketplace')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#3483fa', fontWeight: 600, fontSize: 14 }}>
          <ArrowLeft size={16} /> Volver al Marketplace
        </button>
        {carrito.length > 0 && (
          <button onClick={() => navigate('/marketplace')} style={{ marginLeft: 'auto', background: '#3483fa', border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShoppingCart size={16} /> {carrito.length} en carrito
          </button>
        )}
      </div>

      {/* Banner de empresa */}
      <div style={{ position: 'relative', height: 320, overflow: 'hidden' }}>
        {pagina.banner?.startsWith('http') ? (
          <img src={pagina.banner} alt={empresa.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})` }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,.3) 0%, transparent 40%, rgba(0,0,0,.5) 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 160, background: 'linear-gradient(to bottom, transparent, #ebebeb)' }} />

        {/* Info empresa sobre banner */}
        <div style={{ position: 'absolute', bottom: 60, left: 48, display: 'flex', alignItems: 'flex-end', gap: 20 }}>
          {pagina.logo?.startsWith('http') ? (
            <img src={pagina.logo} alt={empresa.nombre} style={{ width: 80, height: 80, borderRadius: 16, border: '3px solid #fff', objectFit: 'cover', boxShadow: '0 4px 16px rgba(0,0,0,.3)' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: 16, border: '3px solid #fff', background: colorPrimario, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,.3)' }}>
              {empresa.nombre.charAt(0)}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,.4)', marginBottom: 4 }}>{empresa.nombre}</h1>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,.85)', display: 'flex', gap: 16 }}>
              <span>🏭 {empresa.industria}</span>
              <span>📦 {productos.length} productos</span>
              <span>⚡ {eventos.length} eventos</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px 32px' }}>

        {/* Tagline */}
        {pagina.tagline && (
          <div style={{ background: '#fff', borderRadius: 8, padding: '16px 24px', marginBottom: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 18, fontWeight: 600, color: '#333', fontStyle: 'italic' }}>"{pagina.tagline}"</p>
          </div>
        )}

        {/* Descripción */}
        {pagina.descripcion && (
          <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Sobre {empresa.nombre}</h2>
            <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>{pagina.descripcion}</p>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e5e5' }}>
          {[
            { id: 'productos', label: `Productos (${productos.length})`, icon: Package },
            { id: 'eventos', label: `Eventos (${eventos.length})`, icon: Calendar },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: 1, padding: '14px', border: 'none', background: tab === t.id ? colorPrimario : '#fff', color: tab === t.id ? '#fff' : '#333', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all .15s' }}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </div>

        {/* Productos */}
        {tab === 'productos' && (
          <div>
            {/* Destacados */}
            {productos.slice(0, 4).length > 0 && (
              <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Star size={18} color="#F59E0B" fill="#F59E0B" /> Más populares
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                  {productos.slice(0, 4).map(p => (
                    <ProductoCard key={p.id} producto={p} onComprar={agregarCarrito} estaEnCarrito={estaEnCarrito(p.id)} yaComprado={yaComprado(p.id)} />
                  ))}
                </div>
              </div>
            )}

            {/* Todos los productos */}
            <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Todos los productos</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {productos.map(p => (
                  <ProductoCard key={p.id} producto={p} onComprar={agregarCarrito} estaEnCarrito={estaEnCarrito(p.id)} yaComprado={yaComprado(p.id)} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Eventos */}
        {tab === 'eventos' && (
          <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px' }}>
            {eventos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
                <Calendar size={48} style={{ marginBottom: 12 }} />
                <p>No hay eventos activos o próximos</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {eventos.map(ev => (
                  <div key={ev.id} style={{ padding: 20, borderRadius: 10, border: '1px solid #e5e5e5', background: 'linear-gradient(135deg,#ecf2ff,#f0f7ff)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ background: ev.estado === 'activo' ? '#D1FAE5' : '#FEF3C7', color: ev.estado === 'activo' ? '#065F46' : '#92400E', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                        {ev.estado === 'activo' ? '⚡ Activo' : '📅 Próximo'}
                      </span>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{ev.nombre}</h3>
                    <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>{ev.descripcion?.slice(0, 80)}…</p>
                    <div style={{ fontSize: 12, color: '#999' }}>
                      {new Date(ev.fechaInicio).toLocaleDateString('es-CL')} — {new Date(ev.fechaFin).toLocaleDateString('es-CL')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
