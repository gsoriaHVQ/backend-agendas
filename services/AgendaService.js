const AgendaRepository = require('../repositories/AgendaRepository');
const { ValidationError, ConflictError } = require('../utils/errors');
const { apiLogger } = require('../utils/logger');

class AgendaService {
  constructor(dbConnection) {
    this.agendaRepository = new AgendaRepository(dbConnection);
  }

  /**
   * Valida los datos de una agenda
   */
  _validateAgendaData(data, isUpdate = false) {
    const errors = [];
    
    // Validaciones obligatorias para creación
    if (!isUpdate) {
      if (!data.codigo_prestador) {
        errors.push('El código del prestador es requerido');
      }
      if (!data.fecha) {
        errors.push('La fecha es requerida');
      }
      if (!data.hora) {
        errors.push('La hora es requerida');
      }
    }
    
    // Validaciones de formato
    if (data.fecha) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.fecha)) {
        errors.push('La fecha debe tener el formato YYYY-MM-DD');
      } else {
        // Validar que la fecha no sea en el pasado
        const fechaAgenda = new Date(data.fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fechaAgenda < hoy) {
          errors.push('La fecha no puede ser en el pasado');
        }
      }
    }
    
    if (data.hora) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(data.hora)) {
        errors.push('La hora debe tener el formato HH:MM');
      } else {
        // Validar horario de trabajo (8:00 - 18:00)
        const [horas, minutos] = data.hora.split(':').map(Number);
        const horaDecimal = horas + minutos / 60;
        
        if (horaDecimal < 8 || horaDecimal >= 18) {
          errors.push('La hora debe estar entre 08:00 y 17:59');
        }
      }
    }
    
    if (data.estado && !['DISPONIBLE', 'OCUPADO', 'CANCELADO'].includes(data.estado)) {
      errors.push('El estado debe ser: DISPONIBLE, OCUPADO o CANCELADO');
    }
    
    if (data.codigo_prestador && (isNaN(data.codigo_prestador) || parseInt(data.codigo_prestador) <= 0)) {
      errors.push('El código del prestador debe ser un número positivo');
    }
    
    if (errors.length > 0) {
      throw new ValidationError('Datos de agenda inválidos', errors);
    }
  }

  /**
   * Valida que no exista conflicto de horario
   */
  async _validateHorarioConflict(codigoPrestador, fecha, hora, excludeId = null) {
    try {
      const agendasPrestador = await this.agendaRepository.findByPrestador(codigoPrestador);
      
      const conflicto = agendasPrestador.find(agenda => 
        agenda.fecha === fecha && 
        agenda.hora === hora && 
        agenda.estado !== 'CANCELADO' &&
        (excludeId ? agenda.id_agenda !== excludeId : true)
      );
      
      if (conflicto) {
        throw new ConflictError(
          `Ya existe una agenda para el prestador ${codigoPrestador} el ${fecha} a las ${hora}`
        );
      }
      
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }
      // Si hay error consultando, continuar (no bloquear por problemas de BD)
      apiLogger.warn('Error validando conflicto de horario', { error: error.message });
    }
  }

  /**
   * Obtiene todas las agendas
   */
  async obtenerTodasAgendas() {
    apiLogger.info('Obteniendo todas las agendas');
    
    const agendas = await this.agendaRepository.findAll();
    
    return {
      data: agendas,
      total: agendas.length,
      message: 'Agendas obtenidas correctamente'
    };
  }

  /**
   * Obtiene una agenda por ID
   */
  async obtenerAgendaPorId(id) {
    // Validar ID
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      throw new ValidationError('ID de agenda inválido');
    }
    
    apiLogger.info('Obteniendo agenda por ID', { id });
    
    const agenda = await this.agendaRepository.findById(parseInt(id));
    
    return {
      data: agenda,
      message: 'Agenda obtenida correctamente'
    };
  }

  /**
   * Crea una nueva agenda
   */
  async crearAgenda(agendaData) {
    this._validateAgendaData(agendaData);
    
    // Validar conflicto de horario
    await this._validateHorarioConflict(
      agendaData.codigo_prestador, 
      agendaData.fecha, 
      agendaData.hora
    );
    
    apiLogger.info('Creando nueva agenda', agendaData);
    
    const nuevaAgenda = await this.agendaRepository.create(agendaData);
    
    return {
      data: nuevaAgenda,
      message: 'Agenda creada correctamente'
    };
  }

  /**
   * Actualiza una agenda existente
   */
  async actualizarAgenda(id, updateData) {
    // Validar ID
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      throw new ValidationError('ID de agenda inválido');
    }
    
    this._validateAgendaData(updateData, true);
    
    // Si se actualiza fecha u hora, validar conflicto
    if (updateData.fecha || updateData.hora) {
      const agendaActual = await this.agendaRepository.findById(parseInt(id));
      
      const nuevaFecha = updateData.fecha || agendaActual.fecha;
      const nuevaHora = updateData.hora || agendaActual.hora;
      const prestador = updateData.codigo_prestador || agendaActual.codigo_prestador;
      
      await this._validateHorarioConflict(prestador, nuevaFecha, nuevaHora, parseInt(id));
    }
    
    apiLogger.info('Actualizando agenda', { id, updateData });
    
    await this.agendaRepository.update(parseInt(id), updateData);
    
    return {
      message: 'Agenda actualizada correctamente'
    };
  }

  /**
   * Elimina una agenda
   */
  async eliminarAgenda(id) {
    // Validar ID
    if (!id || isNaN(id) || parseInt(id) <= 0) {
      throw new ValidationError('ID de agenda inválido');
    }
    
    apiLogger.info('Eliminando agenda', { id });
    
    await this.agendaRepository.delete(parseInt(id));
    
    return {
      message: 'Agenda eliminada correctamente'
    };
  }

  /**
   * Obtiene agendas por prestador
   */
  async obtenerAgendasPorPrestador(codigoPrestador) {
    // Validar código de prestador
    if (!codigoPrestador || isNaN(codigoPrestador) || parseInt(codigoPrestador) <= 0) {
      throw new ValidationError('Código de prestador inválido');
    }
    
    apiLogger.info('Obteniendo agendas por prestador', { codigoPrestador });
    
    const agendas = await this.agendaRepository.findByPrestador(parseInt(codigoPrestador));
    
    return {
      data: agendas,
      total: agendas.length,
      message: `Agendas del prestador ${codigoPrestador} obtenidas correctamente`
    };
  }

  /**
   * Obtiene estadísticas de agendas
   */
  async obtenerEstadisticas() {
    apiLogger.info('Generando estadísticas de agendas');
    
    const agendas = await this.agendaRepository.findAll();
    
    // Estadísticas por estado
    const porEstado = agendas.reduce((acc, agenda) => {
      acc[agenda.estado] = (acc[agenda.estado] || 0) + 1;
      return acc;
    }, {});
    
    // Estadísticas por prestador
    const porPrestador = agendas.reduce((acc, agenda) => {
      const key = `${agenda.codigo_prestador} - ${agenda.nombre_prestador}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    // Agendas por fecha
    const porFecha = agendas.reduce((acc, agenda) => {
      acc[agenda.fecha] = (acc[agenda.fecha] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total_agendas: agendas.length,
      por_estado: porEstado,
      por_prestador: porPrestador,
      por_fecha: porFecha,
      prestadores_unicos: new Set(agendas.map(a => a.codigo_prestador)).size
    };
  }

  /**
   * Cancela una agenda (cambia estado a CANCELADO)
   */
  async cancelarAgenda(id, motivo = null) {
    apiLogger.info('Cancelando agenda', { id, motivo });
    
    await this.actualizarAgenda(id, { 
      estado: 'CANCELADO' 
    });
    
    return {
      message: `Agenda cancelada correctamente${motivo ? `. Motivo: ${motivo}` : ''}`
    };
  }
}

module.exports = AgendaService;
