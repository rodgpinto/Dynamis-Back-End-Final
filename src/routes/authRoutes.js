const express = require('express');
const router = express.Router();

// 🟢 Importamos loginUsuario
const { registrarUsuario, loginUsuario } = require('../controllers/authController'); 
const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');

router.post('/registro', protegerRuta, autorizarRoles('Admin', 'Dueño'), registrarUsuario);

// 🟢 Usamos loginUsuario
router.post('/login', loginUsuario);

module.exports = router;