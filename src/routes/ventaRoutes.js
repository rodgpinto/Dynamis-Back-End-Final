const express = require('express');
const router = express.Router();
const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');
const { obtenerVentas, registrarVenta } = require('../controllers/ventaController'); 

/**
 * @swagger
 * tags:
 *   - name: Ventas
 *     description: Procesamiento en el Punto de Venta (POS)
 */

/**
 * @swagger
 * /api/ventas:
 *   get:
 *     summary: Obtiene el registro histórico de ventas
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Listado transaccional devuelto
 *       401:
 *         description: Token inválido
 *   post:
 *     summary: Registra una nueva venta
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productoId
 *               - cantidad
 *               - tiendaId
 *             properties:
 *               productoId:
 *                 type: string
 *                 example: "654c5555"
 *               cantidad:
 *                 type: number
 *                 example: 2
 *               tiendaId:
 *                 type: string
 *                 example: "654c1234"
 *     responses:
 *       201:
 *         description: Transacción completada
 *       400:
 *         description: Stock insuficiente
 */
router.get('/', protegerRuta, autorizarRoles('Admin', 'Dueño', 'Empleado'), obtenerVentas);
router.post('/', protegerRuta, autorizarRoles('Admin', 'Dueño', 'Empleado'), registrarVenta);

module.exports = router;