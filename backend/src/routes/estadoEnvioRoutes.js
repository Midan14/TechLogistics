// src/routes/estadoEnvioRoutes.js

import express from "express";
import { body, param, query, validationResult } from "express-validator";
import createEstadoEnvioController from "../controllers/estadoEnvioController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { logRequest } from "../middleware/loggerMiddleware.js";
import { cache } from "../middleware/cacheMiddleware.js";

/**
 * Configura las rutas para el recurso EstadoEnvio
 * @param {Object} models - Modelos de Sequelize necesarios
 * @returns {Router} Router de Express configurado
 */
export default ({ EstadoEnvio, Pedido }) => {
  const router = express.Router();

  // Obtener controladores con inyección de dependencias
  const {
    obtenerEstadosEnvio,
    crearEstadoEnvio,
    obtenerEstadoEnvioPorId,
    actualizarEstadoEnvio,
    eliminarEstadoEnvio,
    inicializarEstadosEnvio,
    obtenerPedidosPorEstado,
  } = createEstadoEnvioController({ EstadoEnvio, Pedido });

  // Middleware para validar errores
  const validarErrores = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        status: "error",
        errores: errores.array(),
      });
    }
    next();
  };

  // ✅ Validación para crear o actualizar un estado de envío
  const validateEstadoInput = [
    body("estado")
      .isString()
      .notEmpty()
      .withMessage("El estado es obligatorio")
      .isIn([
        "PENDIENTE",
        "PREPARACION",
        "EN_RUTA",
        "ENTREGADO",
        "NO_ENTREGADO",
        "CANCELADO",
      ])
      .withMessage("Estado no válido"),
    body("descripcion")
      .optional()
      .isString()
      .isLength({ min: 3, max: 100 })
      .withMessage("La descripción debe tener entre 3 y 100 caracteres"),
    body("color")
      .optional()
      .isString()
      .matches(/^#[0-9A-Fa-f]{6}$/)
      .withMessage(
        "El color debe ser un código hexadecimal válido (ej: #FF0000)",
      ),
    body("orden")
      .optional()
      .isInt({ min: 1 })
      .withMessage("El orden debe ser un número entero positivo"),
    body("activo")
      .optional()
      .isBoolean()
      .withMessage("Activo debe ser un valor booleano"),
    validarErrores,
  ];

  // Validación para IDs
  const validateId = [
    param("id").isInt({ min: 1 }).withMessage("ID inválido"),
    validarErrores,
  ];

  /**
   * @swagger
   * /api/estados-envio:
   *   get:
   *     summary: Obtiene todos los estados de envío
   *     tags: [Estados]
   *     parameters:
   *       - in: query
   *         name: activo
   *         schema:
   *           type: boolean
   *         description: Filtrar por estados activos
   *     responses:
   *       200:
   *         description: Lista de estados de envío
   */
  router.get(
    "/",
    cache(300), // Cachear durante 5 minutos
    obtenerEstadosEnvio,
  );

  /**
   * @swagger
   * /api/estados-envio/inicializar:
   *   post:
   *     summary: Inicializa los estados de envío predeterminados
   *     tags: [Estados]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Estados inicializados correctamente
   *       401:
   *         description: No autorizado
   */
  router.post(
    "/inicializar",
    authenticate,
    authorize(["admin"]),
    logRequest,
    inicializarEstadosEnvio,
  );

  /**
   * @swagger
   * /api/estados-envio/{id}/pedidos:
   *   get:
   *     summary: Obtiene los pedidos con un estado específico
   *     tags: [Estados]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *     responses:
   *       200:
   *         description: Pedidos con el estado especificado
   */
  router.get("/:id/pedidos", authenticate, validateId, obtenerPedidosPorEstado);

  /**
   * @swagger
   * /api/estados-envio:
   *   post:
   *     summary: Crea un nuevo estado de envío
   *     tags: [Estados]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - estado
   *             properties:
   *               estado:
   *                 type: string
   *               descripcion:
   *                 type: string
   *               color:
   *                 type: string
   *               orden:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Estado de envío creado correctamente
   *       400:
   *         description: Datos inválidos
   */
  router.post(
    "/",
    authenticate,
    authorize(["admin"]),
    validateEstadoInput,
    logRequest,
    crearEstadoEnvio,
  );

  /**
   * @swagger
   * /api/estados-envio/{id}:
   *   get:
   *     summary: Obtiene un estado de envío por ID
   *     tags: [Estados]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *     responses:
   *       200:
   *         description: Estado de envío encontrado
   *       404:
   *         description: Estado de envío no encontrado
   */
  router.get("/:id", validateId, cache(300), obtenerEstadoEnvioPorId);

  /**
   * @swagger
   * /api/estados-envio/{id}:
   *   put:
   *     summary: Actualiza un estado de envío
   *     tags: [Estados]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               estado:
   *                 type: string
   *               descripcion:
   *                 type: string
   *               color:
   *                 type: string
   *               orden:
   *                 type: integer
   *               activo:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Estado de envío actualizado
   *       400:
   *         description: Datos inválidos
   *       404:
   *         description: Estado de envío no encontrado
   */
  router.put(
    "/:id",
    authenticate,
    authorize(["admin"]),
    validateId,
    validateEstadoInput,
    logRequest,
    actualizarEstadoEnvio,
  );

  /**
   * @swagger
   * /api/estados-envio/{id}:
   *   delete:
   *     summary: Elimina un estado de envío
   *     tags: [Estados]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *     responses:
   *       200:
   *         description: Estado de envío eliminado
   *       404:
   *         description: Estado de envío no encontrado
   */
  router.delete(
    "/:id",
    authenticate,
    authorize(["admin"]),
    validateId,
    logRequest,
    eliminarEstadoEnvio,
  );

  return router;
};
