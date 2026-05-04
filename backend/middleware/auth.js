const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido. Crea un archivo .env con JWT_SECRET=<secreto>');
}

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  // Leer token desde cookie httpOnly primero, fallback a Authorization header
  const token = req.cookies?.nexlink_token ||
    (req.headers['authorization']?.split(' ')[1]);

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.rol !== 'admin') {
      const user = await prisma.user.findUnique({ where: { id: decoded.id }, select: { emailVerificado: true } });
      if (!user?.emailVerificado) {
        return res.status(403).json({ error: 'Debes confirmar tu email antes de acceder. Revisa tu bandeja de entrada.' });
      }
    }

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
