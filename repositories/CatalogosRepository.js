const { DatabaseError } = require('../utils/errors');
const { dbLogger } = require('../utils/logger');

class CatalogosRepository {
  constructor(dbConnection) {
    this.dbConnection = dbConnection;
    this.schema = process.env.EDITOR_CUSTOM_SCHEMA || 'EDITOR_CUSTOM';
  }

  async getConsultorios() {
    try {
      const query = `
        SELECT 
          c.CD_CONSULTORIO,
          c.DES_CONSULTORIO,
          c.CD_EDIFICIO,
          c.CD_PISO
        FROM ${this.schema}.AGND_CONSULTORIO c
        ORDER BY c.CD_CONSULTORIO
      `;

      const result = await this.dbConnection.execute(query);
      return result.rows.map(row => ({
        codigo_consultorio: row[0],
        descripcion_consultorio: row[1],
        codigo_edificio: row[2],
        codigo_piso: row[3]
      }));
    } catch (error) {
      dbLogger.dbError('getConsultorios', error);
      throw new DatabaseError('Error al consultar consultorios', error);
    }
  }

  async getDias() {
    try {
      const query = `
        SELECT d.CD_DIA, d.DES_DIA
        FROM ${this.schema}.AGND_DIA d
        ORDER BY d.CD_DIA
      `;
      const result = await this.dbConnection.execute(query);
      return result.rows.map(row => ({
        codigo_dia: row[0],
        descripcion_dia: row[1]
      }));
    } catch (error) {
      dbLogger.dbError('getDias', error);
      throw new DatabaseError('Error al consultar días', error);
    }
  }

  async getEdificios() {
    try {
      const query = `
        SELECT e.CD_EDIFICIO, e.DES_EDIFICIO
        FROM ${this.schema}.AGND_EDIFICIO e
        ORDER BY e.CD_EDIFICIO
      `;
      const result = await this.dbConnection.execute(query);
      return result.rows.map(row => ({
        codigo_edificio: row[0],
        descripcion_edificio: row[1]
      }));
    } catch (error) {
      dbLogger.dbError('getEdificios', error);
      throw new DatabaseError('Error al consultar edificios', error);
    }
  }

  async getPisosByEdificio(codigoEdificio) {
    try {
      const query = `
        SELECT p.CD_PISO, p.CD_EDIFICIO, p.DES_PISO
        FROM ${this.schema}.AGND_EDIFICIO_PISO p
        WHERE p.CD_EDIFICIO = :cd
        ORDER BY p.CD_PISO
      `;
      const result = await this.dbConnection.execute(query, [codigoEdificio]);
      return result.rows.map(row => ({
        codigo_piso: row[0],
        codigo_edificio: row[1],
        descripcion_piso: row[2]
      }));
    } catch (error) {
      dbLogger.dbError('getPisosByEdificio', error, { codigoEdificio });
      throw new DatabaseError('Error al consultar pisos del edificio', error);
    }
  }
}

module.exports = CatalogosRepository;


