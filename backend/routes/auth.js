const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const users = require('../data/users.json');

// Falla explícitamente si no está definido
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido. Crea un archivo .env con JWT_SECRET=<secreto>');
}

// Máximo 10 intentos de login cada 15 minutos por IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta nuevamente en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña requeridos' });

  const user = users.find(u => u.email === email);
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

// GET /api/auth/me
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
