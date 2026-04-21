const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();




const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET no definido en .env');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos. Intenta en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña requeridos' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  const payload = {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    avatar: user.avatar,
    marcaId: user.marcaId || null,
    empresaId: user.empresaId || null,
    colaboradorId: user.colaboradorId || null,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: payload });
});

router.get('/me', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autenticado' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json(decoded);
  } catch {
    res.status(403).json({ error: 'Token inválido' });
  }
});

module.exports = router;

// POST /api/auth/cambiar-password
router.post('/cambiar-password', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autenticado' });

  let decoded;
  try { decoded = jwt.verify(token, JWT_SECRET); }
  catch { return res.status(403).json({ error: 'Token inválido' }); }

  const { passwordActual, passwordNueva } = req.body;
  if (!passwordActual || !passwordNueva)
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  if (passwordNueva.length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const valid = await bcrypt.compare(passwordActual, user.password);
  if (!valid) return res.status(401).json({ error: 'Contraseña actual incorrecta' });

  const hash = await bcrypt.hash(passwordNueva, 10);
  await prisma.user.update({ where: { id: user.id }, data: { password: hash } });

  res.json({ message: 'Contraseña actualizada exitosamente' });
});
