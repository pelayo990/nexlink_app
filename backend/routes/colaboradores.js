const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/colaboradores
router.get('/', authMiddleware, async (req, res) => {
  const { rol, empresaId } = req.user;
  const where = rol === 'empresa' ? { empresaId } : {};
  const colaboradores = await prisma.colaborador.findMany({
    where,
    include: { compras: true, empresa: true },
    orderBy: { nombre: 'asc' },
  });
  res.json(colaboradores);
});

// GET /api/colaboradores/:id
router.get('/:id', authMiddleware, async (req, res) => {
  const colaborador = await prisma.colaborador.findUnique({
    where: { id: req.params.id },
    include: { compras: { include: { producto: true, evento: true } }, empresa: true },
  });
  if (!colaborador) return res.status(404).json({ error: 'Colaborador no encontrado' });
  res.json(colaborador);
});

// POST /api/colaboradores
router.post('/', authMiddleware, async (req, res) => {
  const { empresaId, nombre, email, cargo, area, rut, telefono, estado, passwordProvisoria } = req.body;
  if (!nombre || !email || !empresaId)
    return res.status(400).json({ error: 'Nombre, email y empresa son obligatorios' });
  if (!passwordProvisoria || passwordProvisoria.length < 6)
    return res.status(400).json({ error: 'La contraseña provisoria debe tener al menos 6 caracteres' });

  const existeColab = await prisma.colaborador.findUnique({ where: { email } });
  if (existeColab) return res.status(409).json({ error: 'Ya existe un colaborador con ese email' });

  const existeUser = await prisma.user.findUnique({ where: { email } });
  if (existeUser) return res.status(409).json({ error: 'Ya existe un usuario con ese email' });

  const colaborador = await prisma.colaborador.create({
    data: { empresaId, nombre, email, cargo: cargo || null, area: area || null, rut: rut || null, telefono: telefono || null, estado: estado || 'activo', puntos: 0 },
  });

  // Crear usuario con contraseña provisoria y email verificado
  const hash = await bcrypt.hash(passwordProvisoria, 10);
  const avatar = nombre.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase();
  await prisma.user.create({
    data: {
      nombre, email, password: hash, rol: 'colaborador', avatar,
      empresaId, colaboradorId: colaborador.id,
      emailVerificado: true,
      debeCambiarPassword: true,
    },
  });

  res.status(201).json({ ...colaborador, passwordProvisoria });
});

// PUT /api/colaboradores/:id
router.put('/:id', authMiddleware, async (req, res) => {
  // Extraer solo campos editables — excluir relaciones y campos no actualizables
  const { empresaId, compras, empresa, id, ...rest } = req.body;
  const colaborador = await prisma.colaborador.update({
    where: { id: req.params.id },
    data: rest,
  });
  res.json(colaborador);
});

// DELETE /api/colaboradores/:id
router.delete('/:id', authMiddleware, roleMiddleware('admin', 'empresa'), async (req, res) => {
  await prisma.compra.deleteMany({ where: { colaboradorId: req.params.id } });
  await prisma.user.deleteMany({ where: { colaboradorId: req.params.id } });
  await prisma.colaborador.delete({ where: { id: req.params.id } });
  res.json({ message: 'Colaborador eliminado' });
});

module.exports = router;
