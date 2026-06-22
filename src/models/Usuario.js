const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'El email es obligatorio'],
        unique: true, // Mongoose asegura que no haya dos cuentas con el mismo correo
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    rol: {
        type: String,
        enum: ['Admin','Dueño', 'Empleado'],
        default: 'Empleado'
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
        enum: ['Activo', 'Inactivo'],
        default: 'Activo'
    }
}, { timestamps: true });

usuarioSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return; 
    }
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

usuarioSchema.methods.compararPassword = async function (passwordIngresada) {
    return await bcrypt.compare(passwordIngresada, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);