const express = require('express');
const router = express.Router();
const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');
const { crearProducto, obtenerProductosPorTienda, actualizarProducto, eliminarProducto } = require('../controllers/productoController');

// GET: Lectura del catálogo (Suele ser pública o solo requerir estar logueado)
router.get('/tienda/:tiendaId', obtenerProductosPorTienda);

// POST, PUT, DELETE: Protegidos
router.post('/', protegerRuta, autorizarRoles('Admin', 'Dueño'), crearProducto);
router.put('/:id', protegerRuta, autorizarRoles('Admin', 'Dueño'), actualizarProducto);
router.delete('/:id', protegerRuta, autorizarRoles('Admin', 'Dueño'), eliminarProducto);

module.exports = router;