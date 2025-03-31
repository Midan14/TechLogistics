const express = require('express');
const router = express.Router();
const rutaController = require('../controllers/rutaController');

// Obtener todas las rutas
router.get('/', async (req, res, next) => {
  try {
    await rutaController.getAllRutas(req, res);
  } catch (err) {
    next(err);
  }
});

// Obtener ruta por ID
router.get('/:id', async (req, res, next) => {
  try {
    await rutaController.getRutaById(req, res);
  } catch (err) {
    next(err);
  }
});

// Crear nueva ruta
router.post('/', async (req, res, next) => {
  try {
    const { origen, destino } = req.body;

    if (!origen || !destino) {
      return res.status(400).json({ mensaje: 'Origen y destino son obligatorios.' });
    }

    await rutaController.createRuta(req, res);
  } catch (err) {
    next(err);
  }
});

// Actualizar ruta
router.put('/:id', async (req, res, next) => {
  try {
    await rutaController.updateRuta(req, res);
  } catch (err) {
    next(err);
  }
});

// Eliminar ruta
router.delete('/:id', async (req, res, next) => {
  try {
    await rutaController.deleteRuta(req, res);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
