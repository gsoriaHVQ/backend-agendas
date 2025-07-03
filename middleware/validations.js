'use strict';
const validateAgenda = (req, res, next) => next();
const validateAgendaUpdate = (req, res, next) => next();
const validateId = (req, res, next) => next();
const validateCodigoPrestador = (req, res, next) => next();

module.exports = {
  validateAgenda,
  validateAgendaUpdate,
  validateId,
  validateCodigoPrestador
};
