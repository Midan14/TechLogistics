// Cargar variables de entorno
require('dotenv').config();

// Importaciones
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./src/config/database');

// Crear app
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Ruta base para probar
app.get('/', (req, res) => {
  res.status(200).json({ mensaje: 'API de TechLogistics funcionando correctamente' });
});

// Función para cargar las rutas
const loadRoutes = () => {
  const clienteRoutes = require('./src/routes/clienteRoutes');
  const pedidoRoutes = require('./src/routes/pedidoRoutes');
  const productoRoutes = require('./src/routes/productoRoutes');
  const transportistaRoutes = require('./src/routes/transportistaRoutes');
  const rutaRoutes = require('./src/routes/rutaRoutes');
  const estadoEnvioRoutes = require('./src/routes/estadoEnvioRoutes');

  app.use('/clientes', clienteRoutes);
  app.use('/pedidos', pedidoRoutes);
  app.use('/productos', productoRoutes);
  app.use('/transportistas', transportistaRoutes);
  app.use('/rutas', rutaRoutes);
  app.use('/estados-envio', estadoEnvioRoutes);
};

// Middleware de manejo de errores de base de datos
app.use((err, req, res, next) => {
  if (err.name === 'SequelizeConnectionError' || err.name === 'SequelizeConnectionRefusedError') {
    console.error('Error de conexión a la base de datos:', err);
    return res.status(503).json({ mensaje: 'Error de conexión a la base de datos' });
  }
  next(err);
});

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
});

// Función para iniciar el servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');

    // Cargar rutas
    loadRoutes();

    // Iniciar servidor HTTP
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });

    // Manejar errores del servidor
    server.on('error', (error) => {
      console.error('Error en el servidor:', error);
      process.exit(1);
    });

    // Manejar señales de terminación
    process.on('SIGTERM', () => {
      console.log('Recibida señal SIGTERM. Cerrando servidor...');
      server.close(() => {
        console.log('Servidor cerrado.');
        sequelize.close().then(() => {
          console.log('Conexión a la base de datos cerrada.');
          process.exit(0);
        });
      });
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();

module.exports = app;
