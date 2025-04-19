// backend/app.js

import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";

// Importaciones de config
import logger, { logError, logInfo, httpLogger } from "./src/config/logger.js";
import {
  testConnection,
  syncDatabase,
  closeConnection,
} from "./src/config/database.js";
import { validateEnvVars } from "./src/config/envVars.js";

// Importaciones de middleware
import { requestValidator } from "./src/middleware/requestValidator.js";
import { errorHandler } from "./src/middleware/errorMiddleware.js";
import { createRateLimit } from "./src/middleware/rateLimitMiddleware.js";

// Importaciones de modelos y rutas
import db, { initModels } from "./src/models/index.js";
import clienteRoutes from "./src/routes/clienteRoutes.js";
import productoRoutes from "./src/routes/productoRoutes.js";
import pedidoRoutes from "./src/routes/pedidoRoutes.js";
import transportistaRoutes from "./src/routes/transportistaRoutes.js";
import rutaRoutes from "./src/routes/rutaRoutes.js";
import estadoEnvioRoutes from "./src/routes/estadoEnvioRoutes.js";

// Obtener el directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Crear la aplicación Express
const app = express();

// Validar variables de entorno

logger.info("✅ Variables de entorno validadas correctamente");

// Middleware de seguridad y optimización
app.use(
  helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production",
  }),
);
app.use(compression());

// Configuración de CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: process.env.CORS_METHODS?.split(",") || [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
    ],
    credentials: process.env.CORS_CREDENTIALS === "true",
    maxAge: 86400, // 24 horas
  }),
);

// Middleware de parseo
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware de logging
app.use(httpLogger);

// Middleware de validación de requests
app.use(requestValidator);

// Rate limiting
app.use(createRateLimit());

// Directorio público
app.use(express.static(path.join(__dirname, "public")));

// Iniciar el servidor

await initModels();

// Configurar rutas API
const API_PREFIX = process.env.API_PREFIX || "/api/v1";

// Ruta de estado de la API
app.get(`${API_PREFIX}/health`, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Ruta no encontrada",
  });
});

// Manejo de errores global
app.use(errorHandler);

// Probar conexión a la base de datos
await testConnection();

// Sincronizar modelos con la base de datos
await syncDatabase(false);

process.on("uncaughtException", (error) => {
  logger.error("❌ Uncaught Exception:", {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});
