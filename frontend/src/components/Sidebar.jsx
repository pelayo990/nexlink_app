import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Package, Calendar, Users, Building2,
  Tag, BarChart3, LogOut, ChevronRight, Settings
} from 'lucide-react';

const NAV = {
  admin: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/marcas', icon: Tag, label: 'Marcas' },
    { to: '/admin/empresas', icon: Building2, label: 'Empresas' },
    { to: '/admin/eventos', icon: Calendar, label: 'Eventos' },
    { to: '/admin/colaboradores', icon: Users, label: 'Colaboradores' },
    { to: '/admin/reportes', icon: BarChart3, label: 'Reportes' },
  ],
  marca: [
    { to: '/marca', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/marca/productos', icon: Package, label: 'Mis Productos' },
    { to: '/marca/eventos', icon: Calendar, label: 'Mis Eventos' },
    { to: '/marca/reportes', icon: BarChart3, label: 'Reportes' },
  ],
  empresa: [
    { to: '/empresa', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/empresa/colaboradores', icon: Users, label: 'Colaboradores' },
    { to: '/empresa/eventos', icon: Calendar, label: 'Eventos Activos' },
    { to: '/empresa/reportes', icon: BarChart3, label: 'Reportes' },
  ],
  colaborador: [
    { to: '/marketplace', icon: Package, label: 'Marketplace' },
    { to: '/marketplace/mis-compras', icon: BarChart3, label: 'Mis Compras' },
  ],
};

const ROL_LABELS = {
  admin: 'Admin NexLink',
  marca: 'Portal Marca',
  empresa: 'Portal Empresa',
  colaborador: 'Portal Colaborador',
};

const ROL_COLORS = {
  admin: 'linear-gradient(135deg,#1E2761,#4F46E5)',
  marca: 'linear-gradient(135deg,#065A82,#1C7293)',
  empresa: 'linear-gradient(135deg,#028090,#02C39A)',
  colaborador: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV[user?.rol] || [];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      width: 'var(--sidebar-w)', position: 'fixed', left: 0, top: 0, bottom: 0,
      background: '#0F172A', display: 'flex', flexDirection: 'column', zIndex: 100,
      borderRight: '1px solid rgba(255,255,255,.05)',
    }}>
      {/* Brand */}
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'linear-gradient(135deg,#4F46E5,#7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 18, letterSpacing: '-.02em' }}>NexLink</div>
            <div style={{ color: '#64748B', fontSize: 11, fontWeight: 500 }}>{ROL_LABELS[user?.rol]}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 6, padding: '0 8px 8px', color: '#475569', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Menú
        </div>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === links[0].to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 8, marginBottom: 2,
              textDecoration: 'none', fontSize: 14, fontWeight: 500,
              transition: 'all .15s',
              background: isActive ? 'rgba(79,70,229,.25)' : 'transparent',
              color: isActive ? '#A5B4FC' : '#94A3B8',
            })}>
            {({ isActive }) => (
              <>
                <Icon size={18} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <ChevronRight size={14} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 12px', borderRadius: 8,
          background: 'rgba(255,255,255,.04)',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: ROL_COLORS[user?.rol] || 'var(--primary-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
          }}>
            {user?.avatar || user?.nombre?.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#E2E8F0', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.nombre}
            </div>
            <div style={{ color: '#64748B', fontSize: 11 }}>{user?.email?.split('@')[1] ? `@${user.email.split('@')[1]}` : ''}</div>
          </div>
          <button onClick={handleLogout} title="Cerrar sesión"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 4, borderRadius: 4 }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
