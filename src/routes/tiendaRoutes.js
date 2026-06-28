const express = require('express');
const router = express.Router();
const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');
const { obtenerTiendas, crearTienda, actualizarTienda, eliminarTienda, reactivarTienda } = require('../controllers/tiendaController');

/**
 * @swagger
 * tags:
 *   - name: Tiendas
 *     description: Gestión de las sucursales
 */

/**
 * @swagger
 * /api/tiendas:
 *   get:
 *     summary: Obtiene la lista de todas las tiendas
 *     tags: [Tiendas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tiendas obtenida
 *   post:
 *     summary: Crea una nueva tienda (Solo Admin y Dueño)
 *     tags: [Tiendas]
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
 *                 example: "Sucursal Centro"
 *               direccion:
 *                 type: string
 *                 example: "Av. San Martín 123"
 *               comercioId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tienda creada exitosamente
 */
router.get('/', protegerRuta, obtenerTiendas);
router.post('/', protegerRuta, autorizarRoles('Admin', 'Dueño'), crearTienda);

/**
 * @swagger
 * /api/tiendas/{id}:
 *   put:
 *     summary: Actualiza los datos de una tienda
 *     tags: [Tiendas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tienda actualizada
 *   delete:
 *     summary: Da de baja una tienda lógicamente
 *     tags: [Tiendas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tienda eliminada
 */
router.put('/:id', protegerRuta, autorizarRoles('Admin', 'Dueño'), actualizarTienda);
router.delete('/:id', protegerRuta, autorizarRoles('Admin', 'Dueño'), eliminarTienda);

/**
 * @swagger
 * /api/tiendas/{id}/activar:
 *   put:
 *     summary: Reactiva una tienda dada de baja
 *     tags: [Tiendas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tienda reactivada exitosamente
 */
router.put('/:id/activar', protegerRuta, autorizarRoles('Admin', 'Dueño'), reactivarTienda);

module.exports = router;