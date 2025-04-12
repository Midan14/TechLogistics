// src/validators/clienteValidator.js

import { body } from "express-validator";

export const clienteSchema = {
  // Validación para crear cliente
  create: [
    body("nombre")
      .isString()
      .notEmpty()
      .withMessage("El nombre es requerido")
      .isLength({ min: 2, max: 100 })
      .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

    body("apellido")
      .isString()
      .notEmpty()
      .withMessage("El apellido es requerido")
      .isLength({ min: 2, max: 100 })
      .withMessage("El apellido debe tener entre 2 y 100 caracteres"),

    body("email")
      .isEmail()
      .withMessage("Debe proporcionar un email válido")
      .normalizeEmail(),

    body("telefono")
      .optional()
      .matches(/^\+?[0-9]{8,14}$/)
      .withMessage("Número de teléfono inválido"),

    body("direccion")
      .optional()
      .isString()
      .isLength({ min: 5, max: 255 })
      .withMessage("La dirección debe tener entre 5 y 255 caracteres"),
  ],

  // Validación para actualizar cliente
  update: [
    body("nombre")
      .optional()
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

    body("apellido")
      .optional()
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage("El apellido debe tener entre 2 y 100 caracteres"),

    body("email")
      .optional()
      .isEmail()
      .withMessage("Debe proporcionar un email válido")
      .normalizeEmail(),

    body("telefono")
      .optional()
      .matches(/^\+?[0-9]{8,14}$/)
      .withMessage("Número de teléfono inválido"),

    body("direccion")
      .optional()
      .isString()
      .isLength({ min: 5, max: 255 })
      .withMessage("La dirección debe tener entre 5 y 255 caracteres"),

    body("estado")
      .optional()
      .isIn(["ACTIVO", "INACTIVO"])
      .withMessage("Estado no válido"),
  ],
};

export default clienteSchema;
