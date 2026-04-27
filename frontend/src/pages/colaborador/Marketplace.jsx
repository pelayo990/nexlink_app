import { useEffect, useState } from 'react';
import { Search, Zap, Clock, ShoppingCart, X, CheckCircle, AlertCircle } from 'lucide-react';
import Topbar from '../../components/Topbar';
import ProductCard from '../../components/ProductCard';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CATEGORIAS = ['Todas', 'Electrónica', 'Moda', 'Hogar', 'Deportes', 'Alimentos'];

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

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#EF4444' }}>
      <Clock size={13} /> {tiempo}
    </div>
  );
}

function CartModal({ items, onClose, onComprar, loading, error }) {
  const total = items.reduce((s, i) => s + i.precioEvento, 0);
  const ahorro = items.reduce((s, i) => s + (i.precioOriginal - i.precioEvento), 0);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.4)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: 400, height: '100vh', background: '#fff', padding: '28px 24px', display: 'flex', flexDirection: 'column', overflowY: 'auto', boxShadow: '-8px 0 30px rgba(0,0,0,.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Tu Carrito ({items.length})</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '12px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={48} />
            <p>Tu carrito está vacío</p>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: 12, background: 'var(--bg)', borderRadius: 10 }}>
                  <div style={{ width: 50, height: 50, background: 'linear-gradient(135deg,#EEF2FF,#E0E7FF)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>📦</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{item.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.marca?.nombre}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>
                      ${item.precioEvento.toLocaleString('es-CL')}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: '16px 0', borderTop: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'var(--text-secondary)' }}>
                <span>Ahorro total:</span>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>-${ahorro.toLocaleString('es-CL')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800 }}>
                <span>Total:</span>
                <span style={{ color: 'var(--primary)' }}>${total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', height: 48, fontSize: 16 }} onClick={onComprar} disabled={loading}>
              <CheckCircle size={18} /> {loading ? 'Procesando...' : 'Confirmar Compra'}
            </button>
          </>
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
  const [eventoSel, setEventoSel] = useState(null);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [ordenar, setOrdenar] = useState('relevancia');
  const [soloStock, setSoloStock] = useState(false);
  const [descuentoMin, setDescuentoMin] = useState(0);
  const [carrito, setCarrito] = useState([]);
  const [showCarrito, setShowCarrito] = useState(false);
  const [compraOk, setCompraOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comprando, setComprando] = useState(false);
  const [errorCompra, setErrorCompra] = useState('');
  const [dashData, setDashData] = useState(null);

  const cargarDatos = () => {
    Promise.all([
      api.get('/eventos'),
      api.get('/productos'),
      api.get('/compras/mis-compras'),
    ]).then(([evRes, prRes, comprasRes]) => {
      setEventos(evRes.data.filter(e => e.estado === 'activo'));
      setProductos(prRes.data);
      setMisCompras(comprasRes.data.map(c => c.productoId));
    }).finally(() => setLoading(false));

    if (user?.colaboradorId)
      api.get(`/dashboard/colaborador/${user.colaboradorId}`).then(r => setDashData(r.data));
  };

  useEffect(() => { cargarDatos(); }, [user]);

  const productosFiltrados = productos
    .filter(p => {
      const matchEvento = eventoSel ? p.eventoId === eventoSel.id : true;
      const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoria === 'Todas' || p.categoria === categoria;
      const matchStock = soloStock ? p.stock > 0 : true;
      const matchDesc = p.descuento >= descuentoMin;
      return matchEvento && matchSearch && matchCat && matchStock && matchDesc;
    })
    .sort((a, b) => {
      if (ordenar === 'precio-asc') return a.precioEvento - b.precioEvento;
      if (ordenar === 'precio-desc') return b.precioEvento - a.precioEvento;
      if (ordenar === 'descuento') return b.descuento - a.descuento;
      if (ordenar === 'stock') return b.stock - a.stock;
      return b.visitas - a.visitas; // relevancia
    });

  const estaEnCarrito = (id) => carrito.some(i => i.id === id);
  const yaComprado = (id) => misCompras.includes(id);

  const agregarCarrito = (producto) => {
    if (estaEnCarrito(producto.id) || yaComprado(producto.id)) return;
    setCarrito(c => [...c, producto]);
  };

  const confirmarCompra = async () => {
    setComprando(true);
    setErrorCompra('');
    try {
      await Promise.all(
        carrito.map(item =>
          api.post('/compras', { productoId: item.id, eventoId: item.eventoId || null })
        )
      );
      setCarrito([]);
      setShowCarrito(false);
      setCompraOk(true);
      cargarDatos();
      setTimeout(() => setCompraOk(false), 3500);
    } catch (e) {
      setErrorCompra(e.response?.data?.error || 'Error al procesar la compra. Intenta nuevamente.');
    } finally {
      setComprando(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando marketplace…</div>;

  return (
    <>
      <Topbar title="Marketplace" subtitle="Eventos exclusivos para colaboradores" />
      {showCarrito && <CartModal items={carrito} onClose={() => { setShowCarrito(false); setErrorCompra(''); }} onComprar={confirmarCompra} loading={comprando} error={errorCompra} />}

      {compraOk && (
        <div style={{ position: 'fixed', top: 80, right: 24, zIndex: 999, background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow-lg)' }}>
          <CheckCircle size={20} color="#065F46" />
          <span style={{ fontWeight: 600, color: '#065F46' }}>¡Compra realizada exitosamente!</span>
        </div>
      )}

      <div className="page-body">
        {/* User stats */}
        {dashData && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, padding: '16px 20px', background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', borderRadius: 14, color: '#fff', alignItems: 'center' }}>
            <div className="avatar avatar-lg" style={{ background: 'rgba(255,255,255,.2)' }}>{user?.avatar}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Hola, {user?.nombre?.split(' ')[0]} 👋</div>
              <div style={{ fontSize: 13, opacity: .8 }}>Tienes acceso a {dashData.stats.eventosDisponibles} eventos exclusivos</div>
            </div>
            {[
              { label: 'Mis Puntos', value: `${dashData.stats.puntos} pts`, icon: '⭐' },
              { label: 'Mis Compras', value: dashData.stats.comprasTotales, icon: '🛍️' },
              { label: 'Ahorro Total', value: `$${dashData.stats.montoAhorrado.toLocaleString('es-CL', { maximumFractionDigits: 0 })}`, icon: '💰' },
            ].map(s => (
              <div key={s.label} style={{ padding: '10px 20px', background: 'rgba(255,255,255,.15)', borderRadius: 10, textAlign: 'center', minWidth: 100 }}>
                <div style={{ fontSize: 18 }}>{s.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{s.value}</div>
                <div style={{ fontSize: 11, opacity: .8 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Eventos activos */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Zap size={18} color="#F59E0B" fill="#F59E0B" />
            <span className="section-title" style={{ marginBottom: 0 }}>Eventos Flash Activos</span>
            <span className="badge badge-warning">{eventos.length} disponibles</span>
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            <div onClick={() => setEventoSel(null)} style={{ flexShrink: 0, padding: '14px 20px', borderRadius: 12, cursor: 'pointer', border: `2px solid ${!eventoSel ? 'var(--primary)' : 'var(--border)'}`, background: !eventoSel ? '#EEF2FF' : '#fff', transition: 'all .15s', minWidth: 140 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Ver todo</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: !eventoSel ? 'var(--primary)' : 'var(--text-primary)' }}>{productos.length} productos</div>
            </div>
            {eventos.map(ev => (
              <div key={ev.id} onClick={() => setEventoSel(eventoSel?.id === ev.id ? null : ev)} style={{ flexShrink: 0, padding: '14px 20px', borderRadius: 12, cursor: 'pointer', border: `2px solid ${eventoSel?.id === ev.id ? 'var(--primary)' : 'var(--border)'}`, background: eventoSel?.id === ev.id ? '#EEF2FF' : '#fff', transition: 'all .15s', minWidth: 200 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{ev.marca?.nombre}</span>
                  <CountdownTimer fechaFin={ev.fechaFin} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: eventoSel?.id === ev.id ? 'var(--primary)' : 'var(--text-primary)' }}>{ev.nombre}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{ev.totalProductos} productos</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters + carrito */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {/* Fila 1: todo en una línea */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 180px', minWidth: 160 }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" placeholder="Buscar productos..." style={{ paddingLeft: 32, width: '100%', height: 38 }}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input" style={{ height: 38, fontSize: 13, width: 'auto' }} value={ordenar} onChange={e => setOrdenar(e.target.value)}>
              <option value="relevancia">Más relevantes</option>
              <option value="precio-asc">Menor precio</option>
              <option value="precio-desc">Mayor precio</option>
              <option value="descuento">Mayor descuento</option>
              <option value="stock">Mayor stock</option>
            </select>
            <select className="input" style={{ height: 38, fontSize: 13, width: 'auto' }} value={descuentoMin} onChange={e => setDescuentoMin(Number(e.target.value))}>
              <option value={0}>Cualquier descuento</option>
              <option value={20}>Desde 20% off</option>
              <option value={30}>Desde 30% off</option>
              <option value={40}>Desde 40% off</option>
              <option value={50}>Desde 50% off</option>
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              <input type="checkbox" checked={soloStock} onChange={e => setSoloStock(e.target.checked)} />
              Con stock
            </label>
            <button className="btn btn-primary" onClick={() => setShowCarrito(true)} style={{ position: 'relative', marginLeft: 'auto', flexShrink: 0 }}>
              <ShoppingCart size={16} /> Mi Carrito
              {carrito.length > 0 && (
                <span style={{ position: 'absolute', top: -8, right: -8, background: '#EF4444', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, border: '2px solid #fff' }}>
                  {carrito.length}
                </span>
              )}
            </button>
          </div>

          {/* Fila 2: categorías */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIAS.map(cat => (
              <button key={cat} onClick={() => setCategoria(cat)} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${categoria === cat ? 'var(--primary)' : 'var(--border)'}`, background: categoria === cat ? 'var(--primary)' : '#fff', color: categoria === cat ? '#fff' : 'var(--text-secondary)', transition: 'all .15s' }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
          {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
          {(descuentoMin > 0 || soloStock || ordenar !== 'relevancia') && (
            <button onClick={() => { setDescuentoMin(0); setSoloStock(false); setOrdenar('relevancia'); }}
              style={{ marginLeft: 10, fontSize: 12, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Limpiar filtros
            </button>
          )}
        </div>
        {productosFiltrados.length === 0 ? (
          <div className="empty-state card">
            <p>No se encontraron productos con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="grid-4">
            {productosFiltrados.map(p => (
              <div key={p.id} style={{ position: 'relative' }}>
                <ProductCard producto={p} onComprar={agregarCarrito} />
                {(estaEnCarrito(p.id) || yaComprado(p.id)) && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.85)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
                    <CheckCircle size={28} color="#10B981" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981' }}>
                      {yaComprado(p.id) ? 'Ya comprado' : 'En carrito'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
