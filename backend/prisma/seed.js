const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  await prisma.compra.deleteMany();
  await prisma.eventoEmpresa.deleteMany();
  await prisma.user.deleteMany();
  await prisma.colaborador.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.evento.deleteMany();
  await prisma.empresa.deleteMany();
  await prisma.marca.deleteMany();

  const hash = await bcrypt.hash('password', 10);

  await prisma.marca.createMany({
    data: [
      { id: 'm1', nombre: 'Samsung Chile', logo: 'Samsung', categoria: 'Electrónica', descripcion: 'Líder global en tecnología', contacto: 'carolina@samsung.cl', telefono: '+56 2 2345 6789', rut: '96.645.020-4', estado: 'activo', plan: 'premium', fechaIngreso: new Date('2024-01-15'), totalProductosPublicados: 24, totalEventos: 8, ventasTotales: 45200000, colaboradoresAlcanzados: 1240, tasaConvercion: 34 },
      { id: 'm2', nombre: 'Falabella', logo: 'Falabella', categoria: 'Retail', descripcion: 'Tienda por departamentos', contacto: 'ana@falabella.cl', telefono: '+56 2 2380 0000', rut: '76.023.310-3', estado: 'activo', plan: 'standard', fechaIngreso: new Date('2024-02-20'), totalProductosPublicados: 48, totalEventos: 12, ventasTotales: 82400000, colaboradoresAlcanzados: 3560, tasaConvercion: 41 },
      { id: 'm3', nombre: 'Adidas Chile', logo: 'Adidas', categoria: 'Deportes', descripcion: 'Equipamiento deportivo', contacto: 'ventas@adidas.cl', telefono: '+56 2 2999 0000', rut: '96.701.100-8', estado: 'activo', plan: 'premium', fechaIngreso: new Date('2024-03-05'), totalProductosPublicados: 36, totalEventos: 6, ventasTotales: 28900000, colaboradoresAlcanzados: 890, tasaConvercion: 28 },
      { id: 'm4', nombre: 'Nestlé Chile', logo: 'Nestlé', categoria: 'Alimentos', descripcion: 'Productos alimenticios', contacto: 'corp@nestle.cl', telefono: '+56 2 2338 7000', rut: '90.703.000-6', estado: 'pendiente', plan: 'standard', fechaIngreso: new Date('2024-08-10') },
    ],
  });
  console.log('✅ Marcas creadas');

  await prisma.empresa.createMany({
    data: [
      { id: 'e1', nombre: 'Banco de Chile', rut: '97.006.000-6', industria: 'Banca y Finanzas', logo: 'BC', contactoRRHH: 'Roberto Fuentes', emailRRHH: 'rrhh@bancochile.cl', telefono: '+56 2 2637 1111', totalColaboradores: 8500, colaboradoresActivos: 4230, estado: 'activo', plan: 'enterprise', fechaIngreso: new Date('2024-01-10'), eventosParticipados: 15, comprasTotales: 38200000, ahorroColaboradores: 14600000, satisfaccion: 92 },
      { id: 'e2', nombre: 'Entel', rut: '92.580.000-7', industria: 'Telecomunicaciones', logo: 'EN', contactoRRHH: 'Valeria Morales', emailRRHH: 'rrhh@entel.cl', telefono: '+56 2 2340 2000', totalColaboradores: 5200, colaboradoresActivos: 2890, estado: 'activo', plan: 'premium', fechaIngreso: new Date('2024-02-01'), eventosParticipados: 10, comprasTotales: 22400000, ahorroColaboradores: 8900000, satisfaccion: 88 },
      { id: 'e3', nombre: 'Cencosud', rut: '93.834.000-5', industria: 'Retail', logo: 'CS', contactoRRHH: 'Jorge Álvarez', emailRRHH: 'rrhh@cencosud.cl', telefono: '+56 2 2959 0000', totalColaboradores: 12000, colaboradoresActivos: 6100, estado: 'activo', plan: 'enterprise', fechaIngreso: new Date('2024-03-15'), eventosParticipados: 18, comprasTotales: 56700000, ahorroColaboradores: 21300000, satisfaccion: 95 },
      { id: 'e4', nombre: 'Latam Airlines', rut: '89.862.200-2', industria: 'Aviación', logo: 'LA', contactoRRHH: 'Sofía Vera', emailRRHH: 'rrhh@latam.com', telefono: '+56 2 2565 3000', totalColaboradores: 4800, colaboradoresActivos: 2100, estado: 'pendiente', plan: 'premium', fechaIngreso: new Date('2024-08-20') },
    ],
  });
  console.log('✅ Empresas creadas');

  await prisma.colaborador.createMany({
    data: [
      { id: 'c1', empresaId: 'e1', nombre: 'María Fernández', email: 'maria@bancochile.cl', cargo: 'Analista Senior', area: 'Tecnología', rut: '15.234.567-8', fechaIngreso: new Date('2020-03-01'), estado: 'activo', puntos: 1240 },
      { id: 'c2', empresaId: 'e2', nombre: 'Pedro Soto', email: 'pedro@entel.cl', cargo: 'Ingeniero de Redes', area: 'Operaciones', rut: '16.789.012-3', fechaIngreso: new Date('2019-08-15'), estado: 'activo', puntos: 890 },
      { id: 'c3', empresaId: 'e1', nombre: 'Carlos Rojas', email: 'carlos.rojas@bancochile.cl', cargo: 'Ejecutivo Comercial', area: 'Ventas', rut: '14.567.890-1', fechaIngreso: new Date('2018-05-20'), estado: 'activo', puntos: 2100 },
      { id: 'c4', empresaId: 'e1', nombre: 'Valentina Muñoz', email: 'valentina.munoz@bancochile.cl', cargo: 'Gerenta de Proyectos', area: 'Tecnología', rut: '17.234.567-9', fechaIngreso: new Date('2021-02-10'), estado: 'activo', puntos: 560 },
      { id: 'c5', empresaId: 'e2', nombre: 'Roberto Castro', email: 'r.castro@entel.cl', cargo: 'Técnico Especialista', area: 'Soporte', rut: '18.901.234-5', fechaIngreso: new Date('2022-07-01'), estado: 'activo', puntos: 340 },
    ],
  });
  console.log('✅ Colaboradores creados');

  await prisma.user.createMany({
    data: [
      { id: 'u1', nombre: 'Admin NexLink', email: 'admin@nexlink.cl', password: hash, rol: 'admin', avatar: 'AN' },
      { id: 'u2', nombre: 'Carolina López', email: 'carolina@samsung.cl', password: hash, rol: 'marca', marcaId: 'm1', avatar: 'CL' },
      { id: 'u3', nombre: 'Roberto Fuentes', email: 'rrhh@bancochile.cl', password: hash, rol: 'empresa', empresaId: 'e1', avatar: 'RF' },
      { id: 'u4', nombre: 'María Fernández', email: 'maria@bancochile.cl', password: hash, rol: 'colaborador', empresaId: 'e1', colaboradorId: 'c1', avatar: 'MF' },
      { id: 'u5', nombre: 'Pedro Soto', email: 'pedro@entel.cl', password: hash, rol: 'colaborador', empresaId: 'e2', colaboradorId: 'c2', avatar: 'PS' },
      { id: 'u6', nombre: 'Ana González', email: 'ana@falabella.cl', password: hash, rol: 'marca', marcaId: 'm2', avatar: 'AG' },
    ],
  });
  console.log('✅ Usuarios creados');

  await prisma.evento.createMany({
    data: [
      { id: 'ev1', marcaId: 'm1', nombre: 'Samsung Tech Flash #8', descripcion: 'Evento exclusivo Samsung con descuentos hasta 40%.', banner: 'samsung-banner', fechaInicio: new Date('2024-09-10T09:00:00'), fechaFin: new Date('2024-09-12T23:59:59'), estado: 'activo', destacado: true, tipo: 'flash', maxComprasPorColaborador: 2, totalVisitas: 1840, totalCompras: 312, montoTotal: 142800000, colaboradoresUnicos: 628 },
      { id: 'ev2', marcaId: 'm2', nombre: 'Falabella Hogar & Moda', descripcion: 'Liquidación de temporada hogar y moda.', banner: 'falabella-banner', fechaInicio: new Date('2024-09-08T09:00:00'), fechaFin: new Date('2024-09-15T23:59:59'), estado: 'activo', destacado: true, tipo: 'flash', maxComprasPorColaborador: 3, totalVisitas: 3210, totalCompras: 891, montoTotal: 68400000, colaboradoresUnicos: 1240 },
      { id: 'ev3', marcaId: 'm3', nombre: 'Adidas Sport Week', descripcion: 'Semana deportiva con descuentos especiales.', banner: 'adidas-banner', fechaInicio: new Date('2024-09-20T09:00:00'), fechaFin: new Date('2024-09-27T23:59:59'), estado: 'proximo', destacado: false, tipo: 'flash', maxComprasPorColaborador: 2 },
      { id: 'ev4', marcaId: 'm1', nombre: 'Samsung Back to School', descripcion: 'Evento back to school con notebooks y tablets.', banner: 'samsung-bts', fechaInicio: new Date('2024-07-15T09:00:00'), fechaFin: new Date('2024-07-18T23:59:59'), estado: 'finalizado', destacado: false, tipo: 'flash', maxComprasPorColaborador: 1, totalVisitas: 2100, totalCompras: 445, montoTotal: 89200000, colaboradoresUnicos: 890 },
    ],
  });

  await prisma.eventoEmpresa.createMany({
    data: [
      { eventoId: 'ev1', empresaId: 'e1' }, { eventoId: 'ev1', empresaId: 'e2' }, { eventoId: 'ev1', empresaId: 'e3' },
      { eventoId: 'ev2', empresaId: 'e1' }, { eventoId: 'ev2', empresaId: 'e2' }, { eventoId: 'ev2', empresaId: 'e3' }, { eventoId: 'ev2', empresaId: 'e4' },
      { eventoId: 'ev3', empresaId: 'e1' }, { eventoId: 'ev3', empresaId: 'e2' },
      { eventoId: 'ev4', empresaId: 'e1' }, { eventoId: 'ev4', empresaId: 'e3' },
    ],
  });
  console.log('✅ Eventos creados');

  await prisma.producto.createMany({
    data: [
      { id: 'p1', marcaId: 'm1', eventoId: 'ev1', nombre: 'Smart TV Samsung 55" 4K QLED', descripcion: 'Televisor QLED 4K con tecnología Quantum Dot.', categoria: 'Electrónica', precioOriginal: 899990, precioEvento: 559990, descuento: 38, stock: 45, stockMinimo: 5, imagen: 'tv', estado: 'activo', sku: 'SAM-TV55-4K-001', condicion: 'nuevo', tags: ['televisor', '4K', 'QLED'], visitas: 3200 },
      { id: 'p2', marcaId: 'm1', eventoId: 'ev1', nombre: 'Samsung Galaxy Tab S9', descripcion: 'Tablet premium con pantalla AMOLED 11".', categoria: 'Electrónica', precioOriginal: 699990, precioEvento: 449990, descuento: 36, stock: 28, stockMinimo: 3, imagen: 'tablet', estado: 'activo', sku: 'SAM-TAB-S9-002', condicion: 'nuevo', tags: ['tablet', 'Android', 'premium'], visitas: 2800 },
      { id: 'p3', marcaId: 'm1', eventoId: 'ev1', nombre: 'Samsung Soundbar HW-Q800C', descripcion: 'Barra de sonido 5.1.2ch con Dolby Atmos.', categoria: 'Electrónica', precioOriginal: 449990, precioEvento: 269990, descuento: 40, stock: 18, stockMinimo: 2, imagen: 'soundbar', estado: 'activo', sku: 'SAM-SB-Q800-003', condicion: 'nuevo', tags: ['audio', 'soundbar'], visitas: 1900 },
      { id: 'p4', marcaId: 'm2', eventoId: 'ev2', nombre: 'Parrilla a Carbón Portátil Weber', descripcion: 'Parrilla compacta para picnic y camping.', categoria: 'Hogar', precioOriginal: 79990, precioEvento: 55990, descuento: 30, stock: 62, stockMinimo: 10, imagen: 'parrilla', estado: 'activo', sku: 'FAL-PAR-WEB-001', condicion: 'nuevo', tags: ['parrilla', 'hogar'], visitas: 1400 },
      { id: 'p5', marcaId: 'm2', eventoId: 'ev2', nombre: 'Chaqueta Técnica Impermeable', descripcion: 'Chaqueta con membrana impermeable 10.000mm.', categoria: 'Moda', precioOriginal: 89990, precioEvento: 44990, descuento: 50, stock: 84, stockMinimo: 10, imagen: 'chaqueta', estado: 'activo', sku: 'FAL-CHA-IMP-002', condicion: 'nuevo', tags: ['moda', 'outdoor'], visitas: 2200 },
      { id: 'p6', marcaId: 'm2', eventoId: 'ev2', nombre: 'Set de Sartenes Cerámica 5 piezas', descripcion: 'Sartenes antiadherentes de cerámica.', categoria: 'Hogar', precioOriginal: 59990, precioEvento: 35990, descuento: 40, stock: 120, stockMinimo: 15, imagen: 'sartenes', estado: 'activo', sku: 'FAL-SAR-CER-003', condicion: 'nuevo', tags: ['cocina', 'hogar'], visitas: 1100 },
      { id: 'p7', marcaId: 'm3', eventoId: 'ev3', nombre: 'Zapatillas Adidas Ultraboost 22', descripcion: 'Zapatillas running con amortiguación BOOST.', categoria: 'Deportes', precioOriginal: 159990, precioEvento: 95990, descuento: 40, stock: 55, stockMinimo: 8, imagen: 'zapatillas', estado: 'activo', sku: 'ADI-ZAP-UB22-001', condicion: 'nuevo', tags: ['running', 'deportes'], visitas: 3800 },
      { id: 'p8', marcaId: 'm3', eventoId: 'ev3', nombre: 'Polera Adidas Techfit Compression', descripcion: 'Polera de compresión para entrenamiento.', categoria: 'Deportes', precioOriginal: 39990, precioEvento: 21990, descuento: 45, stock: 200, stockMinimo: 20, imagen: 'polera', estado: 'activo', sku: 'ADI-POL-TF-002', condicion: 'nuevo', tags: ['ropa deportiva', 'training'], visitas: 2600 },
    ],
  });

  await prisma.compra.createMany({
    data: [
      { id: 'cp1', colaboradorId: 'c1', productoId: 'p1', eventoId: 'ev1', fecha: new Date('2024-09-10T14:32:00'), monto: 559990, estado: 'completada' },
      { id: 'cp2', colaboradorId: 'c2', productoId: 'p7', eventoId: 'ev3', fecha: new Date('2024-09-20T10:15:00'), monto: 95990, estado: 'pendiente' },
    ],
  });
  console.log('✅ Productos y compras creados');
  console.log('🎉 Seed completado');
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
