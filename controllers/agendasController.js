const getConnection = require('../db/connect');
const AgendaService = require('../services/AgendaService');
const { errorHandler } = require('../utils/errors');
const { apiLogger } = require('../utils/logger');

const getAgendas = async (req, res) => {
  let connection;
  
  try {
    connection = await getConnection();
    const agendaService = new AgendaService(connection);
    
    const resultado = await agendaService.obtenerTodasAgendas();
    
    res.status(200).json({
      success: true,
      ...resultado
    });
    
  } catch (error) {
    errorHandler(error, req, res, () => {});
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        apiLogger.error('Error cerrando conexión', { error: closeError.message });
      }
    }
  }
};

const getAgendaById = async (req, res) => {
  let connection;
  
  try {
    connection = await getConnection();
    const agendaService = new AgendaService(connection);
    
    const resultado = await agendaService.obtenerAgendaPorId(req.params.id);
    
    res.status(200).json({
      success: true,
      ...resultado
    });
    
  } catch (error) {
    errorHandler(error, req, res, () => {});
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        apiLogger.error('Error cerrando conexión', { error: closeError.message });
      }
    }
  }
};

const createAgenda = async (req, res) => {
  let connection;
  
  try {
    connection = await getConnection();
    const agendaService = new AgendaService(connection);
    
    const resultado = await agendaService.crearAgenda(req.body);
    
    res.status(201).json({
      success: true,
      ...resultado
    });
    
  } catch (error) {
    errorHandler(error, req, res, () => {});
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        apiLogger.error('Error cerrando conexión', { error: closeError.message });
      }
    }
  }
};

const updateAgenda = async (req, res) => {
  let connection;
  
  try {
    connection = await getConnection();
    const agendaService = new AgendaService(connection);
    
    const resultado = await agendaService.actualizarAgenda(req.params.id, req.body);
    
    res.status(200).json({
      success: true,
      ...resultado
    });
    
  } catch (error) {
    errorHandler(error, req, res, () => {});
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        apiLogger.error('Error cerrando conexión', { error: closeError.message });
      }
    }
  }
};

const deleteAgenda = async (req, res) => {
  let connection;
  
  try {
    connection = await getConnection();
    const agendaService = new AgendaService(connection);
    
    const resultado = await agendaService.eliminarAgenda(req.params.id);
    
    res.status(200).json({
      success: true,
      ...resultado
    });
    
  } catch (error) {
    errorHandler(error, req, res, () => {});
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        apiLogger.error('Error cerrando conexión', { error: closeError.message });
      }
    }
  }
};

const getAgendasByPrestador = async (req, res) => {
  let connection;
  
  try {
    connection = await getConnection();
    const agendaService = new AgendaService(connection);
    
    const resultado = await agendaService.obtenerAgendasPorPrestador(req.params.codigo_prestador);
    
    res.status(200).json({
      success: true,
      ...resultado
    });
    
  } catch (error) {
    errorHandler(error, req, res, () => {});
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        apiLogger.error('Error cerrando conexión', { error: closeError.message });
      }
    }
  }
};

// Nuevo endpoint para estadísticas
const getEstadisticasAgendas = async (req, res) => {
  let connection;
  
  try {
    connection = await getConnection();
    const agendaService = new AgendaService(connection);
    
    const estadisticas = await agendaService.obtenerEstadisticas();
    
    res.status(200).json({
      success: true,
      data: estadisticas,
      message: 'Estadísticas de agendas generadas correctamente'
    });
    
  } catch (error) {
    errorHandler(error, req, res, () => {});
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        apiLogger.error('Error cerrando conexión', { error: closeError.message });
      }
    }
  }
};

// Endpoint para cancelar agenda
const cancelarAgenda = async (req, res) => {
  let connection;
  
  try {
    connection = await getConnection();
    const agendaService = new AgendaService(connection);
    
    const resultado = await agendaService.cancelarAgenda(req.params.id, req.body.motivo);
    
    res.status(200).json({
      success: true,
      ...resultado
    });
    
  } catch (error) {
    errorHandler(error, req, res, () => {});
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        apiLogger.error('Error cerrando conexión', { error: closeError.message });
      }
    }
  }
};

module.exports = { 
  getAgendas, 
  getAgendaById,
  createAgenda, 
  updateAgenda, 
  deleteAgenda,
  getAgendasByPrestador,
  getEstadisticasAgendas,
  cancelarAgenda
}; 