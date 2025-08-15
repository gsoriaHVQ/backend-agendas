// Configuración para el Frontend - API de Agendas (Servidor SML)
// frontend-config-production.js

const API_CONFIG = {
  // URLs base - Configuración para servidor SML
  BASE_URL: process.env.REACT_APP_API_URL || 'http://10.129.180.151:3001',
  DEVELOPMENT_URL: 'http://localhost:3001',
  PRODUCTION_URL: 'http://10.129.180.151:3001',
  
  // Timeouts
  TIMEOUT: 30000, // 30 segundos
  
  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },

  // Función para obtener la URL correcta según el entorno
  getBaseURL() {
    // Si estamos en el navegador
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // Si es localhost, usar desarrollo
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return this.DEVELOPMENT_URL;
      }
      
      // Si es el servidor SML, usar producción
      if (hostname === '10.129.180.151') {
        return this.PRODUCTION_URL;
      }
    }
    
    // Fallback a variable de entorno o desarrollo
    return process.env.REACT_APP_API_URL || this.DEVELOPMENT_URL;
  }
};

// Clase para manejar las llamadas a la API
class AgendaAPI {
  constructor(baseURL = null) {
    this.baseURL = baseURL || API_CONFIG.getBaseURL();
  }

  // Método helper para hacer requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...options.headers
      },
      timeout: API_CONFIG.TIMEOUT,
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // ===== ENDPOINTS DE INFORMACIÓN =====
  
  // Obtener información de la API
  async getApiInfo() {
    return this.request('/');
  }

  // Health check
  async getHealth() {
    return this.request('/health');
  }

  // ===== ENDPOINTS DE MÉDICOS =====
  
  // Obtener todos los médicos
  async getMedicos() {
    return this.request('/medicos');
  }

  // Obtener especialidades
  async getEspecialidades() {
    return this.request('/especialidades');
  }

  // Médicos por especialidad
  async getMedicosByEspecialidad(especialidad) {
    return this.request(`/medicos/especialidad/${encodeURIComponent(especialidad)}`);
  }

  // Médicos por código de item
  async getMedicosByItem(codigoItem) {
    return this.request(`/medicos/item/${encodeURIComponent(codigoItem)}`);
  }

  // Médicos por nombre
  async getMedicosByNombre(nombre) {
    return this.request(`/medicos/nombre/${encodeURIComponent(nombre)}`);
  }

  // Estadísticas de médicos
  async getEstadisticasMedicos() {
    return this.request('/api/medicos/estadisticas');
  }

  // ===== ENDPOINTS DE AGENDAS =====
  
  // Obtener todas las agendas con filtros opcionales
  async getAgendas(filtros = {}) {
    const params = new URLSearchParams();
    
    if (filtros.page) params.append('page', filtros.page);
    if (filtros.limit) params.append('limit', filtros.limit);
    if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
    if (filtros.estado) params.append('estado', filtros.estado);
    
    const queryString = params.toString();
    const endpoint = queryString ? `/api/agendas?${queryString}` : '/api/agendas';
    
    return this.request(endpoint);
  }

  // Obtener agenda por ID
  async getAgendaById(id) {
    return this.request(`/api/agendas/${id}`);
  }

  // Agendas por prestador
  async getAgendasByPrestador(codigoPrestador) {
    return this.request(`/api/agendas/prestador/${encodeURIComponent(codigoPrestador)}`);
  }

  // Crear nueva agenda
  async createAgenda(agendaData) {
    return this.request('/api/agendas', {
      method: 'POST',
      body: JSON.stringify(agendaData)
    });
  }

  // Actualizar agenda
  async updateAgenda(id, agendaData) {
    return this.request(`/api/agendas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agendaData)
    });
  }

  // Cancelar agenda
  async cancelarAgenda(id) {
    return this.request(`/api/agendas/${id}/cancelar`, {
      method: 'PUT'
    });
  }

  // Eliminar agenda
  async deleteAgenda(id) {
    return this.request(`/api/agendas/${id}`, {
      method: 'DELETE'
    });
  }

  // Estadísticas de agendas
  async getEstadisticasAgendas() {
    return this.request('/api/agendas/estadisticas');
  }

  // ===== ENDPOINTS DE CATÁLOGOS =====
  
  // Obtener consultorios
  async getConsultorios() {
    return this.request('/api/catalogos/consultorios');
  }

  // Obtener días
  async getDias() {
    return this.request('/api/catalogos/dias');
  }

  // Obtener edificios
  async getEdificios() {
    return this.request('/api/catalogos/edificios');
  }

  // Obtener pisos por edificio
  async getPisosPorEdificio(codigoEdificio) {
    return this.request(`/api/catalogos/edificios/${encodeURIComponent(codigoEdificio)}/pisos`);
  }

  // ===== ENDPOINTS DE AGENDA PERSONALIZADA =====
  
  // Listar agendas personalizadas
  async getAgendasPersonalizadas() {
    return this.request('/api/agnd-agenda');
  }

  // Obtener agenda personalizada por ID
  async getAgendaPersonalizadaById(id) {
    return this.request(`/api/agnd-agenda/${id}`);
  }

  // Crear agenda personalizada
  async createAgendaPersonalizada(agendaData) {
    return this.request('/api/agnd-agenda', {
      method: 'POST',
      body: JSON.stringify(agendaData)
    });
  }

  // Actualizar agenda personalizada
  async updateAgendaPersonalizada(id, agendaData) {
    return this.request(`/api/agnd-agenda/${id}`, {
      method: 'PUT',
      body: JSON.stringify(agendaData)
    });
  }

  // Eliminar agenda personalizada
  async deleteAgendaPersonalizada(id) {
    return this.request(`/api/agnd-agenda/${id}`, {
      method: 'DELETE'
    });
  }

  // ===== ENDPOINTS DE SERVICIOS EXTERNOS =====
  
  // Obtener médicos externos
  async getMedicosExternos() {
    return this.request('/api/external/medicos');
  }

  // Estado de autenticación externa
  async getAuthStatus() {
    return this.request('/api/external/auth/status');
  }

  // Configuración de servicios externos
  async getExternalConfig() {
    return this.request('/api/external/config');
  }
}

// ===== EJEMPLOS DE USO =====

// Ejemplo 1: Obtener médicos y especialidades
async function ejemploObtenerMedicos() {
  const api = new AgendaAPI();
  
  try {
    // Obtener especialidades
    const especialidades = await api.getEspecialidades();
    console.log('Especialidades:', especialidades.data);
    
    // Obtener médicos de cardiología
    const medicosCardio = await api.getMedicosByEspecialidad('CARDIOLOGIA');
    console.log('Médicos cardiología:', medicosCardio.data);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejemplo 2: Gestión de agendas
async function ejemploGestionAgendas() {
  const api = new AgendaAPI();
  
  try {
    // Obtener agendas del día
    const agendas = await api.getAgendas({
      fecha_inicio: '2024-01-15',
      fecha_fin: '2024-01-15',
      estado: 'ACTIVA'
    });
    console.log('Agendas del día:', agendas.data);
    
    // Crear nueva agenda
    const nuevaAgenda = await api.createAgenda({
      codigo_prestador: '12345',
      fecha: '2024-01-20',
      hora_inicio: '14:00',
      hora_fin: '15:00',
      consultorio: 'A-101',
      paciente: 'María García',
      observaciones: 'Consulta de seguimiento'
    });
    console.log('Agenda creada:', nuevaAgenda.data);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejemplo 3: Obtener catálogos
async function ejemploCatalogos() {
  const api = new AgendaAPI();
  
  try {
    // Obtener consultorios
    const consultorios = await api.getConsultorios();
    console.log('Consultorios:', consultorios.data);
    
    // Obtener edificios
    const edificios = await api.getEdificios();
    console.log('Edificios:', edificios.data);
    
    // Obtener pisos del edificio A
    const pisos = await api.getPisosPorEdificio('A');
    console.log('Pisos edificio A:', pisos.data);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejemplo 4: Gestión de agenda personalizada
async function ejemploAgendaPersonalizada() {
  const api = new AgendaAPI();
  
  try {
    // Crear agenda personalizada
    const agendaPersonal = await api.createAgendaPersonalizada({
      titulo: 'Reunión de equipo',
      descripcion: 'Reunión semanal del equipo médico',
      fecha: '2024-01-20',
      hora_inicio: '08:00',
      hora_fin: '09:00',
      tipo: 'REUNION',
      participantes: ['Dr. Juan', 'Dr. María']
    });
    console.log('Agenda personalizada creada:', agendaPersonal.data);
    
    // Listar agendas personalizadas
    const agendas = await api.getAgendasPersonalizadas();
    console.log('Agendas personalizadas:', agendas.data);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejemplo 5: Manejo de errores
async function ejemploManejoErrores() {
  const api = new AgendaAPI();
  
  try {
    // Intentar obtener una agenda que no existe
    await api.getAgendaById(999999);
  } catch (error) {
    if (error.message.includes('404')) {
      console.log('Agenda no encontrada');
    } else {
      console.error('Error inesperado:', error);
    }
  }
}

// ===== HOOKS PARA REACT (si usas React) =====

// Hook personalizado para usar la API en React
function useAgendaAPI() {
  const api = new AgendaAPI();
  
  return {
    // Médicos
    getMedicos: () => api.getMedicos(),
    getEspecialidades: () => api.getEspecialidades(),
    getMedicosByEspecialidad: (especialidad) => api.getMedicosByEspecialidad(especialidad),
    
    // Agendas
    getAgendas: (filtros) => api.getAgendas(filtros),
    createAgenda: (data) => api.createAgenda(data),
    updateAgenda: (id, data) => api.updateAgenda(id, data),
    cancelarAgenda: (id) => api.cancelarAgenda(id),
    deleteAgenda: (id) => api.deleteAgenda(id),
    
    // Catálogos
    getConsultorios: () => api.getConsultorios(),
    getEdificios: () => api.getEdificios(),
    getPisosPorEdificio: (codigo) => api.getPisosPorEdificio(codigo),
    
    // Agenda personalizada
    getAgendasPersonalizadas: () => api.getAgendasPersonalizadas(),
    createAgendaPersonalizada: (data) => api.createAgendaPersonalizada(data),
    
    // Utilidades
    getHealth: () => api.getHealth(),
    getApiInfo: () => api.getApiInfo()
  };
}

// Exportar para uso en otros archivos
export {
  AgendaAPI,
  API_CONFIG,
  useAgendaAPI,
  ejemploObtenerMedicos,
  ejemploGestionAgendas,
  ejemploCatalogos,
  ejemploAgendaPersonalizada,
  ejemploManejoErrores
};

// Para uso directo en el navegador
if (typeof window !== 'undefined') {
  window.AgendaAPI = AgendaAPI;
  window.API_CONFIG = API_CONFIG;
}
