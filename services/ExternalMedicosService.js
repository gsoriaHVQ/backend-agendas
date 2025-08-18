const { fetchWithAuth } = require('../utils/httpClient');
const { apiLogger } = require('../utils/logger');

class ExternalMedicosService {
  constructor() {
    this.baseUrl = process.env.EXTERNAL_API_BASE_URL || 'http://10.129.180.161:36560/api3/v1';
    this.medicosPath = process.env.EXTERNAL_MEDICOS_ENDPOINT || '/medico';
    // Forzar endpoint oficial de especialidades
    this.especialidadesPath = '/especialidades/agenda';
  }

  async obtenerMedicos(options = {}) {
    const urlBase = `${this.baseUrl}${this.medicosPath}`;
    const url = new URL(urlBase);
    const situationType = options.situationType || 'ACTIVE';
    if (situationType) url.searchParams.set('situationType', situationType);
    apiLogger.info('Llamando API externa de Médicos', { url });
    const res = await fetchWithAuth(url, { method: 'GET' });
    if (!res.ok) {
      let reason = '';
      try { reason = await res.text(); } catch (_) {}
      throw new Error(`Error al obtener médicos externos: ${res.status} | url=${url.toString()} | ${reason}`);
    }
    const data = await res.json();
    return data;
  }

  async obtenerEspecialidades() {
    const url = `${this.baseUrl}${this.especialidadesPath}`;
    apiLogger.info('Llamando API externa de Especialidades', { url });
    const res = await fetchWithAuth(url, { method: 'GET' });
    if (!res.ok) {
      let reason = '';
      try { reason = await res.text(); } catch (_) {}
      throw new Error(`Error al obtener especialidades externas: ${res.status} | url=${url} | ${reason}`);
    }
    const data = await res.json();
    // Normalizar salida al esquema requerido
    // { especialidadId, descripcion, tipo, icono }
    if (Array.isArray(data)) {
      return data.map((item) => this._mapEspecialidad(item));
    }
    if (data && typeof data === 'object') {
      return this._mapEspecialidad(data);
    }
    return data;
  }

  _mapEspecialidad(item) {
    return {
      especialidadId: item.especialidadId ?? item.id ?? item.codigo ?? item.code ?? null,
      descripcion: item.descripcion ?? item.nombre ?? item.name ?? item.description ?? '',
      tipo: item.tipo ?? item.type ?? null,
      icono: item.icono ?? item.icon ?? null
    };
  }

  // Filtrar médicos por especialidad desde API externa
  async buscarMedicosPorEspecialidad(especialidad, options = {}) {
    const medicos = await this.obtenerMedicos(options);
    if (!Array.isArray(medicos)) {
      throw new Error('Respuesta de API externa no es un array válido');
    }
    
    // Filtrar por especialidad (buscar en múltiples campos posibles)
    const medicosFiltered = medicos.filter(medico => {
      const campos = [
        medico.especialidad,
        medico.especialidadNombre,
        medico.descripcion_agendamiento,
        medico.descripcionEspecialidad,
        medico.specialty
      ];
      
      return campos.some(campo => 
        campo && campo.toString().toLowerCase().includes(especialidad.toLowerCase())
      );
    });
    
    return medicosFiltered;
  }

  // Filtrar médicos por código de item desde API externa
  async buscarMedicosPorCodigoItem(codigoItem, options = {}) {
    const medicos = await this.obtenerMedicos(options);
    if (!Array.isArray(medicos)) {
      throw new Error('Respuesta de API externa no es un array válido');
    }
    
    // Filtrar por código de item
    const medicosFiltered = medicos.filter(medico => {
      const campos = [
        medico.codigoItem,
        medico.codigo_item,
        medico.cd_item_agendamento,
        medico.codigoItemAgendamiento,
        medico.itemCode
      ];
      
      return campos.some(campo => 
        campo && campo.toString() === codigoItem.toString()
      );
    });
    
    return medicosFiltered;
  }

  // Filtrar médicos por nombre desde API externa
  async buscarMedicosPorNombre(nombre, options = {}) {
    const medicos = await this.obtenerMedicos(options);
    if (!Array.isArray(medicos)) {
      throw new Error('Respuesta de API externa no es un array válido');
    }
    
    // Filtrar por nombre (buscar en múltiples campos posibles)
    const medicosFiltered = medicos.filter(medico => {
      const campos = [
        medico.nombre,
        medico.nombreMedico,
        medico.nm_prestador,
        medico.nombrePrestador,
        medico.name,
        medico.fullName
      ];
      
      return campos.some(campo => 
        campo && campo.toString().toLowerCase().includes(nombre.toLowerCase())
      );
    });
    
    return medicosFiltered;
  }

  // Generar estadísticas desde API externa
  async obtenerEstadisticasMedicos(options = {}) {
    const medicos = await this.obtenerMedicos(options);
    const especialidades = await this.obtenerEspecialidades();
    
    if (!Array.isArray(medicos)) {
      throw new Error('Respuesta de médicos de API externa no es un array válido');
    }
    
    if (!Array.isArray(especialidades)) {
      throw new Error('Respuesta de especialidades de API externa no es un array válido');
    }
    
    // Contar médicos por especialidad
    const medicossPorEspecialidad = medicos.reduce((acc, medico) => {
      const especialidad = medico.especialidad || 
                          medico.especialidadNombre || 
                          medico.descripcion_agendamiento || 
                          medico.descripcionEspecialidad || 
                          'Sin especialidad';
      acc[especialidad] = (acc[especialidad] || 0) + 1;
      return acc;
    }, {});
    
    // Médicos únicos (eliminar duplicados por código de prestador)
    const codigosPrestadores = medicos.map(m => 
      m.codigoPrestador || 
      m.codigo_prestador || 
      m.cd_prestador || 
      m.providerId || 
      m.id
    ).filter(Boolean);
    
    const medicosUnicos = new Set(codigosPrestadores);
    
    return {
      total_medicos: medicosUnicos.size,
      total_especialidades: especialidades.length,
      total_combinaciones: medicos.length,
      medicos_por_especialidad: medicossPorEspecialidad,
      especialidades_disponibles: especialidades.map(e => e.descripcion || e.nombre || e.name || e.description)
    };
  }
}

module.exports = ExternalMedicosService;


