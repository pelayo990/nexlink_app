const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const prisma = new PrismaClient();

// GET /api/colaboradores
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const { rol, empresaId } = req.user;
  const where = rol === 'empresa' ? { empresaId } : {};
  const colaboradores = await prisma.colaborador.findMany({
    where,
    include: { compras: true, empresa: true },
    orderBy: { nombre: 'asc' },
  });
  res.json(colaboradores);
}));

// GET /api/colaboradores/exportar
router.get('/exportar', authMiddleware, asyncHandler(async (req, res) => {
  const ExcelJS = require('exceljs');
  const { rol, empresaId } = req.user;
  const where = rol === 'empresa' ? { empresaId } : {};

  const colaboradores = await prisma.colaborador.findMany({
    where,
    include: { empresa: true, compras: true },
    orderBy: { nombre: 'asc' },
  });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Colaboradores');

  sheet.columns = [
    { header: 'Nombre', key: 'nombre', width: 25 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Empresa', key: 'empresa', width: 20 },
    { header: 'Cargo', key: 'cargo', width: 20 },
    { header: 'Área', key: 'area', width: 15 },
    { header: 'RUT', key: 'rut', width: 15 },
    { header: 'Teléfono', key: 'telefono', width: 15 },
    { header: 'Estado', key: 'estado', width: 10 },
    { header: 'Puntos', key: 'puntos', width: 10 },
    { header: 'Compras', key: 'compras', width: 10 },
    { header: 'Fecha Ingreso', key: 'fechaIngreso', width: 15 },
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } };

  colaboradores.forEach(c => {
    sheet.addRow({
      nombre: c.nombre,
      email: c.email,
      empresa: c.empresa?.nombre || '—',
      cargo: c.cargo || '—',
      area: c.area || '—',
      rut: c.rut || '—',
      telefono: c.telefono || '—',
      estado: c.estado,
      puntos: c.puntos,
      compras: c.compras.length,
      fechaIngreso: new Date(c.fechaIngreso).toLocaleDateString('es-CL'),
    });
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=colaboradores.xlsx');
  await workbook.xlsx.write(res);
  res.end();
}));

// GET /api/colaboradores/:id
router.get('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const colaborador = await prisma.colaborador.findUnique({
    where: { id: req.params.id },
    include: { compras: { include: { producto: true, evento: true } }, empresa: true },
  });
  if (!colaborador) return res.status(404).json({ error: 'Colaborador no encontrado' });
  res.json(colaborador);
}));

// POST /api/colaboradores
router.post('/', authMiddleware, asyncHandler(async (req, res) => {
  const { empresaId, nombre, email, cargo, area, rut, telefono, estado, passwordProvisoria } = req.body;

  if (!nombre || !email || !empresaId)
    return res.status(400).json({ error: 'Nombre, email y empresa son obligatorios' });
  if (!passwordProvisoria || passwordProvisoria.length < 6)
    return res.status(400).json({ error: 'La contraseña provisoria debe tener al menos 6 caracteres' });

  const existeColab = await prisma.colaborador.findUnique({ where: { email } });
  if (existeColab) return res.status(409).json({ error: 'Ya existe un colaborador con ese email' });

  const existeUser = await prisma.user.findUnique({ where: { email } });
  if (existeUser) return res.status(409).json({ error: 'Ya existe un usuario con ese email' });

  const dominio = email.split('@')[1];
  const empresa = await prisma.empresa.findUnique({ where: { id: empresaId } });
  if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
  if (empresa.dominiosPermitidos.length > 0 && !empresa.dominiosPermitidos.includes(dominio)) {
    return res.status(400).json({
      error: `El dominio @${dominio} no está permitido para ${empresa.nombre}. Dominios válidos: ${empresa.dominiosPermitidos.map(d => '@' + d).join(', ')}`,
    });
  }

  const colaborador = await prisma.colaborador.create({
    data: { empresaId, nombre, email, cargo: cargo || null, area: area || null, rut: rut || null, telefono: telefono || null, estado: estado || 'activo', puntos: 0 },
  });

  const hash = await bcrypt.hash(passwordProvisoria, 10);
  const avatar = nombre.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase();
  await prisma.user.create({
    data: {
      nombre, email, password: hash, rol: 'colaborador', avatar,
      empresaId, colaboradorId: colaborador.id,
      emailVerificado: true,
      debeCambiarPassword: true,
    },
  });

  res.status(201).json({ ...colaborador, passwordProvisoria });
}));

// PUT /api/colaboradores/:id
router.put('/:id', authMiddleware, asyncHandler(async (req, res) => {
  const { empresaId, compras, empresa, id, ...rest } = req.body;
  const colaborador = await prisma.colaborador.update({
    where: { id: req.params.id },
    data: rest,
  });
  res.json(colaborador);
}));

// DELETE /api/colaboradores/:id
router.delete('/:id', authMiddleware, roleMiddleware('admin', 'empresa'), asyncHandler(async (req, res) => {
  await prisma.compra.deleteMany({ where: { colaboradorId: req.params.id } });
  await prisma.user.deleteMany({ where: { colaboradorId: req.params.id } });
  await prisma.colaborador.delete({ where: { id: req.params.id } });
  res.json({ message: 'Colaborador eliminado' });
}));

module.exports = router;
