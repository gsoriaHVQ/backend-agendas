class AppConfig {
  constructor() {
    this.port = process.env.PORT || 3001;
    this.nodeEnv = process.env.NODE_ENV || 'development';
    this.apiVersion = process.env.API_VERSION || '1.0.0';
    this.appName = process.env.APP_NAME || 'API de Agendas Médicas';
  }

  getPort() {
    return this.port;
  }

  isDevelopment() {
    return this.nodeEnv === 'development';
  }

  isProduction() {
    return this.nodeEnv === 'production';
  }

  getApiInfo() {
    return {
      name: this.appName,
      version: this.apiVersion,
      environment: this.nodeEnv,
      timestamp: new Date().toISOString()
    };
  }

  getEndpointsInfo() {
    return {
      health: '/health',
      especialidades: '/especialidades',
      medicos: {
        all: '/medicos',
        byEspecialidad: '/medicos/especialidad/:especialidad',
        byItem: '/medicos/item/:codigo_item',
        byNombre: '/medicos/nombre/:nombre'
      },
      agendas: {
        all: '/agendas',
        byId: '/agendas/:id',
        byPrestador: '/agendas/prestador/:codigo_prestador'
      },
      catalogos: {
        consultorios: '/api/catalogos/consultorios',
        dias: '/api/catalogos/dias',
        edificios: '/api/catalogos/edificios',
        pisosPorEdificio: '/api/catalogos/edificios/:codigo_edificio/pisos'
      },
      agnd_agenda: {
        list: '/api/agnd-agenda',
        get: '/api/agnd-agenda/:id',
        create: '/api/agnd-agenda',
        update: '/api/agnd-agenda/:id',
        delete: '/api/agnd-agenda/:id'
      }
    };
  }
}

module.exports = AppConfig;
