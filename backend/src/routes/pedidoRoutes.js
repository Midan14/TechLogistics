const express = require('express');
const router = express.Router();
const pedidoController = require('../controllers/pedidoController');

// Rutas para pedidos
router.get('/', pedidoController.getAllPedidos);
router.get('/:id', pedidoController.getPedidoById);
router.post('/', pedidoController.createPedido);
router.put('/:id', pedidoController.updatePedido);
router.delete('/:id', pedidoController.deletePedido);

module.exports = router;
