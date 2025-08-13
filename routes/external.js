const express = require('express');
const ExternalMedicosService = require('../services/ExternalMedicosService');
const externalAuth = require('../utils/externalAuth');
const { fetchWithAuth } = require('../utils/httpClient');

const router = express.Router();

router.get('/medicos', async (req, res) => {
  try {
    const service = new ExternalMedicosService();
    const data = await service.obtenerMedicos();
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

module.exports = router;

// Diagnóstico de autenticación
router.get('/auth/status', (req, res) => {
  res.json({ success: true, auth: externalAuth.getStatus() });
});

router.post('/auth/login', async (req, res) => {
  try {
    const data = await externalAuth.login();
    res.json({ success: true, tokens: externalAuth.getStatus(), raw: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Diagnóstico de configuración efectiva usada por el backend
router.get('/config', (req, res) => {
  const service = new ExternalMedicosService();
  res.json({
    success: true,
    config: {
      baseUrl: service.baseUrl,
      medicosPath: service.medicosPath,
      especialidadesPath: service.especialidadesPath,
      authUrl: externalAuth.authUrl,
      refreshUrl: externalAuth.refreshUrl
    }
  });
});

// Proxy autenticado para probar paths externos arbitrarios
router.get('/proxy', async (req, res) => {
  try {
    const { path, method } = req.query;
    if (!path) {
      return res.status(400).json({ success: false, error: 'Falta query param "path"' });
    }
    const service = new ExternalMedicosService();
    const isAbsolute = /^https?:\/\//i.test(path);
    const base = service.baseUrl.replace(/\/$/, '');
    const rel = path.startsWith('/') ? path : `/${path}`;
    const url = isAbsolute ? path : `${base}${rel}`;

    const response = await fetchWithAuth(url, { method: (method || 'GET').toUpperCase() });
    const contentType = response.headers.get('content-type') || '';
    const raw = contentType.includes('application/json') ? await response.json() : await response.text();

    res.status(response.status).json({ success: response.ok, url, status: response.status, raw });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});



