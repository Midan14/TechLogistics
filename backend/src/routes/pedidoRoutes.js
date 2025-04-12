// src/routes/pedidoRoutes.js

import express from "express";
import { body, param, query, validationResult } from "express-validator";
import createPedidoController from "../controllers/pedidoController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { logRequest } from "../middleware/loggerMiddleware.js";

/**
 * Configura las rutas para el recurso Pedido
 * @param {Object} models - Modelos de Sequelize necesarios
 * @returns {Router} Router de Express configurado
 */
export default (models) => {
  const router = express.Router();

  // Obtener controladores con inyección de dependencias
  const {
    obtenerPedidos,
    crearPedido,
    obtenerPedidoPorId,
    actualizarPedido,
    eliminarPedido,
    cambiarEstadoPedido,
    obtenerPedidosPorCliente,
    obtenerPedidosPorTransportista,
    obtenerPedidosPorEstado,
    buscarPedidos,
  } = createPedidoController(models);

  // Middleware para validar errores
  const validarErrores = (req, res, next) => {
    const errores = validationResult(req);
    if (!errores.isEmpty()) {
      return res.status(400).json({
        mensaje: "Error en validación de datos de entrada",
        errores: errores.array(),
      });
    }
    next();
  };

  // Validación para crear o actualizar un pedido
  const validatePedidoInput = [
    body("fechaPedido")
      .optional()
      .isISO8601()
      .withMessage("Fecha debe estar en formato ISO8601."),

    body("cantidad")
      .notEmpty()
      .withMessage("La cantidad es requerida.")
      .isInt({ min: 1 })
      .withMessage("Cantidad debe ser un número entero positivo."),

    body("clienteId")
      .notEmpty()
      .withMessage("El cliente es requerido.")
      .isInt({ min: 1 })
      .withMessage("ID de cliente inválido."),

    body("productoId")
      .notEmpty()
      .withMessage("El producto es requerido.")
      .isInt({ min: 1 })
      .withMessage("ID de producto inválido."),

    body("transportistaId")
      .notEmpty()
      .withMessage("El transportista es requerido.")
      .isInt({ min: 1 })
      .withMessage("ID de transportista inválido."),

    body("rutaId")
      .notEmpty()
      .withMessage("La ruta es requerida.")
      .isInt({ min: 1 })
      .withMessage("ID de ruta inválido."),

    body("estadoEnvioId")
      .notEmpty()
      .withMessage("El estado de envío es requerido.")
      .isInt({ min: 1 })
      .withMessage("ID de estado de envío inválido."),

    body("observaciones")
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage("Las observaciones no deben exceder 500 caracteres."),

    validarErrores,
  ];

  // Validación para cambio de estado
  const validateEstadoChange = [
    body("estado")
      .notEmpty()
      .withMessage("El nuevo estado es requerido.")
      .isIn([
        "PENDIENTE",
        "EN_PREPARACION",
        "EN_RUTA",
        "ENTREGADO",
        "CANCELADO",
      ])
      .withMessage("Estado no válido"),

    body("observaciones")
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage("Las observaciones no deben exceder 500 caracteres."),

    validarErrores,
  ];

  // Validación para IDs
  const validateId = [
    param("id").isInt({ min: 1 }).withMessage("ID inválido"),
    validarErrores,
  ];

  /**
   * @swagger
   * /api/pedidos:
   *   get:
   *     summary: Obtiene todos los pedidos
   *     tags: [Pedidos]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: Número de página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Registros por página
   *     responses:
   *       200:
   *         description: Lista de pedidos
   */
  router.get("/", authenticate, obtenerPedidos);

  /**
   * @swagger
   * /api/pedidos/buscar:
   *   get:
   *     summary: Busca pedidos por diferentes criterios
   *     tags: [Pedidos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: cliente
   *         schema:
   *           type: integer
   *       - in: query
   *         name: estado
   *         schema:
   *           type: string
   *       - in: query
   *         name: fechaInicio
   *         schema:
   *           type: string
   *           format: date
   *       - in: query
   *         name: fechaFin
   *         schema:
   *           type: string
   *           format: date
   *     responses:
   *       200:
   *         description: Pedidos encontrados
   */
  router.get("/buscar", authenticate, buscarPedidos);

  /**
   * @swagger
   * /api/pedidos/cliente/{id}:
   *   get:
   *     summary: Obtiene pedidos de un cliente específico
   *     tags: [Pedidos]
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
   *         description: Pedidos del cliente
   */
  router.get(
    "/cliente/:id",
    authenticate,
    param("id").isInt({ min: 1 }).withMessage("ID de cliente inválido"),
    validarErrores,
    obtenerPedidosPorCliente,
  );

  /**
   * @swagger
   * /api/pedidos/transportista/{id}:
   *   get:
   *     summary: Obtiene pedidos asignados a un transportista
   *     tags: [Pedidos]
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
   *         description: Pedidos del transportista
   */
  router.get(
    "/transportista/:id",
    authenticate,
    param("id").isInt({ min: 1 }).withMessage("ID de transportista inválido"),
    validarErrores,
    obtenerPedidosPorTransportista,
  );

  /**
   * @swagger
   * /api/pedidos/estado/{estado}:
   *   get:
   *     summary: Obtiene pedidos por estado
   *     tags: [Pedidos]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: estado
   *         schema:
   *           type: string
   *         required: true
   *     responses:
   *       200:
   *         description: Pedidos con el estado solicitado
   */
  router.get(
    "/estado/:estado",
    authenticate,
    param("estado")
      .isIn([
        "PENDIENTE",
        "EN_PREPARACION",
        "EN_RUTA",
        "ENTREGADO",
        "CANCELADO",
      ])
      .withMessage("Estado no válido"),
    validarErrores,
    obtenerPedidosPorEstado,
  );

  /**
   * @swagger
   * /api/pedidos:
   *   post:
   *     summary: Crea un nuevo pedido
   *     tags: [Pedidos]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - clienteId
   *               - productoId
   *               - cantidad
   *               - transportistaId
   *               - rutaId
   *               - estadoEnvioId
   *             properties:
   *               fechaPedido:
   *                 type: string
   *                 format: date-time
   *               clienteId:
   *                 type: integer
   *               productoId:
   *                 type: integer
   *               cantidad:
   *                 type: integer
   *                 minimum: 1
   *               transportistaId:
   *                 type: integer
   *               rutaId:
   *                 type: integer
   *               estadoEnvioId:
   *                 type: integer
   *               observaciones:
   *                 type: string
   *     responses:
   *       201:
   *         description: Pedido creado correctamente
   *       400:
   *         description: Datos inválidos
   */
  router.post(
    "/",
    authenticate,
    authorize(["admin", "vendedor"]),
    validatePedidoInput,
    logRequest,
    crearPedido,
  );

  /**
   * @swagger
   * /api/pedidos/{id}:
   *   get:
   *     summary: Obtiene un pedido por ID
   *     tags: [Pedidos]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *     responses:
   *       200:
   *         description: Pedido encontrado
   *       404:
   *         description: Pedido no encontrado
   */
  router.get("/:id", authenticate, validateId, obtenerPedidoPorId);

  /**
   * @swagger
   * /api/pedidos/{id}/estado:
   *   patch:
   *     summary: Actualiza el estado de un pedido
   *     tags: [Pedidos]
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
   *             required:
   *               - estado
   *             properties:
   *               estado:
   *                 type: string
   *                 enum: [PENDIENTE, EN_PREPARACION, EN_RUTA, ENTREGADO, CANCELADO]
   *               observaciones:
   *                 type: string
   *     responses:
   *       200:
   *         description: Estado actualizado correctamente
   *       400:
   *         description: Datos inválidos
   *       404:
   *         description: Pedido no encontrado
   */
  router.patch(
    "/:id/estado",
    authenticate,
    authorize(["admin", "transportista"]),
    validateId,
    validateEstadoChange,
    logRequest,
    cambiarEstadoPedido,
  );

  /**
   * @swagger
   * /api/pedidos/{id}:
   *   put:
   *     summary: Actualiza un pedido
   *     tags: [Pedidos]
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
   *             $ref: '#/components/schemas/PedidoUpdate'
   *     responses:
   *       200:
   *         description: Pedido actualizado correctamente
   *       400:
   *         description: Datos inválidos
   *       404:
   *         description: Pedido no encontrado
   */
  router.put(
    "/:id",
    authenticate,
    authorize(["admin", "vendedor"]),
    validateId,
    validatePedidoInput,
    logRequest,
    actualizarPedido,
  );

  /**
   * @swagger
   * /api/pedidos/{id}:
   *   delete:
   *     summary: Elimina un pedido
   *     tags: [Pedidos]
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
   *         description: Pedido eliminado correctamente
   *       404:
   *         description: Pedido no encontrado
   */
  router.delete(
    "/:id",
    authenticate,
    authorize(["admin"]),
    validateId,
    logRequest,
    eliminarPedido,
  );

  return router;
};
