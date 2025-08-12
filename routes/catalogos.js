const express = require('express');
const router = express.Router();

const {
  getConsultorios,
  getDias,
  getEdificios,
  getPisosPorEdificio
} = require('../controllers/catalogosController');

// Rutas de catálogos
router.get('/consultorios', getConsultorios);
router.get('/dias', getDias);
router.get('/edificios', getEdificios);
router.get('/edificios/:codigo_edificio/pisos', getPisosPorEdificio);

module.exports = router;


