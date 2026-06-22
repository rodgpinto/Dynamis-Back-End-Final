const express = require('express');
const router = express.Router();
const { registrarVenta, obtenerVentas } = require('../controllers/ventaController');

// POST /api/ventas  Registra una nueva venta y descuenta stock
router.post('/', registrarVenta);

// GET /api/ventas  Obtiene el historial completo de ventas
router.get('/', obtenerVentas);

module.exports = router;