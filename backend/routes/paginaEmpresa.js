const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const prisma = new PrismaClient();

// GET /api/pagina-empresa/:empresaId
router.get('/:empresaId', authMiddleware, asyncHandler(async (req, res) => {
  const { empresaId } = req.params;

  let pagina = await prisma.paginaEmpresa.findUnique({ where: { empresaId } });

  if (!pagina) {
    const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
    if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
    pagina = await prisma.paginaEmpresa.create({ data: { empresaId } });
  }

  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
  const productos = await prisma.producto.findMany({
    where: { empresaId },
    include: { empresa: true },
    orderBy: { visitas: 'desc' },
  });
  const eventos = await prisma.evento.findMany({
    where: { empresaId, estado: { in: ['activo', 'proximo'] } },
    include: { empresa: true },
  });

  res.json({ pagina, empresa, productos, eventos });
}));

// PUT /api/pagina-empresa/:empresaId
router.put('/:empresaId', authMiddleware, asyncHandler(async (req, res) => {
  const { empresaId } = req.params;

  // Filtrar solo los campos válidos del schema
  const { banner, logo, descripcion, colorPrimario, colorSecundario, tagline, destacados, activa } = req.body;
  const data = { banner, logo, descripcion, colorPrimario, colorSecundario, tagline, destacados, activa };

  // Eliminar campos undefined
  Object.keys(data).forEach(k => data[k] === undefined && delete data[k]);

  const pagina = await prisma.paginaEmpresa.upsert({
    where: { empresaId },
    update: data,
    create: { empresaId, ...data },
  });

  res.json(pagina);
}));

module.exports = router;
