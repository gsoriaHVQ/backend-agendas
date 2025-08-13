const { fetchWithAuth } = require('../utils/httpClient');
const { apiLogger } = require('../utils/logger');

class ExternalMedicosService {
  constructor() {
    this.baseUrl = process.env.EXTERNAL_API_BASE_URL || 'http://10.129.180.161:36560/api3/v1';
    this.medicosPath = process.env.EXTERNAL_MEDICOS_ENDPOINT || '/medico';
    this.especialidadesPath = process.env.EXTERNAL_ESPECIALIDADES_ENDPOINT || '/Especialidades';
  }

  async obtenerMedicos(options = {}) {
    const urlBase = `${this.baseUrl}${this.medicosPath}`;
    const url = new URL(urlBase);
    const situationType = options.situationType || 'ACTIVE';
    if (situationType) url.searchParams.set('situationType', situationType);
    apiLogger.info('Llamando API externa de Médicos', { url });
    const res = await fetchWithAuth(url, { method: 'GET' });
    if (!res.ok) {
      let reason = '';
      try { reason = await res.text(); } catch (_) {}
      throw new Error(`Error al obtener médicos externos: ${res.status} | url=${url.toString()} | ${reason}`);
    }
    const data = await res.json();
    return data;
  }

  async obtenerEspecialidades() {
    const url = `${this.baseUrl}${this.especialidadesPath}`;
    apiLogger.info('Llamando API externa de Especialidades', { url });
    const res = await fetchWithAuth(url, { method: 'GET' });
    if (!res.ok) {
      let reason = '';
      try { reason = await res.text(); } catch (_) {}
      throw new Error(`Error al obtener especialidades externas: ${res.status} | url=${url} | ${reason}`);
    }
    const data = await res.json();
    return data;
  }
}

module.exports = ExternalMedicosService;


