const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pedidoSchema = new Schema({
    clienteId: { type: Schema.Types.ObjectId, ref: 'Cliente', required: true },  // Referencia al cliente
    producto: { type: String, required: true },
    cantidad: { type: Number, required: true },
    fechaPedido: { type: Date, default: Date.now },
    estadoEnvioId: { type: Schema.Types.ObjectId, ref: 'EstadoEnvio', required: true }, // Referencia al estado del envío
    transportistaId: { type: Schema.Types.ObjectId, ref: 'Transportista' }, // Referencia al transportista
    rutaId: { type: Schema.Types.ObjectId, ref: 'Ruta' }  // Referencia a la ruta
    // Otros campos relevantes para un pedido
});

const Pedido = mongoose.model('Pedido', pedidoSchema);
module.exports = Pedido;