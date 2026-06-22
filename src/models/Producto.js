const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: [true, 'El nombre del producto es obligatorio'] 
    },
    descripcion: { 
        type: String 
    },
    precio: { 
        type: Number, 
        required: [true, 'El precio es obligatorio'],
        min: [0, 'El precio no puede ser negativo']
    },
    stock: { 
        type: Number, 
        required: [true, 'El stock es obligatorio'],
        min: [0, 'El stock no puede ser menor a 0. Producto agotado.'] 
    },
    tiendaId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Tienda', 
        required: [true, 'El producto debe pertenecer obligatoriamente a una tienda'] 
    },
    estado: { 
        type: String, 
        enum: ['Activo', 'Inactivo'], 
        default: 'Activo' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Producto', productoSchema);