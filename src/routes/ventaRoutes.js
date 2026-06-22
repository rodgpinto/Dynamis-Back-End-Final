const express = require('express');
const router = express.Router();
const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');
const { registrarVenta, obtenerVentas } = require('../controllers/ventaController');

// GET: Ver historial de ventas (Solo Admin y Dueño)
router.get('/', protegerRuta, autorizarRoles('Admin', 'Dueño'), obtenerVentas);

// POST: Registrar una nueva venta (Admin, Dueño y Empleado)
router.post('/', protegerRuta, autorizarRoles('Admin', 'Dueño', 'Empleado'), registrarVenta);

module.exports = router;