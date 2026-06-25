const express = require('express');
const router = express.Router();

const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');
const { obtenerComercios, crearComercio, actualizarComercio, eliminarComercio, reactivarComercio } = require('../controllers/comercioController');
// GET: Sigue siendo público 
router.get('/', protegerRuta, obtenerComercios);

// POST, PUT y DELETE blindados
router.post('/', protegerRuta, autorizarRoles('Admin'), crearComercio);
router.put('/:id', protegerRuta, autorizarRoles('Admin'), actualizarComercio);
router.delete('/:id', protegerRuta, autorizarRoles('Admin'), eliminarComercio);
router.put('/:id/activar', protegerRuta, autorizarRoles('Admin'), reactivarComercio);
module.exports = router;