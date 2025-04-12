// middleware/loggerMiddleware.js

import { logInfo } from "../config/logger.js";

/**
 * Middleware para registrar información sobre las peticiones HTTP
 */
export const logRequest = (req, res, next) => {
  const start = Date.now();

  // Cuando la respuesta sea enviada
  res.on("finish", () => {
    const duration = Date.now() - start;
    const userId = req.user?.id || "anonymous";
    const method = req.method;
    const url = req.originalUrl;
    const status = res.statusCode;

    logInfo("Petición HTTP", {
      method,
      url,
      status,
      duration: `${duration}ms`,
      userId,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });
  });

  next();
};

/**
 * Middleware para registrar información detallada sobre las peticiones importantes
 */
export const logDetailedRequest = (req, res, next) => {
  const start = Date.now();

  // Guardar el body original
  const originalBody = { ...req.body };

  // Cuando la respuesta sea enviada
  res.on("finish", () => {
    const duration = Date.now() - start;
    const userId = req.user?.id || "anonymous";
    const method = req.method;
    const url = req.originalUrl;
    const status = res.statusCode;

    // No registrar contraseñas u otra información sensible
    const safeBody = { ...originalBody };
    if (safeBody.password) safeBody.password = "[REDACTED]";
    if (safeBody.token) safeBody.token = "[REDACTED]";

    logInfo("Petición HTTP detallada", {
      method,
      url,
      status,
      duration: `${duration}ms`,
      userId,
      ip: req.ip,
      body: safeBody,
      params: req.params,
      query: req.query,
    });
  });

  next();
};

export default {
  logRequest,
  logDetailedRequest,
};
