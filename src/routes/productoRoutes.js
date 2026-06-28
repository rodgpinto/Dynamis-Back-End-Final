const express = require('express');
const router = express.Router();

const { 
    crearProducto, 
    obtenerProductosPorTienda, 
    actualizarProducto, 
    eliminarProducto 
} = require('../controllers/productoController'); 

const { protegerRuta, autorizarRoles } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   - name: Productos
 *     description: Catálogo de artículos e inventario
 */

/**
 * @swagger
 * /api/productos/tienda/{tiendaId}:
 *   get:
 *     summary: Obtiene todos los productos de una tienda
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tiendaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la tienda
 *     responses:
 *       200:
 *         description: Listado de productos
 */
router.get('/tienda/:tiendaId', protegerRuta, obtenerProductosPorTienda);

/**
 * @swagger
 * /api/productos:
 *   post:
 *     summary: Agrega un nuevo producto
 *     tags: [Productos]
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
 *               - precio
 *               - stock
 *               - tiendaId
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Aceite 1.5L"
 *               precio:
 *                 type: number
 *                 example: 1500
 *               stock:
 *                 type: number
 *                 example: 50
 *               tiendaId:
 *                 type: string
 *                 example: "654c1234"
 *     responses:
 *       201:
 *         description: Producto creado
 */
router.post('/', protegerRuta, autorizarRoles('Admin', 'Dueño', 'Empleado'), crearProducto);

/**
 * @swagger
 * /api/productos/{id}:
 *   put:
 *     summary: Actualiza un producto
 *     tags: [Productos]
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
 *               precio:
 *                 type: number
 *               stock:
 *                 type: number
 *     responses:
 *       200:
 *         description: Producto actualizado
 *   delete:
 *     summary: Elimina un producto
 *     tags: [Productos]
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
 *         description: Producto removido
 */
router.put('/:id', protegerRuta, autorizarRoles('Admin', 'Dueño', 'Empleado'), actualizarProducto);
router.delete('/:id', protegerRuta, autorizarRoles('Admin', 'Dueño', 'Empleado'), eliminarProducto);

module.exports = router;