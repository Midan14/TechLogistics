const express = require('express');
const router = express.Router();
const estadoEnvioController = require('../controllers/estadoEnvioController');

// Obtener todos los estados de envío
router.get('/', async (req, res, next) => {
  try {
    await estadoEnvioController.getAllEstadosEnvio(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener estado de envío por ID
router.get('/:id', async (req, res, next) => {
  try {
    await estadoEnvioController.getEstadoEnvioById(req, res);
  } catch (err) {
    next(err);
  }
});

// Crear nuevo estado de envío
router.post('/', async (req, res, next) => {
  try {
    const { nombre_estado } = req.body;

    if (!nombre_estado) {
      return res.status(400).json({ mensaje: 'El nombre del estado es obligatorio.' });
    }

    await estadoEnvioController.createEstadoEnvio(req, res);
  } catch (err) {
    next(err);
  }
});

// Actualizar estado de envío
router.put('/:id', async (req, res, next) => {
  try {
    await estadoEnvioController.updateEstadoEnvio(req, res);
  } catch (err) {
    next(err);
  }
});

// Eliminar estado de envío
router.delete('/:id', async (req, res, next) => {
  try {
    await estadoEnvioController.deleteEstadoEnvio(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
