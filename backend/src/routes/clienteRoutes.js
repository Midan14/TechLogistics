const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Rutas para clientes
router.get('/', clienteController.getAllClientes);
router.get('/:id', clienteController.getClienteById);
router.post('/', clienteController.createCliente);
router.put('/:id', clienteController.updateCliente);
router.delete('/:id', clienteController.deleteCliente);

module.exports = router;