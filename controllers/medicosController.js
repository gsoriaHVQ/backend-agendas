//Consulta de medicos
const getConnection = require('../db/connect'); // Mantenido solo para getDatabaseInfo
const ExternalMedicosService = require('../services/ExternalMedicosService');
const { errorHandler } = require('../utils/errors');
const { apiLogger } = require('../utils/logger');

const getMedicos = async (req, res) => {
  try {
    const external = new ExternalMedicosService();
    const situationType = req.query.situationType || 'ACTIVE';
    const data = await external.obtenerMedicos({ situationType });
    res.status(200).json({ success: true, data, total: Array.isArray(data) ? data.length : undefined });
  } catch (error) {
    errorHandler(error, req, res, () => {});
  }
};

// Función adicional para diagnosticar las tablas de agenda
const getDatabaseInfo = async (req, res) => {
  try {
    const connection = await getConnection();
    
    // Verificar tablas de agenda
    const agendaTables = await connection.execute(
      `SELECT table_name FROM all_tables 
       WHERE table_name LIKE '%AGENDA%' 
       ORDER BY table_name`
    );
    
    // Verificar estructura de AGENDA_CENTRAL
    let agendaCentralInfo = { exists: false };
    try {
      const columns = await connection.execute(
        `SELECT column_name, data_type FROM all_tab_columns 
         WHERE table_name = 'AGENDA_CENTRAL' 
         ORDER BY column_id`
      );
      
      const sampleData = await connection.execute(
        `SELECT COUNT(*) FROM AGENDA_CENTRAL WHERE ROWNUM <= 1`
      );
      
      agendaCentralInfo = {
        exists: true,
        columns: columns.rows.map(row => ({ name: row[0], type: row[1] })),
        has_data: sampleData.rows[0][0] > 0
      };
    } catch (err) {
      agendaCentralInfo.error = err.message;
    }
    
    // Verificar estructura de AGENDA_CENTRAL_ITEM_AGENDA
    let agendaCentralItemInfo = { exists: false };
    try {
      const columns = await connection.execute(
        `SELECT column_name, data_type FROM all_tab_columns 
         WHERE table_name = 'AGENDA_CENTRAL_ITEM_AGENDA' 
         ORDER BY column_id`
      );
      
      const sampleData = await connection.execute(
        `SELECT COUNT(*) FROM AGENDA_CENTRAL_ITEM_AGENDA WHERE ROWNUM <= 1`
      );
      
      agendaCentralItemInfo = {
        exists: true,
        columns: columns.rows.map(row => ({ name: row[0], type: row[1] })),
        has_data: sampleData.rows[0][0] > 0
      };
    } catch (err) {
      agendaCentralItemInfo.error = err.message;
    }
    
    await connection.close();
    
    res.status(200).json({
      success: true,
      agenda_tables: agendaTables.rows.map(row => row[0]),
      agenda_central_info: agendaCentralInfo,
      agenda_central_item_info: agendaCentralItemInfo,
      message: 'Análisis de estructura de tablas de agenda'
    });
    
  } catch (err) {
    console.error('Error al obtener info de BD:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al consultar estructura de BD',
      message: err.message 
    });
  }
};

const getMedicosByEspecialidad = async (req, res) => {
  try {
    const external = new ExternalMedicosService();
    const especialidad = req.params.especialidad;
    const situationType = req.query.situationType || 'ACTIVE';
    
    apiLogger.info('Buscando médicos por especialidad desde API externa', { especialidad });
    
    const medicos = await external.buscarMedicosPorEspecialidad(especialidad, { situationType });
    
    res.status(200).json({
      success: true,
      data: medicos,
      total: medicos.length,
      message: `Médicos encontrados para la especialidad: ${especialidad}`,
      criterio: { tipo: 'especialidad', valor: especialidad }
    });
    
  } catch (error) {
    errorHandler(error, req, res, () => {});
  }
};

const getMedicosByCodigoItem = async (req, res) => {
  try {
    const external = new ExternalMedicosService();
    const codigoItem = req.params.codigo_item;
    const situationType = req.query.situationType || 'ACTIVE';
    
    apiLogger.info('Buscando médicos por código de item desde API externa', { codigoItem });
    
    const medicos = await external.buscarMedicosPorCodigoItem(codigoItem, { situationType });
    
    res.status(200).json({
      success: true,
      data: medicos,
      total: medicos.length,
      message: `Médicos encontrados para el código de item: ${codigoItem}`,
      criterio: { tipo: 'codigo_item', valor: codigoItem }
    });
    
  } catch (error) {
    errorHandler(error, req, res, () => {});
  }
};

const getMedicosByNombre = async (req, res) => {
  try {
    const external = new ExternalMedicosService();
    const nombre = req.params.nombre;
    const situationType = req.query.situationType || 'ACTIVE';
    
    apiLogger.info('Buscando médicos por nombre desde API externa', { nombre });
    
    const medicos = await external.buscarMedicosPorNombre(nombre, { situationType });
    
    res.status(200).json({
      success: true,
      data: medicos,
      total: medicos.length,
      message: `Médicos encontrados con el nombre: ${nombre}`,
      criterio: { tipo: 'nombre', valor: nombre }
    });
    
  } catch (error) {
    errorHandler(error, req, res, () => {});
  }
};

// Nuevo endpoint para obtener especialidades (desde API externa)
const getEspecialidades = async (req, res) => {
  try {
    const external = new ExternalMedicosService();
    const data = await external.obtenerEspecialidades();
    res.status(200).json({ success: true, data, total: Array.isArray(data) ? data.length : undefined });
  } catch (error) {
    errorHandler(error, req, res, () => {});
  }
};

// Nuevo endpoint para estadísticas (desde API externa)
const getEstadisticasMedicos = async (req, res) => {
  try {
    const external = new ExternalMedicosService();
    const situationType = req.query.situationType || 'ACTIVE';
    
    apiLogger.info('Generando estadísticas de médicos desde API externa');
    
    const estadisticas = await external.obtenerEstadisticasMedicos({ situationType });
    
    res.status(200).json({
      success: true,
      data: estadisticas,
      message: 'Estadísticas de médicos generadas correctamente desde API externa'
    });
    
  } catch (error) {
    errorHandler(error, req, res, () => {});
  }
};

module.exports = {
  getMedicos,
  getDatabaseInfo,
  getMedicosByEspecialidad,
  getMedicosByCodigoItem,
  getMedicosByNombre,
  getEspecialidades,
  getEstadisticasMedicos
};