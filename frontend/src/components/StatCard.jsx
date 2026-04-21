export default function StatCard({ label, value, icon: Icon, color = '#4F46E5', change, changePct, prefix = '', suffix = '' }) {
  const bg = color + '18';
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{prefix}{typeof value === 'number' ? value.toLocaleString('es-CL') : value}{suffix}</div>
        {changePct !== undefined && (
          <div className={`stat-change ${changePct >= 0 ? 'up' : 'down'}`}>
            {changePct >= 0 ? '↑' : '↓'} {Math.abs(changePct)}% {change && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{change}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
