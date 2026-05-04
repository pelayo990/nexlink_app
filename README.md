# 🔗 NexLink — Plataforma de Beneficios Corporativos

Plataforma privada que conecta **Empresas** y **Colaboradores** a través de eventos flash exclusivos con productos a precio preferencial.

---

## 🚀 Cómo ejecutar

### Requisitos
- Node.js >= 18
- npm >= 9
- PostgreSQL >= 14

### 1. Backend

\`\`\`bash
cd backend
cp .env.example .env      # completar variables
npm install
npx prisma db push        # crear tablas
npx prisma db seed        # poblar datos de prueba
npm run dev               # http://localhost:4000
\`\`\`

### 2. Frontend

\`\`\`bash
cd frontend
cp .env.example .env      # completar variables
npm install
npm run dev               # http://localhost:5173
\`\`\`

---

## 👤 Usuarios de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin NexLink | admin@nexlink.cl | password |
| Empresa (Banco Chile) | rrhh@bancochile.cl | password |
| Colaborador | maria@bancochile.cl | password |

---

## 🏗️ Arquitectura

\`\`\`
nexlink/
├── backend/                         → API REST (Express + Prisma + PostgreSQL)
│   ├── server.js                    → Punto de entrada
│   ├── middleware/
│   │   ├── auth.js                  → Verificación JWT via httpOnly cookie + roles
│   │   └── asyncHandler.js          → Wrapper para manejo de errores async
│   ├── routes/
│   │   ├── auth.js                  → /api/auth (login, logout, registro, verificar)
│   │   ├── empresas.js              → /api/empresas
│   │   ├── colaboradores.js         → /api/colaboradores
│   │   ├── eventos.js               → /api/eventos
│   │   ├── productos.js             → /api/productos
│   │   ├── compras.js               → /api/compras
│   │   ├── dashboard.js             → /api/dashboard
│   │   ├── reportes.js              → /api/reportes
│   │   ├── banners.js               → /api/banners
│   │   ├── paginaEmpresa.js         → /api/pagina-empresa
│   │   └── uploads.js               → /api/uploads
│   ├── services/
│   │   ├── email.js                 → Emails transaccionales via Resend
│   │   └── cloudinary.js            → Subida de imágenes via Cloudinary
│   └── prisma/
│       ├── schema.prisma            → Modelos: User, Empresa, Colaborador, Evento, Producto, Compra
│       └── seed.js                  → Datos de prueba
│
└── frontend/                        → SPA React + Vite
    └── src/
        ├── context/AuthContext.jsx  → Estado global de autenticación
        ├── services/api.js          → Axios con httpOnly cookie y manejo de errores
        ├── components/              → Sidebar, Topbar, StatCard, EventoCard, ProductCard
        └── pages/
            ├── Login.jsx / Registro.jsx / Perfil.jsx
            ├── admin/               → Dashboard, Empresas, Eventos, Colaboradores, Reportes, Banners
            ├── empresa/             → Dashboard, Productos, Eventos, Colaboradores, Reportes, MiPagina
            └── colaborador/         → Marketplace, MisCompras, MarcaPage
\`\`\`

---

## 📡 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Autenticación — setea httpOnly cookie |
| POST | /api/auth/logout | Cierra sesión — limpia cookie |
| POST | /api/auth/registro | Registro de colaborador con verificación email |
| GET | /api/auth/verificar?token= | Verificación de email |
| POST | /api/auth/cambiar-password | Cambio de contraseña |
| GET | /api/empresas | Listar empresas |
| GET | /api/colaboradores | Listar colaboradores |
| GET | /api/eventos | Listar eventos flash |
| GET | /api/eventos/:id | Detalle evento con productos |
| GET | /api/productos | Listar productos (filtros: eventoId, categoria) |
| POST | /api/compras | Realizar compra |
| GET | /api/compras/mis-compras | Historial de compras del colaborador |
| GET | /api/dashboard/admin | Métricas globales |
| GET | /api/dashboard/empresa/:id | Dashboard de empresa |
| GET | /api/dashboard/colaborador/:id | Dashboard de colaborador |
| GET | /api/reportes/resumen | Reporte global (admin) |
| GET | /api/reportes/empresa/:id | Reporte por empresa |
| GET | /api/banners | Banners activos |
| GET | /api/pagina-empresa/:id | Página pública de empresa |
| POST | /api/uploads/imagen | Subir imagen a Cloudinary |
| GET | /api/health | Health check |

---

## 🔜 Próximos pasos

- [ ] Refresh token (actualmente expira a las 8h fijas)
- [ ] Paginación en marketplace y listados
- [ ] Sistema de canje de puntos
- [ ] Notificaciones por email (eventos próximos)
