const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = Object.assign(new ErrorResponse(), err);
    error.message = err.message;

    // Error de Mongoose: ID no válido
    if (err.name === 'CastError') {
        const message = `Recurso no encontrado con el id ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    // Error de Mongoose: Clave duplicada
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const message = `El valor del campo '${field}' ya existe`;
        error = new ErrorResponse(message, 400);
    }

    // Error de validación de Mongoose
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors)
            .map(val => val.message)
            .join('; ');
        error = new ErrorResponse(message, 400);
    }

    // Registrar errores no manejados
    if (!error.statusCode) {
        console.error('Error no manejado:', err);
    }

    // Respuesta al cliente
    const env = process.env.NODE_ENV || 'development';
    res.status(error.statusCode || 500).json({
        success: false,
        error: env === 'production' ? 'Error interno del servidor' : error.message
    });
};

module.exports = errorHandler;