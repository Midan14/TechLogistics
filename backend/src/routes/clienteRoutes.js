// src/routes/clienteRoutes.js

import express from "express";
import { validateRequest } from "../middleware/requestValidator.js";
import { clienteSchema } from "../validators/clienteValidator.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import { cache } from "../middleware/cacheMiddleware.js";
import { createRateLimit } from "../middleware/rateLimitMiddleware.js";

export default function (Cliente) {
  const router = express.Router();

  // Crear instancia de rate limit para este router
  const routeRateLimit = createRateLimit({
    windowMs: 60000, // 1 minuto
    max: 10, // máximo 10 peticiones por minuto
  });

  // Rutas GET
  router.get("/", authenticate, cache(300), async (req, res) => {
    try {
      const clientes = await Cliente.findAll();
      res.json(clientes);
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error al obtener clientes",
        error: error.message,
      });
    }
  });

  router.get("/:id", authenticate, async (req, res) => {
    try {
      const cliente = await Cliente.findByPk(req.params.id);
      if (!cliente) {
        return res.status(404).json({
          status: "error",
          message: "Cliente no encontrado",
        });
      }
      res.json(cliente);
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Error al obtener cliente",
        error: error.message,
      });
    }
  });

  // Rutas POST
  router.post(
    "/",
    authenticate,
    authorize(["admin"]),
    validateRequest(clienteSchema),
    routeRateLimit,
    async (req, res) => {
      try {
        const cliente = await Cliente.create(req.body);
        res.status(201).json(cliente);
      } catch (error) {
        res.status(400).json({
          status: "error",
          message: "Error al crear cliente",
          error: error.message,
        });
      }
    },
  );

  // Rutas PUT
  router.put(
    "/:id",
    authenticate,
    authorize(["admin"]),
    validateRequest(clienteSchema),
    async (req, res) => {
      try {
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) {
          return res.status(404).json({
            status: "error",
            message: "Cliente no encontrado",
          });
        }
        await cliente.update(req.body);
        res.json(cliente);
      } catch (error) {
        res.status(400).json({
          status: "error",
          message: "Error al actualizar cliente",
          error: error.message,
        });
      }
    },
  );

  // Rutas DELETE
  router.delete(
    "/:id",
    authenticate,
    authorize(["admin"]),
    async (req, res) => {
      try {
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) {
          return res.status(404).json({
            status: "error",
            message: "Cliente no encontrado",
          });
        }
        await cliente.destroy();
        res.json({
          status: "success",
          message: "Cliente eliminado correctamente",
        });
      } catch (error) {
        res.status(500).json({
          status: "error",
          message: "Error al eliminar cliente",
          error: error.message,
        });
      }
    },
  );

  return router;
}
