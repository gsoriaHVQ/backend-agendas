const getConnection = require('../db/connect');

// Función para verificar/crear tabla de agendas
const ensureAgendasTable = async (connection) => {
  try {
    // Primero verificamos si la tabla existe
    const checkTable = await connection.execute(
      `SELECT COUNT(*) FROM user_tables WHERE table_name = 'AGENDAS'`
    );
    
    if (checkTable.rows[0][0] === 0) {
      console.log('Tabla AGENDAS no existe, creando...');
      
      // Crear tabla AGENDAS
      await connection.execute(`
        CREATE TABLE AGENDAS (
          ID_AGENDA NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
          CD_PRESTADOR NUMBER NOT NULL,
          FECHA DATE NOT NULL,
          HORA VARCHAR2(5) NOT NULL,
          ESTADO VARCHAR2(20) DEFAULT 'DISPONIBLE',
          CREATED_AT DATE DEFAULT SYSDATE,
          UPDATED_AT DATE DEFAULT SYSDATE
        )
      `);
      
      console.log('Tabla AGENDAS creada exitosamente');
      
      // Insertar algunos datos de ejemplo
      await connection.execute(`
        INSERT INTO AGENDAS (CD_PRESTADOR, FECHA, HORA, ESTADO) 
        VALUES (1, SYSDATE + 1, '09:00', 'DISPONIBLE')
      `, {}, { autoCommit: true });
      
      await connection.execute(`
        INSERT INTO AGENDAS (CD_PRESTADOR, FECHA, HORA, ESTADO) 
        VALUES (1, SYSDATE + 1, '10:00', 'DISPONIBLE')
      `, {}, { autoCommit: true });
      
      console.log('Datos de ejemplo insertados');
    }
    
    return true;
  } catch (err) {
    console.error('Error al verificar/crear tabla AGENDAS:', err.message);
    return false;
  }
};

// Obtener todas las agendas
const getAgendas = async (req, res) => {
  try {
    const connection = await getConnection();
    
    // Verificar/crear tabla si no existe
    await ensureAgendasTable(connection);
    
    let result;
    
    try {
      // Intentar consulta con JOIN a PRESTADOR
      result = await connection.execute(
        `SELECT 
           a.ID_AGENDA,
           a.CD_PRESTADOR,
           TO_CHAR(a.FECHA, 'YYYY-MM-DD') as FECHA,
           a.HORA,
           a.ESTADO,
           p.NM_PRESTADOR,
           p.NM_MNEMONICO
         FROM AGENDAS a
         LEFT JOIN PRESTADOR p ON p.CD_PRESTADOR = a.CD_PRESTADOR
         ORDER BY a.FECHA, a.HORA`
      );
    } catch (err) {
      console.log('Error con JOIN, intentando consulta simple...', err.message);
      
      // Si falla el JOIN, consulta solo AGENDAS
      result = await connection.execute(
        `SELECT 
           ID_AGENDA,
           CD_PRESTADOR,
           TO_CHAR(FECHA, 'YYYY-MM-DD') as FECHA,
           HORA,
           ESTADO,
           NULL as NM_PRESTADOR,
           NULL as NM_MNEMONICO
         FROM AGENDAS
         ORDER BY FECHA, HORA`
      );
    }
    
    await connection.close();

    const data = result.rows.map(row => ({
      id_agenda: row[0],
      codigo_prestador: row[1],
      fecha: row[2],
      hora: row[3],
      estado: row[4],
      nombre_prestador: row[5] || 'No disponible',
      mnemonico: row[6] || 'N/A'
    }));

    res.status(200).json({
      success: true,
      data: data,
      total: data.length
    });
  } catch (err) {
    console.error('Error al consultar agendas:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al consultar las agendas',
      message: err.message,
      help: 'La tabla AGENDAS será creada automáticamente si no existe'
    });
  }
};

// Obtener agenda por ID
const getAgendaById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const connection = await getConnection();
    
    const result = await connection.execute(
      `SELECT 
         a.ID_AGENDA,
         a.CD_PRESTADOR,
         TO_CHAR(a.FECHA, 'YYYY-MM-DD') as FECHA,
         a.HORA,
         a.ESTADO
       FROM AGENDAS a
       WHERE a.ID_AGENDA = :id`,
      [id]
    );
    
    await connection.close();

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agenda no encontrada'
      });
    }

    const row = result.rows[0];
    const data = {
      id_agenda: row[0],
      codigo_prestador: row[1],
      fecha: row[2],
      hora: row[3],
      estado: row[4]
    };

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (err) {
    console.error('Error al consultar agenda:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al consultar la agenda',
      message: err.message 
    });
  }
};

// Crear una nueva agenda
const createAgenda = async (req, res) => {
  const { codigo_prestador, fecha, hora, estado = 'DISPONIBLE' } = req.body;

  try {
    const connection = await getConnection();
    
    // Verificar/crear tabla si no existe
    await ensureAgendasTable(connection);
    
    // Insertar nueva agenda
    const result = await connection.execute(
      `INSERT INTO AGENDAS (CD_PRESTADOR, FECHA, HORA, ESTADO) 
       VALUES (:codigo_prestador, TO_DATE(:fecha, 'YYYY-MM-DD'), :hora, :estado)`,
      [codigo_prestador, fecha, hora, estado],
      { autoCommit: true }
    );
    
    await connection.close();

    res.status(201).json({
      success: true,
      message: 'Agenda creada correctamente',
      data: {
        codigo_prestador,
        fecha,
        hora,
        estado
      }
    });
  } catch (err) {
    console.error('Error al crear agenda:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al crear la agenda',
      message: err.message 
    });
  }
};

// Actualizar una agenda existente
const updateAgenda = async (req, res) => {
  const { id } = req.params;
  const { codigo_prestador, fecha, hora, estado } = req.body;

  try {
    const connection = await getConnection();
    
    // Verificar que la agenda existe
    const agendaCheck = await connection.execute(
      `SELECT ID_AGENDA FROM AGENDAS WHERE ID_AGENDA = :id`,
      [id]
    );

    if (agendaCheck.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        error: 'Agenda no encontrada'
      });
    }

    // Construir query dinámico basado en campos proporcionados
    let updateFields = [];
    let params = [];
    
    if (codigo_prestador) {
      updateFields.push('CD_PRESTADOR = :codigo_prestador');
      params.push(codigo_prestador);
    }
    if (fecha) {
      updateFields.push('FECHA = TO_DATE(:fecha, \'YYYY-MM-DD\')');
      params.push(fecha);
    }
    if (hora) {
      updateFields.push('HORA = :hora');
      params.push(hora);
    }
    if (estado) {
      updateFields.push('ESTADO = :estado');
      params.push(estado);
    }

    if (updateFields.length === 0) {
      await connection.close();
      return res.status(400).json({
        success: false,
        error: 'No hay campos para actualizar'
      });
    }

    // Agregar campo de actualización
    updateFields.push('UPDATED_AT = SYSDATE');
    params.push(id); // ID para el WHERE
    
    const updateQuery = `UPDATE AGENDAS SET ${updateFields.join(', ')} WHERE ID_AGENDA = :id`;
    
    await connection.execute(updateQuery, params, { autoCommit: true });
    await connection.close();

    res.status(200).json({
      success: true,
      message: 'Agenda actualizada correctamente'
    });
  } catch (err) {
    console.error('Error al actualizar agenda:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al actualizar la agenda',
      message: err.message 
    });
  }
};

// Eliminar una agenda
const deleteAgenda = async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await getConnection();
    
    // Verificar que la agenda existe
    const agendaCheck = await connection.execute(
      `SELECT ID_AGENDA FROM AGENDAS WHERE ID_AGENDA = :id`,
      [id]
    );

    if (agendaCheck.rows.length === 0) {
      await connection.close();
      return res.status(404).json({
        success: false,
        error: 'Agenda no encontrada'
      });
    }

    await connection.execute(
      `DELETE FROM AGENDAS WHERE ID_AGENDA = :id`,
      [id],
      { autoCommit: true }
    );
    
    await connection.close();

    res.status(200).json({
      success: true,
      message: 'Agenda eliminada correctamente'
    });
  } catch (err) {
    console.error('Error al eliminar agenda:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al eliminar la agenda',
      message: err.message 
    });
  }
};

// Obtener agendas por prestador
const getAgendasByPrestador = async (req, res) => {
  const { codigo_prestador } = req.params;
  
  try {
    const connection = await getConnection();
    
    const result = await connection.execute(
      `SELECT 
         ID_AGENDA,
         CD_PRESTADOR,
         TO_CHAR(FECHA, 'YYYY-MM-DD') as FECHA,
         HORA,
         ESTADO
       FROM AGENDAS
       WHERE CD_PRESTADOR = :codigo_prestador
       ORDER BY FECHA, HORA`,
      [codigo_prestador]
    );
    
    await connection.close();

    const data = result.rows.map(row => ({
      id_agenda: row[0],
      codigo_prestador: row[1],
      fecha: row[2],
      hora: row[3],
      estado: row[4]
    }));

    res.status(200).json({
      success: true,
      data: data,
      total: data.length
    });
  } catch (err) {
    console.error('Error al consultar agendas por prestador:', err);
    res.status(500).json({ 
      success: false,
      error: 'Error al consultar las agendas del prestador',
      message: err.message 
    });
  }
};

module.exports = { 
  getAgendas, 
  getAgendaById,
  createAgenda, 
  updateAgenda, 
  deleteAgenda,
  getAgendasByPrestador 
}; 