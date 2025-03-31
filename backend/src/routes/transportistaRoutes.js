const express = require('express');
const router = express.Router();
const transportistaController = require('../controllers/transportistaController');

// Obtener todos los transportistas
router.get('/', async (req, res, next) => {
  try {
    await transportistaController.getAllTransportistas(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener transportista por ID
router.get('/:id', async (req, res, next) => {
  try {
    await transportistaController.getTransportistaById(req, res);
  } catch (err) {
    next(err);
  }
});

// Crear nuevo transportista
router.post('/', async (req, res, next) => {
  try {
    const { nombre, placa, telefono } = req.body;

    if (!nombre || !placa || !telefono) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios.' });
    }

    await transportistaController.createTransportista(req, res);
  } catch (err) {
    next(err);
  }
});

// Actualizar transportista
router.put('/:id', async (req, res, next) => {
  try {
    await transportistaController.updateTransportista(req, res);
  } catch (err) {
    next(err);
  }
});

// Eliminar transportista
router.delete('/:id', async (req, res, next) => {
  try {
    await transportistaController.deleteTransportista(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
