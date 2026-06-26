const express = require('express');
const router = express.Router();

const { 
    crearProducto, 
    obtenerProductosPorTienda, 
    actualizarProducto, 
    eliminarProducto 
} = require('../controllers/productoController'); 

const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');

router.get('/tienda/:tiendaId', protegerRuta, obtenerProductosPorTienda);

router.post('/', protegerRuta, autorizarRoles('Admin', 'Dueño', 'Empleado'), crearProducto);
router.put('/:id', protegerRuta, autorizarRoles('Admin', 'Dueño', 'Empleado'), actualizarProducto);
router.delete('/:id', protegerRuta, autorizarRoles('Admin', 'Dueño', 'Empleado'), eliminarProducto);

module.exports = router;