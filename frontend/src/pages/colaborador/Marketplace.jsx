import { useEffect, useState, useCallback } from 'react';
import { Search, ShoppingCart, X, CheckCircle, ChevronRight, ChevronLeft, Zap, Tag, TrendingUp, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CATEGORIAS = ['Electrónica', 'Moda', 'Hogar', 'Deportes', 'Alimentos', 'Otro'];
const CAT_ICONS = { 'Electrónica': '💻', 'Moda': '👗', 'Hogar': '🏠', 'Deportes': '⚽', 'Alimentos': '🍎', 'Otro': '🎁' };
const PAGE_SIZE = 20;
const DESCUENTOS = [{ label: 'Cualquiera', val: '' }, { label: '10% o más', val: 10 }, { label: '20% o más', val: 20 }, { label: '30% o más', val: 30 }, { label: '50% o más', val: 50 }];

function CountdownTimer({ fechaFin }) {
  const [tiempo, setTiempo] = useState({ d: 0, h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = new Date(fechaFin) - new Date();
      if (diff <= 0) return;
      setTiempo({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [fechaFin]);
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[{ val: tiempo.d, label: 'días' }, { val: tiempo.h, label: 'hrs' }, { val: tiempo.m, label: 'min' }, { val: tiempo.s, label: 'seg' }].map((t, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: '#1a1a2e', color: '#fff', borderRadius: 6, padding: '4px 8px', fontSize: 18, fontWeight: 800, minWidth: 36, textAlign: 'center' }}>{String(t.val).padStart(2, '0')}</div>
          <div style={{ fontSize: 9, color: '#999', marginTop: 2 }}>{t.label}</div>
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
        <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 1, background: '#EF4444', color: '#fff', fontSize: 12, fontWeight: 800, padding: '2px 8px', borderRadius: 4 }}>-{producto.descuento}%</div>
        <div style={{ height: 180, background: 'linear-gradient(135deg,#f8f8f8,#efefef)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, overflow: 'hidden' }}>
          {producto.imagen?.startsWith('http') ? <img src={producto.imagen} alt={producto.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
        </div>
        <div style={{ padding: '12px 14px 14px' }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{producto.categoria} • {producto.empresa?.nombre}</div>
          <div style={{ fontSize: 13, color: '#333', lineHeight: 1.4, marginBottom: 8, height: 38, overflow: 'hidden', fontWeight: 600 }}>{producto.nombre}</div>
          <div style={{ fontSize: 11, color: '#EF4444', fontWeight: 600, marginBottom: 2 }}>Antes ${producto.precioOriginal.toLocaleString('es-CL')}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', lineHeight: 1 }}>${producto.precioEvento.toLocaleString('es-CL')}</div>
          <div style={{ fontSize: 12, color: '#00a650', fontWeight: 600, marginTop: 4 }}>Ahorro ${ahorro.toLocaleString('es-CL')}</div>
          <button onClick={e => { e.stopPropagation(); onComprar(producto); }}
            style={{ marginTop: 10, width: '100%', padding: '8px', borderRadius: 6, border: 'none', background: disabled ? '#e5e5e5' : '#3483fa', color: disabled ? '#999' : '#fff', fontWeight: 700, fontSize: 13, cursor: disabled ? 'default' : 'pointer' }}>
            {disabled ? (yaComprado ? 'Ya comprado' : 'En carrito') : 'Agregar al carrito'}
          </button>
        </div>
      </div>
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)' }} onClick={() => setShowModal(false)} />
          <div style={{ position: 'relative', background: '#fff', borderRadius: 12, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
            <div style={{ height: 240, background: 'linear-gradient(135deg,#f8f8f8,#efefef)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 96, overflow: 'hidden', position: 'relative', borderRadius: '12px 12px 0 0' }}>
              {producto.imagen?.startsWith('http') ? <img src={producto.imagen} alt={producto.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
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
              <span>Ahorro total</span><span style={{ color: '#00a650', fontWeight: 700 }}>-${ahorro.toLocaleString('es-CL')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 800, marginBottom: 16 }}>
              <span>Total</span><span style={{ color: '#3483fa' }}>${total.toLocaleString('es-CL')}</span>
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

function Paginador({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24 }}>
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #e5e5e5', background: page === 1 ? '#f5f5f5' : '#fff', cursor: page === 1 ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: page === 1 ? '#999' : '#333' }}>
        <ChevronLeft size={16} /> Anterior
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
        .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...'); acc.push(p); return acc; }, [])
        .map((p, i) => p === '...' ? (
          <span key={i} style={{ padding: '8px 4px', color: '#999' }}>…</span>
        ) : (
          <button key={p} onClick={() => onChange(p)}
            style={{ width: 36, height: 36, borderRadius: 6, border: `1px solid ${p === page ? '#3483fa' : '#e5e5e5'}`, background: p === page ? '#3483fa' : '#fff', color: p === page ? '#fff' : '#333', fontWeight: 700, cursor: 'pointer' }}>
            {p}
          </button>
        ))}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
        style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #e5e5e5', background: page === totalPages ? '#f5f5f5' : '#fff', cursor: page === totalPages ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600, color: page === totalPages ? '#999' : '#333' }}>
        Siguiente <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default function Marketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [productosHome, setProductosHome] = useState([]);
  const [misCompras, setMisCompras] = useState([]);
  const [dashData, setDashData] = useState(null);
  const [carrito, setCarrito] = useState([]);
  const [showCarrito, setShowCarrito] = useState(false);
  const [comprando, setComprando] = useState(false);
  const [errorCompra, setErrorCompra] = useState('');
  const [compraOk, setCompraOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [banners, setBanners] = useState([]);
  const [empresas, setEmpresas] = useState([]);

  // Filtros
  const [search, setSearch] = useState('');
  const [catSel, setCatSel] = useState('');
  const [empresaSel, setEmpresaSel] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [descuentoMin, setDescuentoMin] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);

  // Resultados paginados
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [loadingFiltro, setLoadingFiltro] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const hayFiltros = !!(search || catSel || empresaSel || precioMin || precioMax || descuentoMin);

  const cargarHome = () => {
    Promise.all([
      api.get('/eventos'),
      api.get('/productos?all=true'),
      api.get('/compras/mis-compras'),
      api.get('/banners'),
      api.get('/empresas'),
    ]).then(([evRes, prRes, comprasRes, bannersRes, empRes]) => {
      setBanners(bannersRes.data);
      setEventos(evRes.data.filter(e => e.estado === 'activo'));
      setProductosHome(prRes.data.productos);
      setMisCompras(comprasRes.data.map(c => c.productoId));
      setEmpresas(empRes.data);
    }).finally(() => setLoading(false));
    if (user?.colaboradorId)
      api.get(`/dashboard/colaborador/${user.colaboradorId}`).then(r => setDashData(r.data));
  };

  const buscar = useCallback((p = 1) => {
    setLoadingFiltro(true);
    const params = new URLSearchParams({ page: p, limit: PAGE_SIZE });
    if (search) params.set('search', search);
    if (catSel) params.set('categoria', catSel);
    if (empresaSel) params.set('empresaId', empresaSel);
    if (precioMin) params.set('precioMin', precioMin);
    if (precioMax) params.set('precioMax', precioMax);
    if (descuentoMin) params.set('descuentoMin', descuentoMin);
    api.get(`/productos?${params}`).then(r => {
      setProductosFiltrados(r.data.productos);
      setTotal(r.data.total);
      setTotalPages(r.data.totalPages);
      setPage(p);
    }).finally(() => setLoadingFiltro(false));
  }, [search, catSel, empresaSel, precioMin, precioMax, descuentoMin]);

  const limpiarFiltros = () => {
    setSearch(''); setCatSel(''); setEmpresaSel('');
    setPrecioMin(''); setPrecioMax(''); setDescuentoMin('');
  };

  useEffect(() => { cargarHome(); }, [user]);
  useEffect(() => {
    if (eventos.length === 0) return;
    const t = setInterval(() => setBannerIdx(i => (i + 1) % Math.min(eventos.length, 3)), 4000);
    return () => clearInterval(t);
  }, [eventos]);
  useEffect(() => { if (hayFiltros) buscar(1); }, [search, catSel, empresaSel, precioMin, precioMax, descuentoMin]);

  const estaEnCarrito = id => carrito.some(i => i.id === id);
  const yaComprado = id => misCompras.includes(id);
  const agregarCarrito = p => { if (!estaEnCarrito(p.id) && !yaComprado(p.id)) setCarrito(c => [...c, p]); };

  const confirmarCompra = async () => {
    setComprando(true); setErrorCompra('');
    try {
      await Promise.all(carrito.map(item => api.post('/compras', { productoId: item.id, eventoId: item.eventoId || null })));
      setCarrito([]); setShowCarrito(false); setCompraOk(true);
      cargarHome();
      setTimeout(() => setCompraOk(false), 3500);
    } catch (e) {
      setErrorCompra(e.response?.data?.error || 'Error al procesar la compra.');
    } finally { setComprando(false); }
  };

  const ofertas = [...productosHome].sort((a, b) => b.descuento - a.descuento).slice(0, 8);
  const destacados = [...productosHome].sort((a, b) => b.visitas - a.visitas).slice(0, 10);

  const GRADIENTS = [
    'linear-gradient(90deg, rgba(52,131,250,0.92) 0%, rgba(52,131,250,0.4) 60%, transparent 100%)',
    'linear-gradient(90deg, rgba(255,230,0,0.95) 0%, rgba(255,230,0,0.5) 60%, transparent 100%)',
    'linear-gradient(90deg, rgba(0,166,80,0.92) 0%, rgba(0,166,80,0.4) 60%, transparent 100%)',
    'linear-gradient(90deg, rgba(26,26,46,0.92) 0%, rgba(26,26,46,0.4) 60%, transparent 100%)',
  ];

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>Cargando marketplace…</div>;

  const inputStyle = { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #e5e5e5', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: '#333', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '.04em' };

  return (
    <>
      {showCarrito && <CartDrawer items={carrito} onClose={() => { setShowCarrito(false); setErrorCompra(''); }} onComprar={confirmarCompra} loading={comprando} error={errorCompra} />}
      {compraOk && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 999, background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 30px rgba(0,0,0,.15)' }}>
          <CheckCircle size={20} color="#065F46" />
          <span style={{ fontWeight: 600, color: '#065F46' }}>¡Compra realizada exitosamente!</span>
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e5e5', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12, position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, background: '#f5f5f5', borderRadius: 8, padding: '10px 16px' }}>
          <Search size={18} color="#999" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar productos en NexLink..."
            style={{ border: 'none', background: 'none', flex: 1, fontSize: 15, outline: 'none', color: '#333' }} />
          {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', display: 'flex' }}><X size={16} /></button>}
        </div>
        <button onClick={() => setShowFiltros(f => !f)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', borderRadius: 8, border: `1px solid ${hayFiltros ? '#3483fa' : '#e5e5e5'}`, background: hayFiltros ? '#EFF6FF' : '#fff', color: hayFiltros ? '#3483fa' : '#555', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          <SlidersHorizontal size={16} />
          Filtros
          {hayFiltros && <span style={{ background: '#3483fa', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
            {[search, catSel, empresaSel, precioMin || precioMax, descuentoMin].filter(Boolean).length}
          </span>}
        </button>
        <button onClick={() => setShowCarrito(true)} style={{ position: 'relative', background: '#3483fa', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 14 }}>
          <ShoppingCart size={18} /> Carrito
          {carrito.length > 0 && <span style={{ position: 'absolute', top: -8, right: -8, background: '#EF4444', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>{carrito.length}</span>}
        </button>
      </div>

      <div style={{ background: '#ebebeb', minHeight: '100vh' }}>

        {/* Banner */}
        {!hayFiltros && (
          <div style={{ marginBottom: 16 }}>
            {banners.length > 0 ? (
              <div style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
                {(() => {
                  const items = banners;
                  const idx = bannerIdx % items.length;
                  const item = items[idx];
                  return (
                    <>
                      <img src={item.imagen} alt={item.titulo} style={{ width: '100%', height: 440, objectFit: 'cover', display: 'block' }} />
                      <div style={{ position: 'absolute', inset: 0, background: GRADIENTS[idx % GRADIENTS.length] }} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to bottom, transparent, #ebebeb)' }} />
                      <div style={{ position: 'absolute', inset: 0, padding: '32px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 8, maxWidth: 500 }}>{item.titulo}</h1>
                        <p style={{ fontSize: 15, color: 'rgba(255,255,255,.9)', marginBottom: 20, maxWidth: 420 }}>{item.subtitulo}</p>
                        {item.ctaTexto && <button style={{ alignSelf: 'flex-start', padding: '10px 24px', borderRadius: 6, border: 'none', background: '#fff', color: '#3483fa', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>{item.ctaTexto} →</button>}
                      </div>
                      <div style={{ position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
                        {items.slice(0, 4).map((_, i) => <div key={i} onClick={() => setBannerIdx(i)} style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 4, background: i === idx ? '#fff' : 'rgba(255,255,255,.4)', cursor: 'pointer', transition: 'all .3s' }} />)}
                      </div>
                      <button onClick={e => { e.stopPropagation(); setBannerIdx(i => (i - 1 + items.length) % items.length); }} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.8)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
                      <button onClick={e => { e.stopPropagation(); setBannerIdx(i => (i + 1) % items.length); }} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,.8)', border: 'none', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div style={{ position: 'relative', height: 440 }}>
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a8e 0%, #3483fa 50%, #00a650 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
                  <h1 style={{ fontSize: 36, fontWeight: 900, color: '#fff', marginBottom: 8 }}>Bienvenido al Marketplace NexLink</h1>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(to bottom, transparent, #ebebeb)' }} />
              </div>
            )}
          </div>
        )}

        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px 32px' }}>

          {/* Categorías rápidas */}
          {!hayFiltros && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: banners.length > 0 ? -70 : 16, marginBottom: 16, position: 'relative', zIndex: 10, padding: '0 24px' }}>
              {CATEGORIAS.map(cat => (
                <button key={cat} onClick={() => setCatSel(cat)} style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 24px', borderRadius: 12, border: '2px solid transparent', background: '#fff', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,.12)', minWidth: 90 }}>
                  <span style={{ fontSize: 32 }}>{CAT_ICONS[cat]}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#333' }}>{cat}</span>
                </button>
              ))}
            </div>
          )}

          {/* Panel de filtros */}
          {showFiltros && (
            <div style={{ background: '#fff', borderRadius: 8, padding: 24, marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, alignItems: 'end' }}>
              {/* Búsqueda */}
              <div>
                <label style={labelStyle}>Buscar</label>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nombre del producto..." style={inputStyle} />
              </div>

              {/* Categoría */}
              <div>
                <label style={labelStyle}>Categoría</label>
                <select value={catSel} onChange={e => setCatSel(e.target.value)} style={inputStyle}>
                  <option value="">Todas</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                </select>
              </div>

              {/* Marca */}
              <div>
                <label style={labelStyle}>Marca / Empresa</label>
                <select value={empresaSel} onChange={e => setEmpresaSel(e.target.value)} style={inputStyle}>
                  <option value="">Todas</option>
                  {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>

              {/* Descuento */}
              <div>
                <label style={labelStyle}>Descuento mínimo</label>
                <select value={descuentoMin} onChange={e => setDescuentoMin(e.target.value)} style={inputStyle}>
                  {DESCUENTOS.map(d => <option key={d.val} value={d.val}>{d.label}</option>)}
                </select>
              </div>

              {/* Precio */}
              <div>
                <label style={labelStyle}>Precio mínimo</label>
                <input type="number" value={precioMin} onChange={e => setPrecioMin(e.target.value)} placeholder="$ mínimo" style={inputStyle} min={0} />
              </div>
              <div>
                <label style={labelStyle}>Precio máximo</label>
                <input type="number" value={precioMax} onChange={e => setPrecioMax(e.target.value)} placeholder="$ máximo" style={inputStyle} min={0} />
              </div>

              {/* Limpiar */}
              <div style={{ display: 'flex', gap: 8 }}>
                {hayFiltros && (
                  <button onClick={limpiarFiltros} style={{ flex: 1, padding: '9px', borderRadius: 6, border: '1px solid #e5e5e5', background: '#fff', color: '#666', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                    Limpiar filtros
                  </button>
                )}
                <button onClick={() => setShowFiltros(false)} style={{ flex: 1, padding: '9px', borderRadius: 6, border: 'none', background: '#3483fa', color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* Chips de filtros activos */}
          {hayFiltros && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {search && <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EFF6FF', color: '#3483fa', borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>"{search}" <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSearch('')} /></span>}
              {catSel && <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EFF6FF', color: '#3483fa', borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>{CAT_ICONS[catSel]} {catSel} <X size={12} style={{ cursor: 'pointer' }} onClick={() => setCatSel('')} /></span>}
              {empresaSel && <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EFF6FF', color: '#3483fa', borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>{empresas.find(e => e.id === empresaSel)?.nombre} <X size={12} style={{ cursor: 'pointer' }} onClick={() => setEmpresaSel('')} /></span>}
              {descuentoMin && <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EFF6FF', color: '#3483fa', borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>-{descuentoMin}% o más <X size={12} style={{ cursor: 'pointer' }} onClick={() => setDescuentoMin('')} /></span>}
              {(precioMin || precioMax) && <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EFF6FF', color: '#3483fa', borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>${precioMin || '0'} – ${precioMax || '∞'} <X size={12} style={{ cursor: 'pointer' }} onClick={() => { setPrecioMin(''); setPrecioMax(''); }} /></span>}
              <button onClick={limpiarFiltros} style={{ background: 'none', border: 'none', color: '#999', fontSize: 13, cursor: 'pointer', padding: '4px 8px' }}>Limpiar todo</button>
            </div>
          )}

          {/* Resultados filtrados con paginación */}
          {hayFiltros ? (
            <div style={{ background: '#fff', borderRadius: 8, padding: 24, marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                {loadingFiltro ? 'Buscando…' : `${total} resultado${total !== 1 ? 's' : ''}`}
              </h2>
              {loadingFiltro ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>Buscando productos…</div>
              ) : productosFiltrados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, color: '#999' }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                  <p style={{ fontWeight: 600 }}>No se encontraron productos</p>
                  <p style={{ fontSize: 13, marginTop: 4 }}>Intenta con otros filtros</p>
                  <button onClick={limpiarFiltros} style={{ marginTop: 16, padding: '8px 20px', borderRadius: 6, border: 'none', background: '#3483fa', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Limpiar filtros</button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                    {productosFiltrados.map(p => <ProductoCard key={p.id} producto={p} onComprar={agregarCarrito} estaEnCarrito={estaEnCarrito(p.id)} yaComprado={yaComprado(p.id)} />)}
                  </div>
                  <Paginador page={page} totalPages={totalPages} onChange={p => { buscar(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
                  <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: '#999' }}>
                    Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} de {total} productos
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {eventos.length > 0 && (
                <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Zap size={18} color="#F59E0B" fill="#F59E0B" /> Eventos Flash Activos
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${eventos.length}, 1fr)`, gap: 12 }}>
                    {eventos.map(ev => (
                      <div key={ev.id} style={{ padding: 16, borderRadius: 8, border: '1px solid #e5e5e5', background: 'linear-gradient(135deg, #ecf2ff, #f0f7ff)' }}>
                        <div style={{ fontSize: 12, color: '#3483fa', fontWeight: 700, marginBottom: 4 }}>{ev.empresa?.nombre}</div>
                        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{ev.nombre}</div>
                        <CountdownTimer fechaFin={ev.fechaFin} />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>{ev.totalProductos} productos disponibles</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Tag size={18} color="#EF4444" /> Ofertas del día
                  <span style={{ background: '#EF4444', color: '#fff', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4 }}>HOT</span>
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  {ofertas.map(p => <ProductoCard key={p.id} producto={p} onComprar={agregarCarrito} estaEnCarrito={estaEnCarrito(p.id)} yaComprado={yaComprado(p.id)} />)}
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <TrendingUp size={18} color="#3483fa" /> Más populares
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                  {destacados.map(p => <ProductoCard key={p.id} producto={p} onComprar={agregarCarrito} estaEnCarrito={estaEnCarrito(p.id)} yaComprado={yaComprado(p.id)} />)}
                </div>
              </div>
              {[...new Set(productosHome.map(p => p.empresa?.nombre).filter(Boolean))].map(nombreEmpresa => {
                const prods = productosHome.filter(p => p.empresa?.nombre === nombreEmpresa).slice(0, 6);
                if (prods.length === 0) return null;
                return (
                  <div key={nombreEmpresa} style={{ background: '#fff', borderRadius: 8, padding: '20px 24px', marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h2 style={{ fontSize: 18, fontWeight: 700 }}>Productos de {nombreEmpresa}</h2>
                      <span onClick={() => { const emp = productosHome.find(p => p.empresa?.nombre === nombreEmpresa)?.empresa; if (emp) navigate('/marketplace/empresa/' + (emp.id || emp.empresaId)); }} style={{ fontSize: 13, color: '#3483fa', cursor: 'pointer', fontWeight: 600 }}>Ver tienda <ChevronRight size={14} style={{ display: 'inline' }} /></span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                      {prods.map(p => <ProductoCard key={p.id} producto={p} onComprar={agregarCarrito} estaEnCarrito={estaEnCarrito(p.id)} yaComprado={yaComprado(p.id)} />)}
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
