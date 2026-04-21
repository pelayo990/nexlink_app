const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  const empresas = await prisma.empresa.findMany({ orderBy: { nombre: 'asc' } });
  res.json(empresas);
});

router.get('/:id', authMiddleware, async (req, res) => {
  const empresa = await prisma.empresa.findUnique({ where: { id: req.params.id } });
  if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
  res.json(empresa);
});

router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const empresa = await prisma.empresa.create({ data: req.body });
  res.status(201).json(empresa);
});

router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const empresa = await prisma.empresa.update({ where: { id: req.params.id }, data: req.body });
  res.json(empresa);
});

module.exports = router;

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
