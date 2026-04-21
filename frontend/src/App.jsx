import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Login from './pages/Login';

import AdminDashboard from './pages/admin/Dashboard';
import AdminMarcas from './pages/admin/Marcas';
import AdminEmpresas from './pages/admin/Empresas';
import AdminEventos from './pages/admin/Eventos';

import MarcaDashboard from './pages/marca/Dashboard';
import MarcaProductos from './pages/marca/Productos';

import EmpresaDashboard from './pages/empresa/Dashboard';
import EmpresaColaboradores from './pages/empresa/Colaboradores';

import Marketplace from './pages/colaborador/Marketplace';
import MisCompras from './pages/colaborador/MisCompras';

const ROL_HOME = {
  admin: '/admin',
  marca: '/marca',
  empresa: '/empresa',
  colaborador: '/marketplace',
};

function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to={ROL_HOME[user.rol] || '/login'} replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">{children}</div>
    </div>
  );
}

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROL_HOME[user.rol] || '/login'} replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/marcas" element={<ProtectedRoute roles={['admin']}><AppLayout><AdminMarcas /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/empresas" element={<ProtectedRoute roles={['admin']}><AppLayout><AdminEmpresas /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/eventos" element={<ProtectedRoute roles={['admin']}><AppLayout><AdminEventos /></AppLayout></ProtectedRoute>} />

          {/* Marca */}
          <Route path="/marca" element={<ProtectedRoute roles={['marca']}><AppLayout><MarcaDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/marca/productos" element={<ProtectedRoute roles={['marca']}><AppLayout><MarcaProductos /></AppLayout></ProtectedRoute>} />
          <Route path="/marca/eventos" element={<ProtectedRoute roles={['marca', 'admin']}><AppLayout><AdminEventos /></AppLayout></ProtectedRoute>} />

          {/* Empresa */}
          <Route path="/empresa" element={<ProtectedRoute roles={['empresa']}><AppLayout><EmpresaDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/empresa/colaboradores" element={<ProtectedRoute roles={['empresa']}><AppLayout><EmpresaColaboradores /></AppLayout></ProtectedRoute>} />
          <Route path="/empresa/eventos" element={<ProtectedRoute roles={['empresa']}><AppLayout><AdminEventos /></AppLayout></ProtectedRoute>} />

          {/* Colaborador */}
          <Route path="/marketplace" element={<ProtectedRoute roles={['colaborador']}><AppLayout><Marketplace /></AppLayout></ProtectedRoute>} />
          <Route path="/marketplace/mis-compras" element={<ProtectedRoute roles={['colaborador']}><AppLayout><MisCompras /></AppLayout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ErrorBoundary>
  );
}
