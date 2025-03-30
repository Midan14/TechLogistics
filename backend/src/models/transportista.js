const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transportistaSchema = new Schema({
    nombre: { type: String, required: true },
    tipoVehiculo: { type: String, required: true },
    placa: { type: String, required: true, unique: true },
    // Otros campos como disponibilidad, capacidad, etc.
});

const Transportista = mongoose.model('Transportista', transportistaSchema);
module.exports = Transportista;