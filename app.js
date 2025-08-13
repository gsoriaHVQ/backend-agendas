require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Configuraciones centralizadas
const AppConfig = require('./config/app');
const CorsConfig = require('./config/cors');

// Utilidades
const { appLogger } = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./utils/errors');

// Rutas
const agendasRoutes = require('./routes/agendas');
const medicosRoutes = require('./routes/medicos');
const catalogosRoutes = require('./routes/catalogos');
const agendaCustomRoutes = require('./routes/agendaCustom');
const externalRoutes = require('./routes/external');

// Servicios
const MedicoService = require('./services/MedicoService');
const getConnection = require('./db/connect');

class App {
  constructor() {
    this.app = express();
    this.config = new AppConfig();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupMiddleware() {
    // CORS
    this.app.use(cors(CorsConfig.getOptions()));
    
    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Request logging
    this.app.use((req, res, next) => {
      appLogger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      next();
    });
  }

  setupRoutes() {
    // Ruta raíz - Información de la API
    this.app.get('/', this.getApiInfo.bind(this));

    // Health check
    this.app.get('/health', this.healthCheck.bind(this));

    // Endpoint directo para especialidades (mantener compatibilidad)
    this.app.get('/especialidades', this.getEspecialidades.bind(this));
    
    // Endpoint directo para médicos (mantener compatibilidad)
    this.app.get('/medicos', this.getMedicosCompatibility.bind(this));
    this.app.get('/medicos/especialidad/:especialidad', this.getMedicosByEspecialidadCompatibility.bind(this));
    this.app.get('/medicos/item/:codigo_item', this.getMedicosByCodigoItemCompatibility.bind(this));
    this.app.get('/medicos/nombre/:nombre', this.getMedicosByNombreCompatibility.bind(this));

    // Rutas modulares
    this.app.use('/api/agendas', agendasRoutes);
    this.app.use('/api/medicos', medicosRoutes);
    this.app.use('/api/catalogos', catalogosRoutes);
    this.app.use('/api/agnd-agenda', agendaCustomRoutes);
    this.app.use('/api/external', externalRoutes);
  }

  setupErrorHandling() {
    // 404 handler
    this.app.use(notFoundHandler);
    
    // Error handler global
    this.app.use(errorHandler);
  }

  async getApiInfo(req, res) {
    try {
      res.json({
        ...this.config.getApiInfo(),
        endpoints: this.config.getEndpointsInfo(),
        status: 'active'
      });
    } catch (error) {
      appLogger.error('Error en ruta raíz', { error: error.message });
      res.status(500).json({ 
        success: false, 
        error: 'Error interno del servidor' 
      });
    }
  }

  async healthCheck(req, res) {
    try {
      // Test básico de BD
      let dbStatus = 'unknown';
      try {
        const connection = await getConnection();
        await connection.execute('SELECT 1 FROM DUAL');
        await connection.close();
        dbStatus = 'connected';
      } catch (dbError) {
        dbStatus = 'disconnected';
        appLogger.warn('BD no disponible en health check', { error: dbError.message });
      }

      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: this.config.nodeEnv,
        database: dbStatus,
        uptime: process.uptime()
      });
    } catch (error) {
      appLogger.error('Error en health check', { error: error.message });
      res.status(500).json({ 
        status: 'ERROR', 
        timestamp: new Date().toISOString() 
      });
    }
  }

  // Endpoints de compatibilidad (mantener API existente)
  async getEspecialidades(req, res) {
    try {
      const ExternalMedicosService = require('./services/ExternalMedicosService');
      const external = new ExternalMedicosService();
      const data = await external.obtenerEspecialidades();
      res.json({ success: true, data });
    } catch (error) {
      errorHandler(error, req, res, () => {});
    }
  }
  async getMedicosCompatibility(req, res) {
    try {
      const ExternalMedicosService = require('./services/ExternalMedicosService');
      const external = new ExternalMedicosService();
      const data = await external.obtenerMedicos();
      res.json({ success: true, data });
    } catch (error) {
      errorHandler(error, req, res, () => {});
    }
  }

  async getMedicosByEspecialidadCompatibility(req, res) {
    let connection;
    try {
      connection = await getConnection();
      const medicoService = new MedicoService(connection);
      
      const resultado = await medicoService.buscarPorEspecialidad(req.params.especialidad);
      
      res.json({
        success: true,
        data: resultado.data
      });
    } catch (error) {
      errorHandler(error, req, res, () => {});
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeError) {
          appLogger.error('Error cerrando conexión', { error: closeError.message });
        }
      }
    }
  }

  async getMedicosByCodigoItemCompatibility(req, res) {
    let connection;
    try {
      connection = await getConnection();
      const medicoService = new MedicoService(connection);
      
      const resultado = await medicoService.buscarPorCodigoItem(req.params.codigo_item);
      
      res.json({
        success: true,
        data: resultado.data
      });
    } catch (error) {
      errorHandler(error, req, res, () => {});
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeError) {
          appLogger.error('Error cerrando conexión', { error: closeError.message });
        }
      }
    }
  }

  async getMedicosByNombreCompatibility(req, res) {
    let connection;
    try {
      connection = await getConnection();
      const medicoService = new MedicoService(connection);
      
      const resultado = await medicoService.buscarPorNombre(req.params.nombre);
      
      res.json({
        success: true,
        data: resultado.data
      });
    } catch (error) {
      errorHandler(error, req, res, () => {});
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeError) {
          appLogger.error('Error cerrando conexión', { error: closeError.message });
        }
      }
    }
  }

  start() {
    const port = this.config.getPort();
    
    this.app.listen(port, () => {
      appLogger.info(`Servidor iniciado en puerto ${port}`, {
        environment: this.config.nodeEnv,
        endpoints: {
          api: `http://localhost:${port}/`,
          health: `http://localhost:${port}/health`,
          docs: `http://localhost:${port}/api`
        }
      });
    });

    return this.app;
  }

  getExpressApp() {
    return this.app;
  }
}

// Crear e iniciar la aplicación
const appInstance = new App();

// Manejo de señales del sistema para shutdown graceful
process.on('SIGTERM', () => {
  appLogger.info('Señal SIGTERM recibida, cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  appLogger.info('Señal SIGINT recibida, cerrando servidor...');
  process.exit(0);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  appLogger.error('Error no capturado', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  appLogger.error('Promise rechazada no manejada', { reason, promise });
  process.exit(1);
});

// Iniciar servidor si se ejecuta directamente
if (require.main === module) {
  appInstance.start();
}

module.exports = appInstance.getExpressApp();
