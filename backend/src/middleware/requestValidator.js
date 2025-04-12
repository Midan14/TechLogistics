// middleware/requestValidator.js

import { validationResult } from "express-validator";
import { logError } from "../config/logger.js";

/**
 * Valida que la petición tenga el formato correcto
 */
export const requestValidator = (req, res, next) => {
  try {
    // Solo verificar si hay body en la petición
    if (req.body && Object.keys(req.body).length > 0) {
      // Verificar si el Content-Type es application/json
      if (!req.is("application/json")) {
        return res.status(415).json({
          status: "error",
          error: "Tipo de contenido no soportado",
          message: "El Content-Type debe ser application/json",
          receivedContentType: req.get("Content-Type"),
        });
      }

      // Verificar si el body es un objeto válido
      if (typeof req.body !== "object") {
        return res.status(400).json({
          status: "error",
          error: "Formato inválido",
          message: "El body debe ser un objeto JSON válido",
        });
      }
    }

    // Si todas las validaciones pasan, continuar
    next();
  } catch (error) {
    logError("Error en validación de request", error);
    // Si hay algún error en la validación, enviar error 400
    return res.status(400).json({
      status: "error",
      error: "Error de validación",
      message: error.message,
    });
  }
};

/**
 * Middleware para validar campos requeridos en el body
 * @param {Array} requiredFields - Array de campos requeridos
 */
export const validateRequiredFields = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter(
      (field) => !(field in req.body),
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        status: "error",
        error: "Campos requeridos faltantes",
        missingFields: missingFields,
      });
    }

    next();
  };
};

/**
 * Middleware para validar que los campos numéricos sean válidos
 * @param {Array} numericFields - Array de campos numéricos a validar
 */
export const validateNumericFields = (numericFields) => {
  return (req, res, next) => {
    const invalidFields = numericFields.filter((field) => {
      return field in req.body && isNaN(Number(req.body[field]));
    });

    if (invalidFields.length > 0) {
      return res.status(400).json({
        status: "error",
        error: "Campos numéricos inválidos",
        invalidFields: invalidFields,
      });
    }

    next();
  };
};

/**
 * Middleware para validar reglas con express-validator
 */
export const validateRequest = (validations) => {
  return async (req, res, next) => {
    // Ejecutar todas las validaciones
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Verificar si hay errores
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Si hay errores, formatearlos y devolverlos
    return res.status(400).json({
      status: "error",
      error: "Error de validación",
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
        value: err.value,
      })),
    });
  };
};

/**
 * Middleware para validar formato de email
 * @param {Array} emailFields - Array de campos de email a validar
 */
export const validateEmailFields = (emailFields) => {
  return (req, res, next) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidFields = emailFields.filter((field) => {
      return field in req.body && !emailRegex.test(req.body[field]);
    });

    if (invalidFields.length > 0) {
      return res.status(400).json({
        status: "error",
        error: "Formato de email inválido",
        invalidFields,
      });
    }

    next();
  };
};

export default {
  requestValidator,
  validateRequiredFields,
  validateNumericFields,
  validateRequest,
  validateEmailFields,
};
