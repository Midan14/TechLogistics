const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const dbConfig = {
  database: 'TechLogistics',
  username: 'techlogistics',
  password: '',
  host: '127.0.0.1',
  port: 3308,
  dialect: 'mysql',
  dialectOptions: {
    connectTimeout: 20000,
    charset: 'utf8mb4',
    timezone: '+00:00',
    dateStrings: true
  },
  pool: {
    max: 2,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    max: 3
  },
  logging: false
};

// Crear instancia de Sequelize
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);

// Función para probar la conexión
const testConnection = async () => {
  try {
    console.log('Intentando conectar a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', {
      message: error.message,
      name: error.name,
      code: error.parent?.code,
      errno: error.parent?.errno
    });
    return false;
  }
};

// Exportar la instancia de Sequelize
module.exports = sequelize;
