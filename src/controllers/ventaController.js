const Venta = require('../models/Venta');
const Producto = require('../models/Producto');

// POST /api/ventas
const registrarVenta = async (req, res) => {
    try {
        const { productoId, cantidad } = req.body;

        // 1. Buscamos el producto en la base de datos
        const producto = await Producto.findById(productoId);

        if (!producto || producto.estado === 'Inactivo') {
            return res.status(404).json({ error: 'Producto no encontrado o inactivo.' });
        }

        // 2. Control de Stock Lógico
        if (producto.stock < cantidad) {
            return res.status(400).json({ 
                error: 'Stock insuficiente para realizar la venta.',
                stockDisponible: producto.stock
            });
        }

        // 3. Calculamos los totales
        const totalVenta = producto.precio * cantidad;

        // 4. Descontamos el stock del producto
        producto.stock -= cantidad;
        await producto.save(); // valida que no quede en negativo

        // 5. Generamos el registro de la venta
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
        const ventas = await Venta.find()
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