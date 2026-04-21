const express = require('express');
const router = express.Router();
const marcas = require('../data/marcas.json');
const empresas = require('../data/empresas.json');
const eventos = require('../data/eventos.json');
const productos = require('../data/productos.json');
const colaboradores = require('../data/colaboradores.json');
const { authMiddleware } = require('../middleware/auth');

// Admin dashboard
router.get('/admin', authMiddleware, (req, res) => {
  const totalVentas = marcas.reduce((s, m) => s + m.statsVentas.ventasTotales, 0);
  const totalCompras = empresas.reduce((s, e) => s + e.estadisticas.comprasTotales, 0);
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
    topMarcas: marcas
      .sort((a, b) => b.statsVentas.ventasTotales - a.statsVentas.ventasTotales)
      .slice(0, 4)
      .map(m => ({
        id: m.id,
        nombre: m.nombre,
        categoria: m.categoria,
        ventas: m.statsVentas.ventasTotales,
        eventos: m.statsVentas.totalEventos,
      })),
    topEmpresas: empresas
      .sort((a, b) => b.estadisticas.comprasTotales - a.estadisticas.comprasTotales)
      .slice(0, 4)
      .map(e => ({
        id: e.id,
        nombre: e.nombre,
        industria: e.industria,
        compras: e.estadisticas.comprasTotales,
        colaboradores: e.colaboradoresActivos,
      })),
    eventosRecientes: eventos.slice(0, 4),
    ventasMensuales: [
      { mes: 'Ene', ventas: 8200000 },
      { mes: 'Feb', ventas: 12400000 },
      { mes: 'Mar', ventas: 18900000 },
      { mes: 'Abr', ventas: 22100000 },
      { mes: 'May', ventas: 19800000 },
      { mes: 'Jun', ventas: 28400000 },
      { mes: 'Jul', ventas: 31200000 },
      { mes: 'Ago', ventas: 35800000 },
      { mes: 'Sep', ventas: 42100000 },
    ],
  });
});

// Marca dashboard
router.get('/marca/:id', authMiddleware, (req, res) => {
  const marca = marcas.find(m => m.id === req.params.id);
  if (!marca) return res.status(404).json({ error: 'Marca no encontrada' });

  const eventosM = eventos.filter(e => e.marcaId === marca.id);
  const productosM = productos.filter(p => p.marcaId === marca.id);

  res.json({
    marca,
    stats: {
      ventasMes: marca.statsVentas.ventasTotales,
      productosActivos: productosM.filter(p => p.estado === 'activo').length,
      descuentoPromedio: Math.round(
        productosM.reduce((s, p) => s + p.descuento, 0) / (productosM.length || 1)
      ),
      puntosCanjeados: 5340,
    },
    eventosActivos: eventosM.filter(e => e.estado === 'activo'),
    eventosProximos: eventosM.filter(e => e.estado === 'proximo'),
    eventosPasados: eventosM.filter(e => e.estado === 'finalizado'),
    productos: productosM.map((p, i) => ({
      ...p,
      // Visitas deterministas basadas en precio y posición — reemplazar con datos reales en Fase 2
      visitas: Math.floor((p.precioOriginal / 100) * (i + 1)) % 7500 + 500,
    })),
    topProductos: productosM.slice(0, 3),
    ventasMensuales: [
      { mes: 'Ene', ventas: 0 },
      { mes: 'Feb', ventas: 2100000 },
      { mes: 'Mar', ventas: 3400000 },
      { mes: 'Abr', ventas: 2800000 },
      { mes: 'May', ventas: 4100000 },
      { mes: 'Jun', ventas: 3600000 },
      { mes: 'Jul', ventas: 8900000 },
      { mes: 'Ago', ventas: 9800000 },
      { mes: 'Sep', ventas: 12540000 },
    ],
    fuentesTrafico: [
      { fuente: 'Directo', porcentaje: 47 },
      { fuente: 'Email', porcentaje: 31 },
      { fuente: 'Social', porcentaje: 22 },
    ],
  });
});

// Empresa dashboard
router.get('/empresa/:id', authMiddleware, (req, res) => {
  const empresa = empresas.find(e => e.id === req.params.id);
  if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });

  const colaboradoresE = colaboradores.filter(c => c.empresaId === empresa.id);
  const eventosE = eventos.filter(e => e.empresasInvitadas.includes(empresa.id));

  res.json({
    empresa,
    stats: {
      totalColaboradores: empresa.totalColaboradores,
      colaboradoresActivos: empresa.colaboradoresActivos,
      eventosDisponibles: eventosE.filter(e => e.estado === 'activo').length,
      ahorroTotal: empresa.estadisticas.ahorroColaboradores,
      satisfaccion: empresa.estadisticas.satisfaccion,
    },
    eventosActivos: eventosE.filter(e => e.estado === 'activo'),
    eventosProximos: eventosE.filter(e => e.estado === 'proximo'),
    colaboradores: colaboradoresE,
    topColaboradores: colaboradoresE
      .sort((a, b) => b.puntos - a.puntos)
      .slice(0, 5),
    participacionMensual: [
      { mes: 'Ene', participacion: 12 },
      { mes: 'Feb', participacion: 18 },
      { mes: 'Mar', participacion: 24 },
      { mes: 'Abr', participacion: 31 },
      { mes: 'May', participacion: 28 },
      { mes: 'Jun', participacion: 42 },
      { mes: 'Jul', participacion: 55 },
      { mes: 'Ago', participacion: 61 },
      { mes: 'Sep', participacion: 73 },
    ],
  });
});

// Colaborador dashboard
router.get('/colaborador/:id', authMiddleware, (req, res) => {
  const colaborador = colaboradores.find(c => c.id === req.params.id);
  if (!colaborador) return res.status(404).json({ error: 'Colaborador no encontrado' });

  const empresa = empresas.find(e => e.id === colaborador.empresaId);
  const eventosDisp = eventos.filter(
    e => e.empresasInvitadas.includes(colaborador.empresaId) && e.estado === 'activo'
  );

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
