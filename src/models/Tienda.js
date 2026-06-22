const mongoose = require('mongoose');

const tiendaSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: [true, 'El nombre de la tienda es obligatorio'] 
    },
    dominio: { 
        type: String, 
        required: [true, 'El dominio es obligatorio'] 
    },
    comercioId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Comercio', 
        required: [true, 'La tienda debe pertenecer a un comercio'] 
    },
    estado: { 
        type: String, 
        default: 'Activa'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Tienda', tiendaSchema);