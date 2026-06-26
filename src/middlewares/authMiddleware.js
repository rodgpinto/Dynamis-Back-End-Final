const jwt = require('jsonwebtoken');

const protegerRuta = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 🟢 Inyectamos el usuario en la request
            req.usuario = decoded;
            
            // 🟢 RETURN es fundamental acá para que pase al controlador y frene el middleware
            return next(); 
        } catch (error) {
            return res.status(401).json({ error: 'Token no válido o expirado' });
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'No autorizado, falta el token' });
    }
};

const autorizarRoles = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return res.status(403).json({ error: 'Acceso denegado por falta de permisos' });
        }
        next();
    };
};

module.exports = { protegerRuta, autorizarRoles };