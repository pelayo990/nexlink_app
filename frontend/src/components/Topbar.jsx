import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Topbar({ title, subtitle }) {
  const { user } = useAuth();
  return (
    <div className="topbar">
      <div>
        {title && <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h1>}
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 1 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" placeholder="Buscar..." style={{ paddingLeft: 32, width: 200, height: 36 }} />
        </div>
        <button style={{ position: 'relative', background: 'none', border: '1.5px solid var(--border)', borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
          <Bell size={18} />
          <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', border: '2px solid #fff' }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
          <div className="avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{user?.avatar}</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.nombre?.split(' ')[0]}</span>
        </div>
      </div>
    </div>
  );
}
