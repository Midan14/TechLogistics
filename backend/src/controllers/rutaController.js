// src/controllers/rutaController.js

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
    .json({ status: "error", message: "Ruta no encontrada" });
};

/**
 * Crea un controlador para gestionar rutas
 */
const createRutaController = (Ruta, models = {}) => {
  const { Pedido, Transportista } = models;

  /**
   * Obtiene todas las rutas con paginación básica
   */
  const obtenerRutas = async (req, res) => {
    try {
      const { page = 1, limit = 10, activa, transportistaId } = req.query;

      // Filtros básicos
      const where = {};
      if (activa !== undefined) where.activa = activa === "true";
      if (transportistaId) where.transportistaId = transportistaId;

      // Ejecutar consulta paginada
      const { count, rows: rutas } = await Ruta.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [["origen", "ASC"]],
      });

      res.json({
        status: "success",
        data: rutas,
        meta: { total: count, page: parseInt(page), limit: parseInt(limit) },
      });
    } catch (error) {
      handleError(res, error, "Error al obtener rutas");
    }
  };

  /**
   * Obtiene rutas por transportista
   */
  const obtenerRutasPorTransportista = async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar que existe el transportista
      if (Transportista) {
        const transportista = await Transportista.findByPk(id);
        if (!transportista) {
          return res.status(404).json({
            status: "error",
            message: "Transportista no encontrado",
          });
        }
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
        meta: { transportistaId: parseInt(id), count: rutas.length },
      });
    } catch (error) {
      handleError(res, error, "Error al obtener rutas del transportista");
    }
  };

  /**
   * Obtiene pedidos de una ruta
   */
  const obtenerPedidosPorRuta = async (req, res) => {
    try {
      const { id } = req.params;

      // Verificar que la ruta existe
      const ruta = await Ruta.findByPk(id);
      if (!ruta) return notFound(res);

      // Si no hay modelo Pedido disponible
      if (!Pedido) {
        return res.status(501).json({
          status: "error",
          message: "Funcionalidad no implementada",
        });
      }

      // Buscar pedidos de la ruta
      const pedidos = await Pedido.findAll({
        where: { rutaId: id },
        order: [["fechaPedido", "DESC"]],
      });

      res.json({
        status: "success",
        data: pedidos,
        meta: { rutaId: parseInt(id), count: pedidos.length },
      });
    } catch (error) {
      handleError(res, error, "Error al obtener pedidos de la ruta");
    }
  };

  /**
   * Crea una nueva ruta
   */
  const crearRuta = async (req, res) => {
    try {
      const { origen, destino, transportistaId, codigo } = req.body;

      // Crear la ruta
      const nuevaRuta = await Ruta.create({
        codigo: codigo ? codigo.toUpperCase() : null,
        origen,
        destino,
        transportistaId,
        activa: true,
      });

      logInfo("Ruta creada exitosamente", { rutaId: nuevaRuta.id });

      res.status(201).json({
        status: "success",
        message: "Ruta creada exitosamente",
        data: nuevaRuta,
      });
    } catch (error) {
      logError("Error al crear ruta", error);

      // Error específico para restricciones únicas
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          status: "error",
          message: "Ya existe una ruta con este código",
        });
      }

      res.status(400).json({
        status: "error",
        message: "Error al crear ruta",
        error: error.message,
      });
    }
  };

  /**
   * Obtiene una ruta por ID
   */
  const obtenerRutaPorId = async (req, res) => {
    try {
      const ruta = await Ruta.findByPk(req.params.id);
      if (!ruta) return notFound(res);

      res.json({
        status: "success",
        data: ruta,
      });
    } catch (error) {
      handleError(res, error, "Error al obtener ruta");
    }
  };

  /**
   * Actualiza una ruta existente
   */
  const actualizarRuta = async (req, res) => {
    try {
      const ruta = await Ruta.findByPk(req.params.id);
      if (!ruta) return notFound(res);

      // Actualizar la ruta
      await ruta.update(req.body);

      logInfo("Ruta actualizada", { rutaId: ruta.id });

      res.json({
        status: "success",
        message: "Ruta actualizada correctamente",
        data: ruta,
      });
    } catch (error) {
      logError("Error al actualizar ruta", error);
      res.status(400).json({
        status: "error",
        message: "Error al actualizar ruta",
        error: error.message,
      });
    }
  };

  /**
   * Elimina una ruta
   */
  const eliminarRuta = async (req, res) => {
    try {
      const ruta = await Ruta.findByPk(req.params.id);
      if (!ruta) return notFound(res);

      // Verificar si tiene pedidos asociados antes de eliminar
      if (Pedido) {
        const pedidosAsociados = await Pedido.count({
          where: { rutaId: req.params.id },
        });

        if (pedidosAsociados > 0) {
          // Marcar como inactiva en lugar de eliminar
          await ruta.update({ activa: false });

          return res.json({
            status: "success",
            message:
              "Ruta marcada como inactiva porque tiene pedidos asociados",
            data: { id: ruta.id, activa: false },
          });
        }
      }

      // Si no tiene pedidos, eliminar completamente
      await ruta.destroy();

      res.json({
        status: "success",
        message: "Ruta eliminada correctamente",
        data: { id: parseInt(req.params.id) },
      });
    } catch (error) {
      handleError(res, error, "Error al eliminar ruta");
    }
  };

  /**
   * Verifica si una ruta está activa según su horario
   */
  const verificarRutaActiva = async (req, res) => {
    try {
      const { id } = req.query;
      const ruta = await Ruta.findByPk(id);

      if (!ruta) return notFound(res);

      // Verificar estado activo básico
      if (!ruta.activa) {
        return res.json({
          status: "success",
          data: { activa: false, razon: "Ruta inactiva" },
        });
      }

      // Verificar horario si la ruta tiene campos de horario
      let activaHorario = true;
      let razon = "";

      if (ruta.horario_inicio !== undefined && ruta.horario_fin !== undefined) {
        const horaActual = new Date().getHours();
        activaHorario =
          horaActual >= ruta.horario_inicio && horaActual < ruta.horario_fin;

        if (!activaHorario) {
          razon = `Fuera de horario. Horario: ${ruta.horario_inicio}h - ${ruta.horario_fin}h`;
        }
      }

      res.json({
        status: "success",
        data: {
          id: parseInt(id),
          activa: activaHorario,
          razon: razon || "Ruta disponible",
          horarioInicio: ruta.horario_inicio,
          horarioFin: ruta.horario_fin,
        },
      });
    } catch (error) {
      handleError(res, error, "Error al verificar estado de ruta");
    }
  };

  return {
    obtenerRutas,
    crearRuta,
    obtenerRutaPorId,
    actualizarRuta,
    eliminarRuta,
    obtenerRutasPorTransportista,
    obtenerPedidosPorRuta,
    verificarRutaActiva,
  };
};

export default createRutaController;
