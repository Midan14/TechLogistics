// src/controllers/clienteController.js

import { Op } from "sequelize";
import { logError, logInfo } from "../config/logger.js";

/**
 * Crea un controlador para gestionar clientes
 * @param {Model} Cliente - Modelo Sequelize para Cliente
 * @param {Object} models - Otros modelos relacionados (opcional)
 * @returns {Object} Objeto con métodos del controlador
 */
const createClienteController = (Cliente, models = {}) => {
  const { Pedido } = models;

  /**
   * Obtiene todos los clientes con paginación y filtros
   * @route GET /api/clientes
   */
  const obtenerClientes = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort = "id",
        order = "ASC",
        nombre,
        email,
        estado,
      } = req.query;

      // Construir opciones de filtrado
      const where = {};
      if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };
      if (email) where.email = { [Op.like]: `%${email}%` };
      if (estado) where.estado = estado;

      // Opciones de paginación y orden
      const options = {
        where,
        order: [[sort, order]],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
      };

      // Ejecutar consulta con conteo total
      const { count, rows: clientes } = await Cliente.findAndCountAll(options);

      // Calcular metadatos de paginación
      const totalPages = Math.ceil(count / parseInt(limit));
      const nextPage = page < totalPages ? parseInt(page) + 1 : null;
      const prevPage = page > 1 ? parseInt(page) - 1 : null;

      res.json({
        status: "success",
        data: clientes,
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
      logError("Error al obtener clientes", error);
      res.status(500).json({
        status: "error",
        message: "Error al obtener clientes",
        error: error.message,
      });
    }
  };

  /**
   * Busca clientes por diferentes criterios
   * @route GET /api/clientes/buscar
   */
  const buscarClientes = async (req, res) => {
    try {
      const { q } = req.query;

      if (!q || q.length < 2) {
        return res.status(400).json({
          status: "error",
          message: "El término de búsqueda debe tener al menos 2 caracteres",
        });
      }

      const clientes = await Cliente.findAll({
        where: {
          [Op.or]: [
            { nombre: { [Op.like]: `%${q}%` } },
            { email: { [Op.like]: `%${q}%` } },
            { telefono: { [Op.like]: `%${q}%` } },
          ],
        },
        limit: 20,
      });

      res.json({
        status: "success",
        data: clientes,
        meta: {
          count: clientes.length,
          query: q,
        },
      });
    } catch (error) {
      logError("Error al buscar clientes", error);
      res.status(500).json({
        status: "error",
        message: "Error al buscar clientes",
        error: error.message,
      });
    }
  };

  /**
   * Crea un nuevo cliente
   * @route POST /api/clientes
   */
  const crearCliente = async (req, res) => {
    try {
      const { nombre, apellido, email, telefono, direccion } = req.body;

      // Verificar si ya existe un cliente con el mismo email
      const clienteExistente = await Cliente.findOne({
        where: { email },
      });

      if (clienteExistente) {
        return res.status(409).json({
          status: "error",
          message: "Ya existe un cliente con este email",
        });
      }

      // Crear cliente en una transacción
      const nuevoCliente = await Cliente.create({
        nombre,
        apellido,
        email,
        telefono,
        direccion,
        estado: "ACTIVO",
      });

      logInfo("Cliente creado exitosamente", {
        clienteId: nuevoCliente.id,
        email: nuevoCliente.email,
      });

      res.status(201).json({
        status: "success",
        message: "Cliente creado exitosamente",
        data: nuevoCliente,
      });
    } catch (error) {
      logError("Error al crear cliente", error);

      // Manejar errores de validación de Sequelize
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

      // Manejar errores de restricción única
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          status: "error",
          message: "Ya existe un cliente con este email o teléfono",
        });
      }

      res.status(500).json({
        status: "error",
        message: "Error al crear cliente",
        error: error.message,
      });
    }
  };

  /**
   * Obtiene un cliente por ID
   * @route GET /api/clientes/:id
   */
  const obtenerClientePorId = async (req, res) => {
    try {
      const cliente = await Cliente.findByPk(req.params.id);

      if (!cliente) {
        return res.status(404).json({
          status: "error",
          message: "Cliente no encontrado",
        });
      }

      res.json({
        status: "success",
        data: cliente,
      });
    } catch (error) {
      logError("Error al obtener cliente", error);
      res.status(500).json({
        status: "error",
        message: "Error al obtener cliente",
        error: error.message,
      });
    }
  };

  /**
   * Obtiene los pedidos de un cliente
   * @route GET /api/clientes/:id/pedidos
   */
  const obtenerPedidosCliente = async (req, res) => {
    try {
      // Verificar que exista el cliente
      const cliente = await Cliente.findByPk(req.params.id);

      if (!cliente) {
        return res.status(404).json({
          status: "error",
          message: "Cliente no encontrado",
        });
      }

      // Obtener pedidos si el modelo Pedido está disponible
      if (!Pedido) {
        return res.status(501).json({
          status: "error",
          message: "Funcionalidad no implementada",
        });
      }

      const pedidos = await Pedido.findAll({
        where: { clienteId: req.params.id },
        order: [["fechaPedido", "DESC"]],
      });

      res.json({
        status: "success",
        data: pedidos,
        meta: {
          clienteId: parseInt(req.params.id),
          totalPedidos: pedidos.length,
        },
      });
    } catch (error) {
      logError("Error al obtener pedidos del cliente", error);
      res.status(500).json({
        status: "error",
        message: "Error al obtener pedidos del cliente",
        error: error.message,
      });
    }
  };

  /**
   * Actualiza un cliente existente
   * @route PUT /api/clientes/:id
   */
  const actualizarCliente = async (req, res) => {
    try {
      const { nombre, apellido, email, telefono, direccion, estado } = req.body;

      const cliente = await Cliente.findByPk(req.params.id);

      if (!cliente) {
        return res.status(404).json({
          status: "error",
          message: "Cliente no encontrado",
        });
      }

      // Si se está actualizando el email, verificar que no exista ya
      if (email && email !== cliente.email) {
        const emailExistente = await Cliente.findOne({ where: { email } });
        if (emailExistente) {
          return res.status(409).json({
            status: "error",
            message: "Ya existe un cliente con este email",
          });
        }
      }

      // Actualizar cliente
      await cliente.update({
        nombre,
        apellido,
        email,
        telefono,
        direccion,
        estado,
      });

      logInfo("Cliente actualizado", {
        clienteId: cliente.id,
        cambios: req.body,
      });

      res.json({
        status: "success",
        message: "Cliente actualizado correctamente",
        data: cliente,
      });
    } catch (error) {
      logError("Error al actualizar cliente", error);

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
        message: "Error al actualizar cliente",
        error: error.message,
      });
    }
  };

  /**
   * Elimina un cliente
   * @route DELETE /api/clientes/:id
   */
  const eliminarCliente = async (req, res) => {
    try {
      const cliente = await Cliente.findByPk(req.params.id);

      if (!cliente) {
        return res.status(404).json({
          status: "error",
          message: "Cliente no encontrado",
        });
      }

      // Verificar si tiene pedidos asociados antes de eliminar
      if (Pedido) {
        const pedidosAsociados = await Pedido.count({
          where: { clienteId: req.params.id },
        });

        if (pedidosAsociados > 0) {
          // Si tiene pedidos, marcar como inactivo en lugar de eliminar
          await cliente.update({ estado: "INACTIVO" });

          logInfo("Cliente marcado como inactivo", {
            clienteId: cliente.id,
            pedidosAsociados,
          });

          return res.json({
            status: "success",
            message:
              "Cliente marcado como inactivo porque tiene pedidos asociados",
            data: { id: cliente.id, estado: "INACTIVO" },
          });
        }
      }

      // Si no tiene pedidos o no se verificó, eliminar completamente
      await cliente.destroy();

      logInfo("Cliente eliminado", { clienteId: req.params.id });

      res.json({
        status: "success",
        message: "Cliente eliminado correctamente",
        data: { id: parseInt(req.params.id) },
      });
    } catch (error) {
      logError("Error al eliminar cliente", error);
      res.status(500).json({
        status: "error",
        message: "Error al eliminar cliente",
        error: error.message,
      });
    }
  };

  return {
    obtenerClientes,
    crearCliente,
    obtenerClientePorId,
    actualizarCliente,
    eliminarCliente,
    buscarClientes,
    obtenerPedidosCliente,
  };
};

export default createClienteController;
