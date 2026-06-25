const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
    productoId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Producto', 
        required: true 
    },
    usuarioId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    cantidad: { 
        type: Number, 
        required: true 
    },
    precioUnitario: { 
        type: Number, 
        required: true 
    },
    total: { 
        type: Number, 
        required: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Venta', ventaSchema);