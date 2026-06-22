const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');

// Función auxiliar para generar el Token
const generarToken = (id, rol) => {
    return jwt.sign({ id, rol }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// POST /api/auth/registro -> Crea un usuario nuevo
const registrarUsuario = async (req, res) => {
    try {
        const { email, password, rol } = req.body;

        const usuarioExiste = await Usuario.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({ error: 'El email ya se encuentra registrado.' });
        }

        const usuario = await Usuario.create({
            email,
            password,
            rol
        });

        res.status(201).json({
            mensaje: 'Usuario creado exitosamente',
            token: generarToken(usuario._id, usuario.rol) 
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Error al registrar el usuario', 
            detalle: error.message 
        });
    }
};

// POST /api/auth/login -> Inicia sesión y devuelve el JWT
const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ email });
        
        if (!usuario || usuario.estado === 'Inactivo') {
            return res.status(401).json({ error: 'Credenciales inválidas o cuenta inactiva.' });
        }

        const passwordCorrecta = await usuario.compararPassword(password);
        
        if (!passwordCorrecta) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        res.status(200).json({
            mensaje: 'Login exitoso',
            token: generarToken(usuario._id, usuario.rol),
            usuario: {
                id: usuario._id,
                email: usuario.email,
                rol: usuario.rol
            }
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Error al iniciar sesión', 
            detalle: error.message 
        });
    }
};

module.exports = { registrarUsuario, loginUsuario };