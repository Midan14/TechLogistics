// src/validators/estadoEnvioValidator.js

export const estadoEnvioSchema = {
  create: {
    nombre_estado: {
      in: ["body"],
      isString: true,
      notEmpty: true,
      isIn: {
        options: [
          [
            "PENDIENTE",
            "PREPARACION",
            "EN_RUTA",
            "ENTREGADO",
            "NO_ENTREGADO",
            "CANCELADO",
          ],
        ],
        errorMessage: "Estado no válido",
      },
      errorMessage: "El nombre del estado es requerido",
    },
    descripcion: {
      in: ["body"],
      optional: true,
      isString: true,
      isLength: {
        options: { min: 3, max: 100 },
        errorMessage: "La descripción debe tener entre 3 y 100 caracteres",
      },
    },
    color: {
      in: ["body"],
      optional: true,
      matches: {
        options: [/^#[0-9A-Fa-f]{6}$/],
        errorMessage:
          "Color debe ser un código hexadecimal válido (ej: #FF0000)",
      },
    },
    orden: {
      in: ["body"],
      optional: true,
      isInt: {
        options: { min: 1 },
        errorMessage: "El orden debe ser un número entero positivo",
      },
    },
  },
  update: {
    nombre_estado: {
      in: ["body"],
      optional: true,
      isString: true,
      isIn: {
        options: [
          [
            "PENDIENTE",
            "PREPARACION",
            "EN_RUTA",
            "ENTREGADO",
            "NO_ENTREGADO",
            "CANCELADO",
          ],
        ],
        errorMessage: "Estado no válido",
      },
    },
    descripcion: {
      in: ["body"],
      optional: true,
      isString: true,
      isLength: {
        options: { min: 3, max: 100 },
        errorMessage: "La descripción debe tener entre 3 y 100 caracteres",
      },
    },
    color: {
      in: ["body"],
      optional: true,
      matches: {
        options: [/^#[0-9A-Fa-f]{6}$/],
        errorMessage: "Color debe ser un código hexadecimal válido",
      },
    },
    orden: {
      in: ["body"],
      optional: true,
      isInt: {
        options: { min: 1 },
        errorMessage: "El orden debe ser un número entero positivo",
      },
    },
  },
};

export default estadoEnvioSchema;
