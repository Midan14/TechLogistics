const express = require('express');
const router = express.Router();
const transportistaController = require('../controllers/transportistaController');

// Rutas para transportistas
router.get('/', transportistaController.getAllTransportistas);
router.get('/:id', transportistaController.getTransportistaById);
router.post('/', transportistaController.createTransportista);
router.put('/:id', transportistaController.updateTransportista);
router.delete('/:id', transportistaController.deleteTransportista);

module.exports = router;