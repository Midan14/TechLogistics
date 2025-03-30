const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rutaSchema = new Schema({
    origen: { type: String, required: true },
    destino: { type: String, required: true },
    distancia: { type: Number, required: true },
    tiempoEstimado: { type: String, required: true },
    // Otros campos como lista de pedidos o transportistas asignados
});

const Ruta = mongoose.model('Ruta', rutaSchema);
module.exports = Ruta;