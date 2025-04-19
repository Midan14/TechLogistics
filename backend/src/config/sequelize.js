import { Sequelize } from "sequelize";
import path from "path";
import dotenv from "dotenv";

// Cargar variables de entorno desde el archivo .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Validar variables de entorno requeridas
const requiredEnvVars = [
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "DB_HOST",
  "DB_PORT",
];

const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missingVars.length > 0) {
  throw new Error(
    `Variables de entorno no definidas: ${missingVars.join(", ")}`,
  );
}

// Inicializar Sequelize con configuración mejorada
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10),
      min: parseInt(process.env.DB_POOL_MIN, 10),
      acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10),
      idle: parseInt(process.env.DB_POOL_IDLE, 10),
    },
    dialectOptions: {
      connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT, 10),
      socketPath: undefined, // Usa esto si necesitas un socket personalizado
    },
    timezone: process.env.DB_TIMEZONE || "+00:00", // Usar UTC para consistencia
  },
);

// Exportar la instancia de Sequelize
export { sequelize };
