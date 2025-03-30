import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'TechLogistics',  // Nombre de la base de datos
  process.env.DB_USER || 'root',      // Nombre de usuario de la base de datos
  process.env.DB_PASSWORD || '',          // Contraseña de la base de datos
  {
    host: process.env.DB_HOST || 'localhost',        // Host de la base de datos
    dialect: 'mysql',                         // El dialecto de la base de datos (mysql, postgres, etc.)
    port: process.env.DB_PORT || 3308,           // Puerto de la base de datos
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    //logging: false
  }
);

export default sequelize;
