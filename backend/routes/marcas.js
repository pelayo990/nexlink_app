const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  const marcas = await prisma.marca.findMany({ orderBy: { nombre: 'asc' } });
  res.json(marcas);
});

router.get('/:id', authMiddleware, async (req, res) => {
  const marca = await prisma.marca.findUnique({ where: { id: req.params.id } });
  if (!marca) return res.status(404).json({ error: 'Marca no encontrada' });
  res.json(marca);
});

router.post('/', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const marca = await prisma.marca.create({ data: req.body });
  res.status(201).json(marca);
});

router.put('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  const marca = await prisma.marca.update({ where: { id: req.params.id }, data: req.body });
  res.json(marca);
});

module.exports = router;
