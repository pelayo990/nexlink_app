import { useState, useEffect, useRef } from 'react';
import { Bell, Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Topbar({ title, subtitle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [search, setSearch] = useState('');
  const [resultados, setResultados] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    api.get('/eventos').then(r => {
      const proximos = r.data.filter(e => e.estado === 'proximo' || e.estado === 'activo');
      setNotifs(proximos.map(e => ({
        id: e.id,
        titulo: e.estado === 'activo' ? '🔥 Evento activo' : '📅 Próximo evento',
        mensaje: e.nombre,
        tiempo: new Date(e.fechaInicio).toLocaleDateString('es-CL'),
        leido: false,
      })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!search.trim()) { setResultados([]); return; }
    const timer = setTimeout(() => {
      Promise.all([
        api.get('/eventos'),
        api.get('/productos'),
      ]).then(([evRes, prRes]) => {
        const q = search.toLowerCase();
        const evs = evRes.data.filter(e => e.nombre.toLowerCase().includes(q)).slice(0, 3).map(e => ({ tipo: 'evento', label: e.nombre, sub: e.marca?.nombre, id: e.id }));
        const prs = (prRes.data.productos || []).filter(p => p.nombre.toLowerCase().includes(q)).slice(0, 3).map(p => ({ tipo: 'producto', label: p.nombre, sub: p.categoria, id: p.id }));
        setResultados([...evs, ...prs]);
        setShowSearch(true);
      }).catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const noLeidas = notifs.filter(n => !n.leido).length;

  const marcarLeidas = () => {
    setNotifs(n => n.map(x => ({ ...x, leido: true })));
  };

  return (
    <div className="topbar">
      <div>
        {title && <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h1>}
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 1 }}>{subtitle}</p>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Buscador */}
        <div style={{ position: 'relative' }} ref={searchRef}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Buscar..." style={{ paddingLeft: 32, width: 200, height: 36 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => resultados.length > 0 && setShowSearch(true)}
          />
          {showSearch && resultados.length > 0 && (
            <div style={{ position: 'absolute', top: 42, left: 0, width: 280, background: '#fff', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', border: '1px solid var(--border)', zIndex: 200, overflow: 'hidden' }}>
              {resultados.map((r, i) => (
                <div key={i} onClick={() => { setSearch(''); setShowSearch(false); }}
                  style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: i < resultados.length - 1 ? '1px solid var(--border)' : 'none', display: 'flex', gap: 10, alignItems: 'center' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                  <span style={{ fontSize: 18 }}>{r.tipo === 'evento' ? '📅' : '📦'}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notificaciones */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button onClick={() => { setShowNotifs(v => !v); marcarLeidas(); }}
            style={{ position: 'relative', background: 'none', border: '1.5px solid var(--border)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <Bell size={18} />
            {noLeidas > 0 && (
              <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '2px solid #fff' }} />
            )}
          </button>

          {showNotifs && (
            <div style={{ position: 'absolute', top: 44, right: 0, width: 320, background: '#fff', borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,.12)', border: '1px solid var(--border)', zIndex: 200, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Notificaciones</span>
                <button onClick={() => setShowNotifs(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={16} /></button>
              </div>
              {notifs.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Sin notificaciones</div>
              ) : (
                notifs.slice(0, 5).map(n => (
                  <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: n.leido ? '#fff' : '#F8F7FF' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{n.titulo}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{n.mensaje}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{n.tiempo}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }}
          onClick={() => navigate('/perfil')}>
          <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{user?.avatar}</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.nombre?.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  );
}
