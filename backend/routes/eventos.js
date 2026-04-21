const express = require('express');
const router = express.Router();
const eventos = require('../data/eventos.json');
const marcas = require('../data/marcas.json');
const productos = require('../data/productos.json');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  const { rol, marcaId, empresaId } = req.user;
  let result = eventos;

  if (rol === 'marca') {
    result = eventos.filter(e => e.marcaId === marcaId);
  } else if (rol === 'empresa' || rol === 'colaborador') {
    result = eventos.filter(e => e.empresasInvitadas.includes(empresaId));
  }

  // Enrich with marca info
  const enriched = result.map(ev => ({
    ...ev,
    marca: marcas.find(m => m.id === ev.marcaId) || null,
    totalProductos: ev.productosIds.length,
  }));

  res.json(enriched);
});

router.get('/:id', authMiddleware, (req, res) => {
  const evento = eventos.find(e => e.id === req.params.id);
  if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });

  const marca = marcas.find(m => m.id === evento.marcaId);
  const productosEvento = productos.filter(p => evento.productosIds.includes(p.id));

  res.json({ ...evento, marca, productos: productosEvento });
});

module.exports = router;
