const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const prisma = new PrismaClient();
const PAGE_SIZE = 20;

router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { rol, empresaId: userEmpresaId } = req.user;
  const { eventoId, categoria, search, page = 1, limit = PAGE_SIZE, all,
          empresaId: filtroEmpresaId, precioMin, precioMax, descuentoMin } = req.query;
  const where = {};

  if (rol === 'empresa') {
    where.empresaId = userEmpresaId;
  }

  if (rol === 'colaborador') {
    const eventosInvitados = await prisma.eventoEmpresa.findMany({
      where: { empresaId: userEmpresaId },
      select: { eventoId: true },
    });
    const eventosIds = eventosInvitados.map(e => e.eventoId);
    if (eventosIds.length === 0) return res.json({ productos: [], total: 0, page: 1, totalPages: 0 });
    if (!eventoId) where.eventoId = { in: eventosIds };
  }

  if (eventoId) where.eventoId = eventoId;
  if (categoria) where.categoria = categoria;
  if (search) where.nombre = { contains: search, mode: 'insensitive' };
  if (filtroEmpresaId) where.empresaId = filtroEmpresaId;
  if (precioMin || precioMax) {
    where.precioEvento = {};
    if (precioMin) where.precioEvento.gte = parseFloat(precioMin);
    if (precioMax) where.precioEvento.lte = parseFloat(precioMax);
  }
  if (descuentoMin) where.descuento = { gte: parseFloat(descuentoMin) };

  if (all === 'true') {
    const productos = await prisma.producto.findMany({
      where,
      include: { empresa: true },
      orderBy: { nombre: 'asc' },
    });
    return res.json({ productos, total: productos.length, page: 1, totalPages: 1 });
  }

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: { empresa: true },
      orderBy: { nombre: 'asc' },
      skip,
      take: limitNum,
    }),
    prisma.producto.count({ where }),
  ]);

  res.json({ productos, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
}));

router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const producto = await prisma.producto.findUnique({
    where: { id: req.params.id },
    include: { empresa: true },
  });
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(producto);
}));

router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const producto = await prisma.producto.create({
    data: { ...req.body, empresaId: req.user.empresaId },
    include: { empresa: true },
  });
  res.status(201).json(producto);
}));

router.put('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { empresaId, empresa, id, ...rest } = req.body;
  const producto = await prisma.producto.update({
    where: { id: req.params.id },
    data: rest,
    include: { empresa: true },
  });
  res.json(producto);
}));

module.exports = router;
