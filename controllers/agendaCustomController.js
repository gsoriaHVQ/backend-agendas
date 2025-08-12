//Gestion de agendas
const getConnection = require('../db/connect');
const AgendaCustomService = require('../services/AgendaCustomService');
const { errorHandler } = require('../utils/errors');
const { apiLogger } = require('../utils/logger');

const listar = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const service = new AgendaCustomService(connection);
    const result = await service.listar();
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    errorHandler(error, req, res, () => {});
  } finally {
    if (connection) { try { await connection.close(); } catch (e) { apiLogger.error('close', { e }); } }
  }
};

const obtener = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const service = new AgendaCustomService(connection);
    const result = await service.obtener(req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    errorHandler(error, req, res, () => {});
  } finally {
    if (connection) { try { await connection.close(); } catch (e) { apiLogger.error('close', { e }); } }
  }
};

const crear = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const service = new AgendaCustomService(connection);
    const result = await service.crear(req.body);
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    errorHandler(error, req, res, () => {});
  } finally {
    if (connection) { try { await connection.close(); } catch (e) { apiLogger.error('close', { e }); } }
  }
};

const actualizar = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const service = new AgendaCustomService(connection);
    const result = await service.actualizar(req.params.id, req.body);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    errorHandler(error, req, res, () => {});
  } finally {
    if (connection) { try { await connection.close(); } catch (e) { apiLogger.error('close', { e }); } }
  }
};

const eliminar = async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const service = new AgendaCustomService(connection);
    const result = await service.eliminar(req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    errorHandler(error, req, res, () => {});
  } finally {
    if (connection) { try { await connection.close(); } catch (e) { apiLogger.error('close', { e }); } }
  }
};

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar
};


