const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  const { rol, marcaId } = req.user;
  const { eventoId, categoria } = req.query;

  const where = {};
  if (rol === 'marca') where.marcaId = marcaId;
  if (eventoId) where.eventoId = eventoId;
  if (categoria) where.categoria = categoria;

  const productos = await prisma.producto.findMany({
    where,
    include: { marca: true },
    orderBy: { nombre: 'asc' },
  });
  res.json(productos);
});

router.get('/:id', authMiddleware, async (req, res) => {
  const producto = await prisma.producto.findUnique({
    where: { id: req.params.id },
    include: { marca: true },
  });
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
});

router.post('/', authMiddleware, async (req, res) => {
  const producto = await prisma.producto.create({
    data: { ...req.body, marcaId: req.user.marcaId },
    include: { marca: true },
  });
  res.status(201).json(producto);
});

router.put('/:id', authMiddleware, async (req, res) => {
  const producto = await prisma.producto.update({
    where: { id: req.params.id },
    data: req.body,
    include: { marca: true },
  });
  res.json(producto);
});

module.exports = router;
