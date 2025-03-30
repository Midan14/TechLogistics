const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Error de Mongoose por ID no válido
    if (err.name === 'CastError') {
        const message = `Recurso no encontrado con el id ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    // Error de Mongoose por clave duplicada
    if (err.code === 11000) {
        const message = 'Valor de campo duplicado ingresado';
        error = new ErrorResponse(message, 400);
    }

    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    // Responde al cliente
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Error del servidor'
    });
};

module.exports = errorHandler;
