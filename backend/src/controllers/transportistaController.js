const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'TechLogistics',
  port: process.env.DB_PORT || 3308,
});

// Obtener todos los transportistas
const getAllTransportistas = (req, res) => {
  db.query('SELECT * FROM Transportistas', (err, result) => {
    if (err) {
      console.error('Error al obtener los transportistas:', err);
      return res.status(500).json({ error: 'Error al obtener los transportistas' });
    }
    res.json(result);
  });
};

// Obtener transportista por ID
const getTransportistaById = (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM Transportistas WHERE idTransportista = ?', [id], (err, result) => {
    if (err) {
      console.error('Error al obtener el transportista:', err);
      return res.status(500).json({ error: 'Error al obtener el transportista' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Transportista no encontrado' });
    }
    res.json(result[0]);
  });
};

// Crear nuevo transportista
const createTransportista = (req, res) => {
  const { nombre, vehiculo, email } = req.body;

  if (!nombre || !vehiculo || !email) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const sql = 'INSERT INTO Transportistas (nombre, vehiculo, email) VALUES (?, ?, ?)';
  db.query(sql, [nombre, vehiculo, email], (err, result) => {
    if (err) {
      console.error('Error al crear el transportista:', err);
      return res.status(500).json({ error: 'Error al crear el transportista' });
    }
    res.status(201).json({ message: 'Transportista creado correctamente', id: result.insertId });
  });
};

// Actualizar transportista
const updateTransportista = (req, res) => {
  const id = req.params.id;
  const { nombre, vehiculo, email } = req.body;

  const sql = 'UPDATE Transportistas SET nombre = ?, vehiculo = ?, email = ? WHERE idTransportista = ?';
  db.query(sql, [nombre, vehiculo, email, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar el transportista:', err);
      return res.status(500).json({ error: 'Error al actualizar el transportista' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transportista no encontrado' });
    }
    res.json({ message: 'Transportista actualizado correctamente' });
  });
};

// Eliminar transportista
const deleteTransportista = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM Transportistas WHERE idTransportista = ?', [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar el transportista:', err);
      return res.status(500).json({ error: 'Error al eliminar el transportista' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Transportista no encontrado' });
    }
    res.json({ message: 'Transportista eliminado correctamente' });
  });
};

module.exports = {
  getAllTransportistas,
  getTransportistaById,
  createTransportista,
  updateTransportista,
  deleteTransportista,
};
