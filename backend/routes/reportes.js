const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const prisma = new PrismaClient();

// GET /api/reportes/resumen
router.get('/resumen', authMiddleware, roleMiddleware('admin'), asyncHandler(async (req, res) => {
  const [
    totalMarcas, totalEmpresas, totalColaboradores, totalEventos,
    totalProductos, totalCompras, comprasMonto,
    eventosPorEstado, topMarcas, topEmpresas, topProductos,
    comprasPorMes,
  ] = await Promise.all([
    prisma.marca.count(),
    prisma.empresa.count(),
    prisma.colaborador.count(),
    prisma.evento.count(),
    prisma.producto.count(),
    prisma.compra.count({ where: { estado: 'completada' } }),
    prisma.compra.aggregate({ where: { estado: 'completada' }, _sum: { monto: true } }),
    prisma.evento.groupBy({ by: ['estado'], _count: true }),
    prisma.marca.findMany({ orderBy: { ventasTotales: 'desc' }, take: 5 }),
    prisma.empresa.findMany({ orderBy: { comprasTotales: 'desc' }, take: 5 }),
    prisma.compra.groupBy({
      by: ['productoId'],
      where: { estado: 'completada' },
      _count: true,
      _sum: { monto: true },
      orderBy: { _count: { productoId: 'desc' } },
      take: 5,
    }),
    prisma.compra.findMany({
      where: { estado: 'completada' },
      select: { fecha: true, monto: true },
      orderBy: { fecha: 'asc' },
    }),
  ]);

  // Agrupar compras por mes
  const ventasMensuales = {};
  comprasPorMes.forEach(c => {
    const mes = new Date(c.fecha).toLocaleDateString('es-CL', { month: 'short', year: '2-digit' });
    if (!ventasMensuales[mes]) ventasMensuales[mes] = 0;
    ventasMensuales[mes] += c.monto;
  });

  // Enriquecer top productos con nombres
  const productIds = topProductos.map(p => p.productoId);
  const productosInfo = await prisma.producto.findMany({
    where: { id: { in: productIds } },
    include: { marca: true },
  });
  const topProductosEnriquecidos = topProductos.map(tp => {
    const info = productosInfo.find(p => p.id === tp.productoId);
    return { ...tp, nombre: info?.nombre, marca: info?.marca?.nombre, categoria: info?.categoria };
  });

  res.json({
    kpis: {
      totalMarcas,
      totalEmpresas,
      totalColaboradores,
      totalEventos,
      totalProductos,
      totalCompras,
      montoTotal: comprasMonto._sum.monto || 0,
    },
    eventosPorEstado: Object.fromEntries(eventosPorEstado.map(e => [e.estado, e._count])),
    topMarcas: topMarcas.map(m => ({ id: m.id, nombre: m.nombre, categoria: m.categoria, ventas: m.ventasTotales, colaboradoresAlcanzados: m.colaboradoresAlcanzados })),
    topEmpresas: topEmpresas.map(e => ({ id: e.id, nombre: e.nombre, industria: e.industria, compras: e.comprasTotales, satisfaccion: e.satisfaccion })),
    topProductos: topProductosEnriquecidos,
    ventasMensuales: Object.entries(ventasMensuales).map(([mes, ventas]) => ({ mes, ventas })),
  });
}));

module.exports = router;

// GET /api/reportes/empresa/:id
router.get('/empresa/:id', authMiddleware, asyncHandler(async (req, res) => {
  const empresaId = req.params.id;

  const [
    totalColaboradores,
    totalProductos,
    totalEventos,
    compras,
    topProductos,
    colaboradoresConPuntos,
  ] = await Promise.all([
    prisma.colaborador.count({ where: { empresaId } }),
    prisma.producto.count({ where: { empresaId } }),
    prisma.evento.count({ where: { empresaId } }),
    prisma.compra.findMany({
      where: {
        estado: 'completada',
        colaborador: { empresaId },
      },
      include: { producto: true },
      orderBy: { fecha: 'asc' },
    }),
    prisma.compra.groupBy({
      by: ['productoId'],
      where: { estado: 'completada', colaborador: { empresaId } },
      _count: true,
      _sum: { monto: true },
      orderBy: { _count: { productoId: 'desc' } },
      take: 5,
    }),
    prisma.colaborador.findMany({
      where: { empresaId },
      orderBy: { puntos: 'desc' },
      take: 5,
    }),
  ]);

  const montoTotal = compras.reduce((s, c) => s + c.monto, 0);
  const ahorroTotal = montoTotal * 0.35;

  // Agrupar compras por mes
  const ventasMensuales = {};
  compras.forEach(c => {
    const mes = new Date(c.fecha).toLocaleDateString('es-CL', { month: 'short', year: '2-digit' });
    if (!ventasMensuales[mes]) ventasMensuales[mes] = 0;
    ventasMensuales[mes] += c.monto;
  });

  // Enriquecer top productos
  const productosIds = topProductos.map(p => p.productoId);
  const productosInfo = await prisma.producto.findMany({
    where: { id: { in: productosIds } },
  });

  const topProductosEnriquecidos = topProductos.map(tp => {
    const info = productosInfo.find(p => p.id === tp.productoId);
    return { ...tp, nombre: info?.nombre, categoria: info?.categoria };
  });

  res.json({
    kpis: {
      totalColaboradores,
      totalProductos,
      totalEventos,
      totalCompras: compras.length,
      montoTotal,
      ahorroTotal,
      ticketPromedio: compras.length > 0 ? Math.round(montoTotal / compras.length) : 0,
    },
    topProductos: topProductosEnriquecidos,
    topColaboradores: colaboradoresConPuntos,
    ventasMensuales: Object.entries(ventasMensuales).map(([mes, monto]) => ({ mes, monto })),
  });
}));
