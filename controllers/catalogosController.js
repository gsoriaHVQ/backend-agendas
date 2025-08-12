//Gestion de edificios, pisos, consultorios, dias

const getConnection = require('../db/connect');
const CatalogosService = require('../services/CatalogosService');
const { errorHandler } = require('../utils/errors');
const { apiLogger } = require('../utils/logger');

const getConsultorios = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const service = new CatalogosService(connection);
    const result = await service.obtenerConsultorios();
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    errorHandler(error, req, res, () => {});
  } finally {
    if (connection) { try { await connection.close(); } catch (e) { apiLogger.error('close', { e }); } }
  }
};

const getDias = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const service = new CatalogosService(connection);
    const result = await service.obtenerDias();
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    errorHandler(error, req, res, () => {});
  } finally {
    if (connection) { try { await connection.close(); } catch (e) { apiLogger.error('close', { e }); } }
  }
};

const getEdificios = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const service = new CatalogosService(connection);
    const result = await service.obtenerEdificios();
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    errorHandler(error, req, res, () => {});
  } finally {
    if (connection) { try { await connection.close(); } catch (e) { apiLogger.error('close', { e }); } }
  }
};

const getPisosPorEdificio = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const service = new CatalogosService(connection);
    const result = await service.obtenerPisosPorEdificio(req.params.codigo_edificio);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    errorHandler(error, req, res, () => {});
  } finally {
    if (connection) { try { await connection.close(); } catch (e) { apiLogger.error('close', { e }); } }
  }
};

module.exports = {
  getConsultorios,
  getDias,
  getEdificios,
  getPisosPorEdificio
};


