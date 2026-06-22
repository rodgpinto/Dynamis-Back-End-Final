const express = require('express');
const router = express.Router();

const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');
const { obtenerComercios, crearComercio, actualizarComercio, eliminarComercio } = require('../controllers/comercioController');

// GET: Sigue siendo público 
router.get('/', obtenerComercios);

// POST, PUT y DELETE blindados
router.post('/', protegerRuta, autorizarRoles('Admin'), crearComercio);
router.put('/:id', protegerRuta, autorizarRoles('Admin'), actualizarComercio);
router.delete('/:id', protegerRuta, autorizarRoles('Admin'), eliminarComercio);

module.exports = router;