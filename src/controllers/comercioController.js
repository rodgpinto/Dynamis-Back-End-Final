const Comercio = require('../models/Comercio');
const Tienda = require('../models/Tienda'); 

const crearComercio = async (req, res) => {
    try {
        const nuevoComercio = await Comercio.create(req.body);
        res.status(201).json({ mensaje: 'Comercio creado con éxito', data: nuevoComercio });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el comercio', detalle: error.message });
    }
};

// GET /api/comercios
const obtenerComercios = async (req, res) => {
    try {
        let filtroDeBusqueda = {};
        
        if (req.usuario.rol !== 'Admin') {
            filtroDeBusqueda = { _id: req.usuario.comercioId };
        }

        const comercios = await Comercio.find(filtroDeBusqueda);
        res.status(200).json({ data: comercios });

    } catch (error) {
        res.status(500).json({ error: 'Error al obtener comercios', detalle: error.message });
    }
};

const actualizarComercio = async (req, res) => {
    try {
        const { id } = req.params;
        const comercioActualizado = await Comercio.findByIdAndUpdate(id, req.body, { new: true });
        
        if (!comercioActualizado) {
            return res.status(404).json({ error: 'Comercio no encontrado en Dynamis.' });
        }
        res.status(200).json({ mensaje: 'Comercio actualizado', data: comercioActualizado });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar', detalle: error.message });
    }
};

// DELETE /api/comercios/:id (Baja Lógica)
const eliminarComercio = async (req, res) => {
    try {
        const { id } = req.params;
        const comercioEliminado = await Comercio.findByIdAndUpdate(
            id,
            { estado: 'Inactivo' },
            { new: true }
        );

        if (!comercioEliminado) {
            return res.status(404).json({ error: 'Comercio no encontrado.' });
        }

        res.status(200).json({ mensaje: 'Comercio dado de baja', data: comercioEliminado });

    } catch (error) {
        res.status(500).json({ error: 'Error al dar de baja el comercio', detalle: error.message });
    }
};

// PUT /api/comercios/:id/activar (Reactivación)
const reactivarComercio = async (req, res) => {
    try {
        const { id } = req.params;
        const comercioReactivado = await Comercio.findByIdAndUpdate(
            id,
            { estado: 'Activo' },
            { new: true }
        );

        if (!comercioReactivado) {
            return res.status(404).json({ error: 'Comercio no encontrado.' });
        }

        res.status(200).json({ mensaje: 'Comercio reactivado', data: comercioReactivado });

    } catch (error) {
        res.status(500).json({ error: 'Error al reactivar el comercio', detalle: error.message });
    }
};
module.exports = { crearComercio, obtenerComercios, actualizarComercio, eliminarComercio, reactivarComercio };