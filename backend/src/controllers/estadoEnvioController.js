// src/controllers/estadoEnvioController.js

import { logError, logInfo } from "../config/logger.js";

/**
 * Crea un controlador para gestionar estados de envío
 * @param {Object} models - Modelos Sequelize requeridos
 * @returns {Object} Objeto con métodos del controlador
 */
const createEstadoEnvioController = ({ EstadoEnvio, Pedido }) => {
  /**
   * Obtiene todos los estados de envío
   * @route GET /api/estados-envio
   */
  const obtenerEstadosEnvio = async (req, res) => {
    try {
      const { activo } = req.query;

      // Construir condiciones según los filtros
      const where = {};
      if (activo !== undefined) {
        where.activo = activo === "true";
      }

      const estados = await EstadoEnvio.findAll({
        where,
        order: [["orden", "ASC"]],
      });

      res.json({
        status: "success",
        data: estados,
      });
    } catch (error) {
      logError("Error al obtener estados de envío", error);
      res.status(500).json({
        status: "error",
        message: "Error al obtener estados de envío",
        error: error.message,
      });
    }
  };

  /**
   * Inicializa los estados de envío predeterminados
   * @route POST /api/estados-envio/inicializar
   */
  const inicializarEstadosEnvio = async (req, res) => {
    try {
      // Usando el método del modelo
      await EstadoEnvio.inicializarEstados();

      // Obtener todos los estados después de inicializar
      const estados = await EstadoEnvio.findAll({
        order: [["orden", "ASC"]],
      });

      logInfo("Estados de envío inicializados correctamente");

      res.json({
        status: "success",
        message: "Estados de envío inicializados correctamente",
        data: estados,
      });
    } catch (error) {
      logError("Error al inicializar estados de envío", error);
      res.status(500).json({
        status: "error",
        message: "Error al inicializar estados de envío",
        error: error.message,
      });
    }
  };

  /**
   * Crea un nuevo estado de envío
   * @route POST /api/estados-envio
   */
  const crearEstadoEnvio = async (req, res) => {
    try {
      const { estado, descripcion, color, orden, activo } = req.body;

      // Verificar si ya existe un estado con el mismo código
      const estadoExistente = await EstadoEnvio.findOne({
        where: { nombre_estado: estado },
      });

      if (estadoExistente) {
        return res.status(409).json({
          status: "error",
          message: "Ya existe un estado con este código",
        });
      }

      // Crear el nuevo estado
      const nuevoEstado = await EstadoEnvio.create({
        nombre_estado: estado,
        descripcion,
        color: color || "#000000",
        orden: orden || 0,
        activo: activo === undefined ? true : activo,
      });

      logInfo("Nuevo estado de envío creado", {
        id: nuevoEstado.id_estado,
        estado: nuevoEstado.nombre_estado,
      });

      res.status(201).json({
        status: "success",
        message: "Estado de envío creado correctamente",
        data: nuevoEstado,
      });
    } catch (error) {
      logError("Error al crear estado de envío", error);

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
        message: "Error al crear estado de envío",
        error: error.message,
      });
    }
  };

  /**
   * Obtiene un estado de envío por ID
   * @route GET /api/estados-envio/:id
   */
  const obtenerEstadoEnvioPorId = async (req, res) => {
    try {
      const estado = await EstadoEnvio.findByPk(req.params.id);

      if (!estado) {
        return res.status(404).json({
          status: "error",
          message: "Estado de envío no encontrado",
        });
      }

      res.json({
        status: "success",
        data: estado,
      });
    } catch (error) {
      logError("Error al obtener estado de envío", error);
      res.status(500).json({
        status: "error",
        message: "Error al obtener estado de envío",
        error: error.message,
      });
    }
  };

  /**
   * Obtiene los pedidos asociados a un estado de envío
   * @route GET /api/estados-envio/:id/pedidos
   */
  const obtenerPedidosPorEstado = async (req, res) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // Verificar que el estado exista
      const estado = await EstadoEnvio.findByPk(id);
      if (!estado) {
        return res.status(404).json({
          status: "error",
          message: "Estado de envío no encontrado",
        });
      }

      // Obtener pedidos con este estado
      const { count, rows: pedidos } = await Pedido.findAndCountAll({
        where: { estadoEnvioId: id },
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [["fechaPedido", "DESC"]],
      });

      // Metadatos de paginación
      const totalPages = Math.ceil(count / parseInt(limit));
      const nextPage = page < totalPages ? parseInt(page) + 1 : null;
      const prevPage = page > 1 ? parseInt(page) - 1 : null;

      res.json({
        status: "success",
        data: pedidos,
        meta: {
          estado: estado.nombre_estado,
          totalItems: count,
          totalPages,
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit),
          nextPage,
          prevPage,
        },
      });
    } catch (error) {
      logError("Error al obtener pedidos por estado", error);
      res.status(500).json({
        status: "error",
        message: "Error al obtener pedidos por estado",
        error: error.message,
      });
    }
  };

  /**
   * Actualiza un estado de envío
   * @route PUT /api/estados-envio/:id
   */
  const actualizarEstadoEnvio = async (req, res) => {
    try {
      const { estado, descripcion, color, orden, activo } = req.body;

      // Buscar el estado a actualizar
      const estadoEnvio = await EstadoEnvio.findByPk(req.params.id);
      if (!estadoEnvio) {
        return res.status(404).json({
          status: "error",
          message: "Estado de envío no encontrado",
        });
      }

      // Si cambia el código, verificar que no exista otro con ese código
      if (estado && estado !== estadoEnvio.nombre_estado) {
        const estadoExistente = await EstadoEnvio.findOne({
          where: { nombre_estado: estado },
        });

        if (estadoExistente) {
          return res.status(409).json({
            status: "error",
            message: "Ya existe un estado con este código",
          });
        }
      }

      // Actualizar el estado
      await estadoEnvio.update({
        nombre_estado: estado,
        descripcion,
        color,
        orden,
        activo,
      });

      logInfo("Estado de envío actualizado", {
        id: estadoEnvio.id_estado,
        cambios: req.body,
      });

      res.json({
        status: "success",
        message: "Estado de envío actualizado correctamente",
        data: estadoEnvio,
      });
    } catch (error) {
      logError("Error al actualizar estado de envío", error);

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
        message: "Error al actualizar estado de envío",
        error: error.message,
      });
    }
  };

  /**
   * Elimina un estado de envío
   * @route DELETE /api/estados-envio/:id
   */
  const eliminarEstadoEnvio = async (req, res) => {
    try {
      const estadoEnvio = await EstadoEnvio.findByPk(req.params.id);
      if (!estadoEnvio) {
        return res.status(404).json({
          status: "error",
          message: "Estado de envío no encontrado",
        });
      }

      // Verificar si hay pedidos que usan este estado
      const pedidosAsociados = await Pedido.count({
        where: { estadoEnvioId: req.params.id },
      });

      if (pedidosAsociados > 0) {
        // Si hay pedidos asociados, marcar como inactivo en lugar de eliminar
        await estadoEnvio.update({ activo: false });

        logInfo("Estado de envío marcado como inactivo", {
          id: estadoEnvio.id_estado,
          pedidosAsociados,
        });

        return res.json({
          status: "success",
          message:
            "Estado de envío marcado como inactivo porque tiene pedidos asociados",
          data: { id: estadoEnvio.id_estado, activo: false },
        });
      }

      // Si no hay pedidos asociados, eliminar completamente
      await estadoEnvio.destroy();

      logInfo("Estado de envío eliminado", {
        id: req.params.id,
      });

      res.json({
        status: "success",
        message: "Estado de envío eliminado correctamente",
        data: { id: parseInt(req.params.id) },
      });
    } catch (error) {
      logError("Error al eliminar estado de envío", error);
      res.status(500).json({
        status: "error",
        message: "Error al eliminar estado de envío",
        error: error.message,
      });
    }
  };

  /**
   * Verifica si una transición de estado es válida
   * @route POST /api/estados-envio/verificar-transicion
   */
  const verificarTransicionEstado = async (req, res) => {
    try {
      const { estadoActualId, estadoNuevoId } = req.body;

      if (!estadoActualId || !estadoNuevoId) {
        return res.status(400).json({
          status: "error",
          message: "Se requieren los IDs de ambos estados",
        });
      }

      // Obtener los estados
      const estadoActual = await EstadoEnvio.findByPk(estadoActualId);
      const estadoNuevo = await EstadoEnvio.findByPk(estadoNuevoId);

      if (!estadoActual || !estadoNuevo) {
        return res.status(404).json({
          status: "error",
          message: "Uno o ambos estados no existen",
        });
      }

      // Definir transiciones válidas
      const transicionesPermitidas = {
        PENDIENTE: ["PREPARACION", "CANCELADO"],
        PREPARACION: ["EN_RUTA", "CANCELADO"],
        EN_RUTA: ["ENTREGADO", "NO_ENTREGADO"],
        ENTREGADO: [],
        NO_ENTREGADO: ["EN_RUTA"],
        CANCELADO: [],
      };

      // Verificar si la transición es válida
      const esTransicionValida =
        transicionesPermitidas[estadoActual.nombre_estado]?.includes(
          estadoNuevo.nombre_estado,
        ) || false;

      res.json({
        status: "success",
        data: {
          esTransicionValida,
          estadoActual: estadoActual.nombre_estado,
          estadoNuevo: estadoNuevo.nombre_estado,
          transicionesPermitidas:
            transicionesPermitidas[estadoActual.nombre_estado] || [],
        },
      });
    } catch (error) {
      logError("Error al verificar transición de estado", error);
      res.status(500).json({
        status: "error",
        message: "Error al verificar transición de estado",
        error: error.message,
      });
    }
  };

  return {
    obtenerEstadosEnvio,
    crearEstadoEnvio,
    obtenerEstadoEnvioPorId,
    actualizarEstadoEnvio,
    eliminarEstadoEnvio,
    inicializarEstadosEnvio,
    obtenerPedidosPorEstado,
    verificarTransicionEstado,
  };
};

export default createEstadoEnvioController;
