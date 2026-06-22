const Producto = require('../models/Producto');
const Tienda = require('../models/Tienda');

// POST /api/productos
const crearProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, tiendaId } = req.body;

        // 1. Validamos que la tienda exista y esté activa
        const tienda = await Tienda.findById(tiendaId);
        if (!tienda || tienda.estado === 'Inactiva') {
            return res.status(400).json({ 
                error: 'Operación rechazada. La tienda especificada no existe o se encuentra inactiva.' 
            });
        }

        // 2. Buscamos si el producto ya existe en ESTA tienda en particular
        
        const productoExistente = await Producto.findOne({ 
            nombre: { $regex: new RegExp(`^${nombre}$`, 'i') }, 
            tiendaId: tiendaId 
        });

        // 3. Lógica de "Upsert" (Si existe, sumamos stock. Si no, lo creamos)
        if (productoExistente) {
            productoExistente.stock += stock;
            productoExistente.precio = precio; // Actualizamos al precio de la última tanda
            if (descripcion) productoExistente.descripcion = descripcion;
            
            await productoExistente.save();
            
            return res.status(200).json({ 
                mensaje: 'El producto ya existía en el catálogo. Stock incrementado con éxito.', 
                data: productoExistente 
            });
        }

        // Si no existía, lo creamos de cero
        const nuevoProducto = new Producto({
            nombre,
            descripcion,
            precio,
            stock,
            tiendaId
        });

        await nuevoProducto.save();
        res.status(201).json({ 
            mensaje: 'Producto nuevo incorporado al catálogo con éxito', 
            data: nuevoProducto 
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Error interno al procesar el producto', 
            detalle: error.message 
        });
    }
};

// GET /api/productos/tienda/:tiendaId
const obtenerProductosPorTienda = async (req, res) => {
    try {
        const { tiendaId } = req.params;
        const productos = await Producto.find({ tiendaId, estado: 'Activo' });
        
        res.status(200).json({
            mensaje: `Catálogo recuperado exitosamente`,
            cantidad: productos.length,
            data: productos
        });

    } catch (error) {
        res.status(500).json({ error: 'Error al consultar el catálogo' });
    }
};

// PUT /api/productos/:id
const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, precio, stock } = req.body;

        const productoActualizado = await Producto.findByIdAndUpdate(
            id,
            { nombre, descripcion, precio, stock },
            { new: true, runValidators: true }
        );

        if (!productoActualizado) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        res.status(200).json({
            mensaje: 'Producto actualizado con éxito.',
            data: productoActualizado
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Error al actualizar el producto', 
            detalle: error.message 
        });
    }
};

// DELETE /api/productos/:id (Baja Lógica)
const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const productoEliminado = await Producto.findByIdAndUpdate(
            id,
            { estado: 'Inactivo' },
            { new: true }
        );

        if (!productoEliminado) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        res.status(200).json({
            mensaje: 'Producto dado de baja (Inactivo) correctamente.',
            data: productoEliminado
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Error al dar de baja el producto', 
            detalle: error.message 
        });
    }
};

module.exports = { 
    crearProducto, 
    obtenerProductosPorTienda,
    actualizarProducto,
    eliminarProducto
};