const Usuario = require('../models/Usuario');
const Comercio = require('../models/Comercio'); // 🟢 Necesario para traer el nombre de la empresa
const jwt = require('jsonwebtoken');

// Función auxiliar para generar el Token
const generarToken = (id, rol, comercioId) => {
    return jwt.sign({ id, rol, comercioId }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// POST /api/auth/registro -> Crea un usuario nuevo
const registrarUsuario = async (req, res) => {
    try {
        // 🟢 Ahora capturamos nombre y apellido del req.body
        let { nombre, apellido, email, password, rol, comercioId } = req.body; 

        // 🟢 Lógica de seguridad: Si quien registra es Dueño, forzamos los datos
        if (req.usuario && req.usuario.rol === 'Dueño') {
            rol = 'Empleado';
            comercioId = req.usuario.comercioId;
        }

        const usuarioExiste = await Usuario.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({ error: 'El email ya se encuentra registrado.' });
        }

        // Se guarda todo (el modelo debería encriptar la password si tenés un pre-save hook)
        const usuario = await Usuario.create({
            nombre,
            apellido,
            email,
            password,
            rol,
            comercioId: rol !== 'Admin' ? comercioId : null
        });

        res.status(201).json({ mensaje: 'Usuario creado exitosamente' });

    } catch (error) {
        res.status(500).json({ error: 'Error al registrar el usuario', detalle: error.message });
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

        // 🟢 Buscamos el nombre del comercio para mandarlo al Chat y la UI
        let nombreComercio = 'Administración Central';
        if (usuario.comercioId) {
            const comercio = await Comercio.findById(usuario.comercioId);
            if (comercio) nombreComercio = comercio.nombre;
        }

        res.status(200).json({
            mensaje: 'Login exitoso',
            token: generarToken(usuario._id, usuario.rol, usuario.comercioId),
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,       // 🟢 Mandamos al Front
                apellido: usuario.apellido,   // 🟢 Mandamos al Front
                email: usuario.email,
                rol: usuario.rol,
                comercioNombre: nombreComercio // 🟢 Mandamos al Chat
            }
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Error al iniciar sesión', 
            detalle: error.message 
        });
    }
};

// Exportamos exactamente como loginUsuario
module.exports = { registrarUsuario, loginUsuario };