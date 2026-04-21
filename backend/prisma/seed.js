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

  const hash = await bcrypt.hash('password', 10);

  // ─── Empresas ─────────────────────────────────────────────────────────────
  const bancochile = await prisma.empresa.create({
    data: {
      id: 'e1',
      nombre: 'Banco de Chile',
      rut: '97.006.000-6',
      industria: 'Banca y Finanzas',
      logo: 'BC',
      contactoRRHH: 'Roberto Fuentes',
      emailRRHH: 'rrhh@bancochile.cl',
      telefono: '+56 2 2637 1111',
      totalColaboradores: 8500,
      colaboradoresActivos: 4230,
      estado: 'activo',
      plan: 'enterprise',
      fechaIngreso: new Date('2024-01-10'),
      dominiosPermitidos: ['bancochile.cl'],
      eventosParticipados: 15,
      comprasTotales: 38200000,
      ahorroColaboradores: 14600000,
      satisfaccion: 92,
    },
  });

  const entel = await prisma.empresa.create({
    data: {
      id: 'e2',
      nombre: 'Entel',
      rut: '92.580.000-7',
      industria: 'Telecomunicaciones',
      logo: 'EN',
      contactoRRHH: 'Valeria Morales',
      emailRRHH: 'rrhh@entel.cl',
      telefono: '+56 2 2340 2000',
      totalColaboradores: 5200,
      colaboradoresActivos: 2890,
      estado: 'activo',
      plan: 'premium',
      fechaIngreso: new Date('2024-02-01'),
      dominiosPermitidos: ['entel.cl'],
      eventosParticipados: 10,
      comprasTotales: 22400000,
      ahorroColaboradores: 8900000,
      satisfaccion: 88,
    },
  });

  const samsung = await prisma.empresa.create({
    data: {
      id: 'e3',
      nombre: 'Samsung Chile',
      rut: '96.645.020-4',
      industria: 'Tecnología',
      logo: 'SC',
      contactoRRHH: 'Carolina López',
      emailRRHH: 'rrhh@samsung.cl',
      telefono: '+56 2 2345 6789',
      totalColaboradores: 3200,
      colaboradoresActivos: 1800,
      estado: 'activo',
      plan: 'premium',
      fechaIngreso: new Date('2024-01-15'),
      dominiosPermitidos: ['samsung.cl', 'samsung.com'],
      eventosParticipados: 8,
      comprasTotales: 45200000,
      ahorroColaboradores: 18000000,
      satisfaccion: 95,
    },
  });

  const falabella = await prisma.empresa.create({
    data: {
      id: 'e4',
      nombre: 'Falabella',
      rut: '76.023.310-3',
      industria: 'Retail',
      logo: 'FA',
      contactoRRHH: 'Ana González',
      emailRRHH: 'rrhh@falabella.cl',
      telefono: '+56 2 2380 0000',
      totalColaboradores: 12000,
      colaboradoresActivos: 6100,
      estado: 'activo',
      plan: 'enterprise',
      fechaIngreso: new Date('2024-02-20'),
      dominiosPermitidos: ['falabella.cl', 'falabella.com'],
      eventosParticipados: 12,
      comprasTotales: 82400000,
      ahorroColaboradores: 32000000,
      satisfaccion: 91,
    },
  });

  console.log('✅ Empresas creadas');

  // ─── Colaboradores ────────────────────────────────────────────────────────
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

  // ─── Usuarios ─────────────────────────────────────────────────────────────
  await prisma.user.createMany({
    data: [
      { id: 'u1', nombre: 'Admin NexLink', email: 'admin@nexlink.cl', password: hash, rol: 'admin', avatar: 'AN', emailVerificado: true },
      { id: 'u2', nombre: 'Roberto Fuentes', email: 'rrhh@bancochile.cl', password: hash, rol: 'empresa', empresaId: 'e1', avatar: 'RF', emailVerificado: true },
      { id: 'u3', nombre: 'Valeria Morales', email: 'rrhh@entel.cl', password: hash, rol: 'empresa', empresaId: 'e2', avatar: 'VM', emailVerificado: true },
      { id: 'u4', nombre: 'Carolina López', email: 'rrhh@samsung.cl', password: hash, rol: 'empresa', empresaId: 'e3', avatar: 'CL', emailVerificado: true },
      { id: 'u5', nombre: 'Ana González', email: 'rrhh@falabella.cl', password: hash, rol: 'empresa', empresaId: 'e4', avatar: 'AG', emailVerificado: true },
      { id: 'u6', nombre: 'María Fernández', email: 'maria@bancochile.cl', password: hash, rol: 'colaborador', empresaId: 'e1', colaboradorId: 'c1', avatar: 'MF', emailVerificado: true },
      { id: 'u7', nombre: 'Pedro Soto', email: 'pedro@entel.cl', password: hash, rol: 'colaborador', empresaId: 'e2', colaboradorId: 'c2', avatar: 'PS', emailVerificado: true },
    ],
  });

  console.log('✅ Usuarios creados');

  // ─── Eventos ──────────────────────────────────────────────────────────────
  await prisma.evento.createMany({
    data: [
      { id: 'ev1', empresaId: 'e3', nombre: 'Samsung Tech Flash #8', descripcion: 'Descuentos hasta 40% en tecnología Samsung.', banner: 'samsung-banner', fechaInicio: new Date('2024-09-10T09:00:00'), fechaFin: new Date('2024-09-12T23:59:59'), estado: 'activo', destacado: true, tipo: 'flash', maxComprasPorColaborador: 2, totalVisitas: 1840, totalCompras: 312, montoTotal: 142800000, colaboradoresUnicos: 628 },
      { id: 'ev2', empresaId: 'e4', nombre: 'Falabella Hogar & Moda', descripcion: 'Liquidación de temporada hogar y moda.', banner: 'falabella-banner', fechaInicio: new Date('2024-09-08T09:00:00'), fechaFin: new Date('2024-09-15T23:59:59'), estado: 'activo', destacado: true, tipo: 'flash', maxComprasPorColaborador: 3, totalVisitas: 3210, totalCompras: 891, montoTotal: 68400000, colaboradoresUnicos: 1240 },
      { id: 'ev3', empresaId: 'e3', nombre: 'Samsung Back to School', descripcion: 'Notebooks y tablets Samsung a precios únicos.', banner: 'samsung-bts', fechaInicio: new Date('2024-07-15T09:00:00'), fechaFin: new Date('2024-07-18T23:59:59'), estado: 'finalizado', destacado: false, tipo: 'flash', maxComprasPorColaborador: 1, totalVisitas: 2100, totalCompras: 445, montoTotal: 89200000, colaboradoresUnicos: 890 },
    ],
  });

  await prisma.eventoEmpresa.createMany({
    data: [
      { eventoId: 'ev1', empresaId: 'e1' }, { eventoId: 'ev1', empresaId: 'e2' },
      { eventoId: 'ev2', empresaId: 'e1' }, { eventoId: 'ev2', empresaId: 'e2' },
      { eventoId: 'ev3', empresaId: 'e1' },
    ],
  });

  console.log('✅ Eventos creados');

  // ─── Productos ────────────────────────────────────────────────────────────
  await prisma.producto.createMany({
    data: [
      { id: 'p1', empresaId: 'e3', eventoId: 'ev1', nombre: 'Smart TV Samsung 55" 4K QLED', descripcion: 'Televisor QLED 4K con tecnología Quantum Dot.', categoria: 'Electrónica', precioOriginal: 899990, precioEvento: 559990, descuento: 38, stock: 45, stockMinimo: 5, imagen: 'tv', estado: 'activo', sku: 'SAM-TV55-4K-001', condicion: 'nuevo', tags: ['televisor', '4K', 'QLED'], visitas: 3200 },
      { id: 'p2', empresaId: 'e3', eventoId: 'ev1', nombre: 'Samsung Galaxy Tab S9', descripcion: 'Tablet premium con pantalla AMOLED 11".', categoria: 'Electrónica', precioOriginal: 699990, precioEvento: 449990, descuento: 36, stock: 28, stockMinimo: 3, imagen: 'tablet', estado: 'activo', sku: 'SAM-TAB-S9-002', condicion: 'nuevo', tags: ['tablet', 'Android'], visitas: 2800 },
      { id: 'p3', empresaId: 'e3', eventoId: 'ev1', nombre: 'Samsung Soundbar HW-Q800C', descripcion: 'Barra de sonido 5.1.2ch con Dolby Atmos.', categoria: 'Electrónica', precioOriginal: 449990, precioEvento: 269990, descuento: 40, stock: 18, stockMinimo: 2, imagen: 'soundbar', estado: 'activo', sku: 'SAM-SB-Q800-003', condicion: 'nuevo', tags: ['audio', 'soundbar'], visitas: 1900 },
      { id: 'p4', empresaId: 'e4', eventoId: 'ev2', nombre: 'Parrilla a Carbón Portátil Weber', descripcion: 'Parrilla compacta para picnic y camping.', categoria: 'Hogar', precioOriginal: 79990, precioEvento: 55990, descuento: 30, stock: 62, stockMinimo: 10, imagen: 'parrilla', estado: 'activo', sku: 'FAL-PAR-WEB-001', condicion: 'nuevo', tags: ['parrilla', 'hogar'], visitas: 1400 },
      { id: 'p5', empresaId: 'e4', eventoId: 'ev2', nombre: 'Chaqueta Técnica Impermeable', descripcion: 'Chaqueta impermeable colección invierno.', categoria: 'Moda', precioOriginal: 89990, precioEvento: 44990, descuento: 50, stock: 84, stockMinimo: 10, imagen: 'chaqueta', estado: 'activo', sku: 'FAL-CHA-IMP-002', condicion: 'nuevo', tags: ['moda', 'outdoor'], visitas: 2200 },
      { id: 'p6', empresaId: 'e4', eventoId: 'ev2', nombre: 'Set de Sartenes Cerámica 5 piezas', descripcion: 'Sartenes antiadherentes de cerámica.', categoria: 'Hogar', precioOriginal: 59990, precioEvento: 35990, descuento: 40, stock: 120, stockMinimo: 15, imagen: 'sartenes', estado: 'activo', sku: 'FAL-SAR-CER-003', condicion: 'nuevo', tags: ['cocina', 'hogar'], visitas: 1100 },
    ],
  });

  console.log('✅ Productos creados');

  await prisma.compra.createMany({
    data: [
      { id: 'cp1', colaboradorId: 'c1', productoId: 'p1', eventoId: 'ev1', fecha: new Date('2024-09-10T14:32:00'), monto: 559990, estado: 'completada' },
      { id: 'cp2', colaboradorId: 'c2', productoId: 'p4', eventoId: 'ev2', fecha: new Date('2024-09-09T10:15:00'), monto: 55990, estado: 'completada' },
    ],
  });

  console.log('✅ Compras creadas');
  console.log('🎉 Seed completado');
}

main()
  .catch(e => { console.error('❌ Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
