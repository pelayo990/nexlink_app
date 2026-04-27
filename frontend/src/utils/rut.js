export function formatRut(value) {
  const clean = value.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return clean;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const bodyFormatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${bodyFormatted}-${dv}`;
}

export function validarRut(rut) {
  if (!rut) return false;
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const remainder = 11 - (sum % 11);
  const expected = remainder === 11 ? '0' : remainder === 10 ? 'K' : String(remainder);
  return dv === expected;
}

export function limpiarRut(rut) {
  return rut?.replace(/[^0-9kK]/g, '').toUpperCase() || '';
}
