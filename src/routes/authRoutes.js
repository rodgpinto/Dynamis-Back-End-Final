const express = require('express');
const router = express.Router();
const { registrarUsuario, loginUsuario } = require('../controllers/authController');
const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Autenticación
 *     description: Gestión de acceso y registro
 */

/**
 * @swagger
 * /api/auth/registro:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Autenticación]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               rol:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Error en los datos
 */
router.post('/registro', protegerRuta, autorizarRoles('Admin', 'Dueño'), registrarUsuario);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión y devuelve un Token
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales incorrectas
 */
router.post('/login', loginUsuario);

module.exports = router;