const express = require('express');
const router = express.Router();
const rutaController = require('../controllers/rutaController');

// Rutas para rutas
router.get('/', rutaController.getAllRutas);
router.get('/:id', rutaController.getRutaById);
router.post('/', rutaController.createRuta);
router.put('/:id', rutaController.updateRuta);
router.delete('/:id', rutaController.deleteRuta);

module.exports = router;