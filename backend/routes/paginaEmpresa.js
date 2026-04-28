const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

// GET /api/pagina-empresa/:empresaId
router.get('/:empresaId', authMiddleware, async (req, res) => {
  const { empresaId } = req.params;

  let pagina = await prisma.paginaEmpresa.findUnique({ where: { empresaId } });

  // Si no existe, crear una por defecto
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
});

// PUT /api/pagina-empresa/:empresaId
router.put('/:empresaId', authMiddleware, async (req, res) => {
  const { empresaId } = req.params;

  const pagina = await prisma.paginaEmpresa.upsert({
    where: { empresaId },
    update: req.body,
    create: { empresaId, ...req.body },
  });

  res.json(pagina);
});

module.exports = router;
