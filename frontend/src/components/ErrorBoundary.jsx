import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // En producción puedes enviar el error a un servicio como Sentry
    console.error('ErrorBoundary capturó un error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 16,
          fontFamily: 'system-ui, sans-serif',
          color: '#374151',
          padding: 24,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 48 }}>⚠️</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Algo salió mal</h2>
          <p style={{ fontSize: 14, color: '#6B7280', maxWidth: 400, margin: 0 }}>
            Ocurrió un error inesperado en esta página. Puedes intentar recargar o volver al inicio.
          </p>
          {this.state.error && (
            <pre style={{
              fontSize: 12,
              background: '#FEF2F2',
              color: '#B91C1C',
              padding: '10px 16px',
              borderRadius: 8,
              maxWidth: 500,
              overflowX: 'auto',
              textAlign: 'left',
            }}>
              {this.state.error.message}
            </pre>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: '1px solid #D1D5DB',
                background: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Reintentar
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '8px 20px',
                borderRadius: 8,
                border: 'none',
                background: '#4F46E5',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Ir al inicio
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
