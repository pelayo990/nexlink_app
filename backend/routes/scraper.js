const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authMiddleware } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

let mlToken = null;
let mlTokenExpira = null;

const obtenerTokenML = async () => {
  if (mlToken && mlTokenExpira && Date.now() < mlTokenExpira) return mlToken;

  const { data } = await axios.post('https://api.mercadolibre.com/oauth/token', {
    grant_type: 'client_credentials',
    client_id: process.env.ML_CLIENT_ID,
    client_secret: process.env.ML_CLIENT_SECRET,
  }, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    timeout: 8000,
  });

  mlToken = data.access_token;
  mlTokenExpira = Date.now() + (data.expires_in - 60) * 1000;
  return mlToken;
};

const extraerItemId = (url) => {
  const match = url.match(/MLC-?(\d+)/i);
  return match ? `MLC${match[1]}` : null;
};

router.post('/mercadolibre', authMiddleware, asyncHandler(async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  const esMercadoLibre = url.includes('mercadolibre.cl') || url.includes('mercadolibre.com');
  if (!esMercadoLibre) return res.status(400).json({ error: 'Solo se aceptan URLs de MercadoLibre' });

  const itemId = extraerItemId(url);
  if (!itemId) return res.status(400).json({ error: 'No se pudo extraer el ID del producto de la URL' });

  const token = await obtenerTokenML();

  const [itemRes, descRes] = await Promise.allSettled([
    axios.get(`https://api.mercadolibre.com/items/${itemId}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    }),
    axios.get(`https://api.mercadolibre.com/items/${itemId}/description`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 8000,
    }),
  ]);

  if (itemRes.status === 'rejected') {
    return res.status(422).json({ error: 'No se encontró el producto. Verifica la URL.' });
  }

  const item = itemRes.value.data;
  const descripcion = descRes.status === 'fulfilled' ? descRes.value.data.plain_text?.slice(0, 500) : null;
  const imagen = item.pictures?.[0]?.url || item.thumbnail;
  const precioOriginal = item.original_price || item.price;
  const precioEvento = item.price;
  const descuento = precioOriginal > precioEvento
    ? Math.round((1 - precioEvento / precioOriginal) * 100)
    : 0;

  res.json({
    nombre: item.title,
    descripcion,
    precioOriginal,
    precioEvento,
    descuento,
    imagen,
    sku: item.id,
    condicion: item.condition === 'new' ? 'nuevo' : 'usado',
  });
}));

module.exports = router;
