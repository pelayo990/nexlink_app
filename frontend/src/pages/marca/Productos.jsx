import { useEffect, useState } from 'react';
import { Search, Plus, Package } from 'lucide-react';
import Topbar from '../../components/Topbar';
import api from '../../services/api';

export default function MarcaProductos() {
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/productos').then(r => setProductos(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = productos.filter(p =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.categoria.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Topbar title="Mis Productos" subtitle="Gestiona el inventario disponible para eventos flash" />
      <div className="page-body">
        <div className="page-header">
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" placeholder="Buscar producto..." style={{ paddingLeft: 32, width: 240, height: 38 }}
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary"><Plus size={16} /> Agregar Producto</button>
        </div>

        <div className="grid-4" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Productos', value: productos.length, color: '#4F46E5' },
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
                <thead>
                  <tr><th>Producto</th><th>Categoría</th><th>Precio Original</th><th>Precio Evento</th><th>Descuento</th><th>Stock</th><th>Estado</th><th>Acciones</th></tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.nombre}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.sku}</div>
                        </div>
                      </td>
                      <td><span className="tag">{p.categoria}</span></td>
                      <td style={{ color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        ${p.precioOriginal.toLocaleString('es-CL')}
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                        ${p.precioEvento.toLocaleString('es-CL')}
                      </td>
                      <td>
                        <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '3px 10px', borderRadius: 6, fontSize: 13, fontWeight: 700 }}>
                          -{p.descuento}%
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 600 }}>{p.stock}</span>
                          {p.stock <= p.stockMinimo * 2 && <span className="badge badge-warning" style={{ fontSize: 10 }}>Bajo</span>}
                        </div>
                      </td>
                      <td><span className={`badge ${p.estado === 'activo' ? 'badge-success' : 'badge-gray'}`}>{p.estado}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm">Editar</button>
                        </div>
                      </td>
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
