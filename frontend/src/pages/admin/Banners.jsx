import { useEffect, useState } from 'react';
import { Plus, X, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import Topbar from '../../components/Topbar';
import ImageUpload from '../../components/ImageUpload';
import api from '../../services/api';

const EMPTY = {
  titulo: '',
  subtitulo: '',
  imagen: '',
  colorFondo: '#3483fa',
  colorTexto: '#ffffff',
  ctaTexto: '',
  ctaLink: '',
  orden: 0,
  activo: true,
};

function Modal({ banner, onClose, onSave }) {
  const [form, setForm] = useState(banner || EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.titulo || !form.imagen) return setError('Título e imagen son obligatorios');
    setLoading(true);
    setError('');
    try {
      if (banner?.id) {
        await api.put(`/banners/${banner.id}`, form);
      } else {
        await api.post('/banners', form);
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
      <div style={{ position: 'relative', background: '#fff', borderRadius: 16, width: 600, maxHeight: '90vh', overflowY: 'auto', padding: 32, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{banner?.id ? 'Editar Banner' : 'Nuevo Banner'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
        </div>

        {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

        {/* Preview */}
        {form.imagen && (
          <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', marginBottom: 20, height: 160 }}>
            <img src={form.imagen} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,.6) 0%, transparent 70%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,.5))' }} />
            <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: form.colorTexto }}>{form.titulo || 'Título del banner'}</div>
              {form.subtitulo && <div style={{ fontSize: 13, color: form.colorTexto, opacity: .85 }}>{form.subtitulo}</div>}
              {form.ctaTexto && <div style={{ marginTop: 8, background: '#fff', color: '#333', padding: '4px 14px', borderRadius: 4, fontSize: 12, fontWeight: 700, display: 'inline-block' }}>{form.ctaTexto}</div>}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Título *</label>
            <input className="input" value={form.titulo} onChange={e => set('titulo', e.target.value)} placeholder="ej: Ofertas de Verano" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Subtítulo</label>
            <input className="input" value={form.subtitulo || ''} onChange={e => set('subtitulo', e.target.value)} placeholder="ej: Hasta 50% de descuento" style={{ width: '100%' }} />
          </div>
          <div>
            <ImageUpload value={form.imagen} onChange={url => set('imagen', url)} label="Imagen del banner *" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Texto del botón</label>
              <input className="input" value={form.ctaTexto || ''} onChange={e => set('ctaTexto', e.target.value)} placeholder="ej: Ver ofertas" style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Orden</label>
              <input className="input" type="number" value={form.orden} onChange={e => set('orden', parseInt(e.target.value) || 0)} style={{ width: '100%' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Color de fondo</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.colorFondo} onChange={e => set('colorFondo', e.target.value)} style={{ width: 40, height: 38, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }} />
                <input className="input" value={form.colorFondo} onChange={e => set('colorFondo', e.target.value)} style={{ flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Color de texto</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={form.colorTexto} onChange={e => set('colorTexto', e.target.value)} style={{ width: 40, height: 38, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }} />
                <input className="input" value={form.colorTexto} onChange={e => set('colorTexto', e.target.value)} style={{ flex: 1 }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Estado</label>
              <select className="input" value={form.activo ? 'true' : 'false'} onChange={e => set('activo', e.target.value === 'true')} style={{ width: '100%' }}>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 28, justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Guardando...' : banner?.id ? 'Guardar cambios' : 'Crear Banner'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [eliminando, setEliminando] = useState(null);

  const cargar = () => {
    setLoading(true);
    api.get('/banners/todos').then(r => setBanners(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este banner?')) return;
    setEliminando(id);
    try {
      await api.delete(`/banners/${id}`);
      cargar();
    } catch (e) {
      alert('Error al eliminar');
    } finally {
      setEliminando(null);
    }
  };

  const toggleActivo = async (banner) => {
    await api.put(`/banners/${banner.id}`, { ...banner, activo: !banner.activo });
    cargar();
  };

  return (
    <>
      <Topbar title="Banners del Marketplace" subtitle="Gestiona los banners que ven los colaboradores" />
      {modal && <Modal banner={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={() => { setModal(null); cargar(); }} />}

      <div className="page-body">
        <div className="page-header">
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{banners.filter(b => b.activo).length} banners activos de {banners.length} totales</div>
          </div>
          <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={15} /> Nuevo Banner</button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>Cargando…</div>
        ) : banners.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🖼️</div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>No hay banners aún</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, marginBottom: 24 }}>Crea tu primer banner para el Marketplace</div>
            <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={15} /> Crear Banner</button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {banners.map(b => (
              <div key={b.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                  {/* Preview */}
                  <div style={{ width: 280, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                    <img src={b.imagen} alt={b.titulo} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', minHeight: 120 }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,.5) 0%, transparent 70%)' }} />
                    <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: 16 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: b.colorTexto }}>{b.titulo}</div>
                      {b.subtitulo && <div style={{ fontSize: 12, color: b.colorTexto, opacity: .85 }}>{b.subtitulo}</div>}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{b.titulo}</div>
                      {b.subtitulo && <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>{b.subtitulo}</div>}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className={`badge ${b.activo ? 'badge-success' : 'badge-gray'}`}>{b.activo ? 'Activo' : 'Inactivo'}</span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Orden: {b.orden}</span>
                        {b.ctaTexto && <span className="tag">{b.ctaTexto}</span>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => toggleActivo(b)} title={b.activo ? 'Desactivar' : 'Activar'}>
                        {b.activo ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(b)}>Editar</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: '#EF4444' }} onClick={() => eliminar(b.id)} disabled={eliminando === b.id}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
