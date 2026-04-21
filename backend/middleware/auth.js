const jwt = require('jsonwebtoken');

// Falla explícitamente si no está definido — nunca usar fallback hardcodeado
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido. Crea un archivo .env con JWT_SECRET=<secreto>');
}

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

const roleMiddleware = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.rol)) {
    return res.status(403).json({ error: 'Acceso no autorizado para este rol' });
  }
  next();
};

module.exports = { authMiddleware, roleMiddleware };
