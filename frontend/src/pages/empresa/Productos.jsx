import { useEffect, useState } from 'react';
import { Search, Plus, X } from 'lucide-react';
import Topbar from '../../components/Topbar';
import ImageUpload from '../../components/ImageUpload';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const CATEGORIAS = ['Electrónica', 'Moda', 'Hogar', 'Deportes', 'Alimentos', 'Tecnología', 'Otro'];

const EMPTY = { nombre: '', descripcion: '', categoria: '', precioOriginal: '', precioEvento: '', descuento: '', stock: '', stockMinimo: 5, sku: '', condicion: 'nuevo', estado: 'activo', eventoId: '' };

function Modal({ producto, eventos, onClose, onSave }) {
  const [form, setForm] = useState(producto || EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mlUrl, setMlUrl] = useState('');
  const [loadingML, setLoadingML] = useState(false);
  const [mlError, setMlError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const calcDescuento = (original, evento) => {
    if (original && evento) {
      const pct = Math.round((1 - evento / original) * 100);
      setForm(f => ({ ...f, descuento: pct > 0 ? pct : 0 }));
    }
  };

  const importarDesdeML = async () => {
    if (!mlUrl.trim()) return;
    setLoadingML(true);
    setMlError('');
    try {
      const { data } = await api.post('/scraper/mercadolibre', { url: mlUrl });
      setForm(f => ({
        ...f,
        nombre: data.nombre || f.nombre,
        descripcion: data.descripcion || f.descripcion,
        precioOriginal: data.precioOriginal || f.precioOriginal,
        precioEvento: data.precioEvento || f.precioEvento,
        descuento: data.descuento || f.descuento,
        imagen: data.imagen || f.imagen,
        sku: data.sku || f.sku,
        condicion: data.condicion || f.condicion,
      }));
    } catch (e) {
      setMlError(e.response?.data?.error || 'No se pudo importar el producto. Verifica la URL.');
    } finally {
      setLoadingML(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.nombre || !form.categoria || !form.precioOriginal || !form.precioEvento || !form.stock)
      return setError('Nombre, categoría, precios y stock son obligatorios');
    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        precioOriginal: parseFloat(form.precioOriginal),
        precioEvento: parseFloat(form.precioEvento),
        descuento: parseFloat(form.descuento) || 0,
        stock: parseInt(form.stock),
        stockMinimo: parseInt(form.stockMinimo) || 5,
        eventoId: form.eventoId || null,
      };
      if (producto?.id) {
        await api.put(`/productos/${producto.id}`, payload);
      } else {
        await api.post('/productos', payload);
      }
      onSave();
    } catch (e) {
      setError(e.response?.data?.error || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.5)' }} onClick={onClose} />
      <div style={{ position: 'relative', background: '#fff', borderRadius: 16, width: 560, maxHeight: '90vh', overflowY: 'auto', padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{producto?.id ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>
        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Importar desde MercadoLibre */}
          <div style={{ background: '#F0FDF4', border: '1px solid #86EFAC', borderRadius: 10, padding: '14px 16px' }}>
            <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6, color: '#166534' }}>
              🛒 Importar desde MercadoLibre (opcional)
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input"
                value={mlUrl}
                onChange={e => setMlUrl(e.target.value)}
                placeholder="https://www.mercadolibre.cl/..."
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={importarDesdeML}
                disabled={loadingML || !mlUrl.trim()}
                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#16A34A', color: '#fff', fontWeight: 700, fontSize: 13, cursor: loadingML || !mlUrl.trim() ? 'default' : 'pointer', opacity: !mlUrl.trim() ? 0.5 : 1, whiteSpace: 'nowrap' }}>
                {loadingML ? 'Importando...' : 'Autorrellenar'}
              </button>
            </div>
            {mlError && <div style={{ marginTop: 8, fontSize: 12, color: '#991B1B' }}>{mlError}</div>}
            {!mlError && !loadingML && mlUrl && form.nombre && <div style={{ marginTop: 8, fontSize: 12, color: '#166534', fontWeight: 600 }}>✓ Datos importados correctamente</div>}
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Nombre *</label>
            <input className="input" value={form.nombre} onChange={e => set('nombre', e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Descripción</label>
            <textarea className="input" value={form.descripcion} onChange={e => set('descripcion', e.target.value)} rows={3} style={{ width: '100%', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Categoría *</label>
              <select className="input" value={form.categoria} onChange={e => set('categoria', e.target.value)} style={{ width: '100%' }}>
                <option value="">Seleccionar...</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>SKU</label>
              <input className="input" value={form.sku} onChange={e => set('sku', e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Precio original *</label>
              <input className="input" type="number" value={form.precioOriginal}
                onChange={e => { set('precioOriginal', e.target.value); calcDescuento(e.target.value, form.precioEvento); }}
                style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Precio evento *</label>
              <input className="input" type="number" value={form.precioEvento}
                onChange={e => { set('precioEvento', e.target.value); calcDescuento(form.precioOriginal, e.target.value); }}
                style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Descuento %</label>
              <input className="input" type="number" value={form.descuento} onChange={e => set('descuento', e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <ImageUpload value={form.imagen} onChange={url => set('imagen', url)} label="Imagen del producto" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Stock *</label>
              <input className="input" type="number" value={form.stock} onChange={e => set('stock', e.target.value)} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Evento</label>
              <select className="input" value={form.eventoId} onChange={e => set('eventoId', e.target.value)} style={{ width: '100%' }}>
                <option value="">Sin evento</option>
                {eventos.map(ev => <option key={ev.id} value={ev.id}>{ev.nombre}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : producto?.id ? 'Guardar cambios' : 'Crear Producto'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmpresaProductos() {
  const [productos, setProductos] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);

  const cargar = () => {
    setLoading(true);
    Promise.all([api.get('/productos'), api.get('/eventos')])
      .then(([pRes, eRes]) => { setProductos(pRes.data.productos); setEventos(eRes.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.categoria.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar title="Mis Productos" subtitle="Gestiona el inventario disponible para eventos flash" />
      {modal && <Modal producto={modal === 'new' ? null : modal} eventos={eventos} onClose={() => setModal(null)} onSave={() => { setModal(null); cargar(); }} />}
      <div className="page-body">
        <div className="page-header">
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Buscar producto..." style={{ paddingLeft: 32, width: 240, height: 38 }}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={16} /> Agregar Producto</button>
        </div>
        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total', value: productos.length, color: '#4F46E5' },
            { label: 'Activos', value: productos.filter(p => p.estado === 'activo').length, color: '#10B981' },
            { label: 'Stock Total', value: productos.reduce((s, p) => s + p.stock, 0).toLocaleString('es-CL'), color: '#06B6D4' },
            { label: 'Desc. Promedio', value: `${Math.round(productos.reduce((s, p) => s + p.descuento, 0) / (productos.length || 1))}%`, color: '#F59E0B' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            {loading ? <div style={{ padding: 40, textAlign: 'center' }}>Cargando…</div> : (
              <table>
                <thead><tr><th>Producto</th><th>Categoría</th><th>Precio Original</th><th>Precio Evento</th><th>Descuento</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td><div style={{ fontWeight: 600 }}>{p.nombre}</div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.sku}</div></td>
                      <td><span className="tag">{p.categoria}</span></td>
                      <td style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>${p.precioOriginal.toLocaleString('es-CL')}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>${p.precioEvento.toLocaleString('es-CL')}</td>
                      <td><span style={{ background: '#FEE2E2', color: '#991B1B', padding: '3px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>-{p.descuento}%</span></td>
                      <td style={{ fontWeight: 600 }}>{p.stock}</td>
                      <td><span className={`badge ${p.estado === 'activo' ? 'badge-success' : 'badge-gray'}`}>{p.estado}</span></td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => setModal(p)}>Editar</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
