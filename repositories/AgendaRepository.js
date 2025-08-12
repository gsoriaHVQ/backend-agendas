const { DatabaseError, NotFoundError } = require('../utils/errors');
const { dbLogger } = require('../utils/logger');

class AgendaRepository {
  constructor(dbConnection) {
    this.dbConnection = dbConnection;
  }

  /**
   * Verifica y crea la tabla AGENDAS si no existe
   */
  async ensureAgendasTable() {
    try {
      const checkTable = await this.dbConnection.execute(
        `SELECT COUNT(*) FROM user_tables WHERE table_name = 'AGENDAS'`
      );
      
      if (checkTable.rows[0][0] === 0) {
        dbLogger.info('Creando tabla AGENDAS');
        
        await this.dbConnection.execute(`
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
        
        // Insertar datos de ejemplo
        await this._insertSampleData();
        dbLogger.dbSuccess('Tabla AGENDAS creada con datos de ejemplo');
      }
      
      return true;
    } catch (error) {
      dbLogger.dbError('ensureAgendasTable', error);
      throw new DatabaseError('Error al verificar/crear tabla AGENDAS', error);
    }
  }

  /**
   * Inserta datos de ejemplo en la tabla AGENDAS
   */
  async _insertSampleData() {
    const sampleData = [
      { prestador: 1, fecha: 'SYSDATE + 1', hora: '09:00' },
      { prestador: 1, fecha: 'SYSDATE + 1', hora: '10:00' },
      { prestador: 2, fecha: 'SYSDATE + 2', hora: '14:00' }
    ];

    for (const data of sampleData) {
      await this.dbConnection.execute(
        `INSERT INTO AGENDAS (CD_PRESTADOR, FECHA, HORA, ESTADO) 
         VALUES (:prestador, ${data.fecha}, :hora, 'DISPONIBLE')`,
        [data.prestador, data.hora],
        { autoCommit: true }
      );
    }
  }

  /**
   * Mapea una fila de la BD a un objeto agenda
   */
  _mapRowToAgenda(row) {
    return {
      id_agenda: row[0],
      codigo_prestador: row[1],
      fecha: row[2],
      hora: row[3],
      estado: row[4],
      nombre_prestador: row[5] || 'No disponible',
      mnemonico: row[6] || 'N/A'
    };
  }

  /**
   * Obtiene todas las agendas con información del prestador
   */
  async findAll() {
    try {
      await this.ensureAgendasTable();
      dbLogger.info('Consultando todas las agendas');
      
      let result;
      
      try {
        // Intentar consulta con JOIN
        result = await this.dbConnection.execute(`
          SELECT 
            a.ID_AGENDA,
            a.CD_PRESTADOR,
            TO_CHAR(a.FECHA, 'YYYY-MM-DD') as FECHA,
            a.HORA,
            a.ESTADO,
            p.NM_PRESTADOR,
            p.NM_MNEMONICO
          FROM AGENDAS a
          LEFT JOIN PRESTADOR p ON p.CD_PRESTADOR = a.CD_PRESTADOR
          ORDER BY a.FECHA, a.HORA
        `);
      } catch (joinError) {
        dbLogger.warn('Error con JOIN, usando consulta simple', { error: joinError.message });
        
        // Consulta simple sin JOIN
        result = await this.dbConnection.execute(`
          SELECT 
            ID_AGENDA,
            CD_PRESTADOR,
            TO_CHAR(FECHA, 'YYYY-MM-DD') as FECHA,
            HORA,
            ESTADO,
            NULL as NM_PRESTADOR,
            NULL as NM_MNEMONICO
          FROM AGENDAS
          ORDER BY FECHA, HORA
        `);
      }
      
      const agendas = result.rows.map(row => this._mapRowToAgenda(row));
      
      dbLogger.dbSuccess('findAll agendas', { count: agendas.length });
      return agendas;
      
    } catch (error) {
      dbLogger.dbError('findAll agendas', error);
      throw new DatabaseError('Error al consultar agendas', error);
    }
  }

  /**
   * Busca una agenda por ID
   */
  async findById(id) {
    try {
      dbLogger.info('Consultando agenda por ID', { id });
      
      const result = await this.dbConnection.execute(`
        SELECT 
          a.ID_AGENDA,
          a.CD_PRESTADOR,
          TO_CHAR(a.FECHA, 'YYYY-MM-DD') as FECHA,
          a.HORA,
          a.ESTADO,
          NULL as NM_PRESTADOR,
          NULL as NM_MNEMONICO
        FROM AGENDAS a
        WHERE a.ID_AGENDA = :id
      `, [id]);

      if (result.rows.length === 0) {
        throw new NotFoundError('Agenda');
      }

      const agenda = this._mapRowToAgenda(result.rows[0]);
      
      dbLogger.dbSuccess('findById agenda', { id });
      return agenda;
      
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      dbLogger.dbError('findById agenda', error, { id });
      throw new DatabaseError('Error al consultar agenda por ID', error);
    }
  }

  /**
   * Crea una nueva agenda
   */
  async create(agendaData) {
    try {
      await this.ensureAgendasTable();
      dbLogger.info('Creando nueva agenda', agendaData);
      
      const { codigo_prestador, fecha, hora, estado = 'DISPONIBLE' } = agendaData;
      
      const result = await this.dbConnection.execute(`
        INSERT INTO AGENDAS (CD_PRESTADOR, FECHA, HORA, ESTADO) 
        VALUES (:codigo_prestador, TO_DATE(:fecha, 'YYYY-MM-DD'), :hora, :estado)
      `, [codigo_prestador, fecha, hora, estado], { autoCommit: true });
      
      dbLogger.dbSuccess('create agenda', agendaData);
      return { codigo_prestador, fecha, hora, estado };
      
    } catch (error) {
      dbLogger.dbError('create agenda', error, agendaData);
      throw new DatabaseError('Error al crear agenda', error);
    }
  }

  /**
   * Actualiza una agenda existente
   */
  async update(id, updateData) {
    try {
      // Verificar que existe
      await this.findById(id);
      
      dbLogger.info('Actualizando agenda', { id, updateData });
      
      const { codigo_prestador, fecha, hora, estado } = updateData;
      
      // Construir query dinámico
      const updateFields = [];
      const params = [];
      
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
        throw new DatabaseError('No hay campos para actualizar');
      }

      updateFields.push('UPDATED_AT = SYSDATE');
      params.push(id);
      
      const updateQuery = `UPDATE AGENDAS SET ${updateFields.join(', ')} WHERE ID_AGENDA = :id`;
      
      await this.dbConnection.execute(updateQuery, params, { autoCommit: true });
      
      dbLogger.dbSuccess('update agenda', { id, updateData });
      return true;
      
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof DatabaseError) {
        throw error;
      }
      
      dbLogger.dbError('update agenda', error, { id, updateData });
      throw new DatabaseError('Error al actualizar agenda', error);
    }
  }

  /**
   * Elimina una agenda
   */
  async delete(id) {
    try {
      // Verificar que existe
      await this.findById(id);
      
      dbLogger.info('Eliminando agenda', { id });
      
      await this.dbConnection.execute(
        `DELETE FROM AGENDAS WHERE ID_AGENDA = :id`,
        [id],
        { autoCommit: true }
      );
      
      dbLogger.dbSuccess('delete agenda', { id });
      return true;
      
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      dbLogger.dbError('delete agenda', error, { id });
      throw new DatabaseError('Error al eliminar agenda', error);
    }
  }

  /**
   * Busca agendas por código de prestador
   */
  async findByPrestador(codigoPrestador) {
    try {
      dbLogger.info('Consultando agendas por prestador', { codigoPrestador });
      
      const result = await this.dbConnection.execute(`
        SELECT 
          ID_AGENDA,
          CD_PRESTADOR,
          TO_CHAR(FECHA, 'YYYY-MM-DD') as FECHA,
          HORA,
          ESTADO,
          NULL as NM_PRESTADOR,
          NULL as NM_MNEMONICO
        FROM AGENDAS
        WHERE CD_PRESTADOR = :codigo_prestador
        ORDER BY FECHA, HORA
      `, [codigoPrestador]);
      
      const agendas = result.rows.map(row => this._mapRowToAgenda(row));
      
      dbLogger.dbSuccess('findByPrestador agendas', { codigoPrestador, count: agendas.length });
      return agendas;
      
    } catch (error) {
      dbLogger.dbError('findByPrestador agendas', error, { codigoPrestador });
      throw new DatabaseError('Error al consultar agendas por prestador', error);
    }
  }
}

module.exports = AgendaRepository;
