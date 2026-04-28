import { useEffect, useState, useRef } from 'react';
import { Search, ShoppingCart, X, CheckCircle, AlertCircle, ChevronRight, Clock, Zap, Star, TrendingUp, Package, Tag } from 'lucide-react';
import Topbar from '../../components/Topbar';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CATEGORIAS = ['Electrónica', 'Moda', 'Hogar', 'Deportes', 'Alimentos', 'Otro'];
const CAT_ICONS = { 'Electrónica': '💻', 'Moda': '👗', 'Hogar': '🏠', 'Deportes': '⚽', 'Alimentos': '🍎', 'Otro': '🎁' };

function CountdownTimer({ fechaFin }) {
  const [tiempo, setTiempo] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(fechaFin) - new Date();
      if (diff <= 0) return;
      setTiempo({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [fechaFin]);

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {[
        { val: tiempo.d, label: 'días' },
        { val: tiempo.h, label: 'hrs' },
        { val: tiempo.m, label: 'min' },
        { val: tiempo.s, label: 'seg' },
      ].map((t, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: '#1a1a2e', color: '#fff', borderRadius: 6, padding: '4px 8px', fontSize: 18, fontWeight: 800, minWidth: 36, textAlign: 'center' }}>
            {String(t.val).padStart(2, '0')}
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 2 }}>{t.label}</div>
        </div>
      ))}
    </div>
  );
}

function ProductoCard({ producto, onComprar, estaEnCarrito, yaComprado }) {
  const [hover, setHover] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const ahorro = producto.precioOriginal - producto.precioEvento;
  const disabled = estaEnCarrito || yaComprado;

  return (
    <>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e5e5', overflow: 'hidden', transition: 'all .2s', boxShadow: hover ? '0 4px 20px rgba(0,0,0,.12)' : 'none', position: 'relative', cursor: 'pointer' }}
        onClick={() => setShowModal(true)}>
        {disabled && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.85)', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
            <CheckCircle size={28} color="#10B981" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>{yaComprado ? 'Ya comprado' : 'En carrito'}</span>
          </div>
        )}
        <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 1, background: '#EF4444', color: '#fff', fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>
          -{producto.descuento}%
        </div>
        <div style={{ height: 180, background: producto.imagen?.startsWith('http') ? 'none' : 'linear-gradient(135deg,#f8f8f8,#efefef)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, overflow: 'hidden' }}>
          {producto.imagen?.startsWith('http')
            ? <img src={producto.imagen} alt={producto.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '📦'}
        </div>
        <div style={{ padding: '12px 14px 14px' }}>
          <div style={{ fontSize: 13, color: '#666', lineHeight: 1.4, marginBottom: 8, height: 38, overflow: 'hidden' }}>
            {producto.nombre}
          </div>
          <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, marginBottom: 4 }}>
            Antes ${producto.precioOriginal.toLocaleString('es-CL')}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>
            ${producto.precioEvento.toLocaleString('es-CL')}
          </div>
          <div style={{ fontSize: 12, color: '#00a650', fontWeight: 600, marginTop: 4 }}>
            Ahorro ${ahorro.toLocaleString('es-CL')}
          </div>
          <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>
            {producto.empresa?.nombre}
          </div>
          <button onClick={e => { e.stopPropagation(); onComprar(producto); }}
            style={{ marginTop: 10, width: '100%', padding: '8px', borderRadius: 6, border: 'none', background: disabled ? '#e5e5e5' : '#3483fa', color: disabled ? '#999' : '#fff', fontWeight: 700, fontSize: 13, cursor: disabled ? 'default' : 'pointer', transition: 'background .15s' }}>
            {disabled ? (yaComprado ? 'Ya comprado' : 'En carrito') : 'Agregar al carrito'}
          </button>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)' }} onClick={() => setShowModal(false)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: 12, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
            <div style={{ height: 240, background: producto.imagen?.startsWith('http') ? 'none' : 'linear-gradient(135deg,#f8f8f8,#efefef)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, overflow: 'hidden', position: 'relative', borderRadius: '12px 12px 0 0' }}>
              {producto.imagen?.startsWith('http')
                ? <img src={producto.imagen} alt={producto.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '📦'}
              <span style={{ position: 'absolute', top: 12, left: 12, background: '#EF4444', color: '#fff', padding: '4px 12px', borderRadius: 4, fontSize: 14, fontWeight: 800 }}>-{producto.descuento}%</span>
              <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,.4)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 6 }}>{producto.categoria} • {producto.empresa?.nombre}</div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>{producto.nombre}</h2>
              {producto.descripcion && <p style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 20 }}>{producto.descripcion}</p>}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 13, color: '#EF4444', textDecoration: 'line-through', marginBottom: 4 }}>Antes ${producto.precioOriginal.toLocaleString('es-CL')}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#1a1a2e' }}>${producto.precioEvento.toLocaleString('es-CL')}</div>
                <div style={{ fontSize: 14, color: '#00a650', fontWeight: 700 }}>Ahorras ${ahorro.toLocaleString('es-CL')}</div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                <span style={{ background: '#f5f5f5', padding: '6px 12px', borderRadius: 6, fontSize: 12 }}>📦 Stock: {producto.stock}</span>
                {producto.sku && <span style={{ background: '#f5f5f5', padding: '6px 12px', borderRadius: 6, fontSize: 12 }}>SKU: {producto.sku}</span>}
                <span style={{ background: '#f5f5f5', padding: '6px 12px', borderRadius: 6, fontSize: 12 }}>✨ {producto.condicion}</span>
              </div>
              <button disabled={disabled} onClick={() => { onComprar(producto); setShowModal(false); }}
                style={{ width: '100%', padding: '14px', borderRadius: 8, border: 'none', background: disabled ? '#e5e5e5' : '#3483fa', color: disabled ? '#999' : '#fff', fontWeight: 700, fontSize: 16, cursor: disabled ? 'default' : 'pointer' }}>
                {disabled ? (yaComprado ? '✓ Ya comprado' : '✓ En carrito') : 'Agregar al carrito'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function CartDrawer({ items, onClose, onComprar, loading, error }) {
  const total = items.reduce((s, i) => s + i.precioEvento, 0);
  const ahorro = items.reduce((s, i) => s + (i.precioOriginal - i.precioEvento), 0);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: 400, height: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '-8px 0 30px rgba(0,0,0,.15)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Carrito ({items.length})</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        {error && <div style={{ margin: '12px 24px', background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>{error}</div>}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
              <ShoppingCart size={48} style={{ marginBottom: 12 }} />
              <p>Tu carrito está vacío</p>
            </div>
          ) : items.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, padding: 12, background: '#f8f8f8', borderRadius: 8 }}>
              <div style={{ width: 56, height: 56, background: '#e5e5e5', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, overflow: 'hidden' }}>
                {item.imagen?.startsWith('http') ? <img src={item.imagen} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{item.nombre}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{item.empresa?.nombre}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#3483fa' }}>${item.precioEvento.toLocaleString('es-CL')}</div>
              </div>
            </div>
          ))}
        </div>
        {items.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid #e5e5e5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: '#666' }}>
              <span>Ahorro total</span>
              <span style={{ color: '#00a650', fontWeight: 700 }}>-${ahorro.toLocaleString('es-CL')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 800, marginBottom: 16 }}>
              <span>Total</span>
              <span style={{ color: '#3483fa' }}>${total.toLocaleString('es-CL')}</span>
            </div>
            <button onClick={onComprar} disabled={loading}
              style={{ width: '100%', padding: 14, borderRadius: 8, border: 'none', background: '#3483fa', color: '#fff', fontWeight: 700, fontSize: 16, cursor: loading ? 'default' : 'pointer' }}>
              {loading ? 'Procesando...' : 'Confirmar compra'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Marketplace() {
  const { user } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [misCompras, setMisCompras] = useState([]);
  const [dashData, setDashData] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [showCarrito, setShowCarrito] = useState(false);
  const [comprando, setComprando] = useState(false);
  const [errorCompra, setErrorCompra] = useState('');
  const [compraOk, setCompraOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catSel, setCatSel] = useState(null);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [banners, setBanners] = useState([]);

  const cargarDatos = () => {
    Promise.all([
      api.get('/eventos'),
      api.get('/productos'),
      api.get('/compras/mis-compras'),
      api.get('/banners'),
    ]).then(([evRes, prRes, comprasRes, bannersRes]) => {
      setBanners(bannersRes.data);
      setEventos(evRes.data.filter(e => e.estado === 'activo'));
      setProductos(prRes.data);
      setMisCompras(comprasRes.data.map(c => c.productoId));
    }).finally(() => setLoading(false));
    if (user?.colaboradorId)
      api.get(`/dashboard/colaborador/${user.colaboradorId}`).then(r => setDashData(r.data));
  };

  useEffect(() => { cargarDatos(); }, [user]);
  useEffect(() => {
    if (eventos.length === 0) return;
    const t = setInterval(() => setBannerIdx(i => (i + 1) % Math.min(eventos.length, 3)), 4000);
    return () => clearInterval(t);
  }, [eventos]);

  const estaEnCarrito = id => carrito.some(i => i.id === id);
  const yaComprado = id => misCompras.includes(id);

  const agregarCarrito = (p) => {
    if (estaEnCarrito(p.id) || yaComprado(p.id)) return;
    setCarrito(c => [...c, p]);
  };

  const confirmarCompra = async () => {
    setComprando(true);
    setErrorCompra('');
    try {
      await Promise.all(carrito.map(item => api.post('/compras', { productoId: item.id, eventoId: item.eventoId || null })));
      setCarrito([]);
      setShowCarrito(false);
      setCompraOk(true);
      cargarDatos();
      setTimeout(() => setCompraOk(false), 3500);
    } catch (e) {
      setErrorCompra(e.response?.data?.error || 'Error al procesar la compra.');
    } finally {
      setComprando(false);
    }
  };

  const productosFiltrados = productos.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = !catSel || p.categoria === catSel;
    return matchSearch && matchCat;
  });

  const ofertas = [...productos].sort((a, b) => b.descuento - a.descuento).slice(0, 8);
  const destacados = [...productos].sort((a, b) => b.visitas - a.visitas).slice(0, 10);

  const BANNER_COLORS = ['#ffe600', '#3483fa', '#00a650', '#ff7733', '#a020f0'];

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Cargando marketplace…</div>;

  return (
    <>
      {showCarrito && <CartDrawer items={carrito} onClose={() => { setShowCarrito(false); setErrorCompra(''); }} onComprar={confirmarCompra} loading={comprando} error={errorCompra} />}

      {compraOk && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 999, background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 30px rgba(0,0,0,.15)' }}>
          <CheckCircle size={20} color="#065F46" />
          <span style={{ fontWeight: 600, color: '#065F46' }}>¡Compra realizada exitosamente!</span>
        </div>
      )}

      {/* Header fijo estilo ML */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, background: '#f5f5f5', borderRadius: 8, padding: '10px 16px' }}>
          <Search size={18} color="#999" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar en NexLink Marketplace..."
            style={{ border: 'none', background: 'none', flex: 1, fontSize: 15, outline: 'none', color: '#333' }} />
        </div>
        <button onClick={() => setShowCarrito(true)} style={{ position: 'relative', background: '#3483fa', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
          <ShoppingCart size={18} /> Mi Carrito
          {carrito.length > 0 && (
            <span style={{ position: 'absolute', top: -8, right: -8, background: '#EF4444', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{carrito.length}</span>
          )}
        </button>
      </div>

      <div style={{ background: '#ebebeb', minHeight: '100vh' }}>

        {/* Banner principal — usa banners de BD o fallback con eventos */}
        <div style={{ marginBottom: 16 }}>
          {(banners.length > 0 || eventos.length > 0) ? (
            <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', cursor: 'pointer' }}>
              {(() => {
                const items = banners.length > 0 ? banners : eventos;
                const idx = bannerIdx % items.length;
                const item = items[idx];
                const esBanner = banners.length > 0;
                const imagen = esBanner ? item.imagen : [
                  'https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=1400&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1400&h=400&fit=crop',
                  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1400&h=400&fit=crop',
                ][idx % 3];
                const titulo = esBanner ? item.titulo : item.nombre;
                const subtitulo = esBanner ? item.subtitulo : item.descripcion?.slice(0, 80) + '…';
                const colorTexto = esBanner ? item.colorTexto : '#ffffff';
                const ctaTexto = esBanner ? item.ctaTexto : 'Ver ofertas';
                const GRADIENTS = [
                  'linear-gradient(90deg, rgba(52,131,250,0.92) 0%, rgba(52,131,250,0.4) 60%, transparent 100%)',
                  'linear-gradient(90deg, rgba(255,230,0,0.95) 0%, rgba(255,230,0,0.5) 60%, transparent 100%)',
                  'linear-gradient(90deg, rgba(0,166,80,0.92) 0%, rgba(0,166,80,0.4) 60%, transparent 100%)',
                  'linear-gradient(90deg, rgba(26,26,46,0.92) 0%, rgba(26,26,46,0.4) 60%, transparent 100%)',
                ];
                return (
                  <>
                    <img src={imagen} alt={titulo} style={{ width: '100%', height: 440, objectFit: 'cover', display: 'block' }} />
                    <div style={{ position: 'absolute', inset: 0, background: GRADIENTS[idx % GRADIENTS.length] }} />
                    {/* Difuminado inferior más largo */}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to bottom, transparent, #ebebeb)' }} />
                    <div style={{ position: 'absolute', inset: 0, padding: '32px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,.2)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '4px 14px', marginBottom: 12, width: 'fit-content' }}>
                        <span style={{ fontSize: 14 }}>⚡</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: idx === 1 ? '#333' : '#fff', textTransform: 'uppercase', letterSpacing: '.08em' }}>Evento Flash Activo</span>
                      </div>
                      <h1 style={{ fontSize: 36, fontWeight: 900, color: idx === 1 ? '#1a1a2e' : '#fff', marginBottom: 8, textShadow: idx === 1 ? 'none' : '0 2px 8px rgba(0,0,0,.3)', maxWidth: 500 }}>
                        {ev?.nombre}
                      </h1>
                      <p style={{ fontSize: 15, color: idx === 1 ? '#333' : 'rgba(255,255,255,.9)', marginBottom: 20, maxWidth: 420 }}>
                        {ev?.descripcion?.slice(0, 90)}…
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                        {!esBanner && item?.fechaFin && (
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,.7)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>Termina en</div>
                          <CountdownTimer fechaFin={item.fechaFin} />
                        </div>
                      )}
                        {ctaTexto && <button onClick={() => setCatSel(null)}
                          style={{ marginLeft: 8, padding: '10px 24px', borderRadius: 6, border: 'none', background: '#fff', color: '#3483fa', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                          {ctaTexto} →
                        </button>}
                      </div>
                      {dashData && (
                        <div style={{ position: 'absolute', top: 24, right: 32, display: 'flex', gap: 10 }}>
                          {[
                            { icon: '⭐', val: dashData.stats.puntos, label: 'Puntos' },
                            { icon: '🛍️', val: dashData.stats.comprasTotales, label: 'Compras' },
                            { icon: '💰', val: `$${Math.round(dashData.stats.montoAhorrado / 1000)}K`, label: 'Ahorrado' },
                          ].map(s => (
                            <div key={s.label} style={{ background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '8px 14px', textAlign: 'center', minWidth: 80 }}>
                              <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a2e' }}>{s.icon} {s.val}</div>
                              <div style={{ fontSize: 11, color: '#666' }}>{s.label}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Dots */}
                    <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                      {items.slice(0, 4).map((_, i) => (
                        <div key={i} onClick={() => setBannerIdx(i)}
                          style={{ width: i === bannerIdx % eventos.length ? 24 : 8, height: 8, borderRadius: 4, background: i === bannerIdx % eventos.length ? '#fff' : 'rgba(255,255,255,.4)', cursor: 'pointer', transition: 'all .3s', boxShadow: '0 1px 4px rgba(0,0,0,.3)' }} />
                      ))}
                    </div>
                    {/* Flechas */}
                    <button onClick={e => { e.stopPropagation(); setBannerIdx(i => (i - 1 + items.length) % items.length); }}
                      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.8)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.2)' }}>‹</button>
                    <button onClick={e => { e.stopPropagation(); setBannerIdx(i => (i + 1) % items.length); }}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.8)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.2)' }}>›</button>
                  </>
                );
              })()}
            </div>
          ) : (
            <div style={{ background: 'linear-gradient(135deg,#3483fa,#1a1a8e)', borderRadius: 8, padding: '48px', textAlign: 'center', color: '#fff' }}>
              <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Bienvenido al Marketplace NexLink</h1>
              <p style={{ opacity: .8 }}>Próximamente habrá eventos flash disponibles para ti</p>
            </div>
          )}
        </div>

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px 32px' }}>

          {/* Categorías sobre el difuminado del banner */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: -70, marginBottom: 16, position: 'relative', zIndex: 10, padding: '0 24px' }}>
            <button onClick={() => setCatSel(null)} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 24px', borderRadius: 12, border: `2px solid ${!catSel ? '#3483fa' : 'transparent'}`, background: '#fff', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,.12)', minWidth: 90, transition: 'all .15s' }}>
              <span style={{ fontSize: 32 }}>🏪</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: !catSel ? '#3483fa' : '#333', whiteSpace: 'nowrap' }}>Todo</span>
            </button>
            {CATEGORIAS.map(cat => (
              <button key={cat} onClick={() => setCatSel(catSel === cat ? null : cat)} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 24px', borderRadius: 12, border: `2px solid ${catSel === cat ? '#3483fa' : 'transparent'}`, background: '#fff', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,.12)', minWidth: 90, transition: 'all .15s' }}>
                <span style={{ fontSize: 32 }}>{CAT_ICONS[cat]}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: catSel === cat ? '#3483fa' : '#333', whiteSpace: 'nowrap' }}>{cat}</span>
              </button>
            ))}
          </div>

          {/* Si hay búsqueda o filtro activo → mostrar grid filtrado */}
          {(search || catSel) ? (
            <div style={{ background: '#fff', borderRadius: 8, padding: 24, marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                {productosFiltrados.length} resultado{productosFiltrados.length !== 1 ? 's' : ''} {catSel ? `en ${catSel}` : ''} {search ? `para "${search}"` : ''}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {productosFiltrados.map(p => (
                  <ProductoCard key={p.id} producto={p} onComprar={agregarCarrito} estaEnCarrito={estaEnCarrito(p.id)} yaComprado={yaComprado(p.id)} />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Eventos activos */}
              {eventos.length > 0 && (
                <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Zap size={18} color="#F59E0B" fill="#F59E0B" /> Eventos Flash Activos
                    </h2>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${eventos.length}, 1fr)`, gap: 12 }}>
                    {eventos.map(ev => (
                      <div key={ev.id} style={{ padding: 16, borderRadius: 8, border: '1px solid #e5e5e5', cursor: 'pointer', background: 'linear-gradient(135deg, #ecf2ff, #f0f7ff)' }}
                        onClick={() => setCatSel(null)}>
                        <div style={{ fontSize: 12, color: '#3483fa', fontWeight: 700, marginBottom: 4 }}>{ev.empresa?.nombre || ev.marca?.nombre}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{ev.nombre}</div>
                        <CountdownTimer fechaFin={ev.fechaFin} />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>{ev.totalProductos} productos disponibles</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ofertas del día */}
              <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tag size={18} color="#EF4444" /> Ofertas del día
                    <span style={{ background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>HOT</span>
                  </h2>
                  <span style={{ fontSize: 13, color: '#3483fa', cursor: 'pointer', fontWeight: 600 }}>Ver todas <ChevronRight size={14} style={{ display: 'inline' }} /></span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  {ofertas.map(p => (
                    <ProductoCard key={p.id} producto={p} onComprar={agregarCarrito} estaEnCarrito={estaEnCarrito(p.id)} yaComprado={yaComprado(p.id)} />
                  ))}
                </div>
              </div>

              {/* Más populares */}
              <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TrendingUp size={18} color="#3483fa" /> Más populares
                  </h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  {destacados.map(p => (
                    <ProductoCard key={p.id} producto={p} onComprar={agregarCarrito} estaEnCarrito={estaEnCarrito(p.id)} yaComprado={yaComprado(p.id)} />
                  ))}
                </div>
              </div>

              {/* Por empresa */}
              {['Samsung Chile', 'Falabella', 'Cencosud', 'Latam Airlines', 'Banco de Chile', 'Entel'].map(nombreEmpresa => {
                const prods = productos.filter(p => p.empresa?.nombre === nombreEmpresa).slice(0, 6);
                if (prods.length === 0) return null;
                return (
                  <div key={nombreEmpresa} style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h2 style={{ fontSize: 18, fontWeight: 700 }}>Productos de {nombreEmpresa}</h2>
                      <span style={{ fontSize: 13, color: '#3483fa', cursor: 'pointer', fontWeight: 600 }}>Ver todos <ChevronRight size={14} style={{ display: 'inline' }} /></span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                      {prods.map(p => (
                        <ProductoCard key={p.id} producto={p} onComprar={agregarCarrito} estaEnCarrito={estaEnCarrito(p.id)} yaComprado={yaComprado(p.id)} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </>
  );
}
