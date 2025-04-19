// src/routes/estadoEnvioRoutes.js

import { Router } from "express";
import { check, validationResult } from "express-validator";

/**
 * @param {Object} param0 Objeto con modelos
 * @returns {Router} Router configurado
 */
const estadoEnvioRoutes = ({ EstadoEnvio, Pedido }) => {
  const router = Router();

  // Middleware de validación
  const validateResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: "error",
        errores: errors.array(),
      });
    }
    next();
  };

  // Importar el controlador directamente en este archivo
  function createEstadoEnvioController({ EstadoEnvio, Pedido }) {
    const obtenerEstadosEnvio = async (req, res) => {
      try {
        const { activo } = req.query;
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
        console.error("Error al obtener estados de envío", error);
        res.status(500).json({
          status: "error",
          message: "Error al obtener estados de envío",
          error: error.message,
        });
      }
    };

    const inicializarEstadosEnvio = async (req, res) => {
      try {
        const estadosDefault = [
          {
            nombre_estado: "PENDIENTE",
            descripcion: "Pedido registrado pendiente de preparación",
            color: "#FFA500",
            orden: 1,
            activo: true,
          },
          {
            nombre_estado: "PREPARACION",
            descripcion: "Pedido en proceso de preparación",
            color: "#0000FF",
            orden: 2,
            activo: true,
          },
          {
            nombre_estado: "EN_RUTA",
            descripcion: "Pedido en ruta de entrega",
            color: "#008000",
            orden: 3,
            activo: true,
          },
          {
            nombre_estado: "ENTREGADO",
            descripcion: "Pedido entregado exitosamente",
            color: "#008000",
            orden: 4,
            activo: true,
          },
          {
            nombre_estado: "NO_ENTREGADO",
            descripcion: "Entrega fallida",
            color: "#FF0000",
            orden: 5,
            activo: true,
          },
          {
            nombre_estado: "CANCELADO",
            descripcion: "Pedido cancelado",
            color: "#FF0000",
            orden: 6,
            activo: true,
          },
        ];

        for (const estadoData of estadosDefault) {
          await EstadoEnvio.findOrCreate({
            where: { nombre_estado: estadoData.nombre_estado },
            defaults: estadoData,
          });
        }

        const estados = await EstadoEnvio.findAll({
          order: [["orden", "ASC"]],
        });

        console.info("Estados de envío inicializados correctamente");

        res.json({
          status: "success",
          message: "Estados de envío inicializados correctamente",
          data: estados,
        });
      } catch (error) {
        console.error("Error al inicializar estados de envío", error);
        res.status(500).json({
          status: "error",
          message: "Error al inicializar estados de envío",
          error: error.message,
        });
      }
    };

    const crearEstadoEnvio = async (req, res) => {
      try {
        const { estado, descripcion, color, orden, activo } = req.body;

        const estadoExistente = await EstadoEnvio.findOne({
          where: { nombre_estado: estado },
        });

        if (estadoExistente) {
          return res.status(409).json({
            status: "error",
            message: "Ya existe un estado con este código",
          });
        }

        const nuevoEstado = await EstadoEnvio.create({
          nombre_estado: estado,
          descripcion,
          color: color || "#000000",
          orden: orden || 0,
          activo: activo === undefined ? true : activo,
        });

        console.info("Nuevo estado de envío creado", {
          id: nuevoEstado.id_estado,
          estado: nuevoEstado.nombre_estado,
        });

        res.status(201).json({
          status: "success",
          message: "Estado de envío creado correctamente",
          data: nuevoEstado,
        });
      } catch (error) {
        console.error("Error al crear estado de envío", error);

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
        console.error("Error al obtener estado de envío", error);
        res.status(500).json({
          status: "error",
          message: "Error al obtener estado de envío",
          error: error.message,
        });
      }
    };

    const obtenerPedidosPorEstado = async (req, res) => {
      try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const estado = await EstadoEnvio.findByPk(id);
        if (!estado) {
          return res.status(404).json({
            status: "error",
            message: "Estado de envío no encontrado",
          });
        }

        const { count, rows: pedidos } = await Pedido.findAndCountAll({
          where: { estadoEnvioId: id },
          limit: parseInt(limit),
          offset: (parseInt(page) - 1) * parseInt(limit),
          order: [["fechaPedido", "DESC"]],
        });

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
        console.error("Error al obtener pedidos por estado", error);
        res.status(500).json({
          status: "error",
          message: "Error al obtener pedidos por estado",
          error: error.message,
        });
      }
    };

    const actualizarEstadoEnvio = async (req, res) => {
      try {
        const { estado, descripcion, color, orden, activo } = req.body;

        const estadoEnvio = await EstadoEnvio.findByPk(req.params.id);
        if (!estadoEnvio) {
          return res.status(404).json({
            status: "error",
            message: "Estado de envío no encontrado",
          });
        }

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

        await estadoEnvio.update({
          nombre_estado: estado,
          descripcion,
          color,
          orden,
          activo,
        });

        console.info("Estado de envío actualizado", {
          id: estadoEnvio.id_estado,
          cambios: req.body,
        });

        res.json({
          status: "success",
          message: "Estado de envío actualizado correctamente",
          data: estadoEnvio,
        });
      } catch (error) {
        console.error("Error al actualizar estado de envío", error);

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

    const eliminarEstadoEnvio = async (req, res) => {
      try {
        const estadoEnvio = await EstadoEnvio.findByPk(req.params.id);
        if (!estadoEnvio) {
          return res.status(404).json({
            status: "error",
            message: "Estado de envío no encontrado",
          });
        }

        const pedidosAsociados = await Pedido.count({
          where: { estadoEnvioId: req.params.id },
        });

        if (pedidosAsociados > 0) {
          await estadoEnvio.update({ activo: false });

          console.info("Estado de envío marcado como inactivo", {
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

        await estadoEnvio.destroy();

        console.info("Estado de envío eliminado", {
          id: req.params.id,
        });

        res.json({
          status: "success",
          message: "Estado de envío eliminado correctamente",
          data: { id: parseInt(req.params.id) },
        });
      } catch (error) {
        console.error("Error al eliminar estado de envío", error);
        res.status(500).json({
          status: "error",
          message: "Error al eliminar estado de envío",
          error: error.message,
        });
      }
    };

    const verificarTransicionEstado = async (req, res) => {
      try {
        const { estadoActualId, estadoNuevoId } = req.body;

        if (!estadoActualId || !estadoNuevoId) {
          return res.status(400).json({
            status: "error",
            message: "Se requieren los IDs de ambos estados",
          });
        }

        const estadoActual = await EstadoEnvio.findByPk(estadoActualId);
        const estadoNuevo = await EstadoEnvio.findByPk(estadoNuevoId);

        if (!estadoActual || !estadoNuevo) {
          return res.status(404).json({
            status: "error",
            message: "Uno o ambos estados no existen",
          });
        }

        const transicionesPermitidas = {
          PENDIENTE: ["PREPARACION", "CANCELADO"],
          PREPARACION: ["EN_RUTA", "CANCELADO"],
          EN_RUTA: ["ENTREGADO", "NO_ENTREGADO"],
          ENTREGADO: [],
          NO_ENTREGADO: ["EN_RUTA"],
          CANCELADO: [],
        };

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
        console.error("Error al verificar transición de estado", error);
        res.status(500).json({
          status: "error",
          message: "Error al verificar transición de estado",
          error: error.message,
        });
      }
    };

    return {
      obtenerEstadosEnvio,
      inicializarEstadosEnvio,
      crearEstadoEnvio,
      obtenerEstadoEnvioPorId,
      actualizarEstadoEnvio,
      eliminarEstadoEnvio,
      obtenerPedidosPorEstado,
      verificarTransicionEstado,
    };
  }

  // Crea el controlador
  const controlador = createEstadoEnvioController({ EstadoEnvio, Pedido });

  /**
   * @route GET /api/estados-envio
   * @desc Obtener todos los estados de envío
   * @access Public
   */
  router.get("/", controlador.obtenerEstadosEnvio);

  /**
   * @route POST /api/estados-envio/inicializar
   * @desc Inicializar estados de envío
   * @access Admin
   */
  router.post("/inicializar", controlador.inicializarEstadosEnvio);

  /**
   * @route GET /api/estados-envio/:id
   * @desc Obtener un estado de envío por ID
   * @access Public
   */
  router.get("/:id", controlador.obtenerEstadoEnvioPorId);

  /**
   * @route GET /api/estados-envio/:id/pedidos
   * @desc Obtener pedidos por estado
   * @access Public
   */
  router.get("/:id/pedidos", controlador.obtenerPedidosPorEstado);

  /**
   * @route POST /api/estados-envio/verificar-transicion
   * @desc Verificar si una transición de estado es válida
   * @access Public
   */
  router.post("/verificar-transicion", controlador.verificarTransicionEstado);

  /**
   * @route POST /api/estados-envio
   * @desc Crear un nuevo estado de envío
   * @access Private
   */
  router.post(
    "/",
    [
      check("estado", "El código de estado es obligatorio").not().isEmpty(),
      check("descripcion", "La descripción es obligatoria").not().isEmpty(),
      validateResult,
    ],
    controlador.crearEstadoEnvio,
  );

  /**
   * @route PUT /api/estados-envio/:id
   * @desc Actualizar un estado de envío
   * @access Private
   */
  router.put(
    "/:id",
    [
      check("estado", "El código de estado es obligatorio").not().isEmpty(),
      check("descripcion", "La descripción es obligatoria").not().isEmpty(),
      validateResult,
    ],
    controlador.actualizarEstadoEnvio,
  );

  /**
   * @route DELETE /api/estados-envio/:id
   * @desc Eliminar un estado de envío
   * @access Private
   */
  router.delete("/:id", controlador.eliminarEstadoEnvio);

  return router;
};

export default estadoEnvioRoutes;
