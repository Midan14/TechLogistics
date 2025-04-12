// backend/src/config/envVars.js

// Configuración de variables de entorno por categorías
export const envVars = {
  // Variables de Base de Datos
  database: {
    required: ["DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST", "DB_PORT"],
    optional: [
      "DB_POOL_MAX",
      "DB_POOL_MIN",
      "DB_POOL_ACQUIRE",
      "DB_POOL_IDLE",
      "DB_CONNECT_TIMEOUT",
      "DB_TIMEZONE",
      "DB_SSL",
    ],
  },

  // Variables de Servidor
  server: {
    required: ["PORT", "NODE_ENV"],
    optional: ["HOST", "API_PREFIX"],
  },

  // Variables de Seguridad
  security: {
    required: ["JWT_SECRET", "JWT_EXPIRES_IN"],
    optional: ["CORS_ORIGIN", "RATE_LIMIT_WINDOW", "RATE_LIMIT_MAX"],
  },

  // Variables de Logging
  logging: {
    required: ["LOG_LEVEL"],
    optional: ["LOG_FILE_PATH"],
  },
};

// Función para validar variables de entorno
export const validateEnvVars = () => {
  const missingVars = [];
  const warnings = [];

  // Función auxiliar para verificar variables
  const checkVars = (vars, category, isRequired = true) => {
    vars.forEach((varName) => {
      if (process.env[varName] === undefined) {
        if (isRequired) {
          missingVars.push(`${varName} (${category})`);
        } else {
          warnings.push(`${varName} (${category})`);
        }
      }
    });
  };

  // Verificar todas las categorías
  Object.entries(envVars).forEach(([category, { required, optional }]) => {
    checkVars(required, category, true);
    checkVars(optional, category, false);
  });

  // Manejar errores y advertencias
  if (missingVars.length > 0) {
    throw new Error(
      `Variables de entorno requeridas no definidas: ${missingVars.join(", ")}`,
    );
  }

  if (warnings.length > 0) {
    console.warn(
      "⚠️ Variables de entorno opcionales no definidas:",
      warnings.join(", "),
    );
  }
};

// Función para obtener valores con tipos correctos
export const getEnvVar = (name, defaultValue = undefined, type = "string") => {
  const value = process.env[name] || defaultValue;

  if (value === undefined) {
    return undefined;
  }

  switch (type) {
    case "number":
      return Number(value);
    case "boolean":
      return value === "true" || value === "1";
    case "json":
      try {
        return JSON.parse(value);
      } catch {
        throw new Error(`Invalid JSON in environment variable ${name}`);
      }
    case "array":
      return value.split(",").map((item) => item.trim());
    default:
      return value;
  }
};

// Configuración por defecto
export const defaultConfig = {
  server: {
    port: getEnvVar("PORT", 3000, "number"),
    host: getEnvVar("HOST", "localhost"),
    apiPrefix: getEnvVar("API_PREFIX", "/api"),
    nodeEnv: getEnvVar("NODE_ENV", "development"),
  },
  database: {
    poolMax: getEnvVar("DB_POOL_MAX", 10, "number"),
    poolMin: getEnvVar("DB_POOL_MIN", 0, "number"),
    poolAcquire: getEnvVar("DB_POOL_ACQUIRE", 30000, "number"),
    poolIdle: getEnvVar("DB_POOL_IDLE", 10000, "number"),
    timezone: getEnvVar("DB_TIMEZONE", "+00:00"),
  },
  security: {
    jwtExpiresIn: getEnvVar("JWT_EXPIRES_IN", "1d"),
    corsOrigin: getEnvVar("CORS_ORIGIN", "*"),
    rateLimitWindow: getEnvVar("RATE_LIMIT_WINDOW", 15 * 60 * 1000, "number"),
    rateLimitMax: getEnvVar("RATE_LIMIT_MAX", 100, "number"),
  },
  logging: {
    level: getEnvVar("LOG_LEVEL", "info"),
    filePath: getEnvVar("LOG_FILE_PATH", "logs/app.log"),
  },
};

// Exportar lista simple de variables requeridas para compatibilidad con código existente
export const requiredEnvVars = Object.values(envVars).reduce(
  (acc, { required }) => [...acc, ...required],
  [],
);
