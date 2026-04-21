const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

// Admin dashboard
router.get('/admin', authMiddleware, async (req, res) => {
  const [empresas, colaboradores, eventos] = await Promise.all([
    prisma.empresa.findMany(),
    prisma.colaborador.findMany(),
    prisma.evento.findMany({ include: { empresa: true } }),
  ]);

  const totalVentas = empresas.reduce((s, e) => s + e.comprasTotales, 0);
  const totalCompras = empresas.reduce((s, e) => s + e.comprasTotales, 0);

  res.json({
    resumen: {
      totalEmpresas: empresas.length,
      empresasActivas: empresas.filter(e => e.estado === 'activo').length,
      totalColaboradores: colaboradores.length,
      totalEventos: eventos.length,
      eventosActivos: eventos.filter(e => e.estado === 'activo').length,
      ventasTotalesPlataforma: totalVentas,
      transaccionesTotales: totalCompras,
    },
    eventosPorEstado: {
      activo: eventos.filter(e => e.estado === 'activo').length,
      proximo: eventos.filter(e => e.estado === 'proximo').length,
      finalizado: eventos.filter(e => e.estado === 'finalizado').length,
    },
    topEmpresas: [...empresas]
      .sort((a, b) => b.comprasTotales - a.comprasTotales)
      .slice(0, 4)
      .map(e => ({ id: e.id, nombre: e.nombre, industria: e.industria, compras: e.comprasTotales, colaboradores: e.colaboradoresActivos })),
    eventosRecientes: eventos.slice(0, 4),
    ventasMensuales: [
      { mes: 'Ene', ventas: 8200000 }, { mes: 'Feb', ventas: 12400000 },
      { mes: 'Mar', ventas: 18900000 }, { mes: 'Abr', ventas: 22100000 },
      { mes: 'May', ventas: 19800000 }, { mes: 'Jun', ventas: 28400000 },
      { mes: 'Jul', ventas: 31200000 }, { mes: 'Ago', ventas: 35800000 },
      { mes: 'Sep', ventas: 42100000 },
    ],
  });
});

// Empresa dashboard
router.get('/empresa/:id', authMiddleware, async (req, res) => {
  const empresa = await prisma.empresa.findUnique({ where: { id: req.params.id } });
  if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

  const [colaboradoresE, eventosE] = await Promise.all([
    prisma.colaborador.findMany({ where: { empresaId: empresa.id }, include: { compras: true } }),
    prisma.evento.findMany({
      where: { empresaId: empresa.id },
      include: { empresa: true },
    }),
  ]);

  res.json({
    empresa,
    stats: {
      totalColaboradores: empresa.totalColaboradores,
      colaboradoresActivos: empresa.colaboradoresActivos,
      eventosDisponibles: eventosE.filter(e => e.estado === 'activo').length,
      ahorroTotal: empresa.ahorroColaboradores,
      satisfaccion: empresa.satisfaccion,
    },
    eventosActivos: eventosE.filter(e => e.estado === 'activo').map(e => ({ ...e, marca: e.empresa })),
    eventosProximos: eventosE.filter(e => e.estado === 'proximo').map(e => ({ ...e, marca: e.empresa })),
    colaboradores: colaboradoresE,
    topColaboradores: [...colaboradoresE].sort((a, b) => b.puntos - a.puntos).slice(0, 5),
    participacionMensual: [
      { mes: 'Ene', participacion: 12 }, { mes: 'Feb', participacion: 18 },
      { mes: 'Mar', participacion: 24 }, { mes: 'Abr', participacion: 31 },
      { mes: 'May', participacion: 28 }, { mes: 'Jun', participacion: 42 },
      { mes: 'Jul', participacion: 55 }, { mes: 'Ago', participacion: 61 },
      { mes: 'Sep', participacion: 73 },
    ],
  });
});

// Colaborador dashboard
router.get('/colaborador/:id', authMiddleware, async (req, res) => {
  const colaborador = await prisma.colaborador.findUnique({
    where: { id: req.params.id },
    include: { compras: { include: { producto: true, evento: true } } },
  });
  if (!colaborador) return res.status(404).json({ error: 'Colaborador no encontrado' });

  const [empresa, eventosDisp] = await Promise.all([
    prisma.empresa.findUnique({ where: { id: colaborador.empresaId } }),
    prisma.evento.findMany({
      where: { empresas: { some: { empresaId: colaborador.empresaId } }, estado: 'activo' },
      include: { empresa: true },
    }),
  ]);

  res.json({
    colaborador,
    empresa,
    stats: {
      puntos: colaborador.puntos,
      comprasTotales: colaborador.compras.length,
      montoAhorrado: colaborador.compras.reduce((s, c) => s + (c.monto * 0.35), 0),
      eventosDisponibles: eventosDisp.length,
    },
    eventosDisponibles: eventosDisp.map(e => ({ ...e, marca: e.empresa })),
    historialCompras: colaborador.compras,
  });
});

module.exports = router;
