const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

// POST /api/compras
router.post('/', authMiddleware, roleMiddleware('colaborador'), async (req, res) => {
  const { productoId, eventoId } = req.body;
  const { colaboradorId } = req.user;

  const producto = await prisma.producto.findUnique({ where: { id: productoId } });
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  if (producto.stock <= 0) return res.status(400).json({ error: 'Sin stock disponible' });

  // Validar límite de compras por evento
  if (eventoId) {
    const evento = await prisma.evento.findUnique({ where: { id: eventoId } });
    if (evento) {
      const comprasEnEvento = await prisma.compra.count({
        where: { colaboradorId, eventoId, estado: { not: 'cancelada' } },
      });
      if (comprasEnEvento >= evento.maxComprasPorColaborador) {
        return res.status(400).json({
          error: `Límite alcanzado: máximo ${evento.maxComprasPorColaborador} compras por colaborador en este evento`,
        });
      }
    }
  }

  // Validar que no compró el mismo producto antes
  const yaCompro = await prisma.compra.findFirst({
    where: { colaboradorId, productoId, estado: { not: 'cancelada' } },
  });
  if (yaCompro) return res.status(400).json({ error: 'Ya compraste este producto anteriormente' });

  const compra = await prisma.$transaction(async (tx) => {
    const nuevaCompra = await tx.compra.create({
      data: {
        colaboradorId,
        productoId,
        eventoId: eventoId || null,
        monto: producto.precioEvento,
        estado: 'completada',
      },
      include: { producto: true, evento: true },
    });

    await tx.producto.update({
      where: { id: productoId },
      data: { stock: { decrement: 1 } },
    });

    await tx.colaborador.update({
      where: { id: colaboradorId },
      data: { puntos: { increment: Math.floor(producto.precioEvento / 1000) } },
    });

    return nuevaCompra;
  });

  res.status(201).json(compra);
});

// GET /api/compras/mis-compras
router.get('/mis-compras', authMiddleware, roleMiddleware('colaborador'), async (req, res) => {
  const compras = await prisma.compra.findMany({
    where: { colaboradorId: req.user.colaboradorId },
    include: { producto: { include: { empresa: true } }, evento: true },
    orderBy: { fecha: 'desc' },
  });
  res.json(compras);
});

// GET /api/compras/validar?productoId=x&eventoId=y
router.get('/validar', authMiddleware, roleMiddleware('colaborador'), async (req, res) => {
  const { productoId, eventoId } = req.query;
  const { colaboradorId } = req.user;

  const resultado = { puedeComprar: true, razon: null };

  const producto = await prisma.producto.findUnique({ where: { id: productoId } });
  if (!producto || producto.stock <= 0) {
    return res.json({ puedeComprar: false, razon: 'Sin stock disponible' });
  }

  const yaCompro = await prisma.compra.findFirst({
    where: { colaboradorId, productoId, estado: { not: 'cancelada' } },
  });
  if (yaCompro) {
    return res.json({ puedeComprar: false, razon: 'Ya compraste este producto' });
  }

  if (eventoId) {
    const evento = await prisma.evento.findUnique({ where: { id: eventoId } });
    if (evento) {
      const comprasEnEvento = await prisma.compra.count({
        where: { colaboradorId, eventoId, estado: { not: 'cancelada' } },
      });
      if (comprasEnEvento >= evento.maxComprasPorColaborador) {
        return res.json({
          puedeComprar: false,
          razon: `Límite de ${evento.maxComprasPorColaborador} compras por evento alcanzado`,
        });
      }
    }
  }

  res.json(resultado);
});

module.exports = router;
