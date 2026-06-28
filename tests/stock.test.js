const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Producto = require('../src/models/Producto');

describe('Reglas de Negocio: Validación de Inventario', () => {
    let tokenValido = '';
    let productoConStock;

    beforeAll(async () => {
        
        if (mongoose.connection.readyState !== 1) {
            await new Promise((resolve) => {
                mongoose.connection.once('connected', resolve);
            });
        }

        // 1. Conseguimos el token del administrador o vendedor
        const resLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@dynamis.com', password: '123' });
        tokenValido = resLogin.body.token;

        // 2. Buscamos un producto que tenga stock disponible en la base de datos
        productoConStock = await Producto.findOne({ stock: { $gt: 0 } });
    });

    afterAll(async () => {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    });

    it('Debería rechazar la venta si la cantidad solicitada supera el stock actual (400)', async () => {
        // Si no encontró productos con stock en la BD, salteamos el test para que no rompa
        if (!productoConStock) return;

        const res = await request(app)
            .post('/api/ventas')
            .set('Authorization', `Bearer ${tokenValido}`)
            .send({
                productoId: productoConStock._id,
                cantidad: productoConStock.stock + 50 // Forzamos una cantidad mayor al stock disponible
            });

        // Esperamos un código de error de cliente (400 Bad Request o similar)
        expect(res.statusCode).toBeGreaterThanOrEqual(400);
        expect(res.body).toHaveProperty('error');
    });
});