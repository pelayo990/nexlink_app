const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const { authMiddleware } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const extraerItemId = (url) => {
  const match = url.match(/MLC-?(\d+)/i);
  return match ? `MLC${match[1]}` : null;
};

router.post('/mercadolibre', authMiddleware, asyncHandler(async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  const esMercadoLibre = url.includes('mercadolibre.cl') || url.includes('mercadolibre.com');
  if (!esMercadoLibre) return res.status(400).json({ error: 'Solo se aceptan URLs de MercadoLibre' });

  const SCRAPER_KEY = process.env.SCRAPER_API_KEY;
  if (!SCRAPER_KEY) return res.status(500).json({ error: 'SCRAPER_API_KEY no configurada' });

  // Limpiar la URL de parámetros innecesarios
  const urlLimpia = url.split('#')[0].split('?')[0];

  const scraperUrl = `http://api.scraperapi.com?api_key=${SCRAPER_KEY}&url=${encodeURIComponent(urlLimpia)}&render=false&country_code=cl`;

  const { data: html } = await axios.get(scraperUrl, { timeout: 30000 });

  const $ = cheerio.load(html);

  // Intentar extraer datos del JSON-LD primero (más confiable)
  let nombre, precioEvento, precioOriginal, descuento, imagen, descripcion, condicion;

  const jsonLd = $('script[type="application/ld+json"]').first().html();
  if (jsonLd) {
    try {
      const data = JSON.parse(jsonLd);
      nombre = data.name;
      precioEvento = data.offers?.price ? parseFloat(data.offers.price) : null;
      imagen = Array.isArray(data.image) ? data.image[0] : data.image;
      descripcion = data.description?.slice(0, 500);
      condicion = data.itemCondition?.includes('NewCondition') ? 'nuevo' : 'usado';
    } catch (e) {}
  }

  // Fallback a selectores CSS
  if (!nombre) nombre = $('h1.ui-pdp-title').text().trim() || $('h1').first().text().trim();
  if (!precioEvento) {
    const precioTexto = $('.ui-pdp-price__second-line .andes-money-amount__fraction').first().text().trim().replace(/\./g, '');
    precioEvento = precioTexto ? parseFloat(precioTexto) : null;
  }
  if (!precioOriginal) {
    const precioOriginalTexto = $('.ui-pdp-price__original-value .andes-money-amount__fraction').first().text().trim().replace(/\./g, '');
    precioOriginal = precioOriginalTexto ? parseFloat(precioOriginalTexto) : precioEvento;
  }
  if (!imagen) {
    imagen = $('figure.ui-pdp-gallery__figure img').first().attr('data-zoom') ||
             $('figure.ui-pdp-gallery__figure img').first().attr('src');
  }
  if (!descripcion) descripcion = $('.ui-pdp-description__content').text().trim().slice(0, 500) || null;
  if (!condicion) {
    const condicionTexto = $('.ui-pdp-subtitle').first().text().toLowerCase();
    condicion = condicionTexto.includes('nuevo') ? 'nuevo' : 'usado';
  }

  descuento = precioOriginal && precioEvento && precioOriginal > precioEvento
    ? Math.round((1 - precioEvento / precioOriginal) * 100)
    : 0;

  const sku = extraerItemId(url);

  if (!nombre && !precioEvento) {
    return res.status(422).json({ error: 'No se pudieron extraer datos. Verifica que la URL sea válida.' });
  }

  res.json({ nombre, descripcion, precioEvento, precioOriginal, descuento, imagen, sku, condicion });
}));

module.exports = router;
