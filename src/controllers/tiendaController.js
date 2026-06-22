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

const obtenerTiendas = async (req, res) => {
    try {
        
        const tiendas = await Tienda.find().populate('comercioId', 'nombre cuit estado');
        res.status(200).json(tiendas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener tiendas', detalle: error.message });
    }
};

const actualizarTienda = async (req, res) => {
    try {
        const { id } = req.params;
        const tiendaActualizada = await Tienda.findByIdAndUpdate(id, req.body, { new: true });
        
        if (!tiendaActualizada) {
            return res.status(404).json({ error: 'Tienda no encontrada.' });
        }
        res.status(200).json({ mensaje: 'Tienda actualizada', data: tiendaActualizada });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar', detalle: error.message });
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

module.exports = { crearTienda, obtenerTiendas, actualizarTienda, eliminarTienda };