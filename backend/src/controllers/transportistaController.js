const mysql = require('mysql');

// Configuración de la base de datos (asegúrate de que sea la correcta para TechLogistics)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'TechLogistics'
});

// Función para obtener todos los transportistas
const getAllTransportistas = (req, res) => {
    const sql = 'SELECT * FROM Transportistas';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error al obtener los transportistas:', err);
            res.status(500).json({ error: 'Error al obtener los transportistas' });
            return;
        }
        res.json(result);
    });
};

// Función para obtener un transportista por ID
const getTransportistaById = (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM Transportistas WHERE idTransportista = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener el transportista:', err);
            res.status(500).json({ error: 'Error al obtener el transportista' });
            return;
        }
        if (result.length === 0) {
            res.status(404).json({ error: 'Transportista no encontrado' });
            return;
        }
        res.json(result[0]);
    });
};

// Función para crear un nuevo transportista
const createTransportista = (req, res) => {
    const { nombre, vehiculo, email } = req.body;
    const sql = 'INSERT INTO Transportistas (nombre, vehiculo, email) VALUES (?, ?, ?)';
    db.query(sql, [nombre, vehiculo, email], (err, result) => {
        if (err) {
            console.error('Error al crear el transportista:', err);
            res.status(500).json({ error: 'Error al crear el transportista' });
            return;
        }
        res.status(201).json({ message: 'Transportista creado correctamente', id: result.insertId });
    });
};

// Función para actualizar un transportista existente
const updateTransportista = (req, res) => {
    const id = req.params.id;
    const { nombre, vehiculo, email } = req.body;
    const sql = 'UPDATE Transportistas SET nombre = ?, vehiculo = ?, email = ? WHERE idTransportista = ?';
    db.query(sql, [nombre, vehiculo, email, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el transportista:', err);
            res.status(500).json({ error: 'Error al actualizar el transportista' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Transportista no encontrado' });
            return;
        }
        res.json({ message: 'Transportista actualizado correctamente' });
    });
};

// Función para eliminar un transportista
const deleteTransportista = (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM Transportistas WHERE idTransportista = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el transportista:', err);
            res.status(500).json({ error: 'Error al eliminar el transportista' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Transportista no encontrado' });
            return;
        }
        res.json({ message: 'Transportista eliminado correctamente' });
    });
};

module.exports = {
    getAllTransportistas,
    getTransportistaById,
    createTransportista,
    updateTransportista,
    deleteTransportista
};
