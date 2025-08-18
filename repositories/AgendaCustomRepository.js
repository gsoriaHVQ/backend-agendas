const { DatabaseError, NotFoundError } = require('../utils/errors');
const { dbLogger } = require('../utils/logger');

class AgendaCustomRepository {
  constructor(dbConnection) {
    this.dbConnection = dbConnection;
    this.schema = process.env.EDITOR_CUSTOM_SCHEMA || 'EDITOR_CUSTOM';
    this.sequence = process.env.AGND_AGENDA_SEQUENCE || 'SEQ_AGND_AGENDA';
  }

  _mapRow(row) {
    return {
      codigo_agenda: row[0],
      codigo_consultorio: row[1],
      codigo_prestador: row[2],
      codigo_item_agendamiento: row[3],
      codigo_dia: row[4],
      hora_inicio: row[5],
      hora_fin: row[6],
      tipo: row[7]
    };
  }

  async findAll() {
    try {
      const query = `
        SELECT 
          a.CD_AGENDA,
          a.CD_CONSULTORIO,
          a.CD_PRESTADOR,
          a.CD_ITEM_AGENDAMENTO,
          a.CD_DIA,
          a.HORA_INICIO,
          a.HORA_FIN,
          a.TIPO
        FROM ${this.schema}.AGND_AGENDA a
        ORDER BY a.CD_AGENDA
      `;
      const result = await this.dbConnection.execute(query);
      return result.rows.map(row => this._mapRow(row));
    } catch (error) {
      dbLogger.dbError('AGND findAll', error);
      throw new DatabaseError('Error al consultar AGND_AGENDA', error);
    }
  }

  async findById(id) {
    try {
      const query = `
        SELECT 
          a.CD_AGENDA,
          a.CD_CONSULTORIO,
          a.CD_PRESTADOR,
          a.CD_ITEM_AGENDAMENTO,
          a.CD_DIA,
          a.HORA_INICIO,
          a.HORA_FIN,
          a.TIPO
        FROM ${this.schema}.AGND_AGENDA a
        WHERE a.CD_AGENDA = :id
      `;
      const result = await this.dbConnection.execute(query, [id]);
      if (result.rows.length === 0) throw new NotFoundError('AGND_AGENDA');
      return this._mapRow(result.rows[0]);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      dbLogger.dbError('AGND findById', error, { id });
      throw new DatabaseError('Error al consultar AGND_AGENDA por ID', error);
    }
  }

  async create(data) {
    try {
      // Obtener ID
      const nextId = await this._getNextId();

      const query = `
        INSERT INTO ${this.schema}.AGND_AGENDA (
          CD_AGENDA, CD_CONSULTORIO, CD_PRESTADOR, CD_ITEM_AGENDAMENTO, CD_DIA, HORA_INICIO, HORA_FIN, TIPO
        ) VALUES (
          :cd_agenda, :cd_consultorio, :cd_prestador, :cd_item, :cd_dia,
          TO_DATE(:hora_inicio, 'YYYY-MM-DD HH24:MI'),
          TO_DATE(:hora_fin, 'YYYY-MM-DD HH24:MI'),
          :tipo
        )
      `;
      const params = {
        cd_agenda: nextId,
        cd_consultorio: data.codigo_consultorio,
        cd_prestador: data.codigo_prestador,
        cd_item: data.codigo_item_agendamiento,
        cd_dia: data.codigo_dia,
        hora_inicio: data.hora_inicio,
        hora_fin: data.hora_fin,
        tipo: data.tipo ? String(data.tipo).trim().toUpperCase().slice(0, 1) : null
      };
      await this.dbConnection.execute(query, params, { autoCommit: true });
      dbLogger.dbSuccess('AGND create', data);
      return { id: nextId };
    } catch (error) {
      dbLogger.dbError('AGND create', error, data);
      throw new DatabaseError('Error al crear registro en AGND_AGENDA', error);
    }
  }

  async update(id, data) {
    try {
      // verificar existencia
      await this.findById(id);

      const updates = [];
      const params = { id };
      if (data.codigo_consultorio) { updates.push('CD_CONSULTORIO = :cd_consultorio'); params.cd_consultorio = data.codigo_consultorio; }
      if (data.codigo_prestador) { updates.push('CD_PRESTADOR = :cd_prestador'); params.cd_prestador = data.codigo_prestador; }
      if (data.codigo_item_agendamiento) { updates.push('CD_ITEM_AGENDAMENTO = :cd_item'); params.cd_item = data.codigo_item_agendamiento; }
      if (data.codigo_dia) { updates.push('CD_DIA = :cd_dia'); params.cd_dia = data.codigo_dia; }
      if (data.hora_inicio) { updates.push("HORA_INICIO = TO_DATE(:hora_inicio, 'YYYY-MM-DD HH24:MI')"); params.hora_inicio = data.hora_inicio; }
      if (data.hora_fin) { updates.push("HORA_FIN = TO_DATE(:hora_fin, 'YYYY-MM-DD HH24:MI')"); params.hora_fin = data.hora_fin; }
      if (data.tipo !== undefined) { updates.push('TIPO = :tipo'); params.tipo = String(data.tipo).trim().toUpperCase().slice(0, 1); }

      if (updates.length === 0) return true;

      const query = `UPDATE ${this.schema}.AGND_AGENDA SET ${updates.join(', ')} WHERE CD_AGENDA = :id`;
      await this.dbConnection.execute(query, params, { autoCommit: true });
      dbLogger.dbSuccess('AGND update', { id, data });
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      dbLogger.dbError('AGND update', error, { id, data });
      throw new DatabaseError('Error al actualizar AGND_AGENDA', error);
    }
  }

  async remove(id) {
    try {
      await this.findById(id);
      await this.dbConnection.execute(
        `DELETE FROM ${this.schema}.AGND_AGENDA WHERE CD_AGENDA = :id`,
        [id],
        { autoCommit: true }
      );
      dbLogger.dbSuccess('AGND delete', { id });
      return true;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      dbLogger.dbError('AGND delete', error, { id });
      throw new DatabaseError('Error al eliminar AGND_AGENDA', error);
    }
  }
}

module.exports = AgendaCustomRepository;

// Métodos privados
AgendaCustomRepository.prototype._getNextId = async function _getNextId() {
  // Intentar con secuencia configurada
  try {
    const result = await this.dbConnection.execute(`SELECT ${this.schema}.${this.sequence}.NEXTVAL FROM DUAL`);
    const id = result?.rows?.[0]?.[0];
    if (id) return id;
  } catch (e) {
    dbLogger.warn('Secuencia no disponible, usando MAX+1', { sequence: this.sequence, error: e.message });
  }

  // Fallback a MAX+1 (no ideal para alta concurrencia)
  const maxRes = await this.dbConnection.execute(`SELECT NVL(MAX(CD_AGENDA),0)+1 FROM ${this.schema}.AGND_AGENDA`);
  return maxRes.rows[0][0];
};


