const { DatabaseError } = require('../utils/errors');
const { dbLogger } = require('../utils/logger');

class MedicoRepository {
  constructor(dbConnection) {
    this.dbConnection = dbConnection;
  }

//Consulta de medicos a la BD
  _getBaseQuery() {
    return `
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
    `;
  }

  /**
   * Mapea una fila de la BD a un objeto médico
   */
  _mapRowToMedico(row) {
    return {
      codigo_prestador: row[0],
      nombre_prestador: row[1],
      mnemonico: row[2],
      codigo_item_agendamiento: row[3],
      descripcion_agendamiento: row[4]
    };
  }

  /**
   * Obtiene todos los médicos con sus especialidades
   */
  async findAll() {
    try {
      dbLogger.info('Consultando todos los médicos');
      
      const query = this._getBaseQuery() + ' ORDER BY pr.NM_PRESTADOR, ia.DS_ITEM_AGENDAMENTO';
      const result = await this.dbConnection.execute(query);
      
      const medicos = result.rows.map(row => this._mapRowToMedico(row));
      
      dbLogger.dbSuccess('findAll médicos', { count: medicos.length });
      return medicos;
      
    } catch (error) {
      dbLogger.dbError('findAll médicos', error);
      throw new DatabaseError('Error al consultar médicos', error);
    }
  }

  /**
   * Busca médicos por especialidad
   */
  async findByEspecialidad(especialidad) {
    try {
      dbLogger.info('Consultando médicos por especialidad', { especialidad });
      
      const query = this._getBaseQuery() + 
        ' AND LOWER(ia.DS_ITEM_AGENDAMENTO) LIKE :especialidad' +
        ' ORDER BY pr.NM_PRESTADOR, ia.DS_ITEM_AGENDAMENTO';
      
      const result = await this.dbConnection.execute(query, [`%${especialidad.toLowerCase()}%`]);
      const medicos = result.rows.map(row => this._mapRowToMedico(row));
      
      dbLogger.dbSuccess('findByEspecialidad médicos', { especialidad, count: medicos.length });
      return medicos;
      
    } catch (error) {
      dbLogger.dbError('findByEspecialidad médicos', error, { especialidad });
      throw new DatabaseError('Error al consultar médicos por especialidad', error);
    }
  }

  /**
   * Busca médicos por código de item
   */
  async findByCodigoItem(codigoItem) {
    try {
      dbLogger.info('Consultando médicos por código de item', { codigoItem });
      
      const query = this._getBaseQuery() + 
        ' AND ia.CD_ITEM_AGENDAMENTO = :codigo_item' +
        ' ORDER BY pr.NM_PRESTADOR, ia.DS_ITEM_AGENDAMENTO';
      
      const result = await this.dbConnection.execute(query, [codigoItem]);
      const medicos = result.rows.map(row => this._mapRowToMedico(row));
      
      dbLogger.dbSuccess('findByCodigoItem médicos', { codigoItem, count: medicos.length });
      return medicos;
      
    } catch (error) {
      dbLogger.dbError('findByCodigoItem médicos', error, { codigoItem });
      throw new DatabaseError('Error al consultar médicos por código de item', error);
    }
  }

  /**
   * Busca médicos por nombre
   */
  async findByNombre(nombre) {
    try {
      dbLogger.info('Consultando médicos por nombre', { nombre });
      
      const query = this._getBaseQuery() + 
        ' AND LOWER(pr.NM_PRESTADOR) LIKE :nombre' +
        ' ORDER BY pr.NM_PRESTADOR, ia.DS_ITEM_AGENDAMENTO';
      
      const result = await this.dbConnection.execute(query, [`%${nombre.toLowerCase()}%`]);
      const medicos = result.rows.map(row => this._mapRowToMedico(row));
      
      dbLogger.dbSuccess('findByNombre médicos', { nombre, count: medicos.length });
      return medicos;
      
    } catch (error) {
      dbLogger.dbError('findByNombre médicos', error, { nombre });
      throw new DatabaseError('Error al consultar médicos por nombre', error);
    }
  }

  /**
   * Obtiene solo las especialidades disponibles
   */
  async findEspecialidades() {
    try {
      dbLogger.info('Consultando especialidades disponibles');
      
      const query = `
        SELECT DISTINCT
          ia.CD_ITEM_AGENDAMENTO,
          ia.DS_ITEM_AGENDAMENTO
        FROM DBAMV.AGENDA_CENTRAL ac
        JOIN DBAMV.AGENDA_CENTRAL_ITEM_AGENDA acia ON acia.CD_AGENDA_CENTRAL = ac.CD_AGENDA_CENTRAL
        JOIN DBAMV.ITEM_AGENDAMENTO ia ON ia.CD_ITEM_AGENDAMENTO = acia.CD_ITEM_AGENDAMENTO
        WHERE ia.SN_ATIVO = 'S'
        ORDER BY ia.DS_ITEM_AGENDAMENTO
      `;
      
      const result = await this.dbConnection.execute(query);
      
      const especialidades = result.rows.map(row => ({
        codigo_especialidad: row[0],
        nombre_especialidad: row[1]
      }));
      
      dbLogger.dbSuccess('findEspecialidades', { count: especialidades.length });
      return especialidades;
      
    } catch (error) {
      dbLogger.dbError('findEspecialidades', error);
      throw new DatabaseError('Error al consultar especialidades', error);
    }
  }

  
}

module.exports = MedicoRepository;
