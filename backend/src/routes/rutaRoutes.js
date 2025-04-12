// src/routes/rutaRoutes.js

import express from "express";
import { body, param, query, validationResult } from "express-validator";
import createRutaController from "../controllers/rutaController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { logRequest } from "../middleware/loggerMiddleware.js";
import { cache } from "../middleware/cacheMiddleware.js";

/**
 * Configura las rutas para el recurso Ruta
 * @param {Model} Ruta - Modelo de Sequelize para Ruta
 * @returns {Router} Router de Express configurado
 */
export default (Ruta) => {
  const router = express.Router();

  // Obtener controladores
  const {
    obtenerRutas,
    crearRuta,
    obtenerRutaPorId,
    actualizarRuta,
    eliminarRuta,
    obtenerRutasPorTransportista,
    obtenerPedidosPorRuta,
    verificarRutaActiva,
  } = createRutaController(Ruta);

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

  // Validación para crear o actualizar una ruta
  const validateRutaInput = [
    body("codigo")
      .optional()
      .isString()
      .isLength({ min: 2, max: 20 })
      .withMessage("El código debe tener entre 2 y 20 caracteres"),

    body("origen")
      .isString()
      .notEmpty()
      .withMessage("El origen es obligatorio")
      .isLength({ min: 3, max: 100 })
      .withMessage("El origen debe tener entre 3 y 100 caracteres"),

    body("origen_lat")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("La latitud debe estar entre -90 y 90"),

    body("origen_lng")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("La longitud debe estar entre -180 y 180"),

    body("destino")
      .isString()
      .notEmpty()
      .withMessage("El destino es obligatorio")
      .isLength({ min: 3, max: 100 })
      .withMessage("El destino debe tener entre 3 y 100 caracteres"),

    body("destino_lat")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("La latitud debe estar entre -90 y 90"),

    body("destino_lng")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("La longitud debe estar entre -180 y 180"),

    body("distancia")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("La distancia debe ser un número positivo"),

    body("tiempo_estimado")
      .optional()
      .isInt({ min: 0 })
      .withMessage("El tiempo estimado debe ser un número entero positivo"),

    body("horario_inicio")
      .optional()
      .isInt({ min: 0, max: 23 })
      .withMessage("El horario de inicio debe ser un número entre 0 y 23"),

    body("horario_fin")
      .optional()
      .isInt({ min: 0, max: 23 })
      .withMessage("El horario de fin debe ser un número entre 0 y 23"),

    body("transportistaId")
      .isInt({ min: 1 })
      .withMessage("ID de transportista inválido"),

    body("activa")
      .optional()
      .isBoolean()
      .withMessage("Activa debe ser un valor booleano"),

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
   * /api/rutas:
   *   get:
   *     summary: Obtiene todas las rutas
   *     tags: [Rutas]
   *     parameters:
   *       - in: query
   *         name: activa
   *         schema:
   *           type: boolean
   *         description: Filtrar por rutas activas
   *     responses:
   *       200:
   *         description: Lista de rutas
   */
  router.get(
    "/",
    cache(300), // Caché de 5 minutos
    obtenerRutas,
  );

  /**
   * @swagger
   * /api/rutas/transportista/{id}:
   *   get:
   *     summary: Obtiene rutas asignadas a un transportista
   *     tags: [Rutas]
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
  router.get(
    "/transportista/:id",
    param("id").isInt({ min: 1 }).withMessage("ID de transportista inválido"),
    validarErrores,
    cache(300),
    obtenerRutasPorTransportista,
  );

  /**
   * @swagger
   * /api/rutas/activa:
   *   get:
   *     summary: Verifica si una ruta está activa en el horario actual
   *     tags: [Rutas]
   *     parameters:
   *       - in: query
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *     responses:
   *       200:
   *         description: Estado de actividad de la ruta
   */
  router.get(
    "/activa",
    query("id").isInt({ min: 1 }).withMessage("ID de ruta requerido"),
    validarErrores,
    verificarRutaActiva,
  );

  /**
   * @swagger
   * /api/rutas:
   *   post:
   *     summary: Crea una nueva ruta
   *     tags: [Rutas]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - origen
   *               - destino
   *               - transportistaId
   *             properties:
   *               codigo:
   *                 type: string
   *               origen:
   *                 type: string
   *               destino:
   *                 type: string
   *               origen_lat:
   *                 type: number
   *               origen_lng:
   *                 type: number
   *               destino_lat:
   *                 type: number
   *               destino_lng:
   *                 type: number
   *               transportistaId:
   *                 type: integer
   *               horario_inicio:
   *                 type: integer
   *               horario_fin:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Ruta creada correctamente
   *       400:
   *         description: Datos inválidos
   */
  router.post(
    "/",
    authenticate,
    authorize(["admin"]),
    validateRutaInput,
    logRequest,
    crearRuta,
  );

  /**
   * @swagger
   * /api/rutas/{id}:
   *   get:
   *     summary: Obtiene una ruta por ID
   *     tags: [Rutas]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *     responses:
   *       200:
   *         description: Ruta encontrada
   *       404:
   *         description: Ruta no encontrada
   */
  router.get("/:id", validateId, cache(300), obtenerRutaPorId);

  /**
   * @swagger
   * /api/rutas/{id}/pedidos:
   *   get:
   *     summary: Obtiene pedidos asignados a una ruta
   *     tags: [Rutas]
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
   *         description: Pedidos de la ruta
   */
  router.get("/:id/pedidos", authenticate, validateId, obtenerPedidosPorRuta);

  /**
   * @swagger
   * /api/rutas/{id}:
   *   put:
   *     summary: Actualiza una ruta
   *     tags: [Rutas]
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
   *             $ref: '#/components/schemas/RutaUpdate'
   *     responses:
   *       200:
   *         description: Ruta actualizada correctamente
   *       400:
   *         description: Datos inválidos
   *       404:
   *         description: Ruta no encontrada
   */
  router.put(
    "/:id",
    authenticate,
    authorize(["admin"]),
    validateId,
    validateRutaInput,
    logRequest,
    actualizarRuta,
  );

  /**
   * @swagger
   * /api/rutas/{id}:
   *   delete:
   *     summary: Elimina una ruta
   *     tags: [Rutas]
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
   *         description: Ruta eliminada correctamente
   *       404:
   *         description: Ruta no encontrada
   */
  router.delete(
    "/:id",
    authenticate,
    authorize(["admin"]),
    validateId,
    logRequest,
    eliminarRuta,
  );

  return router;
};
