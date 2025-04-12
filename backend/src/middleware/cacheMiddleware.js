// src/middleware/cacheMiddleware.js

import NodeCache from "node-cache";
import { logInfo, logError } from "../config/logger.js";

/**
 * Configuración de la caché
 * @type {NodeCache}
 */
const apiCache = new NodeCache({
  stdTTL: process.env.CACHE_TTL || 300, // 5 minutos por defecto
  checkperiod: process.env.CACHE_CHECK_PERIOD || 60, // Verificar cada 60 segundos
  errorOnMissing: false,
  useClones: false,
});

/**
 * Middleware para aplicar caché a respuestas de la API
 * @param {number} duration - Duración de la caché en segundos
 * @param {Object} options - Opciones adicionales de caché
 * @returns {Function} Middleware function
 */
export const cache = (duration = 300, options = {}) => {
  return (req, res, next) => {
    try {
      // Configuración de opciones
      const config = {
        ignoreAuthUsers: true, // Ignorar usuarios autenticados
        ignoreQueryParams: false, // Considerar query params en la clave
        adminBypass: true, // Permitir bypass para rutas admin
        ...options,
      };

      // Verificar si debemos ignorar la caché
      if (
        req.method !== "GET" || // Solo cachear GETs
        (config.ignoreAuthUsers && req.user) || // Ignorar usuarios autenticados si está configurado
        (config.adminBypass && req.path.includes("/admin")) // Bypass para rutas admin
      ) {
        return next();
      }

      // Crear clave única para esta petición
      const baseKey = config.ignoreQueryParams ? req.path : req.originalUrl;
      const key = `cache_${req.method}_${baseKey}`;

      // Intentar obtener respuesta cacheada
      const cachedResponse = apiCache.get(key);

      if (cachedResponse) {
        logInfo("Cache hit", { key, path: req.path });
        return res.json(cachedResponse);
      }

      // Si no hay caché, interceptar res.json
      const originalJson = res.json;
      res.json = function (body) {
        try {
          // Solo cachear respuestas exitosas
          if (res.statusCode < 400) {
            apiCache.set(key, body, duration);
            logInfo("Cache set", {
              key,
              path: req.path,
              duration,
              size: JSON.stringify(body).length,
            });
          }

          // Restaurar y llamar al método original
          res.json = originalJson;
          return res.json(body);
        } catch (error) {
          logError("Error al guardar en caché", { error, key, path: req.path });
          // Si hay error al cachear, simplemente devolver la respuesta
          res.json = originalJson;
          return res.json(body);
        }
      };

      next();
    } catch (error) {
      logError("Error en middleware de caché", error);
      next();
    }
  };
};

/**
 * Invalida la caché para una ruta específica
 * @param {string} route - Ruta a invalidar
 * @param {string} method - Método HTTP (default: GET)
 */
export const invalidateCache = (route, method = "GET") => {
  try {
    const key = `cache_${method}_${route}`;
    const deleted = apiCache.del(key);

    if (deleted) {
      logInfo("Cache invalidated", { key, route });
    }

    return deleted;
  } catch (error) {
    logError("Error al invalidar caché", { error, route });
    return false;
  }
};

/**
 * Invalida todo el caché
 */
export const clearCache = () => {
  try {
    const keys = apiCache.keys();
    apiCache.flushAll();
    logInfo("Cache cleared", { keysCleared: keys.length });
    return true;
  } catch (error) {
    logError("Error al limpiar caché", error);
    return false;
  }
};

/**
 * Obtiene estadísticas de la caché
 * @returns {Object} Estadísticas de la caché
 */
export const getCacheStats = () => {
  return {
    keys: apiCache.keys().length,
    hits: apiCache.getStats().hits,
    misses: apiCache.getStats().misses,
    size: apiCache.stats.size,
    lastCleaned: apiCache.stats.lastCleaned,
  };
};

export default {
  cache,
  invalidateCache,
  clearCache,
  getCacheStats,
};
