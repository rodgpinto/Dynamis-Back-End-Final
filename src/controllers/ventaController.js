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

        // Validación de permisos: Empleados y Dueños solo operan en sus tiendas
        if (req.usuario.rol === 'Empleado' || req.usuario.rol === 'Dueño') {
            const tiendaDelProducto = await Tienda.findById(producto.tiendaId);
            if (!tiendaDelProducto || tiendaDelProducto.comercioId.toString() !== req.usuario.comercioId.toString()) {
                return res.status(403).json({ error: 'Operación rechazada: No tienes acceso a este inventario.' });
            }
        }

        if (producto.stock < cantidad) {
            return res.status(400).json({ error: 'Stock insuficiente.', stockDisponible: producto.stock });
        }

        const totalVenta = producto.precio * cantidad;
        producto.stock -= cantidad;
        await producto.save(); 

        const nuevaVenta = new Venta({
            productoId: producto._id,
            usuarioId: req.usuario.id, 
            cantidad: cantidad,
            precioUnitario: producto.precio,
            total: totalVenta
        });

        await nuevaVenta.save();

        res.status(201).json({ mensaje: 'Venta registrada exitosamente', data: nuevaVenta });
    } catch (error) {
        res.status(500).json({ error: 'Error interno al procesar la venta', detalle: error.message });
    }
};

// GET /api/ventas
const obtenerVentas = async (req, res) => {
    try {
        let filtro = {};

        if (req.usuario.rol === 'Empleado') {
            filtro.usuarioId = req.usuario.id;
        }

        const ventas = await Venta.find(filtro)
            .populate('usuarioId', 'email nombre') 
            .populate('productoId', 'nombre')
            .sort({ createdAt: -1 });

        res.status(200).json(ventas);
        
    } catch (error) {
        console.error("ERROR EN OBTENER VENTAS:", error);
        res.status(500).json({ error: 'Error al obtener el historial de ventas', detalle: error.message });
    }
};

module.exports = { registrarVenta, obtenerVentas };