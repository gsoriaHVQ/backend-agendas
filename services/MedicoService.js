const MedicoRepository = require('../repositories/MedicoRepository');
const { ValidationError } = require('../utils/errors');
const { apiLogger } = require('../utils/logger');

class MedicoService {
  constructor(dbConnection) {
    this.medicoRepository = new MedicoRepository(dbConnection);
  }
//validar parametros de busqueda
  _validateSearchParams(params) {
    const errors = [];
    
    if (params.especialidad && params.especialidad.trim().length < 2) {
      errors.push('La especialidad debe tener al menos 2 caracteres');
    }
    
    if (params.nombre && params.nombre.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (params.codigoItem && (isNaN(params.codigoItem) || parseInt(params.codigoItem) <= 0)) {
      errors.push('El código de item debe ser un número positivo');
    }
    
    if (errors.length > 0) {
      throw new ValidationError('Parámetros de búsqueda inválidos', errors);
    }
  }


  //GET medicos por especialidad
  async buscarPorEspecialidad(especialidad) {
    this._validateSearchParams({ especialidad });
    
    apiLogger.info('Buscando médicos por especialidad', { especialidad });
    
    const medicos = await this.medicoRepository.findByEspecialidad(especialidad);
    
    return {
      data: medicos,
      total: medicos.length,
      message: `Médicos encontrados para la especialidad: ${especialidad}`,
      criterio: { tipo: 'especialidad', valor: especialidad }
    };
  }

 //GET medicos por codigo de item
  async buscarPorCodigoItem(codigoItem) {
    this._validateSearchParams({ codigoItem });
    
    apiLogger.info('Buscando médicos por código de item', { codigoItem });
    
    const medicos = await this.medicoRepository.findByCodigoItem(codigoItem);
    
    return {
      data: medicos,
      total: medicos.length,
      message: `Médicos encontrados para el código de item: ${codigoItem}`,
      criterio: { tipo: 'codigo_item', valor: codigoItem }
    };
  }

  //GET medicos por nombre
  async buscarPorNombre(nombre) {
    this._validateSearchParams({ nombre });
    
    apiLogger.info('Buscando médicos por nombre', { nombre });
    
    const medicos = await this.medicoRepository.findByNombre(nombre);
    
    return {
      data: medicos,
      total: medicos.length,
      message: `Médicos encontrados con el nombre: ${nombre}`,
      criterio: { tipo: 'nombre', valor: nombre }
    };
  }


  
  async obtenerEstadisticas() {
    try {
      apiLogger.info('Generando estadísticas de médicos');
      
      const [medicos, especialidades] = await Promise.all([
        this.medicoRepository.findAll(),
        this.medicoRepository.findEspecialidades()
      ]);
      
      // Contar médicos por especialidad
      const medicossPorEspecialidad = medicos.reduce((acc, medico) => {
        const especialidad = medico.descripcion_agendamiento;
        acc[especialidad] = (acc[especialidad] || 0) + 1;
        return acc;
      }, {});
      
      // Médicos únicos (eliminar duplicados por código de prestador)
      const medicosUnicos = new Set(medicos.map(m => m.codigo_prestador));
      
      return {
        total_medicos: medicosUnicos.size,
        total_especialidades: especialidades.length,
        total_combinaciones: medicos.length,
        medicos_por_especialidad: medicossPorEspecialidad,
        especialidades_disponibles: especialidades.map(e => e.nombre_especialidad)
      };
      
    } catch (error) {
      apiLogger.error('Error al generar estadísticas', { error: error.message });
      throw error;
    }
  }
}

module.exports = MedicoService;
