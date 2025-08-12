const express = require('express');
const router = express.Router();

const {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar
} = require('../controllers/agendaCustomController');

const { validateId } = require('../middleware/validations');

// CRUD de agendas
router.get('/', listar);
router.get('/:id', validateId, obtener);
router.post('/', crear);
router.put('/:id', validateId, actualizar);
router.delete('/:id', validateId, eliminar);

module.exports = router;


