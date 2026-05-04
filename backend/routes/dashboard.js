const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

// Admin dashboard
router.get('/admin', authMiddleware, async (req, res) => {
  const [empresas, colaboradores, eventos, totalTransacciones, ventasPorMes] = await Promise.all([
    prisma.empresa.findMany(),
    prisma.colaborador.findMany(),
    prisma.evento.findMany({ include: { empresa: true } }),
    prisma.compra.count({ where: { estado: 'completada' } }),
    prisma.$queryRaw`
      SELECT
        EXTRACT(MONTH FROM fecha)::int AS mes_num,
        SUM(monto) AS ventas
      FROM "Compra"
      WHERE estado = 'completada'
        AND fecha >= NOW() - INTERVAL '12 months'
      GROUP BY mes_num
      ORDER BY mes_num
    `,
  ]);

  const totalVentas = empresas.reduce((s, e) => s + e.comprasTotales, 0);

  const ventasMensuales = ventasPorMes.map(r => ({
    mes: MESES[Number(r.mes_num) - 1],
    ventas: Number(r.ventas),
  }));

  res.json({
    resumen: {
      totalEmpresas: empresas.length,
      empresasActivas: empresas.filter(e => e.estado === 'activo').length,
      totalColaboradores: colaboradores.length,
      totalEventos: eventos.length,
      eventosActivos: eventos.filter(e => e.estado === 'activo').length,
      ventasTotalesPlataforma: totalVentas,
      transaccionesTotales: totalTransacciones,
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
    ventasMensuales,
  });
});

// Empresa dashboard
router.get('/empresa/:id', authMiddleware, async (req, res) => {
  const empresa = await prisma.empresa.findUnique({ where: { id: req.params.id } });
  if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

  const [colaboradoresE, eventosE, participacionPorMes] = await Promise.all([
    prisma.colaborador.findMany({ where: { empresaId: empresa.id }, include: { compras: true } }),
    prisma.evento.findMany({ where: { empresaId: empresa.id }, include: { empresa: true } }),
    prisma.$queryRaw`
      SELECT
        EXTRACT(MONTH FROM c.fecha)::int AS mes_num,
        COUNT(DISTINCT c."colaboradorId")::int AS participacion
      FROM "Compra" c
      JOIN "Colaborador" col ON col.id = c."colaboradorId"
      WHERE col."empresaId" = ${empresa.id}
        AND c.estado = 'completada'
        AND c.fecha >= NOW() - INTERVAL '12 months'
      GROUP BY mes_num
      ORDER BY mes_num
    `,
  ]);

  const participacionMensual = participacionPorMes.map(r => ({
    mes: MESES[Number(r.mes_num) - 1],
    participacion: Number(r.participacion),
  }));

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
    participacionMensual,
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
