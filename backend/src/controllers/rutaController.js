const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'TechLogistics',
  port: process.env.DB_PORT || 3308,
});

// Obtener todas las rutas
const getAllRutas = (req, res) => {
  const sql = 'SELECT * FROM Rutas';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error al obtener las rutas:', err);
      return res.status(500).json({ error: 'Error al obtener las rutas' });
    }
    res.json(result);
  });
};

// Obtener una ruta por ID
const getRutaById = (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM Rutas WHERE idRuta = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al obtener la ruta:', err);
      return res.status(500).json({ error: 'Error al obtener la ruta' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }
    res.json(result[0]);
  });
};

// Crear nueva ruta
const createRuta = (req, res) => {
  const { origen, destino, distancia } = req.body;

  if (!origen || !destino || !distancia) {
    return res.status(400).json({ error: 'Origen, destino y distancia son obligatorios' });
  }

  const sql = 'INSERT INTO Rutas (origen, destino, distancia) VALUES (?, ?, ?)';
  db.query(sql, [origen, destino, distancia], (err, result) => {
    if (err) {
      console.error('Error al crear la ruta:', err);
      return res.status(500).json({ error: 'Error al crear la ruta' });
    }
    res.status(201).json({ message: 'Ruta creada correctamente', id: result.insertId });
  });
};

// Actualizar ruta
const updateRuta = (req, res) => {
  const id = req.params.id;
  const { origen, destino, distancia } = req.body;

  const sql = 'UPDATE Rutas SET origen = ?, destino = ?, distancia = ? WHERE idRuta = ?';
  db.query(sql, [origen, destino, distancia, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar la ruta:', err);
      return res.status(500).json({ error: 'Error al actualizar la ruta' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }
    res.json({ message: 'Ruta actualizada correctamente' });
  });
};

// Eliminar ruta
const deleteRuta = (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM Rutas WHERE idRuta = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar la ruta:', err);
      return res.status(500).json({ error: 'Error al eliminar la ruta' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Ruta no encontrada' });
    }
    res.json({ message: 'Ruta eliminada correctamente' });
  });
};

module.exports = {
  getAllRutas,
  getRutaById,
  createRuta,
  updateRuta,
  deleteRuta,
};
