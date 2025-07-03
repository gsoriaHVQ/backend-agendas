const getConnection = require('../db/connect');

const getMedicos = async (req, res) => {
  try {
    const connection = await getConnection();
    
    console.log('🔍 Ejecutando consulta de médicos con especialidades...');
    
    // Usar la consulta exacta que funciona según el usuario
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
      ORDER BY pr.NM_PRESTADOR, ia.DS_ITEM_AGENDAMENTO
    `);

    await connection.close();

    const data = result.rows.map(row => ({
      codigo_prestador: row[0],
      nombre_prestador: row[1],
      mnemonico: row[2],
      codigo_item_agendamiento: row[3],
      descripcion_agendamiento: row[4]
    }));

    console.log(`✅ Consulta exitosa - ${data.length} médicos con especialidades encontrados`);

    res.status(200).json({
      success: true,
      data: data,
      total: data.length,
      message: 'Médicos con especialidades obtenidos correctamente'
    });
    
  } catch (err) {
    console.error('❌ Error al consultar médicos con especialidades:', err.message);
    
    // Fallback: Si falla la consulta principal, devolver solo prestadores
    try {
      const connection = await getConnection();
      const fallbackResult = await connection.execute(`
        SELECT 
          CD_PRESTADOR,
          NM_PRESTADOR,
          NM_MNEMONICO
        FROM DBAMV.PRESTADOR 
        WHERE TP_SITUACAO = 'A'
        ORDER BY NM_PRESTADOR
      `);
      
      await connection.close();
      
      const fallbackData = fallbackResult.rows.map(row => ({
        codigo_prestador: row[0],
        nombre_prestador: row[1],
        mnemonico: row[2],
        codigo_item_agendamiento: null,
        descripcion_agendamiento: 'CONSULTA GENERAL'
      }));
      
      console.log(`📋 Fallback ejecutado - ${fallbackData.length} prestadores encontrados`);
      
      res.status(200).json({
        success: true,
        data: fallbackData,
        total: fallbackData.length,
        message: 'Prestadores obtenidos sin especialidades específicas',
        warning: 'No se pudieron obtener las especialidades: ' + err.message
      });
      
    } catch (fallbackErr) {
      console.error('❌ Error en fallback:', fallbackErr.message);
      res.status(500).json({ 
        success: false,
        error: 'Error al consultar los médicos',
        message: `Error principal: ${err.message}. Error fallback: ${fallbackErr.message}`
      });
    }
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

// GET /api/medicos/especialidad/:especialidad
const getMedicosByEspecialidad = async (req, res) => {
  const { especialidad } = req.params;
  try {
    const connection = await getConnection();
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
        AND LOWER(ia.DS_ITEM_AGENDAMENTO) LIKE :especialidad
      ORDER BY pr.NM_PRESTADOR, ia.DS_ITEM_AGENDAMENTO
    `, [`%${especialidad.toLowerCase()}%`]);
    await connection.close();
    const data = result.rows.map(row => ({
      codigo_prestador: row[0],
      nombre_prestador: row[1],
      mnemonico: row[2],
      codigo_item_agendamiento: row[3],
      descripcion_agendamiento: row[4]
    }));
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/medicos/item/:codigo_item
const getMedicosByCodigoItem = async (req, res) => {
  const { codigo_item } = req.params;
  try {
    const connection = await getConnection();
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
        AND ia.CD_ITEM_AGENDAMENTO = :codigo_item
      ORDER BY pr.NM_PRESTADOR, ia.DS_ITEM_AGENDAMENTO
    `, [codigo_item]);
    await connection.close();
    const data = result.rows.map(row => ({
      codigo_prestador: row[0],
      nombre_prestador: row[1],
      mnemonico: row[2],
      codigo_item_agendamiento: row[3],
      descripcion_agendamiento: row[4]
    }));
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/medicos/nombre/:nombre
const getMedicosByNombre = async (req, res) => {
  const { nombre } = req.params;
  try {
    const connection = await getConnection();
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
        AND LOWER(pr.NM_PRESTADOR) LIKE :nombre
      ORDER BY pr.NM_PRESTADOR, ia.DS_ITEM_AGENDAMENTO
    `, [`%${nombre.toLowerCase()}%`]);
    await connection.close();
    const data = result.rows.map(row => ({
      codigo_prestador: row[0],
      nombre_prestador: row[1],
      mnemonico: row[2],
      codigo_item_agendamiento: row[3],
      descripcion_agendamiento: row[4]
    }));
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getMedicos,
  getDatabaseInfo,
  getMedicosByEspecialidad,
  getMedicosByCodigoItem,
  getMedicosByNombre
};