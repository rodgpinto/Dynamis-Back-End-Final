const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const Producto = require('../src/models/Producto'); 

describe('Flujo de Ventas (Dynamis API)', () => {
    let tokenValido = '';
    let productoIdDePrueba = '';

    beforeAll(async () => {
        // 1. Nos logueamos para obtener el token
        const resLogin = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@dynamis.com', password: '123' });
        tokenValido = resLogin.body.token;

        // 2. Buscamos un producto directo en la BD 
        const producto = await Producto.findOne();
        if (producto) {
            productoIdDePrueba = producto._id; 
        }
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('Debería rechazar una venta si falta el ID del producto (400)', async () => {
        const res = await request(app)
            .post('/api/ventas')
            .set('Authorization', `Bearer ${tokenValido}`)
            .send({
                cantidad: 2
                // Falta el productoId a propósito
            });
            
        expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });

    it('Debería registrar una venta exitosamente (200 o 201)', async () => {
        const res = await request(app)
            .post('/api/ventas')
            .set('Authorization', `Bearer ${tokenValido}`)
            .send({
                productoId: productoIdDePrueba,
                cantidad: 1
            });
            
        expect(res.statusCode).toBeLessThan(300);
        expect(res.body).toBeDefined(); 
    });
});