const CatalogosRepository = require('../repositories/CatalogosRepository');
const { ValidationError } = require('../utils/errors');
const { apiLogger } = require('../utils/logger');

class CatalogosService {
  constructor(dbConnection) {
    this.repository = new CatalogosRepository(dbConnection);
  }

  async obtenerConsultorios() {
    apiLogger.info('Obteniendo consultorios');
    const data = await this.repository.getConsultorios();
    return { data, total: data.length, message: 'Consultorios obtenidos' };
  }

  async obtenerDias() {
    apiLogger.info('Obteniendo días');
    const data = await this.repository.getDias();
    return { data, total: data.length, message: 'Días obtenidos' };
  }

  async obtenerEdificios() {
    apiLogger.info('Obteniendo edificios');
    const data = await this.repository.getEdificios();
    return { data, total: data.length, message: 'Edificios obtenidos' };
  }

  async obtenerPisosPorEdificio(codigoEdificio) {
    if (!codigoEdificio || isNaN(codigoEdificio)) {
      throw new ValidationError('Código de edificio inválido');
    }
    apiLogger.info('Obteniendo pisos por edificio', { codigoEdificio });
    const data = await this.repository.getPisosByEdificio(parseInt(codigoEdificio));
    return { data, total: data.length, message: 'Pisos obtenidos' };
  }
}

module.exports = CatalogosService;


