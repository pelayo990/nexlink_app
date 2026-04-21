const express = require('express');
const router = express.Router();
const marcas = require('../data/marcas.json');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  if (req.user.rol === 'marca') {
    const m = marcas.find(m => m.id === req.user.marcaId);
    return res.json(m ? [m] : []);
  }
  res.json(marcas);
});

router.get('/:id', authMiddleware, (req, res) => {
  const marca = marcas.find(m => m.id === req.params.id);
  if (!marca) return res.status(404).json({ error: 'Marca no encontrada' });
  res.json(marca);
});

module.exports = router;
