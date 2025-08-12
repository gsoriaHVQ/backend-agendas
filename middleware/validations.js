//Validaciones de los datos de las agendas

const { ValidationError } = require('../utils/errors');
const { apiLogger } = require('../utils/logger');


const validateAgenda = (req, res, next) => {
  try {
    const { codigo_prestador, fecha, hora, estado } = req.body;
    const errors = [];

    // Código de prestador
    if (!codigo_prestador) {
      errors.push('El código del prestador es requerido');
    } else if (isNaN(codigo_prestador) || parseInt(codigo_prestador) <= 0) {
      errors.push('El código del prestador debe ser un número positivo');
    }

    // Fecha
    if (!fecha) {
      errors.push('La fecha es requerida');
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(fecha)) {
        errors.push('La fecha debe tener el formato YYYY-MM-DD');
      } else {
        const fechaAgenda = new Date(fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fechaAgenda < hoy) {
          errors.push('La fecha no puede ser en el pasado');
        }
      }
    }

    // Hora
    if (!hora) {
      errors.push('La hora es requerida');
    } else {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(hora)) {
        errors.push('La hora debe tener el formato HH:MM');
      }
    }

    // Estado 
    if (estado && !['DISPONIBLE', 'OCUPADO', 'CANCELADO'].includes(estado)) {
      errors.push('El estado debe ser: DISPONIBLE, OCUPADO o CANCELADO');
    }

    if (errors.length > 0) {
      apiLogger.warn('Validación de agenda fallida', { errors, body: req.body });
      return res.status(400).json({
        success: false,
        error: 'Datos de agenda inválidos',
        errors: errors
      });
    }

    next();
  } catch (error) {
    apiLogger.error('Error en validación de agenda', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error interno en validación'
    });
  }
};

//PATCH para actualizar una agenda
const validateAgendaUpdate = (req, res, next) => {
  try {
    const { codigo_prestador, fecha, hora, estado } = req.body;
    const errors = [];

    // Verificar que al menos un campo esté presente
    if (!codigo_prestador && !fecha && !hora && !estado) {
      errors.push('Al menos un campo debe ser proporcionado para actualizar');
    }

    
    if (codigo_prestador && (isNaN(codigo_prestador) || parseInt(codigo_prestador) <= 0)) {
      errors.push('El código del prestador debe ser un número positivo');
    }

    if (fecha) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(fecha)) {
        errors.push('La fecha debe tener el formato YYYY-MM-DD');
      }
    }

    if (hora) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(hora)) {
        errors.push('La hora debe tener el formato HH:MM');
      }
    }

    if (estado && !['DISPONIBLE', 'OCUPADO', 'CANCELADO'].includes(estado)) {
      errors.push('El estado debe ser: DISPONIBLE, OCUPADO o CANCELADO');
    }

    if (errors.length > 0) {
      apiLogger.warn('Validación de actualización fallida', { errors, body: req.body });
      return res.status(400).json({
        success: false,
        error: 'Datos de actualización inválidos',
        errors: errors
      });
    }

    next();
  } catch (error) {
    apiLogger.error('Error en validación de actualización', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error interno en validación'
    });
  }
};

//Validacion de id
const validateId = (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id) || parseInt(id) <= 0) {
      apiLogger.warn('ID inválido proporcionado', { id });
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'El ID debe ser un número positivo'
      });
    }

    //Convertir a número para uso posterior
    req.params.id = parseInt(id);
    next();
  } catch (error) {
    apiLogger.error('Error en validación de ID', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error interno en validación'
    });
  }
};

//Validacion de codigo de prestador
const validateCodigoPrestador = (req, res, next) => {
  try {
    const { codigo_prestador } = req.params;

    if (!codigo_prestador || isNaN(codigo_prestador) || parseInt(codigo_prestador) <= 0) {
      apiLogger.warn('Código de prestador inválido', { codigo_prestador });
      return res.status(400).json({
        success: false,
        error: 'Código de prestador inválido',
        message: 'El código del prestador debe ser un número positivo'
      });
    }

    // Convertir a número para uso posterior
    req.params.codigo_prestador = parseInt(codigo_prestador);
    next();
  } catch (error) {
    apiLogger.error('Error en validación de código de prestador', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error interno en validación'
    });
  }
};

//Parametros de busqueda de medicos
const validateEspecialidad = (req, res, next) => {
  try {
    const { especialidad } = req.params;

    if (!especialidad || especialidad.trim().length < 2) {
      apiLogger.warn('Especialidad inválida', { especialidad });
      return res.status(400).json({
        success: false,
        error: 'Especialidad inválida',
        message: 'La especialidad debe tener al menos 2 caracteres'
      });
    }

    req.params.especialidad = especialidad.trim();
    next();
  } catch (error) {
    apiLogger.error('Error en validación de especialidad', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error interno en validación'
    });
  }
};

//Validacion de nombre de medico
const validateNombre = (req, res, next) => {
  try {
    const { nombre } = req.params;

    if (!nombre || nombre.trim().length < 2) {
      apiLogger.warn('Nombre inválido', { nombre });
      return res.status(400).json({
        success: false,
        error: 'Nombre inválido',
        message: 'El nombre debe tener al menos 2 caracteres'
      });
    }

  
    req.params.nombre = nombre.trim();
    next();
  } catch (error) {
    apiLogger.error('Error en validación de nombre', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error interno en validación'
    });
  }
};

//Validacion de codigo de item de agendamiento
const validateCodigoItem = (req, res, next) => {
  try {
    const { codigo_item } = req.params;

    if (!codigo_item || isNaN(codigo_item) || parseInt(codigo_item) <= 0) {
      apiLogger.warn('Código de item inválido', { codigo_item });
      return res.status(400).json({
        success: false,
        error: 'Código de item inválido',
        message: 'El código de item debe ser un número positivo'
      });
    }

    // Convertir a número para uso posterior
    req.params.codigo_item = parseInt(codigo_item);
    next();
  } catch (error) {
    apiLogger.error('Error en validación de código de item', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Error interno en validación'
    });
  }
};

module.exports = {
  validateAgenda,
  validateAgendaUpdate,
  validateId,
  validateCodigoPrestador,
  validateEspecialidad,
  validateNombre,
  validateCodigoItem
};
