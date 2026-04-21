require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const authRoutes = require('./routes/auth');
const marcasRoutes = require('./routes/marcas');
const empresasRoutes = require('./routes/empresas');
const colaboradoresRoutes = require('./routes/colaboradores');
const eventosRoutes = require('./routes/eventos');
const productosRoutes = require('./routes/productos');
const dashboardRoutes = require('./routes/dashboard');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/marcas', marcasRoutes);
app.use('/api/empresas', empresasRoutes);
app.use('/api/colaboradores', colaboradoresRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', plataforma: 'NexLink' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 NexLink Backend corriendo en http://localhost:${PORT}`);
});
