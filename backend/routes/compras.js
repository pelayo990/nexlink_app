const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

router.post('/', authMiddleware, roleMiddleware('colaborador'), async (req, res) => {
  const { productoId, eventoId } = req.body;
  const { colaboradorId } = req.user;

  const producto = await prisma.producto.findUnique({ where: { id: productoId } });
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  if (producto.stock <= 0) return res.status(400).json({ error: 'Sin stock disponible' });

  const compra = await prisma.$transaction(async (tx) => {
    const nuevaCompra = await tx.compra.create({
      data: { colaboradorId, productoId, eventoId: eventoId || null, monto: producto.precioEvento, estado: 'completada' },
      include: { producto: true, evento: true },
    });
    await tx.producto.update({ where: { id: productoId }, data: { stock: { decrement: 1 } } });
    await tx.colaborador.update({ where: { id: colaboradorId }, data: { puntos: { increment: Math.floor(producto.precioEvento / 1000) } } });
    return nuevaCompra;
  });

  res.status(201).json(compra);
});

router.get('/mis-compras', authMiddleware, roleMiddleware('colaborador'), async (req, res) => {
  const compras = await prisma.compra.findMany({
    where: { colaboradorId: req.user.colaboradorId },
    include: { producto: { include: { marca: true } }, evento: true },
    orderBy: { fecha: 'desc' },
  });
  res.json(compras);
});

module.exports = router;
