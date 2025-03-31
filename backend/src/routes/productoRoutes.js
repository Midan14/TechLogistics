const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

// Rutas para productos con validación y manejo de errores

router.get('/', async (req, res, next) => {
  try {
    await productoController.getAllProductos(req, res);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    await productoController.getProductoById(req, res);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { nombre, descripcion, precio } = req.body;

    if (!nombre || !descripcion || !precio) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    await productoController.createProducto(req, res);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    await productoController.updateProducto(req, res);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await productoController.deleteProducto(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
