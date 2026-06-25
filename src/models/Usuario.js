const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    rol: { 
        type: String, 
        required: true,
        enum: ['Admin', 'Dueño', 'Empleado'] 
    },
    comercioId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Comercio',
        required: function() {
            return this.rol === 'Dueño' || this.rol === 'Empleado';
        }
    },
    estado: { 
        type: String, 
        default: 'Activo',
        enum: ['Activo', 'Inactivo']
    }
}, { timestamps: true });

usuarioSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

usuarioSchema.methods.compararPassword = async function(passwordIngresada) {
    return await bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);