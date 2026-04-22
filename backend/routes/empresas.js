const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/empresas
router.get('/', authMiddleware, async (req, res) => {
  const empresas = await prisma.empresa.findMany({ orderBy: { nombre: 'asc' } });
  res.json(empresas);
});

// GET /api/empresas/:id
router.get('/:id', authMiddleware, async (req, res) => {
  const empresa = await prisma.empresa.findUnique({ where: { id: req.params.id } });
  if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
  res.json(empresa);
});

// POST /api/empresas
router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const { usuarioNombre, usuarioEmail, usuarioPassword, ...empresaData } = req.body;

  if (usuarioEmail) {
    const existe = await prisma.user.findUnique({ where: { email: usuarioEmail } });
    if (existe) return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
  }

  const empresa = await prisma.empresa.create({ data: empresaData });

  if (usuarioNombre && usuarioEmail && usuarioPassword) {
    const hash = await bcrypt.hash(usuarioPassword, 10);
    const avatar = usuarioNombre.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase();
    await prisma.user.create({
      data: {
        nombre: usuarioNombre,
        email: usuarioEmail,
        password: hash,
        rol: 'empresa',
        avatar,
        empresaId: empresa.id,
        emailVerificado: true,
      },
    });
  }

  res.status(201).json(empresa);
});

// PUT /api/empresas/:id
router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const { usuarioNombre, usuarioEmail, usuarioPassword, ...empresaData } = req.body;
  const empresa = await prisma.empresa.update({
    where: { id: req.params.id },
    data: empresaData,
  });
  res.json(empresa);
});

// POST /api/empresas/:id/dominios
router.post('/:id/dominios', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const { dominios } = req.body;
  if (!Array.isArray(dominios)) return res.status(400).json({ error: 'dominios debe ser un array' });
  const empresa = await prisma.empresa.update({
    where: { id: req.params.id },
    data: { dominiosPermitidos: dominios.map(d => d.toLowerCase().trim()).filter(Boolean) },
  });
  res.json(empresa);
});

module.exports = router;
