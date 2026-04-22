const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  const { rol, empresaId } = req.user;
  const { eventoId, categoria } = req.query;

  const where = {};
  if (rol === 'empresa') where.empresaId = empresaId;

  // Colaborador solo ve productos de eventos a los que su empresa está invitada
  if (rol === 'colaborador') {
    const eventosInvitados = await prisma.eventoEmpresa.findMany({
      where: { empresaId },
      select: { eventoId: true },
    });
    const eventosIds = eventosInvitados.map(e => e.eventoId);
    where.eventoId = { in: eventosIds };
  }

  if (eventoId) where.eventoId = eventoId;
  if (categoria) where.categoria = categoria;

  const productos = await prisma.producto.findMany({
    where,
    include: { empresa: true },
    orderBy: { nombre: 'asc' },
  });
  res.json(productos);
});

router.get('/:id', authMiddleware, async (req, res) => {
  const producto = await prisma.producto.findUnique({
    where: { id: req.params.id },
    include: { empresa: true },
  });
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
});

router.post('/', authMiddleware, async (req, res) => {
  const producto = await prisma.producto.create({
    data: { ...req.body, empresaId: req.user.empresaId },
    include: { empresa: true },
  });
  res.status(201).json(producto);
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { empresaId, ...rest } = req.body;
  const producto = await prisma.producto.update({
    where: { id: req.params.id },
    data: rest,
    include: { empresa: true },
  });
  res.json(producto);
});

module.exports = router;
