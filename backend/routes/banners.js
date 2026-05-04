const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const prisma = new PrismaClient();

// GET /api/banners — público para todos los roles
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const banners = await prisma.banner.findMany({
    where: { activo: true },
    orderBy: { orden: 'asc' },
  });
  res.json(banners);
}));

// GET /api/banners/todos — admin ve todos incluso inactivos
router.get('/todos', authMiddleware, roleMiddleware('admin'), asyncHandler(async (req, res) => {
  const banners = await prisma.banner.findMany({ orderBy: { orden: 'asc' } });
  res.json(banners);
}));

// POST /api/banners
router.post('/', authMiddleware, roleMiddleware('admin'), asyncHandler(async (req, res) => {
  const banner = await prisma.banner.create({ data: req.body });
  res.status(201).json(banner);
}));

// PUT /api/banners/:id
router.put('/:id', authMiddleware, roleMiddleware('admin'), asyncHandler(async (req, res) => {
  const banner = await prisma.banner.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(banner);
}));

// DELETE /api/banners/:id
router.delete('/:id', authMiddleware, roleMiddleware('admin'), asyncHandler(async (req, res) => {
  await prisma.banner.delete({ where: { id: req.params.id } });
  res.json({ message: 'Banner eliminado' });
}));

module.exports = router;
