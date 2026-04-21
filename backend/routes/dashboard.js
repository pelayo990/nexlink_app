const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const prisma = new PrismaClient();

router.get('/admin', authMiddleware, async (req, res) => {
  const [marcas, empresas, colaboradores, eventos] = await Promise.all([
    prisma.marca.findMany(),
    prisma.empresa.findMany(),
    prisma.colaborador.findMany(),
    prisma.evento.findMany({ include: { marca: true } }),
  ]);

  const totalVentas = marcas.reduce((s, m) => s + m.ventasTotales, 0);
  const totalCompras = empresas.reduce((s, e) => s + e.comprasTotales, 0);

  res.json({
    resumen: {
      totalMarcas: marcas.length,
      marcasActivas: marcas.filter(m => m.estado === 'activo').length,
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
    topMarcas: [...marcas].sort((a, b) => b.ventasTotales - a.ventasTotales).slice(0, 4).map(m => ({ id: m.id, nombre: m.nombre, categoria: m.categoria, ventas: m.ventasTotales, eventos: m.totalEventos })),
    topEmpresas: [...empresas].sort((a, b) => b.comprasTotales - a.comprasTotales).slice(0, 4).map(e => ({ id: e.id, nombre: e.nombre, industria: e.industria, compras: e.comprasTotales, colaboradores: e.colaboradoresActivos })),
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

router.get('/marca/:id', authMiddleware, async (req, res) => {
  const marca = await prisma.marca.findUnique({ where: { id: req.params.id } });
  if (!marca) return res.status(404).json({ error: 'Marca no encontrada' });

  const [eventosM, productosM] = await Promise.all([
    prisma.evento.findMany({ where: { marcaId: marca.id } }),
    prisma.producto.findMany({ where: { marcaId: marca.id } }),
  ]);

  res.json({
    marca,
    stats: {
      ventasMes: marca.ventasTotales,
      productosActivos: productosM.filter(p => p.estado === 'activo').length,
      descuentoPromedio: Math.round(productosM.reduce((s, p) => s + p.descuento, 0) / (productosM.length || 1)),
      puntosCanjeados: 5340,
    },
    eventosActivos: eventosM.filter(e => e.estado === 'activo'),
    eventosProximos: eventosM.filter(e => e.estado === 'proximo'),
    eventosPasados: eventosM.filter(e => e.estado === 'finalizado'),
    productos: productosM,
    topProductos: productosM.slice(0, 3),
    ventasMensuales: [
      { mes: 'Ene', ventas: 0 }, { mes: 'Feb', ventas: 2100000 },
      { mes: 'Mar', ventas: 3400000 }, { mes: 'Abr', ventas: 2800000 },
      { mes: 'May', ventas: 4100000 }, { mes: 'Jun', ventas: 3600000 },
      { mes: 'Jul', ventas: 8900000 }, { mes: 'Ago', ventas: 9800000 },
      { mes: 'Sep', ventas: 12540000 },
    ],
    fuentesTrafico: [
      { fuente: 'Directo', porcentaje: 47 },
      { fuente: 'Email', porcentaje: 31 },
      { fuente: 'Social', porcentaje: 22 },
    ],
  });
});

router.get('/empresa/:id', authMiddleware, async (req, res) => {
  const empresa = await prisma.empresa.findUnique({ where: { id: req.params.id } });
  if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

  const [colaboradoresE, eventosE] = await Promise.all([
    prisma.colaborador.findMany({ where: { empresaId: empresa.id }, include: { compras: true } }),
    prisma.evento.findMany({ where: { empresas: { some: { empresaId: empresa.id } } }, include: { marca: true } }),
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
    eventosActivos: eventosE.filter(e => e.estado === 'activo'),
    eventosProximos: eventosE.filter(e => e.estado === 'proximo'),
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
      include: { marca: true },
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
    eventosDisponibles: eventosDisp,
    historialCompras: colaborador.compras,
  });
});

module.exports = router;
