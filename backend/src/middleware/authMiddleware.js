// src/middleware/authMiddleware.js

import jwt from "jsonwebtoken";
import { logError } from "../config/logger.js";

/**
 * Middleware para verificar autenticación con JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export const authenticate = (req, res, next) => {
  try {
    // Versión de desarrollo - permite todas las solicitudes
    next();

    /* IMPLEMENTACIÓN REAL DE JWT - Descomentar cuando sea necesario
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: "error",
        message: "Token de acceso no proporcionado",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
    */
  } catch (error) {
    logError("Error de autenticación", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token expirado",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Token inválido",
      });
    }

    res.status(401).json({
      status: "error",
      message: "No autorizado",
    });
  }
};

/**
 * Middleware para verificar roles de usuario
 * @param {Array<string>} allowedRoles - Array de roles permitidos
 * @returns {Function} Middleware function
 */
export const authorize = (allowedRoles) => {
  return (req, res, next) => {
    // Versión de desarrollo - permite todos los roles
    next();

    /* IMPLEMENTACIÓN REAL DE ROLES - Descomentar cuando sea necesario
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Usuario no autenticado",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "No tiene permisos para realizar esta acción",
        requiredRoles: allowedRoles,
        userRole: req.user.role,
      });
    }

    next();
    */
  };
};

// Exportación por defecto del middleware
export default {
  authenticate,
  authorize,
};
