// src/controllers/productoController.js

import { Op } from "sequelize";
import { logError, logInfo } from "../config/logger.js";

/**
 * Crea un controlador para gestionar productos
 * @param {Model} Producto - Modelo Sequelize para Producto
 * @param {Object} models - Otros modelos relacionados (opcional)
 * @returns {Object} Objeto con métodos del controlador
 */
const createProductoController = (Producto, models = {}) => {
  const { Pedido } = models;

  /**
   * Obtiene todos los productos con paginación y filtros
   * @route GET /api/productos
   */
  const obtenerProductos = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort = "nombre",
        order = "ASC",
        nombre,
        categoria,
        precioMin,
        precioMax,
        activo,
      } = req.query;

      // Construir filtros
      const where = {};

      if (nombre) {
        where.nombre = { [Op.like]: `%${nombre}%` };
      }

      if (categoria) {
        where.categoria = categoria;
      }

      if (precioMin || precioMax) {
        where.precio = {};
        if (precioMin) where.precio[Op.gte] = parseFloat(precioMin);
        if (precioMax) where.precio[Op.lte] = parseFloat(precioMax);
      }

      if (activo !== undefined) {
        where.activo = activo === "true";
      }

      // Opciones de paginación y orden
      const options = {
        where,
        order: [[sort, order]],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
      };

      // Ejecutar consulta con conteo total
      const { count, rows: productos } =
        await Producto.findAndCountAll(options);

      // Calcular metadatos de paginación
      const totalPages = Math.ceil(count / parseInt(limit));
      const nextPage = page < totalPages ? parseInt(page) + 1 : null;
      const prevPage = page > 1 ? parseInt(page) - 1 : null;

      res.json({
        status: "success",
        data: productos,
        meta: {
          totalItems: count,
          totalPages,
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit),
          nextPage,
          prevPage,
        },
      });
    } catch (error) {
      logError("Error al obtener productos", error);
      res.status(500).json({
        status: "error",
        message: "Error al obtener productos",
        error: error.message,
      });
    }
  };

  /**
   * Busca productos por nombre, código o descripción
   * @route GET /api/productos/buscar
   */
  const buscarProductos = async (req, res) => {
    try {
      const { q, categoria } = req.query;

      if (!q && !categoria) {
        return res.status(400).json({
          status: "error",
          message: "Se requiere un término de búsqueda o categoría",
        });
      }

      const where = {};

      if (q) {
        where[Op.or] = [
          { nombre: { [Op.like]: `%${q}%` } },
          { codigo: { [Op.like]: `%${q}%` } },
          { descripcion: { [Op.like]: `%${q}%` } },
        ];
      }

      if (categoria) {
        where.categoria = categoria;
      }

      const productos = await Producto.findAll({
        where,
        limit: 20,
      });

      res.json({
        status: "success",
        data: productos,
        meta: {
          count: productos.length,
          query: q,
          categoria,
        },
      });
    } catch (error) {
      logError("Error al buscar productos", error);
      res.status(500).json({
        status: "error",
        message: "Error al buscar productos",
        error: error.message,
      });
    }
  };

  /**
   * Obtiene productos por categoría
   * @route GET /api/productos/categoria/:categoria
   */
  const obtenerProductosPorCategoria = async (req, res) => {
    try {
      const { categoria } = req.params;
      const { activo = true } = req.query;

      const where = {
        categoria,
        activo: activo === "true",
      };

      const productos = await Producto.findAll({
        where,
        order: [["nombre", "ASC"]],
      });

      res.json({
        status: "success",
        data: productos,
        meta: {
          categoria,
          count: productos.length,
        },
      });
    } catch (error) {
      logError("Error al obtener productos por categoría", error);
      res.status(500).json({
        status: "error",
        message: "Error al obtener productos por categoría",
        error: error.message,
      });
    }
  };

  /**
   * Obtiene productos con stock por debajo del mínimo
   * @route GET /api/productos/bajo-stock
   */
  const obtenerProductosConBajoStock = async (req, res) => {
    try {
      const productos = await Producto.findAll({
        where: {
          [Op.and]: [
            // Verificar que el stock sea menor o igual al stock mínimo
            Producto.sequelize.literal("stock <= stockMinimo"),
            // Garantizar que hay un stock mínimo definido
            { stockMinimo: { [Op.gt]: 0 } },
            // Solo productos activos
            { activo: true },
          ],
        },
        order: [
          // Ordenar primero por la diferencia entre stock y stockMinimo (más críticos primero)
          Producto.sequelize.literal("(stockMinimo - stock) DESC"),
          ["nombre", "ASC"],
        ],
      });

      res.json({
        status: "success",
        data: productos,
        meta: {
          count: productos.length,
        },
      });
    } catch (error) {
      logError("Error al obtener productos con bajo stock", error);
      res.status(500).json({
        status: "error",
        message: "Error al obtener productos con bajo stock",
        error: error.message,
      });
    }
  };

  /**
   * Crea un nuevo producto
   * @route POST /api/productos
   */
  const crearProducto = async (req, res) => {
    try {
      const {
        codigo,
        nombre,
        descripcion,
        precio,
        stock,
        stockMinimo,
        categoria,
        imagen,
      } = req.body;

      // Verificar si ya existe un producto con el mismo código
      if (codigo) {
        const productoExistente = await Producto.findOne({
          where: { codigo: codigo.toUpperCase() },
        });

        if (productoExistente) {
          return res.status(409).json({
            status: "error",
            message: "Ya existe un producto con este código",
          });
        }
      }

      // Crear el producto
      const nuevoProducto = await Producto.create({
        codigo: codigo ? codigo.toUpperCase() : null,
        nombre,
        descripcion,
        precio,
        stock: stock || 0,
        stockMinimo: stockMinimo || 5,
        categoria,
        imagen,
        activo: true,
      });

      logInfo("Producto creado exitosamente", {
        productoId: nuevoProducto.id,
        codigo: nuevoProducto.codigo,
        nombre: nuevoProducto.nombre,
      });

      res.status(201).json({
        status: "success",
        message: "Producto creado exitosamente",
        data: nuevoProducto,
      });
    } catch (error) {
      logError("Error al crear producto", error);

      // Manejar errores de validación
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        return res.status(400).json({
          status: "error",
          message: "Error de validación",
          errors: error.errors.map((e) => ({
            field: e.path,
            message: e.message,
          })),
        });
      }

      res.status(500).json({
        status: "error",
        message: "Error al crear producto",
        error: error.message,
      });
    }
  };

  /**
   * Obtiene un producto por ID
   * @route GET /api/productos/:id
   */
  const obtenerProductoPorId = async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);

      if (!producto) {
        return res.status(404).json({
          status: "error",
          message: "Producto no encontrado",
        });
      }

      res.json({
        status: "success",
        data: producto,
      });
    } catch (error) {
      logError("Error al obtener producto", error);
      res.status(500).json({
        status: "error",
        message: "Error al obtener producto",
        error: error.message,
      });
    }
  };

  /**
   * Actualiza el stock de un producto
   * @route PATCH /api/productos/:id/stock
   */
  const actualizarStock = async (req, res) => {
    try {
      const { id } = req.params;
      const { cantidad, tipo = "SUMAR" } = req.body;

      if (!cantidad || cantidad <= 0) {
        return res.status(400).json({
          status: "error",
          message: "La cantidad debe ser un número positivo",
        });
      }

      const producto = await Producto.findByPk(id);

      if (!producto) {
        return res.status(404).json({
          status: "error",
          message: "Producto no encontrado",
        });
      }

      // Si no tiene campo stock, error
      if (producto.stock === undefined) {
        return res.status(400).json({
          status: "error",
          message: "Este producto no maneja stock",
        });
      }

      const stockAnterior = producto.stock;
      let nuevoStock;

      // Actualizar stock según el tipo de operación
      if (tipo === "SUMAR") {
        nuevoStock = stockAnterior + parseInt(cantidad);
      } else if (tipo === "RESTAR") {
        if (stockAnterior < cantidad) {
          return res.status(400).json({
            status: "error",
            message: "Stock insuficiente",
            data: {
              stockActual: stockAnterior,
              cantidad,
            },
          });
        }
        nuevoStock = stockAnterior - parseInt(cantidad);
      } else {
        return res.status(400).json({
          status: "error",
          message: "Tipo de operación inválido. Use SUMAR o RESTAR",
        });
      }

      // Actualizar el producto
      await producto.update({ stock: nuevoStock });

      // Verificar si queda poco stock
      let alerta = null;
      if (nuevoStock <= producto.stockMinimo) {
        alerta = {
          tipo: "bajo_stock",
          mensaje: `El stock está por debajo del mínimo recomendado (${producto.stockMinimo})`,
          stockActual: nuevoStock,
          stockMinimo: producto.stockMinimo,
        };
      }

      logInfo("Stock de producto actualizado", {
        productoId: producto.id,
        stockAnterior,
        stockNuevo: nuevoStock,
        operacion: tipo,
        cantidad,
      });

      res.json({
        status: "success",
        message: "Stock actualizado correctamente",
        data: {
          id: parseInt(id),
          stockAnterior,
          stockNuevo: nuevoStock,
          operacion: tipo,
          cantidad: parseInt(cantidad),
        },
        alerta,
      });
    } catch (error) {
      logError("Error al actualizar stock", error);
      res.status(500).json({
        status: "error",
        message: "Error al actualizar stock",
        error: error.message,
      });
    }
  };

  /**
   * Actualiza un producto existente
   * @route PUT /api/productos/:id
   */
  const actualizarProducto = async (req, res) => {
    try {
      const {
        codigo,
        nombre,
        descripcion,
        precio,
        stock,
        stockMinimo,
        categoria,
        imagen,
        activo,
      } = req.body;

      const producto = await Producto.findByPk(req.params.id);

      if (!producto) {
        return res.status(404).json({
          status: "error",
          message: "Producto no encontrado",
        });
      }

      // Si se actualiza el código, verificar que no exista ya
      if (codigo && codigo !== producto.codigo) {
        const codigoExistente = await Producto.findOne({
          where: {
            codigo: codigo.toUpperCase(),
            id: { [Op.ne]: producto.id },
          },
        });

        if (codigoExistente) {
          return res.status(409).json({
            status: "error",
            message: "Ya existe otro producto con este código",
          });
        }
      }

      // Actualizar producto
      await producto.update({
        codigo: codigo ? codigo.toUpperCase() : producto.codigo,
        nombre: nombre || producto.nombre,
        descripcion:
          descripcion !== undefined ? descripcion : producto.descripcion,
        precio: precio !== undefined ? precio : producto.precio,
        stock: stock !== undefined ? stock : producto.stock,
        stockMinimo:
          stockMinimo !== undefined ? stockMinimo : producto.stockMinimo,
        categoria: categoria || producto.categoria,
        imagen: imagen !== undefined ? imagen : producto.imagen,
        activo: activo !== undefined ? activo : producto.activo,
      });

      logInfo("Producto actualizado", {
        productoId: producto.id,
        cambios: req.body,
      });

      res.json({
        status: "success",
        message: "Producto actualizado correctamente",
        data: producto,
      });
    } catch (error) {
      logError("Error al actualizar producto", error);

      // Manejar errores de validación
      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          status: "error",
          message: "Error de validación",
          errors: error.errors.map((e) => ({
            field: e.path,
            message: e.message,
          })),
        });
      }

      res.status(500).json({
        status: "error",
        message: "Error al actualizar producto",
        error: error.message,
      });
    }
  };

  /**
   * Elimina un producto
   * @route DELETE /api/productos/:id
   */
  const eliminarProducto = async (req, res) => {
    try {
      const producto = await Producto.findByPk(req.params.id);

      if (!producto) {
        return res.status(404).json({
          status: "error",
          message: "Producto no encontrado",
        });
      }

      // Verificar si tiene pedidos asociados antes de eliminar
      if (Pedido) {
        const pedidosAsociados = await Pedido.count({
          where: { productoId: req.params.id },
        });

        if (pedidosAsociados > 0) {
          // Si tiene pedidos, marcar como inactivo en lugar de eliminar
          await producto.update({ activo: false });

          logInfo("Producto marcado como inactivo", {
            productoId: producto.id,
            pedidosAsociados,
          });

          return res.json({
            status: "success",
            message:
              "Producto marcado como inactivo porque tiene pedidos asociados",
            data: { id: producto.id, activo: false },
          });
        }
      }

      // Si no tiene pedidos o no se verificó, eliminar completamente
      await producto.destroy();

      logInfo("Producto eliminado", {
        productoId: req.params.id,
      });

      res.json({
        status: "success",
        message: "Producto eliminado correctamente",
        data: { id: parseInt(req.params.id) },
      });
    } catch (error) {
      logError("Error al eliminar producto", error);
      res.status(500).json({
        status: "error",
        message: "Error al eliminar producto",
        error: error.message,
      });
    }
  };

  return {
    obtenerProductos,
    crearProducto,
    obtenerProductoPorId,
    actualizarProducto,
    eliminarProducto,
    buscarProductos,
    actualizarStock,
    obtenerProductosConBajoStock,
    obtenerProductosPorCategoria,
  };
};

export default createProductoController;
