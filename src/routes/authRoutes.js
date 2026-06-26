const express = require('express');
const router = express.Router();

const { registrarUsuario, loginUsuario } = require('../controllers/authController'); 
const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');

router.post('/registro', protegerRuta, autorizarRoles('Admin', 'Dueño'), registrarUsuario);

router.post('/login', loginUsuario);

module.exports = router;