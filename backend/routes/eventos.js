const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  const { rol, empresaId } = req.user;

  const where = {};
  if (rol === 'empresa') where.empresaId = empresaId;
  if (rol === 'colaborador') {
    where.empresas = { some: { empresaId } };
  }

  const eventos = await prisma.evento.findMany({
    where,
    include: {
      empresa: true,
      _count: { select: { productos: true } },
    },
    orderBy: { fechaInicio: 'desc' },
  });

  const enriched = eventos.map(ev => ({
    ...ev,
    marca: ev.empresa,
    totalProductos: ev._count.productos,
    _count: undefined,
  }));

  res.json(enriched);
});

router.get('/:id', authMiddleware, async (req, res) => {
  const evento = await prisma.evento.findUnique({
    where: { id: req.params.id },
    include: {
      empresa: true,
      productos: { include: { empresa: true } },
      empresas: { include: { empresa: true } },
    },
  });
  if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });
  res.json({ ...evento, marca: evento.empresa });
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { empresasInvitadas, marca, empresa, _count, totalProductos, ...rest } = req.body;

    // Solo campos válidos del schema
    const data = {
      nombre: rest.nombre,
      descripcion: rest.descripcion || null,
      banner: rest.banner || null,
      fechaInicio: rest.fechaInicio ? new Date(rest.fechaInicio) : undefined,
      fechaFin: rest.fechaFin ? new Date(rest.fechaFin) : undefined,
      estado: rest.estado || 'proximo',
      destacado: rest.destacado || false,
      tipo: rest.tipo || 'flash',
      maxComprasPorColaborador: parseInt(rest.maxComprasPorColaborador) || 2,
      empresaId: req.user.empresaId || rest.empresaId,
    };

    if (empresasInvitadas?.length) {
      data.empresas = { create: empresasInvitadas.map(id => ({ empresaId: id })) };
    }

    const evento = await prisma.evento.create({
      data,
      include: { empresa: true },
    });
    res.json({ ...evento, marca: evento.empresa });
  } catch (e) {
    console.error('Error creando evento:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const { empresasInvitadas, empresaId, marca, ...rest } = req.body;
  const evento = await prisma.evento.update({
    where: { id: req.params.id },
    data: rest,
    include: { empresa: true },
  });
  res.json({ ...evento, marca: evento.empresa });
});

module.exports = router;

// DELETE /api/eventos/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  await prisma.compra.deleteMany({ where: { eventoId: req.params.id } });
  await prisma.eventoEmpresa.deleteMany({ where: { eventoId: req.params.id } });
  await prisma.evento.delete({ where: { id: req.params.id } });
  res.json({ message: 'Evento eliminado' });
});
