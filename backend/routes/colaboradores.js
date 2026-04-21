const express = require('express');
const router = express.Router();
const colaboradores = require('../data/colaboradores.json');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  const { rol, empresaId, colaboradorId } = req.user;
  if (rol === 'colaborador') {
    const c = colaboradores.find(c => c.id === colaboradorId);
    return res.json(c ? [c] : []);
  }
  if (rol === 'empresa') {
    return res.json(colaboradores.filter(c => c.empresaId === empresaId));
  }
  res.json(colaboradores);
});

router.get('/:id', authMiddleware, (req, res) => {
  const c = colaboradores.find(c => c.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Colaborador no encontrado' });
  res.json(c);
});

module.exports = router;
