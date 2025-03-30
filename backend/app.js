const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const clienteRoutes = require('./src/routes/clienteRoutes'); // Importar las rutas de clientes
const pedidoRoutes = require('./src/routes/pedidoRoutes');    // Importar las rutas de pedidos
const productoRoutes = require('./src/routes/productoRoutes');  // Importar las rutas de productos
const transportistaRoutes = require('./src/routes/transportistaRoutes');  // Importar las rutas de transportistas
const rutaRoutes = require('./src/routes/rutaRoutes');  // Importar las rutas de rutas
const estadoEnvioRoutes = require('./src/routes/estadoEnvioRoutes');  // Importar las rutas de estados de envío

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Configuración de la base de datos para TechLogistics
const db = mysql.createConnection({
    host: 'localhost', // Cambia si tu base de datos está en otro servidor
    user: 'root',      // Cambia por tu usuario de MySQL
    password: '',  // Sin contraseña
    database: 'TechLogistics',  // Nombre de la base de datos
    port: 3308  // Puerto de MySQL (coincide con la configuración de database.js)
});

// Conectar a la base de datos de TechLogistics
db.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos TechLogistics:', err);
        return;
    }
    console.log('Conexión a la base de datos TechLogistics establecida');
});

// Usar las rutas de la API para TechLogistics
app.use('/clientes', clienteRoutes);     // Usar las rutas de clientes
app.use('/pedidos', pedidoRoutes);       // Usar las rutas de pedidos
app.use('/productos', productoRoutes);     // Usar las rutas de productos
app.use('/transportistas', transportistaRoutes);     // Usar las rutas de transportistas
app.use('/rutas', rutaRoutes);       // Usar las rutas de rutas
app.use('/estados-envio', estadoEnvioRoutes);       // Usar las rutas de estados de envío

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de TechLogistics funcionando correctamente');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;