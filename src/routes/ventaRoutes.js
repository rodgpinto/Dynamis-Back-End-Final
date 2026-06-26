const express = require('express');
const router = express.Router();
const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');
const { obtenerVentas, registrarVenta } = require('../controllers/ventaController'); 

// 🟢 1. ACÁ ESTABA EL BLOQUEO: Le sumamos 'Empleado' a la ruta GET
router.get('/', protegerRuta, autorizarRoles('Admin', 'Dueño', 'Empleado'), obtenerVentas);

// (El POST seguro ya lo tenías bien)
router.post('/', protegerRuta, autorizarRoles('Admin', 'Dueño', 'Empleado'), registrarVenta);

module.exports = router;