// routes/transportistaRoutes.js

import { Router } from "express";
import { check, validationResult } from "express-validator";
import createTransportistaController from "../controllers/transportistaController.js";

/**
 * @param {Object} param0 Objeto con modelos
 * @returns {Router} Router configurado
 */
const transportistaRoutes = ({ Transportista, Pedido }) => {
  const router = Router();

  // Middleware de validación
  const validateResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        errores: errors.array(),
      });
    }
    next();
  };

  // Crear controlador con los modelos
  const controlador = createTransportistaController({ Transportista, Pedido });

  /**
   * @route GET /api/transportistas
   * @desc Obtener todos los transportistas
   * @access Public
   */
  router.get("/", controlador.obtenerTransportistas);

  /**
   * @route GET /api/transportistas/disponibles
   * @desc Obtener transportistas disponibles para asignación
   * @access Public
   */
  router.get("/disponibles", controlador.obtenerTransportistasDisponibles);

  /**
   * @route GET /api/transportistas/:id
   * @desc Obtener un transportista por ID
   * @access Public
   */
  router.get("/:id", controlador.obtenerTransportistaPorId);

  /**
   * @route POST /api/transportistas
   * @desc Crear un nuevo transportista
   * @access Private
   */
  router.post(
    "/",
    [
      check("nombre", "El nombre es obligatorio").not().isEmpty(),
      check("placa", "La placa es obligatoria").not().isEmpty(),
      check("telefono", "El teléfono es obligatorio").not().isEmpty(),
      check("email", "El email debe ser válido").optional().isEmail(),
      validateResult,
    ],
    controlador.crearTransportista,
  );

  /**
   * @route PUT /api/transportistas/:id
   * @desc Actualizar un transportista
   * @access Private
   */
  router.put(
    "/:id",
    [
      check("nombre", "El nombre es obligatorio").not().isEmpty(),
      check("placa", "La placa es obligatoria").not().isEmpty(),
      check("telefono", "El teléfono es obligatorio").not().isEmpty(),
      check("email", "El email debe ser válido").optional().isEmail(),
      validateResult,
    ],
    controlador.actualizarTransportista,
  );

  /**
   * @route DELETE /api/transportistas/:id
   * @desc Eliminar un transportista
   * @access Private
   */
  router.delete("/:id", controlador.eliminarTransportista);

  return router;
};

export default transportistaRoutes;
