const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Crear app
const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Datos en memoria
let pedidos = [];
let pedidoIdCounter = 1;

// Datos de ejemplo para las relaciones
const clientes = [
  { idCliente: 1, nombre: 'Julian Garrido' },
  { idCliente: 2, nombre: 'Ana López' }
];

const productos = [
  { idProducto: 1, nombre: 'ProductoX' },
  { idProducto: 2, nombre: 'ProductoY' }
];

const transportistas = [
  { idTransportista: 1, nombre: 'Transportista1' },
  { idTransportista: 2, nombre: 'Transportista2' }
];

const rutas = [
  { idRuta: 1, origen: 'Madrid', destino: 'Barcelona' },
  { idRuta: 2, origen: 'Valencia', destino: 'Sevilla' }
];

const estadosEnvio = [
  { idEstadoEnvio: 1, estado: 'Pendiente' },
  { idEstadoEnvio: 2, estado: 'En Proceso' },
  { idEstadoEnvio: 3, estado: 'En Camino' },
  { idEstadoEnvio: 4, estado: 'Entregado' },
  { idEstadoEnvio: 5, estado: 'Cancelado' }
];

// Ruta base para probar
app.get('/', (req, res) => {
  res.status(200).json({ mensaje: 'API de TechLogistics (SIMULADA) funcionando correctamente' });
});

// Obtener todos los pedidos
app.get('/pedidos', (req, res) => {
  console.log('GET /pedidos - Enviando lista de pedidos:', pedidos.length);
  
  // Enriquecer los pedidos con los nombres y detalles
  const pedidosEnriquecidos = pedidos.map(pedido => {
    const cliente = clientes.find(c => c.idCliente === pedido.idCliente);
    const producto = productos.find(p => p.idProducto === pedido.idProducto);
    const transportista = transportistas.find(t => t.idTransportista === pedido.idTransportista);
    const ruta = rutas.find(r => r.idRuta === pedido.idRuta);
    const estadoEnvio = estadosEnvio.find(e => e.idEstadoEnvio === pedido.idEstadoEnvio);
    
    return {
      ...pedido,
      clienteNombre: cliente?.nombre || 'Desconocido',
      productoNombre: producto?.nombre || 'Desconocido',
      transportistaNombre: transportista?.nombre || 'Desconocido',
      rutaOrigen: ruta?.origen || 'Desconocido',
      rutaDestino: ruta?.destino || 'Desconocido',
      estadoEnvioEstado: estadoEnvio?.estado || 'Desconocido'
    };
  });
  
  res.json(pedidosEnriquecidos);
});

// Obtener un pedido por ID
app.get('/pedidos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const pedido = pedidos.find(p => p.idPedido === id);
  
  if (!pedido) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }
  
  // Enriquecer el pedido con los nombres y detalles
  const cliente = clientes.find(c => c.idCliente === pedido.idCliente);
  const producto = productos.find(p => p.idProducto === pedido.idProducto);
  const transportista = transportistas.find(t => t.idTransportista === pedido.idTransportista);
  const ruta = rutas.find(r => r.idRuta === pedido.idRuta);
  const estadoEnvio = estadosEnvio.find(e => e.idEstadoEnvio === pedido.idEstadoEnvio);
  
  const pedidoEnriquecido = {
    ...pedido,
    clienteNombre: cliente?.nombre || 'Desconocido',
    productoNombre: producto?.nombre || 'Desconocido',
    transportistaNombre: transportista?.nombre || 'Desconocido',
    rutaOrigen: ruta?.origen || 'Desconocido',
    rutaDestino: ruta?.destino || 'Desconocido',
    estadoEnvioEstado: estadoEnvio?.estado || 'Desconocido'
  };
  
  res.json(pedidoEnriquecido);
});

// Crear nuevo pedido
app.post('/pedidos', (req, res) => {
  console.log('POST /pedidos - Datos recibidos:', req.body);
  
  try {
    const { idCliente, idProducto, idTransportista, idRuta, cantidad, fechaPedido, idEstadoEnvio } = req.body;
    
    // Crear un nuevo pedido con un ID único
    const nuevoPedido = {
      idPedido: pedidoIdCounter++,
      idCliente: parseInt(idCliente, 10) || 1,
      idProducto: parseInt(idProducto, 10) || 1,
      idTransportista: parseInt(idTransportista, 10) || 1,
      idRuta: parseInt(idRuta, 10) || 1,
      cantidad: parseInt(cantidad, 10) || 1,
      fechaPedido: fechaPedido || new Date().toISOString().split('T')[0],
      idEstadoEnvio: parseInt(idEstadoEnvio, 10) || 1
    };
    
    // Añadir al array de pedidos
    pedidos.push(nuevoPedido);
    
    console.log('Pedido creado correctamente, ID:', nuevoPedido.idPedido);
    res.status(201).json({ message: 'Pedido creado correctamente', id: nuevoPedido.idPedido });
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    res.status(500).json({ error: `Error al crear el pedido: ${error.message}` });
  }
});

// Actualizar pedido
app.put('/pedidos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = pedidos.findIndex(p => p.idPedido === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }
  
  try {
    const { idCliente, idProducto, idTransportista, idRuta, cantidad, fechaPedido, idEstadoEnvio } = req.body;
    
    // Actualizar el pedido
    pedidos[index] = {
      ...pedidos[index],
      idCliente: parseInt(idCliente, 10) || pedidos[index].idCliente,
      idProducto: parseInt(idProducto, 10) || pedidos[index].idProducto,
      idTransportista: parseInt(idTransportista, 10) || pedidos[index].idTransportista,
      idRuta: parseInt(idRuta, 10) || pedidos[index].idRuta,
      cantidad: parseInt(cantidad, 10) || pedidos[index].cantidad,
      fechaPedido: fechaPedido || pedidos[index].fechaPedido,
      idEstadoEnvio: parseInt(idEstadoEnvio, 10) || pedidos[index].idEstadoEnvio
    };
    
    res.json({ message: 'Pedido actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el pedido:', error);
    res.status(500).json({ error: `Error al actualizar el pedido: ${error.message}` });
  }
});

// Eliminar pedido
app.delete('/pedidos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = pedidos.findIndex(p => p.idPedido === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Pedido no encontrado' });
  }
  
  pedidos.splice(index, 1);
  res.json({ message: 'Pedido eliminado correctamente' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor SIMULADO corriendo en el puerto ${PORT}`);
});

module.exports = app; 