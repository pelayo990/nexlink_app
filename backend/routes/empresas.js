const express = require('express');
const router = express.Router();
const empresas = require('../data/empresas.json');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, (req, res) => {
  if (req.user.rol === 'empresa') {
    const e = empresas.find(e => e.id === req.user.empresaId);
    return res.json(e ? [e] : []);
  }
  res.json(empresas);
});

router.get('/:id', authMiddleware, (req, res) => {
  const empresa = empresas.find(e => e.id === req.params.id);
  if (!empresa) return res.status(404).json({ error: 'Empresa no encontrada' });
  res.json(empresa);
});

module.exports = router;
