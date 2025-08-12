//manejo de errores
class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, errors = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

class DatabaseError extends AppError {
  constructor(message, originalError = null) {
    super(message, 500, 'DATABASE_ERROR');
    this.originalError = originalError;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
    this.resource = resource;
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT');
  }
}

// Middleware de manejo de errores
const errorHandler = (err, req, res, next) => {
  const { apiLogger } = require('./logger');
  
  // Log del error
  apiLogger.error('Request error', {
    url: req.url,
    method: req.method,
    error: err.message,
    stack: err.stack
  });

  // Si es un error operacional conocido
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      errorCode: err.errorCode,
      ...(err.errors && { errors: err.errors })
    });
  }

  // Error no manejado - no exponer detalles en producción
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.status(500).json({
    success: false,
    error: isProduction ? 'Error interno del servidor' : err.message,
    errorCode: 'INTERNAL_ERROR',
    ...(isProduction ? {} : { stack: err.stack })
  });
};

// Handler para rutas no encontradas
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta ${req.method} ${req.path} no encontrada`,
    errorCode: 'ROUTE_NOT_FOUND'
  });
};

module.exports = {
  AppError,
  ValidationError,
  DatabaseError,
  NotFoundError,
  ConflictError,
  errorHandler,
  notFoundHandler
};
