// middleware/errorMiddleware.js

import { logError } from "../config/logger.js";

/**
 * Middleware para capturar errores no manejados
 */
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Registrar el error
  logError("Error no manejado", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id || "anonymous",
  });

  // Determinar mensaje de error apropiado para el usuario
  let mensaje = "Error interno del servidor";
  if (statusCode < 500) {
    mensaje = err.message;
  }

  // Respuesta al cliente
  res.status(statusCode).json({
    status: "error",
    message: mensaje,
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err.details,
    }),
  });
};

/**
 * Middleware para manejar rutas no encontradas
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: "error",
    message: `Ruta no encontrada: ${req.originalUrl}`,
  });
};

/**
 * Clase para crear errores personalizados con códigos de estado
 */
export class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.date = new Date();

    Error.captureStackTrace(this, this.constructor);
  }
}

export default {
  errorHandler,
  notFoundHandler,
  AppError,
};
