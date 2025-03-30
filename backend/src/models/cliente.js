const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const clienteSchema = new Schema({
    nombre: { type: String, required: true },
    direccion: { type: String, required: true },
    telefono: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // Otros campos relevantes para un cliente
});

const Cliente = mongoose.model('Cliente', clienteSchema);
module.exports = Cliente;