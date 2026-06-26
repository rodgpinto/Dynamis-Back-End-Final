const express = require('express');
const router = express.Router();
const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');
const { obtenerVentas, registrarVenta } = require('../controllers/ventaController'); 

router.get('/', protegerRuta, autorizarRoles('Admin', 'Dueño', 'Empleado'), obtenerVentas);

router.post('/', protegerRuta, autorizarRoles('Admin', 'Dueño', 'Empleado'), registrarVenta);

module.exports = router;