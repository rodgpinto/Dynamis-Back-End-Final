const express = require('express');
const router = express.Router();

const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');
const { obtenerComercios, crearComercio, actualizarComercio, eliminarComercio, reactivarComercio } = require('../controllers/comercioController');

/**
 * @swagger
 * tags:
 *   - name: Comercios
 *     description: Gestión de las empresas clientes
 */

/**
 * @swagger
 * /api/comercios:
 *   get:
 *     summary: Obtiene la lista de todos los comercios activos
 *     tags: [Comercios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de comercios obtenida
 *       401:
 *         description: No autorizado
 *   post:
 *     summary: Crea un nuevo comercio (Solo Admin)
 *     tags: [Comercios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - cuit
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Distribuidora Norte"
 *               cuit:
 *                 type: string
 *                 example: "30-12345678-9"
 *     responses:
 *       201:
 *         description: Comercio registrado con éxito
 *       403:
 *         description: Permisos insuficientes
 */
router.get('/', protegerRuta, obtenerComercios);
router.post('/', protegerRuta, autorizarRoles('Admin'), crearComercio);

/**
 * @swagger
 * /api/comercios/{id}:
 *   put:
 *     summary: Actualiza los datos de un comercio (Solo Admin)
 *     tags: [Comercios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID único del comercio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               cuit:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comercio actualizado
 *   delete:
 *     summary: Baja lógica de un comercio (Solo Admin)
 *     tags: [Comercios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del comercio
 *     responses:
 *       200:
 *         description: Comercio desactivado
 */
router.put('/:id', protegerRuta, autorizarRoles('Admin'), actualizarComercio);
router.delete('/:id', protegerRuta, autorizarRoles('Admin'), eliminarComercio);

/**
 * @swagger
 * /api/comercios/{id}/activar:
 *   put:
 *     summary: Reactiva un comercio dado de baja (Solo Admin)
 *     tags: [Comercios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del comercio a reactivar
 *     responses:
 *       200:
 *         description: Comercio reactivado
 */
router.put('/:id/activar', protegerRuta, autorizarRoles('Admin'), reactivarComercio);

module.exports = router;