// backend/src/config/database.js

import { Sequelize } from "sequelize";
import "dotenv/config";
import { validateEnvVars } from "./envVars.js";
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
      timezone: process.env.DB_TIMEZONE || "+00:00",
    },
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

// Inicializar Sequelize con manejo de errores mejorado
const initializeSequelize = () => {
  try {
    // Validar variables de entorno antes de inicializar
    validateEnvVars();

    const config = getSequelizeConfig();
    logger.debug("Configuración de Sequelize:", {
      host: config.host,
      port: config.port,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
    });

    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      config,
    );

    // Agregar manejadores de eventos
    sequelize.afterConnect((connection) => {
      logger.info("Conexión establecida con la base de datos");
    });

    sequelize.afterDisconnect(() => {
      logger.info("Desconexión de la base de datos");
    });

    return sequelize;
  } catch (error) {
    logger.error("Error al inicializar Sequelize:", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
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
      config: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
      },
    });
    throw error;
  }
};

// Función para cerrar la conexión de manera segura
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

// Función para sincronizar modelos con la base de datos
export const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    logger.info(
      `Base de datos ${force ? "recreada" : "sincronizada"} correctamente`,
    );
  } catch (error) {
    logger.error("Error al sincronizar la base de datos:", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

// Manejadores de eventos del proceso
process.on("SIGINT", async () => {
  try {
    await closeConnection();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
});

process.on("SIGTERM", async () => {
  try {
    await closeConnection();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
});

export default sequelize;
