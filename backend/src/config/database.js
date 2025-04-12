// backend/src/config/database.js

import { Sequelize } from "sequelize";
import "dotenv/config";
import { requiredEnvVars } from "./envVars.js";
import logger from "./logger.js";

// Configuraciones según el entorno
const environments = {
  development: {
    logging: (msg) => logger.debug(msg),
    debug: true,
  },
  test: {
    logging: false,
    debug: false,
  },
  production: {
    logging: false,
    debug: false,
  },
};

// Validar variables de entorno requeridas
const validateEnvVars = () => {
  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
  if (missingVars.length > 0) {
    throw new Error(
      `❌ Variables de entorno no definidas: ${missingVars.join(", ")}`,
    );
  }
};

// Configuración base de Sequelize
const getSequelizeConfig = () => {
  const env = process.env.NODE_ENV || "development";

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: "mysql",
    ...environments[env],
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || "10"),
      min: parseInt(process.env.DB_POOL_MIN || "0"),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE || "30000"),
      idle: parseInt(process.env.DB_POOL_IDLE || "10000"),
    },
    dialectOptions: {
      connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || "20000"),
      socketPath: undefined,
      ssl:
        process.env.DB_SSL === "true"
          ? {
              require: true,
              rejectUnauthorized: false,
            }
          : undefined,
    },
    timezone: process.env.DB_TIMEZONE || "+00:00",
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    retry: {
      max: 3,
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
      ],
    },
  };
};

// Inicializar Sequelize
const initializeSequelize = () => {
  validateEnvVars();

  const config = getSequelizeConfig();

  return new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    config,
  );
};

// Crear instancia de Sequelize
const sequelize = initializeSequelize();

// Función de prueba de conexión mejorada
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info("✅ Conexión a la base de datos establecida correctamente");
    return true;
  } catch (error) {
    logger.error("❌ Error de conexión a la base de datos:", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// Función para cerrar la conexión
export const closeConnection = async () => {
  try {
    await sequelize.close();
    logger.info("Conexión a la base de datos cerrada correctamente");
  } catch (error) {
    logger.error("Error al cerrar la conexión:", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// Manejadores de eventos de la conexión
sequelize.addHook("beforeConnect", async (config) => {
  logger.debug("Intentando conectar a la base de datos...");
});

sequelize.addHook("afterConnect", async (connection) => {
  logger.debug("Conexión establecida exitosamente");
});

export default sequelize;
