const express = require('express');
const router = express.Router();
const axios = require('axios');
const cheerio = require('cheerio');
const { authMiddleware } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// Intentar extraer el item ID de la URL y usar la API pública de ML
const extraerItemId = (url) => {
  const match = url.match(/MLC-?(\d+)/i);
  return match ? `MLC${match[1]}` : null;
};

// POST /api/scraper/mercadolibre
router.post('/mercadolibre', authMiddleware, asyncHandler(async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL requerida' });

  const esMercadoLibre = url.includes('mercadolibre.cl') || url.includes('mercadolibre.com') || url.includes('meli.com');
  if (!esMercadoLibre) return res.status(400).json({ error: 'Solo se aceptan URLs de MercadoLibre' });

  // Intentar primero con la API pública de ML (sin auth)
  const itemId = extraerItemId(url);
  if (itemId) {
    try {
      const [itemRes, descRes] = await Promise.allSettled([
        axios.get(`https://api.mercadolibre.com/items/${itemId}`, { timeout: 8000 }),
        axios.get(`https://api.mercadolibre.com/items/${itemId}/description`, { timeout: 8000 }),
      ]);

      if (itemRes.status === 'fulfilled') {
        const item = itemRes.value.data;
        const descripcion = descRes.status === 'fulfilled' ? descRes.value.data.plain_text?.slice(0, 500) : null;
        const imagen = item.pictures?.[0]?.url || item.thumbnail;
        const precioOriginal = item.original_price || item.price;
        const precioEvento = item.price;
        const descuento = precioOriginal > precioEvento
          ? Math.round((1 - precioEvento / precioOriginal) * 100)
          : 0;

        return res.json({
          nombre: item.title,
          descripcion,
          precioOriginal,
          precioEvento,
          descuento,
          imagen,
          sku: item.id,
          condicion: item.condition === 'new' ? 'nuevo' : 'usado',
        });
      }
    } catch (e) {
      console.error('API ML falló, intentando scraping:', e.message);
    }
  }

  // Fallback: scraping con headers de browser
  const { data: html } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
    },
    timeout: 12000,
  });

  const $ = cheerio.load(html);

  const nombre = $('h1.ui-pdp-title').text().trim() || $('h1').first().text().trim();
  const precioTexto = $('.ui-pdp-price__second-line .andes-money-amount__fraction').first().text().trim().replace(/\./g, '');
  const precioEvento = precioTexto ? parseFloat(precioTexto) : null;
  const precioOriginalTexto = $('.ui-pdp-price__original-value .andes-money-amount__fraction').first().text().trim().replace(/\./g, '');
  const precioOriginal = precioOriginalTexto ? parseFloat(precioOriginalTexto) : precioEvento;
  const descuentoTexto = $('.ui-pdp-price__discount').first().text().trim().replace(/[^0-9]/g, '');
  const descuento = descuentoTexto ? parseFloat(descuentoTexto) : (precioOriginal && precioEvento ? Math.round((1 - precioEvento / precioOriginal) * 100) : 0);
  const imagen = $('figure.ui-pdp-gallery__figure img').first().attr('data-zoom') || $('figure.ui-pdp-gallery__figure img').first().attr('src');
  const descripcion = $('.ui-pdp-description__content').text().trim().slice(0, 500) || null;
  const sku = url.match(/MLC-?(\d+)/i)?.[0]?.replace('-', '') || null;
  const condicionTexto = $('.ui-pdp-subtitle').first().text().toLowerCase();
  const condicion = condicionTexto.includes('nuevo') ? 'nuevo' : 'usado';

  if (!nombre && !precioEvento) {
    return res.status(422).json({ error: 'No se pudieron extraer datos. Verifica que la URL sea de un producto válido.' });
  }

  res.json({ nombre, descripcion, precioEvento, precioOriginal, descuento, imagen, sku, condicion });
}));

module.exports = router;
