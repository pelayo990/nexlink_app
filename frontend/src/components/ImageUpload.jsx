import { useState, useRef } from 'react';
import { Upload, X, Image } from 'lucide-react';
import api from '../services/api';

export default function ImageUpload({ value, onChange, label = 'Imagen del producto' }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError('La imagen no puede superar 5MB');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      return setError('Solo se permiten imágenes JPG, PNG o WebP');

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('imagen', file);
      const { data } = await api.post('/uploads/imagen', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(data.url);
    } catch (e) {
      setError('Error al subir la imagen. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, display: 'block', marginBottom: 6 }}>{label}</label>

      {value ? (
        <div style={{ position: 'relative', width: '100%', height: 180, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
          <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button onClick={() => onChange('')}
            style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.6)', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          style={{ width: '100%', height: 140, border: '2px dashed var(--border)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', background: 'var(--bg)', transition: 'border-color .15s' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
          {loading ? (
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Subiendo imagen...</div>
          ) : (
            <>
              <Image size={28} color="var(--text-muted)" />
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Arrastra o haz clic para subir</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>JPG, PNG, WebP — máx. 5MB</div>
            </>
          )}
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])} />

      {error && <div style={{ fontSize: 12, color: '#EF4444', marginTop: 6 }}>{error}</div>}
    </div>
  );
}
