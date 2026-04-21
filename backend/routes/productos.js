const express = require('express');
const router = express.Router();
const productos = require('../data/productos.json');
const marcas = require('../data/marcas.json');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  const { rol, marcaId } = req.user;
  const { eventoId, categoria } = req.query;

  let result = productos;
  if (rol === 'marca') result = result.filter(p => p.marcaId === marcaId);
  if (eventoId) result = result.filter(p => p.eventoId === eventoId);
  if (categoria) result = result.filter(p => p.categoria === categoria);

  const enriched = result.map(p => ({
    ...p,
    marca: marcas.find(m => m.id === p.marcaId) || null,
  }));

  res.json(enriched);
});

router.get('/:id', authMiddleware, (req, res) => {
  const producto = productos.find(p => p.id === req.params.id);
  if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json({ ...producto, marca: marcas.find(m => m.id === producto.marcaId) });
});

module.exports = router;
