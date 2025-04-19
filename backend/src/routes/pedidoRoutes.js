// src/routes/pedidoRoutes.js

import express from "express";
import { validateRequest } from "../middleware/requestValidator.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { createRateLimit } from "../middleware/rateLimitMiddleware.js";

export default function ({
  Pedido,
  Cliente,
  Producto,
  Transportista,
  Ruta,
  EstadoEnvio,
}) {
  const router = express.Router();

  // Crear instancia de rate limit
  const routeRateLimit = createRateLimit({
    windowMs: 60000,
    max: 10,
  });

  // GET /pedidos
  router.get("/", authenticate, async (req, res) => {
    try {
      const pedidos = await Pedido.findAll({
        include: [
          { model: Cliente, as: "cliente" },
          { model: Producto, as: "producto" },
          { model: Transportista, as: "transportista" },
          { model: Ruta, as: "ruta" },
          { model: EstadoEnvio, as: "estadoEnvio" },
        ],
      });
      res.json(pedidos);
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error al obtener pedidos",
        error: error.message,
      });
    }
  });

  // GET /pedidos/:id
  router.get("/:id", authenticate, async (req, res) => {
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

      res.json(pedido);
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error al obtener pedido",
        error: error.message,
      });
    }
  });

  // POST /pedidos
  router.post(
    "/",
    authenticate,
    authorize(["admin", "vendedor"]),
    validateRequest({
      id_cliente: { type: "number", required: true },
      id_producto: { type: "number", required: true },
      cantidad: { type: "number", required: true, min: 1 },
      id_transportista: { type: "number", required: true },
      id_ruta: { type: "number", required: true },
    }),
    routeRateLimit,
    async (req, res) => {
      try {
        const pedido = await Pedido.create({
          ...req.body,
          id_estado: 1, // Estado inicial: PENDIENTE
          fecha_pedido: new Date(),
        });

        const pedidoCompleto = await Pedido.findByPk(pedido.id_pedido, {
          include: [
            { model: Cliente, as: "cliente" },
            { model: Producto, as: "producto" },
            { model: Transportista, as: "transportista" },
            { model: Ruta, as: "ruta" },
            { model: EstadoEnvio, as: "estadoEnvio" },
          ],
        });

        res.status(201).json(pedidoCompleto);
      } catch (error) {
        res.status(400).json({
          status: "error",
          message: "Error al crear pedido",
          error: error.message,
        });
      }
    },
  );

  // PUT /pedidos/:id
  router.put(
    "/:id",
    authenticate,
    authorize(["admin", "vendedor"]),
    validateRequest({
      cantidad: { type: "number", min: 1 },
      id_estado: { type: "number" },
    }),
    async (req, res) => {
      try {
        const pedido = await Pedido.findByPk(req.params.id);

        if (!pedido) {
          return res.status(404).json({
            status: "error",
            message: "Pedido no encontrado",
          });
        }

        await pedido.update(req.body);

        const pedidoActualizado = await Pedido.findByPk(pedido.id_pedido, {
          include: [
            { model: Cliente, as: "cliente" },
            { model: Producto, as: "producto" },
            { model: Transportista, as: "transportista" },
            { model: Ruta, as: "ruta" },
            { model: EstadoEnvio, as: "estadoEnvio" },
          ],
        });

        res.json(pedidoActualizado);
      } catch (error) {
        res.status(400).json({
          status: "error",
          message: "Error al actualizar pedido",
          error: error.message,
        });
      }
    },
  );

  // DELETE /pedidos/:id
  router.delete(
    "/:id",
    authenticate,
    authorize(["admin"]),
    async (req, res) => {
      try {
        const pedido = await Pedido.findByPk(req.params.id);

        if (!pedido) {
          return res.status(404).json({
            status: "error",
            message: "Pedido no encontrado",
          });
        }

        await pedido.destroy();

        res.json({
          status: "success",
          message: "Pedido eliminado correctamente",
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          message: "Error al eliminar pedido",
          error: error.message,
        });
      }
    },
  );

  return router;
}
