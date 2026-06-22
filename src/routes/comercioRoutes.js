const express = require('express');
const router = express.Router();
const comercioController = require('../controllers/comercioController');
const { validarDatosComercio } = require('../middlewares/validator');

router.post('/', validarDatosComercio, comercioController.crearComercio);
router.get('/', comercioController.obtenerComercios);
router.put('/:id', validarDatosComercio, comercioController.actualizarComercio);
router.delete('/:id', comercioController.eliminarComercio);

module.exports = router;