// src/controllers/transportistaController.js

import { Op } from "sequelize";
import { logError, logInfo } from "../config/logger.js";

// Utilidades para reducir código repetitivo
const handleError = (res, error, message) => {
  logError(message, error);
  res.status(500).json({ status: "error", message, error: error.message });
};

const notFound = (res) => {
  return res
    .status(404)
    .json({ status: "error", message: "Transportista no encontrado" });
};

/**
 * Crea un controlador para gestionar transportistas
 */
const createTransportistaController = (Transportista, models = {}) => {
  const { Ruta, Pedido } = models;

  /**
   * Obtiene todos los transportistas con filtros básicos
   */
  const obtenerTransportistas = async (req, res) => {
    try {
      const { page = 1, limit = 10, activo, vehiculo } = req.query;

      // Filtros básicos
      const where = {};
      if (activo !== undefined) where.activo = activo === "true";
      if (vehiculo) where.vehiculo = { [Op.like]: `%${vehiculo}%` };

      // Ejecutar consulta paginada
      const { count, rows: transportistas } =
        await Transportista.findAndCountAll({
          where,
          limit: parseInt(limit),
          offset: (parseInt(page) - 1) * parseInt(limit),
          order: [["nombre", "ASC"]],
        });

      res.json({
        status: "success",
        data: transportistas,
        meta: { total: count, page: parseInt(page), limit: parseInt(limit) },
      });
    } catch (error) {
      handleError(res, error, "Error al obtener transportistas");
    }
  };

  /**
   * Obtiene transportistas disponibles para asignación
   */
  const obtenerTransportistasDisponibles = async (req, res) => {
    try {
      // Si no hay modelo Pedido, devolver todos los transportistas activos
      if (!Pedido) {
        const transportistas = await Transportista.findAll({
          where: { activo: true },
          order: [["nombre", "ASC"]],
        });

        return res.json({
          status: "success",
          data: transportistas,
          meta: { count: transportistas.length },
        });
      }

      // Si hay modelo Pedido, hacer un análisis más detallado
      const transportistas = await Transportista.findAll({
        where: { activo: true },
        order: [["nombre", "ASC"]],
      });

      // Para cada transportista, verificar disponibilidad
      const transportistasConDisponibilidad = await Promise.all(
        transportistas.map(async (transportista) => {
          // Contar pedidos activos para este transportista
          const pedidosActivos = await Pedido.count({
            where: {
              transportistaId: transportista.id,
              estado: {
                [Op.in]: ["PENDIENTE", "EN_PREPARACION", "EN_RUTA"],
              },
            },
          });

          const capacidadMaxima = transportista.capacidad_maxima_pedidos || 10;
          const disponible = pedidosActivos < capacidadMaxima;

          return {
            ...transportista.toJSON(),
            pedidosActivos,
            capacidadMaxima,
            disponible,
          };
        }),
      );

      // Filtrar solo los disponibles si se solicita
      const { soloDisponibles } = req.query;
      const resultado =
        soloDisponibles === "true"
          ? transportistasConDisponibilidad.filter((t) => t.disponible)
          : transportistasConDisponibilidad;

      res.json({
        status: "success",
        data: resultado,
        meta: { count: resultado.length },
      });
    } catch (error) {
      handleError(res, error, "Error al obtener transportistas disponibles");
    }
  };

  /**
   * Obtiene rutas asignadas a un transportista
   */
  const obtenerRutasTransportista = async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar que el transportista existe
      const transportista = await Transportista.findByPk(id);
      if (!transportista) return notFound(res);

      // Si no hay modelo Ruta disponible
      if (!Ruta) {
        return res.status(501).json({
          status: "error",
          message: "Funcionalidad no implementada",
        });
      }

      // Buscar rutas del transportista
      const rutas = await Ruta.findAll({
        where: {
          transportistaId: id,
          activa: true,
        },
        order: [["origen", "ASC"]],
      });

      res.json({
        status: "success",
        data: rutas,
        meta: {
          transportistaId: parseInt(id),
          nombre: transportista.nombre,
          count: rutas.length,
        },
      });
    } catch (error) {
      handleError(res, error, "Error al obtener rutas del transportista");
    }
  };

  /**
   * Obtiene pedidos asignados a un transportista
   */
  const obtenerPedidosTransportista = async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.query;

      // Verificar que el transportista existe
      const transportista = await Transportista.findByPk(id);
      if (!transportista) return notFound(res);

      // Si no hay modelo Pedido disponible
      if (!Pedido) {
        return res.status(501).json({
          status: "error",
          message: "Funcionalidad no implementada",
        });
      }

      // Construir condiciones de búsqueda
      const where = { transportistaId: id };
      if (estado) {
        where.estado = estado;
      }

      // Buscar pedidos del transportista
      const pedidos = await Pedido.findAll({
        where,
        order: [["fechaPedido", "DESC"]],
      });

      res.json({
        status: "success",
        data: pedidos,
        meta: {
          transportistaId: parseInt(id),
          nombre: transportista.nombre,
          count: pedidos.length,
        },
      });
    } catch (error) {
      handleError(res, error, "Error al obtener pedidos del transportista");
    }
  };

  /**
   * Crea un nuevo transportista
   */
  const crearTransportista = async (req, res) => {
    try {
      const { nombre, apellido, documento, telefono, email, vehiculo, placa } =
        req.body;

      // Crear el transportista
      const nuevoTransportista = await Transportista.create({
        nombre,
        apellido,
        documento,
        telefono,
        email,
        vehiculo,
        placa,
        activo: true,
      });

      logInfo("Transportista creado exitosamente", {
        id: nuevoTransportista.id,
      });

      res.status(201).json({
        status: "success",
        message: "Transportista creado exitosamente",
        data: nuevoTransportista,
      });
    } catch (error) {
      logError("Error al crear transportista", error);

      // Error específico para restricciones únicas
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          status: "error",
          message: "Ya existe un transportista con este documento o placa",
        });
      }

      res.status(400).json({
        status: "error",
        message: "Error al crear transportista",
        error: error.message,
      });
    }
  };

  /**
   * Obtiene un transportista por ID
   */
  const obtenerTransportistaPorId = async (req, res) => {
    try {
      const transportista = await Transportista.findByPk(req.params.id);
      if (!transportista) return notFound(res);

      res.json({
        status: "success",
        data: transportista,
      });
    } catch (error) {
      handleError(res, error, "Error al obtener transportista");
    }
  };

  /**
   * Activa un transportista
   */
  const activarTransportista = async (req, res) => {
    try {
      const transportista = await Transportista.findByPk(req.params.id);
      if (!transportista) return notFound(res);

      await transportista.update({ activo: true });

      logInfo("Transportista activado", { id: transportista.id });

      res.json({
        status: "success",
        message: "Transportista activado correctamente",
        data: {
          id: transportista.id,
          nombre: transportista.nombre,
          activo: true,
        },
      });
    } catch (error) {
      handleError(res, error, "Error al activar transportista");
    }
  };

  /**
   * Desactiva un transportista
   */
  const desactivarTransportista = async (req, res) => {
    try {
      const transportista = await Transportista.findByPk(req.params.id);
      if (!transportista) return notFound(res);

      await transportista.update({ activo: false });

      logInfo("Transportista desactivado", { id: transportista.id });

      res.json({
        status: "success",
        message: "Transportista desactivado correctamente",
        data: {
          id: transportista.id,
          nombre: transportista.nombre,
          activo: false,
        },
      });
    } catch (error) {
      handleError(res, error, "Error al desactivar transportista");
    }
  };

  /**
   * Actualiza un transportista existente
   */
  const actualizarTransportista = async (req, res) => {
    try {
      const transportista = await Transportista.findByPk(req.params.id);
      if (!transportista) return notFound(res);

      // Actualizar el transportista
      await transportista.update(req.body);

      logInfo("Transportista actualizado", { id: transportista.id });

      res.json({
        status: "success",
        message: "Transportista actualizado correctamente",
        data: transportista,
      });
    } catch (error) {
      logError("Error al actualizar transportista", error);
      res.status(400).json({
        status: "error",
        message: "Error al actualizar transportista",
        error: error.message,
      });
    }
  };

  /**
   * Elimina un transportista
   */
  const eliminarTransportista = async (req, res) => {
    try {
      const transportista = await Transportista.findByPk(req.params.id);
      if (!transportista) return notFound(res);

      // Verificar si tiene pedidos o rutas asociadas
      let tieneAsociaciones = false;

      if (Pedido) {
        const pedidosCount = await Pedido.count({
          where: { transportistaId: req.params.id },
        });
        if (pedidosCount > 0) tieneAsociaciones = true;
      }

      if (!tieneAsociaciones && Ruta) {
        const rutasCount = await Ruta.count({
          where: { transportistaId: req.params.id },
        });
        if (rutasCount > 0) tieneAsociaciones = true;
      }

      if (tieneAsociaciones) {
        // Si tiene asociaciones, solo desactivar
        await transportista.update({ activo: false });

        return res.json({
          status: "success",
          message:
            "Transportista marcado como inactivo porque tiene pedidos o rutas asociadas",
          data: { id: transportista.id, activo: false },
        });
      }

      // Si no tiene asociaciones, eliminar completamente
      await transportista.destroy();

      res.json({
        status: "success",
        message: "Transportista eliminado correctamente",
        data: { id: parseInt(req.params.id) },
      });
    } catch (error) {
      handleError(res, error, "Error al eliminar transportista");
    }
  };

  return {
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
  };
};

export default createTransportistaController;
