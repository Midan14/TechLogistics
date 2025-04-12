// models/index.js
import fs from "fs/promises";
import path, { dirname } from "path";
import { Sequelize, DataTypes } from "sequelize";
import { fileURLToPath, pathToFileURL } from "url";
import { logError, logInfo } from "../config/logger.js";

// Obtener __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const basename = path.basename(__filename);

// Obtener configuración de la base de datos desde variables de entorno
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
    // No usar sockets en Windows para evitar problemas
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

// Cargar todos los modelos dinámicamente
const loadModels = async () => {
  try {
    // Leer todos los archivos en el directorio
    const files = await fs.readdir(__dirname);

    // Filtrar archivos de modelo (excluyendo index.js)
    const modelFiles = files.filter(
      (file) =>
        file.endsWith(".js") && file !== basename && !file.endsWith(".test.js"),
    );

    // Cargar cada modelo
    for (const file of modelFiles) {
      try {
        // Convertir ruta a formato URL para import dinámico
        const filePath = pathToFileURL(path.join(__dirname, file)).href;

        // Importar el modelo
        const { default: defineModel } = await import(filePath);

        // Verificar que el modelo exporte una función
        if (typeof defineModel !== "function") {
          console.error(`⚠️ El archivo ${file} no exporta una función válida.`);
          continue;
        }

        // Inicializar el modelo con sequelize y DataTypes
        const model = defineModel(sequelize, DataTypes);

        // Verificar que el modelo se haya definido correctamente
        if (!model || !model.name) {
          console.error(`⚠️ El modelo en ${file} no se definió correctamente.`);
          continue;
        }

        // Añadir el modelo al objeto db
        db[model.name] = model;
        logInfo(`Modelo ${model.name} cargado correctamente`);
      } catch (modelError) {
        logError(`Error al cargar el modelo ${file}`, modelError);
      }
    }

    // Establecer asociaciones entre modelos
    Object.keys(db).forEach((modelName) => {
      if (
        db[modelName].associate &&
        typeof db[modelName].associate === "function"
      ) {
        db[modelName].associate(db);
        logInfo(`Asociaciones establecidas para ${modelName}`);
      }
    });

    return db;
  } catch (error) {
    logError("Error al cargar los modelos", error);
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
    logInfo("Modelos inicializados correctamente", {
      modelos: Object.keys(db).filter(
        (k) => k !== "sequelize" && k !== "Sequelize",
      ),
    });

    return db;
  } catch (error) {
    logError("Error al inicializar modelos", error);
    throw error;
  }
};

// Exportar el objeto db con todos los modelos y la instancia de sequelize
export { sequelize, Sequelize };
export default db;
