const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const estadoEnvioSchema = new Schema({
    estado: { type: String, required: true },
    descripcion: { type: String },
    fechaActualizacion: { type: Date, default: Date.now },
    // Otros campos como idPedido si es necesario relacionarlo
});

const EstadoEnvio = mongoose.model('EstadoEnvio', estadoEnvioSchema);
module.exports = EstadoEnvio;