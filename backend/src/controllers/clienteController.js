const mysql = require('mysql');

// Configuración de la base de datos (asegúrate de que sea la correcta para TechLogistics)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'TechLogistics'
});

// Función para obtener todos los clientes
const getAllClientes = (req, res) => {
    const sql = 'SELECT * FROM Clientes';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error al obtener los clientes:', err);
            res.status(500).json({ error: 'Error al obtener los clientes' });
            return;
        }
        res.json(result);
    });
};

// Función para obtener un cliente por ID
const getClienteById = (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM Clientes WHERE idCliente = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener el cliente:', err);
            res.status(500).json({ error: 'Error al obtener el cliente' });
            return;
        }
        if (result.length === 0) {
            res.status(404).json({ error: 'Cliente no encontrado' });
            return;
        }
        res.json(result[0]);
    });
};

// Función para crear un nuevo cliente
const createCliente = (req, res) => {
    const { nombre, direccion, telefono, email } = req.body;
    const sql = 'INSERT INTO Clientes (nombre, direccion, telefono, email) VALUES (?, ?, ?, ?)';
    db.query(sql, [nombre, direccion, telefono, email], (err, result) => {
        if (err) {
            console.error('Error al crear el cliente:', err);
            res.status(500).json({ error: 'Error al crear el cliente' });
            return;
        }
        res.status(201).json({ message: 'Cliente creado correctamente', id: result.insertId });
    });
};

// Función para actualizar un cliente existente
const updateCliente = (req, res) => {
    const id = req.params.id;
    const { nombre, direccion, telefono, email } = req.body;
    const sql = 'UPDATE Clientes SET nombre = ?, direccion = ?, telefono = ?, email = ? WHERE idCliente = ?';
    db.query(sql, [nombre, direccion, telefono, email, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el cliente:', err);
            res.status(500).json({ error: 'Error al actualizar el cliente' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Cliente no encontrado' });
            return;
        }
        res.json({ message: 'Cliente actualizado correctamente' });
    });
};

// Función para eliminar un cliente
const deleteCliente = (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM Clientes WHERE idCliente = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el cliente:', err);
            res.status(500).json({ error: 'Error al eliminar el cliente' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Cliente no encontrado' });
            return;
        }
        res.json({ message: 'Cliente eliminado correctamente' });
    });
};

module.exports = {
    getAllClientes,
    getClienteById,
    createCliente,
    updateCliente,
    deleteCliente
};
