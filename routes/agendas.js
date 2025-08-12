const express = require('express');
const router = express.Router();
const { 
  getAgendas, 
  getAgendaById,
  createAgenda, 
  updateAgenda, 
  deleteAgenda,
  getAgendasByPrestador,
  getEstadisticasAgendas,
  cancelarAgenda
} = require('../controllers/agendasController');

const {
  validateAgenda,
  validateAgendaUpdate,
  validateId,
  validateCodigoPrestador
} = require('../middleware/validations');

// GET /api/agendas - Obtener todas las agendas
router.get('/', getAgendas);

// GET /api/agendas/estadisticas - Obtener estadísticas de agendas
router.get('/estadisticas', getEstadisticasAgendas);

// GET /api/agendas/prestador/:codigo_prestador - Obtener agendas por prestador
router.get('/prestador/:codigo_prestador', validateCodigoPrestador, getAgendasByPrestador);

// GET /api/agendas/:id - Obtener agenda por ID
router.get('/:id', validateId, getAgendaById);

// POST /api/agendas - Crear nueva agenda
router.post('/', validateAgenda, createAgenda);

// PUT /api/agendas/:id - Actualizar agenda existente
router.put('/:id', validateId, validateAgendaUpdate, updateAgenda);

// PUT /api/agendas/:id/cancelar - Cancelar agenda
router.put('/:id/cancelar', validateId, cancelarAgenda);

// DELETE /api/agendas/:id - Eliminar agenda
router.delete('/:id', validateId, deleteAgenda);

module.exports = router; 