const express = require('express');
const router = express.Router();
const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');
const { obtenerTiendas, crearTienda, actualizarTienda, eliminarTienda, reactivarTienda } = require('../controllers/tiendaController');

// GET: Lectura pública o para cualquier logueado
router.get('/', protegerRuta, obtenerTiendas);

// POST, PUT, DELETE: Solo Administradores y Dueños
router.post('/', protegerRuta, autorizarRoles('Admin', 'Dueño'), crearTienda);
router.put('/:id', protegerRuta, autorizarRoles('Admin', 'Dueño'), actualizarTienda);
router.delete('/:id', protegerRuta, autorizarRoles('Admin', 'Dueño'), eliminarTienda);
router.put('/:id/activar', protegerRuta, autorizarRoles('Admin', 'Dueño'), reactivarTienda);
module.exports = router;