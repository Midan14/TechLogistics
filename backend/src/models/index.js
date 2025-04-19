// src/models/index.js

import fs from "fs/promises";
import path, { dirname } from "path";
import { Sequelize, DataTypes } from "sequelize";
import { fileURLToPath, pathToFileURL } from "url";
import { logError, logInfo } from "../config/logger.js";

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const basename = path.basename(__filename);

// Configuración de la base de datos desde variables de entorno
const dbConfig = {
  database: process.env.DB_NAME || "TechLogistics",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT || "3306"),
  dialect: "mysql",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  dialectOptions: {
    connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || "20000"),
    socketPath: process.platform === "win32" ? undefined : undefined,
  },
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || "10"),
    min: parseInt(process.env.DB_POOL_MIN || "0"),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE || "30000"),
    idle: parseInt(process.env.DB_POOL_IDLE || "10000"),
  },
  timezone: process.env.DB_TIMEZONE || "+00:00",
};

// Crear instancia de Sequelize
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig,
);

// Objeto para almacenar todos los modelos
const db = {
  sequelize,
  Sequelize,
};

// Orden específico de carga de modelos
const modelOrder = [
  "Cliente.js",
  "Producto.js",
  "Transportista.js",
  "EstadoEnvio.js",
  "Ruta.js",
  "Pedido.js",
];

// Cargar todos los modelos en orden específico
const loadModels = async () => {
  try {
    // Cargar modelos en el orden especificado
    for (const modelFile of modelOrder) {
      const filePath = pathToFileURL(path.join(__dirname, modelFile)).href;

      try {
        const { default: defineModel } = await import(filePath);

        if (typeof defineModel !== "function") {
          logError(`El archivo ${modelFile} no exporta una función válida`);
          continue;
        }

        const model = defineModel(sequelize, DataTypes);

        if (!model || !model.name) {
          logError(`El modelo en ${modelFile} no se definió correctamente`);
          continue;
        }

        db[model.name] = model;
        logInfo(`Modelo ${model.name} cargado correctamente`);
      } catch (error) {
        logError(`Error al cargar el modelo ${modelFile}:`, error);
        throw error;
      }
    }

    // Establecer asociaciones después de que todos los modelos estén cargados
    for (const modelName of Object.keys(db)) {
      if (
        db[modelName].associate &&
        typeof db[modelName].associate === "function"
      ) {
        try {
          db[modelName].associate(db);
          logInfo(`Asociaciones establecidas para ${modelName}`);
        } catch (error) {
          logError(
            `Error al establecer asociaciones para ${modelName}:`,
            error,
          );
          throw error;
        }
      }
    }

    return db;
  } catch (error) {
    logError("Error al cargar los modelos:", error);
    throw error;
  }
};

// Función para inicializar los modelos y probar la conexión
export const initModels = async () => {
  try {
    // Cargar todos los modelos
    await loadModels();

    // Probar la conexión a la base de datos
    await sequelize.authenticate();
    logInfo("Conexión a la base de datos establecida correctamente");

    // Registrar modelos disponibles
    const modelNames = Object.keys(db).filter(
      (k) => k !== "sequelize" && k !== "Sequelize",
    );
    logInfo("Modelos inicializados correctamente", { modelos: modelNames });

    return db;
  } catch (error) {
    logError("Error al inicializar modelos:", error);
    throw error;
  }
};

// Manejador de errores de proceso
process.on("unhandledRejection", (error) => {
  logError("Unhandled Rejection:", error);
});

// Exportar el objeto db con todos los modelos y la instancia de sequelize
export { sequelize, Sequelize };
export default db;
