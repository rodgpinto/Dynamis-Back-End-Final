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

const obtenerComercios = async (req, res) => {
    try {
        const comercios = await Comercio.find();
        res.status(200).json(comercios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los comercios', detalle: error.message });
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

const eliminarComercio = async (req, res) => {
    try {
        const { id } = req.params;

        const tiendasDelComercio = await Tienda.find({ comercioId: id, estado: 'Activa' });
        
        if (tiendasDelComercio.length > 0) {
            return res.status(400).json({ 
                error: `No se puede eliminar. El comercio tiene ${tiendasDelComercio.length} tienda(s) activa(s).` 
            });
        }

        const comercioDadoDeBaja = await Comercio.findByIdAndUpdate(id, { estado: 'Inactivo' }, { new: true });
        
        if (!comercioDadoDeBaja) {
            return res.status(404).json({ error: 'Comercio no encontrado.' });
        }

        res.status(200).json({ mensaje: 'Comercio dado de baja (Inactivo) correctamente.' });
    } catch (error) {
        res.status(500).json({ error: 'Error al intentar dar de baja', detalle: error.message });
    }
};


module.exports = { crearComercio, obtenerComercios, actualizarComercio, eliminarComercio };