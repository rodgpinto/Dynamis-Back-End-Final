const mongoose = require('mongoose');

const comercioSchema = new mongoose.Schema({
    nombre: { 
        type: String, 
        required: [true, 'El nombre del comercio es obligatorio'] 
    },
    cuit: { 
        type: String, 
        required: [true, 'El CUIT es obligatorio'] 
    },
    estado: { 
        type: String, 
        default: 'Activo' 
    }
}, {
    timestamps: true 
});

module.exports = mongoose.model('Comercio', comercioSchema);