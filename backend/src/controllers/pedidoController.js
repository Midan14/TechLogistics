const mysql = require('mysql2/promise');

// Conexión a la base de datos
let db = null;

// Función para conectar a la base de datos
const connectToDB = async () => {
  try {
    // Si ya existe una conexión, la devolvemos
    if (db) return db;

    // Creamos una nueva conexión
    db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'TechLogistics',
      port: process.env.DB_PORT || 3308,
      // Opciones para evitar problemas de autenticación
      authPlugins: {
        mysql_clear_password: () => () => Buffer.from(''),
      }
    });
    
    console.log('Conexión a MySQL establecida correctamente');
    return db;
  } catch (error) {
    console.error('Error al conectar a MySQL:', error);
    throw error;
  }
};

// Obtener todos los pedidos
const getAllPedidos = async (req, res) => {
  try {
    const connection = await connectToDB();
    const [rows] = await connection.query(`
      SELECT 
        p.*, 
        c.nombre AS clienteNombre, 
        pr.nombre AS productoNombre, 
        t.nombre AS transportistaNombre,
        r.origen AS rutaOrigen,
        r.destino AS rutaDestino,
        e.estado AS estadoEnvioEstado
      FROM Pedidos p
      LEFT JOIN Clientes c ON p.idCliente = c.idCliente
      LEFT JOIN Productos pr ON p.idProducto = pr.idProducto
      LEFT JOIN Transportistas t ON p.idTransportista = t.idTransportista
      LEFT JOIN Rutas r ON p.idRuta = r.idRuta
      LEFT JOIN EstadosEnvio e ON p.idEstadoEnvio = e.idEstadoEnvio
    `);
    
    console.log('Pedidos recuperados correctamente:', rows.length);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener los pedidos:', error);
    res.status(500).json({ error: 'Error al obtener los pedidos' });
  }
};

// Obtener un pedido por ID
const getPedidoById = async (req, res) => {
  const id = req.params.id;
  
  try {
    const connection = await connectToDB();
    const [rows] = await connection.query(`
      SELECT 
        p.*, 
        c.nombre AS clienteNombre, 
        pr.nombre AS productoNombre, 
        t.nombre AS transportistaNombre,
        r.origen AS rutaOrigen,
        r.destino AS rutaDestino,
        e.estado AS estadoEnvioEstado
      FROM Pedidos p
      LEFT JOIN Clientes c ON p.idCliente = c.idCliente
      LEFT JOIN Productos pr ON p.idProducto = pr.idProducto
      LEFT JOIN Transportistas t ON p.idTransportista = t.idTransportista
      LEFT JOIN Rutas r ON p.idRuta = r.idRuta
      LEFT JOIN EstadosEnvio e ON p.idEstadoEnvio = e.idEstadoEnvio
      WHERE p.idPedido = ?
    `, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener el pedido:', error);
    res.status(500).json({ error: 'Error al obtener el pedido' });
  }
};

// Crear nuevo pedido
const createPedido = async (req, res) => {
  // Registrar lo que recibimos para depuración
  console.log('Datos recibidos en createPedido:', JSON.stringify(req.body));
  
  try {
    // Establecer valores por defecto para los campos faltantes
    const idCliente = req.body.idCliente || 1;
    const idProducto = req.body.idProducto || 1;
    const idTransportista = req.body.idTransportista || 1;
    const idRuta = req.body.idRuta || 1;
    const cantidad = req.body.cantidad || 1;
    const fechaPedido = req.body.fechaPedido || new Date().toISOString().split('T')[0];
    const idEstadoEnvio = req.body.idEstadoEnvio || 1;

    // Insertamos el pedido con los valores que recibimos o los valores por defecto
    const connection = await connectToDB();
    const [result] = await connection.query(`
      INSERT INTO Pedidos 
      (idCliente, idProducto, idTransportista, idRuta, cantidad, fechaPedido, idEstadoEnvio) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [idCliente, idProducto, idTransportista, idRuta, cantidad, fechaPedido, idEstadoEnvio]);
    
    console.log('Pedido creado correctamente, ID:', result.insertId);
    res.status(201).json({ message: 'Pedido creado correctamente', id: result.insertId });
  } catch (error) {
    console.error('Error al crear el pedido:', error);
    res.status(500).json({ error: `Error al crear el pedido: ${error.message}` });
  }
};

// Actualizar pedido
const updatePedido = async (req, res) => {
  const id = req.params.id;
  const { idCliente, idProducto, idTransportista, idRuta, cantidad, fechaPedido, idEstadoEnvio } = req.body;

  try {
    const connection = await connectToDB();
    const [result] = await connection.query(`
      UPDATE Pedidos SET 
      idCliente = ?, idProducto = ?, idTransportista = ?, idRuta = ?, cantidad = ?, fechaPedido = ?, idEstadoEnvio = ?
      WHERE idPedido = ?
    `, [idCliente, idProducto, idTransportista, idRuta, cantidad, fechaPedido, idEstadoEnvio, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    res.json({ message: 'Pedido actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el pedido:', error);
    res.status(500).json({ error: 'Error al actualizar el pedido' });
  }
};

// Eliminar pedido
const deletePedido = async (req, res) => {
  const id = req.params.id;
  
  try {
    const connection = await connectToDB();
    const [result] = await connection.query('DELETE FROM Pedidos WHERE idPedido = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    res.json({ message: 'Pedido eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar el pedido:', error);
    res.status(500).json({ error: 'Error al eliminar el pedido' });
  }
};

module.exports = {
  getAllPedidos,
  getPedidoById,
  createPedido,
  updatePedido,
  deletePedido,
};

