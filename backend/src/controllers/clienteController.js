const mysql = require('mysql2');
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'TechLogistics',
  port: process.env.DB_PORT || 3308,
});

// Obtener todos los clientes
const getAllClientes = (req, res) => {
  db.query('SELECT * FROM Clientes', (err, result) => {
    if (err) {
      console.error('Error al obtener los clientes:', err);
      return res.status(500).json({ error: 'Error al obtener los clientes' });
    }
    res.json(result);
  });
};

// Obtener cliente por ID
const getClienteById = (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM Clientes WHERE idCliente = ?', [id], (err, result) => {
    if (err) {
      console.error('Error al obtener el cliente:', err);
      return res.status(500).json({ error: 'Error al obtener el cliente' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(result[0]);
  });
};

// Crear nuevo cliente
const createCliente = (req, res) => {
  const { nombre, direccion, telefono, email } = req.body;

  if (!nombre || !direccion || !telefono || !email) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const sql = 'INSERT INTO Clientes (nombre, direccion, telefono, email) VALUES (?, ?, ?, ?)';
  db.query(sql, [nombre, direccion, telefono, email], (err, result) => {
    if (err) {
      console.error('Error al crear el cliente:', err);
      return res.status(500).json({ error: 'Error al crear el cliente' });
    }
    res.status(201).json({ message: 'Cliente creado correctamente', id: result.insertId });
  });
};

// Actualizar cliente
const updateCliente = (req, res) => {
  const id = req.params.id;
  const { nombre, direccion, telefono, email } = req.body;

  const sql = 'UPDATE Clientes SET nombre = ?, direccion = ?, telefono = ?, email = ? WHERE idCliente = ?';
  db.query(sql, [nombre, direccion, telefono, email, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar el cliente:', err);
      return res.status(500).json({ error: 'Error al actualizar el cliente' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente actualizado correctamente' });
  });
};

// Eliminar cliente
const deleteCliente = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM Clientes WHERE idCliente = ?', [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar el cliente:', err);
      return res.status(500).json({ error: 'Error al eliminar el cliente' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json({ message: 'Cliente eliminado correctamente' });
  });
};

module.exports = {
  getAllClientes,
  getClienteById,
  createCliente,
  updateCliente,
  deleteCliente,
};
