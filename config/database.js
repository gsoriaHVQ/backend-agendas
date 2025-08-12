//configuracion de la base de datos
const oracledb = require('oracledb');

class DatabaseConfig {
  constructor() {
    this.config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,
      poolMin: parseInt(process.env.DB_POOL_MIN) || 2,
      poolMax: parseInt(process.env.DB_POOL_MAX) || 10,
      poolIncrement: parseInt(process.env.DB_POOL_INCREMENT) || 1,
      poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT) || 300
    };
    
    this.validateConfig();
  }

  validateConfig() {
    const requiredFields = ['user', 'password', 'connectString'];
    const missingFields = requiredFields.filter(field => !this.config[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Configuración de BD incompleta. Faltan: ${missingFields.join(', ')}`);
    }
  }

  getConfig() {
    return { ...this.config };
  }
}

module.exports = DatabaseConfig;
