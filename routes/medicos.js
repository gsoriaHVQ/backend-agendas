const express = require('express');
const router = express.Router();
const { 
  getMedicos, 
  getDatabaseInfo, 
  getMedicosByEspecialidad, 
  getMedicosByCodigoItem, 
  getMedicosByNombre,
  getEspecialidades,
  getEstadisticasMedicos
} = require('../controllers/medicosController');

const {
  validateEspecialidad,
  validateNombre,
  validateCodigoItem
} = require('../middleware/validations');

// GET /api/medicos - Obtener todos los médicos con especialidades
router.get('/', getMedicos);

// GET /api/medicos/especialidades - Obtener solo especialidades
router.get('/especialidades', getEspecialidades);

// GET /api/medicos/estadisticas - Obtener estadísticas
router.get('/estadisticas', getEstadisticasMedicos);

// GET /api/medicos/db-info - Obtener información de estructura de BD
router.get('/db-info', getDatabaseInfo);

// Búsqueda avanzada con validaciones
router.get('/especialidad/:especialidad', validateEspecialidad, getMedicosByEspecialidad);
router.get('/item/:codigo_item', validateCodigoItem, getMedicosByCodigoItem);
router.get('/nombre/:nombre', validateNombre, getMedicosByNombre);

// GET /medicos/debug - Ver datos de diagnóstico de forma legible
router.get('/debug', async (req, res) => {
  try {
    const getConnection = require('../db/connect');
    const connection = await getConnection();
    
    // Buscar tablas relacionadas con ITEM y AGENDAMENTO
    const itemTables = await connection.execute(
      `SELECT table_name FROM all_tables 
       WHERE table_name LIKE '%ITEM%' 
       OR table_name LIKE '%AGENDAMENTO%'
       ORDER BY table_name`
    );
    
    // Logs removidos
    
    // Verificar específicamente la tabla ITEM_AGENDAMENTO
    let itemAgendamentoInfo = null;
    try {
      const checkSpecific = await connection.execute(
        `SELECT COUNT(*) FROM ITEM_AGENDAMENTO WHERE ROWNUM <= 5`
      );
      
      const columns = await connection.execute(
        `SELECT column_name, data_type, nullable FROM all_tab_columns 
         WHERE table_name = 'ITEM_AGENDAMENTO' 
         ORDER BY column_id`
      );
      
      itemAgendamentoInfo = {
        exists: true,
        row_count_sample: checkSpecific.rows[0][0],
        columns: columns.rows.map(row => ({
          name: row[0],
          type: row[1],
          nullable: row[2]
        }))
      };
      
    } catch (err) {
      itemAgendamentoInfo = {
        exists: false,
        error: err.message
      };
    }
    
    await connection.close();
    
    res.json({
      success: true,
      tables_with_item_agendamento: itemTables.rows.map(row => row[0]),
      item_agendamento_analysis: itemAgendamentoInfo,
      message: 'Análisis detallado de tablas disponibles'
    });
    
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// GET /medicos/test-especialidades - Probar la consulta exacta proporcionada por el usuario
router.get('/test-especialidades', async (req, res) => {
  try {
    const getConnection = require('../db/connect');
    const connection = await getConnection();
    
    
    try {
      // Consulta exacta del usuario
      const result = await connection.execute(`
        SELECT DISTINCT
          pr.CD_PRESTADOR,
          pr.NM_PRESTADOR,
          pr.NM_MNEMONICO,
          ia.CD_ITEM_AGENDAMENTO,
          ia.DS_ITEM_AGENDAMENTO
        FROM DBAMV.AGENDA_CENTRAL ac
        JOIN DBAMV.PRESTADOR pr ON pr.CD_PRESTADOR = ac.CD_PRESTADOR
        JOIN DBAMV.AGENDA_CENTRAL_ITEM_AGENDA acia ON acia.CD_AGENDA_CENTRAL = ac.CD_AGENDA_CENTRAL
        JOIN DBAMV.ITEM_AGENDAMENTO ia ON ia.CD_ITEM_AGENDAMENTO = acia.CD_ITEM_AGENDAMENTO
        WHERE pr.TP_SITUACAO = 'A'
          AND ia.SN_ATIVO = 'S'
      `);
      
      await connection.close();
      
      const data = result.rows.map(row => ({
        codigo_prestador: row[0],
        nombre_prestador: row[1],
        mnemonico: row[2],
        codigo_item_agendamiento: row[3],
        descripcion_item: row[4]
      }));
      
      // Logs removidos
      
      res.json({
        success: true,
        data: data,
        total: data.length,
        message: 'Consulta exacta del usuario ejecutada correctamente'
      });
      
    } catch (err) {
      await connection.close();
      
      // Logs removidos
      
      res.status(500).json({
        success: false,
        error: 'Error al ejecutar la consulta exacta',
        message: err.message,
        query_attempted: 'DBAMV.AGENDA_CENTRAL + AGENDA_CENTRAL_ITEM_AGENDA + ITEM_AGENDAMENTO'
      });
    }
    
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
