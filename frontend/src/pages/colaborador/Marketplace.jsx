import { useEffect, useState } from 'react';
import { Search, Zap, Clock, Star, ShoppingCart, X, CheckCircle } from 'lucide-react';
import Topbar from '../../components/Topbar';
import EventoCard from '../../components/EventoCard';
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

function CartModal({ items, onClose, onComprar }) {
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

            <button className="btn btn-primary" style={{ width: '100%', height: 48, fontSize: 16 }} onClick={onComprar}>
              <CheckCircle size={18} /> Confirmar Compra
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
  const [eventoSel, setEventoSel] = useState(null);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [carrito, setCarrito] = useState([]);
  const [showCarrito, setShowCarrito] = useState(false);
  const [compraOk, setCompraOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dashData, setDashData] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/eventos'),
      api.get('/productos'),
    ]).then(([evRes, prRes]) => {
      setEventos(evRes.data.filter(e => e.estado === 'activo'));
      setProductos(prRes.data);
    }).finally(() => setLoading(false));

    if (user?.colaboradorId)
      api.get(`/dashboard/colaborador/${user.colaboradorId}`).then(r => setDashData(r.data));
  }, [user]);

  const productosFiltrados = productos.filter(p => {
    const matchEvento = eventoSel ? p.eventoId === eventoSel.id : true;
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoria === 'Todas' || p.categoria === categoria;
    return matchEvento && matchSearch && matchCat;
  });

  const agregarCarrito = (producto) => {
    setCarrito(c => [...c, producto]);
  };

  const confirmarCompra = () => {
    setCarrito([]);
    setShowCarrito(false);
    setCompraOk(true);
    setTimeout(() => setCompraOk(false), 3500);
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Cargando marketplace…</div>;

  return (
    <>
      <Topbar title="Marketplace" subtitle="Eventos exclusivos para colaboradores" />
      {showCarrito && <CartModal items={carrito} onClose={() => setShowCarrito(false)} onComprar={confirmarCompra} />}

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
            {/* All button */}
            <div
              onClick={() => setEventoSel(null)}
              style={{
                flexShrink: 0, padding: '14px 20px', borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${!eventoSel ? 'var(--primary)' : 'var(--border)'}`,
                background: !eventoSel ? '#EEF2FF' : '#fff', transition: 'all .15s', minWidth: 140,
              }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4 }}>Ver todo</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: !eventoSel ? 'var(--primary)' : 'var(--text-primary)' }}>
                {productos.length} productos
              </div>
            </div>
            {eventos.map(ev => (
              <div key={ev.id}
                onClick={() => setEventoSel(eventoSel?.id === ev.id ? null : ev)}
                style={{
                  flexShrink: 0, padding: '14px 20px', borderRadius: 12, cursor: 'pointer',
                  border: `2px solid ${eventoSel?.id === ev.id ? 'var(--primary)' : 'var(--border)'}`,
                  background: eventoSel?.id === ev.id ? '#EEF2FF' : '#fff', transition: 'all .15s', minWidth: 200,
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>{ev.marca?.nombre}</span>
                  <CountdownTimer fechaFin={ev.fechaFin} />
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: eventoSel?.id === ev.id ? 'var(--primary)' : 'var(--text-primary)' }}>
                  {ev.nombre}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{ev.totalProductos} productos</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters + carrito */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" placeholder="Buscar productos..." style={{ paddingLeft: 32, width: 220, height: 38 }}
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {CATEGORIAS.map(cat => (
                <button key={cat}
                  onClick={() => setCategoria(cat)}
                  style={{
                    padding: '6px 14px', borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    border: `1.5px solid ${categoria === cat ? 'var(--primary)' : 'var(--border)'}`,
                    background: categoria === cat ? 'var(--primary)' : '#fff',
                    color: categoria === cat ? '#fff' : 'var(--text-secondary)',
                    transition: 'all .15s',
                  }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowCarrito(true)} style={{ position: 'relative' }}>
            <ShoppingCart size={16} /> Mi Carrito
            {carrito.length > 0 && (
              <span style={{ position: 'absolute', top: -8, right: -8, background: '#EF4444', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, border: '2px solid #fff' }}>
                {carrito.length}
              </span>
            )}
          </button>
        </div>

        {/* Products grid */}
        {productosFiltrados.length === 0 ? (
          <div className="empty-state card">
            <p>No se encontraron productos con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="grid-4">
            {productosFiltrados.map(p => (
              <ProductCard key={p.id} producto={p} onComprar={agregarCarrito} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
