const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Rutas para clientes con validación y manejo de errores

// Obtener todos los clientes
router.get('/', async (req, res, next) => {
  try {
    await clienteController.getAllClientes(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener cliente por ID
router.get('/:id', async (req, res, next) => {
  try {
    await clienteController.getClienteById(req, res);
  } catch (err) {
    next(err);
  }
});

// Crear cliente
router.post('/', async (req, res, next) => {
  try {
    const { nombre, correo, direccion, telefono } = req.body;

    // Validación mínima
    if (!nombre || !correo || !direccion || !telefono) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    await clienteController.createCliente(req, res);
  } catch (err) {
    next(err);
  }
});

// Actualizar cliente
router.put('/:id', async (req, res, next) => {
  try {
    await clienteController.updateCliente(req, res);
  } catch (err) {
    next(err);
  }
});

// Eliminar cliente
router.delete('/:id', async (req, res, next) => {
  try {
    await clienteController.deleteCliente(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
