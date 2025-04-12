// src/controllers/pedidoController.js

import { Op } from "sequelize";
import { logError, logInfo } from "../config/logger.js";

/**
 * Crea un controlador para gestionar pedidos
 * @param {Object} models - Modelos Sequelize requeridos
 * @returns {Object} Objeto con métodos del controlador
 */
const createPedidoController = ({
  Pedido,
  Cliente,
  Producto,
  Transportista,
  Ruta,
  EstadoEnvio,
}) => {
  /**
   * Obtiene todos los pedidos con paginación y filtros
   * @route GET /api/pedidos
   */
  const obtenerPedidos = async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "fechaPedido",
        order = "DESC",
        fechaInicio,
        fechaFin,
        estado,
        clienteId,
        transportistaId,
      } = req.query;

      // Construir filtros
      const where = {};

      if (fechaInicio && fechaFin) {
        where.fechaPedido = {
          [Op.between]: [new Date(fechaInicio), new Date(fechaFin)],
        };
      } else if (fechaInicio) {
        where.fechaPedido = { [Op.gte]: new Date(fechaInicio) };
      } else if (fechaFin) {
        where.fechaPedido = { [Op.lte]: new Date(fechaFin) };
      }

      if (estado) {
        where.estado = estado;
      }

      if (clienteId) {
        where.clienteId = clienteId;
      }

      if (transportistaId) {
        where.transportistaId = transportistaId;
      }

      // Configurar opciones de paginación y ordenamiento
      const options = {
        include: [
          {
            model: Cliente,
            as: "cliente",
            attributes: ["id", "nombre", "email"],
          },
          {
            model: Producto,
            as: "producto",
            attributes: ["id", "nombre", "precio"],
          },
          {
            model: Transportista,
            as: "transportista",
            attributes: ["id", "nombre", "vehiculo"],
          },
          { model: Ruta, as: "ruta", attributes: ["id", "origen", "destino"] },
          {
            model: EstadoEnvio,
            as: "estadoEnvio",
            attributes: ["id", "estado", "color"],
          },
        ],
        where,
        order: [[sortBy, order]],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
      };

      // Ejecutar consulta con conteo total
      const { count, rows: pedidos } = await Pedido.findAndCountAll(options);

      // Calcular metadatos de paginación
      const totalPages = Math.ceil(count / parseInt(limit));
      const nextPage = page < totalPages ? parseInt(page) + 1 : null;
      const prevPage = page > 1 ? parseInt(page) - 1 : null;

      res.json({
        status: "success",
        data: pedidos,
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
      logError("Error al obtener pedidos", error);
      res.status(500).json({
        status: "error",
        message: "Error al obtener pedidos",
        error: error.message,
      });
    }
  };

  /**
   * Buscar pedidos por diferentes criterios
   * @route GET /api/pedidos/buscar
   */
  const buscarPedidos = async (req, res) => {
    try {
      const {
        q,
        fechaInicio,
        fechaFin,
        estado,
        page = 1,
        limit = 10,
      } = req.query;

      // Construir condiciones de búsqueda
      const where = {};

      // Filtro por fechas
      if (fechaInicio && fechaFin) {
        where.fechaPedido = {
          [Op.between]: [new Date(fechaInicio), new Date(fechaFin)],
        };
      }

      // Filtro por estado
      if (estado) {
        where.estado = estado;
      }

      // Opciones de consulta
      const options = {
        include: [
          {
            model: Cliente,
            as: "cliente",
            where: q
              ? {
                  [Op.or]: [
                    { nombre: { [Op.like]: `%${q}%` } },
                    { email: { [Op.like]: `%${q}%` } },
                  ],
                }
              : undefined,
          },
          { model: Producto, as: "producto" },
          { model: EstadoEnvio, as: "estadoEnvio" },
        ],
        where,
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [["fechaPedido", "DESC"]],
      };

      // Ejecutar consulta
      const { count, rows: pedidos } = await Pedido.findAndCountAll(options);

      // Calcular metadatos de paginación
      const totalPages = Math.ceil(count / parseInt(limit));

      res.json({
        status: "success",
        data: pedidos,
        meta: {
          totalItems: count,
          totalPages,
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      logError("Error al buscar pedidos", error);
      res.status(500).json({
        status: "error",
        message: "Error al buscar pedidos",
        error: error.message,
      });
    }
  };

  /**
   * Obtiene pedidos por estado
   * @route GET /api/pedidos/estado/:estado
   */
  const obtenerPedidosPorEstado = async (req, res) => {
    try {
      const { estado } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // Buscar el ID del estado
      const estadoEnvio = await EstadoEnvio.findOne({
        where: { estado: estado.toUpperCase() },
      });

      if (!estadoEnvio) {
        return res.status(404).json({
          status: "error",
          message: "Estado de envío no encontrado",
        });
      }

      // Buscar pedidos con ese estado
      const { count, rows: pedidos } = await Pedido.findAndCountAll({
        where: { estadoEnvioId: estadoEnvio.id },
        include: [
          { model: Cliente, as: "cliente" },
          { model: Producto, as: "producto" },
          { model: Transportista, as: "transportista" },
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [["fechaPedido", "DESC"]],
      });

      // Calcular metadatos de paginación
      const totalPages = Math.ceil(count / parseInt(limit));

      res.json({
        status: "success",
        data: pedidos,
        meta: {
          estado: estadoEnvio.estado,
          totalItems: count,
          totalPages,
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit),
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
   * Obtiene pedidos de un transportista
   * @route GET /api/pedidos/transportista/:id
   */
  const obtenerPedidosPorTransportista = async (req, res) => {
    try {
      const { id } = req.params;
      const { estado, page = 1, limit = 10 } = req.query;

      // Verificar que exista el transportista
      const transportista = await Transportista.findByPk(id);
      if (!transportista) {
        return res.status(404).json({
          status: "error",
          message: "Transportista no encontrado",
        });
      }

      // Construir condiciones
      const where = { transportistaId: id };
      if (estado) {
        where.estado = estado;
      }

      // Buscar pedidos
      const { count, rows: pedidos } = await Pedido.findAndCountAll({
        where,
        include: [
          { model: Cliente, as: "cliente" },
          { model: Producto, as: "producto" },
          { model: Ruta, as: "ruta" },
          { model: EstadoEnvio, as: "estadoEnvio" },
        ],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit),
        order: [["fechaPedido", "DESC"]],
      });

      // Calcular metadatos de paginación
      const totalPages = Math.ceil(count / parseInt(limit));

      res.json({
        status: "success",
        data: pedidos,
        meta: {
          transportistaId: parseInt(id),
          transportista: transportista.nombre,
          totalItems: count,
          totalPages,
          currentPage: parseInt(page),
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (error) {
      logError("Error al obtener pedidos por transportista", error);
      res.status(500).json({
        status: "error",
        message: "Error al obtener pedidos por transportista",
        error: error.message,
      });
    }
  };

  /**
   * Crea un nuevo pedido
   * @route POST /api/pedidos
   */
  const crearPedido = async (req, res) => {
    const transaction = await Pedido.sequelize.transaction();

    try {
      const {
        clienteId,
        productoId,
        transportistaId,
        rutaId,
        cantidad,
        fechaPedido = new Date(),
        observaciones,
        estadoEnvioId,
      } = req.body;

      // Verificar entidades relacionadas
      const [cliente, producto, transportista, ruta, estadoEnvio] =
        await Promise.all([
          Cliente.findByPk(clienteId),
          Producto.findByPk(productoId),
          Transportista.findByPk(transportistaId),
          Ruta.findByPk(rutaId),
          EstadoEnvio.findByPk(estadoEnvioId),
        ]);

      // Validar existencia de entidades
      if (!cliente) {
        await transaction.rollback();
        return res.status(404).json({
          status: "error",
          message: "Cliente no encontrado",
        });
      }

      if (!producto) {
        await transaction.rollback();
        return res.status(404).json({
          status: "error",
          message: "Producto no encontrado",
        });
      }

      if (!transportista) {
        await transaction.rollback();
        return res.status(404).json({
          status: "error",
          message: "Transportista no encontrado",
        });
      }

      if (!ruta) {
        await transaction.rollback();
        return res.status(404).json({
          status: "error",
          message: "Ruta no encontrada",
        });
      }

      if (!estadoEnvio) {
        await transaction.rollback();
        return res.status(404).json({
          status: "error",
          message: "Estado de envío no encontrado",
        });
      }

      // Verificar stock (si el modelo Producto tiene campo stock)
      if (producto.stock !== undefined && producto.stock < cantidad) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: "Stock insuficiente",
          data: {
            stockDisponible: producto.stock,
            cantidadSolicitada: cantidad,
          },
        });
      }

      // Verificar disponibilidad del transportista
      const pedidosActivos = await Pedido.count({
        where: {
          transportistaId,
          estado: {
            [Op.in]: ["PENDIENTE", "EN_PREPARACION", "EN_RUTA"],
          },
        },
        transaction,
      });

      const capacidadMaxima = transportista.capacidad_maxima_pedidos || 10;
      if (pedidosActivos >= capacidadMaxima) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message:
            "Transportista no disponible, ha alcanzado su capacidad máxima",
          data: {
            transportista: transportista.nombre,
            pedidosActivos,
            capacidadMaxima,
          },
        });
      }

      // Calcular total del pedido
      const totalPedido = cantidad * producto.precio;

      // Crear el pedido
      const nuevoPedido = await Pedido.create(
        {
          clienteId,
          productoId,
          transportistaId,
          rutaId,
          cantidad,
          fechaPedido,
          estado: "PENDIENTE",
          estadoEnvioId,
          observaciones,
          totalPedido,
        },
        { transaction },
      );

      // Actualizar stock si está disponible esa funcionalidad
      if (producto.stock !== undefined) {
        await producto.update(
          {
            stock: producto.stock - cantidad,
          },
          { transaction },
        );
      }

      // Confirmar transacción
      await transaction.commit();

      logInfo("Pedido creado exitosamente", {
        pedidoId: nuevoPedido.id,
        cliente: cliente.nombre,
        producto: producto.nombre,
        cantidad,
        total: totalPedido,
      });

      res.status(201).json({
        status: "success",
        message: "Pedido creado exitosamente",
        data: nuevoPedido,
      });
    } catch (error) {
      await transaction.rollback();
      logError("Error al crear pedido", error);

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
        message: "Error al crear pedido",
        error: error.message,
      });
    }
  };

  /**
   * Obtiene un pedido por ID
   * @route GET /api/pedidos/:id
   */
  const obtenerPedidoPorId = async (req, res) => {
    try {
      const pedido = await Pedido.findByPk(req.params.id, {
        include: [
          { model: Cliente, as: "cliente" },
          { model: Producto, as: "producto" },
          { model: Transportista, as: "transportista" },
          { model: Ruta, as: "ruta" },
          { model: EstadoEnvio, as: "estadoEnvio" },
        ],
      });

      if (!pedido) {
        return res.status(404).json({
          status: "error",
          message: "Pedido no encontrado",
        });
      }

      res.json({
        status: "success",
        data: pedido,
      });
    } catch (error) {
      logError("Error al obtener pedido", error);
      res.status(500).json({
        status: "error",
        message: "Error al obtener pedido",
        error: error.message,
      });
    }
  };

  /**
   * Cambia el estado de un pedido
   * @route PATCH /api/pedidos/:id/estado
   */
  const cambiarEstadoPedido = async (req, res) => {
    const transaction = await Pedido.sequelize.transaction();

    try {
      const { id } = req.params;
      const { estado, observaciones } = req.body;

      // Obtener el pedido
      const pedido = await Pedido.findByPk(id, {
        include: [{ model: EstadoEnvio, as: "estadoEnvio" }],
        transaction,
      });

      if (!pedido) {
        await transaction.rollback();
        return res.status(404).json({
          status: "error",
          message: "Pedido no encontrado",
        });
      }

      // Buscar el estado en la tabla EstadoEnvio
      const nuevoEstado = await EstadoEnvio.findOne({
        where: { estado: estado.toUpperCase() },
        transaction,
      });

      if (!nuevoEstado) {
        await transaction.rollback();
        return res.status(404).json({
          status: "error",
          message: "Estado no válido",
        });
      }

      // Verificar si la transición de estado es válida
      const transicionesPermitidas = {
        PENDIENTE: ["PREPARACION", "CANCELADO"],
        PREPARACION: ["EN_RUTA", "CANCELADO"],
        EN_RUTA: ["ENTREGADO", "NO_ENTREGADO"],
        ENTREGADO: [],
        NO_ENTREGADO: ["EN_RUTA"],
        CANCELADO: [],
      };

      const estadoActual = pedido.estadoEnvio?.estado;
      if (
        estadoActual &&
        !transicionesPermitidas[estadoActual]?.includes(nuevoEstado.estado)
      ) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: `No se puede cambiar de estado ${estadoActual} a ${nuevoEstado.estado}`,
          data: {
            estadoActual,
            estadoSolicitado: nuevoEstado.estado,
            transicionesPermitidas: transicionesPermitidas[estadoActual] || [],
          },
        });
      }

      // Actualizar el pedido
      await pedido.update(
        {
          estado: nuevoEstado.estado,
          estadoEnvioId: nuevoEstado.id,
          observaciones: observaciones
            ? pedido.observaciones
              ? `${pedido.observaciones}\n${observaciones}`
              : observaciones
            : pedido.observaciones,
        },
        { transaction },
      );

      // Si se cancela, devolver stock
      if (nuevoEstado.estado === "CANCELADO" && pedido.productoId) {
        const producto = await Producto.findByPk(pedido.productoId, {
          transaction,
        });
        if (producto && producto.stock !== undefined) {
          await producto.update(
            {
              stock: producto.stock + pedido.cantidad,
            },
            { transaction },
          );
        }
      }

      // Si se entrega, registrar fecha de entrega
      if (nuevoEstado.estado === "ENTREGADO") {
        await pedido.update(
          {
            fechaEntregaReal: new Date(),
          },
          { transaction },
        );
      }

      // Confirmar transacción
      await transaction.commit();

      logInfo("Estado de pedido actualizado", {
        pedidoId: pedido.id,
        estadoAnterior: estadoActual,
        estadoNuevo: nuevoEstado.estado,
        usuario: req.user?.id || "sistema",
      });

      res.json({
        status: "success",
        message: "Estado de pedido actualizado correctamente",
        data: {
          id: pedido.id,
          estadoAnterior: estadoActual,
          estadoNuevo: nuevoEstado.estado,
        },
      });
    } catch (error) {
      await transaction.rollback();
      logError("Error al cambiar estado del pedido", error);
      res.status(500).json({
        status: "error",
        message: "Error al cambiar estado del pedido",
        error: error.message,
      });
    }
  };

  /**
   * Actualiza un pedido
   * @route PUT /api/pedidos/:id
   */
  const actualizarPedido = async (req, res) => {
    const transaction = await Pedido.sequelize.transaction();

    try {
      const {
        clienteId,
        productoId,
        transportistaId,
        rutaId,
        cantidad,
        observaciones,
        estadoEnvioId,
      } = req.body;

      // Obtener el pedido actual
      const pedido = await Pedido.findByPk(req.params.id, { transaction });

      if (!pedido) {
        await transaction.rollback();
        return res.status(404).json({
          status: "error",
          message: "Pedido no encontrado",
        });
      }

      // Verificar si se puede actualizar (solo en ciertos estados)
      const estadosActualizables = ["PENDIENTE", "PREPARACION"];
      if (!estadosActualizables.includes(pedido.estado)) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: `No se puede actualizar un pedido en estado ${pedido.estado}`,
          data: {
            estadoActual: pedido.estado,
            estadosActualizables,
          },
        });
      }

      // Si cambia la cantidad, verificar stock y ajustar
      if (cantidad && cantidad !== pedido.cantidad && productoId) {
        const productoId_final = productoId || pedido.productoId;
        const producto = await Producto.findByPk(productoId_final, {
          transaction,
        });

        if (producto && producto.stock !== undefined) {
          // Restaurar stock del pedido original
          const stockRestaurado = producto.stock + pedido.cantidad;

          // Verificar si hay suficiente stock para la nueva cantidad
          if (stockRestaurado < cantidad) {
            await transaction.rollback();
            return res.status(400).json({
              status: "error",
              message: "Stock insuficiente para la cantidad solicitada",
              data: {
                stockDisponible: stockRestaurado,
                cantidadSolicitada: cantidad,
              },
            });
          }

          // Actualizar stock
          await producto.update(
            {
              stock: stockRestaurado - cantidad,
            },
            { transaction },
          );
        }
      }

      // Actualizar el pedido
      await pedido.update(
        {
          clienteId: clienteId || pedido.clienteId,
          productoId: productoId || pedido.productoId,
          transportistaId: transportistaId || pedido.transportistaId,
          rutaId: rutaId || pedido.rutaId,
          cantidad: cantidad || pedido.cantidad,
          observaciones:
            observaciones !== undefined ? observaciones : pedido.observaciones,
          estadoEnvioId: estadoEnvioId || pedido.estadoEnvioId,
        },
        { transaction },
      );

      // Recalcular total si cambió cantidad o producto
      if (
        (cantidad && cantidad !== pedido.cantidad) ||
        (productoId && productoId !== pedido.productoId)
      ) {
        const producto = await Producto.findByPk(pedido.productoId, {
          transaction,
        });
        if (producto) {
          await pedido.update(
            {
              totalPedido: pedido.cantidad * producto.precio,
            },
            { transaction },
          );
        }
      }

      // Confirmar transacción
      await transaction.commit();

      logInfo("Pedido actualizado", {
        pedidoId: pedido.id,
        cambios: req.body,
      });

      res.json({
        status: "success",
        message: "Pedido actualizado correctamente",
        data: pedido,
      });
    } catch (error) {
      await transaction.rollback();
      logError("Error al actualizar pedido", error);

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
        message: "Error al actualizar pedido",
        error: error.message,
      });
    }
  };

  /**
   * Elimina un pedido
   * @route DELETE /api/pedidos/:id
   */
  const eliminarPedido = async (req, res) => {
    const transaction = await Pedido.sequelize.transaction();

    try {
      const pedido = await Pedido.findByPk(req.params.id, { transaction });

      if (!pedido) {
        await transaction.rollback();
        return res.status(404).json({
          status: "error",
          message: "Pedido no encontrado",
        });
      }

      // Verificar si se puede eliminar (solo en ciertos estados)
      const estadosEliminables = ["PENDIENTE", "CANCELADO"];
      if (!estadosEliminables.includes(pedido.estado)) {
        await transaction.rollback();
        return res.status(400).json({
          status: "error",
          message: `No se puede eliminar un pedido en estado ${pedido.estado}`,
          data: {
            estadoActual: pedido.estado,
            estadosEliminables,
          },
        });
      }

      // Restaurar stock si el pedido no está cancelado
      if (pedido.estado !== "CANCELADO" && pedido.productoId) {
        const producto = await Producto.findByPk(pedido.productoId, {
          transaction,
        });
        if (producto && producto.stock !== undefined) {
          await producto.update(
            {
              stock: producto.stock + pedido.cantidad,
            },
            { transaction },
          );
        }
      }

      // Eliminar el pedido
      await pedido.destroy({ transaction });

      // Confirmar transacción
      await transaction.commit();

      logInfo("Pedido eliminado", {
        pedidoId: req.params.id,
        usuario: req.user?.id || "sistema",
      });

      res.json({
        status: "success",
        message: "Pedido eliminado correctamente",
        data: { id: parseInt(req.params.id) },
      });
    } catch (error) {
      await transaction.rollback();
      logError("Error al eliminar pedido", error);
      res.status(500).json({
        status: "error",
        message: "Error al eliminar pedido",
        error: error.message,
      });
    }
  };

  return {
    obtenerPedidos,
    crearPedido,
    obtenerPedidoPorId,
    actualizarPedido,
    eliminarPedido,
    cambiarEstadoPedido,
    obtenerPedidosPorTransportista,
    obtenerPedidosPorEstado,
    buscarPedidos,
  };
};

export default createPedidoController;
