const validarBodyVacio = (req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ 
                error: 'Error de validación: El cuerpo de la petición no puede estar vacío.' 
            });
        }
    }
    
    next();
};
const validarDatosComercio = (req, res, next) => {
    const { nombre, cuit } = req.body;
    if (!nombre || !cuit) {
        return res.status(400).json({ error: 'Faltan datos obligatorios. Todo comercio debe tener un "nombre" y un "cuit".' });
    }
    next();
};

module.exports = { validarBodyVacio , validarDatosComercio};