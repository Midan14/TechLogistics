// rateLimitMiddleware.js
import rateLimit from "express-rate-limit";
import { logWarning } from "../config/logger.js";

/**
 * Crea un middleware de rate limiting con opciones personalizadas
 * @param {Object} options - Opciones de configuración
 */
export const createRateLimit = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000, // 15 minutos por defecto
    max: 100, // Límite de peticiones por ventana
    standardHeaders: true, // Devolver info en headers X-RateLimit-*
    legacyHeaders: false, // Desactivar headers X-RateLimit-* deprecated
    message: {
      status: "error",
      error: "Demasiadas peticiones",
      message: "Has excedido el límite de peticiones, intenta más tarde",
    },
    handler: (req, res, next) => {
      // Eliminamos 'options' ya que no es necesario
      logWarning("Rate limit excedido", {
        ip: req.ip,
        path: req.originalUrl,
      });
      res.status(429).json(defaultOptions.message); // Usamos defaultOptions.message en lugar de options.message
    },
  };

  return rateLimit({ ...defaultOptions, ...options });
};

/**
 * Rate limiting más estricto para rutas sensibles (login, registro, etc.)
 */
export const authRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // 5 intentos fallidos máximo
  message: {
    status: "error",
    error: "Demasiados intentos",
    message: "Demasiados intentos fallidos, intenta más tarde",
  },
  skipSuccessfulRequests: true, // No contar peticiones exitosas
});

export default {
  createRateLimit,
  authRateLimit,
};
