const oracledb = require('oracledb');

// Configuración de la base de datos
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECT_STRING,
  
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 300
};

async function getConnection() {
  try {
    const connection = await oracledb.getConnection(dbConfig);
    return connection;
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    throw error;
  }
}

// pool de conexiones a la BD
async function initializePool() {
  try {
    await oracledb.createPool(dbConfig);
  } catch (error) {
    console.error('Error al inicializar el pool:', error);
    throw error;
  }
}


async function closePool() {
  try {
    await oracledb.getPool().close();
  } catch (error) {
    console.error('Error al cerrar el pool:', error);
  }
}

module.exports = getConnection;
module.exports.initializePool = initializePool;
module.exports.closePool = closePool; 