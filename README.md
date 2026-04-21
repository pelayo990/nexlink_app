# 🔗 NexLink — Plataforma de Beneficios Corporativos

Plataforma privada que conecta **Marcas**, **Empresas** y **Colaboradores** a través de eventos flash exclusivos.

---

## 🚀 Cómo ejecutar

### Requisitos
- Node.js >= 18
- npm >= 9

### 1. Backend

```bash
cd backend
npm install
npm run dev
# Si el 4000 está ocupado: PORT=4001 npm run dev
# Corre en http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Corre en http://localhost:5173
```

---

## 👤 Usuarios de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin NexLink | admin@nexlink.cl | password |
| Marca (Samsung) | carolina@samsung.cl | password |
| Empresa (Banco Chile) | rrhh@bancochile.cl | password |
| Colaborador | maria@bancochile.cl | password |

---

## 🏗️ Arquitectura

```
nexlink/
├── backend/                   → API REST (Express + JWT)
│   ├── server.js              → Punto de entrada
│   ├── middleware/auth.js     → Verificación JWT + roles
│   ├── routes/
│   │   ├── auth.js            → POST /api/auth/login
│   │   ├── marcas.js          → GET /api/marcas
│   │   ├── empresas.js        → GET /api/empresas
│   │   ├── colaboradores.js   → GET /api/colaboradores
│   │   ├── eventos.js         → GET /api/eventos
│   │   ├── productos.js       → GET /api/productos
│   │   └── dashboard.js       → GET /api/dashboard/:rol/:id
│   └── data/                  → JSON hardcoded (→ reemplazar por BD)
│       ├── users.json
│       ├── marcas.json
│       ├── empresas.json
│       ├── empresas.json
│       ├── colaboradores.json
│       ├── eventos.json
│       └── productos.json
│
└── frontend/                  → SPA React + Vite
    └── src/
        ├── context/AuthContext.jsx   → Estado global de autenticación
        ├── services/api.js           → Axios con interceptores JWT
        ├── components/               → Componentes reutilizables
        │   ├── Sidebar.jsx
        │   ├── Topbar.jsx
        │   ├── StatCard.jsx
        │   ├── EventoCard.jsx
        │   └── ProductCard.jsx
        └── pages/
            ├── Login.jsx
            ├── admin/          → Dashboard, Marcas, Empresas, Eventos
            ├── marca/          → Dashboard, Productos, Eventos
            ├── empresa/        → Dashboard, Colaboradores, Eventos
            └── colaborador/    → Marketplace, MisCompras
```

## 📡 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/auth/login | Autenticación JWT |
| GET | /api/marcas | Listar marcas (filtrado por rol) |
| GET | /api/empresas | Listar empresas |
| GET | /api/colaboradores | Listar colaboradores |
| GET | /api/eventos | Listar eventos flash |
| GET | /api/eventos/:id | Detalle evento con productos |
| GET | /api/productos | Listar productos (filtros: eventoId, categoria) |
| GET | /api/dashboard/admin | Métricas globales |
| GET | /api/dashboard/marca/:id | Dashboard de marca |
| GET | /api/dashboard/empresa/:id | Dashboard de empresa |
| GET | /api/dashboard/colaborador/:id | Dashboard colaborador |

## 🔜 Próximos pasos (Fase 2 — Base de datos)

- [ ] Integrar PostgreSQL o MongoDB
- [ ] Reemplazar `data/*.json` por modelos ORM (Prisma / Mongoose)
- [ ] CRUD completo para marcas, empresas, eventos y productos
- [ ] Sistema de compras real con transacciones
- [ ] Carga de imágenes (S3 / Cloudinary)
- [ ] Notificaciones por email (eventos próximos)
- [ ] Sistema de puntos y canje


## 🩹 Nota importante

Este ZIP no incluye `backend/node_modules`. Instala dependencias con `npm install` antes de levantarlo.

Si `http://localhost:4000/api/health` no abre, prueba también:

```bash
cd backend
npm install
npm run dev
```

Y en otra terminal:

```bash
curl http://localhost:4000/api/health
```
