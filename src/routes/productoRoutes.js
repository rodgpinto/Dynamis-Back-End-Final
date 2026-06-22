const express = require('express');
const router = express.Router();
const { 
    crearProducto, 
    obtenerProductosPorTienda,
    actualizarProducto,
    eliminarProducto
} = require('../controllers/productoController');

// POST /api/productos -> Crea un producto o suma stock si ya existe
router.post('/', crearProducto);

// GET /api/productos/tienda/:tiendaId -> Obtiene el catálogo activo
router.get('/tienda/:tiendaId', obtenerProductosPorTienda);

// PUT /api/productos/:id -> Modifica datos del producto
router.put('/:id', actualizarProducto);

// DELETE /api/productos/:id -> Aplica baja lógica (Inactivo)
router.delete('/:id', eliminarProducto);

module.exports = router;