const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../services/cloudinary');
const { authMiddleware } = require('../middleware/auth');

// POST /api/uploads/imagen — sube una imagen a Cloudinary
router.post('/imagen', authMiddleware, upload.single('imagen'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ninguna imagen' });
  res.json({
    url: req.file.path,
    public_id: req.file.filename,
  });
});

// DELETE /api/uploads/imagen/:public_id — elimina una imagen de Cloudinary
router.delete('/imagen/:public_id', authMiddleware, async (req, res) => {
  try {
    await cloudinary.uploader.destroy(req.params.public_id);
    res.json({ message: 'Imagen eliminada' });
  } catch (e) {
    res.status(500).json({ error: 'Error al eliminar imagen' });
  }
});

module.exports = router;
