const AgendaCustomRepository = require('../repositories/AgendaCustomRepository');
const { ValidationError } = require('../utils/errors');
const { apiLogger } = require('../utils/logger');

class AgendaCustomService {
  constructor(dbConnection) {
    this.repository = new AgendaCustomRepository(dbConnection);
  }

  _validatePayload(data, isUpdate = false) {
    const errors = [];
    const isPositive = v => !isNaN(v) && parseInt(v) > 0;

    if (!isUpdate) {
      if (!isPositive(data.codigo_consultorio)) errors.push('CD_CONSULTORIO requerido y positivo');
      if (!isPositive(data.codigo_prestador)) errors.push('CD_PRESTADOR requerido y positivo');
      if (!isPositive(data.codigo_item_agendamiento)) errors.push('CD_ITEM_AGENDAMENTO requerido y positivo');
      if (!isPositive(data.codigo_dia)) errors.push('CD_DIA requerido y positivo');
      if (!data.hora_inicio) errors.push('HORA_INICIO requerida');
      if (!data.hora_fin) errors.push('HORA_FIN requerida');
      if (data.tipo === undefined || data.tipo === null || String(data.tipo).trim() === '') errors.push('TIPO requerido');
    }

    const timeIsDate = v => v instanceof Date || (typeof v === 'string');
    if (data.hora_inicio && !timeIsDate(data.hora_inicio)) errors.push('HORA_INICIO inválida');
    if (data.hora_fin && !timeIsDate(data.hora_fin)) errors.push('HORA_FIN inválida');

    if (data.tipo !== undefined) {
      const t = String(data.tipo).trim().toUpperCase();
      if (t.length !== 1) errors.push('TIPO debe ser un solo carácter');
    }

    if (errors.length) throw new ValidationError('Datos inválidos para AGND_AGENDA', errors);
  }

  async listar() {
    const data = await this.repository.findAll();
    return { data, total: data.length, message: 'Agendas personalizadas obtenidas' };
  }

  async obtener(id) {
    if (!id || isNaN(id)) throw new ValidationError('ID inválido');
    const data = await this.repository.findById(parseInt(id));
    return { data };
  }

  async crear(payload) {
    // Normalizar TIPO (aceptar cualquier variante de mayúsculas/minúsculas)
    const keyTipo = Object.keys(payload).find(k => k.toLowerCase() === 'tipo');
    if (keyTipo && keyTipo !== 'tipo') {
      payload.tipo = payload[keyTipo];
    }
    this._validatePayload(payload, false);
    // Se asume que hora_inicio y hora_fin vienen como Date o string compatible con Oracle
    apiLogger.info('Creando AGND_AGENDA', payload);
    await this.repository.create(payload);
    return { message: 'Registro creado en AGND_AGENDA' };
  }

  async actualizar(id, payload) {
    if (!id || isNaN(id)) throw new ValidationError('ID inválido');
    // Normalizar TIPO (aceptar cualquier variante de mayúsculas/minúsculas)
    const keyTipo = Object.keys(payload).find(k => k.toLowerCase() === 'tipo');
    if (keyTipo && keyTipo !== 'tipo') {
      payload.tipo = payload[keyTipo];
    }
    this._validatePayload(payload, true);
    await this.repository.update(parseInt(id), payload);
    return { message: 'Registro actualizado en AGND_AGENDA' };
  }

  async eliminar(id) {
    if (!id || isNaN(id)) throw new ValidationError('ID inválido');
    await this.repository.remove(parseInt(id));
    return { message: 'Registro eliminado de AGND_AGENDA' };
  }
}

module.exports = AgendaCustomService;


