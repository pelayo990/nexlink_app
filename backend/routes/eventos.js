const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  const { rol, marcaId, empresaId } = req.user;

  const where = {};
  if (rol === 'marca') where.marcaId = marcaId;
  if (rol === 'empresa' || rol === 'colaborador') {
    where.empresas = { some: { empresaId } };
  }

  const eventos = await prisma.evento.findMany({
    where,
    include: { marca: true, _count: { select: { productos: true } } },
    orderBy: { fechaInicio: 'desc' },
  });

  const enriched = eventos.map(ev => ({
    ...ev,
    totalProductos: ev._count.productos,
    _count: undefined,
  }));

  res.json(enriched);
});

router.get('/:id', authMiddleware, async (req, res) => {
  const evento = await prisma.evento.findUnique({
    where: { id: req.params.id },
    include: { marca: true, productos: { include: { marca: true } }, empresas: { include: { empresa: true } } },
  });
  if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
  res.json(evento);
});

router.post('/', authMiddleware, async (req, res) => {
  const { empresasInvitadas, ...rest } = req.body;
  const evento = await prisma.evento.create({
    data: {
      ...rest,
      marcaId: req.user.marcaId || rest.marcaId,
      empresas: empresasInvitadas
        ? { create: empresasInvitadas.map(id => ({ empresaId: id })) }
        : undefined,
    },
    include: { marca: true },
  });
  res.status(201).json(evento);
});

module.exports = router;

// PUT /api/eventos/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const { empresasInvitadas, ...rest } = req.body;
  const evento = await prisma.evento.update({
    where: { id: req.params.id },
    data: rest,
    include: { marca: true },
  });
  res.json(evento);
});
