const Tienda = require('../models/Tienda');
const Comercio = require('../models/Comercio');

const crearTienda = async (req, res) => {
    try {
        const { nombre, dominio, comercioId } = req.body;
        
        const comercioExiste = await Comercio.findById(comercioId);
        
        if (!comercioExiste || comercioExiste.estado === 'Inactivo') {
            return res.status(404).json({ error: 'El comercio referenciado no existe o está inactivo.' });
        }

        const nuevaTienda = await Tienda.create({ nombre, dominio, comercioId, estado: 'Activa' });
        res.status(201).json({ mensaje: 'Tienda creada exitosamente', data: nuevaTienda });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la tienda', detalle: error.message });
    }
};

// GET /api/tiendas
const obtenerTiendas = async (req, res) => {
    try {
        let filtroDeBusqueda = {};
        
        // Si NO es Admin, solo le devolvemos las tiendas que pertenezcan a la empresa en la que trabaja
        if (req.usuario.rol !== 'Admin') {
            filtroDeBusqueda = { comercioId: req.usuario.comercioId };
        }

        const tiendas = await Tienda.find(filtroDeBusqueda);
        res.status(200).json({ data: tiendas });

    } catch (error) {
        res.status(500).json({ error: 'Error al obtener tiendas', detalle: error.message });
    }
};

// PUT /api/tiendas/:id
const actualizarTienda = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, direccion, telefono } = req.body;

        const tienda = await Tienda.findById(id);

        if (!tienda || tienda.estado === 'Inactiva') {
            return res.status(404).json({ error: 'Tienda no encontrada.' });
        }

        if (req.usuario.rol === 'Dueño') {
            if (tienda.comercioId.toString() !== req.usuario.comercioId.toString()) {
                return res.status(403).json({ 
                    error: 'Acceso denegado. No tienes permisos para modificar una tienda de otro comercio.' 
                });
            }
        }

        tienda.nombre = nombre || tienda.nombre;
        tienda.direccion = direccion || tienda.direccion;
        tienda.telefono = telefono || tienda.telefono;

        await tienda.save();

        res.status(200).json({
            mensaje: 'Tienda actualizada con éxito.',
            data: tienda
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Error al actualizar la tienda', 
            detalle: error.message 
        });
    }
};

const eliminarTienda = async (req, res) => {
    try {
        const { id } = req.params;
        const tiendaDadaDeBaja = await Tienda.findByIdAndUpdate(id, { estado: 'Inactiva' }, { new: true });
        
        if (!tiendaDadaDeBaja) {
            return res.status(404).json({ error: 'Tienda no encontrada.' });
        }
        res.status(200).json({ mensaje: 'Tienda dada de baja (Inactiva) correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar', detalle: error.message });
    }
};

// PUT /api/tiendas/:id/activar
const reactivarTienda = async (req, res) => {
    try {
        const tienda = await Tienda.findByIdAndUpdate(req.params.id, { estado: 'Activa' }, { new: true });
        res.status(200).json({ data: tienda });
    } catch (error) {
        res.status(500).json({ error: 'Error al reactivar tienda' });
    }
};
module.exports = { crearTienda, obtenerTiendas, actualizarTienda, eliminarTienda, reactivarTienda };