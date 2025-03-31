const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'TechLogistics',
  port: process.env.DB_PORT || 3308,
});

// Obtener todos los estados de envío
const getAllEstadosEnvio = (req, res) => {
  const sql = 'SELECT * FROM EstadosEnvio';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error al obtener los estados de envío:', err);
      return res.status(500).json({ error: 'Error al obtener los estados de envío' });
    }
    res.json(result);
  });
};

// Obtener estado de envío por ID
const getEstadoEnvioById = (req, res) => {
  const id = req.params.id;
  const sql = 'SELECT * FROM EstadosEnvio WHERE idEstadoEnvio = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al obtener el estado de envío:', err);
      return res.status(500).json({ error: 'Error al obtener el estado de envío' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Estado de envío no encontrado' });
    }
    res.json(result[0]);
  });
};

// Crear nuevo estado de envío
const createEstadoEnvio = (req, res) => {
  const { estado } = req.body;

  if (!estado) {
    return res.status(400).json({ error: 'El campo "estado" es obligatorio' });
  }

  const sql = 'INSERT INTO EstadosEnvio (estado) VALUES (?)';
  db.query(sql, [estado], (err, result) => {
    if (err) {
      console.error('Error al crear el estado de envío:', err);
      return res.status(500).json({ error: 'Error al crear el estado de envío' });
    }
    res.status(201).json({ message: 'Estado de envío creado correctamente', id: result.insertId });
  });
};

// Actualizar estado de envío
const updateEstadoEnvio = (req, res) => {
  const id = req.params.id;
  const { estado } = req.body;

  const sql = 'UPDATE EstadosEnvio SET estado = ? WHERE idEstadoEnvio = ?';
  db.query(sql, [estado, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar el estado de envío:', err);
      return res.status(500).json({ error: 'Error al actualizar el estado de envío' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Estado de envío no encontrado' });
    }
    res.json({ message: 'Estado de envío actualizado correctamente' });
  });
};

// Eliminar estado de envío
const deleteEstadoEnvio = (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM EstadosEnvio WHERE idEstadoEnvio = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar el estado de envío:', err);
      return res.status(500).json({ error: 'Error al eliminar el estado de envío' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Estado de envío no encontrado' });
    }
    res.json({ message: 'Estado de envío eliminado correctamente' });
  });
};

module.exports = {
  getAllEstadosEnvio,
  getEstadoEnvioById,
  createEstadoEnvio,
  updateEstadoEnvio,
  deleteEstadoEnvio,
};
