const express = require('express');
const router = express.Router();
const tiendaController = require('../controllers/tiendaController');

router.post('/', tiendaController.crearTienda);
router.get('/', tiendaController.obtenerTiendas);

router.put('/:id', tiendaController.actualizarTienda);
router.delete('/:id', tiendaController.eliminarTienda);

module.exports = router;