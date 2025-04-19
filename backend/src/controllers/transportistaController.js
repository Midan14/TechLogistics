// controllers/transportistaController.js
import { Op } from "sequelize";
import { logError, logInfo } from "../config/logger.js";

/**
 * Controlador para gestionar transportistas
 * @param {Object} models - Modelos Sequelize requeridos
 * @returns {Object} Objeto con métodos del controlador
 */

const createTransportistaController = ({ Transportista, Pedido }) => {
  /**
   * Obtiene todos los transportistas
   * @route GET /api/transportistas
   */
  const obtenerTransportistas = async (req, res) => {
    try {
      const { disponible, zona } = req.query;

      // Construir condiciones según los filtros
      const where = {};
      if (disponible !== undefined) {
        where.disponible = disponible === "true";
      }

      if (zona) {
        where.zona_cobertura = { [Op.like]: `%${zona}%` };
      }

      const transportistas = await Transportista.findAll({
        where,
        order: [["nombre", "ASC"]],
      });

      res.json({
        status: "success",
        data: transportistas,
      });
    } catch (error) {
      logError("Error al obtener transportistas", error);
      res.status(500).json({
        status: "error",
        message: "Error al obtener transportistas",
        error: error.message,
      });
    }
  };

  /**
   * Obtiene un transportista por ID
   * @route GET /api/transportistas/:id
   */
  const obtenerTransportistaPorId = async (req, res) => {
    try {
      const transportista = await Transportista.findByPk(req.params.id);

      if (!transportista) {
        return res.status(404).json({
          status: "error",
          message: "Transportista no encontrado",
        });
      }

      res.json({
        status: "success",
        data: transportista,
      });
    } catch (error) {
      logError("Error al obtener transportista", error);
      res.status(500).json({
        status: "error",
        message: "Error al obtener transportista",
        error: error.message,
      });
    }
  };

  /**
   * Crea un nuevo transportista
   * @route POST /api/transportistas
   */
  const crearTransportista = async (req, res) => {
    try {
      const {
        nombre,
        placa,
        telefono,
        email,
        tipo_vehiculo,
        capacidad_carga,
        zona_cobertura,
      } = req.body;

      // Crear el nuevo transportista
      const nuevoTransportista = await Transportista.create({
        nombre,
        placa,
        telefono,
        email,
        tipo_vehiculo: tipo_vehiculo || "Automóvil",
        capacidad_carga,
        zona_cobertura,
        disponible: true,
        calificacion: 5.0,
      });

      logInfo("Nuevo transportista creado", {
        id: nuevoTransportista.id_transportista,
        nombre: nuevoTransportista.nombre,
      });

      res.status(201).json({
        status: "success",
        message: "Transportista creado correctamente",
        data: nuevoTransportista,
      });
    } catch (error) {
      logError("Error al crear transportista", error);

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
        message: "Error al crear transportista",
        error: error.message,
      });
    }
  };

  /**
   * Actualiza un transportista existente
   * @route PUT /api/transportistas/:id
   */
  const actualizarTransportista = async (req, res) => {
    try {
      const {
        nombre,
        placa,
        telefono,
        email,
        tipo_vehiculo,
        capacidad_carga,
        zona_cobertura,
        disponible,
        calificacion,
      } = req.body;

      // Buscar el transportista a actualizar
      const transportista = await Transportista.findByPk(req.params.id);
      if (!transportista) {
        return res.status(404).json({
          status: "error",
          message: "Transportista no encontrado",
        });
      }

      // Actualizar el transportista
      await transportista.update({
        nombre,
        placa,
        telefono,
        email,
        tipo_vehiculo,
        capacidad_carga,
        zona_cobertura,
        disponible,
        calificacion,
      });

      logInfo("Transportista actualizado", {
        id: transportista.id_transportista,
        cambios: req.body,
      });

      res.json({
        status: "success",
        message: "Transportista actualizado correctamente",
        data: transportista,
      });
    } catch (error) {
      logError("Error al actualizar transportista", error);

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
        message: "Error al actualizar transportista",
        error: error.message,
      });
    }
  };

  /**
   * Elimina un transportista
   * @route DELETE /api/transportistas/:id
   */
  const eliminarTransportista = async (req, res) => {
    try {
      const transportista = await Transportista.findByPk(req.params.id);
      if (!transportista) {
        return res.status(404).json({
          status: "error",
          message: "Transportista no encontrado",
        });
      }

      // Verificar si el transportista tiene pedidos asignados
      const pedidosAsignados = await Pedido.count({
        where: { transportistaId: req.params.id },
      });

      if (pedidosAsignados > 0) {
        // Marcar como no disponible en lugar de eliminar
        await transportista.update({ disponible: false });

        logInfo("Transportista marcado como no disponible", {
          id: transportista.id_transportista,
          pedidosAsociados: pedidosAsignados,
        });

        return res.json({
          status: "success",
          message:
            "Transportista marcado como no disponible porque tiene pedidos asociados",
          data: { id: transportista.id_transportista, disponible: false },
        });
      }

      // Si no tiene pedidos, eliminar completamente
      await transportista.destroy();

      logInfo("Transportista eliminado", {
        id: req.params.id,
      });

      res.json({
        status: "success",
        message: "Transportista eliminado correctamente",
        data: { id: parseInt(req.params.id) },
      });
    } catch (error) {
      logError("Error al eliminar transportista", error);
      res.status(500).json({
        status: "error",
        message: "Error al eliminar transportista",
        error: error.message,
      });
    }
  };

  /**
   * Obtiene transportistas disponibles para asignación
   * @route GET /api/transportistas/disponibles
   */
  const obtenerTransportistasDisponibles = async (req, res) => {
    try {
      const transportistas = await Transportista.findAll({
        where: { disponible: true },
        order: [["calificacion", "DESC"]],
      });

      res.json({
        status: "success",
        data: transportistas,
      });
    } catch (error) {
      logError("Error al obtener transportistas disponibles", error);
      res.status(500).json({
        status: "error",
        message: "Error al obtener transportistas disponibles",
        error: error.message,
      });
    }
  };

  return {
    obtenerTransportistas,
    obtenerTransportistaPorId,
    crearTransportista,
    actualizarTransportista,
    eliminarTransportista,
    obtenerTransportistasDisponibles,
  };
};

export default createTransportistaController;
