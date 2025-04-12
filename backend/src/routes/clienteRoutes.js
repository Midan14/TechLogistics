// src/routes/clienteRoutes.js

import express from "express";
import createClienteController from "../controllers/clienteController.js";
import { validateRequest } from "../middleware/requestValidator.js";
import { clienteSchema } from "../validators/clienteValidator.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { cache } from "../middleware/cacheMiddleware.js";
import { logRequest } from "../middleware/loggerMiddleware.js";
import { rateLimit } from "../middleware/rateLimitMiddleware.js";

/**
 * Configura las rutas para el recurso Cliente
 * @param {Model} Cliente - Modelo de Sequelize para Cliente
 * @returns {Router} Router de Express configurado
 */
export default (Cliente) => {
  const router = express.Router();

  // Obtener controladores específicos para este modelo
  const {
    obtenerClientes,
    crearCliente,
    obtenerClientePorId,
    actualizarCliente,
    eliminarCliente,
    buscarClientes,
    obtenerPedidosCliente,
  } = createClienteController(Cliente);

  /**
   * @swagger
   * /api/clientes:
   *   get:
   *     summary: Obtiene todos los clientes
   *     tags: [Clientes]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: Número de página para paginación
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Número de registros por página
   *     responses:
   *       200:
   *         description: Lista de clientes
   *       401:
   *         description: No autorizado
   */
  router.get(
    "/",
    authenticate,
    cache(300), // Caché de 5 minutos
    obtenerClientes,
  );

  /**
   * @swagger
   * /api/clientes/buscar:
   *   get:
   *     summary: Busca clientes por criterios
   *     tags: [Clientes]
   *     parameters:
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         description: Término de búsqueda
   *     responses:
   *       200:
   *         description: Clientes encontrados
   */
  router.get("/buscar", authenticate, buscarClientes);

  /**
   * @swagger
   * /api/clientes:
   *   post:
   *     summary: Crea un nuevo cliente
   *     tags: [Clientes]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ClienteCreate'
   *     responses:
   *       201:
   *         description: Cliente creado exitosamente
   *       400:
   *         description: Datos inválidos
   */
  router.post(
    "/",
    authenticate,
    authorize(["admin", "vendedor"]),
    validateRequest(clienteSchema.create),
    rateLimit({ windowMs: 60000, max: 10 }), // 10 creaciones por minuto
    logRequest,
    crearCliente,
  );

  /**
   * @swagger
   * /api/clientes/{id}:
   *   get:
   *     summary: Obtiene un cliente por ID
   *     tags: [Clientes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Cliente encontrado
   *       404:
   *         description: Cliente no encontrado
   */
  router.get("/:id", authenticate, cache(300), obtenerClientePorId);

  /**
   * @swagger
   * /api/clientes/{id}/pedidos:
   *   get:
   *     summary: Obtiene los pedidos de un cliente
   *     tags: [Clientes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Pedidos del cliente
   *       404:
   *         description: Cliente no encontrado
   */
  router.get("/:id/pedidos", authenticate, obtenerPedidosCliente);

  /**
   * @swagger
   * /api/clientes/{id}:
   *   put:
   *     summary: Actualiza un cliente
   *     tags: [Clientes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/ClienteUpdate'
   *     responses:
   *       200:
   *         description: Cliente actualizado
   *       400:
   *         description: Datos inválidos
   *       404:
   *         description: Cliente no encontrado
   */
  router.put(
    "/:id",
    authenticate,
    authorize(["admin", "vendedor"]),
    validateRequest(clienteSchema.update),
    logRequest,
    actualizarCliente,
  );

  /**
   * @swagger
   * /api/clientes/{id}:
   *   delete:
   *     summary: Elimina un cliente
   *     tags: [Clientes]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Cliente eliminado
   *       404:
   *         description: Cliente no encontrado
   */
  router.delete(
    "/:id",
    authenticate,
    authorize(["admin"]),
    logRequest,
    eliminarCliente,
  );

  return router;
};
