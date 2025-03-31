const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'TechLogistics',
  port: process.env.DB_PORT || 3308,
});

// Obtener todos los productos
const getAllProductos = (req, res) => {
  db.query('SELECT * FROM Productos', (err, result) => {
    if (err) {
      console.error('Error al obtener los productos:', err);
      return res.status(500).json({ error: 'Error al obtener los productos' });
    }
    res.json(result);
  });
};

// Obtener producto por ID
const getProductoById = (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM Productos WHERE idProducto = ?', [id], (err, result) => {
    if (err) {
      console.error('Error al obtener el producto:', err);
      return res.status(500).json({ error: 'Error al obtener el producto' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(result[0]);
  });
};

// Crear nuevo producto
const createProducto = (req, res) => {
  const { nombre, descripcion, precio } = req.body;

  if (!nombre || !descripcion || !precio) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const sql = 'INSERT INTO Productos (nombre, descripcion, precio) VALUES (?, ?, ?)';
  db.query(sql, [nombre, descripcion, precio], (err, result) => {
    if (err) {
      console.error('Error al crear el producto:', err);
      return res.status(500).json({ error: 'Error al crear el producto' });
    }
    res.status(201).json({ message: 'Producto creado correctamente', id: result.insertId });
  });
};

// Actualizar producto
const updateProducto = (req, res) => {
  const id = req.params.id;
  const { nombre, descripcion, precio } = req.body;

  const sql = 'UPDATE Productos SET nombre = ?, descripcion = ?, precio = ? WHERE idProducto = ?';
  db.query(sql, [nombre, descripcion, precio, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar el producto:', err);
      return res.status(500).json({ error: 'Error al actualizar el producto' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto actualizado correctamente' });
  });
};

// Eliminar producto
const deleteProducto = (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM Productos WHERE idProducto = ?', [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar el producto:', err);
      return res.status(500).json({ error: 'Error al eliminar el producto' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  });
};

module.exports = {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
};
