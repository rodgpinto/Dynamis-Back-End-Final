const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
    productoId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Producto', 
        required: [true, 'El ID del producto es obligatorio'] 
    },
    cantidad: { 
        type: Number, 
        required: [true, 'La cantidad es obligatoria'],
        min: [1, 'La venta debe ser de al menos 1 unidad']
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