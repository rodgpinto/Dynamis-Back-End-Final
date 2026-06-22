const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// Verifica que el usuario tenga un token válido
const protegerRuta = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);


            req.usuario = await Usuario.findById(decoded.id).select('-password');

            return next();
        } catch (error) {
            return res.status(401).json({ error: 'No autorizado. Token inválido o expirado.' });
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'No autorizado. No se proporcionó ningún token.' });
    }
};

// Verifica el rol (Debe usarse DESPUÉS de protegerRuta)
const autorizarRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        // req.usuario es inyectado por protegerRuta
        if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({
                error: `Acceso denegado. Tu rol actual (${req.usuario?.rol}) no tiene los privilegios necesarios.`
            });
        }
        next();
    };
};

module.exports = { protegerRuta, autorizarRoles };