const mysql = require('mysql');

// Configuración de la base de datos (asegúrate de que sea la correcta para TechLogistics)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'TechLogistics'
});

// Función para obtener todas las rutas
const getAllRutas = (req, res) => {
    const sql = 'SELECT * FROM Rutas';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error al obtener las rutas:', err);
            res.status(500).json({ error: 'Error al obtener las rutas' });
            return;
        }
        res.json(result);
    });
};

// Función para obtener una ruta por ID
const getRutaById = (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM Rutas WHERE idRuta = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener la ruta:', err);
            res.status(500).json({ error: 'Error al obtener la ruta' });
            return;
        }
        if (result.length === 0) {
            res.status(404).json({ error: 'Ruta no encontrada' });
            return;
        }
        res.json(result[0]);
    });
};

// Función para crear una nueva ruta
const createRuta = (req, res) => {
    const { origen, destino, distancia } = req.body;
    const sql = 'INSERT INTO Rutas (origen, destino, distancia) VALUES (?, ?, ?)';
    db.query(sql, [origen, destino, distancia], (err, result) => {
        if (err) {
            console.error('Error al crear la ruta:', err);
            res.status(500).json({ error: 'Error al crear la ruta' });
            return;
        }
        res.status(201).json({ message: 'Ruta creada correctamente', id: result.insertId });
    });
};

// Función para actualizar una ruta existente
const updateRuta = (req, res) => {
    const id = req.params.id;
    const { origen, destino, distancia } = req.body;
    const sql = 'UPDATE Rutas SET origen = ?, destino = ?, distancia = ? WHERE idRuta = ?';
    db.query(sql, [origen, destino, distancia, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar la ruta:', err);
            res.status(500).json({ error: 'Error al actualizar la ruta' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Ruta no encontrada' });
            return;
        }
        res.json({ message: 'Ruta actualizada correctamente' });
    });
};

// Función para eliminar una ruta
const deleteRuta = (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM Rutas WHERE idRuta = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar la ruta:', err);
            res.status(500).json({ error: 'Error al eliminar la ruta' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Ruta no encontrada' });
            return;
        }
        res.json({ message: 'Ruta eliminada correctamente' });
    });
};

module.exports = {
    getAllRutas,
    getRutaById,
    createRuta,
    updateRuta,
    deleteRuta
};
