// src/routes/productoRoutes.js

import express from "express";
import { body, param, query, validationResult } from "express-validator";
import createProductoController from "../controllers/productoController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { logRequest } from "../middleware/loggerMiddleware.js";
import { cache } from "../middleware/cacheMiddleware.js";

/**
 * Configura las rutas para el recurso Producto
 * @param {Model} Producto - Modelo de Sequelize para Producto
 * @returns {Router} Router de Express configurado
 */
export default (Producto) => {
  const router = express.Router();

  // Obtener controladores
  const {
    obtenerProductos,
    crearProducto,
    obtenerProductoPorId,
    actualizarProducto,
    eliminarProducto,
    buscarProductos,
    actualizarStock,
    obtenerProductosConBajoStock,
    obtenerProductosPorCategoria,
  } = createProductoController(Producto);

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

  // Validación para crear o actualizar un producto
  const validateProductoInput = [
    body("codigo")
      .optional()
      .isString()
      .isLength({ min: 2, max: 50 })
      .withMessage("El código debe tener entre 2 y 50 caracteres"),

    body("nombre")
      .isString()
      .notEmpty()
      .withMessage("El nombre es obligatorio")
      .isLength({ min: 3, max: 100 })
      .withMessage("El nombre debe tener entre 3 y 100 caracteres"),

    body("descripcion")
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage("La descripción no debe exceder 500 caracteres"),

    body("precio")
      .isDecimal({ decimal_digits: "0,2" })
      .withMessage("El precio debe ser un número válido con hasta 2 decimales")
      .custom((value) => {
        if (parseFloat(value) < 0) {
          throw new Error("El precio no puede ser negativo");
        }
        return true;
      }),

    body("stock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("El stock debe ser un número entero no negativo"),

    body("stockMinimo")
      .optional()
      .isInt({ min: 0 })
      .withMessage("El stock mínimo debe ser un número entero no negativo"),

    body("categoria")
      .optional()
      .isString()
      .isLength({ max: 50 })
      .withMessage("La categoría no debe exceder 50 caracteres"),

    body("imagen")
      .optional()
      .isURL()
      .withMessage("La imagen debe ser una URL válida"),

    body("activo")
      .optional()
      .isBoolean()
      .withMessage("Activo debe ser un valor booleano"),

    validarErrores,
  ];

  // Validación para actualizar stock
  const validateStockUpdate = [
    body("cantidad")
      .isInt({ min: 1 })
      .withMessage("La cantidad debe ser un número entero positivo"),

    body("tipo")
      .isIn(["SUMAR", "RESTAR"])
      .withMessage("El tipo debe ser SUMAR o RESTAR"),

    validarErrores,
  ];

  // Validación para IDs
  const validateId = [
    param("id").isInt({ min: 1 }).withMessage("ID inválido"),
    validarErrores,
  ];

  /**
   * @swagger
   * /api/productos:
   *   get:
   *     summary: Obtiene todos los productos
   *     tags: [Productos]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: Número de página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *         description: Registros por página
   *       - in: query
   *         name: categoria
   *         schema:
   *           type: string
   *         description: Filtrar por categoría
   *       - in: query
   *         name: activo
   *         schema:
   *           type: boolean
   *         description: Filtrar por estado activo
   *     responses:
   *       200:
   *         description: Lista de productos
   */
  router.get(
    "/",
    cache(300), // Caché de 5 minutos
    obtenerProductos,
  );

  /**
   * @swagger
   * /api/productos/buscar:
   *   get:
   *     summary: Busca productos por nombre, código o descripción
   *     tags: [Productos]
   *     parameters:
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         description: Término de búsqueda
   *     responses:
   *       200:
   *         description: Productos encontrados
   */
  router.get(
    "/buscar",
    query("q")
      .isString()
      .isLength({ min: 2 })
      .withMessage("El término de búsqueda debe tener al menos 2 caracteres"),
    validarErrores,
    cache(60), // Caché de 1 minuto
    buscarProductos,
  );

  /**
   * @swagger
   * /api/productos/bajo-stock:
   *   get:
   *     summary: Obtiene productos con stock por debajo del mínimo
   *     tags: [Productos]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Productos con stock bajo
   */
  router.get(
    "/bajo-stock",
    authenticate,
    authorize(["admin", "vendedor"]),
    obtenerProductosConBajoStock,
  );

  /**
   * @swagger
   * /api/productos/categoria/{categoria}:
   *   get:
   *     summary: Obtiene productos por categoría
   *     tags: [Productos]
   *     parameters:
   *       - in: path
   *         name: categoria
   *         schema:
   *           type: string
   *         required: true
   *     responses:
   *       200:
   *         description: Productos de la categoría
   */
  router.get(
    "/categoria/:categoria",
    param("categoria")
      .isString()
      .notEmpty()
      .withMessage("La categoría es requerida"),
    validarErrores,
    cache(300),
    obtenerProductosPorCategoria,
  );

  /**
   * @swagger
   * /api/productos:
   *   post:
   *     summary: Crea un nuevo producto
   *     tags: [Productos]
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
   *               - precio
   *             properties:
   *               codigo:
   *                 type: string
   *               nombre:
   *                 type: string
   *               descripcion:
   *                 type: string
   *               precio:
   *                 type: number
   *               stock:
   *                 type: integer
   *               stockMinimo:
   *                 type: integer
   *               categoria:
   *                 type: string
   *               imagen:
   *                 type: string
   *     responses:
   *       201:
   *         description: Producto creado correctamente
   *       400:
   *         description: Datos inválidos
   */
  router.post(
    "/",
    authenticate,
    authorize(["admin"]),
    validateProductoInput,
    logRequest,
    crearProducto,
  );

  /**
   * @swagger
   * /api/productos/{id}:
   *   get:
   *     summary: Obtiene un producto por ID
   *     tags: [Productos]
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *     responses:
   *       200:
   *         description: Producto encontrado
   *       404:
   *         description: Producto no encontrado
   */
  router.get("/:id", validateId, cache(300), obtenerProductoPorId);

  /**
   * @swagger
   * /api/productos/{id}/stock:
   *   patch:
   *     summary: Actualiza el stock de un producto
   *     tags: [Productos]
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
   *               - cantidad
   *               - tipo
   *             properties:
   *               cantidad:
   *                 type: integer
   *                 minimum: 1
   *               tipo:
   *                 type: string
   *                 enum: [SUMAR, RESTAR]
   *     responses:
   *       200:
   *         description: Stock actualizado correctamente
   *       400:
   *         description: Datos inválidos
   *       404:
   *         description: Producto no encontrado
   */
  router.patch(
    "/:id/stock",
    authenticate,
    authorize(["admin", "vendedor"]),
    validateId,
    validateStockUpdate,
    logRequest,
    actualizarStock,
  );

  /**
   * @swagger
   * /api/productos/{id}:
   *   put:
   *     summary: Actualiza un producto
   *     tags: [Productos]
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
   *             $ref: '#/components/schemas/ProductoUpdate'
   *     responses:
   *       200:
   *         description: Producto actualizado correctamente
   *       400:
   *         description: Datos inválidos
   *       404:
   *         description: Producto no encontrado
   */
  router.put(
    "/:id",
    authenticate,
    authorize(["admin"]),
    validateId,
    validateProductoInput,
    logRequest,
    actualizarProducto,
  );

  /**
   * @swagger
   * /api/productos/{id}:
   *   delete:
   *     summary: Elimina un producto
   *     tags: [Productos]
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
   *         description: Producto eliminado correctamente
   *       404:
   *         description: Producto no encontrado
   */
  router.delete(
    "/:id",
    authenticate,
    authorize(["admin"]),
    validateId,
    logRequest,
    eliminarProducto,
  );

  return router;
};
