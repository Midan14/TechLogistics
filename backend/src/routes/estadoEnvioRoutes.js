const express = require('express');
const router = express.Router();
const estadoEnvioController = require('../controllers/estadoEnvioController');

// Rutas para estados de envío
router.get('/', estadoEnvioController.getAllEstadosEnvio);
router.get('/:id', estadoEnvioController.getEstadoEnvioById);
router.post('/', estadoEnvioController.createEstadoEnvio);
router.put('/:id', estadoEnvioController.updateEstadoEnvio);
router.delete('/:id', estadoEnvioController.deleteEstadoEnvio);

module.exports = router;
