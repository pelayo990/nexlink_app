const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const { authMiddleware } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// POST /api/scraper/mercadolibre
router.post('/mercadolibre', authMiddleware, asyncHandler(async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  const esMercadoLibre = url.includes('mercadolibre.cl') || url.includes('mercadolibre.com') || url.includes('meli.com');
  if (!esMercadoLibre) return res.status(400).json({ error: 'Solo se aceptan URLs de MercadoLibre' });

  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'es-CL,es;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    timeout: 10000,
  });

  const $ = cheerio.load(html);

  // Nombre
  const nombre = $('h1.ui-pdp-title').text().trim() ||
                 $('h1').first().text().trim();

  // Precio actual (precio evento)
  const precioTexto = $('.ui-pdp-price__second-line .andes-money-amount__fraction').first().text().trim().replace(/\./g, '');
  const precioEvento = precioTexto ? parseFloat(precioTexto) : null;

  // Precio original (tachado)
  const precioOriginalTexto = $('.ui-pdp-price__original-value .andes-money-amount__fraction').first().text().trim().replace(/\./g, '');
  const precioOriginal = precioOriginalTexto ? parseFloat(precioOriginalTexto) : null;

  // Descuento
  const descuentoTexto = $('.ui-pdp-price__discount').first().text().trim().replace(/[^0-9]/g, '');
  const descuento = descuentoTexto ? parseFloat(descuentoTexto) : (precioOriginal && precioEvento ? Math.round((1 - precioEvento / precioOriginal) * 100) : 0);

  // Imagen principal
  const imagen = $('figure.ui-pdp-gallery__figure img').first().attr('data-zoom') ||
                 $('figure.ui-pdp-gallery__figure img').first().attr('src') ||
                 $('.ui-pdp-image').first().attr('src');

  // Descripción
  const descripcion = $('.ui-pdp-description__content').text().trim().slice(0, 500) || null;

  // SKU / ID de ML
  const sku = url.match(/MLC-?(\d+)/i)?.[0]?.replace('-', '') || null;

  // Condición
  const condicionTexto = $('.ui-pdp-subtitle').first().text().toLowerCase();
  const condicion = condicionTexto.includes('nuevo') ? 'nuevo' : condicionTexto.includes('usado') ? 'usado' : 'nuevo';

  if (!nombre && !precioEvento) {
    return res.status(422).json({ error: 'No se pudieron extraer datos del producto. Verifica que la URL sea válida.' });
  }

  res.json({
    nombre,
    descripcion,
    precioEvento,
    precioOriginal: precioOriginal || precioEvento,
    descuento: descuento || 0,
    imagen,
    sku,
    condicion,
  });
}));

module.exports = router;
