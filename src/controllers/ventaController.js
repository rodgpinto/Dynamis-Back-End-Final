const Venta = require('../models/Venta');
const Producto = require('../models/Producto');
const Tienda = require('../models/Tienda'); 

// POST /api/ventas
const registrarVenta = async (req, res) => {
    try {
        const { productoId, cantidad } = req.body;

        const producto = await Producto.findById(productoId);

        if (!producto || producto.estado === 'Inactivo') {
            return res.status(404).json({ error: 'Producto no encontrado o inactivo.' });
        }

        if (req.usuario.rol === 'Empleado' || req.usuario.rol === 'Dueño') {
            const tiendaDelProducto = await Tienda.findById(producto.tiendaId);
            
            if (!tiendaDelProducto || tiendaDelProducto.comercioId.toString() !== req.usuario.comercioId.toString()) {
                return res.status(403).json({ 
                    error: 'Operación rechazada: Intento de manipular el inventario de una sucursal externa.' 
                });
            }
        }

        if (producto.stock < cantidad) {
            return res.status(400).json({ 
                error: 'Stock insuficiente para realizar la venta.',
                stockDisponible: producto.stock
            });
        }

        const totalVenta = producto.precio * cantidad;

        producto.stock -= cantidad;
        await producto.save(); 

        const nuevaVenta = new Venta({
            productoId: producto._id,
            cantidad: cantidad,
            precioUnitario: producto.precio,
            total: totalVenta
        });

        await nuevaVenta.save();

        res.status(201).json({
            mensaje: 'Venta registrada exitosamente',
            data: nuevaVenta,
            stockRestante: producto.stock
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Error interno al procesar la venta', 
            detalle: error.message 
        });
    }
};

// GET /api/ventas
const obtenerVentas = async (req, res) => {
    try {
        let filtroDeBusqueda = {}; 

        if (req.usuario.rol === 'Dueño' || req.usuario.rol === 'Empleado') {
            const tiendasDelComercio = await Tienda.find({ comercioId: req.usuario.comercioId });
            const idsDeTiendas = tiendasDelComercio.map(tienda => tienda._id);

            const productosDelComercio = await Producto.find({ tiendaId: { $in: idsDeTiendas } });
            const idsDeProductos = productosDelComercio.map(prod => prod._id);

            filtroDeBusqueda = { productoId: { $in: idsDeProductos } };
        }

        const ventas = await Venta.find(filtroDeBusqueda)
            .populate({
                path: 'productoId',
                select: 'nombre tiendaId' 
            })
            .sort({ createdAt: -1 }); 
            
        res.status(200).json({
            mensaje: 'Historial de ventas recuperado exitosamente',
            cantidad: ventas.length,
            data: ventas
        });

    } catch (error) {
        res.status(500).json({ 
            error: 'Error al consultar el historial de ventas',
            detalle: error.message 
        });
    }
};

module.exports = { 
    registrarVenta,
    obtenerVentas 
};