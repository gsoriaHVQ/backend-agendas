const express = require('express');
const router = express.Router();
const { 
  getAgendas, 
  getAgendaById,
  createAgenda, 
  updateAgenda, 
  deleteAgenda,
  getAgendasByPrestador 
} = require('../controllers/agendasController');

const {
  validateAgenda,
  validateAgendaUpdate,
  validateId,
  validateCodigoPrestador
} = require('../middleware/validations');

// GET /agendas - Obtener todas las agendas
router.get('/', getAgendas);

// GET /agendas/:id - Obtener agenda por ID
router.get('/:id', validateId, getAgendaById);

// GET /agendas/prestador/:codigo_prestador - Obtener agendas por prestador
router.get('/prestador/:codigo_prestador', validateCodigoPrestador, getAgendasByPrestador);

// POST /agendas - Crear nueva agenda
router.post('/', validateAgenda, createAgenda);

// PUT /agendas/:id - Actualizar agenda existente
router.put('/:id', validateId, validateAgendaUpdate, updateAgenda);

// DELETE /agendas/:id - Eliminar agenda
router.delete('/:id', validateId, deleteAgenda);

module.exports = router; 