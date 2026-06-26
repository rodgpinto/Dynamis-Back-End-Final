const express = require('express');
const router = express.Router();

// 🟢 1. Importamos la función EXACTAMENTE con el mismo nombre que en el controlador
const { 
    crearProducto, 
    obtenerProductosPorTienda, 
    actualizarProducto, 
    eliminarProducto 
} = require('../controllers/productoController'); 

const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');

// 🟢 2. Modificamos la ruta GET para que encaje con la URL que armaste en el controlador
router.get('/tienda/:tiendaId', protegerRuta, obtenerProductosPorTienda);

router.post('/', protegerRuta, autorizarRoles('Admin', 'Dueño', 'Empleado'), crearProducto);
router.put('/:id', protegerRuta, autorizarRoles('Admin', 'Dueño', 'Empleado'), actualizarProducto);
router.delete('/:id', protegerRuta, autorizarRoles('Admin', 'Dueño', 'Empleado'), eliminarProducto);

module.exports = router;