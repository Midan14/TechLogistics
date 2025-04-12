// app.js

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

// Importaciones de config
import logger, { logError, logInfo, httpLogger } from "./src/config/logger.js";
import { testConnection } from "./src/config/database.js";
import { validateEnvVars } from "./src/config/envVars.js";

// Importaciones de middleware
import { requestValidator } from "./src/middleware/requestValidator.js";
import { errorHandler } from "./src/middleware/errorMiddleware.js";
import { createRateLimit } from "./src/middleware/rateLimitMiddleware.js";

// Importaciones de rutas
import clienteRoutes from "./src/routes/clienteRoutes.js";
import productoRoutes from "./src/routes/productoRoutes.js";
import pedidoRoutes from "./src/routes/pedidoRoutes.js";
import transportistaRoutes from "./src/routes/transportistaRoutes.js";
import rutaRoutes from "./src/routes/rutaRoutes.js";
import estadoEnvioRoutes from "./src/routes/estadoEnvioRoutes.js";

// Crear la aplicación Express
const app = express();

// Validar variables de entorno
try {
  validateEnvVars();
  logger.info("Variables de entorno validadas correctamente");
} catch (error) {
  logError("Error en la validación de variables de entorno", error);
  process.exit(1);
}

// Middleware básico
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging HTTP
app.use(httpLogger);

// Middleware de validación de requests
app.use(requestValidator);

// Rate limiting
app.use(createRateLimit());

// Rutas
const API_PREFIX = process.env.API_PREFIX || "/api";
app.use(`${API_PREFIX}/clientes`, clienteRoutes);
app.use(`${API_PREFIX}/productos`, productoRoutes);
app.use(`${API_PREFIX}/pedidos`, pedidoRoutes);
app.use(`${API_PREFIX}/transportistas`, transportistaRoutes);
app.use(`${API_PREFIX}/rutas`, rutaRoutes);
app.use(`${API_PREFIX}/estados-envio`, estadoEnvioRoutes);

// Manejo de errores global
app.use(errorHandler);

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await testConnection();
    logInfo("Conexión a la base de datos establecida");

    // Iniciar el servidor
    app.listen(PORT, () => {
      logInfo(`Servidor iniciado en puerto ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV,
        apiPrefix: API_PREFIX,
      });
    });
  } catch (error) {
    logError("Error al iniciar el servidor", error);
    process.exit(1);
  }
};

startServer();

// Manejo de señales de terminación
process.on("SIGTERM", () => {
  logger.info("Señal SIGTERM recibida. Cerrando servidor...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("Señal SIGINT recibida. Cerrando servidor...");
  process.exit(0);
});

export default app;
