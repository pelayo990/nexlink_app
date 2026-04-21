import { BarChart3 } from 'lucide-react';
import Topbar from '../../components/Topbar';

export default function EmpresaReportes() {
  return (
    <>
      <Topbar title="Reportes" subtitle="Análisis y métricas de tu empresa" />
      <div className="page-body">
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <BarChart3 size={48} color="var(--text-muted)" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Reportes en construcción</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Esta sección estará disponible próximamente.</div>
        </div>
      </div>
    </>
  );
}
