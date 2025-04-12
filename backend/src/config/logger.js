import winston from "winston";
import path from "path";
import fs from "fs";
import DailyRotateFile from "winston-daily-rotate-file";
import "winston-mongodb";

// Constantes de configuración
const LOG_CONFIG = {
  DIR: process.env.LOG_FILE_PATH || "logs",
  MAX_SIZE: process.env.LOG_MAX_SIZE || "10m",
  MAX_FILES: process.env.LOG_MAX_FILES || "7d",
  FORMAT: process.env.LOG_FORMAT || "combined",
  LEVEL: process.env.LOG_LEVEL || "info",
};

// Crear directorio de logs si no existe
if (!fs.existsSync(LOG_CONFIG.DIR)) {
  fs.mkdirSync(LOG_CONFIG.DIR, { recursive: true });
}

// Configuración de formatos personalizados
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss.SSS",
  }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({
    fillExcept: ["timestamp", "level", "message", "stack"],
  }),
  winston.format.printf(({ timestamp, level, message, metadata, stack }) => {
    let log = `${timestamp} | ${level.toUpperCase().padEnd(5)} | ${message}`;

    // Agregar metadata si existe y no está vacío
    if (metadata && Object.keys(metadata).length > 0) {
      log += ` | ${JSON.stringify(metadata)}`;
    }

    // Agregar stack trace si existe
    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  }),
);

// Configuración de colores personalizados
const customColors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
  silly: "gray",
};

winston.addColors(customColors);

// Configuración de transportes
const getTransports = () => {
  const transports = [];

  // Transport para archivos rotatorios de error
  transports.push(
    new DailyRotateFile({
      filename: path.join(LOG_CONFIG.DIR, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      maxSize: LOG_CONFIG.MAX_SIZE,
      maxFiles: LOG_CONFIG.MAX_FILES,
      format: winston.format.combine(winston.format.uncolorize(), customFormat),
    }),
  );

  // Transport para todos los logs
  transports.push(
    new DailyRotateFile({
      filename: path.join(LOG_CONFIG.DIR, "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      maxSize: LOG_CONFIG.MAX_SIZE,
      maxFiles: LOG_CONFIG.MAX_FILES,
      format: winston.format.combine(winston.format.uncolorize(), customFormat),
    }),
  );

  // Transport para consola en desarrollo
  if (process.env.NODE_ENV !== "production") {
    transports.push(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize({ all: true }),
          customFormat,
        ),
      }),
    );
  }

  return transports;
};

// Crear el logger
const logger = winston.createLogger({
  level: LOG_CONFIG.LEVEL,
  format: customFormat,
  defaultMeta: {
    service: "techlogistics-api",
    environment: process.env.NODE_ENV || "development",
    version: process.env.API_VERSION || "1.0.0",
  },
  transports: getTransports(),
  exitOnError: false,
});

// Funciones helper mejoradas
export const logError = (message, error = null) => {
  const logData = {
    message,
    ...(error && {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        ...(error.code && { code: error.code }),
        ...(error.status && { status: error.status }),
      },
    }),
  };
  logger.error(logData);
};

export const logInfo = (message, data = {}) => {
  logger.info(message, { ...data });
};

export const logWarning = (message, data = {}) => {
  logger.warn(message, { ...data });
};

export const logDebug = (message, data = {}) => {
  logger.debug(message, { ...data });
};

export const logHttp = (message, meta = {}) => {
  logger.http(message, { ...meta });
};

// Middleware para Express
export const httpLogger = (req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("user-agent"),
      ip: req.ip,
    });
  });
  next();
};

// Manejador de errores no capturados
process.on("uncaughtException", (error) => {
  logError("Uncaught Exception", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logError("Unhandled Rejection", reason);
});

// Manejar errores del logger
logger.on("error", (error) => {
  console.error("Error en el logger:", error);
});

export { logger };
export default logger;
