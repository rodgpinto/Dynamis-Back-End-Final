const Producto = require('../models/Producto');
const Tienda = require('../models/Tienda');

// POST /api/productos
const crearProducto = async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, tiendaId } = req.body;

        const tienda = await Tienda.findById(tiendaId);
        if (!tienda || tienda.estado === 'Inactiva') {
            return res.status(400).json({ 
                error: 'Operación rechazada. La tienda especificada no existe o se encuentra inactiva.' 
            });
        }

        if (req.usuario.rol === 'Dueño' && tienda.comercioId.toString() !== req.usuario.comercioId.toString()) {
            return res.status(403).json({ 
                error: 'Acceso denegado. No podés agregar productos al catálogo de otra empresa.' 
            });
        }

        const productoExistente = await Producto.findOne({ 
            nombre: { $regex: new RegExp(`^${nombre}$`, 'i') }, 
            tiendaId: tiendaId 
        });

        if (productoExistente) {
            productoExistente.stock += stock;
            productoExistente.precio = precio;
            if (descripcion) productoExistente.descripcion = descripcion;
            
            await productoExistente.save();
            return res.status(200).json({ 
                mensaje: 'El producto ya existía en el catálogo. Stock incrementado con éxito.', 
                data: productoExistente 
            });
        }

        const nuevoProducto = new Producto({ nombre, descripcion, precio, stock, tiendaId });
        await nuevoProducto.save();
        
        res.status(201).json({ 
            mensaje: 'Producto nuevo incorporado al catálogo con éxito', 
            data: nuevoProducto 
        });

    } catch (error) {
        res.status(500).json({ error: 'Error interno al procesar el producto', detalle: error.message });
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

        const producto = await Producto.findById(id);
        if (!producto || producto.estado === 'Inactivo') {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        if (req.usuario.rol === 'Dueño') {
            const tiendaDelProducto = await Tienda.findById(producto.tiendaId);
            if (!tiendaDelProducto || tiendaDelProducto.comercioId.toString() !== req.usuario.comercioId.toString()) {
                return res.status(403).json({ 
                    error: 'Acceso denegado. Este producto pertenece al catálogo de otra empresa.' 
                });
            }
        }

        const productoActualizado = await Producto.findByIdAndUpdate(
            id,
            { nombre, descripcion, precio, stock },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            mensaje: 'Producto actualizado con éxito.',
            data: productoActualizado
        });

    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto', detalle: error.message });
    }
};

// DELETE /api/productos/:id (Baja Lógica)
const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        const producto = await Producto.findById(id);
        if (!producto) {
            return res.status(404).json({ error: 'Producto no encontrado.' });
        }

        if (req.usuario.rol === 'Dueño') {
            const tiendaDelProducto = await Tienda.findById(producto.tiendaId);
            if (!tiendaDelProducto || tiendaDelProducto.comercioId.toString() !== req.usuario.comercioId.toString()) {
                return res.status(403).json({ 
                    error: 'Acceso denegado. Este producto pertenece al catálogo de otra empresa.' 
                });
            }
        }

        producto.estado = 'Inactivo';
        await producto.save();

        res.status(200).json({
            mensaje: 'Producto dado de baja (Inactivo) correctamente.',
            data: producto
        });

    } catch (error) {
        res.status(500).json({ error: 'Error al dar de baja el producto', detalle: error.message });
    }
};

module.exports = { 
    crearProducto, 
    obtenerProductosPorTienda,
    actualizarProducto,
    eliminarProducto
};