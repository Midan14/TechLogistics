const mysql = require('mysql');

// Configuración de la base de datos (asegúrate de que sea la correcta para TechLogistics)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'TechLogistics'
});

// Función para obtener todos los pedidos
const getAllPedidos = (req, res) => {
    const sql = `
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
    `;
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error al obtener los pedidos:', err);
            res.status(500).json({ error: 'Error al obtener los pedidos' });
            return;
        }
        res.json(result);
    });
};

// Función para obtener un pedido por ID
const getPedidoById = (req, res) => {
    const id = req.params.id;
    const sql = `
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
    `;
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener el pedido:', err);
            res.status(500).json({ error: 'Error al obtener el pedido' });
            return;
        }
        if (result.length === 0) {
            res.status(404).json({ error: 'Pedido no encontrado' });
            return;
        }
        res.json(result[0]);
    });
};

// Función para crear un nuevo pedido
const createPedido = (req, res) => {
    const { idCliente, idProducto, idTransportista, idRuta, cantidad, fechaPedido, idEstadoEnvio } = req.body;
    const sql = 'INSERT INTO Pedidos (idCliente, idProducto, idTransportista, idRuta, cantidad, fechaPedido, idEstadoEnvio) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [idCliente, idProducto, idTransportista, idRuta, cantidad, fechaPedido, idEstadoEnvio], (err, result) => {
        if (err) {
            console.error('Error al crear el pedido:', err);
            res.status(500).json({ error: 'Error al crear el pedido' });
            return;
        }
        res.status(201).json({ message: 'Pedido creado correctamente', id: result.insertId });
    });
};

// Función para actualizar un pedido existente
const updatePedido = (req, res) => {
    const id = req.params.id;
    const { idCliente, idProducto, idTransportista, idRuta, cantidad, fechaPedido, idEstadoEnvio } = req.body;
    const sql = 'UPDATE Pedidos SET idCliente = ?, idProducto = ?, idTransportista = ?, idRuta = ?, cantidad = ?, fechaPedido = ?, idEstadoEnvio = ? WHERE idPedido = ?';
    db.query(sql, [idCliente, idProducto, idTransportista, idRuta, cantidad, fechaPedido, idEstadoEnvio, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el pedido:', err);
            res.status(500).json({ error: 'Error al actualizar el pedido' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Pedido no encontrado' });
            return;
        }
        res.json({ message: 'Pedido actualizado correctamente' });
    });
};

// Función para eliminar un pedido
const deletePedido = (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM Pedidos WHERE idPedido = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el pedido:', err);
            res.status(500).json({ error: 'Error al eliminar el pedido' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Pedido no encontrado' });
            return;
        }
        res.json({ message: 'Pedido eliminado correctamente' });
    });
};

module.exports = {
    getAllPedidos,
    getPedidoById,
    createPedido,
    updatePedido,
    deletePedido
};
