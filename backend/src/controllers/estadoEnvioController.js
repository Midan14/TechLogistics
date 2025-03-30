const mysql = require('mysql');

// Configuración de la base de datos
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'TechLogistics'
});

// Función para obtener todos los estados de envío
const getAllEstadosEnvio = (req, res) => {
    const sql = 'SELECT * FROM EstadosEnvio';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error al obtener los estados de envío:', err);
            res.status(500).json({ error: 'Error al obtener los estados de envío' });
            return;
        }
        res.json(result);
    });
};

// Función para obtener un estado de envío por ID
const getEstadoEnvioById = (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM EstadosEnvio WHERE idEstadoEnvio = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener el estado de envío:', err);
            res.status(500).json({ error: 'Error al obtener el estado de envío' });
            return;
        }
        if (result.length === 0) {
            res.status(404).json({ error: 'Estado de envío no encontrado' });
            return;
        }
        res.json(result[0]);
    });
};

// Función para crear un nuevo estado de envío
const createEstadoEnvio = (req, res) => {
    const { estado } = req.body;
    const sql = 'INSERT INTO EstadosEnvio (estado) VALUES (?)';
    db.query(sql, [estado], (err, result) => {
        if (err) {
            console.error('Error al crear el estado de envío:', err);
            res.status(500).json({ error: 'Error al crear el estado de envío' });
            return;
        }
        res.status(201).json({ message: 'Estado de envío creado correctamente', id: result.insertId });
    });
};

// Función para actualizar un estado de envío existente
const updateEstadoEnvio = (req, res) => {
    const id = req.params.id;
    const { estado } = req.body;
    const sql = 'UPDATE EstadosEnvio SET estado = ? WHERE idEstadoEnvio = ?';
    db.query(sql, [estado, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el estado de envío:', err);
            res.status(500).json({ error: 'Error al actualizar el estado de envío' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Estado de envío no encontrado' });
            return;
        }
        res.json({ message: 'Estado de envío actualizado correctamente' });
    });
};

// Función para eliminar un estado de envío
const deleteEstadoEnvio = (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM EstadosEnvio WHERE idEstadoEnvio = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el estado de envío:', err);
            res.status(500).json({ error: 'Error al eliminar el estado de envío' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Estado de envío no encontrado' });
            return;
        }
        res.json({ message: 'Estado de envío eliminado correctamente' });
    });
};

module.exports = {
    getAllEstadosEnvio,
    getEstadoEnvioById,
    createEstadoEnvio,
    updateEstadoEnvio,
    deleteEstadoEnvio
};
