import { useState } from 'react';
import { formatRut, validarRut } from '../utils/rut';

export default function RutInput({ value, onChange, placeholder = '12.345.678-9', style = {}, required = false }) {
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const raw = e.target.value;
    const formatted = formatRut(raw);
    onChange(formatted);
    setError('');
  };

  const handleBlur = () => {
    if (!value) { setError(''); return; }
    if (!validarRut(value)) {
      setError('RUT inválido');
    } else {
      setError('');
    }
  };

  return (
    <div>
      <input
        className="input"
        value={value || ''}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={12}
        style={{ width: '100%', borderColor: error ? '#EF4444' : undefined, ...style }}
      />
      {error && <div style={{ fontSize: 11, color: '#EF4444', marginTop: 4 }}>{error}</div>}
    </div>
  );
}
