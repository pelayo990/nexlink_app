import { useEffect, useState } from 'react';
import { CheckCircle, Eye } from 'lucide-react';
import Topbar from '../../components/Topbar';
import ImageUpload from '../../components/ImageUpload';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function MiPagina() {
  const { user } = useAuth();
  const [pagina, setPagina] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!user?.empresaId) return;
    api.get(`/pagina-empresa/${user.empresaId}`).then(r => {
      setPagina(r.data.pagina);
      setForm(r.data.pagina);
    }).finally(() => setLoading(false));
  }, [user]);

  const guardar = async () => {
    setSaving(true);
    try {
      const { id, empresaId, createdAt, updatedAt, empresa, productos, eventos, ...data } = form;
      await api.put(`/pagina-empresa/${user.empresaId}`, data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Cargando…</div>;

  const colorPrimario = form?.colorPrimario || '#4F46E5';
  const colorSecundario = form?.colorSecundario || '#7C3AED';

  return (
    <>
      <Topbar title="Mi Página" subtitle="Personaliza cómo te ven los colaboradores en el Marketplace" />
      <div className="page-body">

        {saved && (
          <div style={{ background: '#D1FAE5', border: '1px solid #6EE7B7', borderRadius: 10, padding: '12px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle size={18} color="#065F46" />
            <span style={{ fontWeight: 600, color: '#065F46' }}>Cambios guardados exitosamente</span>
          </div>
        )}

        {/* Preview */}
        <div style={{ borderRadius: 12, overflow: 'hidden', marginBottom: 24, border: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', height: 200 }}>
            {form?.banner?.startsWith('http') ? (
              <img src={form.banner} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${colorPrimario}, ${colorSecundario})` }} />
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,.2) 0%, transparent 40%, rgba(0,0,0,.4) 100%)' }} />
            <div style={{ position: 'absolute', bottom: 20, left: 24, display: 'flex', alignItems: 'flex-end', gap: 16 }}>
              {form?.logo?.startsWith('http') ? (
                <img src={form.logo} alt="logo" style={{ width: 56, height: 56, borderRadius: 12, border: '2px solid #fff', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: 12, background: colorPrimario, border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 900 }}>
                  {user?.nombre?.charAt(0)}
                </div>
              )}
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,.4)' }}>{user?.nombre}</div>
                {form?.tagline && <div style={{ fontSize: 13, color: 'rgba(255,255,255,.85)' }}>{form.tagline}</div>}
              </div>
            </div>
            <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,.4)', color: '#fff', padding: '4px 10px', borderRadius: 6, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Eye size={12} /> Vista previa
            </div>
          </div>
        </div>

        <div className="grid-2">
          {/* Columna izquierda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <div className="section-title" style={{ marginBottom: 16 }}>Contenido principal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Tagline</label>
                  <input className="input" value={form?.tagline || ''} onChange={e => set('tagline', e.target.value)}
                    placeholder="ej: Tu aliado tecnológico" style={{ width: '100%' }} />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Frase corta que aparece bajo el nombre de tu empresa</p>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Descripción</label>
                  <textarea className="input" value={form?.descripcion || ''} onChange={e => set('descripcion', e.target.value)}
                    placeholder="Cuéntale a los colaboradores sobre tu empresa y los beneficios que ofreces..."
                    rows={5} style={{ width: '100%', resize: 'vertical' }} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-title" style={{ marginBottom: 16 }}>Colores de tu página</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Color primario</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={form?.colorPrimario || '#4F46E5'} onChange={e => set('colorPrimario', e.target.value)}
                      style={{ width: 44, height: 40, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }} />
                    <input className="input" value={form?.colorPrimario || '#4F46E5'} onChange={e => set('colorPrimario', e.target.value)} style={{ flex: 1 }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>Color secundario</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={form?.colorSecundario || '#7C3AED'} onChange={e => set('colorSecundario', e.target.value)}
                      style={{ width: 44, height: 40, borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }} />
                    <input className="input" value={form?.colorSecundario || '#7C3AED'} onChange={e => set('colorSecundario', e.target.value)} style={{ flex: 1 }} />
                  </div>
                </div>
              </div>
              {/* Preview colores */}
              <div style={{ marginTop: 12, height: 40, borderRadius: 8, background: `linear-gradient(135deg, ${form?.colorPrimario || '#4F46E5'}, ${form?.colorSecundario || '#7C3AED'})` }} />
            </div>
          </div>

          {/* Columna derecha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <div className="section-title" style={{ marginBottom: 16 }}>Imágenes</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <ImageUpload value={form?.banner || ''} onChange={url => set('banner', url)} label="Banner principal (1400×400 recomendado)" />
                </div>
                <div>
                  <ImageUpload value={form?.logo || ''} onChange={url => set('logo', url)} label="Logo de empresa" />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="section-title" style={{ marginBottom: 8 }}>Estado de la página</div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                Si desactivas tu página, los colaboradores no podrán verla en el Marketplace.
              </p>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={form?.activa ?? true} onChange={e => set('activa', e.target.checked)}
                  style={{ width: 18, height: 18, cursor: 'pointer' }} />
                <span style={{ fontSize: 14, fontWeight: 600 }}>Página activa y visible</span>
              </label>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <button className="btn btn-primary" style={{ height: 44, paddingLeft: 32, paddingRight: 32, fontSize: 15 }}
            onClick={guardar} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </>
  );
}
