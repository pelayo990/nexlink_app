const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res) => {
  const { rol, empresaId } = req.user;
  const where = rol === 'empresa' ? { empresaId } : {};
  const colaboradores = await prisma.colaborador.findMany({
    where,
    include: { compras: true },
    orderBy: { nombre: 'asc' },
  });
  res.json(colaboradores);
});

router.get('/:id', authMiddleware, async (req, res) => {
  const colaborador = await prisma.colaborador.findUnique({
    where: { id: req.params.id },
    include: { compras: { include: { producto: true, evento: true } } },
  });
  if (!colaborador) return res.status(404).json({ error: 'Colaborador no encontrado' });
  res.json(colaborador);
});

module.exports = router;

// PUT /api/colaboradores/:id
router.put('/:id', authMiddleware, async (req, res) => {
  const { empresaId, ...rest } = req.body;
  const colaborador = await prisma.colaborador.update({
    where: { id: req.params.id },
    data: rest,
  });
  res.json(colaborador);
});

// DELETE /api/colaboradores/:id
router.delete('/:id', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  await prisma.compra.deleteMany({ where: { colaboradorId: req.params.id } });
  await prisma.user.deleteMany({ where: { colaboradorId: req.params.id } });
  await prisma.colaborador.delete({ where: { id: req.params.id } });
  res.json({ message: 'Colaborador eliminado' });
});
