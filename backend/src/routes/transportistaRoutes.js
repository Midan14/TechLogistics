// src/routes/transportistaRoutes.js

import express from "express";
import { body, param, query, validationResult } from "express-validator";
import createTransportistaController from "../controllers/transportistaController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { logRequest } from "../middleware/loggerMiddleware.js";
import { cache } from "../middleware/cacheMiddleware.js";

/**
 * Configura las rutas para el recurso Transportista
 * @param {Model} Transportista - Modelo de Sequelize para Transportista
 * @returns {Router} Router de Express configurado
 */
export default (Transportista) => {
  const router = express.Router();

  // Obtener controladores
  const {
    obtenerTransportistas,
    crearTransportista,
    obtenerTransportistaPorId,
    actualizarTransportista,
    eliminarTransportista,
    obtenerTransportistasDisponibles,
    obtenerRutasTransportista,
    obtenerPedidosTransportista,
    activarTransportista,
    desactivarTransportista,
  } = createTransportistaController(Transportista);

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

  // Validación para crear o actualizar un transportista
  const validateTransportistaInput = [
    body("codigo")
      .optional()
      .isString()
      .isLength({ min: 2, max: 20 })
      .withMessage("El código debe tener entre 2 y 20 caracteres"),

    body("nombre")
      .isString()
      .notEmpty()
      .withMessage("El nombre es obligatorio")
      .isLength({ min: 2, max: 100 })
      .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

    body("apellido")
      .optional()
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage("El apellido debe tener entre 2 y 100 caracteres"),

    body("documento")
      .optional()
      .isString()
      .isLength({ min: 5, max: 20 })
      .withMessage("El documento debe tener entre 5 y 20 caracteres"),

    body("telefono")
      .optional()
      .matches(/^\+?[0-9]{8,14}$/)
      .withMessage("Formato de teléfono inválido"),

    body("email").optional().isEmail().withMessage("Email inválido"),

    body("vehiculo")
      .isString()
      .notEmpty()
      .withMessage("El vehículo es obligatorio")
      .isLength({ min: 3, max: 50 })
      .withMessage("El vehículo debe tener entre 3 y 50 caracteres"),

    body("tipo_vehiculo")
      .optional()
      .isIn(["MOTO", "AUTO", "CAMIONETA", "CAMION", "FURGON"])
      .withMessage("Tipo de vehículo no válido"),

    body("placa")
      .optional()
      .isString()
      .isLength({ min: 5, max: 10 })
      .withMessage("La placa debe tener entre 5 y 10 caracteres"),

    body("capacidad_carga")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("La capacidad de carga debe ser un número positivo"),

    body("capacidad_maxima_pedidos")
      .optional()
      .isInt({ min: 1 })
      .withMessage(
        "La capacidad máxima de pedidos debe ser un número entero positivo",
      ),

    body("activo")
      .optional()
      .isBoolean()
      .withMessage("Activo debe ser un valor booleano"),

    body("fecha_licencia")
      .optional()
      .isISO8601()
      .withMessage("Formato de fecha inválido"),

    body("observaciones")
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage("Las observaciones no deben exceder 500 caracteres"),

    validarErrores,
  ];

  // Validación para IDs
  const validateId = [
    param("id").isInt({ min: 1 }).withMessage("ID inválido"),
    validarErrores,
  ];

  /**
   * @swagger
   * /api/transportistas:
   *   get:
   *     summary: Obtiene todos los transportistas
   *     tags: [Transportistas]
   *     parameters:
   *       - in: query
   *         name: activo
   *         schema:
   *           type: boolean
   *         description: Filtrar por transportistas activos
   *     responses:
   *       200:
   *         description: Lista de transportistas
   */
  router.get(
    "/",
    cache(300), // Caché de 5 minutos
    obtenerTransportistas,
  );

  /**
   * @swagger
   * /api/transportistas/disponibles:
   *   get:
   *     summary: Obtiene transportistas disponibles para asignación
   *     tags: [Transportistas]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Transportistas disponibles
   */
  router.get("/disponibles", authenticate, obtenerTransportistasDisponibles);

  /**
   * @swagger
   * /api/transportistas:
   *   post:
   *     summary: Crea un nuevo transportista
   *     tags: [Transportistas]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - nombre
   *               - vehiculo
   *             properties:
   *               codigo:
   *                 type: string
   *               nombre:
   *                 type: string
   *               apellido:
   *                 type: string
   *               documento:
   *                 type: string
   *               telefono:
   *                 type: string
   *               email:
   *                 type: string
   *               vehiculo:
   *                 type: string
   *               tipo_vehiculo:
   *                 type: string
   *                 enum: [MOTO, AUTO, CAMIONETA, CAMION, FURGON]
   *               placa:
   *                 type: string
   *     responses:
   *       201:
   *         description: Transportista creado correctamente
   *       400:
   *         description: Datos inválidos
   */
  router.post(
    "/",
    authenticate,
    authorize(["admin"]),
    validateTransportistaInput,
    logRequest,
    crearTransportista,
  );

  /**
   * @swagger
   * /api/transportistas/{id}:
   *   get:
   *     summary: Obtiene un transportista por ID
   *     tags: [Transportistas]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *     responses:
   *       200:
   *         description: Transportista encontrado
   *       404:
   *         description: Transportista no encontrado
   */
  router.get("/:id", validateId, cache(300), obtenerTransportistaPorId);

  /**
   * @swagger
   * /api/transportistas/{id}/rutas:
   *   get:
   *     summary: Obtiene rutas asignadas a un transportista
   *     tags: [Transportistas]
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
   *         description: Rutas del transportista
   */
  router.get("/:id/rutas", authenticate, validateId, obtenerRutasTransportista);

  /**
   * @swagger
   * /api/transportistas/{id}/pedidos:
   *   get:
   *     summary: Obtiene pedidos asignados a un transportista
   *     tags: [Transportistas]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *       - in: query
   *         name: estado
   *         schema:
   *           type: string
   *         description: Filtrar por estado del pedido
   *     responses:
   *       200:
   *         description: Pedidos del transportista
   */
  router.get(
    "/:id/pedidos",
    authenticate,
    validateId,
    obtenerPedidosTransportista,
  );

  /**
   * @swagger
   * /api/transportistas/{id}/activar:
   *   patch:
   *     summary: Activa un transportista
   *     tags: [Transportistas]
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
   *         description: Transportista activado correctamente
   *       404:
   *         description: Transportista no encontrado
   */
  router.patch(
    "/:id/activar",
    authenticate,
    authorize(["admin"]),
    validateId,
    logRequest,
    activarTransportista,
  );

  /**
   * @swagger
   * /api/transportistas/{id}/desactivar:
   *   patch:
   *     summary: Desactiva un transportista
   *     tags: [Transportistas]
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
   *         description: Transportista desactivado correctamente
   *       404:
   *         description: Transportista no encontrado
   */
  router.patch(
    "/:id/desactivar",
    authenticate,
    authorize(["admin"]),
    validateId,
    logRequest,
    desactivarTransportista,
  );

  /**
   * @swagger
   * /api/transportistas/{id}:
   *   put:
   *     summary: Actualiza un transportista
   *     tags: [Transportistas]
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
   *             $ref: '#/components/schemas/TransportistaUpdate'
   *     responses:
   *       200:
   *         description: Transportista actualizado correctamente
   *       400:
   *         description: Datos inválidos
   *       404:
   *         description: Transportista no encontrado
   */
  router.put(
    "/:id",
    authenticate,
    authorize(["admin"]),
    validateId,
    validateTransportistaInput,
    logRequest,
    actualizarTransportista,
  );

  /**
   * @swagger
   * /api/transportistas/{id}:
   *   delete:
   *     summary: Elimina un transportista
   *     tags: [Transportistas]
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
   *         description: Transportista eliminado correctamente
   *       404:
   *         description: Transportista no encontrado
   */
  router.delete(
    "/:id",
    authenticate,
    authorize(["admin"]),
    validateId,
    logRequest,
    eliminarTransportista,
  );

  return router;
};
