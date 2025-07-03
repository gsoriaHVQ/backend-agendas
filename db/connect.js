const oracledb = require('oracledb');

// Configuración de la base de datos
const dbConfig = {
  user: process.env.DB_USER || 'tu_usuario',
  password: process.env.DB_PASSWORD || 'tu_password',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/XE',
  // Opcional: configuraciones adicionales
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 300
};

// Función para obtener una conexión
async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    console.log('Conexión a la base de datos establecida');
    return connection;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    throw error;
  }
}

// Función para inicializar el pool de conexiones (opcional)
async function initializePool() {
  try {
    await oracledb.createPool(dbConfig);
    console.log('Pool de conexiones inicializado');
  } catch (error) {
    console.error('Error al inicializar el pool:', error);
    throw error;
  }
}

// Función para cerrar el pool
async function closePool() {
  try {
    await oracledb.getPool().close();
    console.log('Pool de conexiones cerrado');
  } catch (error) {
    console.error('Error al cerrar el pool:', error);
  }
}

module.exports = getConnection;
module.exports.initializePool = initializePool;
module.exports.closePool = closePool; 