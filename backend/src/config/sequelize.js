// backend/src/config/sequelize.js
import { Sequelize } from 'sequelize';
import path from 'path';
import dotenv from 'dotenv';
import { requiredEnvVars } from './envVars.js';

// Cargar variables de entorno desde la ubicación correcta
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Validar todas las variables de entorno requeridas
const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingVars.length > 0) {
    throw new Error(`Variables de entorno no definidas: ${missingVars.join(', ')}`);
}

// Inicializar Sequelize con configuración mejorada
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            connectTimeout: 20000,
            socketPath: undefined
        },
        timezone: '+00:00' // Usar UTC para consistencia
    }
);