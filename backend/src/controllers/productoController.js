const mysql = require('mysql');

// Configuración de la base de datos (asegúrate de que sea la correcta para TechLogistics)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'TechLogistics'
});

// Función para obtener todos los productos
const getAllProductos = (req, res) => {
    const sql = 'SELECT * FROM Productos';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error al obtener los productos:', err);
            res.status(500).json({ error: 'Error al obtener los productos' });
            return;
        }
        res.json(result);
    });
};

// Función para obtener un producto por ID
const getProductoById = (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM Productos WHERE idProducto = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al obtener el producto:', err);
            res.status(500).json({ error: 'Error al obtener el producto' });
            return;
        }
        if (result.length === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.json(result[0]);
    });
};

// Función para crear un nuevo producto
const createProducto = (req, res) => {
    const { nombre, descripcion, precio } = req.body;
    const sql = 'INSERT INTO Productos (nombre, descripcion, precio) VALUES (?, ?, ?)';
    db.query(sql, [nombre, descripcion, precio], (err, result) => {
        if (err) {
            console.error('Error al crear el producto:', err);
            res.status(500).json({ error: 'Error al crear el producto' });
            return;
        }
        res.status(201).json({ message: 'Producto creado correctamente', id: result.insertId });
    });
};

// Función para actualizar un producto existente
const updateProducto = (req, res) => {
    const id = req.params.id;
    const { nombre, descripcion, precio } = req.body;
    const sql = 'UPDATE Productos SET nombre = ?, descripcion = ?, precio = ? WHERE idProducto = ?';
    db.query(sql, [nombre, descripcion, precio, id], (err, result) => {
        if (err) {
            console.error('Error al actualizar el producto:', err);
            res.status(500).json({ error: 'Error al actualizar el producto' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.json({ message: 'Producto actualizado correctamente' });
    });
};

// Función para eliminar un producto
const deleteProducto = (req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM Productos WHERE idProducto = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error al eliminar el producto:', err);
            res.status(500).json({ error: 'Error al eliminar el producto' });
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        res.json({ message: 'Producto eliminado correctamente' });
    });
};

module.exports = {
    getAllProductos,
    getProductoById,
    createProducto,
    updateProducto,
    deleteProducto
};
