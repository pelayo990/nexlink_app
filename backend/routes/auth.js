const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { enviarVerificacion, enviarBienvenida, enviarNotificacionNuevoColaborador } = require('../services/email');

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

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña requeridos' });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  if (!user.emailVerificado && user.rol !== 'admin') {
    return res.status(403).json({ error: 'Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.' });
  }

  const payload = {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    avatar: user.avatar,
    empresaId: user.empresaId || null,
    colaboradorId: user.colaboradorId || null,
    debeCambiarPassword: user.debeCambiarPassword || false,
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
  await prisma.user.update({ where: { id: user.id }, data: { password: hash, debeCambiarPassword: false } });
  res.json({ message: 'Contraseña actualizada exitosamente' });
});

// POST /api/auth/registro — solo colaboradores
router.post('/registro', async (req, res) => {
  const { nombre, email, password, rut, telefono, cargo } = req.body;

  if (!nombre || !email || !password)
    return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
  if (password.length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

  const dominio = email.split('@')[1];
  if (!dominio) return res.status(400).json({ error: 'Email inválido' });

  const empresa = await prisma.empresa.findFirst({
    where: { dominiosPermitidos: { has: dominio }, estado: 'activo' },
  });
  if (!empresa)
    return res.status(400).json({ error: 'Tu empresa no está registrada en NexLink. Contacta a tu área de RRHH.' });

  const existe = await prisma.user.findUnique({ where: { email } });
  if (existe) return res.status(409).json({ error: 'Ya existe una cuenta con ese email' });

  const hash = await bcrypt.hash(password, 10);
  const avatar = nombre.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase();
  const token = crypto.randomBytes(32).toString('hex');
  const tokenExpira = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const colaborador = await prisma.colaborador.create({
    data: { empresaId: empresa.id, nombre, email, cargo: cargo || null, rut: rut || null, estado: 'activo', puntos: 0 },
  });

  await prisma.user.create({
    data: {
      nombre, email, password: hash, rol: 'colaborador', avatar,
      empresaId: empresa.id, colaboradorId: colaborador.id,
      emailVerificado: false, tokenVerificacion: token, tokenExpira,
    },
  });

  try {
    await enviarVerificacion({ nombre, email, token });
  } catch (e) {
    console.error('Error enviando email:', e);
  }

  res.status(201).json({
    message: `Te enviamos un email a ${email}. Confirma tu cuenta para acceder al marketplace.`,
    empresa: empresa.nombre,
  });
});

// GET /api/auth/verificar?token=xxx
router.get('/verificar', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Token requerido' });

  const user = await prisma.user.findUnique({ where: { tokenVerificacion: token } });
  if (!user) return res.status(400).json({ error: 'Token inválido o ya usado' });
  if (user.tokenExpira < new Date()) return res.status(400).json({ error: 'Token expirado. Regístrate nuevamente.' });

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerificado: true, tokenVerificacion: null, tokenExpira: null },
  });

  try {
    const empresa = await prisma.empresa.findUnique({ where: { id: user.empresaId } });
    await enviarBienvenida({ nombre: user.nombre, email: user.email, empresa: empresa?.nombre });

    // Notificar al RRHH de la empresa
    if (empresa?.emailRRHH) {
      const colaborador = await prisma.colaborador.findUnique({ where: { id: user.colaboradorId } });
      await enviarNotificacionNuevoColaborador({
        empresaEmail: empresa.emailRRHH,
        empresaNombre: empresa.nombre,
        colaboradorNombre: user.nombre,
        colaboradorEmail: user.email,
        cargo: colaborador?.cargo,
      });
    }
  } catch (e) {
    console.error('Error enviando emails de verificación:', e);
  }

  res.json({ message: '¡Email verificado! Ya puedes iniciar sesión.', verificado: true });
});


// POST /api/auth/cambiar-password-forzado — solo para usuarios con debeCambiarPassword=true
router.post('/cambiar-password-forzado', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No autenticado' });

  let decoded;
  try { decoded = jwt.verify(token, JWT_SECRET); }
  catch { return res.status(403).json({ error: 'Token inválido' }); }

  const { passwordNueva } = req.body;
  if (!passwordNueva || passwordNueva.length < 6)
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (!user.debeCambiarPassword)
    return res.status(403).json({ error: 'No se requiere cambio de contraseña' });

  const hash = await bcrypt.hash(passwordNueva, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hash, debeCambiarPassword: false },
  });

  res.json({ message: 'Contraseña actualizada exitosamente' });
});

module.exports = router;
