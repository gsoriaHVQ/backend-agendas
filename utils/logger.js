class Logger {
  static levels = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  };

  constructor(context = 'App') {
    this.context = context;
    this.level = process.env.LOG_LEVEL || 'INFO';
  }

  _shouldLog(level) {
    return Logger.levels[level] <= Logger.levels[this.level];
  }

  _formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta) : '';
    return `[${timestamp}] [${level}] [${this.context}] ${message} ${metaString}`;
  }

  error(message, meta = {}) {
    if (this._shouldLog('ERROR')) {
      console.error(this._formatMessage('ERROR', message, meta));
    }
  }

  warn(message, meta = {}) {
    if (this._shouldLog('WARN')) {
      console.warn(this._formatMessage('WARN', message, meta));
    }
  }

  info(message, meta = {}) {
    if (this._shouldLog('INFO')) {
      console.info(this._formatMessage('INFO', message, meta));
    }
  }

  debug(message, meta = {}) {
    if (this._shouldLog('DEBUG')) {
      console.debug(this._formatMessage('DEBUG', message, meta));
    }
  }

  // Método específico para errores de BD
  dbError(operation, error, meta = {}) {
    this.error(`Database operation failed: ${operation}`, {
      ...meta,
      error: error.message,
      stack: error.stack
    });
  }

  // Método específico para operaciones exitosas de BD
  dbSuccess(operation, meta = {}) {
    this.info(`Database operation successful: ${operation}`, meta);
  }
}

// Crear instancias específicas para diferentes contextos
const appLogger = new Logger('App');
const dbLogger = new Logger('Database');
const apiLogger = new Logger('API');

module.exports = {
  Logger,
  appLogger,
  dbLogger,
  apiLogger
};
